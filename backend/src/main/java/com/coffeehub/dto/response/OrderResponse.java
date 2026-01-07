package com.coffeehub.dto.response;

import com.coffeehub.entity.Order;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private UserResponse user;
    private TableResponse table;
    private Order.OrderType orderType;
    private Order.OrderStatus status;
    private BigDecimal totalAmount;
    private String specialInstructions;
    private Order.PaymentMethod paymentMethod;
    private Order.PaymentStatus paymentStatus;
    private String stripePaymentIntentId;
    private UserResponse assignedChef;
    private UserResponse assignedWaiter;
    private List<OrderItemResponse> orderItems;
    private List<OrderStatusHistoryResponse> statusHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}