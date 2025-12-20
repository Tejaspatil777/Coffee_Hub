import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserRound, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const WaiterLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Attempting waiter login...');
      
      // CALL REAL BACKEND LOGIN API
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('Login Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login Success:', data);
        
        // Save REAL JWT token from backend
        if (!data.token) {
          toast.error('Login failed - No token received');
          setLoading(false);
          return;
        }
        
        localStorage.setItem('token', data.token);
        
        // Save user data from backend
        const userData = {
          id: data.id || 'WAITER-' + Date.now(),
          name: data.name || formData.email.split('@')[0],
          email: formData.email,
          role: data.role ? data.role.toLowerCase() : 'waiter'
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Verify role is WAITER
        if (userData.role !== 'waiter') {
          toast.error(`Access denied. You are a ${userData.role.toUpperCase()}, not a WAITER.`);
          localStorage.clear();
          setLoading(false);
          return;
        }
        
        localStorage.setItem('waiterAuth', 'true');
        localStorage.setItem('waiterName', userData.name);
        
        console.log('✅ Waiter login successful');
        toast.success(`Welcome ${userData.name}!`);
        
        navigate('/waiter/dashboard');
        
      } else {
        const errorText = await response.text();
        console.error('❌ Login Failed:', response.status, errorText);
        
        if (response.status === 401) {
          toast.error('Invalid email or password');
        } else if (response.status === 403) {
          toast.error('Access denied. You are not authorized as waiter.');
        } else {
          toast.error(`Login failed: ${response.status}`);
        }
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
    } catch (error) {
      console.error('🚨 Network Error:', error);
      toast.error('Cannot connect to server. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-teal-900/85 to-cyan-800/90"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-2xl">
              <UserRound className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Waiter Portal</h1>
            <p className="text-emerald-100">Login to manage your service</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="waiter@restaurant.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login to Service'
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                New waiter?{' '}
                <button
                  onClick={() => navigate('/staff')}
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  Register with invitation link
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WaiterLogin;