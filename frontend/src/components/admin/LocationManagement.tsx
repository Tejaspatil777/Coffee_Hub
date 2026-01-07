import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  MapPin,
  Coffee,
  Users,
  Clock,
  RefreshCw,
  Building2,
  Grid3x3,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  getFromLocalStorage,
  subscribeToRealtimeUpdates,
  REALTIME_EVENTS,
} from '../../services/realtimeSync';

// TakeBits cafe locations
const LOCATIONS = [
  { id: 'loc1', name: 'Downtown Branch', address: '123 Main St, Downtown', city: 'New York' },
  { id: 'loc2', name: 'Uptown Cafe', address: '456 Park Ave, Uptown', city: 'New York' },
  { id: 'loc3', name: 'Brooklyn Heights', address: '789 Heights Blvd, Brooklyn', city: 'New York' },
  { id: 'loc4', name: 'Queens Plaza', address: '321 Plaza Dr, Queens', city: 'New York' },
  { id: 'loc5', name: 'Manhattan Central', address: '654 Central Ave, Manhattan', city: 'New York' },
  { id: 'loc6', name: 'Bronx Corner', address: '987 Corner St, Bronx', city: 'New York' },
  { id: 'loc7', name: 'Staten Island Pier', address: '147 Pier Rd, Staten Island', city: 'New York' },
  { id: 'loc8', name: 'Harlem Square', address: '258 Square Ln, Harlem', city: 'New York' },
  { id: 'loc9', name: 'SoHo District', address: '369 District Way, SoHo', city: 'New York' },
  { id: 'loc10', name: 'Tribeca Tower', address: '741 Tower St, Tribeca', city: 'New York' },
  { id: 'loc11', name: 'Chelsea Market', address: '852 Market Pl, Chelsea', city: 'New York' },
  { id: 'loc12', name: 'Upper East Side', address: '963 East Side Dr, UES', city: 'New York' },
];

// Table layout for each location (simplified)
const TABLE_LAYOUT = [
  { id: 'T001', x: 1, y: 1, seats: 2, position: 'Window' },
  { id: 'T002', x: 3, y: 1, seats: 2, position: 'Window' },
  { id: 'T003', x: 5, y: 1, seats: 4, position: 'Window' },
  { id: 'T004', x: 1, y: 3, seats: 4, position: 'Center' },
  { id: 'T005', x: 3, y: 3, seats: 4, position: 'Center' },
  { id: 'T006', x: 5, y: 3, seats: 6, position: 'Center' },
  { id: 'T007', x: 1, y: 5, seats: 2, position: 'Corner' },
  { id: 'T008', x: 3, y: 5, seats: 2, position: 'Corner' },
  { id: 'T009', x: 5, y: 5, seats: 8, position: 'VIP' },
  { id: 'T010', x: 2, y: 2, seats: 2, position: 'Patio' },
  { id: 'T011', x: 4, y: 2, seats: 4, position: 'Patio' },
  { id: 'T012', x: 2, y: 4, seats: 4, position: 'Bar' },
  { id: 'T013', x: 4, y: 4, seats: 6, position: 'Private' },
  { id: 'T014', x: 6, y: 3, seats: 2, position: 'Balcony' },
  { id: 'T015', x: 6, y: 4, seats: 4, position: 'Garden' },
];

