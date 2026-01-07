import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  Award,
  TrendingUp,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Star,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { PaymentHistory } from '../components/customer/PaymentHistory';
import { CustomerFeedback } from '../components/customer/CustomerFeedback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'Downtown District, City'
  });
  
  // UI STATE: Collapsible sections for cleaner interface
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const handleSaveChanges = async () => {
    try {
      // In real app, call the API to update profile
      // await updateProfile(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  // Mock stats based on role
  const getStatsForRole = () => {
    switch (user?.role) {
      case 'CUSTOMER':
        return [
          { label: 'Total Orders', value: '24', icon: ShoppingBag, color: 'text-primary' },
          { label: 'Loyalty Points', value: '1,250', icon: Award, color: 'text-accent' },
          { label: 'Member Since', value: 'Jan 2024', icon: Calendar, color: 'text-primary' },
        ];
      case 'CHEF':
        return [
          { label: 'Orders Completed', value: '156', icon: ChefHat, color: 'text-primary' },
          { label: 'Avg. Prep Time', value: '12 min', icon: Clock, color: 'text-accent' },
          { label: 'Rating', value: '4.8/5', icon: Award, color: 'text-primary' },
        ];
      case 'WAITER':
        return [
          { label: 'Tables Served', value: '89', icon: UtensilsCrossed, color: 'text-primary' },
          { label: 'Tips Earned', value: '$450', icon: TrendingUp, color: 'text-accent' },
          { label: 'Customer Rating', value: '4.9/5', icon: Award, color: 'text-primary' },
        ];
      case 'ADMIN':
        return [
          { label: 'Total Revenue', value: '$45,230', icon: TrendingUp, color: 'text-primary' },
          { label: 'Active Staff', value: '24', icon: User, color: 'text-accent' },
          { label: 'System Uptime', value: '99.9%', icon: Shield, color: 'text-primary' },
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();
  
  // Function to switch to payments tab
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header with Glass Effect */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-90" />
          
          {/* Glass overlay */}
          <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md border-4 border-white/50 flex items-center justify-center shadow-2xl">
                  <span className="text-6xl">
                    {user?.role === 'CHEF' ? '👨‍🍳' : 
                     user?.role === 'WAITER' ? '👨‍🍳' : 
                     user?.role === 'ADMIN' ? '👔' : '😊'}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                    {user?.role}
                  </Badge>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-white text-3xl mb-2">{user?.name}</h1>
                <div className="flex flex-col md:flex-row gap-3 text-white/90 text-sm mb-4">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Phone className="h-4 w-4" />
                    +1 (555) 123-4567
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80 justify-center md:justify-start">
                  <MapPin className="h-4 w-4" />
                  Downtown District, City
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                {user?.role === 'CUSTOMER' && (
                  <Button 
                    onClick={() => setActiveTab('payments')}
                    className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment History
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-0 bg-card/50 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <Badge className="bg-primary/10 text-primary border-0">
                    {user?.role}
                  </Badge>
                </div>
                <div className="text-3xl text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Profile Details Tabs */}
        <Card className="border-0 bg-card/50 backdrop-blur-md shadow-xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            {/* PRIMARY TABS - Always Visible */}
            <TabsList className={`grid w-full ${user?.role === 'CUSTOMER' ? 'grid-cols-2' : 'grid-cols-3'} bg-muted/50 backdrop-blur-sm`}>
              <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              {user?.role === 'CUSTOMER' && (
                <TabsTrigger value="more" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <MoreVertical className="h-4 w-4 mr-2" />
                  More Options
                </TabsTrigger>
              )}
              {user?.role !== 'CUSTOMER' && (
                <>
                  <TabsTrigger value="preferences" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="personal" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input 
                    id="name" 
                    disabled={!isEditing}
                    className="mt-2 bg-background/50 backdrop-blur-sm border-border"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    disabled={!isEditing}
                    className="mt-2 bg-background/50 backdrop-blur-sm border-border"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    disabled={!isEditing}
                    className="mt-2 bg-background/50 backdrop-blur-sm border-border"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-foreground">Location</Label>
                  <Input 
                    id="location" 
                    disabled={!isEditing}
                    className="mt-2 bg-background/50 backdrop-blur-sm border-border"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-primary to-accent text-white" onClick={handleSaveChanges}>
                    Save Changes
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border">
                  <h3 className="text-foreground mb-2">Language</h3>
                  <select className="w-full p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border text-foreground">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border">
                  <h3 className="text-foreground mb-2">Time Zone</h3>
                  <select className="w-full p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border text-foreground">
                    <option>EST (UTC-5)</option>
                    <option>PST (UTC-8)</option>
                    <option>GMT (UTC+0)</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-6">
              <div className="space-y-4">
                {['Order Updates', 'Promotions', 'System Alerts', 'Newsletter'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border">
                    <span className="text-foreground">{item}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                ))}
              </div>
            </TabsContent>

            {user?.role === 'CUSTOMER' && (
              <TabsContent value="payments" className="mt-6">
                <PaymentHistory />
              </TabsContent>
            )}
            
            {user?.role === 'CUSTOMER' && (
              <TabsContent value="feedback" className="mt-6">
                <CustomerFeedback />
              </TabsContent>
            )}
            
            {/* 🎯 CUSTOMER MORE OPTIONS - Organized Secondary Features */}
            {user?.role === 'CUSTOMER' && (
              <TabsContent value="more" className="mt-6 space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg text-foreground mb-2">Additional Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Access advanced features and settings
                  </p>
                </div>

                {/* 💳 PAYMENT HISTORY - Collapsible Section */}
                <Collapsible 
                  open={showAdvancedSettings} 
                  onOpenChange={setShowAdvancedSettings}
                  className="border border-border rounded-lg bg-card/30 backdrop-blur-sm"
                >
                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-foreground">Payment History</h4>
                        <p className="text-xs text-muted-foreground">View all transactions and refunds</p>
                      </div>
                    </div>
                    {showAdvancedSettings ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="pt-4 border-t border-border">
                      <PaymentHistory />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* ⭐ FEEDBACK & RATINGS - Collapsible Section */}
                <Collapsible 
                  open={showNotificationSettings} 
                  onOpenChange={setShowNotificationSettings}
                  className="border border-border rounded-lg bg-card/30 backdrop-blur-sm"
                >
                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Star className="h-5 w-5 text-accent" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-foreground">Feedback & Ratings</h4>
                        <p className="text-xs text-muted-foreground">Share your experience and rate our service</p>
                      </div>
                    </div>
                    {showNotificationSettings ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="pt-4 border-t border-border">
                      <CustomerFeedback />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* 🔔 NOTIFICATION PREFERENCES - Quick Access */}
                <Card className="border border-border bg-card/30 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-foreground">Notification Preferences</h4>
                      <p className="text-xs text-muted-foreground">Manage your notification settings</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Order Updates', desc: 'Get notified about order status changes' },
                      { label: 'Booking Confirmations', desc: 'Receive table booking confirmations' },
                      { label: 'Promotions & Offers', desc: 'Special deals and exclusive offers' },
                      { label: 'Newsletter', desc: 'Monthly news and updates' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* ⚙️ ADVANCED SETTINGS - Quick Links */}
                <Card className="border border-border bg-card/30 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-foreground">Preferences</h4>
                      <p className="text-xs text-muted-foreground">Customize your experience</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/20">
                      <Label className="text-foreground text-sm">Language</Label>
                      <select className="w-full mt-2 p-2 rounded-lg bg-background/50 border border-border text-foreground text-sm">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20">
                      <Label className="text-foreground text-sm">Time Zone</Label>
                      <select className="w-full mt-2 p-2 rounded-lg bg-background/50 border border-border text-foreground text-sm">
                        <option>EST (UTC-5)</option>
                        <option>PST (UTC-8)</option>
                        <option>GMT (UTC+0)</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}