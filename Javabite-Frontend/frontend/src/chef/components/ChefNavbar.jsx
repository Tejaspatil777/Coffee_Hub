import { motion } from 'framer-motion';
import { Bell, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ChefNavbar = () => {
  const [notifications] = useState(3);
  const [chefName, setChefName] = useState('Chef');
  const [chefEmail, setChefEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setChefName(user.name || 'Chef');
        setChefEmail(user.email || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast.success('Logged out successfully!');
    
    // Redirect to login page
    navigate('/chef/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="bg-white shadow-lg px-6 py-4 flex items-center justify-between sticky top-0 z-40"
    >
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>
        <p className="text-sm text-gray-500">Manage your kitchen orders efficiently</p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-2 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-orange-600" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </motion.button>

        {/* Profile */}
        

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default ChefNavbar;