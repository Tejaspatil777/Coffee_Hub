import { motion } from 'framer-motion';

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-r from-amber-900 to-amber-800 text-amber-100 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Coffee Haven</h3>
            <p className="text-amber-200">
              Serving the finest coffee since 2024. Experience the perfect blend of quality and comfort.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">About Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">Menu</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-300">Contact</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Contact Us</h3>
            <p className="text-amber-200">123 Coffee Street</p>
            <p className="text-amber-200">City, State 12345</p>
            <p className="text-amber-200">contact@coffeehaven.com</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-amber-700 text-center">
          <p className="text-amber-200">&copy; 2024 Coffee Haven. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
