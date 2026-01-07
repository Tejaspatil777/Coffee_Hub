package com.coffeehub.controller;

import com.coffeehub.dto.websocket.OrderUpdateMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    @MessageMapping("/order/update")
    @SendTo("/topic/orders")
    public OrderUpdateMessage handleOrderUpdate(OrderUpdateMessage message) {
        logger.info("WebSocket order update received: {}", message.getOrderId());
        return message;
    }

    @MessageMapping("/kitchen/order/update")
    @SendTo("/topic/kitchen/orders")
    public OrderUpdateMessage handleKitchenUpdate(OrderUpdateMessage message) {
        logger.info("WebSocket kitchen update received: {}", message.getOrderId());
        return message;
    }

    @MessageMapping("/delivery/order/update")
    @SendTo("/topic/delivery/orders")
    public OrderUpdateMessage handleDeliveryUpdate(OrderUpdateMessage message) {
        logger.info("WebSocket delivery update received: {}", message.getOrderId());
        return message;
    }
}