export function LocationManagement() {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].id);
  const [tableStatuses, setTableStatuses] = useState<Map<string, string>>(new Map());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadTableStatuses();

    const unsubscribe = subscribeToRealtimeUpdates(
      [REALTIME_EVENTS.BOOKING_UPDATED, REALTIME_EVENTS.TABLE_UPDATED],
      () => {
        loadTableStatuses();
      }
    );

    return unsubscribe;
  }, [refreshKey]);

  const loadTableStatuses = () => {
    const bookings = getFromLocalStorage<any[]>('bookings', []);
    const statusMap = new Map<string, string>();

    // Mark all tables as FREE initially
    TABLE_LAYOUT.forEach(table => {
      statusMap.set(table.id, 'FREE');
    });

    // Update based on active bookings
    const activeBookings = bookings.filter(b => 
      ['CONFIRMED', 'SEATED'].includes(b.status)
    );

    activeBookings.forEach(booking => {
      if (booking.tableId) {
        statusMap.set(booking.tableId, booking.status === 'SEATED' ? 'OCCUPIED' : 'BOOKED');
      }
    });

    setTableStatuses(statusMap);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Location data refreshed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FREE':
        return 'bg-green-500';
      case 'BOOKED':
        return 'bg-orange-500';
      case 'OCCUPIED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTableStats = () => {
    const total = TABLE_LAYOUT.length;
    const free = Array.from(tableStatuses.values()).filter(s => s === 'FREE').length;
    const booked = Array.from(tableStatuses.values()).filter(s => s === 'BOOKED').length;
    const occupied = Array.from(tableStatuses.values()).filter(s => s === 'OCCUPIED').length;

    return { total, free, booked, occupied };
  };

  const stats = getTableStats();
  const location = LOCATIONS.find(l => l.id === selectedLocation);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/70 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location Management ☕
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Real-time view of table status across all locations
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-border"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Location Selector */}
      <Card className="bg-card/70 backdrop-blur-xl border-border">
        <CardContent className="pt-6">
          <Tabs value={selectedLocation} onValueChange={setSelectedLocation}>
            <TabsList className="w-full flex-wrap h-auto bg-card border border-border p-1">
              {LOCATIONS.map(loc => (
                <TabsTrigger
                  key={loc.id}
                  value={loc.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white flex-1 min-w-[150px]"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {loc.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Location Info */}
      {location && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/70 backdrop-blur-xl border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-foreground">{location.name}</p>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl text-green-700 dark:text-green-400">{stats.free}</p>
                <p className="text-sm text-muted-foreground">Free Tables</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl text-orange-700 dark:text-orange-400">{stats.booked}</p>
                <p className="text-sm text-muted-foreground">Booked</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl text-red-700 dark:text-red-400">{stats.occupied}</p>
                <p className="text-sm text-muted-foreground">Occupied</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table Map */}
      <Card className="bg-card/70 backdrop-blur-xl border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            Table Layout - {location?.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Real-time table availability status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex gap-6 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Occupied</span>
            </div>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {TABLE_LAYOUT.map(table => {
              const status = tableStatuses.get(table.id) || 'FREE';
              return (
                <div
                  key={table.id}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-300
                    ${status === 'FREE' ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20' : ''}
                    ${status === 'BOOKED' ? 'border-orange-500 bg-orange-500/10 hover:bg-orange-500/20' : ''}
                    ${status === 'OCCUPIED' ? 'border-red-500 bg-red-500/10 hover:bg-red-500/20' : ''}
                    cursor-pointer
                  `}
                  title={`${table.id} - ${table.position} - ${table.seats} seats`}
                >
                  <div className="text-center space-y-2">
                    <div className={`w-8 h-8 mx-auto rounded-full ${getStatusColor(status)} flex items-center justify-center`}>
                      <Coffee className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm text-foreground">{table.id}</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{table.seats}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs py-0 px-1.5"
                    >
                      {table.position}
                    </Badge>
                  </div>
                  
                  {/* Status indicator */}
                  <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Location Activity */}
      <Card className="bg-card/70 backdrop-blur-xl border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* This would show real-time activities */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-foreground">Table T003 checked in</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
              <Badge className="bg-green-500">Active</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-foreground">Table T007 booked for 7:00 PM</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
              <Badge className="bg-orange-500">Booked</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-foreground">Table T012 checked out</p>
                <p className="text-xs text-muted-foreground">28 minutes ago</p>
              </div>
              <Badge className="bg-gray-500">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
