import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, handleApiError } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Clean the token by removing quotes if present
        const cleanToken = token.replace(/"/g, '');
        if (cleanToken && cleanToken !== 'undefined' && cleanToken !== 'null') {
          const response = await authAPI.getProfile();
          const userData = response.data.user;
          setUser(userData);
          setIsAuthenticated(true);

          // Debug: Log user data
          console.log('User data loaded:', userData);
          // Don't call isAdmin() here as user might not be set yet

          return userData;
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.signin(credentials);

      // Debug: Log the full response to understand the structure
      console.log('Login API response:', response);
      console.log('Response data:', response.data);

      // Handle different possible response structures
      let token, userData;

      if (response.data.token && response.data.user) {
        // Expected structure: { token, user: userData }
        token = response.data.token;
        userData = response.data.user;
      } else if (response.data.token) {
        // Structure: { token } - user data might be in token or separate call needed
        token = response.data.token;
        userData = {
          email: credentials.email,
          role: 'user' // Default role, will be updated when profile loads
        };
      } else {
        throw new Error('Invalid response structure from login API');
      }

      if (token && userData) {
        // Store token and user data
        localStorage.setItem('token', token.replace(/"/g, ''));
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);

        // Debug: Log login data
        console.log('Login successful:', userData);
        console.log('User role:', userData?.role);
        console.log('Is admin?', isAdmin());

        return { success: true, user: userData };
      }
    } catch (error) {
      console.error('Login error:', error);
      handleApiError(error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      return { success: true, data: response.data };
    } catch (error) {
      handleApiError(error);
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  const verifyOTP = async (otpData) => {
    try {
      const response = await authAPI.verifyOTP(otpData);
      const { token, user: userData } = response.data;

      if (token) {
        // Store token without quotes
        localStorage.setItem('token', token.replace(/"/g, ''));
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      }
    } catch (error) {
      handleApiError(error);
      return { success: false, error: error.response?.data?.message || 'OTP verification failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    if (!user) return false;
    const adminStatus = user.role === 'admin' || user.email === 'owner@admin.com';
    console.log('isAdmin check:', { userRole: user.role, userEmail: user.email, adminStatus });
    return adminStatus;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    verifyOTP,
    logout,
    isAdmin,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
