package com.coffeehub.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MenuItemResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private CategoryResponse category;
    private Boolean available;
    private Integer preparationTime;
    private LocalDateTime createdAt;
    private List<ModifierResponse> modifiers;
}