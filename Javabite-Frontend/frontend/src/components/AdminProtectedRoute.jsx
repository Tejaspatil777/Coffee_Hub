import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    toast.error('Please login to access admin panel');
    return <Navigate to="/login" />;
  }

  if (user.role !== 'ADMIN' && user.role !== 'admin') {
    toast.error('Admin access required');
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminProtectedRoute;