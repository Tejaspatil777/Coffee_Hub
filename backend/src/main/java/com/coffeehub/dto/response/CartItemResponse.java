package com.coffeehub.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CartItemResponse {
    private Long id;
    private MenuItemResponse menuItem;
    private Integer quantity;
    private String specialInstructions;
    private BigDecimal price;
    private List<ModifierResponse> modifiers;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
}