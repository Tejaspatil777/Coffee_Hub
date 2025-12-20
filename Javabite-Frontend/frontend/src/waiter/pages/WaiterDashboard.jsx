import { motion } from 'framer-motion';
import { ShoppingBag, CheckCircle, Clock, TrendingUp, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    ordersReady: 0,
    ordersServed: 0,
    ordersCompleted: 0,
    averageServiceTime: '0 min'
  });
  const [allReadyOrders, setAllReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waiterId, setWaiterId] = useState(null);
  const [waiterName, setWaiterName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    console.log('👨‍💼 Waiter User:', user);
    console.log('🔑 Token exists:', !!token);
    
    if (!token) {
      toast.error('Please login first');
      navigate('/waiter/login');
      return;
    }
    
    if (user.role !== 'waiter') {
      toast.error('Access denied. Waiter authorization required.');
      navigate('/waiter/login');
      return;
    }
    
    setWaiterId(user.id);
    setWaiterName(user.name || 'Waiter');
    fetchWaiterData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchWaiterData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchWaiterData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        toast.error('Session expired. Please login again.');
        navigate('/waiter/login');
        return;
      }
      
      console.log('🔄 Fetching waiter orders...');
      
      // Fetch ALL orders ready to serve - REAL API CALL
      const response = await fetch('http://localhost:8080/api/waiter/orders/ready', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log('API Response Status:', response.status);
      
      if (response.ok) {
        const readyOrdersData = await response.json();
        console.log('📦 Orders loaded:', readyOrdersData.length);
        
        // DEBUG: Show all orders with their status
        readyOrdersData.forEach((order, index) => {
          console.log(`Order ${index + 1}:`, {
            id: order.id,
            status: order.status,
            waiterLocked: order.waiterLocked,
            lockedByWaiterId: order.lockedByWaiterId,
            myOrder: order.waiterLocked && order.lockedByWaiterId === user.id
          });
        });
        
        setAllReadyOrders(readyOrdersData);
        
        // Calculate stats from REAL data
        const ready = readyOrdersData.filter(o => o.status === 'READY_TO_SERVE').length;
        const served = readyOrdersData.filter(o => o.status === 'SERVED').length;
        const completed = readyOrdersData.filter(o => o.status === 'COMPLETED').length;
        
        setStats({
          ordersReady: ready,
          ordersServed: served,
          ordersCompleted: completed,
          averageServiceTime: '5 min'
        });
        
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/waiter/login');
      } else if (response.status === 403) {
        const errorText = await response.text();
        console.error('❌ 403 Forbidden:', errorText);
        
        // Check JWT payload
        const token = localStorage.getItem('token');
        if (token && token.split('.').length === 3) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('JWT Payload:', payload);
            console.log('JWT Role:', payload.role);
            
            if (payload.role !== 'WAITER') {
              toast.error(`You are a ${payload.role}, not a WAITER.`);
            }
          } catch (e) {
            console.error('JWT decode error:', e);
          }
        }
        
        toast.error('Access forbidden. Check your waiter permissions.');
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        toast.error(`Failed to fetch orders: ${response.status}`);
      }

    } catch (error) {
      console.error('🚨 Network error:', error);
      toast.error('Cannot connect to server. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  // REAL API: Waiter takes an order
 // REAL API: Waiter takes an order
const handleTakeOrder = async (orderId) => {
  console.log('🎯 Taking order:', orderId);
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:8080/api/waiter/orders/${orderId}/take`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Take order response:', response.status);
    
    if (response.ok) {
      const updatedOrder = await response.json();
      console.log('✅ Order taken:', updatedOrder);
      
      // Update local state
      setAllReadyOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      toast.success('Order taken for serving!');
      
      // Refresh data
      setTimeout(fetchWaiterData, 1000);
      
    } else {
      const errorText = await response.text();
      console.error('❌ Take order failed:', errorText);
      toast.error('Failed to take order');
    }
  } catch (error) {
    console.error('🚨 Network error:', error);
    toast.error('Failed to take order');
  }
};

  // REAL API: Mark order as served
 // REAL API: Mark order as served - USE THE CORRECT ENDPOINT
const handleMarkAsServed = async (orderId) => {
  console.log('✅ Marking as served:', orderId);
  
  try {
    const token = localStorage.getItem('token');
    
    // Use the CORRECT endpoint: /api/waiter/orders/{orderId}/status
    const response = await fetch(`http://localhost:8080/api/waiter/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'SERVED'
      })
    });

    console.log('Mark served response:', response.status);
    
    if (response.ok) {
      const updatedOrder = await response.json();
      console.log('✅ Order marked served:', updatedOrder);
      
      setAllReadyOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      toast.success('Order marked as Served!');
      setTimeout(fetchWaiterData, 1000);
      
    } else {
      const errorText = await response.text();
      console.error('❌ Mark served failed:', errorText);
      toast.error('Failed to mark as served');
    }
  } catch (error) {
    console.error('🚨 Network error:', error);
    toast.error('Failed to mark as served');
  }
};

  // REAL API: Mark order as completed - FIXED VERSION
  // REAL API: Mark order as completed - USE THE CORRECT ENDPOINT
