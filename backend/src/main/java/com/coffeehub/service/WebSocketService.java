package com.coffeehub.service;

import com.coffeehub.dto.websocket.OrderUpdateMessage;
import com.coffeehub.entity.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyOrderUpdate(Order order, String message) {
        logger.info("Sending WebSocket notification for order: {}, status: {}", order.getId(), order.getStatus());

        OrderUpdateMessage updateMessage = new OrderUpdateMessage();
        updateMessage.setOrderId(String.valueOf(order.getId()));
        updateMessage.setStatus(order.getStatus());
        updateMessage.setMessage(message);
        updateMessage.setTimestamp(System.currentTimeMillis());
        updateMessage.setUpdatedBy(order.getUser().getFirstName() + " " + order.getUser().getLastName());

        // Notify all users interested in this order
        messagingTemplate.convertAndSend("/topic/orders", updateMessage);

        // Notify specific user
        messagingTemplate.convertAndSendToUser(
                order.getUser().getEmail(),
                "/queue/order-updates",
                updateMessage
        );

        // Notify admin and staff
        messagingTemplate.convertAndSend("/topic/admin/orders", updateMessage);

        // Notify specific table if applicable
        if (order.getTable() != null) {
            messagingTemplate.convertAndSend("/topic/table/" + order.getTable().getTableToken(), updateMessage);
        }

        logger.info("WebSocket notification sent for order: {}", order.getId());
    }

    public void notifyKitchenUpdate(Order order, String message) {
        logger.info("Sending kitchen WebSocket notification for order: {}", order.getId());

        OrderUpdateMessage updateMessage = new OrderUpdateMessage();
        updateMessage.setOrderId(String.valueOf(order.getId()));
        updateMessage.setStatus(order.getStatus());
        updateMessage.setMessage(message);
        updateMessage.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/kitchen/orders", updateMessage);
    }

    public void notifyDeliveryUpdate(Order order, String message) {
        logger.info("Sending delivery WebSocket notification for order: {}", order.getId());

        OrderUpdateMessage updateMessage = new OrderUpdateMessage();
        updateMessage.setOrderId(String.valueOf(order.getId()));
        updateMessage.setStatus(order.getStatus());
        updateMessage.setMessage(message);
        updateMessage.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/delivery/orders", updateMessage);
    }
}