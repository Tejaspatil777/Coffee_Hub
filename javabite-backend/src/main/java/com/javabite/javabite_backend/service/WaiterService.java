package com.javabite.javabite_backend.service;

import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.model.OrderStatus;
import com.javabite.javabite_backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaiterService {

    private final OrderRepository orderRepository;

    /**
     * Get all READY_TO_SERVE orders.
     */
    public List<Order> getReadyOrders() {
        return orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.READY_TO_SERVE);
    }

    /**
     * Update status by waiter:
     * READY_TO_SERVE → SERVED
     * SERVED → COMPLETED
     */
    public Order updateStatus(String waiterId, String orderId, OrderStatus newStatus) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        OrderStatus current = order.getStatus();
        boolean ok = false;

        if (current == OrderStatus.READY_TO_SERVE && newStatus == OrderStatus.SERVED) ok = true;
        if (current == OrderStatus.SERVED && newStatus == OrderStatus.COMPLETED) ok = true;

        if (!ok) {
            throw new IllegalArgumentException(
                    "Invalid Waiter Status Change: " + current + " → " + newStatus
            );
        }

        // Record which waiter handled the order
        order.setWaiterId(waiterId);
        order.setStatus(newStatus);
        order.setUpdatedAt(Instant.now());

        return orderRepository.save(order);
    }

    /**
     * WAITER HISTORY (W3)
     * Returns orders that this waiter served or completed.
     */
    public List<Order> getWaiterHistory(String waiterId) {
        List<OrderStatus> statuses = List.of(
                OrderStatus.SERVED,
                OrderStatus.COMPLETED
        );
        return orderRepository.findByWaiterIdAndStatusInOrderByCreatedAtDesc(waiterId, statuses);
    }

    /**
     * Orders waiting for any waiter (READY_TO_SERVE) — already exists as getReadyOrders(),
     * but we expose a method name that explicitly expresses the intent.
     */
    public List<Order> getWaitingOrders() {
        return getReadyOrders();
    }
}