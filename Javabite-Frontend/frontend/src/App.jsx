import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Auth Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StaffSelection from "./pages/StaffSelection";

// Staff Invite Registration
import StaffInviteRegister from "./pages/StaffInviteRegister"; // NEW IMPORT

// Customer Dashboard Layout
import Navbar from "./components/Navbarcustomer";
import Sidebar from "./components/Sidebar";
import DashboardHome from "./components/DashboardHome";
import BookingPage from "./pages/BookingPage";
import OrderPage from "./pages/OrderPage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import Cart from "./pages/Cart";
import BookingHistory from "./pages/BookingHistory";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminSidebar from "./components/admin/AdminSidebar";
import AdminNavbar from "./components/admin/AdminNavbar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminMenu from "./pages/admin/AdminMenu";

// Chef Pages
import ChefProtectedRoute from "./chef/components/ChefProtectedRoute";
import ChefLogin from "./chef/pages/ChefLogin";
import ChefSidebar from "./chef/components/ChefSidebar";
import ChefNavbar from "./chef/components/ChefNavbar";
import ChefDashboard from "./chef/pages/ChefDashboard";
import AssignedOrders from "./chef/pages/AssignedOrders";
import OrderHistory from "./chef/pages/OrderHistory";
import ChefProfile from "./chef/pages/ChefProfile";

// Waiter Pages
import WaiterProtectedRoute from "./waiter/components/WaiterProtectedRoute";
import WaiterLogin from "./waiter/pages/WaiterLogin";
import WaiterSidebar from "./waiter/components/WaiterSidebar";
import WaiterNavbar from "./waiter/components/WaiterNavbar";
import WaiterDashboard from "./waiter/pages/WaiterDashboard";
import ReadyOrders from "./waiter/pages/ReadyOrders";
import CompletedOrders from "./waiter/pages/CompletedOrders";
import Notifications from "./waiter/pages/Notifications";
import WaiterProfile from "./waiter/pages/WaiterProfile";

// Theme Provider
import { ThemeProvider } from "./contexts/ThemeContext";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DashboardLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardHome onNavigate={setActivePage} />;
      case "booking":
        return <BookingPage />;
      case "order":
        return <OrderPage onNavigate={setActivePage} />;
      case "orders":
        return <OrdersPage />;
      case "cart":
        return <Cart onNavigate={setActivePage} />;
      case "booking-history":
        return <BookingHistory />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardHome onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar onNavigate={setActivePage} />

      <div className="flex">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Admin Layout Component
function AdminLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <AdminDashboard />;
      case "orders":
        return <AdminOrders />;
      case "staff":
        return <AdminStaff />;
      case "menu":
        return <AdminMenu />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <AdminNavbar />

      <div className="flex">
        <AdminSidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Chef Layout Component
function ChefLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <ChefDashboard />;
      case "orders":
        return <AssignedOrders />;
      case "history":
        return <OrderHistory />;
      case "profile":
        return <ChefProfile />;
      default:
        return <ChefDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ChefNavbar />

      <div className="flex">
        <ChefSidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Waiter Layout Component
function WaiterLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <WaiterDashboard />;
      case "ready":
        return <ReadyOrders />;
      case "completed":
        return <CompletedOrders />;
      case "notifications":
        return <Notifications />;
      case "profile":
        return <WaiterProfile />;
      default:
        return <WaiterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <WaiterNavbar />

      <div className="flex">
        <WaiterSidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/staff" element={<StaffSelection />} />
          
          {/* NEW: Staff Invite Registration Route */}
          <Route path="/staff/register" element={<StaffInviteRegister />} />

          {/* Customer Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          {/* Admin Panel */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          />

          {/* Chef Portal */}
          <Route path="/chef/login" element={<ChefLogin />} />
          <Route
            path="/chef/dashboard"
            element={
              <ChefProtectedRoute>
                <ChefLayout />
              </ChefProtectedRoute>
            }
          />

          {/* Waiter Portal */}
          <Route path="/waiter/login" element={<WaiterLogin />} />
          <Route
            path="/waiter/dashboard"
            element={
              <WaiterProtectedRoute>
                <WaiterLayout />
              </WaiterProtectedRoute>
            }
          />

          {/* Catch-all route for invalid invite tokens */}
          <Route path="/invite/*" element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;