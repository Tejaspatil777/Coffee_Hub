import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../ui/button';
import { Coffee, ShoppingCart, User, LogOut, ChefHat, UtensilsCrossed, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import { 
  getCustomerNotifications, 
  getUnreadNotificationsCount,
  markCustomerNotificationAsRead,
  markAllCustomerNotificationsAsRead,
  type CustomerNotification
} from '../../services/customerNotificationService';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
    if (user && user.role === 'CUSTOMER') {
      loadNotifications();

      const handleNotificationCreated = () => {
        loadNotifications();
        // Show toast notification
        toast.success('You have a new notification!');
      };

      const handleNotificationRead = () => {
        loadNotifications();
      };

      window.addEventListener('customerNotificationCreated', handleNotificationCreated);
      window.addEventListener('customerNotificationRead', handleNotificationRead);

      return () => {
        window.removeEventListener('customerNotificationCreated', handleNotificationCreated);
        window.removeEventListener('customerNotificationRead', handleNotificationRead);
      };
    }
  }, [user]);

  const loadNotifications = () => {
    if (user) {
      const userNotifications = getCustomerNotifications(user.id);
      setNotifications(userNotifications);
      setUnreadCount(getUnreadNotificationsCount(user.id));
    }
  };

  const handleNotificationClick = (notification: CustomerNotification) => {
    markCustomerNotificationAsRead(notification.id);
    
    // Navigate to relevant page based on notification type
    if (notification.type === 'BOOKING_APPROVED') {
      navigate('/menu');
    }
  };

  const handleMarkAllRead = () => {
    if (user) {
      markAllCustomerNotificationsAsRead(user.id);
      toast.success('All notifications marked as read');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Coffee className="h-8 w-8 text-amber-600" />
            <span className="text-amber-900">TakeBits</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-neutral-700 hover:text-amber-600 transition-colors">
              Home
            </Link>
            <Link to="/menu" className="text-neutral-700 hover:text-amber-600 transition-colors">
              Menu
            </Link>
            <Link to="/locations" className="text-neutral-700 hover:text-amber-600 transition-colors">
              Locations
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/booking" className="text-neutral-700 hover:text-amber-600 transition-colors">
                  Book Table
                </Link>
                <Link to="/orders" className="text-neutral-700 hover:text-amber-600 transition-colors">
                  My Orders
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <>
                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllRead}
                          className="h-6 text-xs"
                        >
                          Mark all read
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-[300px]">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {notifications.map((notification) => (
                            <DropdownMenuItem
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                                !notification.isRead ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between w-full">
                                <span className="font-medium text-sm">
                                  {notification.title}
                                </span>
                                {!notification.isRead && (
                                  <Badge className="bg-amber-600 h-2 w-2 p-0 rounded-full" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {notification.message}
                              </span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Shopping Cart */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => navigate('/cart')}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-600">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-5 w-5" />
                      <span className="hidden sm:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p>{user?.name}</p>
                        <p className="text-xs text-neutral-500">{user?.email}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {user?.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {user?.role === 'CHEF' && (
                      <DropdownMenuItem onClick={() => navigate('/chef-dashboard')}>
                        <ChefHat className="mr-2 h-4 w-4" />
                        Chef Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    {user?.role === 'WAITER' && (
                      <DropdownMenuItem onClick={() => navigate('/waiter-dashboard')}>
                        <UtensilsCrossed className="mr-2 h-4 w-4" />
                        Waiter Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    {user?.role === 'ADMIN' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/chef-dashboard')}>
                          <ChefHat className="mr-2 h-4 w-4" />
                          Chef Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/waiter-dashboard')}>
                          <UtensilsCrossed className="mr-2 h-4 w-4" />
                          Waiter Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')} className="bg-amber-600 hover:bg-amber-700">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}