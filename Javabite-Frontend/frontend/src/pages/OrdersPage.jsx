import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, X, Clock, CheckCircle, Package, Truck } from 'lucide-react';
import axios from "axios";

import { toast } from 'react-toastify';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:8080/order/my-orders", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Debug log to check data structure
    if (res.data && res.data.length > 0) {
      console.log("First order data:", res.data[0]);
      console.log("totalPrice field:", res.data[0]?.totalPrice);
      console.log("totalAmount field:", res.data[0]?.totalAmount);
      console.log("Items in order:", res.data[0]?.items);
    }

    setOrders(res.data);

  } catch (err) {
    console.error(err);
    toast.error("Failed to load orders");
  }
};

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowSidebar(true);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
  try {
    await axios.patch(
      `http://localhost:8080/order/${orderId}/status?status=${newStatus}`
    );

    toast.success(`Order updated to ${newStatus}`);

    loadOrders();

    setSelectedOrder(prev => ({
      ...prev,
      status: newStatus
    }));

  } catch (err) {
    console.error(err);
    toast.error("Failed to update status");
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING': return 'bg-blue-100 text-blue-800';
      case 'READY_TO_SERVE': return 'bg-green-100 text-green-800';
      case 'SERVED': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'PREPARING': return 'Preparing';
      case 'READY_TO_SERVE': return 'Ready';
      case 'SERVED': return 'Served';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'PREPARING': return <Package className="h-4 w-4" />;
      case 'READY_TO_SERVE': return <CheckCircle className="h-4 w-4" />;
      case 'SERVED': return <Truck className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get the correct total amount from order
  const getOrderTotal = (order) => {
    if (!order) return 0;
    
    // Priority 1: Use totalPrice from backend (in rupees)
    if (order.totalPrice !== undefined && order.totalPrice !== null) {
      return order.totalPrice * 100; // Convert rupees to paise for frontend
    }
    
    // Priority 2: Use totalAmount if available (already in paise)
    if (order.totalAmount !== undefined && order.totalAmount !== null) {
      return order.totalAmount;
    }
    
    // Priority 3: Calculate from items if needed
    if (order.items && order.items.length > 0) {
      return order.items.reduce((total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        return total + (itemPrice * itemQuantity);
      }, 0);
    }
    
    return 0;
  };

  // Helper function to safely format price
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return '₹0.00';
    }
    
    // Convert to number if it's a string
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(priceNum)) {
      return '₹0.00';
    }
    
    // If price is less than 1000, assume it's already in rupees
    // Otherwise, assume it's in paise and convert to rupees
    const amountInRupees = priceNum < 1000 ? priceNum : priceNum / 100;
    
    return `₹${amountInRupees.toFixed(2)}`;
  };

  // Helper function to safely format item price
  const formatItemPrice = (priceInPaise, quantity) => {
    if (priceInPaise === undefined || priceInPaise === null || quantity === undefined) {
      return '₹0.00';
    }
    const total = (priceInPaise * quantity) / 100;
    return `₹${total.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-10 w-10 text-amber-700" />
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600">{orders.length} total orders</p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg"
            data-testid="no-orders-message"
          >
            <ShoppingBag className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600">Start ordering to see your order history here</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOrderClick(order)}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                data-testid={`order-item-${order.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-lg text-amber-700">{order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Items</p>
                        <p className="font-semibold text-gray-800">{order.items ? order.items.length : 0} item(s)</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Total Amount</p>
                        <p className="font-bold text-green-600 text-lg">
                          {formatPrice(getOrderTotal(order))}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Date & Time</p>
                        <p className="font-semibold text-gray-800">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-amber-600 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Order Detail Sidebar */}
      <AnimatePresence>
        {showSidebar && selectedOrder && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
              data-testid="order-detail-sidebar"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    data-testid="close-sidebar-button"
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                {/* Order Info */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Order ID</span>
                    <span className="font-mono font-bold text-amber-700">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Date & Time</span>
                    <span className="font-semibold text-gray-800">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {getStatusDisplay(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-amber-200">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(getOrderTotal(selectedOrder))}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Order Items</h3>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                          </div>
                          <p className="font-bold text-amber-700">
                            {formatItemPrice(item.price, item.quantity || 1)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items in this order</p>
                  )}
                </div>

                {/* Chef Status Update Area - UI ONLY */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-dashed border-blue-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">Status of the order!</h3>
                  </div>
                  
                  
                  
                  <div className="space-y-2">
                    {['PENDING', 'PREPARING', 'READY_TO_SERVE', 'SERVED', 'COMPLETED'].map((status) => (
                      <motion.button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={selectedOrder.status === status}
                        className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          selectedOrder.status === status
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-white hover:bg-blue-100 text-gray-800 shadow-sm hover:shadow-md'
                        }`}
                        data-testid={`status-button-${status.toLowerCase()}`}
                      >
                        {getStatusIcon(status)}
                        {selectedOrder.status === status ? `Current: ${getStatusDisplay(status)}` : `Set to ${getStatusDisplay(status)}`}
                      </motion.button>
                    ))}
                  </div>
                  
                  {selectedOrder.status === 'COMPLETED' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3 text-center"
                    >
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-green-800">Order Completed!</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrdersPage;