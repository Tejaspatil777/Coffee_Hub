import { useState, useEffect } from 'react';
import { Bell, X, Check, Calendar, ShoppingBag, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import {
  getCustomerNotifications,
  markCustomerNotificationAsRead,
  markAllCustomerNotificationsAsRead,
  clearCustomerNotifications,
  type CustomerNotification,
} from '../../services/customerNotificationService';
import { toast } from 'sonner@2.0.3';

interface CustomerNotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
}

export function CustomerNotificationPanel({
  open,
  onOpenChange,
  customerId,
}: CustomerNotificationPanelProps) {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, customerId]);

  useEffect(() => {
    const handleNotificationCreated = () => {
      if (open) {
        loadNotifications();
      }
    };

    const handleNotificationRead = () => {
      if (open) {
        loadNotifications();
      }
    };

    window.addEventListener('customerNotificationCreated', handleNotificationCreated);
    window.addEventListener('customerNotificationRead', handleNotificationRead);

    return () => {
      window.removeEventListener('customerNotificationCreated', handleNotificationCreated);
      window.removeEventListener('customerNotificationRead', handleNotificationRead);
    };
  }, [open]);

  const loadNotifications = () => {
    const customerNotifications = getCustomerNotifications(customerId);
    setNotifications(customerNotifications);
  };

  const handleNotificationClick = (notification: CustomerNotification) => {
    if (!notification.isRead) {
      markCustomerNotificationAsRead(notification.id);
      loadNotifications();
    }
  };

  const handleMarkAllAsRead = () => {
    markAllCustomerNotificationsAsRead(customerId);
    loadNotifications();
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    clearCustomerNotifications(customerId);
    loadNotifications();
    toast.success('All notifications cleared');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_APPROVED':
        return <Calendar className="h-5 w-5 text-green-600" />;
      case 'BOOKING_REJECTED':
        return <Calendar className="h-5 w-5 text-red-600" />;
      case 'ORDER_READY':
        return <ShoppingBag className="h-5 w-5 text-orange-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary text-white">{unreadCount}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with your bookings and orders
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="flex-1 border-border"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex-1 border-border"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You&apos;ll be notified when your bookings are approved or orders are ready
                </p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all border-2 ${
                      notification.isRead
                        ? 'border-border bg-background/50'
                        : 'border-primary/50 bg-primary/5 shadow-md'
                    } hover:shadow-lg`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-foreground">{notification.title}</h4>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>

                          {/* Additional Info */}
                          {notification.data && (
                            <div className="mt-3 p-2 bg-muted/50 rounded-md space-y-1">
                              {notification.data.tableNumber && (
                                <p className="text-xs text-foreground">
                                  <span className="opacity-70">Table:</span> {notification.data.tableNumber}
                                </p>
                              )}
                              {notification.data.orderId && (
                                <p className="text-xs text-foreground">
                                  <span className="opacity-70">Order ID:</span> #{notification.data.orderId.slice(-6)}
                                </p>
                              )}
                              {notification.data.date && (
                                <p className="text-xs text-foreground">
                                  <span className="opacity-70">Date:</span> {new Date(notification.data.date).toLocaleDateString()}
                                </p>
                              )}
                              {notification.data.timeSlot && (
                                <p className="text-xs text-foreground">
                                  <span className="opacity-70">Time:</span> {notification.data.timeSlot}
                                </p>
                              )}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
