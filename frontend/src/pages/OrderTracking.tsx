import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Clock, CheckCircle2, ChefHat, Truck, Package, Timer, Calendar, Users, MapPin, XCircle, AlertTriangle } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getBookingsByCustomer } from '../services/bookingService';
import { getOrdersByCustomer, cancelOrder } from '../services/orderManagementService';
import { showUnreadNotifications } from '../utils/notificationHelper';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner@2.0.3';

interface Order {
  id: string;
  items: any[];
  booking: any;
  total: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  preparationTime?: number;
  tableNumber?: string;
}

const statusSteps = {
  PENDING: { label: 'Order Placed', icon: Package, progress: 25 },
  PREPARING: { label: 'Chef Preparing', icon: ChefHat, progress: 50 },
  READY: { label: 'Ready to Serve', icon: CheckCircle2, progress: 75 },
  SERVED: { label: 'Served', icon: Truck, progress: 100 },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, progress: 100 },
  CANCELLED: { label: 'Cancelled', icon: XCircle, progress: 0 }
};

export default function OrderTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  // Show unread notifications on page load
  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      showUnreadNotifications(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadOrders();
      
      // Listen for order updates
      const handleOrderCreated = () => {
        loadOrders();
      };
      
      const handleOrderUpdated = () => {
        loadOrders();
      };
      
      window.addEventListener('orderCreated', handleOrderCreated);
      window.addEventListener('orderUpdated', handleOrderUpdated);
      
      return () => {
        window.removeEventListener('orderCreated', handleOrderCreated);
        window.removeEventListener('orderUpdated', handleOrderUpdated);
      };
    }
  }, [user]);

  const loadOrders = () => {
    if (!user) return;
    
    // Get orders for the current customer
    const customerOrders = getOrdersByCustomer(user.id);
    setOrders(customerOrders.reverse()); // Most recent first
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'PREPARING': return 'default';
      case 'READY': return 'default';
      case 'SERVED': return 'default';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleCancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const confirmCancel = confirm(`Are you sure you want to cancel order #${order.id.toUpperCase().slice(0, 8)}?`);
    if (!confirmCancel) return;

    const result = cancelOrder(orderId);
    if (result) {
      toast.success('Order cancelled successfully');
      loadOrders();
    } else {
      toast.error('Failed to cancel order. Order may already be prepared or served.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track your order status in real-time</p>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="mb-2 text-foreground">No orders yet</h3>
              <p className="text-muted-foreground">Your orders will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = statusSteps[order.status];
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={order.id} className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          Order #{order.id.toUpperCase().slice(0, 8)}
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {statusInfo.label}
                          </Badge>
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700">
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Order Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-foreground">
                          <StatusIcon className="h-5 w-5 text-primary" />
                          {statusInfo.label}
                        </span>
                        <span className="text-muted-foreground">{statusInfo.progress}%</span>
                      </div>
                      <Progress value={statusInfo.progress} className="h-2" />
                    </div>

                    {/* Estimated Delivery Time */}
                    {order.status !== 'SERVED' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                      <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <Timer className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Estimated Arrival Time</p>
                            <p className="text-foreground">
                              {order.estimatedDeliveryTime || `${order.preparationTime || 15-20} minutes`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Your order will arrive at Table {order.tableNumber || order.booking.tableId}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cancelled Message */}
                    {order.status === 'CANCELLED' && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                          <div>
                            <p className="text-red-900 dark:text-red-100">Order Cancelled</p>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                              This order has been cancelled and will not be prepared.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(statusSteps).slice(0, 4).map(([status, info], index) => {
                        const Icon = info.icon;
                        const isActive = statusInfo.progress >= info.progress;
                        
                        return (
                          <div key={status} className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                isActive
                                  ? 'bg-primary text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className={`text-xs text-center ${
                              isActive ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {info.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <Separator className="bg-border" />

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground mb-1">Table</p>
                        <p className="text-foreground">{order.booking.tableId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Time</p>
                        <p className="flex items-center gap-1 text-foreground">
                          <Clock className="h-4 w-4" />
                          {order.booking.time}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Date</p>
                        <p className="text-foreground">{order.booking.date}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Guests</p>
                        <p className="text-foreground">{order.booking.guests} people</p>
                      </div>
                    </div>

                    <Separator className="bg-border" />

                    {/* Order Items */}
                    <div>
                      <h4 className="mb-3 text-foreground">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-foreground">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-muted-foreground">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-3 bg-border" />
                      <div className="flex justify-between">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Cancel Order Button */}
                    {order.status === 'PENDING' && (
                      <div className="mt-4">
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Cancel Order
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}