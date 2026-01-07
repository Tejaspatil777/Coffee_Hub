-- Ensure order_id columns match orders.id (VARCHAR(50)) and constraints are compatible

-- order_items
ALTER TABLE order_items DROP FOREIGN KEY IF EXISTS fk_order_items_order;
ALTER TABLE order_items DROP FOREIGN KEY IF EXISTS FKnmcbg3mmbt8wfva97ra40nmp3;
ALTER TABLE order_items MODIFY order_id VARCHAR(50) NOT NULL;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- order_status_history
ALTER TABLE order_status_history DROP FOREIGN KEY IF EXISTS fk_order_status_history_order;
ALTER TABLE order_status_history DROP FOREIGN KEY IF EXISTS FKnmcbg3mmbt8wfva97ra40nmp3;
ALTER TABLE order_status_history MODIFY order_id VARCHAR(50) NOT NULL;
ALTER TABLE order_status_history ADD CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- payments
ALTER TABLE payments DROP FOREIGN KEY IF EXISTS fk_payments_order;
ALTER TABLE payments DROP FOREIGN KEY IF EXISTS FKnmcbg3mmbt8wfva97ra40nmp3;
ALTER TABLE payments MODIFY order_id VARCHAR(50) NOT NULL;
ALTER TABLE payments ADD CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
