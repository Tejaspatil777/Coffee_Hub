package com.javabite.javabite_backend.repository;

import com.javabite.javabite_backend.model.Order;
import com.javabite.javabite_backend.model.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    // For AdminDashboardController
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    // For ChefService
    List<Order> findByChefIdOrderByCreatedAtDesc(String chefId);
    List<Order> findByChefIdAndStatusInOrderByCreatedAtDesc(String chefId, List<OrderStatus> statuses);

    // For WaiterService
    List<Order> findByWaiterIdAndStatusInOrderByCreatedAtDesc(String waiterId, List<OrderStatus> statuses);

    // Existing methods
    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    List<Order> findByCreatedAtAfter(Instant date);
    List<Order> findByChefIdAndStatusOrderByCreatedAtDesc(String chefId, OrderStatus status);
    List<Order> findByWaiterIdAndStatusIn(String waiterId, List<OrderStatus> statuses);

    List<Order> findAllByStatusIn(List<OrderStatus> statuses);
    List<Order> findByChefLockedFalseAndStatus(OrderStatus status);
    List<Order> findByWaiterLockedFalseAndStatus(OrderStatus status);
    List<Order> findByLockedByChefId(String chefId);
    List<Order> findByLockedByWaiterId(String waiterId);
}