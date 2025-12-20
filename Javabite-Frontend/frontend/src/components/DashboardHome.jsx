import { useEffect, useState } from 'react';
import { Calendar, UtensilsCrossed, ShoppingBag, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

function DashboardHome({ onNavigate }) {
  const [bookingCount, setBookingCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:8080/booking/user", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setBookingCount(res.data.length);
      } catch (err) {
        console.log("Error loading bookings:", err);
      }
    };

    fetchBookings();

    const fetchOrders = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.get("http://localhost:8080/order/my-orders", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setOrderCount(res.data.length);
  } catch (err) {
    console.log("Error loading orders:", err);
  }
};

fetchOrders();

  }, []);

  const quickActions = [
    {
      id: 'booking',
      title: 'Book a Table',
      description: 'Reserve your favorite spot',
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      id: 'order',
      title: 'Order Food',
      description: 'Browse our delicious menu',
      icon: UtensilsCrossed,
      gradient: 'from-orange-500 to-orange-700',
    },
    {
      id: 'orders',
      title: 'View Orders',
      description: 'Track your order history',
      icon: ShoppingBag,
      gradient: 'from-green-500 to-green-700',
    },
  ];

  const stats = [
    { label: 'Total Bookings', value: bookingCount, icon: Calendar },
    { label: 'Total Orders', value: orderCount, icon: ShoppingBag },
    { label: 'Points Earned', value: bookingCount * 10, icon: TrendingUp },
  ];

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
            <p className="text-amber-100 text-lg">Ready for your next coffee adventure?</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3 rounded-lg">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-br ${action.gradient} rounded-xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-white text-opacity-90">{action.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardHome;
