import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft,
  Users, 
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  Ban,
  User,
  CalendarCheck
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Switch } from '../ui/switch';

interface CustomerDetailProps {
  customerId: string;
  onBack?: () => void;
}

interface Order {
  id: string;
  items: string[];
  date: string;
  amount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  orderStatus: 'DELIVERED' | 'PREPARING' | 'CANCELLED';
}

interface Booking {
  id: string;
  tableNumber: string;
  date: string;
  time: string;
  guests: number;
  location: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

// Mock customer data - replace with actual API call
const mockCustomerData = {
  c1: {
    id: 'c1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    gender: 'Male',
    registrationDate: '2024-01-15',
    status: 'ACTIVE',
    totalOrders: 24,
    totalSpent: 1250.00,
    orders: [
      {
        id: 'ORD001',
        items: ['Cappuccino', 'Croissant', 'Blueberry Muffin'],
        date: '2024-12-01',
        amount: 18.50,
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED'
      },
      {
        id: 'ORD002',
        items: ['Latte', 'Chocolate Cake'],
        date: '2024-11-28',
        amount: 15.00,
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED'
      },
      {
        id: 'ORD003',
        items: ['Espresso', 'Sandwich', 'Cookie'],
        date: '2024-11-25',
        amount: 22.75,
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED'
      },
      {
        id: 'ORD004',
        items: ['Cold Brew', 'Bagel'],
        date: '2024-11-20',
        amount: 12.00,
        paymentStatus: 'PENDING',
        orderStatus: 'PREPARING'
      }
    ],
    bookings: [
      {
        id: 'BK001',
        tableNumber: 'T5',
        date: '2024-12-10',
        time: '06:00 PM',
        guests: 4,
        location: 'TakeBits Downtown',
        status: 'CONFIRMED'
      },
      {
        id: 'BK002',
        tableNumber: 'T2',
        date: '2024-11-15',
        time: '07:30 PM',
        guests: 2,
        location: 'TakeBits Central Park',
        status: 'COMPLETED'
      },
      {
        id: 'BK003',
        tableNumber: 'T8',
        date: '2024-10-20',
        time: '12:00 PM',
        guests: 6,
        location: 'TakeBits Brooklyn',
        status: 'CANCELLED'
      }
    ]
  }
};

export function CustomerDetail({ customerId, onBack }: CustomerDetailProps) {
  const customerData = mockCustomerData[customerId as keyof typeof mockCustomerData] || mockCustomerData.c1;
  const [isActive, setIsActive] = useState(customerData.status === 'ACTIVE');

  const handleToggleStatus = () => {
    setIsActive(!isActive);
    toast.success(`Customer account ${!isActive ? 'activated' : 'blocked'} successfully`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="gap-2 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Button>
      )}

      {/* Customer Profile Card */}
      <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl">
                  {getInitials(customerData.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-foreground text-2xl">{customerData.name}</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Customer ID: #{customerData.id.toUpperCase()}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={isActive ? 'default' : 'destructive'}
                    className={
                      isActive
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }
                  >
                    {isActive ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Ban className="h-3 w-3 mr-1" />
                    )}
                    {isActive ? 'ACTIVE' : 'BLOCKED'}
                  </Badge>
                  <Badge variant="outline" className="border-primary/30 bg-primary/10">
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    {customerData.totalOrders} Orders
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggleStatus}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm">{customerData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm">{customerData.phone}</span>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Personal Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm">{customerData.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    Joined {new Date(customerData.registrationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Order Statistics</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <span className="text-sm">{customerData.totalOrders} Total Orders</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm">${customerData.totalSpent.toFixed(2)} Spent</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">Quick Actions</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-border hover:bg-primary/10"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-border hover:bg-primary/10"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Customer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order & Booking History Tabs */}
      <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
        <Tabs defaultValue="orders" className="w-full">
          <CardHeader>
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
              <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Order History
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <CalendarCheck className="h-4 w-4 mr-2" />
                Booking History
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4 mt-0">
              <div className="rounded-lg border border-border overflow-hidden bg-background/30">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-foreground">Order ID</TableHead>
                      <TableHead className="text-foreground">Items</TableHead>
                      <TableHead className="text-foreground">Date</TableHead>
                      <TableHead className="text-foreground">Amount</TableHead>
                      <TableHead className="text-foreground">Payment</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerData.orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="text-muted-foreground">#{order.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {order.items.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="border-primary/30 text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {order.amount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}
                            className={
                              order.paymentStatus === 'PAID'
                                ? 'bg-green-500'
                                : order.paymentStatus === 'PENDING'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              order.orderStatus === 'DELIVERED'
                                ? 'border-green-500 text-green-500 bg-green-50 dark:bg-green-900/20'
                                : order.orderStatus === 'PREPARING'
                                ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                            }
                          >
                            {order.orderStatus === 'DELIVERED' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {order.orderStatus === 'PREPARING' && <Clock className="h-3 w-3 mr-1" />}
                            {order.orderStatus === 'CANCELLED' && <XCircle className="h-3 w-3 mr-1" />}
                            {order.orderStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4 mt-0">
              <div className="rounded-lg border border-border overflow-hidden bg-background/30">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-foreground">Booking ID</TableHead>
                      <TableHead className="text-foreground">Table</TableHead>
                      <TableHead className="text-foreground">Date & Time</TableHead>
                      <TableHead className="text-foreground">Guests</TableHead>
                      <TableHead className="text-foreground">Location</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerData.bookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-muted/30">
                        <TableCell className="text-muted-foreground">#{booking.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/30 bg-primary/10">
                            {booking.tableNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {booking.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {booking.guests} people
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-primary" />
                            {booking.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              booking.status === 'CONFIRMED'
                                ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : booking.status === 'COMPLETED'
                                ? 'border-green-500 text-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                            }
                          >
                            {booking.status === 'CONFIRMED' && <Clock className="h-3 w-3 mr-1" />}
                            {booking.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {booking.status === 'CANCELLED' && <XCircle className="h-3 w-3 mr-1" />}
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
