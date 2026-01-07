import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ShoppingCart, Search, Plus, Minus, Coffee, Croissant, UtensilsCrossed, Droplet, Cake, Salad, Sunrise, Sun, Moon, Clock, Leaf, Drumstick, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'sonner@2.0.3';
import { getBookingsByCustomer } from '../services/bookingService';
import { getCustomerNotifications } from '../services/customerNotificationService';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { getAllMenuItems, type MenuItem } from '../services/menuService';

const defaultMenuItems: MenuItem[] = [
  // Hot Coffees
  {
    id: '1',
    name: 'Espresso',
    description: 'Rich and bold single shot of espresso',
    price: 3.99,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '2',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and thick foam',
    price: 4.99,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '3',
    name: 'Latte',
    description: 'Smooth espresso with silky steamed milk',
    price: 4.99,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '4',
    name: 'Americano',
    description: 'Espresso diluted with hot water',
    price: 3.49,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '5',
    name: 'Mocha',
    description: 'Espresso with chocolate and steamed milk',
    price: 5.49,
    category: 'Hot Coffees',
    image: 'https://images.unsplash.com/photo-1607260550778-aa9d29444ce1?w=400&q=80',
    available: true,
    isNew: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  // Cold Coffees
  {
    id: '6',
    name: 'Iced Latte',
    description: 'Chilled espresso with cold milk over ice',
    price: 5.49,
    category: 'Cold Coffees',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '7',
    name: 'Cold Brew',
    description: 'Slow-steeped smooth coffee served cold',
    price: 4.99,
    category: 'Cold Coffees',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '8',
    name: 'Iced Americano',
    description: 'Espresso over ice with cold water',
    price: 4.49,
    category: 'Cold Coffees',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  // Pastries & Bakery
  {
    id: '9',
    name: 'Croissant',
    description: 'Buttery and flaky French pastry',
    price: 3.49,
    category: 'Pastries & Bakery',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    available: true,
    mealType: 'Breakfast',
    dietaryType: 'Veg'
  },
  {
    id: '10',
    name: 'Chocolate Muffin',
    description: 'Rich chocolate chip muffin',
    price: 3.99,
    category: 'Pastries & Bakery',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80',
    available: true,
    mealType: 'Breakfast',
    dietaryType: 'Veg'
  },
  {
    id: '11',
    name: 'Blueberry Scone',
    description: 'Fresh blueberry scone with glaze',
    price: 4.49,
    category: 'Pastries & Bakery',
    image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80',
    available: true,
    isNew: true,
    mealType: 'Breakfast',
    dietaryType: 'Veg'
  },
  {
    id: '12',
    name: 'Cinnamon Roll',
    description: 'Warm cinnamon roll with cream cheese frosting',
    price: 4.99,
    category: 'Pastries & Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'Breakfast',
    dietaryType: 'Veg'
  },
  // Food & Meals
  {
    id: '13',
    name: 'Avocado Toast',
    description: 'Fresh avocado on artisan sourdough',
    price: 8.99,
    category: 'Food & Meals',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'Breakfast',
    dietaryType: 'Veg'
  },
  {
    id: '14',
    name: 'Caesar Salad',
    description: 'Fresh romaine with parmesan and croutons',
    price: 9.99,
    category: 'Food & Meals',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80',
    available: true,
    mealType: 'Lunch',
    dietaryType: 'Veg'
  },
  {
    id: '15',
    name: 'Club Sandwich',
    description: 'Triple-decker with turkey, bacon, and veggies',
    price: 11.99,
    category: 'Food & Meals',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80',
    available: true,
    mealType: 'Lunch',
    dietaryType: 'Non-Veg'
  },
  {
    id: '16',
    name: 'Breakfast Burrito',
    description: 'Eggs, cheese, bacon, and salsa wrapped',
    price: 10.49,
    category: 'Food & Meals',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80',
    available: true,
    isNew: true,
    mealType: 'Breakfast',
    dietaryType: 'Non-Veg'
  },
  // Fresh Beverages
  {
    id: '17',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed oranges',
    price: 4.49,
    category: 'Fresh Beverages',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '18',
    name: 'Green Smoothie',
    description: 'Spinach, banana, and tropical fruits',
    price: 6.99,
    category: 'Fresh Beverages',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '19',
    name: 'Iced Tea',
    description: 'Refreshing brewed black tea',
    price: 3.49,
    category: 'Fresh Beverages',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '20',
    name: 'Lemonade',
    description: 'Freshly squeezed lemon with mint',
    price: 3.99,
    category: 'Fresh Beverages',
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f0c?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  // Desserts
  {
    id: '21',
    name: 'Cheesecake',
    description: 'Classic New York style cheesecake',
    price: 6.49,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&q=80',
    available: true,
    isPopular: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '22',
    name: 'Chocolate Brownie',
    description: 'Rich fudgy brownie with nuts',
    price: 4.99,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
    available: true,
    mealType: 'All Day',
    dietaryType: 'Veg'
  },
  {
    id: '23',
    name: 'Tiramisu',
    description: 'Italian coffee-flavored dessert',
    price: 7.49,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
    available: true,
    isNew: true,
    mealType: 'Dinner',
    dietaryType: 'Veg'
  }
];

const categoryIcons: { [key: string]: any } = {
  'All': Search,
  'Hot Coffees': Coffee,
  'Cold Coffees': Droplet,
  'Pastries & Bakery': Croissant,
  'Food & Meals': UtensilsCrossed,
  'Fresh Beverages': Droplet,
  'Desserts': Cake
};

const mealTypeIcons: { [key: string]: any } = {
  'Breakfast': Sunrise,
  'Lunch': Sun,
  'Dinner': Moon,
  'All Day': Clock
};

export default function Menu() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMealType, setSelectedMealType] = useState<string>('All Day');
  const [selectedDietaryType, setSelectedDietaryType] = useState<string>('All');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const { isAuthenticated, user } = useAuth();
  const [hasConfirmedBooking, setHasConfirmedBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'NONE' | 'PENDING' | 'CONFIRMED'>('NONE');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Load menu items
  useEffect(() => {
    loadMenuItems();

    // Listen for menu updates
    const handleMenuUpdated = () => {
      loadMenuItems();
    };

    window.addEventListener('menuUpdated', handleMenuUpdated);

    return () => {
      window.removeEventListener('menuUpdated', handleMenuUpdated);
    };
  }, []);

  const loadMenuItems = () => {
    const items = getAllMenuItems();
    setMenuItems(items);
  };

  // Handle pending cart item after login
  useEffect(() => {
    if (isAuthenticated && user) {
      const pendingItemStr = sessionStorage.getItem('pendingCartItem');
      if (pendingItemStr) {
        try {
          const pendingItem = JSON.parse(pendingItemStr);
          sessionStorage.removeItem('pendingCartItem');
          
          // Show a reminder toast
          toast.info(`Welcome back! Would you like to add "${pendingItem.name}" to your cart?`, {
            description: 'Click here to add it now',
            duration: 5000,
            action: {
              label: 'Add to Cart',
              onClick: () => addToCart(pendingItem)
            }
          });
        } catch (error) {
          console.error('Error handling pending cart item:', error);
          sessionStorage.removeItem('pendingCartItem');
        }
      }
    }
  }, [isAuthenticated, user]);

  // Check booking status on mount and when user changes
  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      checkBookingStatus();

      // Listen for booking updates
      const handleBookingUpdated = () => {
        checkBookingStatus();
      };

      window.addEventListener('bookingUpdated', handleBookingUpdated);

      return () => {
        window.removeEventListener('bookingUpdated', handleBookingUpdated);
      };
    }
  }, [user]);

  const checkBookingStatus = () => {
    if (!user) return;

    const bookings = getBookingsByCustomer(user.id);
    const confirmedBooking = bookings.find(b => b.status === 'CONFIRMED');
    const pendingBooking = bookings.find(b => b.status === 'PENDING');

    if (confirmedBooking) {
      setHasConfirmedBooking(true);
      setBookingStatus('CONFIRMED');
    } else if (pendingBooking) {
      setHasConfirmedBooking(false);
      setBookingStatus('PENDING');
    } else {
      setHasConfirmedBooking(false);
      setBookingStatus('NONE');
    }
  };

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const mealTypes = ['All Day', 'Breakfast', 'Lunch', 'Dinner'];
  const dietaryTypes = ['All', 'Veg', 'Non-Veg'];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesMealType = selectedMealType === 'All Day' || item.mealType === selectedMealType;
    const matchesDietary = selectedDietaryType === 'All' || item.dietaryType === selectedDietaryType;
    const isAvailable = item.available; // Only show available items
    return matchesSearch && matchesCategory && matchesMealType && matchesDietary && isAvailable;
  });

  const addToCart = (item: MenuItem) => {
    if (!isAuthenticated) {
      // Save the item they wanted to add for later (optional)
      sessionStorage.setItem('pendingCartItem', JSON.stringify(item));
      
      toast.error('🔒 Please login first to add items to cart', {
        description: 'Redirecting to login page...',
        duration: 2000
      });
      
      // Redirect to login page after showing the message
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if user is a customer and has booking requirements
    if (user?.role === 'CUSTOMER' && bookingStatus !== 'CONFIRMED') {
      if (bookingStatus === 'PENDING') {
        toast.error('Please wait for admin to approve your booking before ordering');
      } else {
        toast.error('Please book a table first before ordering');
      }
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = currentCart.findIndex((cartItem: any) => cartItem.id === item.id);

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (item: MenuItem, delta: number) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = currentCart.findIndex((cartItem: any) => cartItem.id === item.id);

    if (existingItemIndex >= 0) {
      const newQuantity = currentCart[existingItemIndex].quantity + delta;
      
      if (newQuantity <= 0) {
        currentCart.splice(existingItemIndex, 1);
        const newCart = { ...cart };
        delete newCart[item.id];
        setCart(newCart);
      } else {
        currentCart[existingItemIndex].quantity = newQuantity;
        setCart(prev => ({ ...prev, [item.id]: newQuantity }));
      }
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-foreground">Our Menu ☕</h1>
              <p className="text-muted-foreground">Discover our delicious selection of coffee and food</p>
            </div>
          </div>
        </div>

        {/* Booking Status Alert for Customers */}
        {isAuthenticated && user?.role === 'CUSTOMER' && (
          <>
            {bookingStatus === 'PENDING' && (
              <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-900 dark:text-yellow-100">
                  ⏳ Waiting for Admin Approval
                </AlertTitle>
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Your table booking request is pending. Menu ordering will be enabled once the admin approves your booking.
                </AlertDescription>
              </Alert>
            )}
            {bookingStatus === 'CONFIRMED' && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-500">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">
                  🎉 Your table is reserved!
                </AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  You can now order food. Your table has been confirmed by the admin.
                </AlertDescription>
              </Alert>
            )}
            {bookingStatus === 'NONE' && (
              <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-500">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-900 dark:text-blue-100">
                  📋 No Table Booking
                </AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Please book a table first to enable menu ordering. Visit the &quot;Book Table&quot; page to make a reservation.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        {/* Meal Type Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            <h3 className="text-foreground">Meal Time</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {mealTypes.map(mealType => {
              const Icon = mealTypeIcons[mealType];
              return (
                <Button
                  key={mealType}
                  variant={selectedMealType === mealType ? 'default' : 'outline'}
                  onClick={() => setSelectedMealType(mealType)}
                  className={`gap-2 ${
                    selectedMealType === mealType 
                      ? 'bg-primary hover:bg-accent text-white' 
                      : 'border-border hover:border-primary hover:bg-primary/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {mealType}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Dietary Preference Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Salad className="h-5 w-5 text-primary" />
            <h3 className="text-foreground">Dietary Preference</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {dietaryTypes.map(dietaryType => {
              const Icon = dietaryType === 'Veg' ? Leaf : dietaryType === 'Non-Veg' ? Drumstick : Coffee;
              return (
                <Button
                  key={dietaryType}
                  variant={selectedDietaryType === dietaryType ? 'default' : 'outline'}
                  onClick={() => setSelectedDietaryType(dietaryType)}
                  className={`gap-2 ${
                    selectedDietaryType === dietaryType 
                      ? 'bg-primary hover:bg-accent text-white' 
                      : 'border-border hover:border-primary hover:bg-primary/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {dietaryType}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-card">
            {categories.map(category => {
              const Icon = categoryIcons[category] || Coffee;
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Menu Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border bg-card group">
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {item.isPopular && (
                  <Badge className="absolute top-3 left-3 bg-primary">
                    Popular
                  </Badge>
                )}
                {item.isNew && (
                  <Badge className="absolute top-3 right-3 bg-accent">
                    New
                  </Badge>
                )}
                {/* Dietary Badge */}
                <Badge 
                  variant="secondary" 
                  className={`absolute bottom-3 left-3 ${
                    item.dietaryType === 'Veg' 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  }`}
                >
                  {item.dietaryType === 'Veg' ? (
                    <>
                      <Leaf className="h-3 w-3 mr-1" />
                      Veg
                    </>
                  ) : (
                    <>
                      <Drumstick className="h-3 w-3 mr-1" />
                      Non-Veg
                    </>
                  )}
                </Badge>
              </div>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-foreground">{item.name}</h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    ${item.price.toFixed(2)}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{item.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {item.category}
                  </Badge>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {mealTypeIcons[item.mealType] && (
                      <>
                        {(() => {
                          const MealIcon = mealTypeIcons[item.mealType];
                          return <MealIcon className="h-3 w-3 mr-1" />;
                        })()}
                      </>
                    )}
                    {item.mealType}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                {cart[item.id] ? (
                  <div className="flex items-center gap-3 w-full">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item, -1)}
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="flex-1 text-center text-foreground">{cart[item.id]} in cart</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item, 1)}
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-primary hover:bg-accent text-white"
                    onClick={() => addToCart(item)}
                    disabled={!item.available}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No items found matching your filters</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedMealType('All Day');
                setSelectedDietaryType('All');
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}