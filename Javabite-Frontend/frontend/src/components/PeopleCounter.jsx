import { Users, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

function PeopleCounter({ count, onChange }) {
  const increment = () => {
    if (count < 10) onChange(count + 1);
  };

  const decrement = () => {
    if (count > 1) onChange(count - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="space-y-3"
    >
      <label className="flex items-center space-x-2 text-white font-medium">
        <Users className="h-5 w-5" />
        <span>Number of People</span>
      </label>
      <div className="flex items-center justify-center space-x-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4">
        <motion.button
          onClick={decrement}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={count <= 1}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            count <= 1
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg'
          }`}
        >
          <Minus className="h-5 w-5 text-white" />
        </motion.button>

        <motion.div
          key={count}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-xl"
        >
          <span className="text-3xl font-bold text-white">{count}</span>
        </motion.div>

        <motion.button
          onClick={increment}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={count >= 10}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            count >= 10
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg'
          }`}
        >
          <Plus className="h-5 w-5 text-white" />
        </motion.button>
      </div>
      <p className="text-center text-white text-sm">Maximum 10 people per booking</p>
    </motion.div>
  );
}

export default PeopleCounter;
