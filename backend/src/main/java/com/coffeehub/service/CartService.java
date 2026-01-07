package com.coffeehub.service;

import com.coffeehub.dto.request.CartItemRequest;
import com.coffeehub.dto.response.ApiResponse;
import com.coffeehub.dto.response.CartItemResponse;
import com.coffeehub.dto.response.CartResponse;
import com.coffeehub.dto.response.MenuItemResponse;
import com.coffeehub.dto.response.ModifierResponse;
import com.coffeehub.dto.response.TableResponse;
import com.coffeehub.dto.response.UserResponse;
import com.coffeehub.entity.*;
import com.coffeehub.exception.ResourceNotFoundException;
import com.coffeehub.exception.ValidationException;
import com.coffeehub.repository.CartItemRepository;
import com.coffeehub.repository.CartRepository;
import com.coffeehub.repository.MenuItemRepository;
import com.coffeehub.repository.ModifierRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    private static final Logger logger = LoggerFactory.getLogger(CartService.class);

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ModifierRepository modifierRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private TableService tableService;

    public CartResponse getOrCreateCart(Long userId, String sessionToken, Long tableId) {
        logger.info("Getting or creating cart for user: {}, session: {}, table: {}", userId, sessionToken, tableId);

        Cart cart;
        if (userId != null) {
            cart = getOrCreateUserCart(userId, tableId);
        } else if (sessionToken != null) {
            cart = getOrCreateSessionCart(sessionToken, tableId);
        } else {
            throw new ValidationException("Either userId or sessionToken must be provided");
        }

        return convertToCartResponse(cart);
    }

    public CartResponse addItemToCart(Long userId, String sessionToken, Long tableId, CartItemRequest cartItemRequest) {
        logger.info("Adding item to cart - user: {}, session: {}, table: {}, item: {}",
                userId, sessionToken, tableId, cartItemRequest.getMenuItemId());

        Cart cart = getOrCreateCartInternal(userId, sessionToken, tableId);
        MenuItem menuItem = getValidMenuItem(cartItemRequest.getMenuItemId());

        // Check if item already exists in cart
        Optional<CartItem> existingCartItem = cartItemRepository.findByCartAndMenuItemWithDetails(
                cart.getId(), cartItemRequest.getMenuItemId());

        CartItem cartItem;
        if (existingCartItem.isPresent()) {
            cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + cartItemRequest.getQuantity());
        } else {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setMenuItem(menuItem);
            cartItem.setQuantity(cartItemRequest.getQuantity());
            cartItem.setPrice(menuItem.getPrice());
            cartItem.setSpecialInstructions(cartItemRequest.getSpecialInstructions());

            // Add modifiers if provided
            if (cartItemRequest.getModifierIds() != null && !cartItemRequest.getModifierIds().isEmpty()) {
                List<Modifier> modifiers = modifierRepository.findAvailableModifiersByIds(cartItemRequest.getModifierIds());
                cartItem.setModifiers(modifiers);
            }

            cart.addCartItem(cartItem);
        }

        Cart savedCart = cartRepository.save(cart);
        logger.info("Item added to cart successfully - cart id: {}, item id: {}", cart.getId(), cartItemRequest.getMenuItemId());

        return convertToCartResponse(savedCart);
    }

    public CartResponse updateCartItem(Long userId, String sessionToken, Long tableId, Long itemId, CartItemRequest cartItemRequest) {
        logger.info("Updating cart item - user: {}, session: {}, table: {}, item: {}",
                userId, sessionToken, tableId, itemId);

        Cart cart = getCartInternal(userId, sessionToken, tableId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new ValidationException("Cart item does not belong to the specified cart");
        }

        cartItem.setQuantity(cartItemRequest.getQuantity());
        cartItem.setSpecialInstructions(cartItemRequest.getSpecialInstructions());

        // Update modifiers
        if (cartItemRequest.getModifierIds() != null) {
            List<Modifier> modifiers = modifierRepository.findAvailableModifiersByIds(cartItemRequest.getModifierIds());
            cartItem.setModifiers(modifiers);
        }

        Cart savedCart = cartRepository.save(cart);
        logger.info("Cart item updated successfully - cart id: {}, item id: {}", cart.getId(), itemId);

        return convertToCartResponse(savedCart);
    }

    public CartResponse removeItemFromCart(Long userId, String sessionToken, Long tableId, Long itemId) {
        logger.info("Removing item from cart - user: {}, session: {}, table: {}, item: {}",
                userId, sessionToken, tableId, itemId);

        Cart cart = getCartInternal(userId, sessionToken, tableId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new ValidationException("Cart item does not belong to the specified cart");
        }

        cart.removeCartItem(cartItem);
        cartItemRepository.delete(cartItem);

        Cart savedCart = cartRepository.save(cart);
        logger.info("Item removed from cart successfully - cart id: {}, item id: {}", cart.getId(), itemId);

        return convertToCartResponse(savedCart);
    }

    public CartResponse clearCart(Long userId, String sessionToken, Long tableId) {
        logger.info("Clearing cart - user: {}, session: {}, table: {}", userId, sessionToken, tableId);

        Cart cart = getCartInternal(userId, sessionToken, tableId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();

        Cart savedCart = cartRepository.save(cart);
        logger.info("Cart cleared successfully - cart id: {}", cart.getId());

        return convertToCartResponse(savedCart);
    }

    public void mergeCarts(String sessionToken, Long userId) {
        logger.info("Merging carts - session: {}, user: {}", sessionToken, userId);

        Optional<Cart> sessionCart = cartRepository.findBySessionTokenWithItems(sessionToken);
        if (sessionCart.isPresent()) {
            Cart userCart = getOrCreateUserCart(userId, sessionCart.get().getTable() != null ? sessionCart.get().getTable().getId() : null);

            // Merge session cart items into user cart
            for (CartItem sessionItem : sessionCart.get().getCartItems()) {
                addItemToCart(userId, null, userCart.getTable() != null ? userCart.getTable().getId() : null,
                        convertToCartItemRequest(sessionItem));
            }

            // Delete session cart
            cartRepository.delete(sessionCart.get());
            logger.info("Carts merged successfully - session: {}, user: {}", sessionToken, userId);
        }
    }

    // Private helper methods
    private Cart getOrCreateCartInternal(Long userId, String sessionToken, Long tableId) {
        if (userId != null) {
            return getOrCreateUserCart(userId, tableId);
        } else {
            return getOrCreateSessionCart(sessionToken, tableId);
        }
    }

    private Cart getCartInternal(Long userId, String sessionToken, Long tableId) {
        if (userId != null) {
            return getUserCart(userId, tableId);
        } else {
            return getSessionCart(sessionToken, tableId);
        }
    }

    private Cart getOrCreateUserCart(Long userId, Long tableId) {
        return cartRepository.findByUserAndTable(userId, tableId)
                .orElseGet(() -> createUserCart(userId, tableId));
    }

    private Cart getOrCreateSessionCart(String sessionToken, Long tableId) {
        return cartRepository.findBySessionTokenAndTable(sessionToken, tableId)
                .orElseGet(() -> createSessionCart(sessionToken, tableId));
    }

    private Cart getUserCart(Long userId, Long tableId) {
        return cartRepository.findByUserAndTable(userId, tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId + " and table: " + tableId));
    }

    private Cart getSessionCart(String sessionToken, Long tableId) {
        return cartRepository.findBySessionTokenAndTable(sessionToken, tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for session: " + sessionToken + " and table: " + tableId));
    }

    private Cart createUserCart(Long userId, Long tableId) {
        Cart cart = new Cart();
        cart.setUser(userService.findById(userId));

        if (tableId != null) {
            cart.setTable(tableService.getTableByIdEntity(tableId));
        }

        return cartRepository.save(cart);
    }

    private Cart createSessionCart(String sessionToken, Long tableId) {
        Cart cart = new Cart();
        cart.setSessionToken(sessionToken);

        if (tableId != null) {
            cart.setTable(tableService.getTableByIdEntity(tableId));
        }

        return cartRepository.save(cart);
    }

    private MenuItem getValidMenuItem(Long menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + menuItemId));

        if (!menuItem.getAvailable()) {
            throw new ValidationException("Menu item is not available: " + menuItem.getName());
        }

        if (!menuItem.getCategory().getActive()) {
            throw new ValidationException("Menu item category is not active: " + menuItem.getCategory().getName());
        }

        return menuItem;
    }

    private CartItemRequest convertToCartItemRequest(CartItem cartItem) {
        CartItemRequest request = new CartItemRequest();
        request.setMenuItemId(cartItem.getMenuItem().getId());
        request.setQuantity(cartItem.getQuantity());
        request.setSpecialInstructions(cartItem.getSpecialInstructions());
        request.setModifierIds(cartItem.getModifiers().stream()
                .map(Modifier::getId)
                .collect(Collectors.toList()));
        return request;
    }

    private CartResponse convertToCartResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());

        if (cart.getUser() != null) {
            response.setUser(UserResponse.fromUser(cart.getUser()));
        }

        if (cart.getTable() != null) {
            response.setTable(convertToTableResponse(cart.getTable()));
        }

        response.setCartItems(cart.getCartItems().stream()
                .map(this::convertToCartItemResponse)
                .collect(Collectors.toList()));

        response.setTotalAmount(calculateTotalAmount(cart));
        response.setCreatedAt(cart.getCreatedAt());
        response.setUpdatedAt(cart.getUpdatedAt());

        return response;
    }

    private CartItemResponse convertToCartItemResponse(CartItem cartItem) {
        CartItemResponse response = new CartItemResponse();
        response.setId(cartItem.getId());
        response.setMenuItem(convertToMenuItemResponse(cartItem.getMenuItem()));
        response.setQuantity(cartItem.getQuantity());
        response.setSpecialInstructions(cartItem.getSpecialInstructions());
        response.setPrice(cartItem.getPrice());
        response.setModifiers(cartItem.getModifiers().stream()
                .map(this::convertToModifierResponse)
                .collect(Collectors.toList()));
        response.setTotalPrice(cartItem.getTotalPrice());
        response.setCreatedAt(cartItem.getCreatedAt());
        return response;
    }

    // These conversion methods would use the same pattern as in MenuService
    // For brevity, I'm including simplified versions
    private com.coffeehub.dto.response.TableResponse convertToTableResponse(RestaurantTable table) {
        com.coffeehub.dto.response.TableResponse response = new com.coffeehub.dto.response.TableResponse();
        response.setId(table.getId());
        response.setTableNumber(table.getTableNumber());
        response.setTableToken(table.getTableToken());
        response.setCapacity(table.getCapacity());
        response.setStatus(table.getStatus());
        response.setQrCodeUrl(table.getQrCodeUrl());
        response.setCreatedAt(table.getCreatedAt());
        return response;
    }

    private com.coffeehub.dto.response.MenuItemResponse convertToMenuItemResponse(MenuItem menuItem) {
        com.coffeehub.dto.response.MenuItemResponse response = new com.coffeehub.dto.response.MenuItemResponse();
        response.setId(menuItem.getId());
        response.setName(menuItem.getName());
        response.setDescription(menuItem.getDescription());
        response.setPrice(menuItem.getPrice());
        response.setImageUrl(menuItem.getImageUrl());
        response.setAvailable(menuItem.getAvailable());
        response.setPreparationTime(menuItem.getPreparationTime());
        response.setCreatedAt(menuItem.getCreatedAt());
        return response;
    }

    private com.coffeehub.dto.response.ModifierResponse convertToModifierResponse(Modifier modifier) {
        com.coffeehub.dto.response.ModifierResponse response = new com.coffeehub.dto.response.ModifierResponse();
        response.setId(modifier.getId());
        response.setName(modifier.getName());
        response.setType(modifier.getType());
        response.setPriceAdjustment(modifier.getPriceAdjustment());
        response.setAvailable(modifier.getAvailable());
        response.setCreatedAt(modifier.getCreatedAt());
        return response;
    }

    private BigDecimal calculateTotalAmount(Cart cart) {
        return cart.getCartItems().stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}