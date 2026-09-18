import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [role, setRole] = useState(() => localStorage.getItem('role') || '');
  const [loading, setLoading] = useState(true);

  // Sync token to axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.data && res.data.user) {
            setUser(res.data.user);
            setRole(res.data.user.role);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('userId', String(res.data.user.id));
          }
        } catch (err) {
          console.warn('[Auth] Session validation fell back to local storage session');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password, desiredRole, autoRegister = false) => {
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password,
        ...(desiredRole ? { role: desiredRole } : {}),
        ...(autoRegister ? { auto_register: true } : {})
      };
      const response = await axios.post('/api/auth/login', payload);
      const { access_token, user: loggedUser } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', loggedUser.role);
      localStorage.setItem('userId', String(loggedUser.id));
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setToken(access_token);
      setRole(loggedUser.role);
      setUser(loggedUser);

      return { success: true, user: loggedUser };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      const errorObj = new Error(msg);
      errorObj.canAutoRegister = !!err.response?.data?.can_auto_register;
      throw errorObj;
    }
  }, []);

  const register = useCallback(async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      // Auto-login after registration
      const loginRes = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      const { access_token, user: loggedUser } = loginRes.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', loggedUser.role);
      localStorage.setItem('userId', String(loggedUser.id));
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setToken(access_token);
      setRole(loggedUser.role);
      setUser(loggedUser);

      return { success: true, user: loggedUser, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Email might already exist.';
      throw new Error(msg);
    }
  }, []);

  const quickDemoLogin = useCallback(async (demoType = 'household') => {
    if (demoType === 'provider') {
      return login('provider@example.com', 'password123', 'provider');
    }
    if (demoType === 'rohit') {
      return login('mulaparthi.rohit1234@gmail.com', 'password123', 'household');
    }
    return login('household@example.com', 'password123', 'household');
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken('');
    setRole('');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        quickDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
