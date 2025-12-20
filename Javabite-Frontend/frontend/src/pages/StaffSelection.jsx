import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChefHat, UserRound } from 'lucide-react';

const StaffSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-orange-900/85 to-amber-800/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">Staff Portal</h1>
            <p className="text-amber-100 text-xl">Select your role to continue</p>
          </motion.div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chef Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 cursor-pointer"
              onClick={() => navigate('/chef/login')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <ChefHat className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Chef</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Access kitchen management system, view assigned orders, update order status, and manage your recipes.
                </p>
                
                <div className="mt-auto">
                  <button className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all w-full">
                    Login as Chef
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Waiter Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 cursor-pointer"
              onClick={() => navigate('/waiter/login')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <UserRound className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Waiter</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Manage customer orders, serve ready dishes, handle payments, and provide excellent customer service.
                </p>
                
                <div className="mt-auto">
                  <button className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all w-full">
                    Login as Waiter
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transition-all border-2 border-white/30"
            >
              ← Back to Home
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StaffSelection;