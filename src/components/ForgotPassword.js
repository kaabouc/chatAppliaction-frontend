import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('http://localhost:5001/api/client/auth/forgot-password', { // Adjust URL as needed
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Reset link sent to:', email);
            alert('Reset link sent to your email!');
        } else {
            console.error('Error:', data.message);
            alert(data.message); // Show an alert for any error messages
        }
    } catch (error) {
        console.error('Error during password reset request:', error);
        alert('An error occurred while sending the reset link.');
    }
};

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-envelope"></i> Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="btn btn-warning w-100">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
