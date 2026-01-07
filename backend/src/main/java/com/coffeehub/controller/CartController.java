package com.coffeehub.controller;

import com.coffeehub.dto.request.CartItemRequest;
import com.coffeehub.dto.response.ApiResponse;
import com.coffeehub.dto.response.CartResponse;
import com.coffeehub.service.CartService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    private static final Logger logger = LoggerFactory.getLogger(CartController.class);

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionToken,
            @RequestParam(required = false) Long tableId) {

        logger.info("Getting cart - userId: {}, sessionToken: {}, tableId: {}", userId, sessionToken, tableId);

        try {
            CartResponse cart = cartService.getOrCreateCart(userId, sessionToken, tableId);
            return ResponseEntity.ok(ApiResponse.success(cart));
        } catch (Exception e) {
            logger.error("Error getting cart", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error getting cart: " + e.getMessage()));
        }
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItemToCart(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionToken,
            @RequestParam(required = false) Long tableId,
            @Valid @RequestBody CartItemRequest cartItemRequest) {

        logger.info("Adding item to cart - userId: {}, sessionToken: {}, tableId: {}, menuItemId: {}",
                userId, sessionToken, tableId, cartItemRequest.getMenuItemId());

        try {
            CartResponse cart = cartService.addItemToCart(userId, sessionToken, tableId, cartItemRequest);
            return ResponseEntity.ok(ApiResponse.success("Item added to cart successfully", cart));
        } catch (Exception e) {
            logger.error("Error adding item to cart", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error adding item to cart: " + e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long itemId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionToken,
            @RequestParam(required = false) Long tableId,
            @Valid @RequestBody CartItemRequest cartItemRequest) {

        logger.info("Updating cart item - itemId: {}, userId: {}, sessionToken: {}, tableId: {}",
                itemId, userId, sessionToken, tableId);

        try {
            CartResponse cart = cartService.updateCartItem(userId, sessionToken, tableId, itemId, cartItemRequest);
            return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully", cart));
        } catch (Exception e) {
            logger.error("Error updating cart item", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating cart item: " + e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItemFromCart(
            @PathVariable Long itemId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionToken,
            @RequestParam(required = false) Long tableId) {

        logger.info("Removing item from cart - itemId: {}, userId: {}, sessionToken: {}, tableId: {}",
                itemId, userId, sessionToken, tableId);

        try {
            CartResponse cart = cartService.removeItemFromCart(userId, sessionToken, tableId, itemId);
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart successfully", cart));
        } catch (Exception e) {
            logger.error("Error removing item from cart", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error removing item from cart: " + e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<CartResponse>> clearCart(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionToken,
            @RequestParam(required = false) Long tableId) {

        logger.info("Clearing cart - userId: {}, sessionToken: {}, tableId: {}", userId, sessionToken, tableId);

        try {
            CartResponse cart = cartService.clearCart(userId, sessionToken, tableId);
            return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", cart));
        } catch (Exception e) {
            logger.error("Error clearing cart", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error clearing cart: " + e.getMessage()));
        }
    }

    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<Void>> mergeCarts(
            @RequestParam String sessionToken,
            @RequestParam Long userId) {

        logger.info("Merging carts - sessionToken: {}, userId: {}", sessionToken, userId);

        try {
            cartService.mergeCarts(sessionToken, userId);
            return ResponseEntity.ok(ApiResponse.success("Carts merged successfully", null));
        } catch (Exception e) {
            logger.error("Error merging carts", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error merging carts: " + e.getMessage()));
        }
    }
}