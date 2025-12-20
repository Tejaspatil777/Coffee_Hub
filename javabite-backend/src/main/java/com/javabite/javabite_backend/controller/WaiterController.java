package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.model.OrderStatus;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.repository.UserRepository;
import com.javabite.javabite_backend.service.OrderService;
import com.javabite.javabite_backend.service.WaiterService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final WaiterService waiterService;
    private final UserRepository userRepository;
    private final OrderService orderService; // 🔥 ADD THIS

    // GET READY ORDERS (orders waiting for any waiter)
    @GetMapping("/orders/ready")
    public ResponseEntity<List<Order>> getReadyOrders() {
        return ResponseEntity.ok(waiterService.getReadyOrders());
    }

    // 🔥 NEW: Get available orders for waiters (ready and not locked)
    @GetMapping("/orders/available")
    public ResponseEntity<?> getAvailableOrders(Authentication authentication) {
        try {
            String waiterEmail = authentication.getName();
            User waiter = userRepository.findByEmail(waiterEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Waiter not found"));

            List<Order> availableOrders = orderService.getAvailableOrdersForWaiters();
            return ResponseEntity.ok(availableOrders);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 🔥 NEW: Waiter takes an order for serving
    @PostMapping("/orders/{orderId}/take")
    public ResponseEntity<?> takeOrder(@PathVariable String orderId, Authentication authentication) {
        try {
            String waiterEmail = authentication.getName();
            User waiter = userRepository.findByEmail(waiterEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Waiter not found"));

            Order order = orderService.waiterTakeOrder(orderId, waiter.getId(), waiter.getName());
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // UPDATE ORDER STATUS (READY_TO_SERVE -> SERVED -> COMPLETED)
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody WaiterStatusRequest req,
            Authentication auth
    ) {
        String waiterEmail = auth.getName();
        String waiterId = userRepository.findByEmail(waiterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Waiter not found"))
                .getId();

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(req.getStatus().toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid status '" + req.getStatus() + "'");
        }

        try {
            Order updated = waiterService.updateStatus(waiterId, orderId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/waiter/orders/history
     * W3: Orders served by waiter + orders that were waiting (WAITING handled by getReadyOrders)
     * This endpoint returns orders this waiter served/completed (served/completed statuses).
     */
    @GetMapping("/orders/history")
    public ResponseEntity<List<Order>> getWaiterHistory(Authentication auth) {
        String waiterEmail = auth.getName();
        String waiterId = userRepository.findByEmail(waiterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Waiter not found"))
                .getId();

        List<Order> history = waiterService.getWaiterHistory(waiterId);
        return ResponseEntity.ok(history);
    }

    @Data
    public static class WaiterStatusRequest {
        private String status;
    }
}