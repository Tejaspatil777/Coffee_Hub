import { useState, useEffect } from 'react';
import { Coffee, User, LogOut, Calendar, ShoppingBag, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCartCount } from '../services/localCart';

function Navbarcustomer({ onNavigate }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("User");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.name) setUserName(user.name);
    
    // Update cart count
    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const updateCartCount = () => {
    setCartCount(getCartCount());
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-gradient-to-r from-amber-900 to-amber-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer"
               onClick={() => onNavigate("dashboard")}>
            <Coffee className="h-8 w-8 text-amber-200" />
            <span className="text-2xl font-bold text-amber-50">JavaBite</span>
          </div>

          {/* Right Side - Cart & Profile */}
          <div className="flex items-center space-x-4">
            
            {/* Cart Icon with Badge */}
            <motion.button
              onClick={() => onNavigate("cart")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-amber-700 rounded-full transition-all duration-300"
              data-testid="cart-button"
            >
              <ShoppingCart className="h-6 w-6 text-amber-50" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  data-testid="cart-badge"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 bg-amber-800 hover:bg-amber-700 rounded-full px-4 py-2 transition-all duration-300"
                data-testid="profile-dropdown-button"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-amber-50 font-medium">{userName}</span>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden"
                  >
                    <button
                      onClick={() => onNavigate("dashboard")}
                      className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center space-x-3"
                    >
                      <User className="h-4 w-4 text-amber-800" />
                      <span className="text-gray-800">Profile</span>
                    </button>

                    <button
                      onClick={() => onNavigate("booking")}
                      className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center space-x-3"
                    >
                      <Calendar className="h-4 w-4 text-amber-800" />
                      <span className="text-gray-800">My Bookings</span>
                    </button>

                    <button
                      onClick={() => onNavigate("orders")}
                      className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center space-x-3"
                    >
                      <ShoppingBag className="h-4 w-4 text-amber-800" />
                      <span className="text-gray-800">My Orders</span>
                    </button>

                    <div className="border-t border-gray-200"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbarcustomer;
