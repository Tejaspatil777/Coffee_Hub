package com.coffeehub.repository;

import com.coffeehub.entity.Order;
import com.coffeehub.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    Optional<RestaurantTable> findByTableNumber(String tableNumber);

    Optional<RestaurantTable> findByTableToken(String tableToken);

    List<RestaurantTable> findByStatus(RestaurantTable.TableStatus status);

    List<RestaurantTable> findByStatusIn(List<RestaurantTable.TableStatus> statuses);

    @Query("SELECT t FROM RestaurantTable t WHERE t.status = 'AVAILABLE' AND t.capacity >= :minCapacity")
    List<RestaurantTable> findAvailableTablesWithCapacity(@Param("minCapacity") Integer minCapacity);

    @Query("SELECT t FROM RestaurantTable t WHERE t.status IN ('AVAILABLE', 'OCCUPIED') ORDER BY t.tableNumber")
    List<RestaurantTable> findActiveTablesOrdered();

    @Query("SELECT COUNT(t) FROM RestaurantTable t WHERE t.status = 'AVAILABLE'")
    Long countAvailableTables();

    @Query("SELECT t FROM RestaurantTable t WHERE t.tableNumber LIKE %:query% OR t.tableToken LIKE %:query%")
    List<RestaurantTable> searchTables(@Param("query") String query);

    Boolean existsByTableNumberAndIdNot(String tableNumber, Long id);

    Boolean existsByTableTokenAndIdNot(String tableToken, Long id);

    @Query("SELECT o FROM Order o WHERE o.table.id = :tableId AND o.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Order> findActiveOrdersForTable(@Param("tableId") Long tableId);
}