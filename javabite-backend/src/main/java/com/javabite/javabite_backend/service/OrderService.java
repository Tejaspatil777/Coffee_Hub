package com.javabite.javabite_backend.service;

import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.model.OrderItem;
import com.javabite.javabite_backend.model.OrderStatus;
import com.javabite.javabite_backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository repo;
    private final NotificationService notificationService;

    public Order createOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("No items in order");
        }

        double total = 0;

        // Calculate total in rupees
        for (OrderItem item : order.getItems()) {
            // Assuming price is in paise, convert to rupees for calculation
            double itemPriceInRupees = item.getPrice() / 100.0;
            total += itemPriceInRupees * item.getQuantity();
        }

        // Set the total price (in rupees)
        order.setTotalPrice(total);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());

        Order savedOrder = repo.save(order);

        // Log for debugging
        System.out.println("✅ Order created: ID=" + savedOrder.getId() +
                ", Total=" + savedOrder.getTotalPrice() +
                ", Items=" + savedOrder.getItems().size());

        return savedOrder;
    }

    public List<Order> getOrdersByEmail(String email) {
        return repo.findByCustomerEmailOrderByCreatedAtDesc(email);
    }

    public Optional<Order> updateStatus(String orderId, String status) {
        Optional<Order> found = repo.findById(orderId);

        if (found.isPresent()) {
            Order o = found.get();

            try {
                OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
                o.setStatus(newStatus);
            } catch (Exception e) {
                throw new RuntimeException("Invalid status: " + status);
            }

            o.setUpdatedAt(Instant.now());
            repo.save(o);
            return Optional.of(o);
        }

        return Optional.empty();
    }

    // Get all orders for chefs to see
    public List<Order> getAllOrdersForChefs() {
        return repo.findAllByStatusIn(Arrays.asList(
                OrderStatus.PENDING,
                OrderStatus.PREPARING,
                OrderStatus.READY_TO_SERVE
        ));
    }

    // Chef takes an order for preparation
    @Transactional
    public synchronized Order chefTakeOrder(String orderId, String chefId, String chefName) {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Check if order can be taken (must be PENDING)
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Order cannot be taken. Current status: " + order.getStatus());
        }

        // Check if already locked by another chef
        if (order.isChefLocked() && order.getLockedByChefId() != null && !order.getLockedByChefId().equals(chefId)) {
            throw new RuntimeException("Order is already being prepared by another chef");
        }

        // Chef takes the order
        order.setChefId(chefId);
        order.setLockedByChefId(chefId);
        order.setChefLocked(true);
        order.setChefLockedAt(Instant.now());
        order.setStatus(OrderStatus.PREPARING);
        order.setUpdatedAt(Instant.now());

        System.out.println("✅ Chef " + chefName + " (ID: " + chefId + ") took order: " + orderId);

        return repo.save(order);
    }

    // Chef marks order as ready
    @Transactional
    public Order chefMarkAsReady(String orderId, String chefId) {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        System.out.println("=== MARKING ORDER AS READY ===");
        System.out.println("Order ID: " + orderId);
        System.out.println("Chef ID: " + chefId);
        System.out.println("Current lockedByChefId: " + order.getLockedByChefId());
        System.out.println("Current status: " + order.getStatus());
        System.out.println("Chef locked: " + order.isChefLocked());

        // Verify chef owns this order
        if (order.getLockedByChefId() == null || !order.getLockedByChefId().equals(chefId)) {
            throw new RuntimeException("Only the chef preparing this order can mark it as ready");
        }

        // Verify current status is PREPARING
        if (order.getStatus() != OrderStatus.PREPARING) {
            throw new RuntimeException("Order must be in PREPARING status to mark as ready. Current status: " + order.getStatus());
        }

        // Update status and release lock
        order.setStatus(OrderStatus.READY_TO_SERVE);
        order.setChefLocked(false); // Release lock after marking ready
        order.setUpdatedAt(Instant.now());

        Order savedOrder = repo.save(order);

        // Notify waiters
        try {
            notificationService.notifyWaitersOrderReady(savedOrder);
            System.out.println("✅ Notified waiters about order ready: " + savedOrder.getId());
        } catch (Exception e) {
            System.err.println("⚠️ Warning: Failed to send notifications: " + e.getMessage());
            // Continue anyway - notifications are optional
        }

        System.out.println("✅ Order marked as READY_TO_SERVE successfully!");
        return savedOrder;
    }

    // Waiter takes an order for serving
    @Transactional
    public synchronized Order waiterTakeOrder(String orderId, String waiterId, String waiterName) {
        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Check if order can be taken (must be READY_TO_SERVE)
        if (order.getStatus() != OrderStatus.READY_TO_SERVE) {
            throw new RuntimeException("Order not ready to serve. Current status: " + order.getStatus());
        }

        // Check if already locked by another waiter
        if (order.isWaiterLocked() && order.getLockedByWaiterId() != null && !order.getLockedByWaiterId().equals(waiterId)) {
            throw new RuntimeException("Order is already being served by another waiter");
        }

        // Waiter takes the order
        order.setWaiterId(waiterId);
        order.setLockedByWaiterId(waiterId);
        order.setWaiterLocked(true);
        order.setWaiterLockedAt(Instant.now());
        order.setStatus(OrderStatus.SERVED);
        order.setUpdatedAt(Instant.now());

        System.out.println("✅ Waiter " + waiterName + " (ID: " + waiterId + ") took order: " + orderId);

        return repo.save(order);
    }

    // Get available orders for chefs (not locked)
    public List<Order> getAvailableOrdersForChefs() {
        return repo.findByChefLockedFalseAndStatus(OrderStatus.PENDING);
    }

    // Get available orders for waiters (ready and not locked)
    public List<Order> getAvailableOrdersForWaiters() {
        return repo.findByWaiterLockedFalseAndStatus(OrderStatus.READY_TO_SERVE);
    }
}