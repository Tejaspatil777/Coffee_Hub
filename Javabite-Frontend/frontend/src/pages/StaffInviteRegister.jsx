import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const StaffInviteRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token found.');
      setValidating(false);
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/invite/validate?token=${token}`);
        
        if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        
        if (!response.ok) {
          throw new Error('Failed to validate invitation');
        }
        
        const data = await response.json();
        setInviteData(data);
        setValidating(false);
        toast.success('Invitation validated successfully!');
      } catch (err) {
        setError(err.message || 'Failed to validate invitation');
        toast.error(err.message || 'Invalid invitation');
        setValidating(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteData) {
      toast.error('Invalid invitation data');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/staff-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          email: inviteData.email,
          name: inviteData.name,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store the JWT token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userName', data.name);

      toast.success('Registration successful! Redirecting to dashboard...');
      
      // Redirect based on role
      setTimeout(() => {
        if (data.role === 'CHEF') {
          navigate('/chef/dashboard');
        } else if (data.role === 'WAITER') {
          navigate('/waiter/dashboard');
        } else {
          navigate('/login');
        }
      }, 1500);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Please contact your administrator for a new invitation link.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  const isChef = inviteData.role === 'CHEF';
  const RoleIcon = isChef ? ChefHat : User;
  const roleName = isChef ? 'Chef' : 'Waiter';
  const bgGradient = isChef 
    ? 'from-orange-500 via-orange-600 to-red-500' 
    : 'from-emerald-500 via-teal-600 to-cyan-500';
  const textColor = isChef ? 'text-orange-600' : 'text-emerald-600';
  const borderColor = isChef ? 'border-orange-200' : 'border-emerald-200';
  const focusBorderColor = isChef ? 'focus:border-orange-500' : 'focus:border-emerald-500';
  const focusRingColor = isChef ? 'focus:ring-orange-200' : 'focus:ring-emerald-200';
  const buttonGradient = isChef 
    ? 'from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
    : 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}/90`}></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-2xl ${textColor}`}>
              <RoleIcon className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Join JavaBite</h1>
            <p className="text-white/90 text-lg">Complete your {roleName} registration</p>
          </motion.div>

          {/* Registration Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            {/* Invite Info Card */}
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Invitation Verified</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Valid</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-800">{inviteData.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{inviteData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100">
                  <RoleIcon className={`h-5 w-5 ${textColor} mr-3`} />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className={`font-semibold ${textColor}`}>{roleName}</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Set Your Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full pl-12 pr-12 py-3 border-2 ${borderColor} rounded-xl ${focusBorderColor} focus:ring-2 ${focusRingColor} transition-all outline-none bg-white/50`}
                    placeholder="Create a secure password"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1">
                  Must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3 border-2 ${borderColor} rounded-xl ${focusBorderColor} focus:ring-2 ${focusRingColor} transition-all outline-none bg-white/50`}
                    placeholder="Re-enter your password"
                    required
                    minLength="6"
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 bg-gradient-to-r ${buttonGradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating Account...
                  </span>
                ) : (
                  `Complete Registration as ${roleName}`
                )}
              </motion.button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                <Lock className="inline h-3 w-3 mr-1" />
                Your information is secured with 256-bit SSL encryption
              </p>
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-white/80 text-sm">
              Need help?{' '}
              <a href="mailto:support@javabite.com" className="text-white font-medium hover:underline">
                Contact Support
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StaffInviteRegister;