import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import {
  Users,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Award,
  Timer,
  DollarSign,
  Activity,
  Search,
  Filter,
  ArrowUpDown,
  User,
  Mail,
  Coffee,
  History,
  BarChart3,
  Eye,
  Phone,
  ShoppingBag,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  getCurrentTableAssignments,
  getTableHistory,
  getTableHistoryByTable,
  getPriorityQueue,
  checkInCustomer,
  checkOutCustomer,
  getTableUtilizationStats,
  calculateCustomerPriority,
  suggestTableForBooking,
  TableAssignment,
  TableHistory,
  CustomerPriority,
} from '../../services/tableManagementService';
import { getAllBookings, updateBookingStatus, getOrdersByBooking } from '../../services/bookingService';
import { TableDetailDialog } from './TableDetailDialog';

export function TableManagementSystem() {
  const [tableAssignments, setTableAssignments] = useState<TableAssignment[]>([]);
  const [tableHistory, setTableHistory] = useState<TableHistory[]>([]);
  const [priorityQueue, setPriorityQueue] = useState<CustomerPriority[]>([]);
  const [utilizationStats, setUtilizationStats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'FREE' | 'BOOKED' | 'OCCUPIED'>('ALL');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();

    // Listen for updates
    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('bookingUpdated', handleUpdate);
    window.addEventListener('tableUpdated', handleUpdate);
    window.addEventListener('tableHistoryUpdated', handleUpdate);

    return () => {
      window.removeEventListener('bookingUpdated', handleUpdate);
      window.removeEventListener('tableUpdated', handleUpdate);
      window.removeEventListener('tableHistoryUpdated', handleUpdate);
    };
  }, [refreshKey]);

  const loadData = () => {
    setTableAssignments(getCurrentTableAssignments());
    setTableHistory(getTableHistory().slice(0, 50)); // Last 50 records
    setPriorityQueue(getPriorityQueue());
    setUtilizationStats(getTableUtilizationStats());
  };

  const handleCheckIn = (bookingId: string) => {
    const result = checkInCustomer(bookingId);
    if (result) {
      toast.success('Customer checked in successfully');
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error('Failed to check in customer');
    }
  };

  const handleCheckOut = (bookingId: string) => {
    // Calculate revenue from orders
    const orders = getOrdersByBooking(bookingId);
    const revenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    const result = checkOutCustomer(bookingId, revenue);
    if (result) {
      // Update booking status to SERVED
      updateBookingStatus(bookingId, 'SERVED');
      toast.success(`Customer checked out. Revenue: $${revenue.toFixed(2)}`);
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error('Failed to check out customer');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FREE':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'BOOKED':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      case 'OCCUPIED':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 100) return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
    if (score >= 70) return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    if (score >= 40) return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
    return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  };

  const filteredAssignments = tableAssignments.filter(table => {
    const matchesSearch = table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         table.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         table.currentCustomer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || table.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: tableAssignments.length,
    free: tableAssignments.filter(t => t.status === 'FREE').length,
    booked: tableAssignments.filter(t => t.status === 'BOOKED').length,
    occupied: tableAssignments.filter(t => t.status === 'OCCUPIED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Free Tables</p>
                <p className="text-3xl text-foreground mt-1">{stats.free}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {((stats.free / stats.total) * 100).toFixed(0)}% available
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Booked</p>
                <p className="text-3xl text-foreground mt-1">{stats.booked}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Pending check-in
                </p>
              </div>
              <Clock className="h-10 w-10 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-3xl text-foreground mt-1">{stats.occupied}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Currently dining
                </p>
              </div>
              <Coffee className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-3xl text-foreground mt-1">{stats.total}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {((stats.occupied + stats.booked) / stats.total * 100).toFixed(0)}% utilization
                </p>
              </div>
              <Activity className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="current" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Eye className="h-4 w-4 mr-2" />
            Current Status
          </TabsTrigger>
          <TabsTrigger value="priority" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Award className="h-4 w-4 mr-2" />
            Priority Queue
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <History className="h-4 w-4 mr-2" />
            Table History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Utilization
          </TabsTrigger>
        </TabsList>

        {/* Current Status Tab */}
        <TabsContent value="current" className="space-y-4">
          {/* Search and Filter */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by table, position, or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('ALL')}
                    className="whitespace-nowrap"
                  >
                    All ({stats.total})
                  </Button>
                  <Button
                    variant={filterStatus === 'FREE' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('FREE')}
                    className="whitespace-nowrap"
                  >
                    Free ({stats.free})
                  </Button>
                  <Button
                    variant={filterStatus === 'BOOKED' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('BOOKED')}
                    className="whitespace-nowrap"
                  >
                    Booked ({stats.booked})
                  </Button>
                  <Button
                    variant={filterStatus === 'OCCUPIED' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('OCCUPIED')}
                    className="whitespace-nowrap"
                  >
                    Occupied ({stats.occupied})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Assignments Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((table) => (
              <Card 
                key={table.tableId}
                className={`bg-card border-border transition-all hover:shadow-lg ${
                  selectedTable === table.tableId ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg text-primary">
                          {table.tableNumber}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base">Table {table.tableNumber}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {table.position}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(table.status)}>
                      {table.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacity
                    </span>
                    <span className="text-foreground">{table.capacity} guests</span>
                  </div>

                  {table.currentCustomer && (
                    <>
                      <div className="border-t border-border pt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="text-sm text-foreground">
                            {table.currentCustomer.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {table.currentCustomer.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {table.currentCustomer.guests} guests
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {table.currentCustomer.timeSlot}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {table.status === 'BOOKED' && (
                          <Button
                            size="sm"
                            onClick={() => handleCheckIn(table.currentCustomer!.bookingId)}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Check In
                          </Button>
                        )}
                        {table.status === 'OCCUPIED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCheckOut(table.currentCustomer!.bookingId)}
                            className="flex-1"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Check Out
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedTable(table.tableId === selectedTable ? null : table.tableId)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}

                  {!table.currentCustomer && table.status === 'FREE' && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <Coffee className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Table available for booking
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAssignments.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tables found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Priority Queue Tab */}
        <TabsContent value="priority" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Customer Priority Queue
              </CardTitle>
              <CardDescription>
                Customers ranked by priority score for table assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {priorityQueue.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {priorityQueue.map((customer, index) => (
                      <Card key={customer.customerId} className="bg-muted/30 border-border">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm text-primary font-semibold">
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-foreground flex items-center gap-2">
                                  {customer.customerName}
                                  {customer.factors.vipStatus && (
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Customer ID: {customer.customerId}
                                </p>
                              </div>
                            </div>
                            <Badge className={getPriorityColor(customer.score)}>
                              Score: {customer.score}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <Award className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Loyalty: {customer.factors.loyaltyPoints} pts
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Bookings: {customer.factors.bookingFrequency}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Party: {customer.factors.partySize}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Timer className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Wait: {customer.factors.waitTime} min
                              </span>
                            </div>
                            {customer.factors.specialRequests && (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-3 w-3 text-orange-500" />
                                <span className="text-orange-600 dark:text-orange-400">
                                  Special Request
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="py-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No pending bookings in queue</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Table History
              </CardTitle>
              <CardDescription>
                Complete history of all table bookings and customer visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs text-primary">
                                {record.tableNumber}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm">{record.position || 'N/A'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-foreground">{record.customerName}</p>
                            <p className="text-xs text-muted-foreground">{record.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{record.guests}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{record.date}</p>
                            <p className="text-xs text-muted-foreground">{record.timeSlot}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {record.duration ? `${record.duration} min` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {record.revenue ? `$${record.revenue.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              record.status === 'COMPLETED'
                                ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                                : record.status === 'ONGOING'
                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                                : record.status === 'CANCELLED'
                                ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                : 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {tableHistory.length === 0 && (
                  <div className="py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No table history available yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Table Utilization & Performance
              </CardTitle>
              <CardDescription>
                Analyze table performance and revenue generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {utilizationStats.map((stat) => (
                    <Card key={stat.tableNumber} className="bg-muted/30 border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm text-primary font-semibold">
                                {stat.tableNumber}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-foreground">Table {stat.tableNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {stat.position} • Capacity: {stat.capacity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg text-foreground">
                              ${stat.totalRevenue.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Revenue</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground flex items-center gap-1 mb-1">
                              <Calendar className="h-3 w-3" />
                              Bookings
                            </p>
                            <p className="text-foreground">{stat.totalBookings}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground flex items-center gap-1 mb-1">
                              <Timer className="h-3 w-3" />
                              Avg Duration
                            </p>
                            <p className="text-foreground">{stat.avgDuration} min</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground flex items-center gap-1 mb-1">
                              <Activity className="h-3 w-3" />
                              Utilization
                            </p>
                            <p className="text-foreground">{stat.utilizationRate.toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {utilizationStats.length === 0 && (
                  <div className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No utilization data available yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Table Detail Dialog */}
      <TableDetailDialog
        tableId={selectedTable}
        open={selectedTable !== null}
        onOpenChange={(open) => !open && setSelectedTable(null)}
        onRefresh={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}