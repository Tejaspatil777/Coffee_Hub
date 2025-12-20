import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

function DatePicker({ selectedDate, onChange }) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <label className="flex items-center space-x-2 text-white font-medium">
        <Calendar className="h-5 w-5" />
        <span>Select Date</span>
      </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        min={today}
        className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-90 backdrop-blur-sm border-2 border-amber-200 focus:border-amber-500 focus:outline-none transition-all duration-300 text-gray-800 font-medium"
      />
    </motion.div>
  );
}

export default DatePicker;
