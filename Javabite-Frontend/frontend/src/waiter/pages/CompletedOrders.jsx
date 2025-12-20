import { motion } from 'framer-motion';
import { CheckCircle, Clock, DollarSign, User, MapPin } from 'lucide-react';
import { mockCompletedOrders } from '../mockData';

const CompletedOrders = () => {
  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Completed Orders</h1>
        <p className="text-gray-600">View your successfully completed orders</p>
      </motion.div>

      {/* Completed Orders List */}
      <div className="space-y-4">
        {mockCompletedOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 8, boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)' }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-emerald-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 flex-1">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl shadow-lg"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>

                {/* Order Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{order.orderNumber}</h3>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{order.tableNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(order.completedTime).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {order.items.map((item, i) => (
                      <span key={i} className="text-sm bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right ml-6">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{order.totalAmount}</span>
                </div>
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-sm">
                  COMPLETED
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {mockCompletedOrders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-gray-50 rounded-2xl"
        >
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No completed orders yet</p>
        </motion.div>
      )}
    </div>
  );
};

export default CompletedOrders;