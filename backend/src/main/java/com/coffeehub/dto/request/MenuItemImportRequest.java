package com.coffeehub.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

/**
 * 📦 MENU ITEM IMPORT REQUEST
 * Used for bulk importing menu items from frontend to backend
 * ⚠️ Frontend must NOT send IDs - backend will generate them
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemImportRequest {
    
    @NotBlank(message = "Menu item name is required")
    private String name;
    
    @NotBlank(message = "Menu item description is required")
    private String description;
    
    @NotNull(message = "Menu item price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    @NotBlank(message = "Category name is required")
    private String category;
    
    private String imageUrl;
    
    private Boolean available = true;
    
    private Integer preparationTime = 10;
}
