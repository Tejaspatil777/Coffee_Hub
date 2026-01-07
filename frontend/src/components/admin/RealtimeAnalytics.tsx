import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Award,
  Activity,
  Coffee,
  Flame,
  Target,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  todayRevenue: number;
  yesterdayRevenue: number;
  todayOrders: number;
  yesterdayOrders: number;
  activeCustomers: number;
  avgOrderValue: number;
  peakHour: string;
  topCategory: string;
  completionRate: number;
  avgPreparationTime: number;
}

export function RealtimeAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    todayRevenue: 0,
    yesterdayRevenue: 0,
    todayOrders: 0,
    yesterdayOrders: 0,
    activeCustomers: 0,
    avgOrderValue: 0,
    peakHour: '12:00 PM',
    topCategory: 'Hot Coffees',
    completionRate: 0,
    avgPreparationTime: 0
  });

  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    calculateAnalytics();
    
    // Listen for real-time updates
    const handleOrderUpdate = () => {
      calculateAnalytics();
    };

    window.addEventListener('orderUpdated', handleOrderUpdate);
    window.addEventListener('menuUpdated', handleOrderUpdate);

    // Refresh every 10 seconds
    const interval = setInterval(calculateAnalytics, 10000);

    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate);
      window.removeEventListener('menuUpdated', handleOrderUpdate);
      clearInterval(interval);
    };
  }, []);

  const calculateAnalytics = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Today's metrics
    const todayOrders = orders.filter((o: any) => 
      new Date(o.createdAt).toDateString() === today
    );
    const yesterdayOrders = orders.filter((o: any) => 
      new Date(o.createdAt).toDateString() === yesterday
    );

    const todayRevenue = todayOrders.reduce((sum: number, order: any) => {
      const orderTotal = order.items.reduce((total: number, item: any) => 
        total + (item.price * item.quantity), 0
      );
      return sum + orderTotal;
    }, 0);

    const yesterdayRevenue = yesterdayOrders.reduce((sum: number, order: any) => {
      const orderTotal = order.items.reduce((total: number, item: any) => 
        total + (item.price * item.quantity), 0
      );
      return sum + orderTotal;
    }, 0);

    // Active customers (unique today)
    const activeCustomers = new Set(
      todayOrders.map((o: any) => o.booking?.customerName || o.customerId)
    ).size;

    // Average order value
    const avgOrderValue = todayOrders.length > 0 
      ? todayRevenue / todayOrders.length 
      : 0;

    // Completion rate
    const completedOrders = todayOrders.filter((o: any) => 
      o.status === 'SERVED' || o.status === 'COMPLETED'
    );
    const completionRate = todayOrders.length > 0 
      ? (completedOrders.length / todayOrders.length) * 100 
      : 0;

    // Average preparation time (in minutes)
    const prepTimes = todayOrders
      .filter((o: any) => o.completedAt && o.createdAt)
      .map((o: any) => {
        const created = new Date(o.createdAt).getTime();
        const completed = new Date(o.completedAt).getTime();
        return (completed - created) / 60000; // Convert to minutes
      });
    const avgPreparationTime = prepTimes.length > 0
      ? prepTimes.reduce((a: number, b: number) => a + b, 0) / prepTimes.length
      : 15;

    // Hourly data for today
    const hourlyRevenue: any = {};
    todayOrders.forEach((order: any) => {
      const hour = new Date(order.createdAt).getHours();
      const hourLabel = `${hour}:00`;
      const orderTotal = order.items.reduce((total: number, item: any) => 
        total + (item.price * item.quantity), 0
      );
      hourlyRevenue[hourLabel] = (hourlyRevenue[hourLabel] || 0) + orderTotal;
    });

    const hourlyChartData = Object.entries(hourlyRevenue)
      .map(([hour, revenue]) => ({ hour, revenue, orders: 0 }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    // Category distribution
    const categoryCount: any = {};
    todayOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
    });

    const categoryChartData = Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 6);

    // Top category
    const topCategory = categoryChartData.length > 0 
      ? categoryChartData[0].name 
      : 'Hot Coffees';

    // Weekly data
    const weeklyChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toDateString();
      const dayOrders = orders.filter((o: any) => 
        new Date(o.createdAt).toDateString() === dateStr
      );
      const revenue = dayOrders.reduce((sum: number, order: any) => {
        const orderTotal = order.items.reduce((total: number, item: any) => 
          total + (item.price * item.quantity), 0
        );
        return sum + orderTotal;
      }, 0);
      
      weeklyChartData.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        revenue: Math.round(revenue),
        orders: dayOrders.length
      });
    }

    // Peak hour
    const peakHourData = Object.entries(hourlyRevenue).sort((a: any, b: any) => b[1] - a[1]);
    const peakHour = peakHourData.length > 0 
      ? peakHourData[0][0] 
      : '12:00';

    setAnalytics({
      todayRevenue,
      yesterdayRevenue,
      todayOrders: todayOrders.length,
      yesterdayOrders: yesterdayOrders.length,
      activeCustomers,
      avgOrderValue,
      peakHour,
      topCategory,
      completionRate,
      avgPreparationTime
    });

    setHourlyData(hourlyChartData);
    setCategoryData(categoryChartData);
    setWeeklyData(weeklyChartData);
  };

  const COLORS = ['#FF6B35', '#F7931E', '#FDC830', '#4ECDC4', '#45B7D1', '#96CEB4'];

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = 'text-primary',
    bgColor = 'bg-primary/10'
  }: any) => {
    const isPositive = trend === 'up';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const trendColor = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <Card className="bg-card/70 backdrop-blur-xl border-border overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} rounded-full -mr-16 -mt-16 opacity-20`} />
        <CardContent className="pt-6 relative">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${bgColor}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            {trendValue && (
              <Badge variant="outline" className={`${trendColor} border-current`}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {trendValue}%
              </Badge>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className={`text-2xl ${color}`}>{value}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const revenueChange = analytics.yesterdayRevenue > 0
    ? (((analytics.todayRevenue - analytics.yesterdayRevenue) / analytics.yesterdayRevenue) * 100).toFixed(1)
    : 0;
  const ordersChange = analytics.yesterdayOrders > 0
    ? (((analytics.todayOrders - analytics.yesterdayOrders) / analytics.yesterdayOrders) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`$${analytics.todayRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={Number(revenueChange) >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(Number(revenueChange))}
          color="text-green-600 dark:text-green-500"
          bgColor="bg-green-500/10"
        />
        <StatCard
          title="Today's Orders"
          value={analytics.todayOrders}
          icon={ShoppingBag}
          trend={Number(ordersChange) >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(Number(ordersChange))}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          title="Active Customers"
          value={analytics.activeCustomers}
          icon={Users}
          color="text-blue-600 dark:text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          title="Avg Order Value"
          value={`$${analytics.avgOrderValue.toFixed(2)}`}
          icon={Target}
          color="text-purple-600 dark:text-purple-500"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-2xl text-green-600 dark:text-green-500">
                  {analytics.completionRate.toFixed(1)}%
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Prep Time</p>
                <p className="text-2xl text-blue-600 dark:text-blue-500">
                  {analytics.avgPreparationTime.toFixed(0)}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Peak Hour</p>
                <p className="text-2xl text-primary">
                  {analytics.peakHour}
                </p>
              </div>
              <Flame className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Top Category</p>
                <p className="text-sm text-primary line-clamp-1">
                  {analytics.topCategory}
                </p>
              </div>
              <Coffee className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Trend */}
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Weekly Revenue Trend
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Last 7 days performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FF6B35" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" />
              Popular Categories
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Today's order distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's Hourly Performance */}
      {hourlyData.length > 0 && (
        <Card className="bg-card/70 backdrop-blur-xl border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Hourly Performance
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Revenue distribution throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="revenue" fill="#FF6B35" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
