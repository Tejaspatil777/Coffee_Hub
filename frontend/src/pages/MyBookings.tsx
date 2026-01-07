import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  getBookingsByCustomer,
  cancelBooking,
  getOrdersByBooking,
  type Booking,
  type BookingStatus,
} from '../services/bookingService';
import { toast } from 'sonner@2.0.3';
import { ScrollArea } from '../components/ui/scroll-area';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    loadBookings();

    // Listen for booking updates
    const handleBookingUpdated = () => {
      loadBookings();
    };

    window.addEventListener('bookingUpdated', handleBookingUpdated);

    return () => {
      window.removeEventListener('bookingUpdated', handleBookingUpdated);
    };
  }, [user]);

  const loadBookings = () => {
    if (!user) return;
    
    const customerBookings = getBookingsByCustomer(user.id);
    // Sort by most recent first
    customerBookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setBookings(customerBookings);
  };

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const confirmCancellation = () => {
    if (!selectedBooking) return;

    const updatedBooking = cancelBooking(selectedBooking.id, cancellationReason);

    if (updatedBooking) {
      toast.success('Booking cancelled successfully');
      setShowCancelDialog(false);
      setCancellationReason('');
      setSelectedBooking(null);
      loadBookings();
    } else {
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending Approval</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case 'SERVED':
        return <Badge className="bg-blue-500">Served</Badge>;
      case 'NO_SHOW':
        return <Badge className="bg-gray-500">No Show</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'CONFIRMED':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
      case 'NO_SHOW':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'SERVED':
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your table reservations</p>
        </div>

        {bookings.length === 0 ? (
          <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">You have no bookings yet</p>
                <Button
                  onClick={() => navigate('/locations')}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                  Book a Table
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6 pr-4">
              {bookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border hover:shadow-lg transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(booking.status)}
                        <div>
                          <CardTitle className="text-foreground text-lg">
                            {booking.locationName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span>Booking ID: {booking.id}</span>
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Booking Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="text-foreground">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="text-foreground">{booking.timeSlot}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Table</p>
                          <p className="text-foreground">Table {booking.tableNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Guests</p>
                          <p className="text-foreground">{booking.guests} people</p>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-xs text-amber-800 dark:text-amber-200 mb-1">
                          Special Requests:
                        </p>
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Booking Reason */}
                    {booking.bookingReason && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                          Booking Reason:
                        </p>
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          {booking.bookingReason}
                        </p>
                      </div>
                    )}

                    {/* Admin Note */}
                    {booking.adminNote && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-green-800 dark:text-green-200 mb-1">
                              Admin Note:
                            </p>
                            <p className="text-sm text-green-900 dark:text-green-100">
                              {booking.adminNote}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rejection/Cancellation Reason */}
                    {booking.rejectionReason && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-xs text-red-800 dark:text-red-200 mb-1">
                          {booking.status === 'CANCELLED' ? 'Cancellation Reason:' : 'Rejection Reason:'}
                        </p>
                        <p className="text-sm text-red-900 dark:text-red-100">
                          {booking.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2 border-t border-border">
                      <div>
                        <span>Requested: </span>
                        <span>{new Date(booking.createdAt).toLocaleString()}</span>
                      </div>
                      {booking.confirmedAt && (
                        <div>
                          <span>Confirmed: </span>
                          <span>{new Date(booking.confirmedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {booking.servedAt && (
                        <div>
                          <span>Served: </span>
                          <span>{new Date(booking.servedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {booking.cancelledAt && (
                        <div>
                          <span>Cancelled: </span>
                          <span>{new Date(booking.cancelledAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleCancelBooking(booking)}
                          variant="outline"
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Cancel Booking</DialogTitle>
              <DialogDescription>
                Please provide a reason for cancelling this booking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedBooking && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedBooking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{selectedBooking.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Table {selectedBooking.tableNumber}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="cancellationReason" className="text-foreground">
                  Cancellation Reason (Optional)
                </Label>
                <Textarea
                  id="cancellationReason"
                  placeholder="e.g., Change of plans, emergency..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="bg-background border-border"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancellationReason('');
                }}
                className="border-border"
              >
                Keep Booking
              </Button>
              <Button
                onClick={confirmCancellation}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}