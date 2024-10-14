import React, { useState } from 'react';

const CreateAccount = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/client/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          clientname: name, 
          email, 
          password 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Account created successfully:', data.message);
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error connecting to the server:', error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-person"></i> Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Enter name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>
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
          <button type="submit" className="btn btn-success w-100">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
