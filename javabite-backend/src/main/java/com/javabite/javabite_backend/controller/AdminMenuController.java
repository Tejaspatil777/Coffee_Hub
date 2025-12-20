package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.Menu;
import com.javabite.javabite_backend.service.MenuService; // 🔥 Use Service

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/menu")
public class AdminMenuController {

    private final MenuService menuService; // 🔥 Inject MenuService

    // ADD NEW MENU ITEM
    @PostMapping("/add")
    public ResponseEntity<?> addMenu(@RequestBody Menu menu) {
        try {
            // Delegate to service for business logic (name check)
            return ResponseEntity.ok(menuService.addMenu(menu));
        } catch (RuntimeException e) {
            // Catch name collision
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // VIEW ALL MENU ITEMS
    @GetMapping("/all")
    public ResponseEntity<?> getAllMenu() {
        return ResponseEntity.ok(menuService.getAll());
    }

    // UPDATE MENU ITEM
    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Menu updated) {
        try {
            Optional<Menu> updatedMenu = menuService.updateMenu(id, updated); // 🔥 Delegate to service

            if (updatedMenu.isEmpty()) {
                return ResponseEntity.badRequest().body("Menu item not found!");
            }

            return ResponseEntity.ok("Menu updated successfully!");
        } catch (RuntimeException e) {
            // Catch name collision from service
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE MENU ITEM
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        // 🔥 Delegate to service
        if (menuService.deleteMenu(id)) {
            return ResponseEntity.ok("Menu item deleted successfully!");
        }
        return ResponseEntity.badRequest().body("Menu item not found!");
    }
}