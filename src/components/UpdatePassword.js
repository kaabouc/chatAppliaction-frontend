import React, { useState } from 'react';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      console.log("Password updated:", password);
    } else {
      console.log("Passwords do not match");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Update Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-lock"></i> New Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="New password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-lock-fill"></i> Confirm Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Confirm password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
