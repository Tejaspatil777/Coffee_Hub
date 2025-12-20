import { motion } from 'framer-motion';
import { Clock, CheckCircle } from 'lucide-react';
import { mockOrderHistory } from '../mockData';

const OrderHistory = () => {
  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order History</h1>
        <p className="text-gray-600">View your completed orders</p>
      </motion.div>

      {/* History List */}
      <div className="space-y-4">
        {mockOrderHistory.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 8, boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)' }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-green-100 p-4 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{order.orderNumber}</h3>
                  <p className="text-gray-600">Table: {order.tableNumber}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {order.items.map((item, i) => (
                      <span key={i} className="text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{new Date(order.completedTime).toLocaleTimeString()}</span>
                </div>
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold">
                  {order.preparationTime}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;