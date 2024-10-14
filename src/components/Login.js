import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth from AuthContext

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
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label"><i className="bi bi-envelope"></i> Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label"><i className="bi bi-lock"></i> Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                    <div className="text-center mt-3">
                        <a href="/forgot-password">Forgot password?</a>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <span>Don't have an account?</span>
                    <Link to="/create-account" className="btn btn-outline-secondary ms-2">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
