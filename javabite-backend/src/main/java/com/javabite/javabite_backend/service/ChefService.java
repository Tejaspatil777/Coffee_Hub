package com.javabite.javabite_backend.service;

import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.model.OrderStatus;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.model.Role;
import com.javabite.javabite_backend.repository.OrderRepository;
import com.javabite.javabite_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChefService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    /**
     * Get orders assigned to this chef
     */
    public List<Order> getOrdersForChef(String chefId) {
        return orderRepository.findByChefIdOrderByCreatedAtDesc(chefId);
    }

    /**
     * Update order status by chef with validation of allowed transitions:
     * PENDING -> PREPARING
     * PREPARING -> READY_TO_SERVE
     */
    public Order updateOrderStatusByChef(String chefId, String orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Ensure the order is assigned to this chef
        if (order.getChefId() == null || !order.getChefId().equals(chefId)) {
            throw new IllegalStateException("Order is not assigned to this chef");
        }

        OrderStatus current = order.getStatus();
        boolean ok = false;
        if (current == OrderStatus.PENDING && newStatus == OrderStatus.PREPARING) ok = true;
        if (current == OrderStatus.PREPARING && newStatus == OrderStatus.READY_TO_SERVE) ok = true;

        if (!ok) {
            throw new IllegalArgumentException("Invalid status transition from " + current + " to " + newStatus);
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(Instant.now());
        Order saved = orderRepository.save(order);

        // If needed: trigger notification for waiters when READY_TO_SERVE (left for optional WebSocket)
        return saved;
    }

    /**
     * Admin helper to assign a chef to an order.
     */
    public Order assignChefToOrder(String orderId, String chefId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        Optional<User> chefOpt = userRepository.findById(chefId);
        if (chefOpt.isEmpty()) {
            throw new IllegalArgumentException("Chef user not found");
        }
        User chef = chefOpt.get();
        if (chef.getRole() == null || chef.getRole() != Role.CHEF) {
            throw new IllegalArgumentException("User is not a chef");
        }

        order.setChefId(chefId);
        order.setStatus(OrderStatus.PENDING);
        order.setUpdatedAt(Instant.now());
        return orderRepository.save(order);
    }

    /**
     * CHEF HISTORY (C3)
     * Returns orders for this chef that are READY_TO_SERVE or COMPLETED
     */
    public List<Order> getChefHistory(String chefId) {
        List<OrderStatus> statuses = List.of(
                OrderStatus.READY_TO_SERVE,
                OrderStatus.COMPLETED
        );
        return orderRepository.findByChefIdAndStatusInOrderByCreatedAtDesc(chefId, statuses);
    }
}