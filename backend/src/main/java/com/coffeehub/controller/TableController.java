package com.coffeehub.controller;

import com.coffeehub.dto.response.ApiResponse;
import com.coffeehub.dto.response.TableQRResponse;
import com.coffeehub.dto.response.TableResponse;
import com.coffeehub.entity.RestaurantTable;
import com.coffeehub.service.TableService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tables")
public class TableController {

    private static final Logger logger = LoggerFactory.getLogger(TableController.class);

    @Autowired
    private TableService tableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables() {
        logger.info("Fetching all tables");

        try {
            List<TableResponse> tables = tableService.getAllTables();
            return ResponseEntity.ok(ApiResponse.success(tables));
        } catch (Exception e) {
            logger.error("Error fetching tables", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching tables"));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAvailableTables() {
        logger.info("Fetching available tables");

        try {
            List<TableResponse> tables = tableService.getAvailableTables();
            return ResponseEntity.ok(ApiResponse.success(tables));
        } catch (Exception e) {
            logger.error("Error fetching available tables", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching available tables"));
        }
    }

    @GetMapping("/available/capacity")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAvailableTablesWithCapacity(
            @RequestParam Integer minCapacity) {

        logger.info("Fetching available tables with minimum capacity: {}", minCapacity);

        try {
            List<TableResponse> tables = tableService.getAvailableTablesWithCapacity(minCapacity);
            return ResponseEntity.ok(ApiResponse.success(tables));
        } catch (Exception e) {
            logger.error("Error fetching available tables with capacity: {}", minCapacity, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching tables: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> getTableById(@PathVariable Long id) {
        logger.info("Fetching table by id: {}", id);

        try {
            TableResponse table = tableService.getTableById(id);
            return ResponseEntity.ok(ApiResponse.success(table));
        } catch (Exception e) {
            logger.error("Error fetching table with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching table: " + e.getMessage()));
        }
    }

    @GetMapping("/token/{tableToken}")
    public ResponseEntity<ApiResponse<TableResponse>> getTableByToken(@PathVariable String tableToken) {
        logger.info("Fetching table by token: {}", tableToken);

        try {
            TableResponse table = tableService.getTableByToken(tableToken);
            return ResponseEntity.ok(ApiResponse.success(table));
        } catch (Exception e) {
            logger.error("Error fetching table with token: {}", tableToken, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching table: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TableResponse>>> searchTables(@RequestParam String query) {
        logger.info("Searching tables with query: {}", query);

        try {
            List<TableResponse> tables = tableService.searchTables(query);
            return ResponseEntity.ok(ApiResponse.success(tables));
        } catch (Exception e) {
            logger.error("Error searching tables with query: {}", query, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error searching tables: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@Valid @RequestBody RestaurantTable table) {
        logger.info("Creating new table: {}", table.getTableNumber());

        try {
            TableResponse createdTable = tableService.createTable(table);
            return ResponseEntity.ok(ApiResponse.success("Table created successfully", createdTable));
        } catch (Exception e) {
            logger.error("Error creating table", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating table: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable Long id, @Valid @RequestBody RestaurantTable table) {

        logger.info("Updating table with id: {}", id);

        try {
            TableResponse updatedTable = tableService.updateTable(id, table);
            return ResponseEntity.ok(ApiResponse.success("Table updated successfully", updatedTable));
        } catch (Exception e) {
            logger.error("Error updating table with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating table: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        logger.info("Deleting table with id: {}", id);

        try {
            tableService.deleteTable(id);
            return ResponseEntity.ok(ApiResponse.success("Table deleted successfully", null));
        } catch (Exception e) {
            logger.error("Error deleting table with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting table: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/qr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TableQRResponse>> generateTableQR(@PathVariable Long id) {
        logger.info("Generating QR code for table id: {}", id);

        try {
            TableQRResponse qrResponse = tableService.generateTableQR(id);
            return ResponseEntity.ok(ApiResponse.success("QR code generated successfully", qrResponse));
        } catch (Exception e) {
            logger.error("Error generating QR code for table: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error generating QR code: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER')")
    public ResponseEntity<ApiResponse<TableResponse>> updateTableStatus(
            @PathVariable Long id, @RequestParam RestaurantTable.TableStatus status) {

        logger.info("Updating table status - table: {}, status: {}", id, status);

        try {
            TableResponse table = tableService.updateTableStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Table status updated successfully", table));
        } catch (Exception e) {
            logger.error("Error updating table status for table: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating table status: " + e.getMessage()));
        }
    }

    @GetMapping("/stats/available-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getAvailableTableCount() {
        logger.info("Fetching available table count");

        try {
            Long count = tableService.getAvailableTableCount();
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            logger.error("Error fetching available table count", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching table count"));
        }
    }

    @PutMapping("/{id}/free")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER')")
    public ResponseEntity<ApiResponse<TableResponse>> freeTable(@PathVariable Long id) {
        logger.info("Freeing table with id: {}", id);

        try {
            TableResponse table = tableService.freeTable(id);
            return ResponseEntity.ok(ApiResponse.success("Table freed successfully", table));
        } catch (Exception e) {
            logger.error("Error freeing table with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error freeing table: " + e.getMessage()));
        }
    }

    @PostMapping("/sync-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> syncTableStatus() {
        logger.info("Syncing table statuses with orders");

        try {
            tableService.syncTableStatusWithOrders();
            return ResponseEntity.ok(ApiResponse.success("Table statuses synced successfully", null));
        } catch (Exception e) {
            logger.error("Error syncing table statuses", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error syncing table statuses"));
        }
    }
}