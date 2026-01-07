package com.coffeehub.dto.websocket;

import com.coffeehub.entity.Order;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateMessage {
    private String orderId;
    private Order.OrderStatus status;
    private String message;
    private Long timestamp;
    private String updatedBy;
}