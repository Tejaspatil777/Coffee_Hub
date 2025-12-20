import { motion } from 'framer-motion';
import { Clock, User, MapPin, AlertCircle } from 'lucide-react';

const OrderCard = ({ order, onClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'preparing':
        return 'bg-blue-100 text-blue-700';
      case 'ready':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-lg cursor-pointer border-2 border-gray-100 hover:border-orange-300 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-xl font-bold text-gray-800">{order.orderNumber}</h3>
            {order.priority === 'high' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
              </motion.div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{order.tableNumber}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{order.customerName}</span>
            </div>
          </div>
        </div>

        {/* Priority Badge */}
        <motion.div
          animate={order.priority === 'high' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityColor(order.priority)}`}
        >
          {order.priority.toUpperCase()}
        </motion.div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between items-start text-sm">
            <div className="flex-1">
              <span className="font-medium text-gray-700">{item.quantity}x {item.name}</span>
              {item.notes && (
                <p className="text-xs text-orange-600 mt-1">Note: {item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{order.estimatedTime}</span>
        </div>
        <div className={`px-4 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
          {order.status.toUpperCase()}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;