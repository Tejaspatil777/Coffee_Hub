import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useTheme } from '../../context/ThemeProvider';
import { Button } from '../ui/button';
import { 
  Coffee, 
  Home, 
  Menu as MenuIcon, 
  MapPin, 
  Calendar, 
  ShoppingCart, 
  ListOrdered, 
  ChefHat, 
  UtensilsCrossed,
  LayoutDashboard,
  LogOut,
  User,
  Moon,
  Sun,
  MenuSquare,
  X,
  Bell,
  BookOpen,
  MoreHorizontal,
  CreditCard,
  Star,
  Settings
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';
import { getUnreadNotificationsCount } from '../../services/bookingService';
import { getUnreadNotificationsCount as getCustomerUnreadNotificationsCount } from '../../services/customerNotificationService';
import { CustomerNotificationPanel } from '../customer/CustomerNotificationPanel';

export function Header() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [customerUnreadCount, setCustomerUnreadCount] = useState(0);
  const [showCustomerNotifications, setShowCustomerNotifications] = useState(false);

  useEffect(() => {
    console.log('Header: Auth state changed', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (isAuthenticated && user?.role === 'ADMIN') {
        const count = await getUnreadNotificationsCount();
        setUnreadNotificationsCount(count);
      }
    };

    fetchUnreadNotifications();

    // Listen for notification events
    const handleNotificationUpdate = () => {
      if (isAuthenticated && user?.role === 'ADMIN') {
        const count = getUnreadNotificationsCount();
        setUnreadNotificationsCount(count);
      }
    };

    window.addEventListener('notificationCreated', handleNotificationUpdate);
    window.addEventListener('notificationRead', handleNotificationUpdate);
    window.addEventListener('bookingUpdated', handleNotificationUpdate);

    return () => {
      window.removeEventListener('notificationCreated', handleNotificationUpdate);
      window.removeEventListener('notificationRead', handleNotificationUpdate);
      window.removeEventListener('bookingUpdated', handleNotificationUpdate);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchCustomerUnreadNotifications = async () => {
      if (isAuthenticated && user?.role === 'CUSTOMER') {
        const count = await getCustomerUnreadNotificationsCount();
        setCustomerUnreadCount(count);
      }
    };

    fetchCustomerUnreadNotifications();

    // Listen for notification events
    const handleCustomerNotificationUpdate = () => {
      if (isAuthenticated && user?.role === 'CUSTOMER') {
        const count = getCustomerUnreadNotificationsCount();
        setCustomerUnreadCount(count);
      }
    };

    window.addEventListener('customerNotificationCreated', handleCustomerNotificationUpdate);
    window.addEventListener('customerNotificationRead', handleCustomerNotificationUpdate);
    window.addEventListener('bookingUpdated', handleCustomerNotificationUpdate);

    return () => {
      window.removeEventListener('customerNotificationCreated', handleCustomerNotificationUpdate);
      window.removeEventListener('customerNotificationRead', handleCustomerNotificationUpdate);
      window.removeEventListener('bookingUpdated', handleCustomerNotificationUpdate);
    };
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    console.log('Header: Logging out');
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children, badge, onClick }: any) => (
    <Link
      to={to}
      onClick={() => {
        setMobileMenuOpen(false);
        onClick?.();
      }}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
        isActive(to)
          ? 'bg-primary text-white'
          : 'text-foreground hover:bg-primary/10'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1">{children}</span>
      {badge && (
        <Badge className="bg-accent text-white">{badge}</Badge>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50"></div>
            <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg">
              <span className="text-2xl">☕</span>
            </div>
          </div>
          <span className="text-foreground hidden sm:inline">TakeBits</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg transition-all ${
              isActive('/') 
                ? 'bg-primary text-white' 
                : 'text-foreground hover:bg-primary/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </div>
          </Link>
          <Link
            to="/menu"
            className={`px-4 py-2 rounded-lg transition-all ${
              isActive('/menu') 
                ? 'bg-primary text-white' 
                : 'text-foreground hover:bg-primary/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <MenuIcon className="h-4 w-4" />
              Menu
            </div>
          </Link>
          <Link
            to="/locations"
            className={`px-4 py-2 rounded-lg transition-all ${
              isActive('/locations') 
                ? 'bg-primary text-white' 
                : 'text-foreground hover:bg-primary/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </div>
          </Link>

          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <>
              <Link
                to="/booking"
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive('/booking') 
                    ? 'bg-primary text-white' 
                    : 'text-foreground hover:bg-primary/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Book Table
                </div>
              </Link>
              <Link
                to="/my-bookings"
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive('/my-bookings') 
                    ? 'bg-primary text-white' 
                    : 'text-foreground hover:bg-primary/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  My Bookings
                </div>
              </Link>
              <Link
                to="/orders"
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive('/orders') 
                    ? 'bg-primary text-white' 
                    : 'text-foreground hover:bg-primary/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ListOrdered className="h-4 w-4" />
                  My Orders
                </div>
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              to="/admin-dashboard"
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive('/admin-dashboard') 
                  ? 'bg-primary text-white' 
                  : 'text-foreground hover:bg-primary/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Admin
                {unreadNotificationsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white">
                    {unreadNotificationsCount}
                  </Badge>
                )}
              </div>
            </Link>
          )}

          {isAuthenticated && user?.role === 'CHEF' && (
            <Link
              to="/chef-dashboard"
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive('/chef-dashboard') 
                  ? 'bg-primary text-white' 
                  : 'text-foreground hover:bg-primary/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Chef Dashboard
              </div>
            </Link>
          )}

          {isAuthenticated && user?.role === 'WAITER' && (
            <Link
              to="/waiter-dashboard"
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive('/waiter-dashboard') 
                  ? 'bg-primary text-white' 
                  : 'text-foreground hover:bg-primary/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Waiter Dashboard
              </div>
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-primary/10"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Cart (for customers) */}
          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <>
              {/* Customer Notifications Bell */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10"
                onClick={() => setShowCustomerNotifications(true)}
              >
                <Bell className="h-5 w-5" />
                {customerUnreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">
                    {customerUnreadCount}
                  </Badge>
                )}
              </Button>

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-primary/10">
                  <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-full">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:inline text-foreground">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuLabel className="text-foreground">
                  <div>
                    <p>{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Badge variant="outline" className="mt-1 text-xs border-primary text-primary">
                      {user?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem onClick={() => navigate('/profile')} className="text-foreground">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                
                {user?.role === 'ADMIN' && (
                  <>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={() => navigate('/admin-dashboard')} className="text-foreground">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                      {unreadNotificationsCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white">
                          {unreadNotificationsCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/chef-dashboard')} className="text-foreground">
                      <ChefHat className="mr-2 h-4 w-4" />
                      Chef View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/waiter-dashboard')} className="text-foreground">
                      <UtensilsCrossed className="mr-2 h-4 w-4" />
                      Waiter View
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="hover:bg-primary/10"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <MenuSquare className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-card border-border">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl">
                      <Coffee className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-foreground">TakeBits</span>
                  </div>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu for TakeBits coffee shop
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex flex-col gap-4 mt-6">
                {/* Mobile Navigation */}
                <div className="space-y-1">
                  <NavLink to="/" icon={Home}>Home</NavLink>
                  <NavLink to="/menu" icon={MenuIcon}>Menu</NavLink>
                  <NavLink to="/locations" icon={MapPin}>Locations</NavLink>
                  
                  {isAuthenticated && user?.role === 'CUSTOMER' && (
                    <>
                      <NavLink to="/booking" icon={Calendar}>Book Table</NavLink>
                      <NavLink to="/my-bookings" icon={BookOpen}>My Bookings</NavLink>
                      <NavLink to="/cart" icon={ShoppingCart} badge={cartCount > 0 ? cartCount : null}>
                        Cart
                      </NavLink>
                      <NavLink to="/orders" icon={ListOrdered}>My Orders</NavLink>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-primary/10"
                        onClick={() => {
                          setShowCustomerNotifications(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Bell className="h-5 w-5" />
                        <span className="flex-1 text-left">Notifications</span>
                        {customerUnreadCount > 0 && (
                          <Badge className="bg-red-500 text-white">{customerUnreadCount}</Badge>
                        )}
                      </Button>
                    </>
                  )}

                  {isAuthenticated && user?.role === 'CHEF' && (
                    <NavLink to="/chef-dashboard" icon={ChefHat}>Chef Dashboard</NavLink>
                  )}

                  {isAuthenticated && user?.role === 'WAITER' && (
                    <NavLink to="/waiter-dashboard" icon={UtensilsCrossed}>Waiter Dashboard</NavLink>
                  )}

                  {isAuthenticated && user?.role === 'ADMIN' && (
                    <>
                      <NavLink to="/admin-dashboard" icon={LayoutDashboard}>Admin Dashboard
                        {unreadNotificationsCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white">
                            {unreadNotificationsCount}
                          </Badge>
                        )}
                      </NavLink>
                      <NavLink to="/chef-dashboard" icon={ChefHat}>Chef View</NavLink>
                      <NavLink to="/waiter-dashboard" icon={UtensilsCrossed}>Waiter View</NavLink>
                    </>
                  )}
                </div>

                {/* Mobile User Section */}
                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
                        <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-full">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 border-border hover:bg-destructive hover:text-destructive-foreground"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                        onClick={() => {
                          navigate('/login');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-border hover:bg-primary/10"
                        onClick={() => {
                          navigate('/register');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Customer Notification Panel */}
      {isAuthenticated && user?.role === 'CUSTOMER' && user?.email && (
        <CustomerNotificationPanel
          open={showCustomerNotifications}
          onOpenChange={setShowCustomerNotifications}
          customerId={user.email}
        />
      )}
    </header>
  );
}