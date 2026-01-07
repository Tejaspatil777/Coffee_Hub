/**
 * API Connection Test Component
 * Use this component to test if frontend is connected to backend
 * 
 * Usage: Import and render this component anywhere in your app
 * Example: <ApiConnectionTest />
 */

import React, { useState } from 'react';
import { authApi, menuApi, getCurrentUser } from '@/api';

export const ApiConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Testing connection to backend...');
    setDetails(null);

    try {
      // Test 1: Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      console.log('API URL:', apiUrl);

      // Test 2: Try to fetch menu items (public endpoint, no auth required)
      console.log('Fetching menu items...');
      const menuItems = await menuApi.getAllItems();
      
      // Test 3: Check authentication status
      const isAuthenticated = authApi.isAuthenticated();
      const currentUser = getCurrentUser();

      setStatus('success');
      setMessage('✅ Backend connection successful!');
      setDetails({
        apiUrl,
        menuItemsCount: menuItems.length,
        isAuthenticated,
        currentUser: currentUser ? {
          id: currentUser.id,
          name: currentUser.fullName,
          email: currentUser.email,
          role: currentUser.role,
        } : null,
      });

      console.log('Connection test passed:', {
        menuItemsCount: menuItems.length,
        isAuthenticated,
        currentUser,
      });

    } catch (error: any) {
      console.error('Connection test failed:', error);
      setStatus('error');
      setMessage('❌ Backend connection failed');
      setDetails({
        error: error.message || 'Unknown error',
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
        possibleReasons: [
          'Backend not running (run: cd backend && ./mvnw spring-boot:run)',
          'Wrong API URL in .env file',
          'CORS not configured in backend',
          'Database not running',
        ],
      });
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '20px auto',
      fontFamily: 'monospace',
    }}>
      <h2 style={{ marginTop: 0 }}>🔌 API Connection Test</h2>
      
      <button
        onClick={testConnection}
        disabled={status === 'testing'}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: status === 'testing' ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: status === 'testing' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'testing' ? 'Testing...' : 'Test Connection'}
      </button>

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: status === 'success' ? '#d4edda' : status === 'error' ? '#f8d7da' : '#fff3cd',
          border: `1px solid ${status === 'success' ? '#c3e6cb' : status === 'error' ? '#f5c6cb' : '#ffeeba'}`,
          borderRadius: '4px',
          color: status === 'success' ? '#155724' : status === 'error' ? '#721c24' : '#856404',
        }}>
          <strong>{message}</strong>
        </div>
      )}

      {details && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          <h3 style={{ marginTop: 0, fontSize: '16px' }}>Details:</h3>
          <pre style={{ 
            overflow: 'auto', 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '4px',
        fontSize: '12px',
      }}>
        <strong>ℹ️ How to fix connection issues:</strong>
        <ol style={{ marginBottom: 0, paddingLeft: '20px' }}>
          <li>Start backend: <code>cd backend && ./mvnw spring-boot:run</code></li>
          <li>Check .env file has: <code>VITE_API_URL=http://localhost:8080/api</code></li>
          <li>Ensure MySQL database is running</li>
          <li>Check backend logs in: <code>backend/logs/coffeehub.log</code></li>
          <li>Open browser DevTools → Network tab to see API calls</li>
        </ol>
      </div>
    </div>
  );
};

export default ApiConnectionTest;
