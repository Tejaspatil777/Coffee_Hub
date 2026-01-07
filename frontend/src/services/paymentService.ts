import api from './api';
import { createCustomerNotification } from './customerNotificationService';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'CASH' | 'WALLET';
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  };
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Payment Methods for LocalStorage
export type PaymentMode = 'UPI' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'NET_BANKING' | 'PHONEPE' | 'GOOGLE_PAY' | 'PAYTM' | 'CASH_ON_DELIVERY';
export type PaymentStatus = 'PAID' | 'PENDING_REFUND' | 'REFUNDED' | 'FAILED';

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  bookingId?: string;
  orderId?: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  tableNumber?: string;
  locationName?: string;
  createdAt: string;
  updatedAt: string;
  refundedAt?: string;
  refundReason?: string;
  items?: any[]; // Order items for reference
}

// ========== LocalStorage Payment Functions ==========

// Generate unique transaction ID
export function generateTransactionId(): string {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Get all payment transactions
export function getAllPaymentTransactions(): PaymentTransaction[] {
  const payments = localStorage.getItem('paymentTransactions');
  return payments ? JSON.parse(payments) : [];
}

// Get payment transactions by customer ID
export function getPaymentsByCustomer(customerId: string): PaymentTransaction[] {
  const payments = getAllPaymentTransactions();
  return payments.filter(p => p.customerId === customerId);
}

// Get payment by ID
export function getPaymentById(paymentId: string): PaymentTransaction | null {
  const payments = getAllPaymentTransactions();
  return payments.find(p => p.id === paymentId) || null;
}

// Get payment by transaction ID
export function getPaymentByTransactionId(transactionId: string): PaymentTransaction | null {
  const payments = getAllPaymentTransactions();
  return payments.find(p => p.transactionId === transactionId) || null;
}

// Get payment by order ID
export function getPaymentByOrderId(orderId: string): PaymentTransaction | null {
  const payments = getAllPaymentTransactions();
  return payments.find(p => p.orderId === orderId) || null;
}

// Get payments by booking ID
export function getPaymentsByBookingId(bookingId: string): PaymentTransaction[] {
  const payments = getAllPaymentTransactions();
  return payments.filter(p => p.bookingId === bookingId);
}

// Create new payment transaction
export function createPaymentTransaction(
  paymentData: Omit<PaymentTransaction, 'id' | 'transactionId' | 'createdAt' | 'updatedAt'>
): PaymentTransaction {
  const payments = getAllPaymentTransactions();
  
  const newPayment: PaymentTransaction = {
    ...paymentData,
    id: 'PAY' + Date.now() + Math.random().toString(36).substr(2, 9),
    transactionId: generateTransactionId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  payments.unshift(newPayment); // Add to beginning
  localStorage.setItem('paymentTransactions', JSON.stringify(payments));
  
  // Create customer notification for successful payment
  createCustomerNotification({
    customerId: paymentData.customerId,
    type: 'INFO',
    title: '✅ Payment Successful',
    message: `Payment of $${paymentData.amount.toFixed(2)} completed via ${formatPaymentMode(paymentData.paymentMode)}. Transaction ID: ${newPayment.transactionId}`,
    data: {
      paymentId: newPayment.id,
      transactionId: newPayment.transactionId,
      amount: paymentData.amount,
      paymentMode: paymentData.paymentMode,
    }
  });
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('paymentCreated', { detail: newPayment }));
  
  return newPayment;
}

// Update payment status
export function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  refundReason?: string
): PaymentTransaction | null {
  const payments = getAllPaymentTransactions();
  const index = payments.findIndex(p => p.id === paymentId);
  
  if (index === -1) return null;
  
  const payment = payments[index];
  const oldStatus = payment.paymentStatus;
  
  payment.paymentStatus = status;
  payment.updatedAt = new Date().toISOString();
  
  if (refundReason) {
    payment.refundReason = refundReason;
  }
  
  if (status === 'REFUNDED') {
    payment.refundedAt = new Date().toISOString();
  }
  
  payments[index] = payment;
  localStorage.setItem('paymentTransactions', JSON.stringify(payments));
  
  // Create customer notification based on status change
  if (oldStatus !== status) {
    if (status === 'PENDING_REFUND') {
      createCustomerNotification({
        customerId: payment.customerId,
        type: 'INFO',
        title: '💰 Refund Initiated',
        message: `Your payment of $${payment.amount.toFixed(2)} is under refund process. You will be notified once completed.`,
        data: {
          paymentId: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          refundReason: refundReason,
        }
      });
    } else if (status === 'REFUNDED') {
      createCustomerNotification({
        customerId: payment.customerId,
        type: 'INFO',
        title: '✅ Refund Completed',
        message: `Your refund of $${payment.amount.toFixed(2)} has been processed successfully. Transaction ID: ${payment.transactionId}`,
        data: {
          paymentId: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
        }
      });
    }
  }
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('paymentUpdated', { detail: payment }));
  
  return payment;
}

// Initiate refund for payment
export function initiateRefund(paymentId: string, reason: string): PaymentTransaction | null {
  return updatePaymentStatus(paymentId, 'PENDING_REFUND', reason);
}

// Complete refund for payment
export function completeRefund(paymentId: string): PaymentTransaction | null {
  return updatePaymentStatus(paymentId, 'REFUNDED');
}

// Get all pending refunds (for admin dashboard)
export function getPendingRefunds(): PaymentTransaction[] {
  const payments = getAllPaymentTransactions();
  return payments.filter(p => p.paymentStatus === 'PENDING_REFUND');
}

// Format payment mode for display
export function formatPaymentMode(mode: PaymentMode): string {
  const modes: Record<PaymentMode, string> = {
    'UPI': 'UPI',
    'DEBIT_CARD': 'Debit Card',
    'CREDIT_CARD': 'Credit Card',
    'NET_BANKING': 'Net Banking',
    'PHONEPE': 'PhonePe',
    'GOOGLE_PAY': 'Google Pay',
    'PAYTM': 'Paytm',
    'CASH_ON_DELIVERY': 'Cash on Delivery',
  };
  return modes[mode] || mode;
}

// ========== Original API-based Functions (kept for future backend integration) ==========

class PaymentService {
  // Process payment
  async processPayment(paymentData: PaymentRequest): Promise<Payment> {
    const response = await api.post('/payments', paymentData);
    return response.data;
  }

  // Get payment by order ID
  async getPaymentByOrderId(orderId: string): Promise<Payment> {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  }

  // Get user payment history
  async getUserPayments(): Promise<Payment[]> {
    const response = await api.get('/payments/my-payments');
    return response.data;
  }

  // Verify payment
  async verifyPayment(paymentId: string): Promise<Payment> {
    const response = await api.post(`/payments/${paymentId}/verify`);
    return response.data;
  }

  // Request refund
  async requestRefund(paymentId: string, reason: string): Promise<Payment> {
    const response = await api.post(`/payments/${paymentId}/refund`, { reason });
    return response.data;
  }
}

export default new PaymentService();