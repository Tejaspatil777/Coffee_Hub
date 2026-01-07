package com.coffeehub.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "special_instructions")
    private String specialInstructions;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToMany
    @JoinTable(
            name = "cart_item_modifiers",
            joinColumns = @JoinColumn(name = "cart_item_id"),
            inverseJoinColumns = @JoinColumn(name = "modifier_id")
    )
    private List<Modifier> modifiers = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // Calculate initial price
        if (price == null && menuItem != null) {
            price = menuItem.getPrice();
        }
    }

    public BigDecimal getTotalPrice() {
        BigDecimal basePrice = price != null ? price : BigDecimal.ZERO;
        BigDecimal modifiersPrice = modifiers.stream()
                .map(Modifier::getPriceAdjustment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return basePrice.add(modifiersPrice).multiply(BigDecimal.valueOf(quantity));
    }
}