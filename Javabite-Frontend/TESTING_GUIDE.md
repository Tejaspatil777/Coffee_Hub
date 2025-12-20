# 🧪 Admin Panel Testing Guide

## Quick Test Setup

Since the backend API is already set up, you can test the admin panel with a simple approach:

### Option 1: Using Browser Console (Quick Demo)

1. **Open the app** at `http://localhost:3000`

2. **Open browser console** (F12 or right-click > Inspect > Console)

3. **Set up mock admin login:**
```javascript
// Create a mock admin user
const adminUser = {
  name: "Admin User",
  email: "admin@coffeeshop.com",
  role: "ADMIN",
  token: "mock-admin-token-12345"
};

// Save to localStorage
localStorage.setItem("token", adminUser.token);
localStorage.setItem("user", JSON.stringify(adminUser));

// Navigate to admin panel
window.location.href = "/admin";
```

4. **You'll be redirected to the Admin Panel!**

### Option 2: Create Admin User via Backend API

If your backend is running, register an admin user:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@coffeeshop.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

Then login normally through the UI at `/login`.

## 🎯 Testing Checklist

### ✅ Admin Dashboard
- [ ] See 4 stat cards with animated appearance
- [ ] Check Total Revenue calculation
- [ ] Check Pending Orders count
- [ ] Check Completed Orders count
- [ ] Check Revenue Today
- [ ] View hour-wise revenue chart
- [ ] See latest 5 orders in table
- [ ] Verify smooth animations on page load

### ✅ Orders Management
- [ ] Click "Orders" in sidebar
- [ ] See all sample orders
- [ ] Click "Pending" filter - see only pending orders
- [ ] Click "Completed" filter - see only completed orders
- [ ] Click "All" filter - see all orders again
- [ ] For a pending order:
  - [ ] Click "Assign Chef" - enter name - see toast
  - [ ] Click "Assign Waiter" - enter name - see toast
  - [ ] Click "Complete" - order moves to completed
- [ ] Refresh page - verify data persists (localStorage)
- [ ] Hover over rows - see highlight animation

### ✅ Staff Management
- [ ] Click "Staff Management" in sidebar
- [ ] See separate sections for Chefs and Waiters
- [ ] View existing sample staff (Chef Mario, Waiter Tom)
- [ ] Click "Add Staff" button
  - [ ] Modal appears with smooth animation
  - [ ] Enter name: "Chef John"
  - [ ] Enter email: "john@coffeeshop.com"
  - [ ] Select role: "Chef"
  - [ ] Click "Add Staff Member"
  - [ ] See success toast
  - [ ] New chef appears in list
- [ ] Click "Send Invite" on a staff member
  - [ ] See toast: "Invitation sent to [email]! ✉️"
  - [ ] Button changes to show expiry date
- [ ] Click delete icon on a staff member
  - [ ] See confirmation dialog
  - [ ] Confirm - staff removed
  - [ ] See success toast
- [ ] Refresh page - verify data persists

### ✅ Menu Management
- [ ] Click "Menu" in sidebar
- [ ] See grid of sample menu items
- [ ] Each card shows emoji, name, description, price
- [ ] Click "Add Menu Item" button
  - [ ] Modal appears
  - [ ] Enter name: "Mocha"
  - [ ] Enter description: "Chocolate coffee blend"
  - [ ] Enter price: "5.50"
  - [ ] Select category: "Coffee"
  - [ ] Check "Available for order"
  - [ ] Click "Add Item"
  - [ ] New item appears in grid
- [ ] Click availability toggle on an item
  - [ ] Status changes to Unavailable
  - [ ] Card becomes semi-transparent
  - [ ] See success toast
- [ ] Click "Edit" button on an item
  - [ ] Modal opens with pre-filled data
  - [ ] Change price to "4.99"
  - [ ] Click "Update Item"
  - [ ] Price updates in card
- [ ] Click "Delete" button
  - [ ] See confirmation dialog
  - [ ] Confirm - item removed
- [ ] Refresh page - verify changes persist

### ✅ Dark Mode
- [ ] Click moon icon in navbar
  - [ ] Theme changes to dark
  - [ ] All cards, backgrounds, text colors update
  - [ ] Smooth transition animation
- [ ] Click sun icon
  - [ ] Theme changes back to light
- [ ] Refresh page - theme preference persists
- [ ] Navigate between pages - theme stays consistent

### ✅ Navigation & Routing
- [ ] Click each sidebar item
  - [ ] Smooth page transition animation
  - [ ] Active item highlighted
  - [ ] Content updates correctly
- [ ] Click "Logout" button
  - [ ] Redirected to login page
  - [ ] Token removed from localStorage
- [ ] Try accessing `/admin` without login
  - [ ] Redirected to `/login`
- [ ] Login as customer (non-admin role)
  - [ ] Redirected to `/dashboard` (customer area)
  - [ ] Cannot access `/admin`

## 📸 Visual Testing

### Check These Elements:
1. **Colors**: Warm browns, creams, amber tones throughout
2. **Animations**: 
   - Card hover effects (lift on hover)
   - Button scale on click
   - Page transitions (fade + slide)
   - Stat cards animate on load with delay
   - Modal entrance/exit animations
3. **Responsiveness**: Test on different screen sizes
4. **Shadows**: Subtle shadows on cards and buttons
5. **Rounded Corners**: All cards and buttons have rounded corners
6. **Icons**: Lucide icons render correctly

## 🔍 Data Verification

### Check localStorage After Actions:
```javascript
// View all admin data
console.log("Orders:", JSON.parse(localStorage.getItem('adminOrders')));
console.log("Staff:", JSON.parse(localStorage.getItem('adminStaff')));
console.log("Menu:", JSON.parse(localStorage.getItem('adminMenu')));
console.log("Theme:", localStorage.getItem('theme'));
```

## 🎨 Dark Mode Testing

Test these components in both themes:
- [ ] Sidebar background
- [ ] Main content background
- [ ] Card backgrounds
- [ ] Text colors (primary, secondary, muted)
- [ ] Button hover states
- [ ] Input fields
- [ ] Modals
- [ ] Table rows
- [ ] Charts (Chart.js adapts to theme)

## 🐛 Edge Cases

Test these scenarios:
- [ ] Add staff with same email - should allow (mock data)
- [ ] Add menu item with price 0 - should work
- [ ] Delete all orders - table shows "No orders yet"
- [ ] Filter pending when no pending orders - shows appropriate message
- [ ] Toggle availability multiple times rapidly - works smoothly
- [ ] Open and close modals multiple times - no issues

## ✅ Customer Pages (Should Be Unchanged)

Quick verify customer area still works:
- [ ] Logout from admin
- [ ] Login as customer (or use mock customer token)
- [ ] Access `/dashboard`
- [ ] Customer sidebar shows correctly
- [ ] All customer features work (booking, orders, cart, etc.)
- [ ] Admin panel is NOT accessible

## 🚀 Performance Check

- [ ] Initial load time < 3 seconds
- [ ] Smooth 60fps animations
- [ ] No console errors
- [ ] Chart renders without lag
- [ ] Modals open/close smoothly

## 📝 Notes

- All data is stored in localStorage (mock data)
- No backend calls are made (ready for integration)
- Sample data is initialized on first load
- Data persists across refreshes
- Theme preference persists

---

**Happy Testing! ☕**
