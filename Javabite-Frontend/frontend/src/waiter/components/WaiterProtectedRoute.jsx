import { Navigate } from 'react-router-dom';

const WaiterProtectedRoute = ({ children }) => {
  // Check multiple possible auth states
  const token = localStorage.getItem('token');
  const waiterAuth = localStorage.getItem('waiterAuth');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('🛡️ WaiterProtectedRoute check:');
  console.log('Token:', token);
  console.log('WaiterAuth:', waiterAuth);
  console.log('User:', user);
  
  // Allow if any waiter auth exists
  if (!token && !waiterAuth) {
    console.log('❌ No auth found, redirecting to login');
    return <Navigate to="/waiter/login" />;
  }
  
  return children;
};

export default WaiterProtectedRoute;