import { motion } from 'framer-motion';
import { LayoutDashboard, ClipboardList, History, User, LogOut, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ChefSidebar = ({ activePage, onNavigate }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Assigned Orders', icon: ClipboardList },
    { id: 'history', label: 'Order History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem('chefAuth');
    localStorage.removeItem('chefName');
    toast.success('Logged out successfully');
    navigate('/chef/login');
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="w-64 bg-gradient-to-b from-orange-600 to-red-600 text-white min-h-screen shadow-2xl"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Chef Portal</h2>
            <p className="text-xs text-orange-100">Kitchen Management</p>
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
                  ? 'bg-white text-orange-600 shadow-lg'
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

export default ChefSidebar;