import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Calendar,
  MapPin,
  MessageSquare,
  Trash2,
  Check,
  X
} from 'lucide-react';
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  updateBookingStatus,
  getBookingById,
  type BookingNotification,
  type BookingStatus,
} from '../../services/bookingService';
import { updateCustomerStatus } from '../../services/customerSessionService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { ScrollArea } from '../ui/scroll-area';

export function BookingNotifications() {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<BookingNotification | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadNotifications();

    // Listen for new notifications
    const handleNotificationCreated = () => {
      loadNotifications();
    };

    const handleBookingUpdated = () => {
      loadNotifications();
    };

    window.addEventListener('notificationCreated', handleNotificationCreated);
    window.addEventListener('bookingUpdated', handleBookingUpdated);

    return () => {
      window.removeEventListener('notificationCreated', handleNotificationCreated);
      window.removeEventListener('bookingUpdated', handleBookingUpdated);
    };
  }, []);

  const loadNotifications = () => {
    const allNotifications = getAllNotifications();
    setNotifications(allNotifications);
  };

  const handleApprove = (notification: BookingNotification) => {
    setSelectedNotification(notification);
    setShowApprovalDialog(true);
  };

  const handleReject = (notification: BookingNotification) => {
    setSelectedNotification(notification);
    setShowRejectionDialog(true);
  };

  const confirmApproval = () => {
    if (!selectedNotification) return;

    const updatedBooking = updateBookingStatus(
      selectedNotification.bookingId,
      'CONFIRMED',
      adminNote
    );

    if (updatedBooking) {
      markNotificationAsRead(selectedNotification.id);
      toast.success('Booking approved successfully!');
      setShowApprovalDialog(false);
      setAdminNote('');
      setSelectedNotification(null);
      loadNotifications();
    } else {
      toast.error('Failed to approve booking');
    }
  };

  const confirmRejection = () => {
    if (!selectedNotification || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const updatedBooking = updateBookingStatus(
      selectedNotification.bookingId,
      'CANCELLED',
      undefined,
      rejectionReason
    );

    if (updatedBooking) {
      markNotificationAsRead(selectedNotification.id);
      toast.success('Booking rejected');
      setShowRejectionDialog(false);
      setRejectionReason('');
      setSelectedNotification(null);
      loadNotifications();
    } else {
      toast.error('Failed to reject booking');
    }
  };

  const handleMarkAsServed = (notification: BookingNotification) => {
    const updatedBooking = updateBookingStatus(
      notification.bookingId,
      'SERVED'
    );

    if (updatedBooking) {
      markNotificationAsRead(notification.id);
      toast.success('Booking marked as served. Table is now available.');
      loadNotifications();
    } else {
      toast.error('Failed to update booking');
    }
  };

  const handleMarkAsNoShow = (notification: BookingNotification) => {
    const updatedBooking = updateBookingStatus(
      notification.bookingId,
      'NO_SHOW'
    );

    if (updatedBooking) {
      markNotificationAsRead(notification.id);
      toast.success('Booking marked as no-show. Table is now available.');
      loadNotifications();
    } else {
      toast.error('Failed to update booking');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_BOOKING':
        return <Bell className="h-5 w-5 text-blue-600" />;
      case 'CANCELLATION':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'STATUS_UPDATE':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="h-5 w-5 text-primary" />
                Booking Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-white">{unreadCount}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage booking requests and updates
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    markAllNotificationsAsRead();
                    loadNotifications();
                  }}
                  className="border-border"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearNotifications();
                  loadNotifications();
                  toast.success('All notifications cleared');
                }}
                className="border-border"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-2 transition-all ${
                      notification.isRead
                        ? 'border-border bg-background/50'
                        : 'border-primary/50 bg-primary/5'
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-foreground mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {getStatusBadge(notification.booking.status)}
                          </div>

                          {/* Booking Details */}
                          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {notification.booking.customerName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                Table {notification.booking.tableNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {new Date(notification.booking.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {notification.booking.timeSlot}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm col-span-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {notification.booking.guests} guests
                              </span>
                            </div>
                          </div>

                          {/* Booking Reason */}
                          {notification.booking.bookingReason && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                                    Booking Reason:
                                  </p>
                                  <p className="text-sm text-blue-900 dark:text-blue-100">
                                    {notification.booking.bookingReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Special Requests */}
                          {notification.booking.specialRequests && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                              <p className="text-xs text-amber-800 dark:text-amber-200 mb-1">
                                Special Requests:
                              </p>
                              <p className="text-sm text-amber-900 dark:text-amber-100">
                                {notification.booking.specialRequests}
                              </p>
                            </div>
                          )}

                          {/* Admin Note */}
                          {notification.booking.adminNote && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <p className="text-xs text-green-800 dark:text-green-200 mb-1">
                                Admin Note:
                              </p>
                              <p className="text-sm text-green-900 dark:text-green-100">
                                {notification.booking.adminNote}
                              </p>
                            </div>
                          )}

                          {/* Rejection Reason */}
                          {notification.booking.rejectionReason && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <p className="text-xs text-red-800 dark:text-red-200 mb-1">
                                {notification.booking.status === 'CANCELLED' && notification.type === 'CANCELLATION'
                                  ? 'Cancellation Reason:'
                                  : 'Rejection Reason:'}
                              </p>
                              <p className="text-sm text-red-900 dark:text-red-100">
                                {notification.booking.rejectionReason}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {notification.booking.status === 'PENDING' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleApprove(notification)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Booking
                              </Button>
                              <Button
                                onClick={() => handleReject(notification)}
                                variant="outline"
                                className="flex-1 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Booking
                              </Button>
                            </div>
                          )}

                          {notification.booking.status === 'CONFIRMED' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleMarkAsServed(notification)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Served
                              </Button>
                              <Button
                                onClick={() => handleMarkAsNoShow(notification)}
                                variant="outline"
                                className="flex-1 border-gray-500 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                No Show
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Approve Booking</DialogTitle>
            <DialogDescription>
              Add an optional note for the customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminNote" className="text-foreground">
                Admin Note (Optional)
              </Label>
              <Textarea
                id="adminNote"
                placeholder="e.g., Table prepared with special setup..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="bg-background border-border"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApprovalDialog(false);
                setAdminNote('');
              }}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApproval}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Reject Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason" className="text-foreground">
                Rejection Reason *
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="e.g., Table fully booked, maintenance scheduled..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-background border-border"
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectionDialog(false);
                setRejectionReason('');
              }}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRejection}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}