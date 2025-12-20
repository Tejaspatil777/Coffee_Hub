import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, CheckCircle, Bell, User, LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const WaiterSidebar = ({ activePage, onNavigate }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ready', label: 'Ready to Serve', icon: ShoppingBag },
    { id: 'completed', label: 'Completed Orders', icon: CheckCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem('waiterAuth');
    localStorage.removeItem('waiterName');
    toast.success('Logged out successfully');
    navigate('/waiter/login');
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="w-64 bg-gradient-to-b from-emerald-600 to-teal-600 text-white min-h-screen shadow-2xl"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <UserRound className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Waiter Portal</h2>
            <p className="text-xs text-emerald-100">Service Management</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: 8 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-emerald-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      
    </motion.aside>
  );
};

export default WaiterSidebar;