package com.coffeehub.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderItemResponse {
    private Long id;
    private MenuItemResponse menuItem;
    private String menuItemName;
    private Integer quantity;
    private BigDecimal price;
    private String specialInstructions;
    private List<OrderItemModifierResponse> modifiers;
    private BigDecimal totalPrice;
}