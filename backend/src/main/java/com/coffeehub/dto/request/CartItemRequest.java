package com.coffeehub.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.List;

@Data
public class CartItemRequest {
    @NotNull
    private Long menuItemId;

    @NotNull
    @Positive
    private Integer quantity = 1;

    private String specialInstructions;

    private List<Long> modifierIds;
}