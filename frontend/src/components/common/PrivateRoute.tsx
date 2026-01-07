import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: string[];
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-2xl shadow-lg">
              <span className="text-5xl">☕</span>
            </div>
          </div>
          <p className="mt-4 text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('PrivateRoute: Checking access', { isAuthenticated, user, roles });

  if (!isAuthenticated) {
    console.log('PrivateRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    console.log('PrivateRoute: User does not have required role, redirecting to home', { userRole: user.role, requiredRoles: roles });
    return <Navigate to="/" replace />;
  }

  console.log('PrivateRoute: Access granted');
  return <>{children}</>;
}