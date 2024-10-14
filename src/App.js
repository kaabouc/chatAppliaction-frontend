import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import PrivateRoute from './PrivateRoute';
import Chat from './components/Chat';
import Profile from './components/Profile';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <AuthProvider> 
        <div>
          <NavBar />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/chat" element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
