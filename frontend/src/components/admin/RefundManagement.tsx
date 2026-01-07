import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  User,
  Receipt,
  Eye
} from 'lucide-react';
import { 
  getPendingRefunds, 
  completeRefund, 
  PaymentTransaction,
  formatPaymentMode 
} from '../../services/paymentService';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Separator } from '../ui/separator';

export function RefundManagement() {
  const [pendingRefunds, setPendingRefunds] = useState<PaymentTransaction[]>([]);
  const [selectedRefund, setSelectedRefund] = useState<PaymentTransaction | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPendingRefunds();

    // Listen for payment events to update in real-time
    const handlePaymentUpdated = () => loadPendingRefunds();
    window.addEventListener('paymentUpdated', handlePaymentUpdated);
    window.addEventListener('paymentCreated', handlePaymentUpdated);

    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdated);
      window.removeEventListener('paymentCreated', handlePaymentUpdated);
    };
  }, []);

  const loadPendingRefunds = () => {
    const refunds = getPendingRefunds();
    setPendingRefunds(refunds);
  };

  const handleCompleteRefund = async (paymentId: string) => {
    setProcessing(paymentId);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = completeRefund(paymentId);
      
      if (result) {
        toast.success('Refund Completed', {
          description: `Refund of $${result.amount.toFixed(2)} has been processed successfully.`
        });
        loadPendingRefunds();
      } else {
        toast.error('Failed to process refund');
      }
    } catch (error) {
      toast.error('An error occurred while processing the refund');
    } finally {
      setProcessing(null);
    }
  };

  if (pendingRefunds.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-md border-border">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Pending Refunds</h3>
          <p className="text-muted-foreground">All refunds have been processed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1">Total Pending Refunds</p>
              <h2 className="text-foreground text-3xl">{pendingRefunds.length}</h2>
              <p className="text-primary mt-2">
                Total Amount: ${pendingRefunds.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refund List */}
      <Card className="bg-card/50 backdrop-blur-md border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Pending Refund Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingRefunds.map((refund) => (
              <div
                key={refund.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-foreground">{refund.customerName}</h4>
                      <Badge className="bg-yellow-500 text-white">Pending</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {refund.customerEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        {refund.transactionId}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(refund.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {refund.refundReason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Reason: {refund.refundReason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-lg">${refund.amount.toFixed(2)}</p>
                    <p className="text-muted-foreground text-sm">{formatPaymentMode(refund.paymentMode)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRefund(refund)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Refund Details</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Transaction ID: {refund.transactionId}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Customer</span>
                          <div className="text-right">
                            <p className="text-foreground">{refund.customerName}</p>
                            <p className="text-muted-foreground text-sm">{refund.customerEmail}</p>
                          </div>
                        </div>
                        <Separator className="bg-border" />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Refund Amount</span>
                          <span className="text-foreground">${refund.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method</span>
                          <span className="text-foreground">{formatPaymentMode(refund.paymentMode)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original Payment Date</span>
                          <span className="text-foreground">
                            {new Date(refund.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Refund Requested</span>
                          <span className="text-foreground">
                            {new Date(refund.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        {refund.bookingId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Booking ID</span>
                            <span className="text-foreground text-sm font-mono">{refund.bookingId}</span>
                          </div>
                        )}
                        {refund.orderId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order ID</span>
                            <span className="text-foreground text-sm font-mono">{refund.orderId}</span>
                          </div>
                        )}
                        {refund.tableNumber && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Table Number</span>
                            <span className="text-foreground">{refund.tableNumber}</span>
                          </div>
                        )}
                        {refund.locationName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span className="text-foreground">{refund.locationName}</span>
                          </div>
                        )}
                        {refund.refundReason && (
                          <>
                            <Separator className="bg-border" />
                            <div>
                              <span className="text-muted-foreground block mb-1">Refund Reason</span>
                              <span className="text-foreground">{refund.refundReason}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-accent text-white"
                    onClick={() => handleCompleteRefund(refund.id)}
                    disabled={processing === refund.id}
                  >
                    {processing === refund.id ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete Refund
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