const handleMarkAsCompleted = async (orderId) => {
  console.log('🏁 Marking as completed:', orderId);
  
  try {
    const token = localStorage.getItem('token');
    
    // Use the SAME endpoint with status=COMPLETED
    const response = await fetch(`http://localhost:8080/api/waiter/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'COMPLETED'
      })
    });

    console.log('Mark completed response:', response.status);
    
    if (response.ok) {
      const updatedOrder = await response.json();
      console.log('✅ Order marked completed:', updatedOrder);
      
      setAllReadyOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      toast.success('Order marked as Completed!');
      setTimeout(fetchWaiterData, 1000);
      
    } else {
      const errorText = await response.text();
      console.error('❌ Mark completed failed:', errorText);
      toast.error('Failed to mark as completed');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to mark as completed');
  }
};

  // Helper functions
  const getAvailableOrders = () => {
    return allReadyOrders.filter(order => 
      order.status === 'READY_TO_SERVE' && 
      (!order.waiterLocked || order.lockedByWaiterId === waiterId)
    );
  };

  // Get orders being served by current waiter - FIXED LOGIC
  const getMyOrders = () => {
    return allReadyOrders.filter(order => 
      order.waiterLocked && 
      order.lockedByWaiterId === waiterId &&
      (order.status === 'READY_TO_SERVE' || order.status === 'SERVED' || order.status === 'COMPLETED')
    );
  };

  // Get orders that are SERVED and belong to this waiter - NEW FUNCTION
  const getServedOrders = () => {
    return allReadyOrders.filter(order => 
      order.status === 'SERVED' && 
      order.waiterLocked && 
      order.lockedByWaiterId === waiterId
    );
  };

  // Get orders that are COMPLETED - NEW FUNCTION
  const getCompletedOrders = () => {
    return allReadyOrders.filter(order => 
      order.status === 'COMPLETED'
    );
  };

  const statCards = [
    {
      title: 'Ready Orders',
      value: stats.ordersReady,
      icon: ShoppingBag,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      description: 'Waiting to be served'
    },
    {
      title: 'Being Served',
      value: stats.ordersServed,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      description: 'Currently serving'
    },
    {
      title: 'Completed Today',
      value: stats.ordersCompleted,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      description: 'Successfully served'
    },
    {
      title: 'Avg Service Time',
      value: stats.averageServiceTime,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      description: 'Time to serve orders'
    }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const availableOrders = getAvailableOrders();
  const myOrders = getMyOrders();
  const servedOrders = getServedOrders();
  const completedOrders = getCompletedOrders();

  return (
    <div className="p-8">
      {/* Enhanced Debug Panel */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="font-medium">Waiter:</span> {waiterName}
          </div>
          <div>
            <span className="font-medium">ID:</span> {waiterId?.substring(0, 8)}...
          </div>
          <div>
            <span className="font-medium">Total:</span> {allReadyOrders.length}
          </div>
          <div>
            <span className="font-medium">Available:</span> {availableOrders.length}
          </div>
          <div>
            <span className="font-medium">My Orders:</span> {myOrders.length}
          </div>
          <div>
            <span className="font-medium">Served:</span> {servedOrders.length}
          </div>
          <div>
            <span className="font-medium">Completed:</span> {completedOrders.length}
          </div>
          <button
            onClick={() => {
              console.log('=== FULL DEBUG ===');
              console.log('All orders:', allReadyOrders);
              console.log('Available orders:', availableOrders);
              console.log('My orders:', myOrders);
              console.log('Served orders:', servedOrders);
              console.log('Completed orders:', completedOrders);
              console.log('Waiter ID:', waiterId);
              
              // Show each order's status and ownership
              allReadyOrders.forEach((order, idx) => {
                console.log(`Order ${idx + 1}:`, {
                  id: order.id,
                  status: order.status,
                  waiterLocked: order.waiterLocked,
                  lockedByWaiterId: order.lockedByWaiterId,
                  isMyOrder: order.waiterLocked && order.lockedByWaiterId === waiterId,
                  canMarkCompleted: order.status === 'SERVED' && order.waiterLocked && order.lockedByWaiterId === waiterId
                });
              });
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Debug All
          </button>
          <button
            onClick={fetchWaiterData}
            className="px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Waiter Dashboard</h1>
          <p className="text-emerald-100 text-lg">
            Welcome, {waiterName}! Manage your service orders.
          </p>
          
          {availableOrders.length > 0 && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="font-semibold">{availableOrders.length} orders available to serve!</span>
            </div>
          )}
          
          {servedOrders.length > 0 && (
            <div className="mt-2 inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-blue-400 rounded-full" />
              <span className="font-semibold">{servedOrders.length} orders ready to mark as completed!</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
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
            </div>
          );
        })}
      </div>

      {/* Available Orders Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Available Orders</h2>
            <p className="text-gray-600">Orders ready to serve (not taken by other waiters)</p>
          </div>
          <div className="text-sm text-gray-500">
            {availableOrders.length} available • {allReadyOrders.length} total
          </div>
        </div>

        {availableOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {availableOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Order #{order.id?.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    READY TO SERVE
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Items:</h4>
                  {order.items && order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-900 font-medium">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleTakeOrder(order.id)}
                    className="w-full py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Take Order for Serving
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-100">
            <ShoppingBag className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg font-semibold">No available orders</p>
            <p className="text-emerald-500 mt-2">Check back soon for new orders</p>
          </div>
        )}
      </div>

      {/* My Active Orders Section (READY_TO_SERVE + SERVED) */}
      {myOrders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">My Active Orders</h2>
              <p className="text-gray-600">Orders you are currently handling</p>
            </div>
            <div className="text-sm text-blue-600 font-medium">
              {myOrders.filter(o => o.status === 'READY_TO_SERVE').length} to serve • 
              {myOrders.filter(o => o.status === 'SERVED').length} served
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {myOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Order #{order.id?.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Table {order.tableNumber || 'N/A'} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'READY_TO_SERVE' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'SERVED' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Customer:</h4>
                    <span className="text-sm text-gray-800">{order.customerEmail}</span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Items:</h4>
                  {order.items && order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-900 font-medium">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {/* SHOW "Mark as Served" if status is READY_TO_SERVE */}
                  {order.status === 'READY_TO_SERVE' && (
                    <button
                      onClick={() => handleMarkAsServed(order.id)}
                      className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors mb-2"
                    >
                      Mark as Served
                    </button>
                  )}
                  
                  {/* SHOW "Mark as Completed" if status is SERVED */}
                  {order.status === 'SERVED' && (
                    <button
                      onClick={() => handleMarkAsCompleted(order.id)}
                      className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      ✅ Mark as Completed
                    </button>
                  )}
                  
                  {/* SHOW "Completed" status */}
                  {order.status === 'COMPLETED' && (
                    <div className="text-center py-2 bg-green-100 text-green-700 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Order Completed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Served Orders Ready for Completion (NEW SECTION) */}
      {servedOrders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Ready for Completion</h2>
              <p className="text-gray-600">Served orders waiting to be marked as completed</p>
            </div>
            <div className="text-sm text-green-600 font-medium">
              {servedOrders.length} orders ready
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {servedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Order #{order.id?.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Table {order.tableNumber || 'N/A'} • Served at: {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    SERVED
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Customer:</h4>
                    <span className="text-sm text-gray-800">{order.customerEmail}</span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Items served:</h4>
                  {order.items && order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-900 font-medium">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleMarkAsCompleted(order.id)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Order as Completed
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Click when customer has finished and paid
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Orders Table */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">All Orders Overview</h2>
            <p className="text-gray-600">Complete view of all orders in system</p>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Ready</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Served</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Completed</span>
          </div>
        </div>

        {allReadyOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left">Order ID</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Table</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Items</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allReadyOrders.map((order) => {
                  const isAvailable = order.status === 'READY_TO_SERVE' && 
                                     (!order.waiterLocked || order.lockedByWaiterId === waiterId);
                  const isMyOrder = order.waiterLocked && order.lockedByWaiterId === waiterId;
                  const isServed = order.status === 'SERVED';
                  const isCompleted = order.status === 'COMPLETED';
                  
                  return (
                    <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm">{order.id.substring(0, 10)}...</td>
                      <td className="p-4">{order.customerEmail}</td>
                      <td className="p-4">{order.tableNumber || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'READY_TO_SERVE' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'SERVED' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        {isMyOrder && <span className="ml-2 text-xs text-blue-600">(Your Order)</span>}
                      </td>
                      <td className="p-4">{order.items?.length || 0} items</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {/* Take Order Button */}
                          {isAvailable && (
                            <button
                              onClick={() => handleTakeOrder(order.id)}
                              className="px-3 py-1 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600"
                            >
                              Take
                            </button>
                          )}
                          
                          {/* Mark as Served Button */}
                          {isMyOrder && order.status === 'READY_TO_SERVE' && (
                            <button
                              onClick={() => handleMarkAsServed(order.id)}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              Mark Served
                            </button>
                          )}
                          
                          {/* Mark as Completed Button - NOW VISIBLE */}
                          {isMyOrder && order.status === 'SERVED' && (
                            <button
                              onClick={() => handleMarkAsCompleted(order.id)}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                            >
                              Complete
                            </button>
                          )}
                          
                          {/* Status Display for completed */}
                          {isCompleted && (
                            <span className="px-3 py-1 text-green-700 text-sm font-medium">Completed</span>
                          )}
                          
                          {/* No actions for served orders not belonging to this waiter */}
                          {isServed && !isMyOrder && (
                            <span className="px-3 py-1 text-gray-500 text-sm">Being served by another waiter</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No orders in the system</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterDashboard;