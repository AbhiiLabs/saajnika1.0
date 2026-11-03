import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, Address } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: any) => Promise<boolean>;
  addresses: Address[];
  fetchAddresses: () => Promise<void>;
  addAddress: (addr: Address) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/addresses/');
      setAddresses(res.data.results || res.data || []);
    } catch (err) {
      setAddresses([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('saajnika_access_token');
    if (token) {
      fetchProfile();
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login/', { email, password });
      localStorage.setItem('saajnika_access_token', res.data.access);
      localStorage.setItem('saajnika_refresh_token', res.data.refresh);
      await fetchProfile();
      await fetchAddresses();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.detail || err.response?.data?.error || 'Invalid credentials',
      };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await api.post('/auth/register/', userData);
      localStorage.setItem('saajnika_access_token', res.data.tokens.access);
      localStorage.setItem('saajnika_refresh_token', res.data.tokens.refresh);
      setUser(res.data.user);
      return { success: true };
    } catch (err: any) {
      const data = err.response?.data;
      let errorMsg = 'Registration failed. Please check form values.';
      if (typeof data === 'string') {
        errorMsg = data;
      } else if (data && typeof data === 'object') {
        const errors: string[] = [];
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) {
            errors.push(`${key}: ${val.join(' ')}`);
          } else if (typeof val === 'string') {
            errors.push(`${key}: ${val}`);
          }
        }
        if (errors.length > 0) {
          errorMsg = errors.join(' | ');
        }
      }
      return {
        success: false,
        error: errorMsg,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('saajnika_access_token');
    localStorage.removeItem('saajnika_refresh_token');
    setUser(null);
    setAddresses([]);
  };

  const updateProfile = async (data: any) => {
    try {
      const res = await api.patch('/auth/profile/', data);
      setUser(res.data);
      return true;
    } catch {
      return false;
    }
  };

  const addAddress = async (addr: Address) => {
    try {
      await api.post('/auth/addresses/', addr);
      await fetchAddresses();
      return true;
    } catch {
      return false;
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addresses,
        fetchAddresses,
        addAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
