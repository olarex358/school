import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = () => {
    const { token } = useAuth();
    
    // If the user has a token, render the child routes (Outlet)
    // Otherwise, redirect them to the login page
    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;