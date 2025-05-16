/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// contexts/AuthContext.tsx
'use client';
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, updateUser, type UpdateUserPayload } from '@/services/users'; // Ensure correct import
import api from '@/lib/axios'; // Import your configured Axios instance

// Define your User interface (adjust based on your backend response)
interface User {
  phone_number?: string;
  id: number;
  full_name?: string;
  email: string;
  role: string;
  school_id?: number | null;
  // Add other user properties
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, initialUser: { id: number; role: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (data: UpdateUserPayload) => Promise<void>;
}
export type { AuthContextType }; // Export the interface

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  const login = async (newToken: string, initialUser: { id: number; role: string }) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    try {
      const fullUserDataResponse = await getUserById(String(initialUser.id));
      if (fullUserDataResponse) { // Access the nested 'user' property
        setUser(fullUserDataResponse);
        localStorage.setItem('user', JSON.stringify(fullUserDataResponse));
        router.push('/');
      } else {
        console.error('Failed to fetch full user data or invalid response.');
        logout();
      }
    } catch (error: unknown) {
      console.error('Error fetching full user data after login:', error);
      let errorMessage = 'Failed to fetch user data.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Optionally set an error state to display to the user
      logout();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    router.push('/login');
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
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const isAuthenticated = !!token;

  const value: AuthContextType = { user, token, login, logout, isAuthenticated, updateUserProfile };

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