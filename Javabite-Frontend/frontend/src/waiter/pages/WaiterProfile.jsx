import { motion } from 'framer-motion';
import { User, Mail, Phone, Award, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const WaiterProfile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    joinDate: '',
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userName = localStorage.getItem('userName') || 'Waiter';
    const userEmail = localStorage.getItem('userEmail') || 'waiter@restaurant.com';
    
    // Calculate join date from createdAt if available
    const userCreatedAt = localStorage.getItem('userCreatedAt');
    let joinDate = 'February 2024'; // Default
    if (userCreatedAt) {
      const date = new Date(userCreatedAt);
      joinDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    // Fetch additional data from backend if needed
    const fetchAdditionalData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // You can add API calls here to fetch more profile data
        // For example: achievements, performance metrics, etc.
        
        // For now, use mock achievements based on role
        const achievements = ['Service Excellence', 'Customer Favorite', 'Quick Response'];
        
        setProfileData({
          name: userName,
          email: userEmail,
          phone: '+1 234 567 8900', // This should come from backend
          joinDate: joinDate,
          achievements: achievements
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdditionalData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Waiter Profile</h1>
        <p className="text-gray-600">Manage your profile information</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10 flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{profileData.name}</h2>
              <p className="text-emerald-100">Professional Waiter</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-8 space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <Mail className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">{profileData.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <Phone className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-800">{profileData.phone}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-600">Joined</p>
              <p className="font-semibold text-gray-800">{profileData.joinDate}</p>
            </div>
          </div>

          {/* Achievements */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-3">
              <Award className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-gray-800">Achievements</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.achievements.map((achievement, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white px-4 py-2 rounded-full text-emerald-600 font-semibold shadow-md"
                >
                  {achievement}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WaiterProfile;