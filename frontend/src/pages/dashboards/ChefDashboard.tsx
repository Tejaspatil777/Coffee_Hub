import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Flame, 
  TrendingUp, 
  Award,
  Timer,
  Coffee,
  Target,
  Activity,
  Bell,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Settings,
  Star
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { StaffFeedbackView } from '../../components/staff/StaffFeedbackView';

interface Order {
  id: string;
  items: any[];
  booking: any;
  status: string;
  createdAt: string;
  startedAt?: string;
}

export default function ChefDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing'>('all');
  const [stats, setStats] = useState({
    todayCompleted: 0,
    avgPrepTime: 0,
    efficiency: 0,
    popularDish: ''
  });
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
    calculateStats();
    
    // Listen for real-time updates
    const handleOrderUpdate = () => {
      loadOrders();
      calculateStats();
    };

    window.addEventListener('orderUpdated', handleOrderUpdate);
    
    const interval = setInterval(() => {
      loadOrders();
      calculateStats();
    }, 3000);
    
    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders.filter((order: Order) => 
      order.status !== 'SERVED' && order.status !== 'COMPLETED'
    ));
  };

  const calculateStats = () => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const today = new Date().toDateString();
    
    // Today's completed orders
    const todayCompleted = allOrders.filter((o: Order) =>
      new Date(o.createdAt).toDateString() === today &&
      (o.status === 'READY' || o.status === 'SERVED' || o.status === 'COMPLETED')
    ).length;

    // Average prep time (in minutes)
    const completedWithTimes = allOrders.filter((o: Order) => o.startedAt && o.status === 'READY');
    const prepTimes = completedWithTimes.map((o: Order) => {
      const started = new Date(o.startedAt!).getTime();
      const completed = new Date(o.createdAt).getTime() + 15 * 60 * 1000; // Estimate
      return (completed - started) / 60000;
    });
    const avgPrepTime = prepTimes.length > 0 
      ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length 
      : 12;

    // Efficiency (based on completion vs pending)
    const activeOrders = allOrders.filter((o: Order) => 
      o.status !== 'CANCELLED'
    ).length;
    const efficiency = activeOrders > 0 
      ? (todayCompleted / activeOrders) * 100 
      : 85;

    // Popular dish
    const dishCounts: any = {};
    allOrders.forEach((o: Order) => {
      o.items.forEach((item: any) => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + 1;
      });
    });
    const popularDish = Object.entries(dishCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Espresso';

    // Performance data (hourly orders for today)
    const hourlyData: any = {};
    const todayOrders = allOrders.filter((o: Order) => 
      new Date(o.createdAt).toDateString() === today
    );
    todayOrders.forEach((o: Order) => {
      const hour = new Date(o.createdAt).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });
    const performanceChartData = Object.entries(hourlyData)
      .map(([hour, count]) => ({ hour: `${hour}:00`, orders: count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    setStats({
      todayCompleted,
      avgPrepTime: Math.round(avgPrepTime),
      efficiency: Math.round(efficiency),
      popularDish
    });
    setPerformanceData(performanceChartData);
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = storedOrders.map((order: Order) => {
      if (order.id === orderId) {
        const updates: any = { ...order, status: newStatus };
        if (newStatus === 'PREPARING' && !order.startedAt) {
          updates.startedAt = new Date().toISOString();
        }
        return updates;
      }
      return order;
    });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('orderUpdated'));
    loadOrders();
    calculateStats();
    toast.success(`Order ${newStatus.toLowerCase()}`, {
      icon: newStatus === 'READY' ? '✅' : '👨‍🍳'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'PENDING';
    if (filter === 'preparing') return order.status === 'PREPARING';
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING').length;

  const getOrderPriority = (order: Order) => {
    const minutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
    if (minutes > 15) return 'high';
    if (minutes > 8) return 'medium';
    return 'normal';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-foreground">Chef Dashboard ☕</h1>
              <p className="text-muted-foreground">Real-time kitchen management and order tracking</p>
            </div>
          </div>
        </div>

        {/* Statistics - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-12 -mt-12" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                    <p className="text-3xl text-red-600 dark:text-red-400">{pendingCount}</p>
                    {pendingCount > 0 && (
                      <Badge variant="outline" className="mt-2 text-red-600 border-red-600">
                        <Bell className="h-3 w-3 mr-1 animate-bounce" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
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
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">In Preparation</p>
                    <p className="text-3xl text-blue-600 dark:text-blue-400">{preparingCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">Active in kitchen</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Flame className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
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
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Today Completed</p>
                    <p className="text-3xl text-green-600 dark:text-green-400">{stats.todayCompleted}</p>
                    <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +15% vs yesterday
                    </Badge>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
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
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Prep Time</p>
                    <p className="text-3xl text-purple-600 dark:text-purple-400">{stats.avgPrepTime}m</p>
                    <p className="text-xs text-muted-foreground mt-2">Target: 15m</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Timer className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Chart */}
        {performanceData.length > 0 && (
          <Card className="bg-card/70 backdrop-blur-xl border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Today's Performance
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Hourly order distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="hour" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="orders" fill="#FF6B35" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/70 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Efficiency Rate</p>
                  <p className="text-2xl text-primary">{stats.efficiency}%</p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
              <Progress value={stats.efficiency} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Most Popular</p>
                  <p className="text-lg text-primary line-clamp-1">{stats.popularDish}</p>
                </div>
                <Coffee className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Active</p>
                  <p className="text-2xl text-primary">{orders.length}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
          <TabsList className="bg-card/70 backdrop-blur-sm border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              All Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="preparing" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Preparing ({preparingCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-card/70 backdrop-blur-xl border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="mb-2 text-foreground">No orders to display</h3>
                  <p className="text-muted-foreground">New orders will appear here in real-time</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredOrders.map((order, index) => {
                const priority = getOrderPriority(order);
                const isUrgent = priority === 'high';
                const waitTime = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`backdrop-blur-xl border-2 ${
                      isUrgent
                        ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                        : order.status === 'PENDING'
                        ? 'border-primary bg-primary/10'
                        : 'bg-card/70 border-border'
                    }`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-foreground">
                              Order #{order.id.toUpperCase().slice(0, 8)}
                              <Badge variant={order.status === 'PENDING' ? 'secondary' : 'default'}>
                                {order.status}
                              </Badge>
                              {isUrgent && (
                                <Badge className="bg-red-600 text-white animate-pulse">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Urgent
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {new Date(order.createdAt).toLocaleTimeString()}
                              <span className={`ml-2 ${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`}>
                                • {waitTime}m ago
                              </span>
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Table Info */}
                        <div className="flex gap-4 p-3 bg-background/50 rounded-lg border border-border">
                          <div>
                            <p className="text-xs text-muted-foreground">Table</p>
                            <p className="text-foreground">{order.booking.tableNumber || order.booking.tableId}</p>
                          </div>
                          <Separator orientation="vertical" />
                          <div>
                            <p className="text-xs text-muted-foreground">Guests</p>
                            <p className="text-foreground">{order.booking.guests}</p>
                          </div>
                          <Separator orientation="vertical" />
                          <div>
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="text-foreground">{order.booking.time}</p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="mb-2 text-sm text-foreground flex items-center gap-2">
                            <Coffee className="h-4 w-4" />
                            Items to Prepare:
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-background/50 rounded border border-border">
                                <span className="text-foreground">
                                  <Badge variant="outline" className="mr-2">{item.quantity}x</Badge>
                                  {item.name}
                                </span>
                                {item.dietaryType && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.dietaryType}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {order.status === 'PENDING' && (
                            <Button
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                            >
                              <ChefHat className="mr-2 h-4 w-4" />
                              Start Preparing
                            </Button>
                          )}
                          
                          {order.status === 'PREPARING' && (
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => updateOrderStatus(order.id, 'READY')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Ready
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* 🎯 CHEF MORE OPTIONS - Performance & Analytics */}
        <div className="mt-8">
          <Collapsible className="border border-border rounded-lg bg-card/70 backdrop-blur-xl">
            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="text-foreground">Performance Analytics</h4>
                  <p className="text-xs text-muted-foreground">View detailed statistics and trends</p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="pt-4 border-t border-border">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Performance Chart */}
                  <Card className="bg-card/70 backdrop-blur-xl border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Weekly Performance</CardTitle>
                      <CardDescription className="text-muted-foreground">Orders completed per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 107, 53, 0.1)" />
                          <XAxis dataKey="day" stroke="#6B7280" />
                          <YAxis stroke="#6B7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--card)', 
                              border: '1px solid var(--border)',
                              borderRadius: '8px'
                            }} 
                          />
                          <Line type="monotone" dataKey="completed" stroke="#FF6B35" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Efficiency Metrics */}
                  <Card className="bg-card/70 backdrop-blur-xl border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Efficiency Metrics</CardTitle>
                      <CardDescription className="text-muted-foreground">Your performance insights</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Order Completion Rate</span>
                          <span className="text-foreground">{stats.efficiency}%</span>
                        </div>
                        <Progress value={stats.efficiency} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Average Prep Time</span>
                          <span className="text-foreground">{stats.avgPrepTime.toFixed(1)} min</span>
                        </div>
                        <Progress value={(stats.avgPrepTime / 20) * 100} className="h-2" />
                      </div>
                      <Separator />
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-accent" />
                        <span className="text-muted-foreground">Most Popular:</span>
                        <span className="text-foreground">{stats.popularDish || 'N/A'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Customer Feedback Section */}
          <Collapsible className="mt-6">
            <Card className="bg-card/70 backdrop-blur-xl border-border">
              <CardHeader>
                <CollapsibleTrigger className="flex items-center justify-between w-full cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent" />
                    <CardTitle className="text-foreground">Customer Feedback & Ratings</CardTitle>
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </CollapsibleTrigger>
                <CardDescription className="text-muted-foreground mt-2">
                  View customer feedback to improve food quality
                </CardDescription>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <StaffFeedbackView />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
