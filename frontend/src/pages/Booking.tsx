import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Calendar as CalendarIcon, Clock, Users, MapPin, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { createBooking } from '../services/bookingService';
import { updateCustomerStatus } from '../services/customerSessionService';
import { getCustomerNotifications } from '../services/customerNotificationService';

interface TableStatus {
  id: string;
  tableNumber: string;
  capacity: number;
  position: string;
  status: 'FREE' | 'BOOKED' | 'OCCUPIED';
  nextAvailableTime?: string;
  currentBooking?: {
    startTime: string;
    endTime: string;
  };
}

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
  '09:00 PM'
];

// Mock tables data with 15 tables (as per project spec)
const mockTables: TableStatus[] = [
  { id: 't1', tableNumber: '1', capacity: 2, position: 'Window side - Front', status: 'FREE' },
  { id: 't2', tableNumber: '2', capacity: 2, position: 'Window side - Middle', status: 'FREE' },
  { id: 't3', tableNumber: '3', capacity: 4, position: 'Center - Main hall', status: 'FREE' },
  { id: 't4', tableNumber: '4', capacity: 4, position: 'Center - Main hall', status: 'FREE' },
  { id: 't5', tableNumber: '5', capacity: 6, position: 'Private corner', status: 'FREE' },
  { id: 't6', tableNumber: '6', capacity: 2, position: 'Bar seating', status: 'FREE' },
  { id: 't7', tableNumber: '7', capacity: 2, position: 'Bar seating', status: 'FREE' },
  { id: 't8', tableNumber: '8', capacity: 4, position: 'Patio area', status: 'FREE' },
  { id: 't9', tableNumber: '9', capacity: 4, position: 'Patio area', status: 'FREE' },
  { id: 't10', tableNumber: '10', capacity: 8, position: 'VIP section', status: 'FREE' },
  { id: 't11', tableNumber: '11', capacity: 3, position: 'Near fireplace', status: 'FREE' },
  { id: 't12', tableNumber: '12', capacity: 3, position: 'Near bookshelf', status: 'FREE' },
  { id: 't13', tableNumber: '13', capacity: 5, position: 'Family booth', status: 'FREE' },
  { id: 't14', tableNumber: '14', capacity: 4, position: 'Quiet zone', status: 'FREE' },
  { id: 't15', tableNumber: '15', capacity: 6, position: 'Group seating', status: 'FREE' },
];

