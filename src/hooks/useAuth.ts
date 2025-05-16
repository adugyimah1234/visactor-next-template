/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuth.ts
import { useState, useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';
import { login as loginService } from '@/services/auth'; // Ensure correct import

interface LoginResponse {
  token: string;
  user: {
    id: number;
    role: string;
    // Add other properties of the user object from the login response
  };
}

export const useAuth = (): AuthContextType & { loading: boolean; error: string | null; signIn: (email: string, password: string) => Promise<void> } => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data: LoginResponse = await loginService(email, password);
      if (data?.token && data?.user) {
        await context.login(data.token, { id: data.user.id, role: data.user.role });
      } else {
        setError('Login failed: Invalid response.');
        throw new Error('Invalid login response');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    ...context,
    loading,
    error,
    signIn,
  };
};