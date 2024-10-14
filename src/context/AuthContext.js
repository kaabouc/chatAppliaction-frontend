import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/authService'; // Adjust the import path if necessary

// Provide default implementations that throw errors
export const AuthContext = createContext({
  isAuthenticated: false,
  client: null,
  login: async () => {
    throw new Error("AuthContext: `login` method not implemented.");
  },
  register: async () => {
    throw new Error("AuthContext: `register` method not implemented.");
  },
  logout: () => {
    throw new Error("AuthContext: `logout` method not implemented.");
  },
});

export const AuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log("Checking stored credentials");
    const storedClient = AuthService.getUser();
    const token = localStorage.getItem('jwt_token');
    console.log("Stored Client:", storedClient, "Token:", token);
    if (storedClient && token) {
      setClient(storedClient);
      setIsAuthenticated(true);
      AuthService.setSession(token); // Set token in axiosInstance headers
    }
  }, []);
  

  const login = async (email, password) => {
    const data = await AuthService.login(email, password);
    setClient(data.client);
    setIsAuthenticated(true);
  };

  const register = async (clientname, email, password) => {
    const data = await AuthService.register(clientname, email, password);
    setClient(data.client);
    setIsAuthenticated(true);
  };

  const logout = () => {
    AuthService.logout();
    setClient(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        client,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
