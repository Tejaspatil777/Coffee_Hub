import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Activity,
  CheckCircle,
  Clock,
  ShoppingBag,
  UserPlus,
  Trash2,
  Calendar,
  Coffee,
  ChefHat,
  Bell,
  AlertCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityEvent {
  id: string;
  type: 'order' | 'booking' | 'menu' | 'customer' | 'status';
  action: string;
  description: string;
  timestamp: Date;
  icon: any;
  color: string;
  bgColor: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [liveStats, setLiveStats] = useState({
    activeOrders: 0,
    todayBookings: 0,
    onlineCustomers: 0,
    recentRevenue: 0
  });

  useEffect(() => {
    loadActivities();
    updateLiveStats();

    // Listen for all events
    const handleOrderUpdate = () => {
      addActivity({
        type: 'order',
        action: 'Order Updated',
        description: 'A new order has been placed or updated',
        icon: ShoppingBag,
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      });
      loadActivities();
      updateLiveStats();
    };

    const handleBookingUpdate = () => {
      addActivity({
        type: 'booking',
        action: 'New Booking',
        description: 'Customer made a table reservation',
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-500/10'
      });
      loadActivities();
      updateLiveStats();
    };

    const handleMenuUpdate = () => {
      addActivity({
        type: 'menu',
        action: 'Menu Updated',
        description: 'Menu items have been modified',
        icon: Coffee,
        color: 'text-green-600',
        bgColor: 'bg-green-500/10'
      });
      loadActivities();
    };

    window.addEventListener('orderUpdated', handleOrderUpdate);
    window.addEventListener('bookingCreated', handleBookingUpdate);
    window.addEventListener('menuUpdated', handleMenuUpdate);

    // Refresh every 5 seconds
    const interval = setInterval(() => {
      updateLiveStats();
    }, 5000);

    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate);
      window.removeEventListener('bookingCreated', handleBookingUpdate);
      window.removeEventListener('menuUpdated', handleMenuUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadActivities = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    const recentActivities: ActivityEvent[] = [];

    // Recent orders
    orders
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .forEach((order: any) => {
        const statusInfo = getOrderStatusInfo(order.status);
        recentActivities.push({
          id: `order-${order.id}`,
          type: 'order',
          action: `Order ${statusInfo.label}`,
          description: `Order #${order.id.slice(0, 8)} - ${order.items.length} items`,
          timestamp: new Date(order.createdAt),
          icon: statusInfo.icon,
          color: statusInfo.color,
          bgColor: statusInfo.bgColor
        });
      });

    // Recent bookings
    bookings
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .forEach((booking: any) => {
        recentActivities.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          action: 'New Booking',
          description: `${booking.customerName} - Table ${booking.tableNumber}`,
          timestamp: new Date(booking.createdAt),
          icon: Calendar,
          color: 'text-blue-600',
          bgColor: 'bg-blue-500/10'
        });
      });

    // Sort by timestamp
    recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setActivities(recentActivities.slice(0, 15));
  };

  const addActivity = (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newActivity: ActivityEvent = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date()
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 15));
  };

  const updateLiveStats = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const sessions = JSON.parse(localStorage.getItem('customerSessions') || '[]');

    const today = new Date().toDateString();

    // Active orders (not completed)
    const activeOrders = orders.filter((o: any) => 
      o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
    ).length;

    // Today's bookings
    const todayBookings = bookings.filter((b: any) => 
      new Date(b.date).toDateString() === today
    ).length;

    // Online customers (sessions in last 30 min)
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    const onlineCustomers = sessions.filter((s: any) => 
      new Date(s.lastActivity).getTime() > thirtyMinAgo
    ).length;

    // Recent revenue (last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentRevenue = orders
      .filter((o: any) => new Date(o.createdAt).getTime() > oneHourAgo)
      .reduce((sum: number, order: any) => {
        const orderTotal = order.items.reduce((total: number, item: any) => 
          total + (item.price * item.quantity), 0
        );
        return sum + orderTotal;
      }, 0);

    setLiveStats({
      activeOrders,
      todayBookings,
      onlineCustomers,
      recentRevenue
    });
  };

  const getOrderStatusInfo = (status: string) => {
    const statusMap: any = {
      PENDING: {
        label: 'Received',
        icon: Bell,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500/10'
      },
      PREPARING: {
        label: 'Preparing',
        icon: ChefHat,
        color: 'text-blue-600',
        bgColor: 'bg-blue-500/10'
      },
      READY: {
        label: 'Ready',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-500/10'
      },
      SERVED: {
        label: 'Served',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-500/10'
      },
      COMPLETED: {
        label: 'Completed',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-500/10'
      }
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Live Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Active Orders</p>
                  <p className="text-2xl text-primary">{liveStats.activeOrders}</p>
                </div>
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Today's Bookings</p>
                  <p className="text-2xl text-blue-600">{liveStats.todayBookings}</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Online Now</p>
                  <p className="text-2xl text-green-600">{liveStats.onlineCustomers}</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <div className="relative">
                    <UserPlus className="h-5 w-5 text-green-600" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Hour</p>
                  <p className="text-2xl text-purple-600">${liveStats.recentRevenue.toFixed(0)}</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <Card className="bg-card/70 backdrop-blur-xl border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            Live Activity Feed
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Real-time updates from your coffee shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <AnimatePresence>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-colors">
                        <div className={`p-2 rounded-lg ${activity.bgColor} shrink-0`}>
                          <activity.icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${activity.color}`}>
                              {activity.action}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {getTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Activity will appear here in real-time
                  </p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
