package com.coffeehub.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeWebhookService {

    private static final Logger logger = LoggerFactory.getLogger(StripeWebhookService.class);

    @Autowired
    private PaymentService paymentService;

    @Value("${app.stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    public void handleWebhook(String payload, String sigHeader) {
        logger.info("Processing Stripe webhook");

        Stripe.apiKey = stripeSecretKey;

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            logger.info("Webhook event received: {} - {}", event.getType(), event.getId());
        } catch (SignatureVerificationException e) {
            logger.error("Invalid webhook signature: {}", e.getMessage());
            throw new RuntimeException("Invalid webhook signature", e);
        } catch (Exception e) {
            logger.error("Error processing webhook: {}", e.getMessage());
            throw new RuntimeException("Error processing webhook", e);
        }

        // Deserialize the nested object inside the event
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

        if (dataObjectDeserializer.getObject().isPresent()) {
            Object stripeObject = dataObjectDeserializer.getObject().get();

            switch (event.getType()) {
                case "payment_intent.succeeded":
                    PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
                    handlePaymentIntentSucceeded(paymentIntent);
                    break;

                case "payment_intent.payment_failed":
                    PaymentIntent failedPaymentIntent = (PaymentIntent) stripeObject;
                    handlePaymentIntentFailed(failedPaymentIntent);
                    break;

                case "payment_intent.canceled":
                    PaymentIntent canceledPaymentIntent = (PaymentIntent) stripeObject;
                    handlePaymentIntentCanceled(canceledPaymentIntent);
                    break;

                default:
                    logger.info("Unhandled event type: {}", event.getType());
            }
        } else {
            logger.warn("Webhook payload deserialization failed for event: {}", event.getType());
        }
    }

    private void handlePaymentIntentSucceeded(PaymentIntent paymentIntent) {
        logger.info("Handling successful payment intent: {}", paymentIntent.getId());
        paymentService.handleWebhookPaymentSuccess(paymentIntent.getId());
    }

    private void handlePaymentIntentFailed(PaymentIntent paymentIntent) {
        logger.warn("Payment failed for intent: {}, failure message: {}",
                paymentIntent.getId(), paymentIntent.getLastPaymentError().getMessage());

        // Update order status to payment failed
        // This would be implemented similarly to handlePaymentIntentSucceeded
    }

    private void handlePaymentIntentCanceled(PaymentIntent paymentIntent) {
        logger.info("Payment canceled for intent: {}", paymentIntent.getId());

        // Update order status to canceled
        // This would be implemented similarly to handlePaymentIntentSucceeded
    }
}