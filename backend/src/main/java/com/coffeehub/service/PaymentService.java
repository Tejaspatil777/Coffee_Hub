package com.coffeehub.service;

import com.coffeehub.dto.request.PaymentRequest;
import com.coffeehub.entity.Order;
import com.coffeehub.entity.Payment;
import com.coffeehub.exception.ResourceNotFoundException;
import com.coffeehub.exception.ValidationException;
import com.coffeehub.repository.OrderRepository;
import com.coffeehub.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderService orderService;

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public PaymentIntent createPaymentIntent(PaymentRequest paymentRequest) throws StripeException {
        logger.info("Creating payment intent for order: {}", paymentRequest.getOrderId());

        Stripe.apiKey = stripeSecretKey;

        Order order = orderRepository.findById(String.valueOf(paymentRequest.getOrderId()))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + paymentRequest.getOrderId()));

        // Validate amount
        if (paymentRequest.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new ValidationException("Payment amount does not match order total");
        }

        // Convert amount to cents (Stripe uses smallest currency unit)
        long amountCents = paymentRequest.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(paymentRequest.getCurrency().toLowerCase())
                .setPaymentMethod(paymentRequest.getPaymentMethodId())
                .setConfirm(true)
                .setConfirmationMethod(PaymentIntentCreateParams.ConfirmationMethod.AUTOMATIC)
                .setReturnUrl(frontendUrl + "/order-confirmation?order=" + order.getId())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .putMetadata("order_id", String.valueOf(order.getId()))
                .putMetadata("order_type", order.getOrderType().name())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // Save payment record
        savePaymentRecord(order, paymentIntent);

        logger.info("Payment intent created successfully for order: {}, intent: {}",
                paymentRequest.getOrderId(), paymentIntent.getId());

        return paymentIntent;
    }

    public PaymentIntent confirmPayment(String paymentIntentId) throws StripeException {
        logger.info("Confirming payment intent: {}", paymentIntentId);

        Stripe.apiKey = stripeSecretKey;

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        if ("succeeded".equals(paymentIntent.getStatus())) {
            handleSuccessfulPayment(paymentIntent);
        }

        return paymentIntent;
    }

    public void handleWebhookPaymentSuccess(String paymentIntentId) {
        logger.info("Handling webhook payment success for intent: {}", paymentIntentId);

        try {
            Stripe.apiKey = stripeSecretKey;
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

            if ("succeeded".equals(paymentIntent.getStatus())) {
                handleSuccessfulPayment(paymentIntent);
            }
        } catch (StripeException e) {
            logger.error("Error handling webhook payment success: {}", e.getMessage(), e);
            throw new RuntimeException("Error processing webhook payment", e);
        }
    }

    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
    }

    public Payment getPaymentByIntentId(String paymentIntentId) {
        return paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with intent: " + paymentIntentId));
    }

    // Private helper methods
    private void savePaymentRecord(Order order, PaymentIntent paymentIntent) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setStripePaymentIntentId(paymentIntent.getId());
        payment.setAmount(order.getTotalAmount());
        payment.setCurrency(paymentIntent.getCurrency().toUpperCase());
        payment.setStatus(paymentIntent.getStatus());
        payment.setPaymentMethod(paymentIntent.getPaymentMethodTypes().get(0));

        paymentRepository.save(payment);
    }

    private void handleSuccessfulPayment(PaymentIntent paymentIntent) {
        String orderId = paymentIntent.getMetadata().get("order_id");

        if (orderId == null) {
            logger.error("Order ID not found in payment intent metadata: {}", paymentIntent.getId());
            return;
        }

        try {
            // Update order payment status
            orderService.updatePaymentStatus(orderId, Order.PaymentStatus.PAID, paymentIntent.getId());

            // Update payment record
            Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntent.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found with intent: " + paymentIntent.getId()));

            payment.setStatus("succeeded");
            // Receipt URL would be handled separately or not used from PaymentIntent
            paymentRepository.save(payment);

            logger.info("Payment processed successfully for order: {}, intent: {}", orderId, paymentIntent.getId());

        } catch (Exception e) {
            logger.error("Error updating order payment status for order: {}", orderId, e);
            throw new RuntimeException("Error updating payment status", e);
        }
    }
}