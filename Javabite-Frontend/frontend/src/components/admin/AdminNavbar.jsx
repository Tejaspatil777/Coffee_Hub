import { motion } from 'framer-motion';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

function AdminNavbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="text-3xl">☕</div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                Coffee Shop Admin
              </h1>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Welcome back, {user.name || 'Admin'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-full bg-amber-100 dark:bg-gray-700 text-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-gray-600 transition-colors"
              data-testid="theme-toggle-btn"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </motion.button>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md"
              data-testid="admin-logout-btn"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
