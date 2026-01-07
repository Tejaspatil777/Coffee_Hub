package com.coffeehub.dto.response;

import com.coffeehub.entity.Modifier;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ModifierResponse {
    private Long id;
    private String name;
    private Modifier.ModifierType type;
    private BigDecimal priceAdjustment;
    private Boolean available;
    private LocalDateTime createdAt;
}