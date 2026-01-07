import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createOrUpdateSession, removeCustomerSession } from '../services/customerSessionService';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'CHEF' | 'WAITER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount - updated to use 'authToken' and 'userData'
    const authToken = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');
    
    console.log('AuthProvider: Checking authentication...', { authToken: !!authToken, userData: !!storedUserData });
    
    if (authToken && storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        console.log('AuthProvider: User authenticated from localStorage', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthProvider: Invalid stored data, clearing...', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } else {
      console.log('AuthProvider: No stored authentication found');
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - Replace with actual API call to your Java backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on email
    let role: 'CUSTOMER' | 'CHEF' | 'WAITER' | 'ADMIN' = 'CUSTOMER';
    if (email.includes('chef')) role = 'CHEF';
    else if (email.includes('waiter')) role = 'WAITER';
    else if (email.includes('admin')) role = 'ADMIN';
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role
    };
    
    console.log('AuthProvider: Logging in user', mockUser);
    
    setUser(mockUser);
    // Updated localStorage keys to 'authToken' and 'userData'
    localStorage.setItem('userData', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
    
    // Create customer session if role is CUSTOMER
    if (mockUser.role === 'CUSTOMER') {
      createOrUpdateSession(mockUser.id, mockUser.name, mockUser.email, 'BROWSING');
      console.log('AuthProvider: Customer session created');
    }
    
    console.log('AuthProvider: Login successful, data stored in localStorage');
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, role: string = 'CUSTOMER') => {
    // Mock registration - Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fullName = `${firstName} ${lastName}`;
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: fullName,
      email,
      role: role as 'CUSTOMER' | 'CHEF' | 'WAITER' | 'ADMIN'
    };
    
    console.log('AuthProvider: Registering user', mockUser);
    
    setUser(mockUser);
    // Updated localStorage keys to 'authToken' and 'userData'
    localStorage.setItem('userData', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
    
    // Create customer session if role is CUSTOMER
    if (mockUser.role === 'CUSTOMER') {
      createOrUpdateSession(mockUser.id, mockUser.name, mockUser.email, 'BROWSING');
      console.log('AuthProvider: Customer session created');
    }
    
    console.log('AuthProvider: Registration successful, data stored in localStorage');
  };

  const logout = () => {
    console.log('AuthProvider: Logging out user');
    
    // Remove customer session if exists
    if (user?.role === 'CUSTOMER') {
      removeCustomerSession(user.id);
    }
    
    setUser(null);
    // Clear all auth-related data
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('cart');
    localStorage.removeItem('selectedLocation');
    
    console.log('AuthProvider: Logout successful, localStorage cleared');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}