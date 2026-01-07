-- Insert users
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@coffeehub.com', '$2a$10$ABC123def456ghI789JKLmnoPQRSTuvwxyzABCDEFGHIJKLMNOPQ', 'Admin', 'User', 'ADMIN'),
('chef@coffeehub.com', '$2a$10$ABC123def456ghI789JKLmnoPQRSTuvwxyzABCDEFGHIJKLMNOPQ', 'Master', 'Chef', 'CHEF'),
('waiter@coffeehub.com', '$2a$10$ABC123def456ghI789JKLmnoPQRSTuvwxyzABCDEFGHIJKLMNOPQ', 'Service', 'Staff', 'WAITER'),
('user@coffeehub.com', '$2a$10$ABC123def456ghI789JKLmnoPQRSTuvwxyzABCDEFGHIJKLMNOPQ', 'Regular', 'Customer', 'CUSTOMER');

-- Insert categories
INSERT INTO categories (name, description, display_order) VALUES
('Coffee', 'Freshly brewed coffee and espresso drinks', 1),
('Tea', 'Premium loose leaf teas', 2),
('Pastries', 'Freshly baked pastries and desserts', 3),
('Sandwiches', 'Hot and cold sandwiches', 4),
('Smoothies', 'Fresh fruit smoothies', 5);

-- Insert modifiers
INSERT INTO modifiers (name, type, price_adjustment) VALUES
('Small', 'SIZE', -1.00),
('Medium', 'SIZE', 0.00),
('Large', 'SIZE', 1.50),
('Extra Shot', 'ADDON', 1.00),
('Almond Milk', 'MILK', 0.75),
('Oat Milk', 'MILK', 0.75),
('Soy Milk', 'MILK', 0.75),
('Whipped Cream', 'ADDON', 0.50),
('Extra Sweet', 'SWEETNESS', 0.00),
('Less Sweet', 'SWEETNESS', 0.00);

-- Insert menu items
INSERT INTO menu_items (name, description, price, category_id, preparation_time) VALUES
('Espresso', 'Strong black coffee shot', 3.50, 1, 3),
('Cappuccino', 'Espresso with steamed milk foam', 4.50, 1, 5),
('Latte', 'Espresso with steamed milk', 5.00, 1, 5),
('Americano', 'Espresso with hot water', 4.00, 1, 4),
('Green Tea', 'Premium Japanese green tea', 3.00, 2, 3),
('Chai Latte', 'Spiced tea with steamed milk', 4.50, 2, 5),
('Croissant', 'Buttery French croissant', 3.50, 3, 2),
('Chocolate Muffin', 'Fresh baked chocolate muffin', 4.00, 3, 2),
('Turkey Sandwich', 'Turkey with lettuce and mayo', 8.50, 4, 8),
('Berry Smoothie', 'Mixed berries with yogurt', 6.50, 5, 5);

-- Associate modifiers with menu items
INSERT INTO menu_item_modifiers (menu_item_id, modifier_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), -- Espresso
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), -- Cappuccino
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), -- Latte
(4, 1), (4, 2), (4, 3), (4, 4), -- Americano
(5, 1), (5, 2), (5, 3), (5, 9), (5, 10), -- Green Tea
(6, 1), (6, 2), (6, 3), (6, 5), (6, 6), (6, 7), (6, 9), (6, 10), -- Chai Latte
(10, 1), (10, 2), (10, 3), (10, 8); -- Berry Smoothie

-- Insert tables
INSERT INTO restaurant_tables (id, table_number, table_token, capacity, status) VALUES
(1, 'T01', 'table01', 4, 'AVAILABLE'),
(2, 'T02', 'table02', 2, 'AVAILABLE'),
(3, 'T03', 'table03', 6, 'AVAILABLE'),
(4, 'T04', 'table04', 4, 'AVAILABLE'),
(5, 'T05', 'table05', 2, 'MAINTENANCE');
