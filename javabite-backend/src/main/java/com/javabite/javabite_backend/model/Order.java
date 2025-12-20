package com.javabite.javabite_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;

@Document(collection = "orders")
public class Order {
    @Id
    private String id;

    private String customerEmail;
    private List<OrderItem> items;
    private double totalPrice;
    private OrderStatus status;
    private String chefId;
    private String waiterId;
    private Instant createdAt;
    private Instant updatedAt;

    // 🔥 NEW FIELDS FOR ORDER LOCKING
    private String lockedByChefId;      // Which chef is currently preparing
    private String lockedByWaiterId;    // Which waiter is currently serving
    private Instant chefLockedAt;       // When chef started preparing
    private Instant waiterLockedAt;     // When waiter started serving
    private boolean chefLocked = false; // Is order locked by chef?
    private boolean waiterLocked = false; // Is order locked by waiter?

    // Constructors
    public Order() {}

    public Order(String customerEmail, List<OrderItem> items, double totalPrice) {
        this.customerEmail = customerEmail;
        this.items = items;
        this.totalPrice = totalPrice;
        this.status = OrderStatus.PENDING;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters and Setters (add new ones)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public String getChefId() { return chefId; }
    public void setChefId(String chefId) { this.chefId = chefId; }

    public String getWaiterId() { return waiterId; }
    public void setWaiterId(String waiterId) { this.waiterId = waiterId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    // 🔥 NEW GETTERS/SETTERS
    public String getLockedByChefId() { return lockedByChefId; }
    public void setLockedByChefId(String lockedByChefId) { this.lockedByChefId = lockedByChefId; }

    public String getLockedByWaiterId() { return lockedByWaiterId; }
    public void setLockedByWaiterId(String lockedByWaiterId) { this.lockedByWaiterId = lockedByWaiterId; }

    public Instant getChefLockedAt() { return chefLockedAt; }
    public void setChefLockedAt(Instant chefLockedAt) { this.chefLockedAt = chefLockedAt; }

    public Instant getWaiterLockedAt() { return waiterLockedAt; }
    public void setWaiterLockedAt(Instant waiterLockedAt) { this.waiterLockedAt = waiterLockedAt; }

    public boolean isChefLocked() { return chefLocked; }
    public void setChefLocked(boolean chefLocked) { this.chefLocked = chefLocked; }

    public boolean isWaiterLocked() { return waiterLocked; }
    public void setWaiterLocked(boolean waiterLocked) { this.waiterLocked = waiterLocked; }
}