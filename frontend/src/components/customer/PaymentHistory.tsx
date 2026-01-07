import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  CreditCard, 
  Calendar, 
  Receipt, 
  Eye,
  Smartphone,
  Wallet,
  Building2,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { PaymentTransaction, getPaymentsByCustomer, formatPaymentMode } from '../../services/paymentService';
import { useAuth } from '../../auth/AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Separator } from '../ui/separator';

export function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    loadPayments();

    // Listen for payment events to update in real-time
    const handlePaymentCreated = () => loadPayments();
    const handlePaymentUpdated = () => loadPayments();

    window.addEventListener('paymentCreated', handlePaymentCreated);
    window.addEventListener('paymentUpdated', handlePaymentUpdated);

    return () => {
      window.removeEventListener('paymentCreated', handlePaymentCreated);
      window.removeEventListener('paymentUpdated', handlePaymentUpdated);
    };
  }, [user]);

  const loadPayments = () => {
    if (!user) return;
    const userPayments = getPaymentsByCustomer(user.id);
    setPayments(userPayments);
  };

  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case 'UPI':
      case 'GOOGLE_PAY':
      case 'PHONEPE':
        return Smartphone;
      case 'PAYTM':
        return Wallet;
      case 'NET_BANKING':
        return Building2;
      case 'CASH_ON_DELIVERY':
        return Banknote;
      default:
        return CreditCard;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-500 text-white hover:bg-green-600">Paid</Badge>;
      case 'PENDING_REFUND':
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pending Refund</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Refunded</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500 text-white hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'PENDING_REFUND':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'REFUNDED':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Please login to view payment history</p>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Payment History</h3>
          <p className="text-muted-foreground">You haven{"'"}t made any payments yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur-md border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Payments</p>
                <h3 className="text-foreground text-2xl">{payments.length}</h3>
              </div>
              <Receipt className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Spent</p>
                <h3 className="text-foreground text-2xl">
                  ${payments.filter(p => p.paymentStatus === 'PAID').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </h3>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Refunds</p>
                <h3 className="text-foreground text-2xl">
                  {payments.filter(p => p.paymentStatus === 'PENDING_REFUND').length}
                </h3>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.map((payment) => {
              const PaymentIcon = getPaymentIcon(payment.paymentMode);
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <PaymentIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-foreground">{formatPaymentMode(payment.paymentMode)}</h4>
                        {getStatusBadge(payment.paymentStatus)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          {payment.transactionId}
                        </span>
                        {payment.tableNumber && (
                          <span>Table {payment.tableNumber}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground text-lg">${payment.amount.toFixed(2)}</p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-4"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Payment Details</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Transaction ID: {payment.transactionId}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.paymentStatus)}
                            {getStatusBadge(payment.paymentStatus)}
                          </div>
                        </div>
                        <Separator className="bg-border" />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="text-foreground">${payment.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method</span>
                          <span className="text-foreground">{formatPaymentMode(payment.paymentMode)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date & Time</span>
                          <span className="text-foreground">
                            {new Date(payment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {payment.bookingId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Booking ID</span>
                            <span className="text-foreground text-sm font-mono">{payment.bookingId}</span>
                          </div>
                        )}
                        {payment.orderId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order ID</span>
                            <span className="text-foreground text-sm font-mono">{payment.orderId}</span>
                          </div>
                        )}
                        {payment.tableNumber && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Table Number</span>
                            <span className="text-foreground">{payment.tableNumber}</span>
                          </div>
                        )}
                        {payment.locationName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span className="text-foreground">{payment.locationName}</span>
                          </div>
                        )}
                        {payment.refundReason && (
                          <>
                            <Separator className="bg-border" />
                            <div>
                              <span className="text-muted-foreground block mb-1">Refund Reason</span>
                              <span className="text-foreground">{payment.refundReason}</span>
                            </div>
                          </>
                        )}
                        {payment.refundedAt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Refunded At</span>
                            <span className="text-foreground">
                              {new Date(payment.refundedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {payment.items && payment.items.length > 0 && (
                          <>
                            <Separator className="bg-border" />
                            <div>
                              <span className="text-muted-foreground block mb-2">Order Items</span>
                              <div className="space-y-2">
                                {payment.items.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-foreground">
                                      {item.name} x{item.quantity}
                                    </span>
                                    <span className="text-foreground">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
