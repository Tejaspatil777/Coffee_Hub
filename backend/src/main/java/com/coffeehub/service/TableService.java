package com.coffeehub.service;

import com.coffeehub.dto.response.TableQRResponse;
import com.coffeehub.dto.response.TableResponse;
import com.coffeehub.entity.RestaurantTable;
import com.coffeehub.exception.ResourceNotFoundException;
import com.coffeehub.exception.ValidationException;
import com.coffeehub.repository.RestaurantTableRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TableService {

    private static final Logger logger = LoggerFactory.getLogger(TableService.class);

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public List<TableResponse> getAllTables() {
        logger.info("Fetching all tables");
        return tableRepository.findAll().stream()
                .map(this::convertToTableResponse)
                .collect(Collectors.toList());
    }

    public List<TableResponse> getAvailableTables() {
        logger.info("Fetching available tables");
        return tableRepository.findByStatus(RestaurantTable.TableStatus.AVAILABLE).stream()
                .map(this::convertToTableResponse)
                .collect(Collectors.toList());
    }

    public List<TableResponse> getAvailableTablesWithCapacity(Integer minCapacity) {
        logger.info("Fetching available tables with minimum capacity: {}", minCapacity);
        return tableRepository.findAvailableTablesWithCapacity(minCapacity).stream()
                .map(this::convertToTableResponse)
                .collect(Collectors.toList());
    }

    public TableResponse getTableById(Long id) {
        logger.info("Fetching table by id: {}", id);
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));
        return convertToTableResponse(table);
    }

    public RestaurantTable getTableByIdEntity(Long id) {
        logger.info("Fetching table entity by id: {}", id);
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));
    }

    public TableResponse getTableByToken(String tableToken) {
        logger.info("Fetching table by token: {}", tableToken);
        RestaurantTable table = tableRepository.findByTableToken(tableToken)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with token: " + tableToken));
        return convertToTableResponse(table);
    }

    public TableResponse createTable(RestaurantTable table) {
        logger.info("Creating new table: {}", table.getTableNumber());

        // Validate unique table number and token
        if (tableRepository.existsByTableNumberAndIdNot(table.getTableNumber(), 0L)) {
            throw new ValidationException("Table with number '" + table.getTableNumber() + "' already exists");
        }

        if (table.getTableToken() == null || table.getTableToken().trim().isEmpty()) {
            table.setTableToken(generateTableToken());
        } else if (tableRepository.existsByTableTokenAndIdNot(table.getTableToken(), 0L)) {
            throw new ValidationException("Table with token '" + table.getTableToken() + "' already exists");
        }

        RestaurantTable savedTable = tableRepository.save(table);
        logger.info("Table created successfully with id: {}", savedTable.getId());

        return convertToTableResponse(savedTable);
    }

    public TableResponse updateTable(Long id, RestaurantTable tableDetails) {
        logger.info("Updating table with id: {}", id);

        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));

        if (!table.getTableNumber().equals(tableDetails.getTableNumber()) &&
                tableRepository.existsByTableNumberAndIdNot(tableDetails.getTableNumber(), id)) {
            throw new ValidationException("Table with number '" + tableDetails.getTableNumber() + "' already exists");
        }

        if (!table.getTableToken().equals(tableDetails.getTableToken()) &&
                tableRepository.existsByTableTokenAndIdNot(tableDetails.getTableToken(), id)) {
            throw new ValidationException("Table with token '" + tableDetails.getTableToken() + "' already exists");
        }

        table.setTableNumber(tableDetails.getTableNumber());
        table.setTableToken(tableDetails.getTableToken());
        table.setCapacity(tableDetails.getCapacity());
        table.setStatus(tableDetails.getStatus());

        RestaurantTable updatedTable = tableRepository.save(table);
        logger.info("Table updated successfully with id: {}", id);

        return convertToTableResponse(updatedTable);
    }

    public void deleteTable(Long id) {
        logger.info("Deleting table with id: {}", id);

        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));

        tableRepository.delete(table);
        logger.info("Table deleted successfully with id: {}", id);
    }

    public TableQRResponse generateTableQR(Long tableId) {
        logger.info("Generating QR code for table id: {}", tableId);

        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + tableId));

        String qrCodeUrl = generateQRCodeUrl(table.getTableToken());
        table.setQrCodeUrl(qrCodeUrl);

        RestaurantTable updatedTable = tableRepository.save(table);

        TableQRResponse response = new TableQRResponse();
        response.setTableToken(updatedTable.getTableToken());
        response.setQrCodeUrl(updatedTable.getQrCodeUrl());
        response.setQrCodeDataUrl(generateQRCodeDataUrl(updatedTable.getTableToken()));

        logger.info("QR code generated successfully for table: {}", table.getTableNumber());

        return response;
    }

    public TableResponse updateTableStatus(Long tableId, RestaurantTable.TableStatus status) {
        logger.info("Updating table status - table: {}, status: {}", tableId, status);

        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + tableId));

        table.setStatus(status);
        RestaurantTable updatedTable = tableRepository.save(table);

        logger.info("Table status updated successfully - table: {}, status: {}", tableId, status);

        return convertToTableResponse(updatedTable);
    }

    public List<TableResponse> searchTables(String query) {
        logger.info("Searching tables with query: {}", query);
        return tableRepository.searchTables(query).stream()
                .map(this::convertToTableResponse)
                .collect(Collectors.toList());
    }

    public Long getAvailableTableCount() {
        return tableRepository.countAvailableTables();
    }

    /**
     * Auto-sync table status based on active orders
     * Called periodically or after order status changes
     */
    public void syncTableStatusWithOrders() {
        logger.info("Syncing table statuses with active orders");
        
        List<RestaurantTable> allTables = tableRepository.findAll();
        
        for (RestaurantTable table : allTables) {
            // Skip tables in MAINTENANCE status
            if (table.getStatus() == RestaurantTable.TableStatus.MAINTENANCE) {
                continue;
            }
            
            // Get active orders for this table
            List<com.coffeehub.entity.Order> activeOrders = 
                tableRepository.findActiveOrdersForTable(table.getId());
            
            RestaurantTable.TableStatus newStatus;
            
            if (activeOrders.isEmpty()) {
                // No active orders -> AVAILABLE
                newStatus = RestaurantTable.TableStatus.AVAILABLE;
            } else {
                // Has active orders -> OCCUPIED
                newStatus = RestaurantTable.TableStatus.OCCUPIED;
            }
            
            // Update only if status changed
            if (table.getStatus() != newStatus) {
                table.setStatus(newStatus);
                tableRepository.save(table);
                logger.info("Table {} status synced: {} -> {}", 
                    table.getTableNumber(), table.getStatus(), newStatus);
            }
        }
    }

    /**
     * Free a specific table (mark as AVAILABLE)
     * Only if no active orders
     */
    public TableResponse freeTable(Long tableId) {
        logger.info("Freeing table with id: {}", tableId);
        
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + tableId));
        
        // Check for active orders
        List<com.coffeehub.entity.Order> activeOrders = 
            tableRepository.findActiveOrdersForTable(tableId);
        
        if (!activeOrders.isEmpty()) {
            throw new ValidationException(
                "Cannot free table " + table.getTableNumber() + 
                ". It has " + activeOrders.size() + " active order(s).");
        }
        
        table.setStatus(RestaurantTable.TableStatus.AVAILABLE);
        RestaurantTable updatedTable = tableRepository.save(table);
        
        logger.info("Table {} freed successfully", table.getTableNumber());
        return convertToTableResponse(updatedTable);
    }

    // Private helper methods
    private String generateTableToken() {
        return "TBL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateQRCodeUrl(String tableToken) {
        return frontendUrl + "/menu?table=" + tableToken;
    }

    private String generateQRCodeDataUrl(String tableToken) {
        // In a real implementation, you would generate an actual QR code image
        // For now, return the URL that would contain the QR code
        String qrContent = generateQRCodeUrl(tableToken);
        return "data:image/svg+xml;base64," + java.util.Base64.getEncoder()
                .encodeToString(("<svg>QR Code for: " + qrContent + "</svg>").getBytes());
    }

    private TableResponse convertToTableResponse(RestaurantTable table) {
        TableResponse response = new TableResponse();
        response.setId(table.getId());
        response.setTableNumber(table.getTableNumber());
        response.setTableToken(table.getTableToken());
        response.setCapacity(table.getCapacity());
        response.setStatus(table.getStatus());
        response.setQrCodeUrl(table.getQrCodeUrl());
        response.setCreatedAt(table.getCreatedAt());
        return response;
    }
}