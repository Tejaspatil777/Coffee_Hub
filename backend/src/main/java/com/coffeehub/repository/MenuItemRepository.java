package com.coffeehub.repository;

import com.coffeehub.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByAvailableTrue();

    List<MenuItem> findByCategoryIdAndAvailableTrue(Long categoryId);

    List<MenuItem> findByCategoryId(Long categoryId);

    @Query("SELECT m FROM MenuItem m WHERE m.available = true AND m.category.active = true")
    List<MenuItem> findAvailableMenuItemsWithActiveCategory();

    @Query("SELECT m FROM MenuItem m WHERE " +
            "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
            "(:available IS NULL OR m.available = :available) AND " +
            "(:minPrice IS NULL OR m.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR m.price <= :maxPrice) AND " +
            "(:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<MenuItem> findWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("available") Boolean available,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("search") String search);

    @Query("SELECT m FROM MenuItem m WHERE m.available = true AND " +
            "(LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(m.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<MenuItem> searchAvailableItems(@Param("query") String query);

    @Query("SELECT m FROM MenuItem m WHERE m.id IN :itemIds AND m.available = true")
    List<MenuItem> findAvailableItemsByIds(@Param("itemIds") List<Long> itemIds);

    @Query("SELECT COUNT(m) FROM MenuItem m WHERE m.available = true")
    Long countAvailableItems();

    @Query("SELECT COUNT(m) FROM MenuItem m WHERE m.category.id = :categoryId")
    Long countByCategoryId(@Param("categoryId") Long categoryId);

        @Query("SELECT m FROM MenuItem m WHERE m.category.id = :categoryId AND m.available = true ORDER BY m.name ASC")
        List<MenuItem> findAvailableByCategoryOrdered(@Param("categoryId") Long categoryId);

    Boolean existsByNameAndCategoryIdAndIdNot(String name, Long categoryId, Long id);
}