import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute component that handles authentication and authorization
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 * @param {string} redirectTo - Where to redirect if not authenticated (default: '/auth')
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/auth'
}) => {
  const { isAuthenticated, isLoading, isSessionValid } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verify session is still valid
  if (requireAuth && !isSessionValid()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
