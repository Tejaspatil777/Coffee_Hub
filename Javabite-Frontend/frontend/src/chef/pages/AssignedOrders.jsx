import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, X, ChefHat, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [chefId, setChefId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setChefId(user.id);
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/chef/orders/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Orders loaded:', data.length);
        setOrders(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // SIMPLIFIED: Take order
  const handleTakeOrder = async (orderId) => {
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
        
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        toast.success('Order taken for preparation!');
      } else {
        toast.error('Failed to take order');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to take order');
    }
  };

  // SIMPLIFIED: Mark order as ready
  const handleMarkAsReady = async (orderId) => {
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
        
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        toast.success('Order marked as ready!');
      } else {
        toast.error('Failed to mark as ready');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to mark as ready');
    }
  };

  // Filter and search
  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'READY_TO_SERVE', label: 'Ready' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      (order.id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PREPARING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'READY_TO_SERVE': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Kitchen Orders</h1>
        <p className="text-gray-600">View and manage all orders in the kitchen</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={fetchAllOrders}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Orders
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200"
        >
          Show Pending Orders
        </button>
        <button
          onClick={() => {
            console.log('Debug Orders:', orders);
            orders.forEach(order => {
              console.log(`Order ${order.id}:`, {
                status: order.status,
                chefLocked: order.chefLocked,
                lockedByChefId: order.lockedByChefId
              });
            });
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
        >
          Debug Log
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border-2 border-gray-200">
          <Filter className="w-5 h-5 text-gray-400 ml-2" />
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === option.value
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid - SIMPLIFIED LOGIC */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              {/* Order Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Order #{order.id?.substring(0, 8)}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Customer: {order.customerEmail || 'Customer'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-500">
                        ₹{((item.price || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Price */}
                {order.totalPrice && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-green-600">
                        ₹{order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - SIMPLIFIED LOGIC */}
              <div className="space-y-2">
                {/* SHOW "Start Preparing" if PENDING */}
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleTakeOrder(order.id)}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-4 h-4" />
                    Start Preparing
                  </button>
                )}

                {/* SHOW "Mark as Ready" if PREPARING */}
                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => handleMarkAsReady(order.id)}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Ready
                  </button>
                )}

                {/* SHOW status if READY_TO_SERVE */}
                {order.status === 'READY_TO_SERVE' && (
                  <div className="text-center py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200">
                    ✅ Ready for waiters
                  </div>
                )}

                {/* Order Details */}
                <div className="text-xs text-gray-500 mt-2">
                  <div>ID: {order.id}</div>
                  <div>Created: {new Date(order.createdAt).toLocaleTimeString()}</div>
                  {order.chefLocked && (
                    <div>Locked by Chef: {order.lockedByChefId?.substring(0, 8)}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
          <ChefHat className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-orange-800 mb-2">No orders found</p>
          <p className="text-orange-600">
            {filter === 'all' 
              ? 'No orders in the kitchen yet'
              : `No ${filter.toLowerCase()} orders found`
            }
          </p>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">How it works:</h3>
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <span className="font-medium text-yellow-700">PENDING</span>: Click "Start Preparing" to take order</li>
          <li>• <span className="font-medium text-blue-700">PREPARING</span>: Click "Mark as Ready" when finished</li>
          <li>• <span className="font-medium text-green-700">READY_TO_SERVE</span>: Waiters will serve to customers</li>
        </ul>
      </div>
    </div>
  );
};

export default AssignedOrders;