package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.model.OrderStatus;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.repository.UserRepository;
import com.javabite.javabite_backend.service.ChefService;
import com.javabite.javabite_backend.service.OrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chef")
@RequiredArgsConstructor
public class ChefController {

    private final ChefService chefService;
    private final UserRepository userRepository;
    private final OrderService orderService;

    /**
     * GET /api/chef/orders
     * Returns the list of orders assigned to the logged-in chef.
     */
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAssignedOrders(Authentication authentication) {
        String chefEmail = authentication.getName();
        String chefId = userRepository.findByEmail(chefEmail)
                .orElseThrow(() -> new IllegalArgumentException("Chef not found"))
                .getId();

        List<Order> orders = chefService.getOrdersForChef(chefId);
        return ResponseEntity.ok(orders);
    }

    // Get ALL orders (chefs can see everything)
    @GetMapping("/orders/all")
    public ResponseEntity<?> getAllOrdersForChef(Authentication authentication) {
        try {
            System.out.println("=== GET ALL ORDERS FOR CHEF ===");
            String chefEmail = authentication.getName();
            System.out.println("Chef Email: " + chefEmail);

            User chef = userRepository.findByEmail(chefEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Chef not found"));

            System.out.println("Chef ID: " + chef.getId());

            List<Order> allOrders = orderService.getAllOrdersForChefs();
            System.out.println("Found " + allOrders.size() + " orders");

            return ResponseEntity.ok(allOrders);
        } catch (Exception e) {
            System.err.println("❌ Error getting all orders: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Chef takes an order (self-assign)
    @PostMapping("/orders/{orderId}/take")
    public ResponseEntity<?> takeOrder(@PathVariable String orderId, Authentication authentication) {
        try {
            System.out.println("=== CHEF TAKING ORDER ===");
            System.out.println("Order ID: " + orderId);

            String chefEmail = authentication.getName();
            System.out.println("Chef Email: " + chefEmail);

            User chef = userRepository.findByEmail(chefEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Chef not found"));

            System.out.println("Chef ID: " + chef.getId());
            System.out.println("Chef Name: " + chef.getName());

            Order order = orderService.chefTakeOrder(orderId, chef.getId(), chef.getName());

            System.out.println("✅ Order taken successfully!");
            System.out.println("New status: " + order.getStatus());

            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("❌ Error taking order: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Chef marks order as ready
    @PostMapping("/orders/{orderId}/ready")
    public ResponseEntity<?> markOrderReady(@PathVariable String orderId, Authentication authentication) {
        try {
            System.out.println("=== MARK ORDER AS READY ===");
            System.out.println("Order ID: " + orderId);

            String chefEmail = authentication.getName();
            System.out.println("Chef Email: " + chefEmail);

            User chef = userRepository.findByEmail(chefEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Chef not found"));

            System.out.println("Chef ID: " + chef.getId());
            System.out.println("Chef Name: " + chef.getName());

            Order order = orderService.chefMarkAsReady(orderId, chef.getId());

            System.out.println("✅ Order marked as ready successfully!");
            System.out.println("New status: " + order.getStatus());
            System.out.println("Order chefLocked: " + order.isChefLocked());
            System.out.println("Order lockedByChefId: " + order.getLockedByChefId());

            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("❌ Error marking order as ready: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("❌ Server error: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // Get available orders (not locked by other chefs)
    @GetMapping("/orders/available")
    public ResponseEntity<?> getAvailableOrders(Authentication authentication) {
        try {
            String chefEmail = authentication.getName();
            User chef = userRepository.findByEmail(chefEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Chef not found"));

            List<Order> availableOrders = orderService.getAvailableOrdersForChefs();
            return ResponseEntity.ok(availableOrders);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * PUT /api/chef/orders/{orderId}/status
     * Body: { "status": "PREPARING" }
     */
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId,
                                               @RequestBody ChefOrderStatusRequest req,
                                               Authentication authentication) {
        String chefEmail = authentication.getName();
        String chefId = userRepository.findByEmail(chefEmail)
                .orElseThrow(() -> new IllegalArgumentException("Chef not found"))
                .getId();

        OrderStatus requested;
        try {
            requested = OrderStatus.valueOf(req.getStatus().toUpperCase());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Invalid status value");
        }

        try {
            Order updated = chefService.updateOrderStatusByChef(chefId, orderId, requested);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    /**
     * GET /api/chef/orders/history
     * CHEF HISTORY (C3): READY_TO_SERVE + COMPLETED (orders chef finished)
     */
    @GetMapping("/orders/history")
    public ResponseEntity<List<Order>> getChefHistory(Authentication authentication) {
        String chefEmail = authentication.getName();
        String chefId = userRepository.findByEmail(chefEmail)
                .orElseThrow(() -> new IllegalArgumentException("Chef not found"))
                .getId();

        List<Order> history = chefService.getChefHistory(chefId);
        return ResponseEntity.ok(history);
    }

    @Data
    static class ChefOrderStatusRequest {
        private String status;
    }
}