import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth from AuthContext
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Get the login function from AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password); // Use the AuthContext's login function
      console.log('Login successful');
      navigate('/chat'); // Redirect after successful login
    } catch (error) {
      console.error('Login failed:', error.message);
      alert(error.message); // Show an alert or notification for login failure
    }
  };

    return (
        <div className="login-container " >
      <div className="login-image">
        <img
          src="chat.jpg"
          alt="Login"
        />
      </div>
      <div className="login-form-container">
        <div className="login-card">
          <h2 className="text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
            <div className="text-center mt-3">
              <a href="/forgot-password">Forgot password?</a>
            </div>
          </form>
          <div className="text-center mt-4">
            <span>Don't have an account?</span>
            <Link to="/create-account" className="create-account-btn">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
    );
};

export default Login;
