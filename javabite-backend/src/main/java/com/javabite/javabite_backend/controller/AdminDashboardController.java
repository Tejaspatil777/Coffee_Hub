package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.model.OrderStatus;
import com.javabite.javabite_backend.repository.OrderRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final OrderRepository orderRepo;

    // ================================
    // 1️⃣ DASHBOARD OVERVIEW (UPDATED TO SHOW REVENUE FROM ALL ORDERS)
    // ================================
    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        YearMonth currentMonth = YearMonth.from(today);

        // Order counts
        long completed = orderRepo.findByStatusOrderByCreatedAtDesc(OrderStatus.COMPLETED).size();
        long pending = orderRepo.findByStatusOrderByCreatedAtDesc(OrderStatus.PENDING).size();

        double revenueToday = 0.0;
        double totalRevenue = 0.0;

        // FIX: Calculate revenue from ALL orders (not just COMPLETED)
        List<Order> allOrders = orderRepo.findAll();

        for (Order o : allOrders) {
            if (o.getCreatedAt() == null) continue;

            LocalDateTime orderDateTime = LocalDateTime.ofInstant(o.getCreatedAt(), ZoneId.of("Asia/Kolkata"));
            LocalDate orderDate = orderDateTime.toLocalDate();

            // Get totalPrice - handle null by defaulting to 0.0
            Double totalPrice = o.getTotalPrice();
            if (totalPrice == null) {
                totalPrice = 0.0;
            }

            // Today's revenue (from all orders)
            if (orderDate.equals(today)) {
                revenueToday += totalPrice;
            }

            // Total revenue (all time)
            totalRevenue += totalPrice;
        }

        Map<String, Object> res = new HashMap<>();
        res.put("completedOrders", completed);
        res.put("pendingOrders", pending);
        res.put("totalRevenue", totalRevenue);
        res.put("revenueToday", revenueToday);

        return ResponseEntity.ok(res);
    }

    // ================================
    // 2️⃣ TODAY'S REVENUE (8AM - 9PM) (UPDATED TO SHOW FROM ALL ORDERS)
    // ================================
    @GetMapping("/today-revenue")
    public ResponseEntity<?> getTodayRevenue() {

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        LocalDateTime start = today.atTime(8, 0);
        LocalDateTime end = today.atTime(21, 59);

        Map<Integer, Double> revenue = new LinkedHashMap<>();
        for (int hour = 8; hour <= 21; hour++) {
            revenue.put(hour, 0.0);
        }

        // FIX: Calculate revenue from ALL orders
        List<Order> allOrders = orderRepo.findAll();

        for (Order o : allOrders) {
            if (o.getCreatedAt() == null) continue;

            LocalDateTime orderTime = LocalDateTime.ofInstant(o.getCreatedAt(), ZoneId.of("Asia/Kolkata"));

            if (!orderTime.isBefore(start) && !orderTime.isAfter(end)) {
                // Get totalPrice - handle null by defaulting to 0.0
                Double totalPrice = o.getTotalPrice();
                if (totalPrice == null) {
                    totalPrice = 0.0;
                }

                int hour = orderTime.getHour();
                revenue.put(hour, revenue.get(hour) + totalPrice);
            }
        }

        return ResponseEntity.ok(revenue);
    }

    // ================================
    // 3️⃣ MONTHLY REVENUE (UPDATED TO SHOW FROM ALL ORDERS)
    // ================================
    @GetMapping("/monthly-revenue")
    public ResponseEntity<?> getMonthlyRevenue() {

        YearMonth thisMonth = YearMonth.now(ZoneId.of("Asia/Kolkata"));
        double total = 0.0;

        // FIX: Calculate revenue from ALL orders
        List<Order> allOrders = orderRepo.findAll();

        for (Order o : allOrders) {
            if (o.getCreatedAt() == null) continue;

            LocalDate date = LocalDateTime.ofInstant(o.getCreatedAt(), ZoneId.of("Asia/Kolkata")).toLocalDate();

            if (YearMonth.from(date).equals(thisMonth)) {
                // Get totalPrice - handle null by defaulting to 0.0
                Double totalPrice = o.getTotalPrice();
                if (totalPrice == null) {
                    totalPrice = 0.0;
                }
                total += totalPrice;
            }
        }

        return ResponseEntity.ok(Map.of("currentMonthRevenue", total));
    }
}