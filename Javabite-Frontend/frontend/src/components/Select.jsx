import { motion } from 'framer-motion';

function Select({ label, name, options, value, onChange, required = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      {label && (
        <label className="block text-amber-900 text-sm font-semibold mb-2" htmlFor={name}>
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all duration-300 bg-white/90 backdrop-blur-sm cursor-pointer"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </motion.div>
  );
}

export default Select;
