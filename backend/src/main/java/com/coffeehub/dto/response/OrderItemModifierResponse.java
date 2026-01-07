package com.coffeehub.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemModifierResponse {
    private ModifierResponse modifier;
    private String modifierName;
    private BigDecimal priceAdjustment;
}