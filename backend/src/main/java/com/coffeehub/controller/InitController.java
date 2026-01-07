package com.coffeehub.controller;

import com.coffeehub.dto.response.ApiResponse;
import com.coffeehub.entity.RestaurantTable;
import com.coffeehub.entity.Category;
import com.coffeehub.entity.MenuItem;
import com.coffeehub.repository.RestaurantTableRepository;
import com.coffeehub.repository.CategoryRepository;
import com.coffeehub.repository.MenuItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/init")
public class InitController {

    private static final Logger logger = LoggerFactory.getLogger(InitController.class);

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @PostMapping("/seed-tables")
    public ResponseEntity<ApiResponse<String>> seedTables() {
        logger.info("Seeding tables...");

        try {
            // Check if tables already exist
            long tableCount = tableRepository.count();
            if (tableCount > 0) {
                return ResponseEntity.ok(ApiResponse.success("Tables already exist in database (" + tableCount + " tables)"));
            }

            // Create 15 test tables
            List<RestaurantTable> tables = new ArrayList<>();

            // 2-seat tables
            for (int i = 1; i <= 5; i++) {
                RestaurantTable table = new RestaurantTable();
                table.setTableNumber("T" + i);
                table.setCapacity(2);
                table.setStatus(RestaurantTable.TableStatus.AVAILABLE);
                tables.add(table);
            }

            // 4-seat tables
            for (int i = 6; i <= 10; i++) {
                RestaurantTable table = new RestaurantTable();
                table.setTableNumber("T" + i);
                table.setCapacity(4);
                table.setStatus(RestaurantTable.TableStatus.AVAILABLE);
                tables.add(table);
            }

            // 6-seat tables
            for (int i = 11; i <= 13; i++) {
                RestaurantTable table = new RestaurantTable();
                table.setTableNumber("T" + i);
                table.setCapacity(6);
                table.setStatus(RestaurantTable.TableStatus.AVAILABLE);
                tables.add(table);
            }

            // 8-seat tables
            for (int i = 14; i <= 15; i++) {
                RestaurantTable table = new RestaurantTable();
                table.setTableNumber("T" + i);
                table.setCapacity(8);
                table.setStatus(RestaurantTable.TableStatus.AVAILABLE);
                tables.add(table);
            }

            tableRepository.saveAll(tables);

            logger.info("Successfully seeded {} tables", tables.size());
            return ResponseEntity.ok(ApiResponse.success("Successfully seeded " + tables.size() + " tables into database"));
        } catch (Exception e) {
            logger.error("Error seeding tables", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error seeding tables: " + e.getMessage()));
        }
    }

    @PostMapping("/seed-menu")
    public ResponseEntity<ApiResponse<String>> seedMenu() {
        logger.info("Seeding menu items...");

        try {
            // Check if menu items already exist
            long itemCount = menuItemRepository.count();
            if (itemCount > 0) {
                return ResponseEntity.ok(ApiResponse.success("Menu items already exist in database (" + itemCount + " items)"));
            }

            List<MenuItem> items = new ArrayList<>();

            // Create/get categories
            Category coffeeCategory = new Category();
            coffeeCategory.setName("Coffee");
            coffeeCategory.setDescription("Premium coffee beverages");
            coffeeCategory = categoryRepository.save(coffeeCategory);

            Category pastryCategory = new Category();
            pastryCategory.setName("Pastries");
            pastryCategory.setDescription("Fresh baked pastries and desserts");
            pastryCategory = categoryRepository.save(pastryCategory);

            Category snacksCategory = new Category();
            snacksCategory.setName("Snacks");
            snacksCategory.setDescription("Savory snacks and light bites");
            snacksCategory = categoryRepository.save(snacksCategory);

            // Coffee items
            MenuItem espresso = new MenuItem();
            espresso.setName("Espresso");
            espresso.setDescription("Rich and bold espresso shot");
            espresso.setPrice(new BigDecimal("2.50"));
            espresso.setCategory(coffeeCategory);
            espresso.setAvailable(true);
            items.add(espresso);

            MenuItem cappuccino = new MenuItem();
            cappuccino.setName("Cappuccino");
            cappuccino.setDescription("Espresso with steamed milk and foam");
            cappuccino.setPrice(new BigDecimal("3.50"));
            cappuccino.setCategory(coffeeCategory);
            cappuccino.setAvailable(true);
            items.add(cappuccino);

            MenuItem latte = new MenuItem();
            latte.setName("Latte");
            latte.setDescription("Smooth espresso with lots of steamed milk");
            latte.setPrice(new BigDecimal("3.75"));
            latte.setCategory(coffeeCategory);
            latte.setAvailable(true);
            items.add(latte);

            MenuItem americano = new MenuItem();
            americano.setName("Americano");
            americano.setDescription("Espresso diluted with hot water");
            americano.setPrice(new BigDecimal("2.75"));
            americano.setCategory(coffeeCategory);
            americano.setAvailable(true);
            items.add(americano);

            // Pastry items
            MenuItem croissant = new MenuItem();
            croissant.setName("Croissant");
            croissant.setDescription("Buttery French croissant");
            croissant.setPrice(new BigDecimal("3.00"));
            croissant.setCategory(pastryCategory);
            croissant.setAvailable(true);
            items.add(croissant);

            MenuItem muffin = new MenuItem();
            muffin.setName("Chocolate Muffin");
            muffin.setDescription("Delicious chocolate muffin");
            muffin.setPrice(new BigDecimal("2.75"));
            muffin.setCategory(pastryCategory);
            muffin.setAvailable(true);
            items.add(muffin);

            MenuItem cheesecake = new MenuItem();
            cheesecake.setName("Cheesecake");
            cheesecake.setDescription("Rich and creamy cheesecake");
            cheesecake.setPrice(new BigDecimal("4.50"));
            cheesecake.setCategory(pastryCategory);
            cheesecake.setAvailable(true);
            items.add(cheesecake);

            // Snack items
            MenuItem sandwich = new MenuItem();
            sandwich.setName("Club Sandwich");
            sandwich.setDescription("Classic triple layer sandwich");
            sandwich.setPrice(new BigDecimal("6.50"));
            sandwich.setCategory(snacksCategory);
            sandwich.setAvailable(true);
            items.add(sandwich);

            MenuItem quiche = new MenuItem();
            quiche.setName("Spinach Quiche");
            quiche.setDescription("Savory quiche with fresh spinach");
            quiche.setPrice(new BigDecimal("5.75"));
            quiche.setCategory(snacksCategory);
            quiche.setAvailable(true);
            items.add(quiche);

            menuItemRepository.saveAll(items);

            logger.info("Successfully seeded {} menu items", items.size());
            return ResponseEntity.ok(ApiResponse.success("Successfully seeded " + items.size() + " menu items into database"));
        } catch (Exception e) {
            logger.error("Error seeding menu", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error seeding menu: " + e.getMessage()));
        }
    }
}
