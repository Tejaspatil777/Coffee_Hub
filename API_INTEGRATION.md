# React + Spring Boot API Integration

## Overview

This document describes the complete API integration between the React frontend and Java Spring Boot backend for the Coffee Hub application.

## 🏗️ Architecture

### Backend (Spring Boot)
- **Base URL**: `http://localhost:8080/api`
- **Port**: 8080
- **Response Format**: All endpoints return `ApiResponse<T>` wrapper
  ```json
  {
    "success": boolean,
    "message": string,
    "data": T,
    "timestamp": string,
    "error": string | null
  }
  ```

### Frontend (React + TypeScript)
- **Port**: 3000 (Vite dev server)
- **HTTP Client**: Axios with interceptors
- **State Management**: React hooks (useState, useEffect)
- **Authentication**: JWT tokens stored in localStorage

## 📁 Project Structure

```
frontend/src/
├── api/
│   ├── axiosClient.ts       # Axios configuration with interceptors
│   ├── types.ts             # TypeScript interfaces matching backend DTOs
│   ├── authApi.ts           # Authentication endpoints
│   ├── menuApi.ts           # Menu management endpoints
│   ├── orderApi.ts          # Order management endpoints
│   ├── cartApi.ts           # Shopping cart endpoints
│   ├── paymentApi.ts        # Stripe payment endpoints
│   ├── adminApi.ts          # Admin operations endpoints
│   ├── tableApi.ts          # Table management endpoints
│   ├── invitationApi.ts     # Staff invitation endpoints
│   ├── bookingApi.ts        # Booking endpoints (if backend exists)
│   ├── locationApi.ts       # Location endpoints (if backend exists)
│   ├── recommendationApi.ts # Recommendation endpoints (if backend exists)
│   └── index.ts             # Central export for all APIs
```

## 🔐 Authentication Flow

### 1. Login
```typescript
import { authApi } from '@/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authApi.login({ email, password });
    // Token automatically stored in localStorage
    console.log('User:', response.user);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### 2. Token Management
- **Access Token**: Stored in `localStorage.getItem('token')`
- **Refresh Token**: Stored in `localStorage.getItem('refreshToken')`
- **Auto-attachment**: Axios interceptor automatically adds `Authorization: Bearer {token}` to all requests
- **Auto-refresh**: Call `authApi.refreshToken()` when token expires

### 3. Logout
```typescript
await authApi.logout();
// Tokens automatically cleared from localStorage
```

## 📡 API Usage Examples

### Menu Management

```typescript
import { menuApi } from '@/api';

// Get all menu items
const items = await menuApi.getAllItems();

// Search menu items
const searchResults = await menuApi.searchItems('coffee', 1, 0, 100);

// Get items by category
const categoryItems = await menuApi.getItemsByCategory(1);
```

### Order Management

```typescript
import { orderApi, OrderType } from '@/api';

// Create order
const order = await orderApi.createOrder({
  orderType: OrderType.DINE_IN,
  tableId: 5,
  items: [
    { menuItemId: 1, quantity: 2, modifierIds: [3, 4] }
  ],
  specialInstructions: 'No sugar'
}, userId);

// Get user's orders
const myOrders = await orderApi.getMyOrders();

// Update order status (Chef/Waiter)
await orderApi.updateOrderStatus(orderId, OrderStatus.PREPARING, chefId);
```

### Cart Operations

```typescript
import { cartApi } from '@/api';

// Get cart
const cart = await cartApi.getCart(userId);

// Add item to cart
const updatedCart = await cartApi.addItem(
  { menuItemId: 1, quantity: 2 },
  userId
);

// Merge guest cart with user cart after login
await cartApi.mergeCarts(sessionToken, userId);
```

### Payment (Stripe)

```typescript
import { paymentApi } from '@/api';
import { loadStripe } from '@stripe/stripe-js';

// Create payment intent
const paymentIntent = await paymentApi.createPaymentIntent({
  orderId: 'ORDER123',
  amount: 2500, // in cents
  currency: 'usd'
});

// Use Stripe SDK to confirm payment
const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
const result = await stripe.confirmCardPayment(paymentIntent.client_secret);
```

### Admin Operations

```typescript
import { adminApi, UserRole } from '@/api';

// Get dashboard summary
const summary = await adminApi.getDashboardSummary();

// Invite staff member
const invitation = await adminApi.inviteStaff({
  email: 'chef@example.com',
  role: UserRole.CHEF,
  message: 'Welcome to our team!'
});

// Get all customers
const customers = await adminApi.getCustomers();
```

### Table Management

```typescript
import { tableApi, TableStatus } from '@/api';

// Get available tables
const availableTables = await tableApi.getAvailableTables();

// Update table status
await tableApi.updateTableStatus(tableId, TableStatus.OCCUPIED);

// Generate QR code
const qrData = await tableApi.generateTableQR(tableId);
```

## 🔄 React Component Integration

### Example: Menu Component

```typescript
import React, { useState, useEffect } from 'react';
import { menuApi, MenuItemResponse } from '@/api';

