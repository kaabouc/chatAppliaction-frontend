import React, { useState } from 'react';
import AuthService from '../services/authService'; // Ensure the path is correct

const CreateAccount = () => {
  const [clientname, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, client } = await AuthService.register(clientname, email, password);
      console.log('Account created successfully:', token, client);
      // Optionally redirect the user or do other follow-up actions
    } catch (error) {
      console.error('Error:', error.message);
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
              value={clientname} 
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
