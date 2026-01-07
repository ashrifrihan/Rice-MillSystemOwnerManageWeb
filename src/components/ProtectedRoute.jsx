// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, userProfile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Mill Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Preparing your rice mill management system</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/owner/login" replace />;
  }

  // Check if user is an owner
  if (userProfile?.role !== 'owner') {
    return <Navigate to="/owner/login" replace />;
  }

  return children;
};

export const OwnerProtectedRoute = ({ children }) => {
  return <ProtectedRoute requiredRole="owner">{children}</ProtectedRoute>;
};

export default ProtectedRoute;