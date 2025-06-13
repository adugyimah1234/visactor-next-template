/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// contexts/AuthContext.tsx
'use client';
import { createContext, useState, useEffect, type ReactNode, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, updateUser, type UpdateUserPayload } from '@/services/users';
import api from '@/lib/axios';

// Define your User interface (adjust based on your backend response)
interface User {
  phone_number?: string;
  id: number;
  full_name?: string;
  email: string;
  role_id: number;
  school_id?: number | null;
  // Add other user properties
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, initialUser: { id: number; role: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUserProfile: (data: UpdateUserPayload) => Promise<void>;
}

export type { AuthContextType };

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Memoized logout function to prevent infinite re-renders
  const logout = useCallback(async (showMessage = true) => {
    try {
      // Call backend logout if token exists
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.warn('Backend logout failed:', error);
      // Continue with client-side logout even if backend fails
    } finally {
      // Clear client-side state
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      if (showMessage) {
        console.log('User logged out successfully');
      }
      
      // router.push('/login');
    }
  }, [token, router]);

  // Setup Axios interceptor to handle token expiration/invalid responses
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Check if the error is due to authentication issues
        if (error.response?.status === 401) {
          console.warn('Authentication failed, logging out...');
          await logout(false); // Don't show message for automatic logout
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  // Monitor localStorage changes (for when token is removed from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && !e.newValue && token) {
        console.warn('Auth token removed from localStorage, logging out...');
        logout(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token, logout]);

  // Token validation function
  const validateToken = useCallback(async (tokenToValidate: string): Promise<boolean> => {
    try {
      const response = await api.get('/auth/validate', {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`
        }
      });
      return response.data.success === true;
    } catch (error: any) {
      console.warn('Token validation failed:', error.response?.data?.message || error.message);
      return false;
    }
  }, []);

  // Periodic token validation (check every 5 minutes)
  useEffect(() => {
    if (!token) return;

    const validateAndLogout = async () => {
      const isValid = await validateToken(token);
      if (!isValid) {
        console.warn('Token validation failed, logging out...');
        await logout(false);
      }
    };

    // Validate immediately and then every 5 minutes
    validateAndLogout();
    const interval = setInterval(validateAndLogout, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token, validateToken, logout]);

  // Check for stored token and user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Validate the stored token
          const isValid = await validateToken(storedToken);
          
          if (isValid) {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } else {
            // Token is invalid, clear stored data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Clear invalid stored data
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [validateToken]);

  const login = async (newToken: string, initialUser: { id: number; role: string }) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    try {
      const fullUserDataResponse = await getUserById(String(initialUser.id));
      if (fullUserDataResponse) {
        setUser(fullUserDataResponse);
        localStorage.setItem('user', JSON.stringify(fullUserDataResponse));
        router.push('/');
      } else {
        console.error('Failed to fetch full user data or invalid response.');
        await logout();
      }
    } catch (error: unknown) {
      console.error('Error fetching full user data after login:', error);
      await logout();
    }
  };

  const updateUserProfile = async (data: UpdateUserPayload) => {
    if (!user?.id) {
      throw new Error('No authenticated user');
    }

    try {
      const updatedUser = await updateUser(user.id, data);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error('Profile update error:', error);
      // If update fails due to auth issues, logout
      if (error.response?.status === 401) {
        await logout(false);
      }
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = { 
    user, 
    token, 
    login, 
    logout: () => logout(), 
    isLoading,
    isAuthenticated, 
    updateUserProfile 
  };

  // Show loading state while initializing
  if (isLoading) {
    return <div>Loading...</div>; // or your loading component
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};