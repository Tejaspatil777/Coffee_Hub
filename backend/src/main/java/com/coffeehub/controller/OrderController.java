package com.coffeehub.controller;

import com.coffeehub.dto.request.OrderRequest;
import com.coffeehub.dto.response.ApiResponse;
import com.coffeehub.dto.response.OrderResponse;
import com.coffeehub.entity.Order;
import com.coffeehub.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest orderRequest,
            @RequestParam Long userId) {

        logger.info("Creating new order for user: {}", userId);

        try {
            OrderResponse order = orderService.createOrder(orderRequest, userId);
            return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
        } catch (Exception e) {
            logger.error("Error creating order for user: {}", userId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating order: " + e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable String orderId) {
        logger.info("Fetching order by id: {}", orderId);

        try {
            OrderResponse order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(ApiResponse.success(order));
        } catch (Exception e) {
            logger.error("Error fetching order with id: {}", orderId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching order: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(@PathVariable Long userId) {
        logger.info("Fetching orders for user: {}", userId);

        try {
            List<OrderResponse> orders = orderService.getUserOrders(userId);
            return ResponseEntity.ok(ApiResponse.success(orders));
        } catch (Exception e) {
            logger.error("Error fetching orders for user: {}", userId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching orders: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF', 'WAITER')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getOrdersWithFilters(
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(required = false) Order.PaymentStatus paymentStatus,
            @RequestParam(required = false) Order.OrderType orderType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {

        logger.info("Fetching orders with filters - status: {}, paymentStatus: {}, orderType: {}",
                status, paymentStatus, orderType);

        try {
            Page<OrderResponse> orders = orderService.getOrdersWithFilters(
                    status, paymentStatus, orderType, startDate, endDate, pageable);
            return ResponseEntity.ok(ApiResponse.success(orders));
        } catch (Exception e) {
            logger.error("Error fetching orders with filters", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching orders: " + e.getMessage()));
        }
    }

    @GetMapping("/kitchen/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveKitchenOrders() {
        logger.info("Fetching active kitchen orders");

        try {
            List<OrderResponse> orders = orderService.getActiveKitchenOrders();
            return ResponseEntity.ok(ApiResponse.success(orders));
        } catch (Exception e) {
            logger.error("Error fetching active kitchen orders", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching kitchen orders"));
        }
    }

    @GetMapping("/delivery/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveDeliveryOrders() {
        logger.info("Fetching active delivery orders");

        try {
            List<OrderResponse> orders = orderService.getActiveDeliveryOrders();
            return ResponseEntity.ok(ApiResponse.success(orders));
        } catch (Exception e) {
            logger.error("Error fetching active delivery orders", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching delivery orders"));
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status,
            @RequestParam Long changedBy,
            @RequestParam(required = false) String notes) {

        logger.info("Updating order status - order: {}, status: {}, changedBy: {}", orderId, status, changedBy);

        try {
            OrderResponse order = orderService.updateOrderStatus(orderId.toString(), status, changedBy, notes);
            return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order));
        } catch (Exception e) {
            logger.error("Error updating order status for order: {}", orderId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating order status: " + e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/assign/chef")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF')")
    public ResponseEntity<ApiResponse<OrderResponse>> assignOrderToChef(
            @PathVariable String orderId,
            @RequestParam Long chefId) {

        logger.info("Assigning order to chef - order: {}, chef: {}", orderId, chefId);

        try {
            OrderResponse order = orderService.assignOrderToChef(orderId, chefId);
            return ResponseEntity.ok(ApiResponse.success("Order assigned to chef successfully", order));
        } catch (Exception e) {
            logger.error("Error assigning order to chef - order: {}, chef: {}", orderId, chefId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error assigning order to chef: " + e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/assign/waiter")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER')")
    public ResponseEntity<ApiResponse<OrderResponse>> assignOrderToWaiter(
            @PathVariable String orderId,
            @RequestParam Long waiterId) {

        logger.info("Assigning order to waiter - order: {}, waiter: {}", orderId, waiterId);

        try {
            OrderResponse order = orderService.assignOrderToWaiter(orderId, waiterId);
            return ResponseEntity.ok(ApiResponse.success("Order assigned to waiter successfully", order));
        } catch (Exception e) {
            logger.error("Error assigning order to waiter - order: {}, waiter: {}", orderId, waiterId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error assigning order to waiter: " + e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestParam Order.PaymentStatus paymentStatus,
            @RequestParam(required = false) String stripePaymentIntentId) {

        logger.info("Updating payment status - order: {}, status: {}", orderId, paymentStatus);

        try {
            OrderResponse order = orderService.updatePaymentStatus(orderId.toString(), paymentStatus, stripePaymentIntentId);
            return ResponseEntity.ok(ApiResponse.success("Payment status updated successfully", order));
        } catch (Exception e) {
            logger.error("Error updating payment status for order: {}", orderId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating payment status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam Long userId,
            @RequestParam(required = false) String reason) {

        logger.info("Cancelling order - order: {}, user: {}, reason: {}", orderId, userId, reason);

        try {
            orderService.cancelOrder(orderId.toString(), userId, reason);
            return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
        } catch (Exception e) {
            logger.error("Error cancelling order: {}", orderId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error cancelling order: " + e.getMessage()));
        }
    }
}