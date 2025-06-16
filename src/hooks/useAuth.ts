/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuth.ts
import { useState, useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';
import { login as loginService } from '@/services/auth';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    role: string;
    // Add other properties if needed
  };
}

export const useAuth = (): AuthContextType & {
  loading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>; // ✅ updated
} => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ updated param name
  const signIn = async (username: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // ✅ pass username to service
      const data: LoginResponse = await loginService(username, password);
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
