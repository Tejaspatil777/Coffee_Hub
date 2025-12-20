# ☕ Coffee Shop Admin Panel - Implementation Guide

## 🎯 Overview

Successfully added a complete Admin Panel to your existing Coffee Shop frontend while keeping ALL customer features intact!

## ✨ What's New

### Admin Panel Features
- **Dashboard Overview** - Revenue stats, pending/completed orders count, hourly revenue chart, latest orders table
- **Orders Management** - Complete orders table with filters (all/pending/completed), assign chef/waiter, mark completed
- **Staff Management** - Add/delete staff (chefs & waiters), send invitation emails (mock), view expiry dates
- **Menu Management** - Full CRUD operations, toggle item availability, organized by categories

### Theme & Design
- ☕ Coffee shop theme with warm browns, creams, and cozy aesthetics
- 🌓 Dark/Light mode support with theme toggle
- ✨ Smooth Framer Motion animations throughout
- 📱 Responsive design with TailwindCSS
- 🎨 Modern cards, rounded corners, subtle shadows

## 🚀 How to Access

### Admin Login
1. Go to `/login`
2. Login with an admin account (role: 'ADMIN' or 'admin')
3. You'll be automatically redirected to `/admin`

### Customer Login  
1. Go to `/login`
2. Login with a customer account
3. You'll be redirected to `/dashboard` (existing customer dashboard)

## 📂 File Structure

```
/app/frontend/
├── src/
│   ├── contexts/
│   │   └── ThemeContext.jsx          # Dark/Light mode context
│   ├── components/
│   │   ├── AdminProtectedRoute.jsx   # Admin route protection
│   │   └── admin/
│   │       ├── AdminSidebar.jsx      # Admin navigation sidebar
│   │       └── AdminNavbar.jsx       # Admin top navbar with theme toggle
│   ├── pages/
│   │   └── admin/
│   │       ├── AdminDashboard.jsx    # Dashboard with stats & charts
│   │       ├── AdminOrders.jsx       # Orders management
│   │       ├── AdminStaff.jsx        # Staff management
│   │       └── AdminMenu.jsx         # Menu CRUD operations
│   └── App.jsx                        # Updated with admin routes
```

## 🔐 Authentication Flow

### Role-Based Routing
```javascript
// In Login.jsx - redirect based on role
if (data.role === 'ADMIN' || data.role === 'admin') {
  navigate('/admin');      // Admin Panel
} else {
  navigate('/dashboard');  // Customer Dashboard
}
```

### Protected Routes
- **AdminProtectedRoute** - Checks for token AND admin role
- **ProtectedRoute** - Checks for token only (customer routes)

## 💾 Data Storage

All admin data is stored in `localStorage` for persistence:

- `adminOrders` - Orders list
- `adminStaff` - Staff members (chefs & waiters)
- `adminMenu` - Menu items
- `theme` - User's theme preference (light/dark)
- `token` - JWT token
- `user` - User data (includes role)

## 🎨 Admin Panel Screens

### 1. Dashboard Overview
- 4 animated stat cards: Total Revenue, Pending Orders, Completed Orders, Revenue Today
- Hour-wise revenue graph using Chart.js
- Latest 5 orders table
- Real-time stats calculation from orders data

### 2. Orders Management
- Complete orders table with all details
- Filter tabs: All, Pending, Completed
- Action buttons for pending orders:
  - **Assign Chef** - Opens prompt to enter chef name
  - **Assign Waiter** - Opens prompt to enter waiter name
  - **Mark Completed** - Changes order status to completed
- Hover animations on rows
- Shows assigned staff for completed orders

### 3. Staff Management
- Separate sections for Chefs and Waiters
- Add Staff button opens modal with form:
  - Name (text input)
  - Email (email input)
  - Role (select: Chef/Waiter)
- Each staff card shows:
  - Name, email, role badge
  - **Send Invite** button (shows toast notification)
  - Invitation expiry date (7 days from send)
  - **Delete** button
- Animated card layouts

### 4. Menu Management
- Grid layout of menu items
- Each card shows:
  - Category emoji (☕ 🥐 🥪 🍰)
  - Item name, description, price
  - **Availability toggle** (Available/Unavailable)
  - **Edit** button - Opens modal with pre-filled form
  - **Delete** button - Confirms before deletion
- Add button opens modal with form:
  - Item Name (required)
  - Description
  - Price (required)
  - Category (Coffee, Pastry, Sandwich, Dessert)
  - Available checkbox

## 🌓 Dark Mode

Theme toggle in admin navbar:
- Click moon/sun icon to toggle
- Smooth transitions throughout
- Persists in localStorage
- Changes entire admin panel theme

## 🔧 Technical Implementation

### Dependencies Added
```json
{
  "chart.js": "^4.5.1",
  "react-chartjs-2": "^5.3.1"
}
```

### Key Features
- **ThemeContext** - Manages dark/light mode globally
- **Chart.js** - Revenue visualization
- **Framer Motion** - Smooth animations and transitions
- **localStorage** - Data persistence across refreshes
- **Toast notifications** - User feedback for all actions

## 📝 Sample Data

### Orders
```javascript
{
  id: '1001',
  customer: 'John Doe',
  items: 3,
  itemsList: ['Cappuccino', 'Croissant', 'Muffin'],
  total: 15.50,
  status: 'pending',
  time: new Date().toISOString(),
  chef: null,
  waiter: null,
}
```

### Staff
```javascript
{
  id: 'staff-1',
  name: 'Chef Mario',
  email: 'mario@coffeeshop.com',
  role: 'chef',
  inviteSent: true,
  inviteExpiry: '2025-12-01T00:00:00.000Z',
}
```

### Menu Items
```javascript
{
  id: 'menu-1',
  name: 'Cappuccino',
  description: 'Classic Italian coffee with steamed milk foam',
  price: 4.50,
  category: 'coffee',
  available: true,
}
```

## ✅ Customer Pages (Unchanged)

All existing customer features remain 100% intact:
- ✅ Home page
- ✅ Login & Register
- ✅ Customer Dashboard
- ✅ Table Booking
- ✅ Order Food
- ✅ My Orders
- ✅ Cart
- ✅ Booking History
- ✅ Settings

## 🎯 Testing the Admin Panel

### Create Sample Admin User
In your backend, create a user with role: 'ADMIN':
```javascript
{
  email: "admin@coffeeshop.com",
  password: "admin123",
  name: "Admin User",
  role: "ADMIN"
}
```

### Test Flow
1. Login with admin credentials
2. Verify redirect to `/admin`
3. Test Dashboard - see stats and charts
4. Test Orders - filter, assign chef/waiter, mark completed
5. Test Staff - add chef, add waiter, send invites, delete
6. Test Menu - add item, edit item, toggle availability, delete
7. Toggle dark mode - verify theme changes
8. Logout and login as customer - verify redirect to `/dashboard`

## 🚀 Ready for Backend Integration

All components are structured to easily integrate with real backend APIs:

```javascript
// Example: Replace localStorage with API calls
const fetchOrders = async () => {
  const response = await axios.get('/api/admin/orders');
  setOrders(response.data);
};
```

## 🎉 Summary

✅ Admin Panel fully implemented with all 4 screens
✅ Role-based authentication and routing
✅ Dark/Light mode support
✅ Smooth animations with Framer Motion
✅ Chart.js for revenue visualization
✅ Mock email invitations with toast
✅ localStorage for data persistence
✅ All customer pages remain intact
✅ Coffee shop theme throughout
✅ Ready for backend integration

---

**Built with:** React 18, Vite, TailwindCSS, Framer Motion, Chart.js, React Router, React Toastify
