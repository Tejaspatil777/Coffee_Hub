package com.javabite.javabite_backend.service;

import com.javabite.javabite_backend.model.Booking;
import com.javabite.javabite_backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    private static final int MAX_TABLES = 5; // Assuming 5 tables max
    private static final int MAX_CAPACITY_PER_TABLE = 4; // Assuming 4 people per table
    private static final int MAX_PEOPLE_PER_SLOT = MAX_TABLES * MAX_CAPACITY_PER_TABLE;

    // Check availability based on number of people
    public boolean checkAvailability(String date, String timeSlot, int requestedPeople) {
        List<Booking> bookings = bookingRepository.findByDateAndTimeSlot(date, timeSlot);

        // Calculate total people already booked in this slot
        int totalBookedPeople = bookings.stream()
                .mapToInt(Booking::getNumberOfPeople)
                .sum();

        // Check if there's enough capacity
        return (totalBookedPeople + requestedPeople) <= MAX_PEOPLE_PER_SLOT;
    }

    // Create booking if not a duplicate and if available
    public Booking createBooking(Booking booking) {
        // Check if user already has a booking in this slot
        if (bookingRepository.existsByDateAndTimeSlotAndUserId(
                booking.getDate(),
                booking.getTimeSlot(),
                booking.getUserId())) {
            return null; // duplicate booking by same user
        }

        // Check capacity
        if (!checkAvailability(booking.getDate(), booking.getTimeSlot(), booking.getNumberOfPeople())) {
            return null; // not enough capacity
        }

        booking.setStatus("BOOKED");
        booking.setCreatedAt(java.time.LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<String> getBookedSlots(String date) {
        List<Booking> bookings = bookingRepository.findByDate(date);

        return bookings.stream()
                .map(Booking::getTimeSlot)
                .distinct()
                .toList();
    }
}