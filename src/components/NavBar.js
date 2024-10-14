import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navStyle = {
  backgroundColor: '#282c34',
  padding: '10px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'white'
};

const linkStyle = {
  textDecoration: 'none',
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 10px',
  display: 'flex',
  alignItems: 'center',
};

const buttonStyle = {
  ...linkStyle,
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  display: 'inline-block',
};

const userIconStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  backgroundColor: '#f0f0f0',
  color: '#333',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '10px',
  fontSize: '14px',
};

function NavBar() {
  const { isAuthenticated, client, logout } = useAuth();

  useEffect(() => {
    console.log("Authentication Status:", isAuthenticated);
    console.log("Logged Client Data:", client);
  }, [isAuthenticated, client]);

  return (
    <nav style={navStyle}>
      {isAuthenticated ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={userIconStyle}>
              {client?.clientname[0]} {/* Displaying the first letter of the client name */}
            </div>
            <span style={{ marginRight: '20px' }}>{client?.clientname}</span>
            <Link to="/chat" style={linkStyle}>Chat</Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>
          </div>
          <button onClick={logout} style={buttonStyle}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/" style={linkStyle}>Login</Link>
          <Link to="/create-account" style={linkStyle}>Create Account</Link>
          <Link to="/forgot-password" style={linkStyle}>Forgot Password</Link>
          <Link to="/update-password" style={linkStyle}>Update Password</Link>
        </>
      )}
    </nav>
  );
}

export default NavBar;
