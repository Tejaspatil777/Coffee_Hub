package com.coffeehub.service;

import com.coffeehub.dto.request.CartItemRequest;
import com.coffeehub.dto.request.OrderRequest;
import com.coffeehub.dto.response.OrderResponse;
import com.coffeehub.dto.response.OrderStatusHistoryResponse;
import com.coffeehub.dto.response.UserResponse;
import com.coffeehub.entity.*;
import com.coffeehub.exception.ResourceNotFoundException;
import com.coffeehub.exception.ValidationException;
import com.coffeehub.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private TableService tableService;

    @Autowired
    private CartService cartService;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ModifierRepository modifierRepository;

    @Autowired
    private WebSocketService webSocketService;

    public OrderResponse createOrder(OrderRequest orderRequest, Long userId) {
        logger.info("Creating new order for user: {}", userId);

        User user = userService.findById(userId);
        RestaurantTable table = null;

        if (orderRequest.getTableId() != null) {
            table = tableService.getTableByIdEntity(orderRequest.getTableId());
            if (table.getStatus() != RestaurantTable.TableStatus.AVAILABLE &&
                    table.getStatus() != RestaurantTable.TableStatus.OCCUPIED) {
                throw new ValidationException("Table is not available for ordering");
            }
        }

        // Generate unique order ID
        String orderId = generateOrderId();

        Order order = new Order();
        order.setUser(user);
        order.setTable(table);
        order.setOrderType(orderRequest.getOrderType());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setTotalAmount(orderRequest.getTotalAmount());
        order.setSpecialInstructions(orderRequest.getSpecialInstructions());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setStripePaymentIntentId(orderRequest.getStripePaymentIntentId());

        // Create order items from request
        if (orderRequest.getItems() != null) {
            for (CartItemRequest itemRequest : orderRequest.getItems()) {
                OrderItem orderItem = createOrderItem(order, itemRequest);
                order.getOrderItems().add(orderItem);
            }
        }

        // Add initial status history
        OrderStatusHistory statusHistory = new OrderStatusHistory();
        statusHistory.setOrder(order);
        statusHistory.setStatus(Order.OrderStatus.PENDING);
        statusHistory.setChangedBy(user);
        statusHistory.setNotes("Order created");
        order.getStatusHistory().add(statusHistory);

        Order savedOrder = orderRepository.save(order);
        logger.info("Order created successfully with id: {}", orderId);

        // Clear user's cart after successful order creation
        clearUserCart(userId, orderRequest.getTableId());

        // Notify via WebSocket
        webSocketService.notifyOrderUpdate(savedOrder, "New order created");

        return convertToOrderResponse(savedOrder);
    }

    public OrderResponse getOrderById(String orderId) {
        logger.info("Fetching order by id: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        return convertToOrderResponse(order);
    }

    public List<OrderResponse> getUserOrders(Long userId) {
        logger.info("Fetching orders for user: {}", userId);

        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getOrdersWithFilters(Order.OrderStatus status, Order.PaymentStatus paymentStatus,
                                                    Order.OrderType orderType, LocalDateTime startDate,
                                                    LocalDateTime endDate, Pageable pageable) {
        logger.info("Fetching orders with filters - status: {}, paymentStatus: {}, orderType: {}, date range: {} to {}",
                status, paymentStatus, orderType, startDate, endDate);

        return orderRepository.findWithFilters(status, paymentStatus, orderType, startDate, endDate, pageable)
                .map(this::convertToOrderResponse);
    }

    public List<OrderResponse> getActiveKitchenOrders() {
        logger.info("Fetching active kitchen orders");

        return orderRepository.findActiveKitchenOrders().stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getActiveDeliveryOrders() {
        logger.info("Fetching active delivery orders");

        return orderRepository.findActiveDeliveryOrders().stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse updateOrderStatus(String orderId, Order.OrderStatus newStatus, Long changedByUserId, String notes) {
        logger.info("Updating order status - order: {}, new status: {}, changed by: {}", orderId, newStatus, changedByUserId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        User changedBy = userService.findById(changedByUserId);

        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus, changedBy.getRole());

        order.setStatus(newStatus);

        // Update assigned staff based on status
        updateAssignedStaff(order, newStatus, changedBy);

        Order updatedOrder = orderRepository.save(order);

        // Add status history
        addStatusHistory(updatedOrder, newStatus, changedBy, notes);

        logger.info("Order status updated successfully - order: {}, new status: {}", orderId, newStatus);

        // Notify via WebSocket
        webSocketService.notifyOrderUpdate(updatedOrder, "Order status updated to: " + newStatus);

        return convertToOrderResponse(updatedOrder);
    }

    public OrderResponse assignOrderToChef(String orderId, Long chefId) {
        logger.info("Assigning order to chef - order: {}, chef: {}", orderId, chefId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        User chef = userService.findById(chefId);
        if (chef.getRole() != User.Role.CHEF) {
            throw new ValidationException("User is not a chef");
        }

        order.setAssignedChef(chef);
        Order updatedOrder = orderRepository.save(order);

        logger.info("Order assigned to chef successfully - order: {}, chef: {}", orderId, chefId);

        // Notify via WebSocket
        webSocketService.notifyOrderUpdate(updatedOrder, "Order assigned to chef: " + chef.getFirstName());

        return convertToOrderResponse(updatedOrder);
    }

    public OrderResponse assignOrderToWaiter(String orderId, Long waiterId) {
        logger.info("Assigning order to waiter - order: {}, waiter: {}", orderId, waiterId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        User waiter = userService.findById(waiterId);
        if (waiter.getRole() != User.Role.WAITER) {
            throw new ValidationException("User is not a waiter");
        }

        order.setAssignedWaiter(waiter);
        Order updatedOrder = orderRepository.save(order);

        logger.info("Order assigned to waiter successfully - order: {}, waiter: {}", orderId, waiterId);

        // Notify via WebSocket
        webSocketService.notifyOrderUpdate(updatedOrder, "Order assigned to waiter: " + waiter.getFirstName());

        return convertToOrderResponse(updatedOrder);
    }

    public OrderResponse updatePaymentStatus(String orderId, Order.PaymentStatus paymentStatus, String stripePaymentIntentId) {
        logger.info("Updating payment status - order: {}, status: {}, stripeIntent: {}",
                orderId, paymentStatus, stripePaymentIntentId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setPaymentStatus(paymentStatus);
        if (stripePaymentIntentId != null) {
            order.setStripePaymentIntentId(stripePaymentIntentId);
        }

        // If payment is successful, confirm the order
        if (paymentStatus == Order.PaymentStatus.PAID && order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            addStatusHistory(order, Order.OrderStatus.CONFIRMED, order.getUser(), "Payment confirmed");
        }

        Order updatedOrder = orderRepository.save(order);

        logger.info("Payment status updated successfully - order: {}, status: {}", orderId, paymentStatus);

        // Notify via WebSocket
        webSocketService.notifyOrderUpdate(updatedOrder, "Payment status updated to: " + paymentStatus);

        return convertToOrderResponse(updatedOrder);
    }

    public void cancelOrder(String orderId, Long userId, String reason) {
        logger.info("Cancelling order - order: {}, user: {}, reason: {}", orderId, userId, reason);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        User user = userService.findById(userId);

        // Only allow cancellation for pending or confirmed orders
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new ValidationException("Cannot cancel order in current status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);

        Order updatedOrder = orderRepository.save(order);

        // Add status history
        addStatusHistory(updatedOrder, Order.OrderStatus.CANCELLED, user, "Order cancelled: " + reason);

        logger.info("Order cancelled successfully - order: {}", orderId);

        // Notify via WebSocket
        webSocketService.notifyOrderUpdate(updatedOrder, "Order cancelled: " + reason);
    }

    // Private helper methods
    private String generateOrderId() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private OrderItem createOrderItem(Order order, CartItemRequest itemRequest) {
        MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + itemRequest.getMenuItemId()));

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setMenuItem(menuItem);
        orderItem.setMenuItemName(menuItem.getName());
        orderItem.setQuantity(itemRequest.getQuantity());
        orderItem.setPrice(menuItem.getPrice());
        orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

        // Add modifiers
        if (itemRequest.getModifierIds() != null) {
            for (Long modifierId : itemRequest.getModifierIds()) {
                Modifier modifier = modifierRepository.findById(modifierId)
                        .orElseThrow(() -> new ResourceNotFoundException("Modifier not found with id: " + modifierId));

                OrderItemModifier orderItemModifier = new OrderItemModifier();
                orderItemModifier.setOrderItem(orderItem);
                orderItemModifier.setModifier(modifier);
                orderItemModifier.setModifierName(modifier.getName());
                orderItemModifier.setPriceAdjustment(modifier.getPriceAdjustment());

                orderItem.getModifiers().add(orderItemModifier);
            }
        }

        return orderItem;
    }

    private void validateStatusTransition(Order.OrderStatus currentStatus, Order.OrderStatus newStatus, User.Role userRole) {
        // Admin can change to any status
        if (userRole == User.Role.ADMIN) {
            return;
        }

        switch (userRole) {
            case CHEF:
                if (!List.of(Order.OrderStatus.CONFIRMED, Order.OrderStatus.PREPARING, Order.OrderStatus.READY)
                        .contains(newStatus)) {
                    throw new ValidationException("Chef can only update status to CONFIRMED, PREPARING, or READY");
                }
                break;

            case WAITER:
                if (!List.of(Order.OrderStatus.READY, Order.OrderStatus.OUT_FOR_DELIVERY, Order.OrderStatus.DELIVERED)
                        .contains(newStatus)) {
                    throw new ValidationException("Waiter can only update status to READY, OUT_FOR_DELIVERY, or DELIVERED");
                }
                break;

            case CUSTOMER:
                if (newStatus != Order.OrderStatus.CANCELLED) {
                    throw new ValidationException("Customers can only cancel orders");
                }
                break;
        }
    }

    private void updateAssignedStaff(Order order, Order.OrderStatus newStatus, User changedBy) {
        switch (newStatus) {
            case PREPARING:
                if (order.getAssignedChef() == null) {
                    order.setAssignedChef(changedBy);
                }
                break;

            case OUT_FOR_DELIVERY:
            case DELIVERED:
                if (order.getAssignedWaiter() == null) {
                    order.setAssignedWaiter(changedBy);
                }
                break;
        }
    }

    private void addStatusHistory(Order order, Order.OrderStatus status, User changedBy, String notes) {
        OrderStatusHistory statusHistory = new OrderStatusHistory();
        statusHistory.setOrder(order);
        statusHistory.setStatus(status);
        statusHistory.setChangedBy(changedBy);
        statusHistory.setNotes(notes);
        orderStatusHistoryRepository.save(statusHistory);
    }

    private void clearUserCart(Long userId, Long tableId) {
        try {
            cartService.clearCart(userId, null, tableId);
        } catch (Exception e) {
            logger.warn("Failed to clear user cart after order creation: {}", e.getMessage());
        }
    }

    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUser(convertToUserResponse(order.getUser()));

        if (order.getTable() != null) {
            response.setTable(convertToTableResponse(order.getTable()));
        }

        response.setOrderType(order.getOrderType());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setSpecialInstructions(order.getSpecialInstructions());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setStripePaymentIntentId(order.getStripePaymentIntentId());

        if (order.getAssignedChef() != null) {
            response.setAssignedChef(convertToUserResponse(order.getAssignedChef()));
        }

        if (order.getAssignedWaiter() != null) {
            response.setAssignedWaiter(convertToUserResponse(order.getAssignedWaiter()));
        }

        response.setOrderItems(order.getOrderItems().stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList()));

        response.setStatusHistory(order.getStatusHistory().stream()
                .map(this::convertToStatusHistoryResponse)
                .collect(Collectors.toList()));

        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        return response;
    }

    private com.coffeehub.dto.response.UserResponse convertToUserResponse(User user) {
        return UserResponse.fromUser(user);
    }

    private com.coffeehub.dto.response.TableResponse convertToTableResponse(RestaurantTable table) {
        com.coffeehub.dto.response.TableResponse response = new com.coffeehub.dto.response.TableResponse();
        response.setId(table.getId());
        response.setTableNumber(table.getTableNumber());
        response.setTableToken(table.getTableToken());
        response.setCapacity(table.getCapacity());
        response.setStatus(table.getStatus());
        response.setQrCodeUrl(table.getQrCodeUrl());
        response.setCreatedAt(table.getCreatedAt());
        return response;
    }

    private com.coffeehub.dto.response.OrderItemResponse convertToOrderItemResponse(OrderItem orderItem) {
        com.coffeehub.dto.response.OrderItemResponse response = new com.coffeehub.dto.response.OrderItemResponse();
        response.setId(orderItem.getId());
        response.setMenuItem(convertToMenuItemResponse(orderItem.getMenuItem()));
        response.setMenuItemName(orderItem.getMenuItemName());
        response.setQuantity(orderItem.getQuantity());
        response.setPrice(orderItem.getPrice());
        response.setSpecialInstructions(orderItem.getSpecialInstructions());
        response.setModifiers(orderItem.getModifiers().stream()
                .map(this::convertToOrderItemModifierResponse)
                .collect(Collectors.toList()));
        response.setTotalPrice(orderItem.getTotalPrice());
        return response;
    }

    private com.coffeehub.dto.response.MenuItemResponse convertToMenuItemResponse(MenuItem menuItem) {
        com.coffeehub.dto.response.MenuItemResponse response = new com.coffeehub.dto.response.MenuItemResponse();
        response.setId(menuItem.getId());
        response.setName(menuItem.getName());
        response.setDescription(menuItem.getDescription());
        response.setPrice(menuItem.getPrice());
        response.setImageUrl(menuItem.getImageUrl());
        response.setAvailable(menuItem.getAvailable());
        response.setPreparationTime(menuItem.getPreparationTime());
        response.setCreatedAt(menuItem.getCreatedAt());
        return response;
    }

    private com.coffeehub.dto.response.OrderItemModifierResponse convertToOrderItemModifierResponse(OrderItemModifier modifier) {
        com.coffeehub.dto.response.OrderItemModifierResponse response = new com.coffeehub.dto.response.OrderItemModifierResponse();
        response.setModifier(convertToModifierResponse(modifier.getModifier()));
        response.setModifierName(modifier.getModifierName());
        response.setPriceAdjustment(modifier.getPriceAdjustment());
        return response;
    }

    private com.coffeehub.dto.response.ModifierResponse convertToModifierResponse(Modifier modifier) {
        com.coffeehub.dto.response.ModifierResponse response = new com.coffeehub.dto.response.ModifierResponse();
        response.setId(modifier.getId());
        response.setName(modifier.getName());
        response.setType(modifier.getType());
        response.setPriceAdjustment(modifier.getPriceAdjustment());
        response.setAvailable(modifier.getAvailable());
        response.setCreatedAt(modifier.getCreatedAt());
        return response;
    }

    private OrderStatusHistoryResponse convertToStatusHistoryResponse(OrderStatusHistory history) {
        OrderStatusHistoryResponse response = new OrderStatusHistoryResponse();
        response.setId(history.getId());
        response.setStatus(history.getStatus());

        if (history.getChangedBy() != null) {
            response.setChangedBy(convertToUserResponse(history.getChangedBy()));
        }

        response.setNotes(history.getNotes());
        response.setCreatedAt(history.getCreatedAt());
        return response;
    }
}