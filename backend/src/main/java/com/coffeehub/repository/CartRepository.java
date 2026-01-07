package com.coffeehub.repository;

import com.coffeehub.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);

    Optional<Cart> findBySessionToken(String sessionToken);

    Optional<Cart> findByUserIdAndTableId(Long userId, Long tableId);

    Optional<Cart> findBySessionTokenAndTableId(String sessionToken, Long tableId);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems ci LEFT JOIN FETCH ci.menuItem LEFT JOIN FETCH ci.modifiers WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems ci LEFT JOIN FETCH ci.menuItem LEFT JOIN FETCH ci.modifiers WHERE c.sessionToken = :sessionToken")
    Optional<Cart> findBySessionTokenWithItems(@Param("sessionToken") String sessionToken);

    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId AND c.table.id = :tableId")
    Optional<Cart> findByUserAndTable(@Param("userId") Long userId, @Param("tableId") Long tableId);

    @Query("SELECT c FROM Cart c WHERE c.sessionToken = :sessionToken AND c.table.id = :tableId")
    Optional<Cart> findBySessionTokenAndTable(@Param("sessionToken") String sessionToken, @Param("tableId") Long tableId);

    @Query("SELECT c FROM Cart c WHERE c.table.id = :tableId")
    List<Cart> findByTableId(@Param("tableId") Long tableId);

    @Query("SELECT COUNT(c) FROM Cart c WHERE c.user.id IS NOT NULL")
    Long countUserCarts();

    void deleteByUserId(Long userId);

    void deleteBySessionToken(String sessionToken);
}