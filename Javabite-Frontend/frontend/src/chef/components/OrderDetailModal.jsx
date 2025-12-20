import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, MapPin, ChefHat } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const OrderDetailModal = ({ order, onClose }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-500' },
    { value: 'preparing', label: 'Preparing', color: 'bg-blue-500' },
    { value: 'ready', label: 'Ready to Serve', color: 'bg-green-500' }
  ];

  const handleStatusUpdate = (newStatus) => {
    setUpdating(true);
    
    setTimeout(() => {
      setCurrentStatus(newStatus);
      setUpdating(false);
      
      if (newStatus === 'ready') {
        toast.success('Order marked as Ready! Waiter has been notified.');
      } else {
        toast.success(`Order status updated to ${newStatus}`);
      }
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{order.orderNumber}</h2>
                <div className="flex items-center space-x-4 text-orange-100">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{order.tableNumber}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(order.orderTime).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Status Progress */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <ChefHat className="w-5 h-5 mr-2 text-orange-600" />
                Order Status
              </h3>
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: currentStatus === 'pending' ? '0%' : currentStatus === 'preparing' ? '50%' : '100%'
                    }}
                    className="h-full bg-gradient-to-r from-orange-600 to-red-600"
                  />
                </div>

                {/* Status Points */}
                {statusOptions.map((status, index) => (
                  <motion.button
                    key={status.value}
                    onClick={() => handleStatusUpdate(status.value)}
                    disabled={updating}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative z-10 flex flex-col items-center ${
                      updating ? 'cursor-wait' : 'cursor-pointer'
                    }`}
                  >
                    <motion.div
                      animate={{
                        scale: currentStatus === status.value ? [1, 1.2, 1] : 1,
                        backgroundColor: statusOptions.findIndex(s => s.value === currentStatus) >= index
                          ? status.color.replace('bg-', '')
                          : '#e5e7eb'
                      }}
                      transition={{ repeat: currentStatus === status.value ? Infinity : 0, duration: 1.5 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        statusOptions.findIndex(s => s.value === currentStatus) >= index
                          ? status.color
                          : 'bg-gray-300'
                      }`}
                    >
                      <span className="text-white font-bold">{index + 1}</span>
                    </motion.div>
                    <span className={`mt-2 text-xs font-semibold ${
                      currentStatus === status.value ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {status.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.quantity}x {item.name}
                        </h4>
                        {item.notes && (
                          <p className="text-sm text-orange-600 mt-1 font-medium">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="bg-white px-3 py-1 rounded-lg font-bold text-orange-600">
                        x{item.quantity}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {currentStatus === 'ready' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center"
              >
                <p className="text-green-700 font-semibold">Order is ready! Waiter has been notified.</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t-2 border-gray-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetailModal;