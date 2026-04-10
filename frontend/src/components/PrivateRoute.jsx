import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * PrivateRoute — wraps protected pages.
 * Redirects to /login if no JWT token is found in localStorage.
 */
const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
