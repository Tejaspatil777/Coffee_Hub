import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Progress } from '../../components/ui/progress';
import { 
  Users, 
  ChefHat, 
  UtensilsCrossed, 
  UserCheck, 
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Trash2,
  Plus,
  LayoutDashboard,
  Mail,
  Send,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  TrendingDown,
  Award,
  Target,
  Settings,
  Bell,
  Palette,
  Eye,
  Activity,
  Calendar,
  ArrowRightLeft,
  TableIcon,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Coffee,
  MapPin,
  RefreshCw,
  Star,
  Link2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../../components/ui/separator';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Textarea } from '../../components/ui/textarea';
import { CustomersList } from '../../components/admin/CustomersList';
import { CustomerDetail } from '../../components/admin/CustomerDetail';
import { BookingNotifications } from '../../components/admin/BookingNotifications';
import { ActiveCustomerSessions } from '../../components/admin/ActiveCustomerSessions';
import { StaffManagement } from '../../components/admin/StaffManagement';
import { OrderReassignment } from '../../components/admin/OrderReassignment';
import { MenuManagement } from '../../components/admin/MenuManagement';
import { TableManagementSystem } from '../../components/admin/TableManagementSystem';
import { RefundManagement } from '../../components/admin/RefundManagement';
import { OrderManagement } from '../../components/admin/OrderManagement';
import { LocationManagement } from '../../components/admin/LocationManagement';
import { FeedbackManagement } from '../../components/admin/FeedbackManagement';
import { StaffInviteManager } from '../../components/admin/StaffInviteManager';
import { getUnreadNotificationsCount } from '../../services/bookingService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { 
  getRealtimeStats, 
  getMostSellingItems,
  subscribeToRealtimeUpdates,
  REALTIME_EVENTS,
  clearCompletedOrders,
  clearCancelledBookings,
} from '../../services/realtimeSync';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'CHEF' | 'WAITER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'CHEF' | 'WAITER';
  status: 'ACTIVE' | 'INACTIVE';
  shift: string;
  assignedOrders: number;
  completedOrders: number;
  performance: number;
  joinDate: string;
}

