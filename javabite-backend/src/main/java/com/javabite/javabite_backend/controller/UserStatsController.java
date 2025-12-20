package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Booking;
import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.repository.BookingRepository;
import com.javabite.javabite_backend.repository.OrderRepository;
import com.javabite.javabite_backend.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserStatsController {

    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final JwtUtil jwtUtil;

    public UserStatsController(
            BookingRepository bookingRepository,
            OrderRepository orderRepository,
            JwtUtil jwtUtil
    ) {
        this.bookingRepository = bookingRepository;
        this.orderRepository = orderRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/stats")
    public Map<String, Object> getUserStats(@RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        List<Booking> bookings = bookingRepository.findByUserId(email);

        // ✅ FIX: Changed findByCustomerId to findByCustomerEmail
        List<Order> orders = orderRepository.findByCustomerEmailOrderByCreatedAtDesc(email);

        int points = orders.size() * 10; // Example logic

        Map<String, Object> response = new HashMap<>();
        response.put("totalBookings", bookings.size());
        response.put("totalOrders", orders.size());
        response.put("points", points);

        return response;
    }
}