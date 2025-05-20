"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { login as apiLogin, logout as apiLogout } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists
    const token = Cookies.get('auth_token');
    const userDataStr = Cookies.get('user_data');
    
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setIsAuthenticated(true);
        
        // Check admin status
        setIsAdmin(userData.isAdmin === true);
        
        console.log('User data from cookie:', userData);
        console.log('Admin status:', userData.isAdmin);
      } catch (e) {
        // Invalid user data
        console.error('Error parsing user data:', e);
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Check for hardcoded admin credentials
      if (email === 'admin' && password === 'Voices2025!') {
        // Create a mock user object
        const userData = {
          id: '1',
          email: 'admin@voicesradio.co.uk',
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true,
          isVerified: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        // Store user data in cookie
        Cookies.set('user_data', JSON.stringify(userData));
        Cookies.set('auth_token', 'mock-token-for-admin');
        
        setIsAuthenticated(true);
        setIsAdmin(true);
        router.push('/dashboard');
        return;
      }
      
      // If not using hardcoded credentials, try API login
      const response = await apiLogin(email, password);
      console.log('Login response:', response);
      
      // Ensure we have a user object with the required properties
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      const userData = response.user;
      console.log('User data from login:', userData);
      
      // Check if user is admin
      if (userData.isAdmin === true) {
        setIsAuthenticated(true);
        setIsAdmin(true);
        
        // Store user data in cookie
        Cookies.set('user_data', JSON.stringify(userData));
        
        router.push('/dashboard');
      } else {
        setError('You are not an admin');
        throw new Error('You are not an admin');
      }
    } catch (error: unknown) {
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === 'object' && 
        error !== null && 
        'message' in error && 
        typeof error.message === 'string'
      ) {
        errorMessage = error.message;
      }
      
      console.error('Login error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setIsAuthenticated(false);
    setIsAdmin(false);
    Cookies.remove('user_data');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 