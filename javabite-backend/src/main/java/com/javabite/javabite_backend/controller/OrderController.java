package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.service.OrderService;
import com.javabite.javabite_backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/order")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class OrderController {

    private final OrderService service;
    private final JwtUtil jwtUtil;

    public OrderController(OrderService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Order order, HttpServletRequest req) {
        try {
            String header = req.getHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized: Missing Token");
            }
            String token = header.substring(7);

            String email = jwtUtil.extractEmail(token);
            order.setCustomerEmail(email);

            Order saved = service.createOrder(order);

            // Return the saved order with all fields
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> myOrders(HttpServletRequest req) {
        try {
            String header = req.getHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String token = header.substring(7);
            String email = jwtUtil.extractEmail(token);

            List<Order> orders = service.getOrdersByEmail(email);

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String orderId, @RequestParam String status) {
        try {
            Optional<Order> updated = service.updateStatus(orderId, status);

            if (updated.isPresent()) return ResponseEntity.ok(updated.get());
            else return ResponseEntity.status(404).body("Order not found");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}