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
  Activity
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../../components/ui/separator';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Textarea } from '../../components/ui/textarea';
import { RealtimeAnalytics } from '../../components/admin/RealtimeAnalytics';
import { LiveActivityFeed } from '../../components/admin/LiveActivityFeed';
import { MenuManagement } from '../../components/admin/MenuManagement';
import { CustomersList } from '../../components/admin/CustomersList';
import { CustomerDetail } from '../../components/admin/CustomerDetail';
import { ActiveCustomerSessions } from '../../components/admin/ActiveCustomerSessions';
import { BookingNotifications } from '../../components/admin/BookingNotifications';
import { StaffManagement } from '../../components/admin/StaffManagement';
import { OrderReassignment } from '../../components/admin/OrderReassignment';

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
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStaff: 0,
    todayOrders: 0,
    revenue: 0,
    pendingRequirements: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadDashboardData();
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
  }, []);

  const loadDashboardData = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);

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

    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders);

    const storedRequirements = JSON.parse(localStorage.getItem('customerRequirements') || '[]');
    
    const completedOrders = storedOrders.filter((o: any) => o.status === 'DELIVERED').length;
    const completionRate = storedOrders.length > 0 ? (completedOrders / storedOrders.length) * 100 : 0;
    
    setStats({
      totalUsers: storedUsers.filter((u: User) => u.role === 'CUSTOMER').length,
      activeStaff: staffMembers.filter((s: StaffMember) => s.status === 'ACTIVE').length,
      todayOrders: storedOrders.length,
      revenue: storedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      pendingRequirements: storedRequirements.filter((r: CustomerRequirement) => r.status === 'PENDING').length,
      completionRate: Math.round(completionRate)
    });
  };

  const handleSendInvite = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    toast.success(`Invitation sent to ${inviteEmail}`);
    
    const invitations = JSON.parse(localStorage.getItem('staffInvitations') || '[]');
    invitations.push({
      id: Math.random().toString(36).substr(2, 9),
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

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    toast.success(`Order #${orderId.slice(0, 8)} status updated to ${newStatus}`);
    loadDashboardData();
  };

  const revenueData = [
    { name: 'Mon', revenue: 1200, orders: 45 },
    { name: 'Tue', revenue: 1800, orders: 62 },
    { name: 'Wed', revenue: 1500, orders: 55 },
    { name: 'Thu', revenue: 2200, orders: 78 },
    { name: 'Fri', revenue: 2800, orders: 95 },
    { name: 'Sat', revenue: 3200, orders: 110 },
    { name: 'Sun', revenue: 2600, orders: 88 }
  ];

  const staffPerformanceData = staff.slice(0, 5).map(s => ({
    name: s.name.split(' ')[0],
    performance: s.performance,
    completed: s.completedOrders
  }));

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
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

          <Card className="bg-card border-border">
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

          <Card className="bg-card border-border">
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

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl text-foreground mt-1">${stats.revenue.toFixed(2)}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +18% from last week
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 lg:w-auto bg-card border border-border gap-1">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Requirements</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Customers</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <ShoppingBag className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Activity className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Eye className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Invitations</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Settings className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab - keeping existing content */}
          <TabsContent value="analytics" className="space-y-6">
            <RealtimeAnalytics />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <LiveActivityFeed />
          </TabsContent>

          {/* Continue with remaining tabs... */}
        </Tabs>
      </div>
    </div>
  );
}