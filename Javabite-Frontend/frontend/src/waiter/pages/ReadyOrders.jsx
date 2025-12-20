import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import ReadyOrderCard from '../components/ReadyOrderCard'; // Updated component

const ReadyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [waiterId, setWaiterId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setWaiterId(user.id);
    fetchReadyOrders();
    
    const interval = setInterval(fetchReadyOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchReadyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/waiter/orders/ready', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/waiter/orders/${orderId}/take`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Order taken for serving!');
        fetchReadyOrders(); // Refresh list
      } else {
        toast.error('Failed to take order');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to take order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.tableNumber?.toString().includes(searchQuery));
    
    // Only show READY_TO_SERVE orders
    return matchesSearch && order.status === 'READY_TO_SERVE';
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Orders Ready to Serve</h1>
        <p className="text-gray-600">Pick up and serve orders prepared by the kitchen</p>
      </div>

      {/* Alert Banner */}
      {filteredOrders.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Orders Ready!</h3>
              <p className="text-yellow-100">{filteredOrders.length} order(s) waiting to be served</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by ID, customer, or table..."
            className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-yellow-500 outline-none"
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
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
        <button
          onClick={fetchReadyOrders}
          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Orders Grid */}
      <AnimatePresence mode="wait">
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order, index) => (
              <ReadyOrderCard
                key={order.id}
                order={order}
                waiterId={waiterId}
                onTakeOrder={handleTakeOrder}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-100">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl text-yellow-600 font-semibold">All orders served!</p>
            <p className="text-yellow-500 mt-2">No orders ready at the moment</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReadyOrders;