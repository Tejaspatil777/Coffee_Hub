package com.coffeehub.service;

import com.coffeehub.dto.request.MenuItemImportRequest;
import com.coffeehub.dto.response.CategoryResponse;
import com.coffeehub.dto.response.MenuItemResponse;
import com.coffeehub.dto.response.MenuImportSummary;
import com.coffeehub.dto.response.ModifierResponse;
import com.coffeehub.entity.Category;
import com.coffeehub.entity.MenuItem;
import com.coffeehub.entity.Modifier;
import com.coffeehub.exception.ResourceNotFoundException;
import com.coffeehub.repository.CategoryRepository;
import com.coffeehub.repository.MenuItemRepository;
import com.coffeehub.repository.ModifierRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MenuService {

    private static final Logger logger = LoggerFactory.getLogger(MenuService.class);

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ModifierRepository modifierRepository;

    // Category Methods
    public List<CategoryResponse> getAllCategories() {
        logger.info("Fetching all active categories");
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        logger.info("Fetching category by id: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return convertToCategoryResponse(category);
    }

    public CategoryResponse createCategory(Category category) {
        logger.info("Creating new category: {}", category.getName());

        if (categoryRepository.existsByNameAndIdNot(category.getName(), 0L)) {
            throw new IllegalArgumentException("Category with name '" + category.getName() + "' already exists");
        }

        Category savedCategory = categoryRepository.save(category);
        logger.info("Category created successfully with id: {}", savedCategory.getId());
        return convertToCategoryResponse(savedCategory);
    }

    public CategoryResponse updateCategory(Long id, Category categoryDetails) {
        logger.info("Updating category with id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (categoryRepository.existsByNameAndIdNot(categoryDetails.getName(), id)) {
            throw new IllegalArgumentException("Category with name '" + categoryDetails.getName() + "' already exists");
        }

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setImageUrl(categoryDetails.getImageUrl());
        category.setDisplayOrder(categoryDetails.getDisplayOrder());
        category.setActive(categoryDetails.getActive());

        Category updatedCategory = categoryRepository.save(category);
        logger.info("Category updated successfully with id: {}", id);
        return convertToCategoryResponse(updatedCategory);
    }

    public void deleteCategory(Long id) {
        logger.info("Deleting category with id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Check if category has menu items
        long itemCount = menuItemRepository.countByCategoryId(id);
        if (itemCount > 0) {
            throw new IllegalStateException("Cannot delete category with existing menu items");
        }

        categoryRepository.delete(category);
        logger.info("Category deleted successfully with id: {}", id);
    }

    // Menu Item Methods
    public List<MenuItemResponse> getAllMenuItems() {
        logger.info("Fetching all available menu items");
        return menuItemRepository.findAvailableMenuItemsWithActiveCategory().stream()
                .map(this::convertToMenuItemResponse)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getMenuItemsByCategory(Long categoryId) {
        logger.info("Fetching menu items for category id: {}", categoryId);
        return menuItemRepository.findByCategoryIdAndAvailableTrue(categoryId).stream()
                .map(this::convertToMenuItemResponse)
                .collect(Collectors.toList());
    }

    public MenuItemResponse getMenuItemById(Long id) {
        logger.info("Fetching menu item by id: {}", id);
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
        return convertToMenuItemResponse(menuItem);
    }

    public MenuItemResponse createMenuItem(MenuItem menuItem) {
        logger.info("Creating new menu item: {}", menuItem.getName());

        // Verify category exists
        categoryRepository.findById(menuItem.getCategory().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + menuItem.getCategory().getId()));

        if (menuItemRepository.existsByNameAndCategoryIdAndIdNot(menuItem.getName(), menuItem.getCategory().getId(), 0L)) {
            throw new IllegalArgumentException("Menu item with name '" + menuItem.getName() + "' already exists in this category");
        }

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        logger.info("Menu item created successfully with id: {}", savedMenuItem.getId());
        return convertToMenuItemResponse(savedMenuItem);
    }

    public MenuItemResponse updateMenuItem(Long id, MenuItem menuItemDetails) {
        logger.info("Updating menu item with id: {}", id);

        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        // Verify category exists if changed
        if (!menuItem.getCategory().getId().equals(menuItemDetails.getCategory().getId())) {
            categoryRepository.findById(menuItemDetails.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + menuItemDetails.getCategory().getId()));
        }

        if (menuItemRepository.existsByNameAndCategoryIdAndIdNot(menuItemDetails.getName(), menuItemDetails.getCategory().getId(), id)) {
            throw new IllegalArgumentException("Menu item with name '" + menuItemDetails.getName() + "' already exists in this category");
        }

        menuItem.setName(menuItemDetails.getName());
        menuItem.setDescription(menuItemDetails.getDescription());
        menuItem.setPrice(menuItemDetails.getPrice());
        menuItem.setImageUrl(menuItemDetails.getImageUrl());
        menuItem.setCategory(menuItemDetails.getCategory());
        menuItem.setAvailable(menuItemDetails.getAvailable());
        menuItem.setPreparationTime(menuItemDetails.getPreparationTime());
        menuItem.setModifiers(menuItemDetails.getModifiers());

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        logger.info("Menu item updated successfully with id: {}", id);
        return convertToMenuItemResponse(updatedMenuItem);
    }

    public void deleteMenuItem(Long id) {
        logger.info("Deleting menu item with id: {}", id);

        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        menuItemRepository.delete(menuItem);
        logger.info("Menu item deleted successfully with id: {}", id);
    }

    public List<MenuItemResponse> searchMenuItems(String query, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice) {
        logger.info("Searching menu items with query: {}, category: {}, price range: {}-{}",
                query, categoryId, minPrice, maxPrice);

        return menuItemRepository.findWithFilters(categoryId, true, minPrice, maxPrice, query).stream()
                .map(this::convertToMenuItemResponse)
                .collect(Collectors.toList());
    }

    // Modifier Methods
    public List<ModifierResponse> getAllModifiers() {
        logger.info("Fetching all available modifiers");
        return modifierRepository.findByAvailableTrue().stream()
                .map(this::convertToModifierResponse)
                .collect(Collectors.toList());
    }

    public List<ModifierResponse> getModifiersByType(Modifier.ModifierType type) {
        logger.info("Fetching modifiers by type: {}", type);
        return modifierRepository.findByTypeAndAvailableTrue(type).stream()
                .map(this::convertToModifierResponse)
                .collect(Collectors.toList());
    }

    public ModifierResponse createModifier(Modifier modifier) {
        logger.info("Creating new modifier: {}", modifier.getName());

        if (modifierRepository.existsByNameAndTypeAndIdNot(modifier.getName(), modifier.getType(), 0L)) {
            throw new IllegalArgumentException("Modifier with name '" + modifier.getName() + "' and type '" + modifier.getType() + "' already exists");
        }

        Modifier savedModifier = modifierRepository.save(modifier);
        logger.info("Modifier created successfully with id: {}", savedModifier.getId());
        return convertToModifierResponse(savedModifier);
    }

    // ==================== MENU IMPORT ====================

    /**
     * 📥 IMPORT MENU ITEMS FROM FRONTEND
     * ✅ One-time admin-only operation
     * ✅ Creates missing categories automatically
     * ✅ Skips duplicate items (by name + category)
     * ✅ Backend generates all IDs
     * ✅ Safe and idempotent
     */
    public MenuImportSummary importMenuItems(List<MenuItemImportRequest> importRequests) {
        logger.info("Starting menu import for {} items", importRequests.size());

        if (importRequests == null || importRequests.isEmpty()) {
            logger.warn("No menu items provided for import");
            return MenuImportSummary.empty();
        }

        long itemsCreated = 0;
        long itemsSkipped = 0;
        long categoriesCreated = 0;

        for (MenuItemImportRequest request : importRequests) {
            try {
                // Step 1: Get or create category
                Category category = getOrCreateCategory(request.getCategory());
                if (category.getId() == null) {
                    categoriesCreated++;
                }

                // Step 2: Check if item already exists (by name + category)
                List<MenuItem> existingItems = menuItemRepository.findByCategoryId(category.getId());
                boolean itemExists = existingItems.stream()
                        .anyMatch(item -> item.getName().equalsIgnoreCase(request.getName()));

                if (itemExists) {
                    logger.info("Skipping duplicate item: {} in category: {}", 
                            request.getName(), request.getCategory());
                    itemsSkipped++;
                    continue;
                }

                // Step 3: Create new menu item (NO ID from frontend)
                MenuItem menuItem = new MenuItem();
                menuItem.setName(request.getName());
                menuItem.setDescription(request.getDescription());
                menuItem.setPrice(request.getPrice());
                menuItem.setImageUrl(request.getImageUrl());
                menuItem.setCategory(category);
                menuItem.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);
                menuItem.setPreparationTime(request.getPreparationTime() != null ? request.getPreparationTime() : 10);

                menuItemRepository.save(menuItem);
                itemsCreated++;
                logger.info("Created menu item: {} with ID: {}", request.getName(), menuItem.getId());

            } catch (Exception e) {
                logger.error("Error importing item: {}", request.getName(), e);
                // Continue with next item instead of failing entire import
            }
        }

        logger.info("Menu import completed: {} created, {} skipped, {} categories created",
                itemsCreated, itemsSkipped, categoriesCreated);

        return MenuImportSummary.success(
                (long) importRequests.size(),
                itemsCreated,
                itemsSkipped,
                categoriesCreated
        );
    }

    /**
     * 🔧 GET OR CREATE CATEGORY
     * Helper method that finds existing category or creates new one
     */
    private Category getOrCreateCategory(String categoryName) {
        logger.debug("Looking up category: {}", categoryName);

        // Check if category already exists
        return categoryRepository.findByName(categoryName)
                .orElseGet(() -> {
                    logger.info("Category not found, creating new: {}", categoryName);
                    Category newCategory = new Category();
                    newCategory.setName(categoryName);
                    newCategory.setActive(true);
                    newCategory.setDisplayOrder(0);
                    return categoryRepository.save(newCategory);
                });
    }

    // Response Conversion Methods
    private CategoryResponse convertToCategoryResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setImageUrl(category.getImageUrl());
        response.setDisplayOrder(category.getDisplayOrder());
        response.setActive(category.getActive());
        response.setCreatedAt(category.getCreatedAt());
        return response;
    }

    private MenuItemResponse convertToMenuItemResponse(MenuItem menuItem) {
        MenuItemResponse response = new MenuItemResponse();
        response.setId(menuItem.getId());
        response.setName(menuItem.getName());
        response.setDescription(menuItem.getDescription());
        response.setPrice(menuItem.getPrice());
        response.setImageUrl(menuItem.getImageUrl());
        response.setCategory(convertToCategoryResponse(menuItem.getCategory()));
        response.setAvailable(menuItem.getAvailable());
        response.setPreparationTime(menuItem.getPreparationTime());
        response.setCreatedAt(menuItem.getCreatedAt());
        response.setModifiers(menuItem.getModifiers().stream()
                .map(this::convertToModifierResponse)
                .collect(Collectors.toList()));
        return response;
    }

    private ModifierResponse convertToModifierResponse(Modifier modifier) {
        ModifierResponse response = new ModifierResponse();
        response.setId(modifier.getId());
        response.setName(modifier.getName());
        response.setType(modifier.getType());
        response.setPriceAdjustment(modifier.getPriceAdjustment());
        response.setAvailable(modifier.getAvailable());
        response.setCreatedAt(modifier.getCreatedAt());
        return response;
    }
}