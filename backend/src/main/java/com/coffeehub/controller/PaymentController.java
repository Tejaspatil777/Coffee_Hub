package com.coffeehub.controller;

import com.coffeehub.dto.request.PaymentRequest;
import com.coffeehub.dto.response.ApiResponse;
import com.coffeehub.service.PaymentService;
import com.coffeehub.service.StripeWebhookService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private StripeWebhookService stripeWebhookService;

    @PostMapping("/create-intent")
    public ResponseEntity<ApiResponse<PaymentIntent>> createPaymentIntent(@RequestBody PaymentRequest paymentRequest) {
        logger.info("Creating payment intent for order: {}", paymentRequest.getOrderId());

        try {
            PaymentIntent paymentIntent = paymentService.createPaymentIntent(paymentRequest);
            return ResponseEntity.ok(ApiResponse.success("Payment intent created successfully", paymentIntent));
        } catch (StripeException e) {
            logger.error("Stripe error creating payment intent for order: {}", paymentRequest.getOrderId(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Stripe error: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating payment intent for order: {}", paymentRequest.getOrderId(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating payment intent: " + e.getMessage()));
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<PaymentIntent>> confirmPayment(@RequestParam String paymentIntentId) {
        logger.info("Confirming payment intent: {}", paymentIntentId);

        try {
            PaymentIntent paymentIntent = paymentService.confirmPayment(paymentIntentId);
            return ResponseEntity.ok(ApiResponse.success("Payment confirmed successfully", paymentIntent));
        } catch (StripeException e) {
            logger.error("Stripe error confirming payment intent: {}", paymentIntentId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Stripe error: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error confirming payment intent: {}", paymentIntentId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error confirming payment: " + e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        logger.info("Received Stripe webhook");

        try {
            stripeWebhookService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok().body("Webhook processed successfully");
        } catch (Exception e) {
            logger.error("Error processing Stripe webhook", e);
            return ResponseEntity.badRequest().body("Error processing webhook: " + e.getMessage());
        }
    }
}