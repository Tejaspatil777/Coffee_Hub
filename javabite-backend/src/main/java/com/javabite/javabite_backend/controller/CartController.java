package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Cart;
import com.javabite.javabite_backend.model.CartItem;
import com.javabite.javabite_backend.security.JwtUtil;
import com.javabite.javabite_backend.service.CartService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;
    private final JwtUtil jwtUtil;

    public CartController(CartService cartService, JwtUtil jwtUtil) {
        this.cartService = cartService;
        this.jwtUtil = jwtUtil;
    }

    private String extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.extractEmail(token);
    }

    @GetMapping
    public Cart getCart(@RequestHeader("Authorization") String authHeader) {
        return cartService.getUserCart(extractUserId(authHeader));
    }

    @PostMapping("/add")
    public Cart addItem(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CartItem item
    ) {
        return cartService.addItem(extractUserId(authHeader), item);
    }

    @PatchMapping("/update/{itemId}")
    public Cart updateQty(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String itemId,
            @RequestParam int qty
    ) {
        return cartService.updateQuantity(extractUserId(authHeader), itemId, qty);
    }

    @DeleteMapping("/remove/{itemId}")
    public Cart removeItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String itemId
    ) {
        return cartService.removeItem(extractUserId(authHeader), itemId);
    }

    @DeleteMapping("/clear")
    public String clearCart(@RequestHeader("Authorization") String authHeader) {
        cartService.clearCart(extractUserId(authHeader));
        return "Cart cleared!";
    }
}
