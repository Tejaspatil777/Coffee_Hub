import { Navigate } from 'react-router-dom';

const ChefProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Debug log
  console.log('🛡️ ChefProtectedRoute Check:');
  console.log('Token exists:', !!token);
  console.log('User role:', user.role);
  
  if (!token || user.role !== 'chef') {
    console.log('❌ Not authorized as chef');
    return <Navigate to="/chef/login" />;
  }
  
  return children;
};

export default ChefProtectedRoute;