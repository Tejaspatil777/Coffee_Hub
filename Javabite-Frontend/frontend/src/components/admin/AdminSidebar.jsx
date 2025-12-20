import { LayoutDashboard, ShoppingBag, Users, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminSidebar({ activePage, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 min-h-screen shadow-lg transition-colors duration-300">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="text-5xl mb-2">☕</div>
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">Admin Panel</h2>
        </motion.div>

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
                    : 'text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-gray-700'
                }`}
                data-testid={`admin-sidebar-${item.id}`}
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

export default AdminSidebar;
