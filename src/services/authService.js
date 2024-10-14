import axios from 'axios';
import BASE_URL from '../config';
import localStorageService from './localStorageService';
import axiosInstance from './axiosInstance';

class AuthServiceClass {
  async register(clientname, email, password) {
    try {
      const response = await axios.post(`${BASE_URL}/api/client/auth/register`, { clientname, email, password });
      const { token, client } = response.data;

      this.setSession(token);
      this.setUser(client);
      console.log(client); 
      return { token, client };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error registering');
    }
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${BASE_URL}/api/client/auth/login`, { email, password });
      const { token, client, message } = response.data;

      this.setSession(token); // Store token in local storage and axios headers
      this.setUser(client); // Store user data in local storage

      return { token, client, message };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error logging in');
    }
  }
  setSession(token) {
    if (token) {
      localStorageService.setItem('jwt_token', token);  // Use localStorageService here
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorageService.removeItem('jwt_token');  // Ensure we remove the token if logging out
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  setUser(client) {
    localStorageService.setItem('auth_client', client);  // Correctly serialize and store the client
  }

  getUser() {
    return localStorageService.getItem('auth_client');  // Deserialize and return the client
  }

  logout() {
    this.setSession(null);
    this.removeUser();
  }

  removeUser() {
    localStorageService.removeItem('auth_client');
  }

  async forgotPassword(email) {
    try {
      const response = await axios.post(`${BASE_URL}/api/client/auth/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error requesting password reset');
    }
  }

  async resetPassword(clientId, token, password) {
    try {
      const response = await axios.post(`${BASE_URL}/api/client/auth/reset-password`, {
        clientId,
        token,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error resetting password');
    }
  }



  
}

const AuthService = new AuthServiceClass();
export default AuthService;
