import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900/90 to-amber-800/90 backdrop-blur-sm shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-amber-100 hover:text-white transition-colors duration-300">
            ☕ Java Bite
          </Link>

          <div className="flex space-x-8">
            <Link
              to="/"
              className="text-amber-100 hover:text-white transition-all duration-300 hover:scale-110 font-medium"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="text-amber-100 hover:text-white transition-all duration-300 hover:scale-110 font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-amber-100 hover:text-white transition-all duration-300 hover:scale-110 font-medium"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
