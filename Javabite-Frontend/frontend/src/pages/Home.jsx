import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div
        className="flex-1 relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1920')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
            backgroundSize: '200% 200%',
          }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-7xl mb-6"
            >
              ☕
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-amber-900 mb-4"
            >
              Welcome to
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-amber-600 to-amber-900 bg-clip-text text-transparent mb-6"
            >
              JavaBite
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-amber-800 mb-10 leading-relaxed"
            >
              Experience the finest coffee crafted with passion and precision. Your perfect cup awaits.
            </motion.p>

            <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.9 }}
  className="flex flex-col sm:flex-row gap-4 justify-center"
>
  <Button onClick={() => navigate('/login')} variant="primary">
    Login
  </Button>
  <Button onClick={() => navigate('/register')} variant="outline">
    Sign Up
  </Button>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate('/staff')}
    className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform"
  >
    Login as Staff
  </motion.button>
</motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-12"
            >
              <p className="text-amber-700 text-sm">Scroll down to explore</p>
              <div className="text-3xl text-amber-600">↓</div>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative z-10 bg-white/95 backdrop-blur-md py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-center text-amber-900 mb-12"
            >
              Why Choose Coffee Haven?
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: '🌟', title: 'Premium Quality', description: 'Hand-selected beans from the finest farms around the world' },
                { icon: '👨‍🍳', title: 'Expert Baristas', description: 'Skilled professionals crafting each cup to perfection' },
                { icon: '🏠', title: 'Cozy Atmosphere', description: 'A warm and inviting space to relax and enjoy' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-amber-50 to-amber-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="text-6xl mb-4">{feature.icon}</div>
                  <h4 className="text-2xl font-bold text-amber-900 mb-3">{feature.title}</h4>
                  <p className="text-amber-800 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;