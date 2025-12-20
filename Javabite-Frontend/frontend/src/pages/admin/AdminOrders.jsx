import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, ChefHat, User, CheckCircle, AlertCircle, Users, AlertTriangle } from 'lucide-react'; // Changed Emergency to AlertTriangle
import { toast } from 'react-toastify';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [chefs, setChefs] = useState([]);
  const [waiters, setWaiters] = useState([]);

  // ⭐ MODAL STATES
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedStaffType, setSelectedStaffType] = useState('chef');
  const [selectedStaffName, setSelectedStaffName] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error("Authentication failed. Please log in as an Admin.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/admin/orders/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Admin orders data:", data);
        setOrders(data);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      toast.error(`Failed to fetch orders: ${error.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    const token = localStorage.getItem('token');
    try {
      // Fetch registered chefs
      const chefsResponse = await fetch('http://localhost:8080/api/admin/staff/registered/chefs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (chefsResponse.ok) {
        const chefsData = await chefsResponse.json();
        setChefs(chefsData.chefs || []);
      }

      // Fetch registered waiters
      const waitersResponse = await fetch('http://localhost:8080/api/admin/staff/registered/waiters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (waitersResponse.ok) {
        const waitersData = await waitersResponse.json();
        setWaiters(waitersData.waiters || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Emergency assignment modal
  const openEmergencyModal = (orderId, staffType = 'chef') => {
    setCurrentOrderId(orderId);
    setSelectedStaffType(staffType);
    setSelectedStaffId('');
    setSelectedStaffName('');
    setShowEmergencyModal(true);
  };

  // Submit emergency assignment
  const submitEmergencyAssignment = async () => {
    if (!selectedStaffId || !selectedStaffName) {
      toast.error("Please select a staff member");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = selectedStaffType === 'chef' 
        ? `http://localhost:8080/api/admin/orders/${currentOrderId}/assign-chef-emergency`
        : `http://localhost:8080/api/admin/orders/${currentOrderId}/assign-waiter-emergency`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [selectedStaffType + 'Id']: selectedStaffId
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || `Emergency ${selectedStaffType} assignment successful!`);
        fetchOrders(); // Refresh orders
        setShowEmergencyModal(false);
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to assign staff');
      }
    } catch (error) {
      toast.error('Failed to assign staff');
    }
  };

  // Handle staff selection change
  const handleStaffChange = (e) => {
    const staffId = e.target.value;
    setSelectedStaffId(staffId);
    
    if (selectedStaffType === 'chef') {
      const chef = chefs.find(c => c.id === staffId);
      setSelectedStaffName(chef ? chef.name : '');
    } else {
      const waiter = waiters.find(w => w.id === staffId);
      setSelectedStaffName(waiter ? waiter.name : '');
    }
  };

  // Regular status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/orders/status/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // Custom formatter for INR
  const formatINR = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0.00';
    }
    
    const amountInRupees = amount > 1000 ? amount / 100 : amount;
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amountInRupees);
  };

  // Helper function to get order total
  const getOrderTotal = (order) => {
    if (!order) return 0;
    
    if (order.totalPrice !== undefined && order.totalPrice !== null) {
      return order.totalPrice;
    }
    
    if (order.totalAmount !== undefined && order.totalAmount !== null) {
      const amount = typeof order.totalAmount === 'number' ? order.totalAmount : 
                     parseFloat(order.totalAmount);
      return amount > 1000 ? amount / 100 : amount;
    }
    
    if (order.items && order.items.length > 0) {
      return order.items.reduce((total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        return total + ((itemPrice * itemQuantity) / 100);
      }, 0);
    }
    
    return 0;
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status && o.status.toLowerCase() === filter;
  });

  // Check if order is locked (for display)
  const getOrderLockStatus = (order) => {
    if (order.chefLocked && order.lockedByChefId) {
      const chef = chefs.find(c => c.id === order.lockedByChefId);
      return {
        type: 'chef',
        name: chef ? chef.name : order.lockedByChefId,
        lockedAt: order.chefLockedAt
      };
    }
    
    if (order.waiterLocked && order.lockedByWaiterId) {
      const waiter = waiters.find(w => w.id === order.lockedByWaiterId);
      return {
        type: 'waiter',
        name: waiter ? waiter.name : order.lockedByWaiterId,
        lockedAt: order.waiterLockedAt
      };
    }
    
    return null;
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            Orders Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all orders. Use emergency assignment for stuck orders.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
          >
            Refresh Orders
          </button>
          
          {/* FILTER BUTTONS */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
            <Filter className="h-5 w-5 text-amber-600 dark:text-amber-400 ml-2" />
            {['all', 'PENDING', 'PREPARING', 'READY_TO_SERVE', 'SERVED', 'COMPLETED'].map((f) => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading orders...</p>
        </div>
      ) : (

        /* Orders Table */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-500 to-amber-600">
                <tr>
                  <th className="text-left py-4 px-6 text-white font-semibold">Order ID</th>
                  <th className="text-left py-4 px-6 text-white font-semibold">Customer</th>
                  <th className="text-left py-4 px-6 text-white font-semibold">Items & Lock Status</th>
                  <th className="text-left py-4 px-6 text-white font-semibold">Total</th>
                  <th className="text-left py-4 px-6 text-white font-semibold">Status</th>
                  <th className="text-left py-4 px-6 text-white font-semibold">Time</th>
                  <th className="text-left py-4 px-6 text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => {
                    const lockStatus = getOrderLockStatus(order);
                    
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold font-mono text-sm">
                          #{order.id ? order.id.substring(0, 8) + '...' : 'N/A'}
                        </td>
                        <td className="py-4 px-6">{order.customerEmail || 'N/A'}</td>

                        <td className="py-4 px-6 text-sm">
                          <div>
                            {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} items
                            <div className="text-xs text-gray-500">
                              {order.items?.map(item => 
                                `${item.name} (x${item.quantity || 1})`
                              ).join(', ') || 'No items'}
                            </div>
                            
                            {/* Lock Status Display */}
                            {lockStatus && (
                              <div className={`mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                lockStatus.type === 'chef' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                              }`}>
                                {lockStatus.type === 'chef' ? (
                                  <ChefHat className="h-3 w-3" />
                                ) : (
                                  <User className="h-3 w-3" />
                                )}
                                <span>
                                  Locked by {lockStatus.name}
                                  {lockStatus.lockedAt && (
                                    <span className="text-gray-500 ml-1">
                                      • {new Date(lockStatus.lockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-semibold">
                          {formatINR(getOrderTotal(order))}
                        </td>
                        <td className="py-4 px-6">
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
                                : order.status === 'SERVED'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}
                          >
                            {order.status ? order.status.replace(/_/g, ' ') : 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex flex-col space-y-2">
                            {/* Emergency Assignment Buttons */}
                            {order.status !== 'COMPLETED' && (
                              <>
                                {/* Emergency Chef Assignment */}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openEmergencyModal(order.id, 'chef')}
                                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                                >
                                  <AlertTriangle className="h-3 w-3" /> {/* Changed from Emergency */}
                                  <span>Emergency Chef</span>
                                </motion.button>

                                {/* Emergency Waiter Assignment */}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openEmergencyModal(order.id, 'waiter')}
                                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                                >
                                  <AlertTriangle className="h-3 w-3" /> {/* Changed from Emergency */}
                                  <span>Emergency Waiter</span>
                                </motion.button>

                                {/* Status Update Buttons */}
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                  {order.status === 'PENDING' && (
                                    <button
                                      onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                    >
                                      Start Prep
                                    </button>
                                  )}
                                  {order.status === 'PREPARING' && (
                                    <button
                                      onClick={() => handleStatusUpdate(order.id, 'READY_TO_SERVE')}
                                      className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                                    >
                                      Mark Ready
                                    </button>
                                  )}
                                  {order.status === 'READY_TO_SERVE' && (
                                    <button
                                      onClick={() => handleStatusUpdate(order.id, 'SERVED')}
                                      className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
                                    >
                                      Mark Served
                                    </button>
                                  )}
                                  {order.status === 'SERVED' && (
                                    <button
                                      onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                                    >
                                      Complete
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="text-6xl mb-4">☕</div>
                      <p className="text-lg font-medium">No orders found</p>
                      <p className="text-sm mt-2">Try changing your filter or check if orders exist</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Emergency Assignment Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-96"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" /> {/* Changed from Emergency */}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Emergency {selectedStaffType === 'chef' ? 'Chef' : 'Waiter'} Assignment
              </h2>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Use this only for stuck orders. This will override any existing assignment.
            </p>

            <div className="space-y-4">
              {/* Staff Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Staff Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedStaffType('chef')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      selectedStaffType === 'chef'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <ChefHat className="h-4 w-4 inline mr-1" />
                    Chef
                  </button>
                  <button
                    onClick={() => setSelectedStaffType('waiter')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      selectedStaffType === 'waiter'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-1" />
                    Waiter
                  </button>
                </div>
              </div>

              {/* Staff Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select {selectedStaffType === 'chef' ? 'Chef' : 'Waiter'}
                </label>
                <select
                  value={selectedStaffId}
                  onChange={handleStaffChange}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a {selectedStaffType}</option>
                  {(selectedStaffType === 'chef' ? chefs : waiters).map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Staff Info */}
              {selectedStaffName && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected: <span className="font-bold">{selectedStaffName}</span>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEmergencyAssignment}
                  disabled={!selectedStaffId}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    selectedStaffId
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-red-400 cursor-not-allowed'
                  }`}
                >
                  Emergency Assign
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export default AdminOrders;