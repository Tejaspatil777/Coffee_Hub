import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { MapPin, Phone, Clock, Navigation, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingTime: string;
  closingTime: string;
  distance?: number;
  isOpen: boolean;
}

// Mock data - replace with API call
const mockLocations: Location[] = [
  {
    id: '1',
    name: 'TakeBits Downtown',
    address: '123 Main Street',
    city: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    phone: '+1 (555) 123-4567',
    openingTime: '07:00',
    closingTime: '22:00',
    isOpen: true,
  },
  {
    id: '2',
    name: 'TakeBits Central Park',
    address: '456 Park Avenue',
    city: 'New York',
    latitude: 40.7829,
    longitude: -73.9654,
    phone: '+1 (555) 234-5678',
    openingTime: '07:00',
    closingTime: '23:00',
    isOpen: true,
  },
  {
    id: '3',
    name: 'TakeBits Brooklyn',
    address: '789 Brooklyn Street',
    city: 'Brooklyn',
    latitude: 40.6782,
    longitude: -73.9442,
    phone: '+1 (555) 345-6789',
    openingTime: '08:00',
    closingTime: '21:00',
    isOpen: false,
  },
  {
    id: '4',
    name: 'TakeBits Times Square',
    address: '321 Broadway',
    city: 'New York',
    latitude: 40.7580,
    longitude: -73.9855,
    phone: '+1 (555) 456-7890',
    openingTime: '06:00',
    closingTime: '23:30',
    isOpen: true,
  },
  {
    id: '5',
    name: 'TakeBits Upper East Side',
    address: '567 Madison Avenue',
    city: 'New York',
    latitude: 40.7736,
    longitude: -73.9566,
    phone: '+1 (555) 567-8901',
    openingTime: '07:00',
    closingTime: '22:00',
    isOpen: true,
  },
  {
    id: '6',
    name: 'TakeBits SoHo',
    address: '890 Spring Street',
    city: 'New York',
    latitude: 40.7233,
    longitude: -74.0030,
    phone: '+1 (555) 678-9012',
    openingTime: '07:30',
    closingTime: '22:30',
    isOpen: true,
  },
  {
    id: '7',
    name: 'TakeBits Greenwich Village',
    address: '234 Bleecker Street',
    city: 'New York',
    latitude: 40.7308,
    longitude: -74.0020,
    phone: '+1 (555) 789-0123',
    openingTime: '07:00',
    closingTime: '23:00',
    isOpen: true,
  },
  {
    id: '8',
    name: 'TakeBits Chelsea',
    address: '678 West 23rd Street',
    city: 'New York',
    latitude: 40.7465,
    longitude: -74.0014,
    phone: '+1 (555) 890-1234',
    openingTime: '08:00',
    closingTime: '21:30',
    isOpen: false,
  },
  {
    id: '9',
    name: 'TakeBits Williamsburg',
    address: '432 Bedford Avenue',
    city: 'Brooklyn',
    latitude: 40.7081,
    longitude: -73.9571,
    phone: '+1 (555) 901-2345',
    openingTime: '07:00',
    closingTime: '22:00',
    isOpen: true,
  },
  {
    id: '10',
    name: 'TakeBits Financial District',
    address: '159 Wall Street',
    city: 'New York',
    latitude: 40.7074,
    longitude: -74.0113,
    phone: '+1 (555) 012-3456',
    openingTime: '06:30',
    closingTime: '20:00',
    isOpen: true,
  },
  {
    id: '11',
    name: 'TakeBits Midtown East',
    address: '753 Lexington Avenue',
    city: 'New York',
    latitude: 40.7549,
    longitude: -73.9712,
    phone: '+1 (555) 111-2222',
    openingTime: '07:00',
    closingTime: '22:00',
    isOpen: true,
  },
  {
    id: '12',
    name: 'TakeBits DUMBO',
    address: '888 Front Street',
    city: 'Brooklyn',
    latitude: 40.7033,
    longitude: -73.9883,
    phone: '+1 (555) 222-3333',
    openingTime: '08:00',
    closingTime: '21:00',
    isOpen: true,
  },
];

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const navigate = useNavigate();

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Calculate distances and sort by nearest
        const locationsWithDistance = mockLocations.map(loc => ({
          ...loc,
          distance: calculateDistance(latitude, longitude, loc.latitude, loc.longitude)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        setLocations(locationsWithDistance);
        toast.success('Location found! Showing nearest cafes');
        setLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        
        console.error('Geolocation error:', {
          code: error.code,
          message: error.message
        });
        
        toast.error(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Filter locations by search query
  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open in Google Maps
  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Our Locations</h1>
          <p className="text-muted-foreground">Find the nearest TakeBits cafe near you</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, address, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border"
            />
          </div>
          <Button 
            onClick={getCurrentLocation} 
            disabled={loadingLocation}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
          >
            <Navigation className="h-4 w-4" />
            {loadingLocation ? 'Finding...' : 'Find Nearest'}
          </Button>
        </div>

        {/* Locations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="border-indigo-200 dark:border-indigo-800 hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      {location.name}
                      {location.distance !== undefined && (
                        <Badge variant="outline" className="text-xs border-indigo-500">
                          {location.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{location.city}</CardDescription>
                  </div>
                  <Badge 
                    variant={location.isOpen ? 'default' : 'secondary'} 
                    className={location.isOpen ? 'bg-green-500' : ''}
                  >
                    {location.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <a 
                      href={`tel:${location.phone}`} 
                      className="text-sm text-muted-foreground hover:text-amber-600 transition-colors"
                    >
                      {location.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {location.openingTime} - {location.closingTime}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    onClick={() => openInMaps(location.latitude, location.longitude)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Directions
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => {
                      localStorage.setItem('selectedLocation', JSON.stringify(location));
                      navigate('/booking');
                    }}
                  >
                    Book Table
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No locations found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}