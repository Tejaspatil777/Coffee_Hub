import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  User,
  Mail,
  Phone,
  Users,
  Calendar,
  Clock,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { getAllBookings, updateBookingStatus, getOrdersByBooking, type Booking, type BookingStatus } from '../../services/bookingService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface TableDetailDialogProps {
  tableId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function TableDetailDialog({ tableId, open, onOpenChange, onRefresh }: TableDetailDialogProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tableId) {
      loadTableDetails();
    }
  }, [open, tableId]);

  const loadTableDetails = () => {
    if (!tableId) return;

    // Find the active booking for this table
    const allBookings = getAllBookings();
    const activeBooking = allBookings.find(
      b => b.tableId === tableId && (b.status === 'CONFIRMED' || b.status === 'PENDING')
    );

    if (activeBooking) {
      setBooking(activeBooking);
      // Load orders for this booking
      const bookingOrders = getOrdersByBooking(activeBooking.id);
      setOrders(bookingOrders);
    } else {
      setBooking(null);
      setOrders([]);
    }
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!booking) return;

    setLoading(true);
    try {
      const result = updateBookingStatus(booking.id, newStatus);
      if (result) {
        toast.success(`Booking status updated to ${newStatus}`);
        setBooking(result);
        onRefresh();
      } else {
        toast.error('Failed to update booking status');
      }
    } catch (error) {
      toast.error('Error updating booking status');
    } finally {
      setLoading(false);
    }
  };

  const calculateExpectedEndTime = () => {
    if (!booking) return 'N/A';
    
    if (booking.expectedEndTime) {
      return new Date(booking.expectedEndTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Calculate based on duration or default to 90 minutes
    const duration = booking.duration || 90;
    const bookingTime = new Date(booking.createdAt);
    const endTime = new Date(bookingTime.getTime() + duration * 60000);
    
    return endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalOrderAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Table Details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {booking ? `Booking and customer information for ${booking.tableNumber}` : 'No active booking for this table'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          {booking ? (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card className="bg-muted/30 border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm text-foreground">{booking.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground">{booking.customerEmail}</p>
                      </div>
                    </div>
                    {booking.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm text-foreground">{booking.customerPhone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Number of Guests</p>
                        <p className="text-sm text-foreground">{booking.guests} guests</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Information */}
              <Card className="bg-muted/30 border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Booking Information
                    </span>
                    <Badge
                      className={
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                          : booking.status === 'PENDING'
                          ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm text-foreground">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time Slot</p>
                        <p className="text-sm text-foreground">{booking.timeSlot}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm text-foreground">{booking.duration || 90} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Expected End Time</p>
                        <p className="text-sm text-foreground">{calculateExpectedEndTime()}</p>
                      </div>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <>
                      <Separator className="bg-border" />
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-primary mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Special Requests</p>
                          <p className="text-sm text-foreground mt-1">{booking.specialRequests}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator className="bg-border" />

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground">Update Status:</label>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => handleStatusChange(value as BookingStatus)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="SERVED">Served</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="NO_SHOW">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Orders Information */}
              <Card className="bg-muted/30 border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                      Orders
                    </span>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {orders.length} order(s)
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="p-3 border border-border rounded-lg bg-background/50">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm text-foreground">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge
                              className={
                                order.status === 'COMPLETED' || order.status === 'SERVED'
                                  ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                                  : order.status === 'PREPARING' || order.status === 'IN_PROGRESS'
                                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                                  : order.status === 'CANCELLED'
                                  ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                  : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
                              }
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 mb-2">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <Separator className="my-2 bg-border" />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Total</span>
                            <span className="text-sm text-primary">${order.total?.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                      <Separator className="bg-border" />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Total Amount
                        </span>
                        <span className="text-lg text-primary">${totalOrderAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground text-sm">No orders placed yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Timeline */}
              <Card className="bg-muted/30 border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Booking Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-foreground">
                      {new Date(booking.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {booking.confirmedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">Confirmed:</span>
                      <span className="text-foreground">
                        {new Date(booking.confirmedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {booking.checkedInAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span className="text-muted-foreground">Checked In:</span>
                      <span className="text-foreground">
                        {new Date(booking.checkedInAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {booking.servedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      <span className="text-muted-foreground">Served:</span>
                      <span className="text-foreground">
                        {new Date(booking.servedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {booking.cancelledAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-muted-foreground">Cancelled:</span>
                      <span className="text-foreground">
                        {new Date(booking.cancelledAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg text-foreground mb-2">No Active Booking</p>
              <p className="text-sm text-muted-foreground">This table is currently available for booking</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
