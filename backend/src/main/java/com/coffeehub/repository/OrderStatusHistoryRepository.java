package com.coffeehub.repository;

import com.coffeehub.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {

    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    @Query("SELECT osh FROM OrderStatusHistory osh WHERE osh.order.id = :orderId ORDER BY osh.createdAt ASC")
    List<OrderStatusHistory> findOrderStatusTimeline(@Param("orderId") Long orderId);

    @Query("SELECT osh FROM OrderStatusHistory osh WHERE osh.order.id IN :orderIds")
    List<OrderStatusHistory> findByOrderIds(@Param("orderIds") List<Long> orderIds);

    @Query("SELECT osh FROM OrderStatusHistory osh WHERE osh.changedBy.id = :userId ORDER BY osh.createdAt DESC")
    List<OrderStatusHistory> findByChangedBy(@Param("userId") Long userId);
}