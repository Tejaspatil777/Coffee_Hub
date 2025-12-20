import { Home, Calendar, UtensilsCrossed, ShoppingBag, Settings, History } from 'lucide-react';
import { motion } from 'framer-motion';

function Sidebar({ activePage, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'booking', label: 'Book a Table', icon: Calendar },
    { id: 'order', label: 'Order Food', icon: UtensilsCrossed },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'booking-history', label: 'Booking History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-amber-50 to-orange-50 min-h-screen shadow-lg">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
                data-testid={`sidebar-${item.id}`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
