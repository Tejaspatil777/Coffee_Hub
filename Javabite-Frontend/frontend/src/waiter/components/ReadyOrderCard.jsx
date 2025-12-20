import { motion } from 'framer-motion';
import { Clock, User, MapPin, CheckCircle, ShoppingBag, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const ReadyOrderCard = ({ order, onTakeOrder, waiterId }) => {
  // Check if order is available (not locked by other waiters)
  const isAvailable = !order.waiterLocked || order.lockedByWaiterId === waiterId;
  
  // Check if order is locked by another waiter
  const isLockedByOther = order.waiterLocked && order.lockedByWaiterId !== waiterId;
  
  // Check if order is locked by current waiter
  const isMyOrder = order.waiterLocked && order.lockedByWaiterId === waiterId;

  const handleTakeOrder = () => {
    console.log('Taking order:', order.id);
    if (onTakeOrder) {
      onTakeOrder(order.id);
    }
  };

  const handleMarkServed = () => {
    toast.success(`Order ${order.id?.substring(0, 8)} marked as served!`);
    // Call parent function to update status
    // onStatusUpdate(order.id, 'SERVED');
  };

  // Format price from paise to rupees
  const formatPrice = (price) => {
    return `₹${((price || 0) / 100).toFixed(2)}`;
  };

  // Calculate total price
  const calculateTotal = () => {
    if (order.totalPrice) return order.totalPrice.toFixed(2);
    
    // Calculate from items if totalPrice is not available
    const total = order.items?.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0) || 0;
    
    return (total / 100).toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      className={`bg-white rounded-2xl p-6 shadow-lg border-2 ${
        isLockedByOther ? 'border-red-200' :
        isMyOrder ? 'border-blue-200' :
        'border-yellow-200 hover:border-yellow-300'
      } transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            Order #{order.id?.substring(0, 8)}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{order.customerEmail || 'Customer'}</span>
            </div>
            {order.tableNumber && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Table {order.tableNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-end gap-1">
          <motion.div
            animate={{ scale: isAvailable && !isLockedByOther ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isLockedByOther ? 'bg-red-100 text-red-700 border-red-300' :
              isMyOrder ? 'bg-blue-100 text-blue-700 border-blue-300' :
              'bg-yellow-100 text-yellow-700 border-yellow-300'
            } border-2`}
          >
            {isLockedByOther ? 'TAKEN' : isMyOrder ? 'YOURS' : 'READY'}
          </motion.div>
          
          {/* Time */}
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2 mb-4">
        {order.items && order.items.slice(0, 3).map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">{item.quantity}x</span>
              <span className="text-gray-700">{item.name}</span>
            </div>
            <span className="text-gray-500 font-medium">
              {formatPrice(item.price)}
            </span>
          </div>
        ))}
        
        {order.items && order.items.length > 3 && (
          <p className="text-xs text-gray-500 text-center">
            +{order.items.length - 3} more items
          </p>
        )}
      </div>

      {/* Total Price */}
      <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Total:</span>
          <span className="text-xl font-bold text-green-600">
            ₹{calculateTotal()}
          </span>
        </div>
      </div>

      {/* Lock Status Message */}
      {isLockedByOther && (
        <div className="mb-4 flex items-center gap-2 p-2 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">
            Taken by another waiter
          </p>
        </div>
      )}

      {isMyOrder && (
        <div className="mb-4 flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <User className="w-4 h-4 text-blue-500" />
          <p className="text-sm text-blue-600">
            You are serving this order
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 border-t-2 border-gray-100">
        {isAvailable && !isLockedByOther && !isMyOrder && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTakeOrder}
            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Take Order for Serving</span>
          </motion.button>
        )}

        {isMyOrder && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkServed}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Mark as Served</span>
          </motion.button>
        )}

        {isLockedByOther && (
          <button
            disabled
            className="w-full py-3 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed"
          >
            Unavailable (Taken by another waiter)
          </button>
        )}

        {/* Order Details */}
        <div className="mt-3 text-xs text-gray-500">
          <div className="grid grid-cols-2 gap-1">
            <div>Order ID: {order.id?.substring(0, 10)}...</div>
            <div className="text-right">
              Status: <span className="font-medium">{order.status}</span>
            </div>
            {order.chefId && (
              <div>Prepared by: Chef {order.chefId?.substring(0, 6)}</div>
            )}
            {order.waiterId && (
              <div className="text-right">
                Waiter: {order.waiterId?.substring(0, 6)}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReadyOrderCard;