package com.javabite.javabite_backend.service;

import com.javabite.javabite_backend.model.Menu;
import com.javabite.javabite_backend.repository.MenuRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuService {
    private final MenuRepository repo;

    public MenuService(MenuRepository repo) {
        this.repo = repo;
    }

    // ✅ Auto-create sample data on startup if empty
    @PostConstruct
    public void initSampleData() {
        try {
            if (repo.count() == 0) {
                System.out.println("Creating sample menu data...");

                List<Menu> sampleItems = List.of(
                        createMenuItem("Espresso", "Strong black coffee", "coffee", 350, "/images/espresso.jpg"),
                        createMenuItem("Cappuccino", "Coffee with steamed milk", "coffee", 450, "/images/cappuccino.jpg"),
                        createMenuItem("Latte", "Creamy coffee drink", "coffee", 500, "/images/latte.jpg")
                );

                repo.saveAll(sampleItems);
                System.out.println("Created " + sampleItems.size() + " sample menu items");
            } else {
                System.out.println("Menu already has " + repo.count() + " items");
            }
        } catch (Exception e) {
            System.err.println("Failed to create sample data: " + e.getMessage());
        }
    }

    // GET ALL MENU ITEMS
    public List<Menu> getAll() {
        return repo.findAll();
    }

    // ADD NEW MENU ITEM
    public Menu addMenu(Menu menu) {
        if (menu.getName() != null && repo.existsByName(menu.getName())) {
            throw new RuntimeException("Menu item with same name already exists");
        }
        return repo.save(menu);
    }

    // UPDATE MENU ITEM
    public Optional<Menu> updateMenu(String id, Menu updatedMenu) {
        Optional<Menu> existingOpt = repo.findById(id);

        if (existingOpt.isEmpty()) {
            return Optional.empty();
        }

        Menu existingMenu = existingOpt.get();

        if (!existingMenu.getName().equalsIgnoreCase(updatedMenu.getName()) &&
                repo.existsByName(updatedMenu.getName())) {
            throw new RuntimeException("Another menu item with the name '" + updatedMenu.getName() + "' already exists.");
        }

        existingMenu.setName(updatedMenu.getName());
        existingMenu.setDescription(updatedMenu.getDescription());
        existingMenu.setPrice(updatedMenu.getPrice());
        existingMenu.setImageUrl(updatedMenu.getImageUrl());
        existingMenu.setAvailable(updatedMenu.isAvailable());
        existingMenu.setCategory(updatedMenu.getCategory());

        return Optional.of(repo.save(existingMenu));
    }

    // DELETE MENU ITEM
    public boolean deleteMenu(String id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return true;
        }
        return false;
    }

    // GET BY ID
    public Optional<Menu> getById(String id) {
        return repo.findById(id);
    }

    private Menu createMenuItem(String name, String desc, String category, int price, String imageUrl) {
        Menu item = new Menu();
        item.setName(name);
        item.setDescription(desc);
        item.setCategory(category);
        item.setPrice(price);
        item.setImageUrl(imageUrl);
        item.setAvailable(true);
        return item;
    }
}