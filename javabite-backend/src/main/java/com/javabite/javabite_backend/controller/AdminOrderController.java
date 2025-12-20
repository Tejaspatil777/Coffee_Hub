package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.model.OrderStatus;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.repository.OrderRepository;
import com.javabite.javabite_backend.repository.UserRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderRepository orderRepo;
    private final UserRepository userRepository; // 🔥 ADD THIS

    // ----------------------------------------------------------
    // GET ALL ORDERS
    // ----------------------------------------------------------
    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderRepo.findAll());
    }

    // ----------------------------------------------------------
    // 🔥 NEW: EMERGENCY CHEF ASSIGNMENT (Admin forces assignment)
    // ----------------------------------------------------------
    @PostMapping("/{orderId}/assign-chef-emergency")
    public ResponseEntity<?> assignChefEmergency(
            @PathVariable String orderId,
            @RequestBody EmergencyAssignRequest req) {

        Optional<Order> opt = orderRepo.findById(orderId);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body("Order not found!");
        }

        Optional<User> chefOpt = userRepository.findById(req.getChefId());
        if (chefOpt.isEmpty() || !chefOpt.get().getRole().name().equals("CHEF")) {
            return ResponseEntity.badRequest().body("Invalid chef ID or user is not a chef!");
        }

        Order order = opt.get();
        User chef = chefOpt.get();

        // Force assign chef (override any existing lock)
        order.setChefId(chef.getId());
        order.setLockedByChefId(chef.getId());
        order.setChefLocked(true);
        order.setChefLockedAt(Instant.now());
        order.setStatus(OrderStatus.PREPARING);
        order.setUpdatedAt(Instant.now());

        orderRepo.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Chef assigned successfully in emergency!");
        response.put("orderId", order.getId());
        response.put("chefName", chef.getName());
        response.put("chefId", chef.getId());

        return ResponseEntity.ok(response);
    }

    // ----------------------------------------------------------
    // 🔥 NEW: EMERGENCY WAITER ASSIGNMENT
    // ----------------------------------------------------------
    @PostMapping("/{orderId}/assign-waiter-emergency")
    public ResponseEntity<?> assignWaiterEmergency(
            @PathVariable String orderId,
            @RequestBody EmergencyAssignRequest req) {

        Optional<Order> opt = orderRepo.findById(orderId);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body("Order not found!");
        }

        Optional<User> waiterOpt = userRepository.findById(req.getWaiterId());
        if (waiterOpt.isEmpty() || !waiterOpt.get().getRole().name().equals("WAITER")) {
            return ResponseEntity.badRequest().body("Invalid waiter ID or user is not a waiter!");
        }

        Order order = opt.get();
        User waiter = waiterOpt.get();

        // Force assign waiter (override any existing lock)
        order.setWaiterId(waiter.getId());
        order.setLockedByWaiterId(waiter.getId());
        order.setWaiterLocked(true);
        order.setWaiterLockedAt(Instant.now());
        order.setStatus(OrderStatus.SERVED);
        order.setUpdatedAt(Instant.now());

        orderRepo.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Waiter assigned successfully in emergency!");
        response.put("orderId", order.getId());
        response.put("waiterName", waiter.getName());
        response.put("waiterId", waiter.getId());

        return ResponseEntity.ok(response);
    }

    // ----------------------------------------------------------
    // ASSIGN CHEF & WAITER TO ORDER (Regular assignment)
    // ----------------------------------------------------------
    @PostMapping("/assign/{orderId}")
    public ResponseEntity<?> assignStaff(
            @PathVariable String orderId,
            @RequestBody AssignRequest req) {

        Optional<Order> opt = orderRepo.findById(orderId);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Order not found!");

        Order order = opt.get();

        // Assign Chef
        if (req.getChefId() != null && !req.getChefId().isBlank()) {
            order.setChefId(req.getChefId());
            order.setStatus(OrderStatus.PENDING); // After assign chef → start from PENDING
        }

        // Assign Waiter (optional)
        if (req.getWaiterId() != null && !req.getWaiterId().isBlank()) {
            order.setWaiterId(req.getWaiterId());
        }

        orderRepo.save(order);
        return ResponseEntity.ok("Chef & Waiter assigned successfully!");
    }

    // ----------------------------------------------------------
    // ADMIN UPDATE STATUS (NOT RECOMMENDED BUT WORKS)
    // ----------------------------------------------------------
    @PostMapping("/status/{orderId}")
    public ResponseEntity<?> updateStatus(
            @PathVariable String orderId,
            @RequestBody StatusRequest req) {

        Optional<Order> opt = orderRepo.findById(orderId);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Order not found!");

        Order order = opt.get();

        try {
            OrderStatus newStatus = OrderStatus.valueOf(req.getStatus().toUpperCase());
            order.setStatus(newStatus);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid status value");
        }

        orderRepo.save(order);
        return ResponseEntity.ok("Order status updated successfully!");
    }

    // ----------------------------------------------------------
    // DTOs
    // ----------------------------------------------------------
    @Data
    public static class AssignRequest {
        private String chefId;
        private String waiterId;
    }

    @Data
    public static class StatusRequest {
        private String status;
    }

    // 🔥 NEW DTO for emergency assignment
    @Data
    public static class EmergencyAssignRequest {
        private String chefId;
        private String waiterId;
    }
}