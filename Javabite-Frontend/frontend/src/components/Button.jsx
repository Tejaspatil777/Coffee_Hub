import { motion } from 'framer-motion';

function Button({ children, onClick, type = 'button', variant = 'primary', fullWidth = false, className = '' }) {
  const baseClasses = `${fullWidth ? 'w-full' : 'px-8'} py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform`;
  
  const variants = {
    primary: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white',
    secondary: 'bg-gradient-to-r from-amber-900 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white',
    outline: 'border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white',
  };

  // If className includes bg-gradient, use custom styling
  const hasCustomGradient = className.includes('bg-gradient');
  
  return (
    <motion.button
      whileHover={{ scale: hasCustomGradient ? 1.05 : 1.05 }}
      whileTap={{ scale: hasCustomGradient ? 0.95 : 0.95 }}
      type={type}
      onClick={onClick}
      className={`${hasCustomGradient ? className : variants[variant]} ${baseClasses}`}
    >
      {children}
    </motion.button>
  );
}

export default Button;