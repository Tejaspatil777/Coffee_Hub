import { motion } from 'framer-motion';
import { ChefHat, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ChefDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingOrders: 0,
    preparingOrders: 0,
    completedToday: 0,
    averageTime: '0 min'
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chefId, setChefId] = useState(null);
  const [chefName, setChefName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👨‍🍳 Chef User:', user);
    setChefId(user.id);
    setChefName(user.name || 'Chef');
    fetchChefData();
  }, []);

  const fetchChefData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('🔍 Fetching chef orders...');
      console.log('User Role:', user.role);
      console.log('Token length:', token?.length || 0);
      
      if (!token) {
        toast.error('Please login first');
        navigate('/chef/login');
        return;
      }
      
      // Debug: Check token format
      console.log('Token first 50 chars:', token?.substring(0, 50));
      console.log('Token contains dots:', token?.split('.').length === 3);
      
      if (user.role !== 'chef') {
        toast.error('Access denied. Chef authorization required.');
        console.error('User is not a chef. Role:', user.role);
        return;
      }
      
      // Make API request with JWT token
      const response = await fetch('http://localhost:8080/api/chef/orders/all', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log('API Response:', response.status, response.statusText);
      
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/chef/login');
        return;
      }
      
      if (response.status === 403) {
        const errorText = await response.text();
        console.error('403 Forbidden Details:', errorText);
        
        // SAFER JWT decoding
        try {
          if (token && token.split('.').length === 3) {
            // Proper JWT format
            const payloadBase64 = token.split('.')[1];
            // Add padding if needed
            const padded = payloadBase64.padEnd(payloadBase64.length + (4 - payloadBase64.length % 4) % 4, '=');
            const payloadJson = atob(padded);
            const payload = JSON.parse(payloadJson);
            console.log('✅ JWT Payload:', payload);
            console.log('JWT Role:', payload.role);
            
            if (payload.role && payload.role !== 'CHEF') {
              toast.error(`You are registered as ${payload.role}, not a CHEF.`);
            }
          } else {
            console.warn('Token is not a valid JWT format');
            console.log('Token:', token);
          }
        } catch (decodeError) {
          console.error('JWT decode failed:', decodeError);
          console.log('Raw token:', token);
        }
        
        toast.error('Access forbidden. Check your chef permissions.');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const allOrdersData = await response.json();
      console.log('✅ Orders loaded:', allOrdersData.length);
      
      // ✅ DEBUG: Log the ACTUAL data structure
      console.log('🔍 API Response FULL:', allOrdersData);
      console.log('🔍 Is array?', Array.isArray(allOrdersData));
      
      if (allOrdersData.length > 0) {
        console.log('🔍 First order keys:', Object.keys(allOrdersData[0]));
        console.log('🔍 First order status:', allOrdersData[0].status);
        console.log('🔍 First order items:', allOrdersData[0].items);
      }
      
      // ✅ FIX: Ensure it's an array and update ALL states
      const ordersArray = Array.isArray(allOrdersData) ? allOrdersData : [];
      
      // Update all orders state
      setAllOrders(ordersArray);
      console.log('📦 All orders set:', ordersArray.length);
      
      // Calculate stats
      const pending = ordersArray.filter(o => o.status === 'PENDING').length;
      const preparing = ordersArray.filter(o => o.status === 'PREPARING').length;
      const completedToday = ordersArray.filter(o => 
        (o.status === 'READY_TO_SERVE' || o.status === 'COMPLETED') &&
        new Date(o.createdAt).toDateString() === new Date().toDateString()
      ).length;

      console.log('📊 Stats calculated:', { pending, preparing, completedToday });
      
      setStats({
        pendingOrders: pending,
        preparingOrders: preparing,
        completedToday: completedToday,
        averageTime: '15 min'
      });

      // Set recent orders (last 3)
      const sortedOrders = [...ordersArray]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      
      console.log('📝 Recent orders set:', sortedOrders.length);
      setRecentOrders(sortedOrders);
      
    } catch (error) {
      console.error('🚨 Fetch error:', error);
      toast.error('Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Chef takes an order
  const handleTakeOrder = async (orderId) => {
    console.log('🚀 Taking order:', orderId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/chef/orders/${orderId}/take`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        console.log('✅ Order taken:', updatedOrder);
        
        // Update all states
        setAllOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        setRecentOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        toast.success('Order taken for preparation!');
        fetchChefData(); // Refresh
      } else {
        toast.error('Failed to take order');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to take order');
    }
  };

  // Chef marks order as ready
  const handleMarkAsReady = async (orderId) => {
    console.log('✅ Marking as ready:', orderId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/chef/orders/${orderId}/ready`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        console.log('✅ Order marked ready:', updatedOrder);
        
        // Update all states
        setAllOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        setRecentOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        toast.success('Order marked as ready!');
        fetchChefData(); // Refresh
      } else {
        toast.error('Failed to mark as ready');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to mark as ready');
    }
  };

  // Check if order can be taken
  const canTakeOrder = (order) => {
    return order.status === 'PENDING';
  };

  // Check if chef can mark order ready
  const canMarkReady = (order) => {
    return order.status === 'PREPARING' && 
           (!order.chefLocked || order.lockedByChefId === chefId);
  };

  // Check if order is locked by other chef
  const isLockedByOtherChef = (order) => {
    return order.chefLocked && order.lockedByChefId && order.lockedByChefId !== chefId;
  };

  const statCards = [
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: ChefHat,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      description: 'Orders waiting for chefs'
    },
    {
      title: 'Preparing Now',
      value: stats.preparingOrders,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      description: 'Orders being prepared'
    },
    {
      title: 'Ready/Completed Today',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      description: 'Orders finished today'
    },
    {
      title: 'Avg Prep Time',
      value: stats.averageTime,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      description: 'Average preparation time'
    }
  ];

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING': return 'bg-blue-100 text-blue-800';
      case 'READY_TO_SERVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Debug Info */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="font-medium">Chef ID:</span> {chefId}
          </div>
          <div>
            <span className="font-medium">All Orders:</span> {allOrders.length}
          </div>
          <div>
            <span className="font-medium">Recent Orders:</span> {recentOrders.length}
          </div>
          <div>
            <span className="font-medium">Pending:</span> {stats.pendingOrders}
          </div>
          <button
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('All Orders:', allOrders);
              console.log('Recent Orders:', recentOrders);
              console.log('Stats:', stats);
              console.log('Chef ID:', chefId);
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Debug Data
          </button>
          <button
            onClick={fetchChefData}
            className="px-3 py-1 bg-emerald-500 text-white rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Chef Dashboard</h1>
              <p className="text-orange-100 text-lg">
                Welcome, {chefName}! Manage your kitchen orders.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-bold text-lg">{stats.pendingOrders}</span> orders pending
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-bold text-lg">{stats.preparingOrders}</span> being prepared
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-2xl p-6 shadow-lg border-2 border-white`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
            <p className="text-gray-600">Latest orders in the kitchen</p>
          </div>
          <button
            onClick={fetchChefData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recentOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Order #{order.id?.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Items:</h4>
                  {order.items?.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-900 font-medium">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-xs text-gray-500 mt-1">+{order.items.length - 2} more items</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    {/* Take Order button if order is PENDING */}
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleTakeOrder(order.id)}
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                      >
                        Take Order
                      </button>
                    )}

                    {/* Mark Ready button if order is PREPARING */}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleMarkAsReady(order.id)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        Mark Ready
                      </button>
                    )}

                    {/* Status if READY_TO_SERVE */}
                    {order.status === 'READY_TO_SERVE' && (
                      <div className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-center">
                        Ready to Serve
                      </div>
                    )}

                    {/* Status if COMPLETED */}
                    {order.status === 'COMPLETED' && (
                      <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-center">
                        Completed
                      </div>
                    )}
                  </div>
                  
                  {/* Order details */}
                  <div className="mt-2 text-xs text-gray-500">
                    <div>ID: {order.id?.substring(0, 12)}...</div>
                    <div>Customer: {order.customerEmail || 'Unknown'}</div>
                    {order.tableNumber && <div>Table: {order.tableNumber}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders in the kitchen</p>
            {allOrders.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                {allOrders.length} orders exist but filtered out
              </p>
            )}
          </div>
        )}
      </div>

      {/* All Orders Summary */}
      {allOrders.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">All Orders Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{allOrders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">
                {allOrders.filter(o => o.status === 'PENDING').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {allOrders.filter(o => o.status === 'PREPARING').length}
              </div>
              <div className="text-sm text-gray-600">Preparing</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {allOrders.filter(o => o.status === 'READY_TO_SERVE').length}
              </div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefDashboard;