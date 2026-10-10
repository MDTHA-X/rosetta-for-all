import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.js';
import { tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => tokenStore.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  // Bootstrap session: check existing token on mount
  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const storedToken = tokenStore.getToken();
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        if (isMounted) {
          setUser(userData);
          setToken(storedToken);
          localStorage.setItem('rosettaUser', JSON.stringify(userData));
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        tokenStore.removeToken();
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    // Register 401 unauth callback
    tokenStore.onUnauthorized(() => {
      if (isMounted) {
        setUser(null);
        setToken(null);
        setError('Your session has expired. Please sign in again.');
      }
    });

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async ({ identifier, username, email, password }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login({ identifier, username, email, password });
      const authenticatedUser = data.user || data;
      setUser(authenticatedUser);
      setToken(data.token);
      localStorage.setItem('rosettaUser', JSON.stringify(authenticatedUser));
      return { success: true, data };
    } catch (err) {
      const msg = err.message || (err.data && (err.data.error || err.data.message)) || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ name, email, username, password, role, avatar }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.register({ name, email, username, password, role, avatar });
      const registeredUser = data.user || data;
      setUser(registeredUser);
      setToken(data.token);
      localStorage.setItem('rosettaUser', JSON.stringify(registeredUser));
      return { success: true, data };
    } catch (err) {
      const msg = err.message || (err.data && (err.data.error || err.data.message)) || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      tokenStore.removeToken();
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const updatedUser = await authApi.getMe();
      setUser(updatedUser);
      localStorage.setItem('rosettaUser', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.warn('Failed to refresh profile:', err.message);
      return null;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'Admin',
    isLoading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
