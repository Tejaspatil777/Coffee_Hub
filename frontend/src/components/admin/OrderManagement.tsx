import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  UtensilsCrossed,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  User,
  RefreshCw,
  Trash2,
  Eye,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Textarea } from '../ui/textarea';
import { 
  getFromLocalStorage, 
  updateLocalStorageWithSync, 
  REALTIME_EVENTS,
  subscribeToRealtimeUpdates,
} from '../../services/realtimeSync';
import { createCustomerNotification } from '../../services/customerNotificationService';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  booking?: {
    tableId: string;
    tableNumber: string;
  };
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod?: string;
  paymentStatus?: string;
  specialRequirements?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadOrders();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRealtimeUpdates(
      [REALTIME_EVENTS.ORDER_UPDATED, REALTIME_EVENTS.PAYMENT_UPDATED],
      () => {
        loadOrders();
      }
    );

    return unsubscribe;
  }, [refreshKey]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = () => {
    const storedOrders = getFromLocalStorage<Order[]>('orders', []);
    const users = getFromLocalStorage<any[]>('users', []);
    
    // Enrich orders with customer info (only if not already present)
    const enrichedOrders = storedOrders.map(order => {
      // Use existing customerName/Email from order, or look up from users as fallback
      const customer = users.find(u => u.id === order.customerId);
      return {
        ...order,
        customerName: order.customerName || customer?.name || 'Unknown Customer',
        customerEmail: order.customerEmail || customer?.email || '',
      };
    });

    setOrders(enrichedOrders);
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.booking?.tableNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    );

    updateLocalStorageWithSync('orders', updatedOrders, REALTIME_EVENTS.ORDER_UPDATED);

    // Send notification to customer
    const order = orders.find(o => o.id === orderId);
    if (order) {
      createCustomerNotification({
        customerId: order.customerId,
        type: 'ORDER_STATUS',
        title: `Order Status Updated`,
        message: `Your order #${orderId.slice(0, 8)} is now ${newStatus.toLowerCase()}`,
        relatedId: orderId,
      });
    }

    toast.success(`Order status updated to ${newStatus}`);
    loadOrders();
  };

  const cancelOrder = (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Update order status
    updateOrderStatus(orderId, 'CANCELLED');

    // Update payment status to pending refund if paid
    if (order.paymentStatus === 'PAID') {
      const payments = getFromLocalStorage<any[]>('payments', []);
      const updatedPayments = payments.map(payment =>
        payment.orderId === orderId
          ? { ...payment, status: 'PENDING_REFUND' }
          : payment
      );
      updateLocalStorageWithSync('payments', updatedPayments, REALTIME_EVENTS.PAYMENT_UPDATED);
    }

    // Notify customer
    createCustomerNotification({
      customerId: order.customerId,
      type: 'ORDER_CANCELLED',
      title: 'Order Cancelled',
      message: `Your order #${orderId.slice(0, 8)} has been cancelled. ${
        order.paymentStatus === 'PAID' ? 'A refund will be processed shortly.' : ''
      }`,
      relatedId: orderId,
    });

    toast.success('Order cancelled');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Orders refreshed');
  };

  const clearCompleted = () => {
    const activeOrders = orders.filter(order => 
      !['DELIVERED', 'SERVED', 'CANCELLED'].includes(order.status)
    );
    
    const removedCount = orders.length - activeOrders.length;
    updateLocalStorageWithSync('orders', activeOrders, REALTIME_EVENTS.ORDER_UPDATED);
    toast.success(`Cleared ${removedCount} completed orders`);
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'ACCEPTED':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'PREPARING':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'READY':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'SERVED':
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    preparing: orders.filter(o => o.status === 'PREPARING' || o.status === 'ACCEPTED').length,
    ready: orders.filter(o => o.status === 'READY').length,
    completed: orders.filter(o => o.status === 'DELIVERED' || o.status === 'SERVED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/70 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Order Management ☕
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Monitor and manage all customer orders in real-time
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompleted}
                className="border-border"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Completed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-border"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-orange-700 dark:text-orange-400">{stats.preparing}</p>
              <p className="text-sm text-muted-foreground">Preparing</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-purple-700 dark:text-purple-400">{stats.ready}</p>
              <p className="text-sm text-muted-foreground">Ready</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-green-700 dark:text-green-400">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl text-red-700 dark:text-red-400">{stats.cancelled}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/70 backdrop-blur-xl border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer, or table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input-background border-border text-foreground"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-[200px] bg-input-background border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="ALL">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="PREPARING">Preparing</SelectItem>
                <SelectItem value="READY">Ready</SelectItem>
                <SelectItem value="SERVED">Served</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map(order => (
          <Card key={order.id} className="bg-card/70 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground">Order #{order.id.slice(0, 8)}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {order.customerName}
                      </span>
                      {order.booking && (
                        <span className="flex items-center gap-1">
                          <UtensilsCrossed className="h-3 w-3" />
                          Table {order.booking.tableNumber}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-primary">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                  </div>
                </div>

                {/* Special Requirements */}
                {order.specialRequirements && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-900 dark:text-amber-100">Special Requirements:</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{order.specialRequirements}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="bg-border" />

                {/* Order Actions */}
                <div className="flex flex-wrap gap-2">
                  {/* Status progression buttons */}
                  {order.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept Order
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-red-600"
                        onClick={() => cancelOrder(order.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                    >
                      <ChefHat className="h-4 w-4 mr-2" />
                      Start Preparing
                    </Button>
                  )}

                  {order.status === 'PREPARING' && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => updateOrderStatus(order.id, 'READY')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Mark as Ready
                    </Button>
                  )}

                  {order.status === 'READY' && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateOrderStatus(order.id, 'SERVED')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Served
                    </Button>
                  )}

                  {order.status === 'SERVED' && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-700 hover:bg-green-800 text-white"
                      onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete Order
                    </Button>
                  )}

                  {/* View Details */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewOrderDetails(order)}
                    className="border-border"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {/* Cancel button for non-completed orders */}
                  {!['DELIVERED', 'SERVED', 'CANCELLED'].includes(order.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-border"
                      onClick={() => cancelOrder(order.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card className="bg-card/70 backdrop-blur-xl border-border">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
                <p className="text-sm mt-1">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Orders will appear here when customers place them'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Order Details #{selectedOrder?.id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Complete order information and history
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Customer Info */}
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2">Customer Information</h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <p className="text-foreground">{selectedOrder.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                    {selectedOrder.booking && (
                      <p className="text-sm text-muted-foreground">
                        Table {selectedOrder.booking.tableNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          {item.specialInstructions && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <p className="text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requirements */}
                {selectedOrder.specialRequirements && (
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-2">Special Requirements</h4>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <p className="text-sm text-amber-900 dark:text-amber-100">{selectedOrder.specialRequirements}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2">Payment Information</h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="text-foreground">{selectedOrder.paymentMethod || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge className={selectedOrder.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {selectedOrder.paymentStatus || 'PENDING'}
                      </Badge>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between">
                      <span className="text-foreground">Total:</span>
                      <span className="text-xl text-primary">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2">Order Timeline</h4>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-foreground">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedOrder.updatedAt && (
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="text-foreground">
                          {new Date(selectedOrder.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}