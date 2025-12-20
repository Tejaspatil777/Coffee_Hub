import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-toastify'; 

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminDashboard() {
  const API_BASE_URL = 'http://localhost:8080/api/admin/dashboard';
  const API_ORDERS_URL = 'http://localhost:8080/api/admin/orders/all';

  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenueToday: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [chartDataState, setChartDataState] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });
  const [loading, setLoading] = useState(true);

  // Custom formatter for INR - handles backend's totalPrice (rupees) and converts properly
  const formatINR = (amountInRupees) => {
    if (amountInRupees === undefined || amountInRupees === null || isNaN(amountInRupees)) {
      return '₹0.00';
    }
    
    // Convert to number if it's a string
    const amount = typeof amountInRupees === 'string' ? 
                   parseFloat(amountInRupees) : amountInRupees;
    
    if (isNaN(amount)) {
      return '₹0.00';
    }
    
    // Format with INR currency symbol
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to get the correct total from order (handles both totalPrice and totalAmount)
  const getOrderTotal = (order) => {
    if (!order) return 0;
    
    console.log("Processing order:", order);
    
    // Priority 1: Use totalPrice from backend (in rupees)
    if (order.totalPrice !== undefined && order.totalPrice !== null) {
      console.log("Using totalPrice:", order.totalPrice);
      return order.totalPrice;
    }
    
    // Priority 2: Use totalAmount if available (might be in paise)
    if (order.totalAmount !== undefined && order.totalAmount !== null) {
      console.log("Using totalAmount:", order.totalAmount);
      // If it's a large number (likely paise), convert to rupees
      const amount = typeof order.totalAmount === 'number' ? order.totalAmount : 
                     parseFloat(order.totalAmount);
      return amount > 1000 ? amount / 100 : amount;
    }
    
    // Priority 3: Calculate from items
    if (order.items && order.items.length > 0) {
      const calculated = order.items.reduce((total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        // Assuming item price is in paise, convert to rupees
        return total + ((itemPrice * itemQuantity) / 100);
      }, 0);
      console.log("Calculated from items:", calculated);
      return calculated;
    }
    
    console.log("No amount found, returning 0");
    return 0;
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error("No token found in localStorage");
      setLoading(false);
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      // 1. Fetch Dashboard OVERVIEW
      console.log("Fetching dashboard stats...");
      const statsResponse = await fetch(`${API_BASE_URL}/overview`, { headers });
      
      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
      }
      
      const statsData = await statsResponse.json();
      console.log("Dashboard stats data:", statsData); // Debug log
      
      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        pendingOrders: statsData.pendingOrders || 0,
        completedOrders: statsData.completedOrders || 0,
        revenueToday: statsData.revenueToday || 0
      });

      // 2. Fetch Dashboard CHART DATA
      console.log("Fetching chart data...");
      const chartResponse = await fetch(`${API_BASE_URL}/today-revenue`, { headers });
      
      if (!chartResponse.ok) {
        throw new Error(`Failed to fetch chart data: ${chartResponse.statusText}`);
      }
      
      const chartRawData = await chartResponse.json();
      console.log("Chart data:", chartRawData); // Debug log
      
      // Process the backend Map<Integer, Double> into Chart.js format
      const labels = Object.keys(chartRawData).map(hour => {
        const h = parseInt(hour);
        return h > 12 ? `${h - 12} PM` : (h === 12 ? '12 PM' : `${h} AM`);
      });
      
      const data = Object.values(chartRawData).map(amount => amount);

      setChartDataState({
        labels: labels,
        datasets: [
          {
            label: 'Revenue (₹)',
            data: data,
            fill: true,
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderColor: 'rgba(245, 158, 11, 1)',
            tension: 0.4,
          },
        ],
      });

      // 3. Fetch Recent Orders
      console.log("Fetching recent orders...");
      const ordersResponse = await fetch(API_ORDERS_URL, { headers });
      if (!ordersResponse.ok) throw new Error(`Failed to fetch orders: ${ordersResponse.statusText}`);
      
      const ordersData = await ordersResponse.json();
      console.log("Orders data (first order):", ordersData[0]); // Debug log
      console.log("All orders data:", ordersData); // Debug log
      
      // Process orders to ensure proper total amounts
      const processedOrders = ordersData.map(order => {
        const displayTotal = getOrderTotal(order);
        console.log(`Order ${order.id}: displayTotal = ${displayTotal}`);
        return {
          ...order,
          displayTotal: displayTotal
        };
      });
      
      const sortedOrders = processedOrders.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setRecentOrders(sortedOrders.slice(0, 5));
      
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const chartData = chartDataState;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Revenue Today (Hour-wise)',
        font: { size: 16, weight: 'bold' },
        color: '#78350f',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += formatINR(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatINR(value);
          }
        }
      },
    },
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatINR(stats.totalRevenue),
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgLight: 'bg-green-100',
      bgDark: 'dark:bg-green-900/30',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-100',
      bgDark: 'dark:bg-yellow-900/30',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-100',
      bgDark: 'dark:bg-blue-900/30',
    },
    {
      title: 'Revenue Today',
      value: formatINR(stats.revenueToday),
      icon: ShoppingBag,
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-100',
      bgDark: 'dark:bg-purple-900/30',
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-6xl mb-4 animate-spin text-amber-500">🔄</div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading admin dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-8"
      >
        Dashboard Overview
      </motion.h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`${stat.bgLight} ${stat.bgDark} rounded-2xl shadow-lg p-6 transition-all duration-300`}
              data-testid={`stat-card-${stat.title.toLowerCase().replace(/ /g, '-')}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
      >
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Latest Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">
          Latest Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Order ID</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Customer Email</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Items</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Total</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.05)' }}
                    className="border-b border-gray-100 dark:border-gray-700 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-mono text-sm">
                      #{order.id ? order.id.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {order.customerEmail || order.userEmail || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} items
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {order.items?.map(item => 
                          `${item.name} (x${item.quantity || 1})`
                        ).join(', ') || 'No items'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">
                      {formatINR(order.displayTotal || getOrderTotal(order))}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : order.status === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : order.status === 'READY_TO_SERVE'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}
                      >
                        {order.status ? order.status.replace(/_/g, ' ') : 'UNKNOWN'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminDashboard;