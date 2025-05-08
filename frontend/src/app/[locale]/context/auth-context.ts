// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthAPI } from '@/lib/api-client';
import { User } from '../types';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser() {
    try {
      setLoading(true);
      const { user } = await AuthAPI.getUser();
      setUser(user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Session expired. Please login again.');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      
      const user  = await AuthAPI.login(email, password);
      localStorage.setItem('token', user.token);
    
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(firstName: string, lastName:string, email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      const user = await AuthAPI.register(firstName, lastName, email, password);
      localStorage.setItem('token', user.token);
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}