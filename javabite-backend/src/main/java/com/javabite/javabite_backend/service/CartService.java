package com.javabite.javabite_backend.service;

import com.javabite.javabite_backend.model.Cart;
import com.javabite.javabite_backend.model.CartItem;
import com.javabite.javabite_backend.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepo;

    public CartService(CartRepository cartRepo) {
        this.cartRepo = cartRepo;
    }

    public Cart getUserCart(String userId) {
        return cartRepo.findByUserId(userId).orElseGet(() -> {
            Cart c = new Cart();
            c.setUserId(userId);
            c.setItems(new ArrayList<>());
            return cartRepo.save(c);
        });
    }

    public Cart addItem(String userId, CartItem newItem) {
        Cart cart = getUserCart(userId);

        boolean exists = false;
        for (CartItem item : cart.getItems()) {
            if (item.getId().equals(newItem.getId())) {
                item.setQuantity(item.getQuantity() + 1);
                exists = true;
                break;
            }
        }

        if (!exists) {
            newItem.setQuantity(1);
            cart.getItems().add(newItem);
        }

        return cartRepo.save(cart);
    }

    public Cart updateQuantity(String userId, String itemId, int qty) {
        Cart cart = getUserCart(userId);

        cart.getItems().forEach(item -> {
            if (item.getId().equals(itemId)) {
                item.setQuantity(qty);
            }
        });

        return cartRepo.save(cart);
    }

    public Cart removeItem(String userId, String itemId) {
        Cart cart = getUserCart(userId);

        cart.getItems().removeIf(item -> item.getId().equals(itemId));

        return cartRepo.save(cart);
    }

    public void clearCart(String userId) {
        Cart cart = getUserCart(userId);
        cart.getItems().clear();
        cartRepo.save(cart);
    }
}
