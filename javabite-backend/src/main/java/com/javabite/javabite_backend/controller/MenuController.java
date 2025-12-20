package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Menu;
import com.javabite.javabite_backend.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/menu", "/menu"}) // ✅ Handle BOTH paths
@CrossOrigin(origins = "http://localhost:5173")
public class MenuController {
    private final MenuService service;

    public MenuController(MenuService service) {
        this.service = service;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Menu>> getAll() {
        List<Menu> list = service.getAll();
        return ResponseEntity.ok(list);
    }

    // Admin usage - add new menu item
    @PostMapping("/add")
    public ResponseEntity<Menu> addMenu(@RequestBody Menu menu) {
        Menu saved = service.addMenu(menu);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Menu> updateMenu(@PathVariable String id, @RequestBody Menu menu) {
        return service.updateMenu(id, menu)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable String id) {
        boolean deleted = service.deleteMenu(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/available")
    public ResponseEntity<List<Menu>> getAvailableItems() {
        List<Menu> availableItems = service.getAll().stream()
                .filter(Menu::isAvailable)
                .toList();
        return ResponseEntity.ok(availableItems);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Menu>> getItemsByCategory(@PathVariable String category) {
        List<Menu> categoryItems = service.getAll().stream()
                .filter(item -> item.getCategory() != null &&
                        item.getCategory().equalsIgnoreCase(category))
                .toList();
        return ResponseEntity.ok(categoryItems);
    }

    // ✅ Debug endpoint to test if menu is working
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Menu API is working! Total items: " + service.getAll().size());
    }

    // ✅ Debug endpoint to check database connection
    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debug() {
        List<Menu> allItems = service.getAll();

        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "totalItems", allItems.size(),
                "items", allItems,
                "timestamp", java.time.Instant.now().toString()
        ));
    }

    // ✅ Create sample data endpoint
    @PostMapping("/create-sample")
    public ResponseEntity<Map<String, Object>> createSampleMenu() {
        try {
            // Sample menu items
            List<Menu> sampleItems = List.of(
                    createMenuItem("Espresso", "Strong black coffee", "coffee", 350, "/images/espresso.jpg"),
                    createMenuItem("Cappuccino", "Coffee with steamed milk foam", "coffee", 450, "/images/cappuccino.jpg"),
                    createMenuItem("Latte", "Coffee with lots of steamed milk", "coffee", 500, "/images/latte.jpg"),
                    createMenuItem("Croissant", "Buttery French pastry", "pastry", 250, "/images/croissant.jpg"),
                    createMenuItem("Green Tea", "Healthy green tea", "tea", 300, "/images/green-tea.jpg"),
                    createMenuItem("Americano", "Espresso with hot water", "coffee", 400, "/images/americano.jpg"),
                    createMenuItem("Mocha", "Coffee with chocolate", "coffee", 550, "/images/mocha.jpg")
            );

            // Save all items
            for (Menu item : sampleItems) {
                service.addMenu(item);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Sample menu created successfully",
                    "count", sampleItems.size(),
                    "timestamp", java.time.Instant.now().toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to create sample menu",
                    "message", e.getMessage()
            ));
        }
    }

    private Menu createMenuItem(String name, String description, String category, int price, String imageUrl) {
        Menu item = new Menu();
        item.setName(name);
        item.setDescription(description);
        item.setCategory(category);
        item.setPrice(price);
        item.setImageUrl(imageUrl);
        item.setAvailable(true);
        return item;
    }
}