interface CustomerRequirement {
  id: string;
  customerId: string;
  customerName: string;
  requirement: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<CustomerRequirement[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'CHEF' | 'WAITER'>('CHEF');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const [mostSellingItems, setMostSellingItems] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStaff: 0,
    todayOrders: 0,
    revenue: 0,
    pendingRequirements: 0,
    completionRate: 0,
    availableMenuItems: 0,
    totalMenuItems: 0
  });

  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToRealtimeUpdates(
      [
        REALTIME_EVENTS.BOOKING_UPDATED,
        REALTIME_EVENTS.ORDER_UPDATED,
        REALTIME_EVENTS.MENU_UPDATED,
        REALTIME_EVENTS.STAFF_UPDATED,
        REALTIME_EVENTS.CUSTOMER_UPDATED,
        REALTIME_EVENTS.PAYMENT_UPDATED,
        REALTIME_EVENTS.REQUIREMENT_UPDATED,
      ],
      () => {
        loadDashboardData();
      }
    );

    // Initialize sample requirements if none exist
    const storedRequirements = JSON.parse(localStorage.getItem('customerRequirements') || '[]');
    if (storedRequirements.length === 0) {
      const sampleRequirements: CustomerRequirement[] = [
        {
          id: '1',
          customerId: 'c1',
          customerName: 'John Doe',
          requirement: 'Request for vegan options in the menu',
          priority: 'HIGH',
          status: 'PENDING',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          customerId: 'c2',
          customerName: 'Jane Smith',
          requirement: 'Suggest adding more dessert varieties',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          customerId: 'c3',
          customerName: 'Mike Johnson',
          requirement: 'WiFi password not working in corner tables',
          priority: 'HIGH',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 43200000).toISOString()
        }
      ];
      localStorage.setItem('customerRequirements', JSON.stringify(sampleRequirements));
      setRequirements(sampleRequirements);
    } else {
      setRequirements(storedRequirements);
    }

    return unsubscribe;
  }, []);

  const loadDashboardData = () => {
    // Load users
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);

    // Load staff with enhanced data
    const staffMembers = storedUsers.filter((u: User) => 
      u.role === 'CHEF' || u.role === 'WAITER'
    ).map((u: User) => ({
      ...u,
      shift: ['Morning', 'Afternoon', 'Evening'][Math.floor(Math.random() * 3)],
      assignedOrders: Math.floor(Math.random() * 15) + 5,
      completedOrders: Math.floor(Math.random() * 12) + 3,
      performance: Math.floor(Math.random() * 30) + 70,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
    setStaff(staffMembers);

    // Load orders
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders);

    // Load requirements
    const storedRequirements = JSON.parse(localStorage.getItem('customerRequirements') || '[]');
    
    // Get real-time stats
    const realtimeStats = getRealtimeStats();
    const selling = getMostSellingItems(5);
    setMostSellingItems(selling);
    
    setStats({
      totalUsers: realtimeStats.totalCustomers,
      activeStaff: realtimeStats.activeStaff,
      todayOrders: realtimeStats.todayOrders,
      revenue: realtimeStats.totalRevenue,
      pendingRequirements: realtimeStats.pendingRequirements,
      completionRate: Math.round(realtimeStats.completionRate),
      availableMenuItems: realtimeStats.availableMenuItems,
      totalMenuItems: realtimeStats.totalMenuItems,
    });
  };

  const handleRefreshView = () => {
    loadDashboardData();
    toast.success('Dashboard refreshed successfully');
  };

  const handleClearCompleted = () => {
    const count = clearCompletedOrders();
    toast.success(`Cleared ${count} completed orders`);
    loadDashboardData();
  };

  const handleClearCancelled = () => {
    const count = clearCancelledBookings();
    toast.success(`Cleared ${count} cancelled bookings`);
    loadDashboardData();
  };

  const handleSendInvite = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // Simulate sending invitation
    toast.success(`Invitation sent to ${inviteEmail}`);
    
    // Store invitation
    const invitations = JSON.parse(localStorage.getItem('staffInvitations') || '[]');
    invitations.push({
      email: inviteEmail,
      role: inviteRole,
      message: inviteMessage,
      sentAt: new Date().toISOString(),
      status: 'PENDING'
    });
    localStorage.setItem('staffInvitations', JSON.stringify(invitations));
    
    setShowInviteDialog(false);
    setInviteEmail('');
    setInviteMessage('');
  };

  const handleAddStaff = (formData: any) => {
    const newStaff: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newStaff];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadDashboardData();
    toast.success('Staff member added successfully');
    setShowStaffDialog(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' as 'ACTIVE' | 'INACTIVE' }
        : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('User status updated');
    loadDashboardData();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      toast.success('User deleted');
      loadDashboardData();
    }
  };

  const handleUpdateRequirement = (reqId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    const updatedRequirements = requirements.map(r =>
      r.id === reqId ? { ...r, status: newStatus } : r
    );
    setRequirements(updatedRequirements);
    localStorage.setItem('customerRequirements', JSON.stringify(updatedRequirements));
    toast.success('Requirement status updated');
    loadDashboardData();
  };

  // Revenue chart data
  const revenueData = [
    { name: 'Mon', revenue: 1200, orders: 45 },
    { name: 'Tue', revenue: 1800, orders: 62 },
    { name: 'Wed', revenue: 1500, orders: 55 },
    { name: 'Thu', revenue: 2200, orders: 78 },
    { name: 'Fri', revenue: 2800, orders: 95 },
    { name: 'Sat', revenue: 3200, orders: 110 },
    { name: 'Sun', revenue: 2600, orders: 88 }
  ];

  // Staff performance data
  const staffPerformanceData = staff.slice(0, 5).map(s => ({
    name: s.name.split(' ')[0],
    performance: s.performance,
    completed: s.completedOrders
  }));

  // Order status distribution
  const orderStatusData = [
    { name: 'Completed', value: orders.filter(o => o.status === 'DELIVERED').length, color: '#10B981' },
    { name: 'Preparing', value: orders.filter(o => o.status === 'PREPARING').length, color: '#FF8C42' },
    { name: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, color: '#FFA62B' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-foreground">Admin Dashboard ☕</h1>
                <p className="text-muted-foreground">Comprehensive business management and analytics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshView}
                className="border-border"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-accent text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Invite Staff
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Invite Staff Member</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Send an invitation to join your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="staff@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Role</Label>
                    <Select value={inviteRole} onValueChange={(val) => setInviteRole(val as 'CHEF' | 'WAITER')}>
                      <SelectTrigger className="bg-input-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="CHEF">Chef</SelectItem>
                        <SelectItem value="WAITER">Waiter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground">Personal Message (Optional)</Label>
                    <Textarea
                      placeholder="Welcome to our team..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="border-border">
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvite} className="bg-primary hover:bg-accent text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards - Now Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="bg-card border-border cursor-pointer hover:shadow-lg transition-shadow" 
            onClick={() => setActiveTab('customers')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl text-foreground mt-1">{stats.totalUsers}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% from last month
                  </p>
                </div>
                <Users className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('staff-management')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-2xl text-foreground mt-1">{stats.activeStaff}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    All operational
                  </p>
                </div>
                <UserCheck className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('orders')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Orders</p>
                  <p className="text-2xl text-foreground mt-1">{stats.todayOrders}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {stats.completionRate}% completion
                  </p>
                </div>
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('menu')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Menu Items</p>
                  <p className="text-2xl text-foreground mt-1">{stats.availableMenuItems}/{stats.totalMenuItems}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <Coffee className="h-3 w-3" />
                    Available items
                  </p>
                </div>
                <Coffee className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 📊 ANALYTICS & REVENUE SECTION - Always Visible */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Revenue Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Revenue Analytics
              </CardTitle>
              <CardDescription className="text-muted-foreground">Weekly revenue and order trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 107, 53, 0.1)" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} name="Revenue ($)" />
                  <Line type="monotone" dataKey="orders" stroke="#FF8C42" strokeWidth={2} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Staff Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Staff Performance
              </CardTitle>
              <CardDescription className="text-muted-foreground">Top performing staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={staffPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 107, 53, 0.1)" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#FF6B35" name="Completed Orders" />
                  <Bar dataKey="performance" fill="#FF8C42" name="Performance %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Order Distribution & Quick Stats */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Order Distribution
              </CardTitle>
              <CardDescription className="text-muted-foreground">Orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-foreground">Pending</span>
                  </div>
                  <span className="text-foreground">{orders.filter(o => o.status === 'PENDING').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-foreground">In Progress</span>
                  </div>
                  <span className="text-foreground">{orders.filter(o => o.status === 'IN_PROGRESS').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-foreground">Completed</span>
                  </div>
                  <span className="text-foreground">{orders.filter(o => o.status === 'COMPLETED').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-foreground">Cancelled</span>
                  </div>
                  <span className="text-foreground">{orders.filter(o => o.status === 'CANCELLED').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
              <CardDescription className="text-muted-foreground">Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Order Value</span>
                  <span className="text-foreground">${orders.length > 0 ? (stats.revenue / orders.length).toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Customers</span>
                  <span className="text-foreground">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Staff</span>
                  <span className="text-foreground">{stats.activeStaff}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="text-foreground">{stats.completionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🎯 ADMIN MANAGEMENT TABS - Organized for Clean UI */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2">
            {/* PRIMARY TABS - Essential Admin Functions */}
            <TabsList className="inline-flex w-auto min-w-full bg-card border border-border gap-1 p-1">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="tables" className="data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">
              <TableIcon className="h-4 w-4 mr-2" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">
              <Coffee className="h-4 w-4 mr-2" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="staff-management" className="data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">
              <UserCheck className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">
              <Users className="h-4 w-4 mr-2" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">
              <Star className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="more" className="data-[state=active]:bg-accent data-[state=active]:text-white whitespace-nowrap">
              <MoreVertical className="h-4 w-4 mr-2" />
              More Options
            </TabsTrigger>
            </TabsList>
          </div>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BookingNotifications />
              </div>
              <div>
                <ActiveCustomerSessions />
              </div>
            </div>
          </TabsContent>

          {/* Table Management Tab */}
          <TabsContent value="tables" className="space-y-6">
            <TableManagementSystem />
          </TabsContent>

          {/* Orders Tab with Full Management */}
          <TabsContent value="orders" className="space-y-6">
            <OrderManagement />
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu" className="space-y-6">
            <MenuManagement />
          </TabsContent>

          {/* Location Management Tab */}
          <TabsContent value="location" className="space-y-6">
            <LocationManagement />
          </TabsContent>

          {/* Feedback Management Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <FeedbackManagement />
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            {selectedCustomerId ? (
              <CustomerDetail 
                customerId={selectedCustomerId} 
                onBack={() => setSelectedCustomerId(null)}
              />
            ) : (
              <CustomersList onCustomerClick={setSelectedCustomerId} />
            )}
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-foreground">Staff Management</CardTitle>
                    <CardDescription className="text-muted-foreground">Manage and track staff performance</CardDescription>
                  </div>
                  <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-accent text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Staff
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Add New Staff Member</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Add a new staff member to your team
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleAddStaff({
                          name: formData.get('name'),
                          email: formData.get('email'),
                          role: formData.get('role')
                        });
                      }}>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label className="text-foreground">Name</Label>
                            <Input name="name" required className="bg-input-background border-border text-foreground" />
                          </div>
                          <div>
                            <Label className="text-foreground">Email</Label>
                            <Input name="email" type="email" required className="bg-input-background border-border text-foreground" />
                          </div>
                          <div>
                            <Label className="text-foreground">Role</Label>
                            <Select name="role" defaultValue="CHEF">
                              <SelectTrigger className="bg-input-background border-border text-foreground">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                <SelectItem value="CHEF">Chef</SelectItem>
                                <SelectItem value="WAITER">Waiter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-primary hover:bg-accent text-white">Add Staff</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.map(member => (
                    <div key={member.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            member.role === 'CHEF' 
                              ? 'bg-primary/10' 
                              : 'bg-accent/10'
                          }`}>
                            {member.role === 'CHEF' ? (
                              <ChefHat className="h-5 w-5 text-primary" />
                            ) : (
                              <UtensilsCrossed className="h-5 w-5 text-accent" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-foreground">{member.name}</p>
                              <Badge variant="outline" className="border-primary text-primary">{member.role}</Badge>
                              {member.performance >= 85 && (
                                <Badge className="bg-primary text-white">
                                  <Award className="h-3 w-3 mr-1" />
                                  Top Performer
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'} className="bg-primary text-white">
                            {member.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(member.id)}
                            className="border-border"
                          >
                            {member.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(member.id)}
                            className="text-destructive hover:text-destructive border-border"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-3 bg-border" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Shift</p>
                          <p className="text-sm text-foreground">{member.shift}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Assigned Orders</p>
                          <p className="text-sm text-foreground">{member.assignedOrders}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Completed Orders</p>
                          <p className="text-sm text-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            {member.completedOrders}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Performance</p>
                          <div className="flex items-center gap-2">
                            <Progress value={member.performance} className="flex-1 bg-muted" />
                            <span className="text-sm text-foreground">{member.performance}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {staff.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No staff members yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Availability Management Tab */}
          <TabsContent value="staff-management">
            <StaffManagement />
          </TabsContent>

          {/* Order Reassignment Tab */}
          <TabsContent value="order-reassignment">
            <OrderReassignment />
          </TabsContent>

          {/* Customer Requirements Tab */}
          <TabsContent value="requirements">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Customer Requirements</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Track and manage customer feedback and requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirements.map(req => (
                    <div key={req.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <p className="text-foreground">{req.customerName}</p>
                            <Badge className={
                              req.priority === 'HIGH' ? 'bg-destructive' :
                              req.priority === 'MEDIUM' ? 'bg-primary' :
                              'bg-muted text-foreground'
                            }>
                              {req.priority}
                            </Badge>
                            <Badge variant="outline" className={
                              req.status === 'COMPLETED' ? 'border-primary text-primary' :
                              req.status === 'IN_PROGRESS' ? 'border-accent text-accent' :
                              'border-border'
                            }>
                              {req.status === 'IN_PROGRESS' ? (
                                <Clock className="h-3 w-3 mr-1" />
                              ) : req.status === 'COMPLETED' ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertCircle className="h-3 w-3 mr-1" />
                              )}
                              {req.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{req.requirement}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Select
                          value={req.status}
                          onValueChange={(val) => handleUpdateRequirement(req.id, val as any)}
                        >
                          <SelectTrigger className="w-40 bg-input-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  {requirements.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No customer requirements yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Recent Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">Real-time system activity feed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm">New order placed</p>
                      <p className="text-xs text-muted-foreground">Order #A123B456 by John Doe • 5 mins ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="bg-accent/10 p-2 rounded-full">
                      <UserCheck className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm">Staff member joined</p>
                      <p className="text-xs text-muted-foreground">Sarah Johnson accepted invitation as Chef • 15 mins ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm">Order completed</p>
                      <p className="text-xs text-muted-foreground">Order #B789C012 delivered successfully • 22 mins ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="bg-accent/10 p-2 rounded-full">
                      <MessageSquare className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm">New customer requirement</p>
                      <p className="text-xs text-muted-foreground">Mike Wilson requested gluten-free options • 1 hour ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm">New customer registered</p>
                      <p className="text-xs text-muted-foreground">Emma Davis created an account • 2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="bg-accent/10 p-2 rounded-full">
                      <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm">Revenue milestone reached</p>
                      <p className="text-xs text-muted-foreground">Daily revenue exceeded $5,000 • 3 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Invitations Tab */}
          <TabsContent value="invitations">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Staff Invitations</CardTitle>
                <CardDescription className="text-muted-foreground">View and manage sent invitations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const invitations = JSON.parse(localStorage.getItem('staffInvitations') || '[]');
                    return invitations.length > 0 ? (
                      invitations.map((invitation: any, index: number) => (
                        <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-3 rounded-full">
                                <Mail className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-foreground">{invitation.email}</p>
                                  <Badge variant="outline" className="border-primary text-primary">
                                    {invitation.role}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Sent: {new Date(invitation.sentAt).toLocaleDateString()}
                                </p>
                                {invitation.message && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    "{invitation.message}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge 
                              className={
                                invitation.status === 'ACCEPTED' ? 'bg-primary text-white' :
                                invitation.status === 'REJECTED' ? 'bg-destructive' :
                                'bg-muted text-foreground'
                              }
                            >
                              {invitation.status}
                            </Badge>
                          </div>
                          <Separator className="my-3 bg-border" />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const invitations = JSON.parse(localStorage.getItem('staffInvitations') || '[]');
                                invitations.splice(index, 1);
                                localStorage.setItem('staffInvitations', JSON.stringify(invitations));
                                toast.success('Invitation cancelled');
                                loadDashboardData();
                              }}
                              className="text-destructive hover:text-destructive border-border"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast.success(`Resent invitation to ${invitation.email}`);
                              }}
                              className="border-border"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Resend
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No invitations sent yet</p>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">General Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">Configure system preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-foreground">Restaurant Name</Label>
                    <Input 
                      defaultValue="TakeBits Coffee Shop" 
                      className="mt-2 bg-input-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Contact Email</Label>
                    <Input 
                      type="email"
                      defaultValue="contact@takebits.com" 
                      className="mt-2 bg-input-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Business Hours</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input 
                        type="time"
                        defaultValue="08:00" 
                        className="bg-input-background border-border text-foreground"
                      />
                      <Input 
                        type="time"
                        defaultValue="22:00" 
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-foreground">Tax Rate (%)</Label>
                    <Input 
                      type="number"
                      defaultValue="8.5" 
                      step="0.1"
                      className="mt-2 bg-input-background border-border text-foreground"
                    />
                  </div>
                  <Button className="bg-primary hover:bg-accent text-white" onClick={() => toast.success('General settings saved!')}>
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Notification Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">Manage notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    'Email notifications for new orders',
                    'SMS alerts for urgent requirements',
                    'Daily revenue reports',
                    'Weekly staff performance reports',
                    'Customer feedback notifications'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-foreground">{item}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={index % 2 === 0} />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-foreground">Theme</Label>
                    <Select defaultValue="light">
                      <SelectTrigger className="mt-2 bg-input-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground">Primary Color</Label>
                    <div className="flex gap-3 mt-2">
                      {['#FF6B35', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'].map((color) => (
                        <button
                          key={color}
                          className="w-10 h-10 rounded-full border-2 border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => toast.success(`Color ${color} selected`)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-accent text-white" onClick={() => toast.success('Appearance settings saved!')}>
                    Save Appearance
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Advanced Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">System configuration and maintenance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                    <div>
                      <p className="text-foreground">Export Data</p>
                      <p className="text-xs text-muted-foreground">Download all system data as JSON</p>
                    </div>
                    <Button variant="outline" className="border-border" onClick={() => toast.success('Data exported successfully!')}>
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                    <div>
                      <p className="text-foreground">Clear Cache</p>
                      <p className="text-xs text-muted-foreground">Remove temporary data and cached files</p>
                    </div>
                    <Button variant="outline" className="border-border" onClick={() => toast.success('Cache cleared!')}>
                      Clear
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-destructive bg-destructive/10">
                    <div>
                      <p className="text-foreground">Reset System</p>
                      <p className="text-xs text-muted-foreground">Warning: This will delete all data</p>
                    </div>
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={() => {
                      if (window.confirm('Are you sure? This will delete ALL data!')) {
                        localStorage.clear();
                        toast.success('System reset complete');
                        window.location.reload();
                      }
                    }}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 🎯 MORE OPTIONS TAB - Organized Secondary Admin Features */}
          <TabsContent value="more" className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg text-foreground mb-2">Additional Management Options</h3>
              <p className="text-sm text-muted-foreground">
                Access advanced features and system management tools
              </p>
            </div>

            {/* 🔧 SYSTEM CLEANUP UTILITIES */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  System Cleanup & Maintenance
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage system data and perform cleanup operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/30 border-border">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <h4 className="text-foreground">Clear Completed Orders</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Remove all completed and delivered orders from the system
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleClearCompleted}
                          className="w-full border-border"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Completed Orders
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30 border-border">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <h4 className="text-foreground">Clear Cancelled Bookings</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Remove all cancelled bookings from the system
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleClearCancelled}
                          className="w-full border-border"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Cancelled Bookings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30 border-border">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 text-blue-600" />
                          <h4 className="text-foreground">Refresh All Data</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reload all dashboard data from storage
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRefreshView}
                          className="w-full border-border"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30 border-border">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-purple-600" />
                          <h4 className="text-foreground">Real-time Sync</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Real-time updates are active across all modules
                        </p>
                        <Badge className="bg-green-500 text-white">
                          <Activity className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>



            {/* 👥 STAFF MANAGEMENT - Collapsible */}
            <Collapsible className="border border-border rounded-lg bg-card/30 backdrop-blur-sm">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-foreground">Staff Overview</h4>
                    <p className="text-xs text-muted-foreground">View all staff members and performance</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-border">
                  <StaffManagement />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 🔄 ORDER REASSIGNMENT - Collapsible */}
            <Collapsible className="border border-border rounded-lg bg-card/30 backdrop-blur-sm">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <ArrowRightLeft className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-foreground">Order Queue Management</h4>
                    <p className="text-xs text-muted-foreground">Reassign orders to available staff</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-border">
                  <OrderReassignment />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 💬 CUSTOMER REQUIREMENTS - Collapsible */}
            <Collapsible className="border border-border rounded-lg bg-card/30 backdrop-blur-sm">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-foreground">Customer Requirements</h4>
                    <p className="text-xs text-muted-foreground">Manage special requests and feedback</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-border">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Customer Requirements
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Track and manage customer requests and special requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {requirements.map((req) => (
                          <div key={req.id} className="p-4 rounded-lg border border-border bg-muted/20">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-foreground">{req.customerName}</span>
                                  <Badge className={
                                    req.priority === 'HIGH' ? 'bg-destructive' :
                                    req.priority === 'MEDIUM' ? 'bg-accent' :
                                    'bg-muted'
                                  }>
                                    {req.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{req.requirement}</p>
                              </div>
                              <Select 
                                value={req.status} 
                                onValueChange={(val) => handleUpdateRequirement(req.id, val as any)}
                              >
                                <SelectTrigger className="w-32 bg-input-background border-border text-foreground">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  <SelectItem value="PENDING">Pending</SelectItem>
                                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                  <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 👤 CUSTOMER DATABASE - Collapsible */}
            <Collapsible className="border border-border rounded-lg bg-card/30 backdrop-blur-sm">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-foreground">Customer Database</h4>
                    <p className="text-xs text-muted-foreground">View and manage all customer accounts</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-border">
                  <CustomersList onSelectCustomer={setSelectedCustomerId} />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 📋 ACTIVITY LOG - Collapsible */}
            <Collapsible className="border border-border rounded-lg bg-card/30 backdrop-blur-sm">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-foreground">Activity Log</h4>
                    <p className="text-xs text-muted-foreground">System activity and user actions</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-border">
                  <ActiveCustomerSessions />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 💳 REFUND MANAGEMENT - Collapsible */}
            <Collapsible className="border border-border rounded-lg bg-card/30 backdrop-blur-sm">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-foreground">Refund Management</h4>
                    <p className="text-xs text-muted-foreground">Process and track payment refunds</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-border">
                  <RefundManagement />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 👁️ STAFF INVITATIONS - Collapsible */}
            <Collapsible className="border border-border rounded-lg bg-card/30 backdrop-blur-sm">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-foreground">Staff Invitations</h4>
                    <p className="text-xs text-muted-foreground">Track sent invitations and their status</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-border">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground\">Pending Invitations</CardTitle>
                      <CardDescription className="text-muted-foreground">Track and manage staff invitations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          const invitations = JSON.parse(localStorage.getItem('staffInvitations') || '[]');
                          return invitations.length > 0 ? (
                            invitations.map((invitation: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                                <div>
                                  <p className="text-foreground">{invitation.email}</p>
                                  <p className="text-xs text-muted-foreground">Role: {invitation.role}</p>
                                </div>
                                <Badge className="bg-accent">{invitation.status}</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-8">No invitations sent yet</p>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* ⚙️ SYSTEM SETTINGS - Collapsible */}
            <Collapsible className="border border-border rounded-lg bg-card/30 backdrop-blur-sm">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Settings className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-foreground">System Settings</h4>
                    <p className="text-xs text-muted-foreground">Configure system preferences and appearance</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-4 border-t border-border space-y-4">
                  {/* Notification Settings */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        'Email notifications for new orders',
                        'SMS alerts for urgent requirements',
                        'Daily revenue reports',
                        'Customer feedback notifications'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <span className="text-foreground text-sm">{item}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={index % 2 === 0} />
                            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          </label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Advanced Settings */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Advanced Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                        <div>
                          <p className="text-foreground text-sm">Export Data</p>
                          <p className="text-xs text-muted-foreground">Download system data</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toast.success('Data exported!')}>
                          Export
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                        <div>
                          <p className="text-foreground text-sm">Clear Cache</p>
                          <p className="text-xs text-muted-foreground">Remove temporary data</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toast.success('Cache cleared!')}>
                          Clear
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}