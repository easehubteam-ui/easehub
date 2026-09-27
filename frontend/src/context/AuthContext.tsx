import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<User | null>;
  loginAdmin: (credentials: any) => Promise<User | null>;
  register: (data: any) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res?.success && res?.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      } else {
        localStorage.removeItem('easehub_token');
        setUser(null);
        return null;
      }
    } catch (err) {
      localStorage.removeItem('easehub_token');
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    try {
      const res = await authApi.login(credentials);
      if (res?.success && res?.data?.user) {
        if (res.data?.token) {
          localStorage.setItem('easehub_token', res.data.token);
        }
        setUser(res.data.user);
        return res.data.user;
      }
      throw new Error(res?.message || 'Login failed. Invalid credentials.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      throw new Error(msg);
    }
  };

  const loginAdmin = async (credentials: any) => {
    try {
      const res = await authApi.adminLogin(credentials);
      if (res?.success && res?.data?.user) {
        if (res.data?.token) {
          localStorage.setItem('easehub_token', res.data.token);
        }
        setUser(res.data.user);
        return res.data.user;
      }
      throw new Error(res?.message || 'Administrator login failed.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Administrator authentication failed.';
      throw new Error(msg);
    }
  };

  const register = async (data: any) => {
    try {
      const res = await authApi.register(data);
      if (res?.success && res?.data?.user) {
        if (res.data?.token) {
          localStorage.setItem('easehub_token', res.data.token);
        }
        setUser(res.data.user);
        return res.data.user;
      }
      throw new Error(res?.message || 'Registration failed.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('easehub_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAdmin,
        register,
        logout,
        refreshUser,
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
