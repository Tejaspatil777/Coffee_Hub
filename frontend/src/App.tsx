import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PrivateRoute } from './components/common/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Booking from './pages/Booking';
import Cart from './pages/Cart';
import OrderTracking from './pages/OrderTracking';
import Locations from './pages/Locations';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ChefDashboard from './pages/dashboards/ChefDashboard';
import WaiterDashboard from './pages/dashboards/WaiterDashboard';
import CustomerManagement from './pages/CustomerManagement';
import StaffInvite from './pages/StaffInvite';
import { Toaster } from 'sonner@2.0.3';
import { useEffect } from 'react';
import { initializeDefaultData } from './utils/initializeData';

function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/staff-invite';
  const hideFooter = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/staff-invite';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!hideHeader && <Header />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/locations" element={<Locations />} />
          
          <Route path="/booking" element={
            <PrivateRoute>
              <Booking />
            </PrivateRoute>
          } />
          
          <Route path="/cart" element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          } />
          
          <Route path="/orders" element={
            <PrivateRoute>
              <OrderTracking />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/my-bookings" element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin/customers" element={
            <PrivateRoute roles={['ADMIN']}>
              <CustomerManagement />
            </PrivateRoute>
          } />
          
          <Route path="/admin/customers/:customerId" element={
            <PrivateRoute roles={['ADMIN']}>
              <CustomerManagement />
            </PrivateRoute>
          } />
          
          <Route path="/admin/staff-invite" element={
            <PrivateRoute roles={['ADMIN']}>
              <StaffInvite />
            </PrivateRoute>
          } />
          
          <Route path="/chef-dashboard" element={
            <PrivateRoute roles={['CHEF', 'ADMIN']}>
              <ChefDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/waiter-dashboard" element={
            <PrivateRoute roles={['WAITER', 'ADMIN']}>
              <WaiterDashboard />
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initializeDefaultData();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}