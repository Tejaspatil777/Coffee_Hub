package com.coffeehub.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 📊 MENU IMPORT SUMMARY RESPONSE
 * Returns result of menu import operation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuImportSummary {
    
    private Long totalItemsProcessed;
    private Long itemsCreated;
    private Long itemsSkipped;
    private Long categoriesCreated;
    private String message;
    
    public static MenuImportSummary success(Long totalProcessed, Long created, Long skipped, Long categoriesCreated) {
        return new MenuImportSummary(
            totalProcessed,
            created,
            skipped,
            categoriesCreated,
            String.format("Menu import completed: %d items created, %d items skipped, %d categories created", 
                created, skipped, categoriesCreated)
        );
    }
    
    public static MenuImportSummary empty() {
        return new MenuImportSummary(
            0L,
            0L,
            0L,
            0L,
            "No menu items to import"
        );
    }
}
