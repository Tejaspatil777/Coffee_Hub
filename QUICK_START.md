# 🚀 Quick Start Guide

## React Frontend + Spring Boot Backend Integration

### Prerequisites
- Node.js 18+ and npm/yarn
- Java 17+
- MySQL database running
- Git

---

## 🏃‍♂️ Running the Application

### 1. Start Backend (Spring Boot)

```bash
# Navigate to backend folder
cd backend

# Run Spring Boot application
./mvnw spring-boot:run
# or on Windows: mvnw.cmd spring-boot:run
```

Backend will start on: **http://localhost:8080**

Check health: http://localhost:8080/api

### 2. Start Frontend (React)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will start on: **http://localhost:3000**

---

## 🔧 Configuration

### Backend Configuration

File: `backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/coffeehub
    username: root
    password: your_password

server:
  port: 8080
  servlet:
    context-path: /api
```

### Frontend Configuration

Create: `frontend/.env`

```env
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

---

## 📦 API Usage in Components

### Import APIs

```typescript
import { authApi, menuApi, orderApi } from '@/api';
```

### Example: Login Component

```typescript
import React, { useState } from 'react';
import { authApi } from '@/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email, password });
      console.log('Logged in:', response.user);
      // Redirect to dashboard or home
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### Example: Fetch Menu Items

```typescript
import React, { useState, useEffect } from 'react';
import { menuApi, MenuItemResponse } from '@/api';

export const MenuList = () => {
  const [items, setItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await menuApi.getAllItems();
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading) return <div>Loading menu...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <p>${item.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example: Create Order

```typescript
import React, { useState } from 'react';
import { orderApi, cartApi, OrderType } from '@/api';

export const Checkout = () => {
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Get current user
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('Please login first');
      const user = JSON.parse(userStr);

      // Get cart items
      const cart = await cartApi.getCart(user.id);

      // Create order
      const order = await orderApi.createOrder(
        {
          orderType: OrderType.DINE_IN,
          items: cart.items.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            modifierIds: item.modifiers.map((m) => m.id),
          })),
        },
        user.id
      );

      alert(`Order placed! Order number: ${order.orderNumber}`);

      // Clear cart
      await cartApi.clearCart(user.id);
    } catch (err: any) {
      alert('Order failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePlaceOrder} disabled={loading}>
      {loading ? 'Processing...' : 'Place Order'}
    </button>
  );
};
```

---

## 🔐 Authentication Flow

1. **Login**: `authApi.login()` → Token stored in localStorage
2. **Auto-attach token**: Axios interceptor adds `Authorization: Bearer {token}` to all requests
3. **Token refresh**: Call `authApi.refreshToken()` when token expires
4. **Logout**: `authApi.logout()` → Clear localStorage

---

## 🐛 Debugging

### Check API Calls
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Click on any request to see:
   - Request headers (should have `Authorization: Bearer ...`)
   - Response body (data from backend)

### Common Issues

**❌ Error: Network Error**
- Backend not running
- Wrong API URL in .env
- CORS not configured

**❌ Error: 401 Unauthorized**
- Token expired or invalid
- User not logged in
- Call `authApi.refreshToken()`

**❌ Error: 404 Not Found**
- Wrong endpoint URL
- Resource doesn't exist
- Check API_INTEGRATION.md for correct endpoints

---

## 📚 Available APIs

| API | Import | Purpose |
|-----|--------|---------|
| `authApi` | `import { authApi } from '@/api'` | Login, register, logout |
| `menuApi` | `import { menuApi } from '@/api'` | Menu items, categories |
| `orderApi` | `import { orderApi } from '@/api'` | Create/manage orders |
| `cartApi` | `import { cartApi } from '@/api'` | Shopping cart |
| `paymentApi` | `import { paymentApi } from '@/api'` | Stripe payments |
| `adminApi` | `import { adminApi } from '@/api'` | Admin operations |
| `tableApi` | `import { tableApi } from '@/api'` | Table management |
| `invitationApi` | `import { invitationApi } from '@/api'` | Staff invitations |

See full documentation: [API_INTEGRATION.md](./API_INTEGRATION.md)

---

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login successfully
- [ ] Token is stored in localStorage
- [ ] API calls show in Network tab
- [ ] Menu items load correctly
- [ ] Can add items to cart
- [ ] Can create order
- [ ] Error messages display properly
- [ ] Loading states work

---

## 🆘 Need Help?

1. Check browser console for errors
2. Check Network tab for failed requests
3. Check backend logs: `backend/logs/coffeehub.log`
4. Read full documentation: [API_INTEGRATION.md](./API_INTEGRATION.md)

---

**Happy Coding! 🚀**
