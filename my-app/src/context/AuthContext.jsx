import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
  const [initialized, setInitialized] = useState(false);
  const mounted = useRef(true);
  const initializedRef = useRef(false);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (mounted.current) {
        const userData = {
          ...response.data,
          token
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User data fetched successfully:', userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (mounted.current) {
        setUser(null);
        localStorage.removeItem('user');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const initializeAuth = async () => {
    console.log('initializeAuth called:', {
      mounted: mounted.current,
      initialized: initializedRef.current,
      hasStoredUser: !!localStorage.getItem('user'),
      hasToken: !!localStorage.getItem('token')
    });

    if (initializedRef.current) {
      console.log('Already initialized, skipping');
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        const userData = JSON.parse(storedUser);
        if (mounted.current) {
          setUser(userData);
          console.log('Restored user from storage:', userData);
        }
      } else {
        console.log('No stored user data found');
        if (mounted.current) {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      if (mounted.current) {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } finally {
      if (mounted.current) {
        setInitialized(true);
        initializedRef.current = true;
        setLoading(false);
        console.log('Auth initialization complete');
      }
    }
  };

  useEffect(() => {
    console.log('AuthProvider mounted');
    mounted.current = true;
    initializeAuth();

    return () => {
      console.log('AuthProvider unmounting');
      mounted.current = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user: userData } = response.data;
      const user = { ...userData, token };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUserProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.put('http://localhost:5000/api/users/profile', userData, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    initialized,
    login,
    register,
    logout,
    updateUserProfile
  };

  console.log('AuthContext state:', {
    loading,
    initialized,
    hasUser: !!user,
    userEmail: user?.email
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 