export default function Booking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [guests, setGuests] = useState('2');
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  useEffect(() => {
    // Load saved location if available
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      try {
        setSelectedLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error('Error parsing selected location:', error);
      }
    }

    // Load saved tables
    const storedTables = JSON.parse(localStorage.getItem('tables') || '[]');
    if (storedTables.length > 0) {
      setTables(storedTables);
    } else {
      // Initialize with mock tables
      localStorage.setItem('tables', JSON.stringify(mockTables));
    }

    // Listen for table updates
    const handleTableUpdated = () => {
      const updatedTables = JSON.parse(localStorage.getItem('tables') || '[]');
      if (updatedTables.length > 0) {
        setTables(updatedTables);
      }
    };

    window.addEventListener('tableUpdated', handleTableUpdated);

    return () => {
      window.removeEventListener('tableUpdated', handleTableUpdated);
    };
  }, []);

  const availableTables = tables.filter(table => 
    parseInt(guests) <= table.capacity && table.status === 'FREE'
  );

  const handleBooking = async () => {
    if (!date || !timeSlot || !selectedTable) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      toast.error('Please login to make a booking');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const selectedTableData = tables.find(t => t.id === selectedTable);
      
      if (!selectedTableData) {
        toast.error('Selected table not found');
        return;
      }

      // Check if table is FREE for instant booking
      const isInstantBooking = selectedTableData.status === 'FREE';

      // Create booking (will be auto-confirmed if table is FREE)
      const newBooking = createBooking({
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        tableId: selectedTable,
        tableNumber: selectedTableData.tableNumber,
        locationId: selectedLocation?.id || 'default',
        locationName: selectedLocation?.name || 'TakeBits Downtown',
        date: date.toISOString().split('T')[0],
        timeSlot: timeSlot,
        guests: parseInt(guests),
        specialRequests: specialRequests || undefined,
        bookingReason: bookingReason || undefined,
        status: 'PENDING', // Will be overridden to CONFIRMED if table is FREE
      });

      if (isInstantBooking) {
        toast.success('✅ Table confirmed instantly!', {
          description: 'Your table is ready. You can now order food!',
        });
        // Navigate to menu for immediate ordering
        navigate('/menu');
      } else {
        toast.success('Booking request submitted! Waiting for admin approval.', {
          description: 'You will be notified once the admin reviews your request.',
        });
        // Navigate to my bookings to see status
        navigate('/my-bookings');
      }

      // Update customer status is handled in createBooking service
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Book a Table</h1>
          <p className="text-muted-foreground">Reserve your spot at TakeBits</p>
          {selectedLocation && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">{selectedLocation.name}</span>
              <Badge variant="outline" className="border-primary/30">{selectedLocation.city}</Badge>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Reservation Details</CardTitle>
              <CardDescription>Choose your preferred date, time, and table</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  Select Date
                </Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border border-border bg-background/50 dark:bg-background/30"
                />
              </div>

              {/* Number of Guests */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground">
                  <Users className="h-4 w-4" />
                  Number of Guests
                </Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="bg-background/50 dark:bg-background/30 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slot */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4" />
                  Time Slot
                </Label>
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger className="bg-background/50 dark:bg-background/30 border-border text-foreground">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label className="text-foreground">Special Requests (Optional)</Label>
                <Textarea
                  placeholder="e.g., Window seat, birthday celebration..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="bg-background/50 dark:bg-background/30 border-border text-foreground"
                />
              </div>

              {/* Booking Reason */}
              <div className="space-y-2">
                <Label className="text-foreground">Reason for Booking (Optional)</Label>
                <Textarea
                  placeholder="e.g., Business meeting, family gathering..."
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  className="bg-background/50 dark:bg-background/30 border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Table Selection */}
          <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Choose Your Table</CardTitle>
              <CardDescription>
                {availableTables.length} tables available for {guests} guests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availableTables.map(table => (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTable === table.id
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-border bg-background/50 dark:bg-background/30 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-foreground">Table {table.tableNumber}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {table.position}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700">
                          <Users className="h-3 w-3 mr-1" />
                          {table.capacity} seats
                        </Badge>
                        <Badge className="bg-green-500">Available</Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {availableTables.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No tables available for the selected number of guests
                  </p>
                )}
              </div>

              <Button
                className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                onClick={handleBooking}
                disabled={loading || !date || !timeSlot || !selectedTable}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <CalendarIcon className="h-8 w-8 text-primary mb-3" />
              <h3 className="mb-2 text-foreground">Flexible Booking</h3>
              <p className="text-muted-foreground">Book up to 30 days in advance</p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 text-primary mb-3" />
              <h3 className="mb-2 text-foreground">Time Slots</h3>
              <p className="text-muted-foreground">Choose from available time slots</p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="mb-2 text-foreground">Group Friendly</h3>
              <p className="text-muted-foreground">Tables for 2 to 8 guests</p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Table Status Overview */}
        <Card className="mt-8 bg-card/70 dark:bg-card/50 backdrop-blur-xl border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Real-Time Table Availability</CardTitle>
            <CardDescription>Live status of all tables in the restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map(table => (
                <div
                  key={table.id}
                  className={`p-4 border-2 rounded-lg ${
                    table.status === 'FREE' 
                      ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                      : table.status === 'BOOKED'
                      ? 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {table.status === 'FREE' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : table.status === 'BOOKED' ? (
                          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                        <span className="text-foreground">Table {table.tableNumber}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{table.position}</p>
                    </div>
                    <Badge 
                      className={
                        table.status === 'FREE'
                          ? 'bg-green-500'
                          : table.status === 'BOOKED'
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }
                    >
                      {table.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Capacity: {table.capacity} people</span>
                    </div>
                    
                    {table.currentBooking && (
                      <div className="mt-2 p-2 bg-background/50 dark:bg-background/30 rounded border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Current Booking:</p>
                        <p className="text-sm text-foreground">{table.currentBooking.startTime} - {table.currentBooking.endTime}</p>
                        {table.nextAvailableTime && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Available from: {table.nextAvailableTime}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-foreground">Free - Ready to book</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm text-foreground">Booked - Reserved for time slot</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm text-foreground">Occupied - Currently in use</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}