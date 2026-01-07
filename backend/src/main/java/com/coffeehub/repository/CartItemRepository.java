package com.coffeehub.repository;

import com.coffeehub.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartId(Long cartId);

    Optional<CartItem> findByCartIdAndMenuItemId(Long cartId, Long menuItemId);

    @Query("SELECT ci FROM CartItem ci LEFT JOIN FETCH ci.menuItem LEFT JOIN FETCH ci.modifiers WHERE ci.cart.id = :cartId")
    List<CartItem> findByCartIdWithDetails(@Param("cartId") Long cartId);

    @Query("SELECT ci FROM CartItem ci LEFT JOIN FETCH ci.menuItem LEFT JOIN FETCH ci.modifiers WHERE ci.cart.id = :cartId AND ci.menuItem.id = :menuItemId")
    Optional<CartItem> findByCartAndMenuItemWithDetails(@Param("cartId") Long cartId, @Param("menuItemId") Long menuItemId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.menuItem.id = :menuItemId")
    void deleteByCartIdAndMenuItemId(@Param("cartId") Long cartId, @Param("menuItemId") Long menuItemId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteByCartId(@Param("cartId") Long cartId);

    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Long countByCartId(@Param("cartId") Long cartId);

    Boolean existsByCartIdAndMenuItemId(Long cartId, Long menuItemId);
}