import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // Check if the user is authenticated
    const isAuthenticated = localStorage.getItem('token'); // Assuming you store a token in localStorage

    // If not authenticated, redirect to login
    return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
