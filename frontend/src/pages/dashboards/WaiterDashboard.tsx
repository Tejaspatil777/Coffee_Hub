import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  UtensilsCrossed, 
  Clock, 
  CheckCircle, 
  Bell, 
  TrendingUp,
  Award,
  Users,
  DollarSign,
  Target,
  Activity,
  Coffee,
  Star,
  Zap,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { StaffFeedbackView } from '../../components/staff/StaffFeedbackView';

interface Order {
  id: string;
  items: any[];
  booking: any;
  status: string;
  createdAt: string;
}

export default function WaiterDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'ready' | 'served'>('all');
  const [stats, setStats] = useState({
    todayServed: 0,
    totalTables: 0,
    avgServiceTime: 0,
    todayRevenue: 0,
    customerRating: 0
  });
  const [tableData, setTableData] = useState<any[]>([]);

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
    setOrders(storedOrders);
  };

  const calculateStats = () => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const today = new Date().toDateString();
    
    // Today's served orders
    const todayServed = allOrders.filter((o: Order) =>
      new Date(o.createdAt).toDateString() === today &&
      (o.status === 'SERVED' || o.status === 'COMPLETED')
    ).length;

    // Total tables served
    const uniqueTables = new Set(
      allOrders
        .filter((o: Order) => new Date(o.createdAt).toDateString() === today)
        .map((o: Order) => o.booking.tableNumber || o.booking.tableId)
    );
    const totalTables = uniqueTables.size;

    // Today's revenue
    const todayRevenue = allOrders
      .filter((o: Order) => new Date(o.createdAt).toDateString() === today)
      .reduce((sum: number, order: Order) => {
        const orderTotal = order.items.reduce((total: number, item: any) => 
          total + (item.price * item.quantity), 0
        );
        return sum + orderTotal;
      }, 0);

    // Average service time
    const avgServiceTime = 8; // Placeholder

    // Customer rating
    const customerRating = 4.8; // Placeholder

    // Table distribution
    const tableOrders: any = {};
    allOrders
      .filter((o: Order) => new Date(o.createdAt).toDateString() === today)
      .forEach((o: Order) => {
        const tableNum = o.booking.tableNumber || o.booking.tableId;
        tableOrders[tableNum] = (tableOrders[tableNum] || 0) + 1;
      });
    
    const tableChartData = Object.entries(tableOrders)
      .map(([table, orders]) => ({ table, orders }))
      .sort((a: any, b: any) => b.orders - a.orders)
      .slice(0, 8);

    setStats({
      todayServed,
      totalTables,
      avgServiceTime,
      todayRevenue,
      customerRating
    });
    setTableData(tableChartData);
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = storedOrders.map((order: Order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('orderUpdated'));
    loadOrders();
    calculateStats();
    toast.success(`Order ${newStatus.toLowerCase()}`, {
      icon: newStatus === 'SERVED' ? '🍽️' : '✅'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return order.status === 'READY' || order.status === 'SERVED';
    if (filter === 'ready') return order.status === 'READY';
    if (filter === 'served') return order.status === 'SERVED';
    return true;
  });

  const readyCount = orders.filter(o => o.status === 'READY').length;
  const servedCount = orders.filter(o => o.status === 'SERVED').length;

  const COLORS = ['#FF6B35', '#F7931E', '#FDC830', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF8C42', '#FFA62B'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-foreground">Waiter Dashboard ☕</h1>
              <p className="text-muted-foreground">Real-time service management and table tracking</p>
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
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/20 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -mr-12 -mt-12" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ready to Serve</p>
                    <p className="text-3xl text-primary">{readyCount}</p>
                    {readyCount > 0 && (
                      <Badge variant="outline" className="mt-2 text-primary border-primary">
                        <Bell className="h-3 w-3 mr-1 animate-bounce" />
                        Pick up now
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <Bell className="h-8 w-8 text-primary animate-pulse" />
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
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Served Today</p>
                    <p className="text-3xl text-green-600 dark:text-green-400">{stats.todayServed}</p>
                    <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +22% vs yesterday
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
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tables Served</p>
                    <p className="text-3xl text-blue-600 dark:text-blue-400">{stats.totalTables}</p>
                    <p className="text-xs text-muted-foreground mt-2">Active tables today</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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
                    <p className="text-sm text-muted-foreground mb-1">Revenue Today</p>
                    <p className="text-2xl text-purple-600 dark:text-purple-400">${stats.todayRevenue.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground mt-2">From your service</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Table Distribution */}
          {tableData.length > 0 && (
            <Card className="bg-card/70 backdrop-blur-xl border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Table Activity
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Orders per table today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={tableData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="table" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
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

          {/* Performance Metrics */}
          <Card className="bg-card/70 backdrop-blur-xl border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your service quality today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Customer Rating
                  </span>
                  <span className="text-foreground">{stats.customerRating}/5.0</span>
                </div>
                <Progress value={stats.customerRating * 20} className="bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Service Speed
                  </span>
                  <span className="text-foreground">{stats.avgServiceTime}m avg</span>
                </div>
                <Progress value={85} className="bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    Order Accuracy
                  </span>
                  <span className="text-foreground">98%</span>
                </div>
                <Progress value={98} className="bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-orange-500" />
                    Today's Goal
                  </span>
                  <span className="text-foreground">{Math.round((stats.todayServed / 30) * 100)}%</span>
                </div>
                <Progress value={(stats.todayServed / 30) * 100} className="bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
          <TabsList className="bg-card/70 backdrop-blur-sm border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              All Active ({readyCount + servedCount})
            </TabsTrigger>
            <TabsTrigger value="ready" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Ready ({readyCount})
            </TabsTrigger>
            <TabsTrigger value="served" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Served ({servedCount})
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
                  <UtensilsCrossed className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="mb-2 text-foreground">No orders to display</h3>
                  <p className="text-muted-foreground">New orders will appear here in real-time</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredOrders.map((order, index) => {
                const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const isReady = order.status === 'READY';

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`backdrop-blur-xl border-2 ${
                      isReady
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                        : 'bg-card/70 border-border'
                    }`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-foreground">
                              Order #{order.id.toUpperCase().slice(0, 8)}
                              <Badge variant={isReady ? 'default' : 'secondary'} className={isReady ? 'bg-primary' : ''}>
                                {order.status}
                              </Badge>
                              {isReady && (
                                <Badge className="bg-orange-600 text-white animate-pulse">
                                  <Bell className="h-3 w-3 mr-1" />
                                  Ready
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="border-primary text-primary">
                            ${orderTotal.toFixed(2)}
                          </Badge>
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
                            <p className="text-xs text-muted-foreground">Customer</p>
                            <p className="text-foreground line-clamp-1">{order.booking.customerName}</p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="mb-2 text-sm text-foreground flex items-center gap-2">
                            <Coffee className="h-4 w-4" />
                            Order Items ({order.items.length}):
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-background/50 rounded border border-border">
                                <span className="text-foreground">
                                  <Badge variant="outline" className="mr-2">{item.quantity}x</Badge>
                                  {item.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {order.status === 'READY' && (
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => updateOrderStatus(order.id, 'SERVED')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Served
                            </Button>
                          )}
                          
                          {order.status === 'SERVED' && (
                            <Button
                              variant="outline"
                              className="flex-1 border-green-600 text-green-600"
                              disabled
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Served
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
                View customer feedback to improve service quality
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
  );
}