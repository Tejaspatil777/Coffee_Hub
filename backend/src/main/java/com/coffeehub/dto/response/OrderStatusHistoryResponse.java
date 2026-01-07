package com.coffeehub.dto.response;

import com.coffeehub.entity.Order;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderStatusHistoryResponse {
    private Long id;
    private Order.OrderStatus status;
    private UserResponse changedBy;
    private String notes;
    private LocalDateTime createdAt;
}