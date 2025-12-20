package com.javabite.javabite_backend.repository;

import com.javabite.javabite_backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByDateAndTimeSlot(String date, String timeSlot);
    List<Booking> findByUserId(String userId);
    List<Booking> findByDate(String date);
    boolean existsByDateAndTimeSlotAndUserId(String date, String timeSlot, String userId);
}