export const Menu: React.FC = () => {
  const [items, setItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const data = await menuApi.getAllItems();
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <p>${item.price}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example: Order Creation

```typescript
import React, { useState } from 'react';
import { orderApi, cartApi, OrderType } from '@/api';

export const Checkout: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const cart = await cartApi.getCart(user.id);

      const order = await orderApi.createOrder({
        orderType: OrderType.DINE_IN,
        items: cart.items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          modifierIds: item.modifiers.map(m => m.id)
        }))
      }, user.id);

      // Clear cart after successful order
      await cartApi.clearCart(user.id);
      
      console.log('Order created:', order.orderNumber);
    } catch (error: any) {
      console.error('Checkout failed:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Processing...' : 'Place Order'}
    </button>
  );
};
```

## 🛠️ Error Handling

### Axios Interceptor Handles:
- **401 Unauthorized**: Auto-logout and redirect to login
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Server Error**: Internal server error

### Component Level:
```typescript
try {
  const data = await menuApi.getAllItems();
  setItems(data);
} catch (error: any) {
  // Error message already extracted by axios interceptor
  toast.error(error.message);
}
```

## 🔧 Environment Setup

### 1. Create `.env` file in frontend folder:
```env
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### 2. Start Backend (Spring Boot):
```bash
cd backend
./mvnw spring-boot:run
```
Backend runs on: http://localhost:8080

### 3. Start Frontend (React):
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

## 📊 API Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-01-07T10:30:00",
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "message": null,
  "data": null,
  "timestamp": "2026-01-07T10:30:00",
  "error": "Error message here"
}
```

### Axios Interceptor Extracts:
- Returns only `response.data.data` on success
- Throws error with `response.data.error` message on failure

## 🔍 TypeScript Type Safety

All DTOs match backend Java classes:

```typescript
interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  // ... matches Java User entity
}

interface OrderResponse {
  id: string;
  orderNumber: string;
  user: UserResponse;
  items: OrderItemResponse[];
  status: OrderStatus;
  // ... matches Java Order entity
}
```

## 🚀 Best Practices

1. **Always use try-catch** for API calls
2. **Show loading states** during async operations
3. **Display user-friendly error messages** using toast/alerts
4. **Validate data** before sending to API
5. **Use TypeScript types** for compile-time safety
6. **Implement optimistic updates** for better UX
7. **Cache data** when appropriate to reduce API calls
8. **Handle token expiration** gracefully

## 📝 Available Endpoints

### Authentication
- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- POST `/auth/refresh` - Refresh access token
- POST `/auth/logout` - Logout user
- GET `/auth/validate-invitation` - Validate staff invitation
- POST `/auth/accept-invitation` - Accept staff invitation

### Menu
- GET `/menu/categories` - Get all categories
- GET `/menu/items` - Get all menu items
- GET `/menu/items/{id}` - Get menu item by ID
- GET `/menu/items/category/{categoryId}` - Get items by category
- GET `/menu/items/search` - Search menu items
- GET `/menu/modifiers` - Get all modifiers

### Orders
- POST `/orders` - Create order
- GET `/orders/{orderId}` - Get order by ID
- GET `/orders/user/{userId}` - Get user's orders
- GET `/orders/kitchen/active` - Get active kitchen orders
- PUT `/orders/{orderId}/status` - Update order status
- PUT `/orders/{orderId}/assign/chef` - Assign to chef
- PUT `/orders/{orderId}/assign/waiter` - Assign to waiter

### Cart
- GET `/cart` - Get cart
- POST `/cart/items` - Add item to cart
- PUT `/cart/items/{itemId}` - Update cart item
- DELETE `/cart/items/{itemId}` - Remove item from cart
- DELETE `/cart` - Clear cart
- POST `/cart/merge` - Merge guest cart with user cart

### Payments
- POST `/payments/create-intent` - Create Stripe payment intent
- POST `/payments/confirm` - Confirm payment

### Admin
- GET `/admin/dashboard/summary` - Get dashboard statistics
- GET `/admin/users` - Get all users
- GET `/admin/customers` - Get all customers
- POST `/admin/invite-staff` - Invite staff member
- POST `/admin/menu/import` - Import menu items

### Tables
- GET `/tables` - Get all tables
- GET `/tables/available` - Get available tables
- GET `/tables/{id}` - Get table by ID
- PUT `/tables/{id}/status` - Update table status
- POST `/tables/{id}/qr` - Generate QR code

### Invitations
- POST `/invitations/send` - Send staff invitation
- GET `/invitations/validate/{token}` - Validate token
- POST `/invitations/accept` - Accept invitation
- GET `/invitations/pending` - Get pending invitations

## 🎯 Next Steps

1. ✅ Backend APIs are ready and documented
2. ✅ Frontend API layer is complete with TypeScript types
3. ⏭️ Update React components to use new API methods
4. ⏭️ Test all API integrations end-to-end
5. ⏭️ Add loading states and error handling in UI
6. ⏭️ Implement token refresh logic
7. ⏭️ Add request/response logging for debugging

## 💡 Tips

- Use `import { authApi, menuApi, orderApi } from '@/api'` for clean imports
- Check browser DevTools Network tab to debug API calls
- Backend logs are in `backend/logs/coffeehub.log`
- All API calls are typed - leverage TypeScript autocomplete!

---

**Status**: ✅ API Integration Complete
**Last Updated**: January 7, 2026
