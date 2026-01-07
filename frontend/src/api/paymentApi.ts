import axiosClient from './axiosClient';
import { PaymentRequest } from './types';

/**
 * Stripe Payment Intent Response
 * Matches Stripe SDK PaymentIntent type
 */
export interface StripePaymentIntent {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_received: number;
  application: string | null;
  application_fee_amount: number | null;
  canceled_at: number | null;
  cancellation_reason: string | null;
  capture_method: string;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  invoice: string | null;
  last_payment_error: any | null;
  livemode: boolean;
  metadata: Record<string, string>;
  next_action: any | null;
  on_behalf_of: string | null;
  payment_method: string | null;
  payment_method_types: string[];
  processing: any | null;
  receipt_email: string | null;
  review: string | null;
  setup_future_usage: string | null;
  shipping: any | null;
  source: string | null;
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer_data: any | null;
  transfer_group: string | null;
}

/**
 * Payment API
 * Handles Stripe payment integration
 * All endpoints return data directly (ApiResponse wrapper handled by axios interceptor)
 */
export const paymentApi = {
  /**
   * Create Stripe payment intent
   * POST /payments/create-intent
   */
  createPaymentIntent: async (paymentRequest: PaymentRequest): Promise<StripePaymentIntent> => {
    const response = await axiosClient.post<StripePaymentIntent>(
      '/payments/create-intent',
      paymentRequest
    );
    return response.data;
  },

  /**
   * Confirm payment
   * POST /payments/confirm?paymentIntentId={id}
   */
  confirmPayment: async (paymentIntentId: string): Promise<StripePaymentIntent> => {
    const response = await axiosClient.post<StripePaymentIntent>(
      '/payments/confirm',
      null,
      { params: { paymentIntentId } }
    );
    return response.data;
  },

  /**
   * Webhook endpoint (handled by backend directly, not called from frontend)
   * POST /payments/webhook
   * Note: This is for backend-to-backend communication with Stripe
   */
};

