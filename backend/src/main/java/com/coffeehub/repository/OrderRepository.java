package com.coffeehub.repository;

import com.coffeehub.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatus(Order.OrderStatus status);

    List<Order> findByPaymentStatus(Order.PaymentStatus paymentStatus);

    List<Order> findByTableId(Long tableId);

    List<Order> findByAssignedChefId(Long chefId);

    List<Order> findByAssignedWaiterId(Long waiterId);

    @Query("SELECT o FROM Order o WHERE o.status IN :statuses ORDER BY o.createdAt DESC")
    List<Order> findByStatusIn(@Param("statuses") List<Order.OrderStatus> statuses);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.menuItem LEFT JOIN FETCH oi.modifiers WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.menuItem LEFT JOIN FETCH o.statusHistory WHERE o.id = :orderId")
    Optional<Order> findByIdWithItemsAndHistory(@Param("orderId") Long orderId);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    Page<Order> findByUserIdPaginated(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE " +
            "(:status IS NULL OR o.status = :status) AND " +
            "(:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus) AND " +
            "(:orderType IS NULL OR o.orderType = :orderType) AND " +
            "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
            "(:endDate IS NULL OR o.createdAt <= :endDate) " +
            "ORDER BY o.createdAt DESC")
    Page<Order> findWithFilters(
            @Param("status") Order.OrderStatus status,
            @Param("paymentStatus") Order.PaymentStatus paymentStatus,
            @Param("orderType") Order.OrderType orderType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY') ORDER BY " +
            "CASE o.status " +
            "WHEN 'PREPARING' THEN 1 " +
            "WHEN 'CONFIRMED' THEN 2 " +
            "WHEN 'PENDING' THEN 3 " +
            "WHEN 'READY' THEN 4 " +
            "ELSE 5 END, o.createdAt ASC")
    List<Order> findActiveKitchenOrders();

    @Query("SELECT o FROM Order o WHERE o.status IN ('READY', 'OUT_FOR_DELIVERY') ORDER BY o.createdAt ASC")
    List<Order> findActiveDeliveryOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") Order.OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'PAID' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o FROM Order o WHERE o.stripePaymentIntentId = :paymentIntentId")
    Optional<Order> findByStripePaymentIntentId(@Param("paymentIntentId") String paymentIntentId);

    @Query("SELECT o FROM Order o WHERE o.table.id = :tableId AND o.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Order> findActiveOrdersByTable(@Param("tableId") Long tableId);

    @Query(value = """
        SELECT mi.name as itemName, SUM(oi.quantity) as totalQuantity 
        FROM order_items oi 
        JOIN orders o ON oi.order_id = o.id 
        JOIN menu_items mi ON oi.menu_item_id = mi.id 
        WHERE o.created_at BETWEEN :startDate AND :endDate 
        AND o.payment_status = 'PAID'
        GROUP BY mi.id, mi.name 
        ORDER BY totalQuantity DESC 
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findTopSellingItems(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit);
}