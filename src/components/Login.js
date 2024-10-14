import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();  // Create a navigate instance

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/client/auth/login', { // Adjust URL as needed
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },  
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login successful:', data);
                localStorage.setItem('token', data.token); // Assuming the backend sends a token

                // Redirect to the Chat page
                navigate('/chat'); // Use the navigate function to redirect
            } else {
                console.error('Login failed:', data.message);
                alert(data.message); // Show an alert or notification for login failure
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred while logging in.');
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
