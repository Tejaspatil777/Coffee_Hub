package com.coffeehub.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_item_modifiers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemModifier {
    @Id
    @ManyToOne
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    @Id
    @ManyToOne
    @JoinColumn(name = "modifier_id")
    private Modifier modifier;

    @Column(name = "modifier_name", nullable = false)
    private String modifierName;

    @Column(name = "price_adjustment", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAdjustment;
}