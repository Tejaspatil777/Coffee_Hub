-- Additional modifiers for more customization
INSERT INTO modifiers (name, type, price_adjustment) VALUES
('Vanilla Syrup', 'ADDON', 0.50),
('Caramel Syrup', 'ADDON', 0.50),
('Hazelnut Syrup', 'ADDON', 0.50),
('Ice', 'ADDON', 0.00),
('No Ice', 'ADDON', 0.00),
('Extra Hot', 'ADDON', 0.00);

-- Associate new modifiers with relevant items
INSERT INTO menu_item_modifiers (menu_item_id, modifier_id) VALUES
(2, 11), (2, 12), (2, 13), -- Cappuccino syrups
(3, 11), (3, 12), (3, 13), -- Latte syrups
(6, 11), (6, 12), (6, 13), -- Chai Latte syrups
(10, 14), (10, 15); -- Smoothie ice options

-- Add temperature modifiers to hot drinks
INSERT INTO menu_item_modifiers (menu_item_id, modifier_id) VALUES
(2, 16), (3, 16), (6, 16); -- Extra hot option