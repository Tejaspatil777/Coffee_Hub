import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const ChefLogin = () => {
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
    console.log('🔐 Attempting REAL chef login...');
    console.log('Email:', formData.email);
    
    // ✅ CALL REAL BACKEND LOGIN API
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
      console.log('✅ REAL Login Success:', data);
      
      // ✅ Save REAL JWT token from backend
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('✅ Real JWT token saved');
      } else {
        console.error('❌ No token in response:', data);
        toast.error('Login failed - No token received');
        setLoading(false);
        return;
      }
      
      // ✅ Save user data from backend
      const userData = {
        id: data.id || 'CHEF-' + Date.now(),
        name: data.name || formData.email.split('@')[0],
        email: formData.email,
        role: data.role ? data.role.toLowerCase() : 'chef'
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // ✅ Verify role is CHEF
      if (userData.role !== 'chef') {
        console.error('❌ User is not a chef. Role:', userData.role);
        toast.error(`Access denied. You are a ${userData.role.toUpperCase()}, not a CHEF.`);
        localStorage.clear();
        setLoading(false);
        return;
      }
      
      // ✅ Additional chef-specific data
      localStorage.setItem('chefAuth', 'true');
      localStorage.setItem('chefName', userData.name);
      
      console.log('✅ Chef login successful with REAL JWT');
      toast.success(`Welcome Chef ${userData.name}!`);
      
      // Navigate to chef dashboard
      navigate('/chef/dashboard');
      
    } else {
      // Handle login failure
      const errorText = await response.text();
      console.error('❌ REAL Login Failed:', response.status, errorText);
      
      if (response.status === 401) {
        toast.error('Invalid email or password');
      } else if (response.status === 403) {
        toast.error('Access denied. You are not authorized as chef.');
      } else if (response.status === 404) {
        toast.error('Login endpoint not found. Check backend is running.');
      } else {
        toast.error(`Login failed: ${response.status} ${response.statusText}`);
      }
      
      // Clear any existing auth
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
  } catch (error) {
    console.error('🚨 Network Error:', error);
    toast.error('Cannot connect to server. Check if backend is running.');
    
    // Fallback to mock data for testing ONLY
    console.log('⚠️ Using fallback mock login...');
    fallbackMockLogin();
  } finally {
    setLoading(false);
  }
};

// Fallback mock login (ONLY if backend is down)
const fallbackMockLogin = () => {
  localStorage.setItem('token', 'chef-token-' + Date.now());
  
  const userData = {
    id: 'CHEF-' + Math.floor(Math.random() * 1000),
    name: 'Chef Marco',
    email: formData.email,
    role: 'chef'
  };
  
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('chefAuth', 'true');
  localStorage.setItem('chefName', 'Chef Marco');
  
  console.log('⚠️ Using mock login - Backend unavailable');
  toast.warning('Using demo mode - Backend connection failed');
  
  navigate('/chef/dashboard');
};

  // Test credentials button (for development)
  const useTestCredentials = () => {
    setFormData({
      email: 'chef@restaurant.com',
      password: 'password123'
    });
    toast.info('Test credentials loaded. Click Login to test.');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/90 via-red-900/85 to-orange-800/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div 
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-2xl">
              <ChefHat className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Chef Portal</h1>
            <p className="text-orange-100">Login to manage your kitchen</p>
            
            {/* Test Credentials Button (DEV ONLY) */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={useTestCredentials}
                className="mt-4 px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30"
              >
                Load Test Credentials
              </button>
            )}
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
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
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                    placeholder="chef@restaurant.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
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

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  'Login to Kitchen'
                )}
              </motion.button>
            </form>

            {/* Debug Info (DEV ONLY) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Backend Info:</h3>
                <p className="text-xs text-gray-600">
                  Endpoint: <code>POST /api/auth/login</code><br/>
                  Required: Email + Password<br/>
                  Returns: JWT token + user role
                </p>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('http://localhost:8080/health');
                      console.log('Backend health:', await res.text());
                      toast.info('Backend is running');
                    } catch (e) {
                      toast.error('Backend not reachable');
                    }
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Check Backend Status
                </button>
              </div>
            )}

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                New chef?{' '}
                <button
                  onClick={() => navigate('/staff')}
                  className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
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

export default ChefLogin;