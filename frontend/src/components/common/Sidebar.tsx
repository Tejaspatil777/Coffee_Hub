import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useTheme } from '../../context/ThemeProvider';
import { Button } from '../ui/button';
import { 
  Coffee, 
  Home, 
  Menu, 
  MapPin, 
  Calendar, 
  ShoppingCart, 
  ListOrdered, 
  ChefHat, 
  UtensilsCrossed,
  LayoutDashboard,
  LogOut,
  User,
  Users,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import { Separator } from '../ui/separator';

export function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children, badge }: any) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive(to)
          ? 'bg-primary text-white shadow-md'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
    <div className="h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg">
            <Coffee className="h-6 w-6 text-white" />
          </div>
          <span className="text-sidebar-foreground">TakeBits</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <NavLink to="/" icon={Home}>
          Home
        </NavLink>
        <NavLink to="/menu" icon={Menu}>
          Menu
        </NavLink>
        <NavLink to="/locations" icon={MapPin}>
          Locations
        </NavLink>

        {isAuthenticated && (
          <>
            <Separator className="my-4 bg-sidebar-border" />
            
            {user?.role === 'CUSTOMER' && (
              <>
                <NavLink to="/booking" icon={Calendar}>
                  Book Table
                </NavLink>
                <NavLink to="/cart" icon={ShoppingCart} badge={cartCount > 0 ? cartCount : null}>
                  Cart
                </NavLink>
                <NavLink to="/orders" icon={ListOrdered}>
                  My Orders
                </NavLink>
              </>
            )}

            {user?.role === 'CHEF' && (
              <NavLink to="/chef-dashboard" icon={ChefHat}>
                Chef Dashboard
              </NavLink>
            )}

            {user?.role === 'WAITER' && (
              <NavLink to="/waiter-dashboard" icon={UtensilsCrossed}>
                Waiter Dashboard
              </NavLink>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <NavLink to="/admin-dashboard" icon={LayoutDashboard}>
                  Admin Dashboard
                </NavLink>
                <NavLink to="/chef-dashboard" icon={ChefHat}>
                  Chef View
                </NavLink>
                <NavLink to="/waiter-dashboard" icon={UtensilsCrossed}>
                  Waiter View
                </NavLink>
              </>
            )}
          </>
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-sidebar-border hover:bg-primary hover:text-white"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-4 w-4" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="h-4 w-4" />
              Light Mode
            </>
          )}
        </Button>

        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent">
              <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-sidebar-border hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              variant="outline"
              className="w-full border-sidebar-border hover:bg-primary/10"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}