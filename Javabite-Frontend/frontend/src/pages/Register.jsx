import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { registerUser } from '../services/authServices';
import { toast } from "react-toastify";
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const [roleOptions, setRoleOptions] = useState([
    { value: 'customer', label: 'Customer' },
    { value: 'chef', label: 'Chef' },
    { value: 'waiter', label: 'Waiter' },
    { value: 'admin', label: 'Admin' },
  ]);

  // Check if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/auth/adminExists');
        if (res.data.adminExists) {
          // Remove Admin option if already exists
          setRoleOptions([
            { value: 'customer', label: 'Customer' },
            { value: 'chef', label: 'Chef' },
            { value: 'waiter', label: 'Waiter' },
          ]);
        }
      } catch (err) {
        console.error("Failed to check admin:", err);
      }
    };
    checkAdmin();
  }, []);

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
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
        await registerUser(formData); // Call backend!
        toast.success("Account created successfully!");
        navigate('/login');
      } catch (err) {
        toast.error(err?.response?.data || "Registration failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div
        className="flex-1 relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/1907642/pexels-photo-1907642.jpeg?auto=compress&cs=tinysrgb&w=1920')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-amber-800/70 via-amber-900/70 to-amber-950/70 backdrop-blur-sm"></div>

        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 0%, rgba(251, 191, 36, 0.1) 50%, transparent 100%)',
              'linear-gradient(225deg, transparent 0%, rgba(251, 191, 36, 0.1) 50%, transparent 100%)',
              'linear-gradient(45deg, transparent 0%, rgba(251, 191, 36, 0.1) 50%, transparent 100%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md w-full"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              className="text-center mb-8"
            >
              <div className="text-6xl mb-4 animate-float">☕</div>
              <h2 className="text-4xl font-bold text-amber-900 mb-2">Join Us</h2>
              <p className="text-amber-700">Create your Coffee Haven account</p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-1"
            >
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              {errors.fullName && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-600 text-sm mt-1 mb-3"
                >
                  {errors.fullName}
                </motion.p>
              )}

              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
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

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-600 text-sm mt-1 mb-3"
                >
                  {errors.password}
                </motion.p>
              )}

              <Select
                label="Role"
                name="role"
                options={roleOptions}
                value={formData.role}
                onChange={handleChange}
                required
              />
              {errors.role && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-600 text-sm mt-1 mb-3"
                >
                  {errors.role}
                </motion.p>
              )}

              <div className="pt-4">
                <Button type="submit" variant="primary" fullWidth>
                  Register
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
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-amber-600 font-semibold hover:text-amber-800 transition-colors duration-300 underline"
                >
                  Login
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

export default Register;
