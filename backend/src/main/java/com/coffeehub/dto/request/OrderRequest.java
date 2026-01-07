package com.coffeehub.dto.request;

import com.coffeehub.entity.Order;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private Long tableId;

    @NotNull
    private Order.OrderType orderType;

    @NotNull
    private Order.PaymentMethod paymentMethod;

    private String specialInstructions;

    private String stripePaymentIntentId;

    private List<CartItemRequest> items;

    private BigDecimal totalAmount;
}