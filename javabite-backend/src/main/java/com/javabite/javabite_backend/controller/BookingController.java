package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Booking;
import com.javabite.javabite_backend.repository.BookingRepository;
import com.javabite.javabite_backend.security.JwtUtil;
import com.javabite.javabite_backend.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/booking")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BookingRepository bookingRepository;

    // Extract userId from JWT (email is subject)
    private String getUserIdFromJWT(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;

        String token = authHeader.substring(7);
        Claims claims = jwtUtil.extractAllClaims(token);

        return claims.getSubject();   // Here userId = email
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, HttpServletRequest request) {
        String userId = getUserIdFromJWT(request);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        booking.setUserId(userId);

        // Validate number of people
        if (booking.getNumberOfPeople() <= 0 || booking.getNumberOfPeople() > 10) {
            return ResponseEntity.badRequest().body(Map.of("message", "Number of people must be between 1 and 10"));
        }

        if (!bookingService.checkAvailability(booking.getDate(), booking.getTimeSlot(), booking.getNumberOfPeople())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Slot unavailable"));
        }

        Booking saved = bookingService.createBooking(booking);
        if (saved == null) {
            return ResponseEntity.status(409).body(Map.of("message", "Duplicate booking in this time slot"));
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/availability")
    public ResponseEntity<?> checkAvailability(@RequestParam String date,
                                               @RequestParam String timeSlot,
                                               @RequestParam(defaultValue = "2") int people) {
        boolean available = bookingService.checkAvailability(date, timeSlot, people);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserBookings(HttpServletRequest request) {
        String userId = getUserIdFromJWT(request);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        List<Booking> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/booked-slots")
    public ResponseEntity<?> getBookedSlots(@RequestParam String date) {
        List<String> bookedSlots = bookingService.getBookedSlots(date);
        return ResponseEntity.ok(Map.of("bookedSlots", bookedSlots));
    }
}