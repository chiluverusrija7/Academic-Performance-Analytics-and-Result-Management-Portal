import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to user's proper home dashboard
    if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
