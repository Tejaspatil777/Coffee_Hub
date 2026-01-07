package com.coffeehub.controller;

import com.coffeehub.dto.response.ApiResponse;
import com.coffeehub.dto.response.CategoryResponse;
import com.coffeehub.dto.response.MenuItemResponse;
import com.coffeehub.dto.response.ModifierResponse;
import com.coffeehub.entity.Category;
import com.coffeehub.entity.MenuItem;
import com.coffeehub.entity.Modifier;
import com.coffeehub.service.MenuService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/menu")
public class MenuController {

    private static final Logger logger = LoggerFactory.getLogger(MenuController.class);

    @Autowired
    private MenuService menuService;

    // Public endpoints
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        logger.info("Fetching all categories");

        try {
            List<CategoryResponse> categories = menuService.getAllCategories();
            return ResponseEntity.ok(ApiResponse.success(categories));
        } catch (Exception e) {
            logger.error("Error fetching categories", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching categories"));
        }
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        logger.info("Fetching category by id: {}", id);

        try {
            CategoryResponse category = menuService.getCategoryById(id);
            return ResponseEntity.ok(ApiResponse.success(category));
        } catch (Exception e) {
            logger.error("Error fetching category with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching category: " + e.getMessage()));
        }
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getAllMenuItems() {
        logger.info("Fetching all menu items");

        try {
            List<MenuItemResponse> menuItems = menuService.getAllMenuItems();
            return ResponseEntity.ok(ApiResponse.success(menuItems));
        } catch (Exception e) {
            logger.error("Error fetching menu items", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching menu items"));
        }
    }

    @GetMapping("/items/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItemsByCategory(@PathVariable Long categoryId) {
        logger.info("Fetching menu items for category: {}", categoryId);

        try {
            List<MenuItemResponse> menuItems = menuService.getMenuItemsByCategory(categoryId);
            return ResponseEntity.ok(ApiResponse.success(menuItems));
        } catch (Exception e) {
            logger.error("Error fetching menu items for category: {}", categoryId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching menu items: " + e.getMessage()));
        }
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItemById(@PathVariable Long id) {
        logger.info("Fetching menu item by id: {}", id);

        try {
            MenuItemResponse menuItem = menuService.getMenuItemById(id);
            return ResponseEntity.ok(ApiResponse.success(menuItem));
        } catch (Exception e) {
            logger.error("Error fetching menu item with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching menu item: " + e.getMessage()));
        }
    }

    @GetMapping("/items/search")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> searchMenuItems(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        logger.info("Searching menu items - query: {}, category: {}, price range: {}-{}",
                query, categoryId, minPrice, maxPrice);

        try {
            List<MenuItemResponse> menuItems = menuService.searchMenuItems(query, categoryId, minPrice, maxPrice);
            return ResponseEntity.ok(ApiResponse.success(menuItems));
        } catch (Exception e) {
            logger.error("Error searching menu items", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error searching menu items: " + e.getMessage()));
        }
    }

    @GetMapping("/modifiers")
    public ResponseEntity<ApiResponse<List<ModifierResponse>>> getAllModifiers() {
        logger.info("Fetching all modifiers");

        try {
            List<ModifierResponse> modifiers = menuService.getAllModifiers();
            return ResponseEntity.ok(ApiResponse.success(modifiers));
        } catch (Exception e) {
            logger.error("Error fetching modifiers", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error fetching modifiers"));
        }
    }

    @GetMapping("/modifiers/type/{type}")
    public ResponseEntity<ApiResponse<List<ModifierResponse>>> getModifiersByType(@PathVariable Modifier.ModifierType type) {
        logger.info("Fetching modifiers by type: {}", type);

        try {
            List<ModifierResponse> modifiers = menuService.getModifiersByType(type);
            return ResponseEntity.ok(ApiResponse.success(modifiers));
        } catch (Exception e) {
            logger.error("Error fetching modifiers for type: {}", type, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching modifiers: " + e.getMessage()));
        }
    }

    // Admin endpoints
    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody Category category) {
        logger.info("Creating new category: {}", category.getName());

        try {
            CategoryResponse createdCategory = menuService.createCategory(category);
            return ResponseEntity.ok(ApiResponse.success("Category created successfully", createdCategory));
        } catch (Exception e) {
            logger.error("Error creating category", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating category: " + e.getMessage()));
        }
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody Category category) {

        logger.info("Updating category with id: {}", id);

        try {
            CategoryResponse updatedCategory = menuService.updateCategory(id, category);
            return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updatedCategory));
        } catch (Exception e) {
            logger.error("Error updating category with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating category: " + e.getMessage()));
        }
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        logger.info("Deleting category with id: {}", id);

        try {
            menuService.deleteCategory(id);
            return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
        } catch (Exception e) {
            logger.error("Error deleting category with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting category: " + e.getMessage()));
        }
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(@Valid @RequestBody MenuItem menuItem) {
        logger.info("Creating new menu item: {}", menuItem.getName());

        try {
            MenuItemResponse createdItem = menuService.createMenuItem(menuItem);
            return ResponseEntity.ok(ApiResponse.success("Menu item created successfully", createdItem));
        } catch (Exception e) {
            logger.error("Error creating menu item", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating menu item: " + e.getMessage()));
        }
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable Long id, @Valid @RequestBody MenuItem menuItem) {

        logger.info("Updating menu item with id: {}", id);

        try {
            MenuItemResponse updatedItem = menuService.updateMenuItem(id, menuItem);
            return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully", updatedItem));
        } catch (Exception e) {
            logger.error("Error updating menu item with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating menu item: " + e.getMessage()));
        }
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable Long id) {
        logger.info("Deleting menu item with id: {}", id);

        try {
            menuService.deleteMenuItem(id);
            return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully", null));
        } catch (Exception e) {
            logger.error("Error deleting menu item with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting menu item: " + e.getMessage()));
        }
    }

    @PostMapping("/modifiers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ModifierResponse>> createModifier(@Valid @RequestBody Modifier modifier) {
        logger.info("Creating new modifier: {}", modifier.getName());

        try {
            ModifierResponse createdModifier = menuService.createModifier(modifier);
            return ResponseEntity.ok(ApiResponse.success("Modifier created successfully", createdModifier));
        } catch (Exception e) {
            logger.error("Error creating modifier", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating modifier: " + e.getMessage()));
        }
    }
}