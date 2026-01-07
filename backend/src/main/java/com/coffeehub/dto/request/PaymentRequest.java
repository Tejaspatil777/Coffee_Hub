package com.coffeehub.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull
    private Long orderId;

    @NotNull
    @Positive
    private BigDecimal amount;

    private String paymentMethodId;

    private String currency = "USD";
}