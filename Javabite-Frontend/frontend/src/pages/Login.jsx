import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { loginUser } from '../services/authServices';
import { toast } from "react-toastify";


function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
  newErrors.password = "Password is required";
}

   

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setServerError('');
  setSuccess('');

  if (validateForm()) {
    try {
      const res = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      const data = res.data;

      // Save token & user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      toast.success(`Welcome, ${data.name}!`);

      // Redirect based on user role
      if (data.role === 'ADMIN' || data.role === 'admin') {
        navigate('/admin');  // Redirect to admin panel
      } else {
        navigate('/dashboard');  // Redirect to customer dashboard
      }

    } catch (err) {
      setServerError(err?.response?.data || 'Login failed');
    }
  }
};



  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div
        className="flex-1 relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=1920')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/70 to-amber-800/70 backdrop-blur-sm"></div>

        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-center mb-8"
            >
              <div className="text-6xl mb-4 animate-float">☕</div>
              <h2 className="text-4xl font-bold text-amber-900 mb-2">Welcome Back</h2>
              <p className="text-amber-700">Login to continue your coffee journey</p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-1"
            >
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
  label="Password"
  type="password"
  name="password"
  placeholder="Enter your password"
  value={formData.password}
  onChange={handleChange}
  required
/>

              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-600 text-sm mt-1 mb-3"
                >
                  {errors.email}
                </motion.p>
              )}
              {errors.password && (
  <motion.p
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="text-red-600 text-sm mt-1 mb-3"
  >
    {errors.password}
  </motion.p>
)}

              
             
              

              <div className="pt-4">
                <Button type="submit" variant="primary" fullWidth>
                  Login
                </Button>
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <p className="text-amber-800">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-amber-600 font-semibold hover:text-amber-800 transition-colors duration-300 underline"
                >
                  Sign Up
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Login;
