/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// lib/services/auth.ts

import api from "@/lib/axios";

interface LoginPayload {
  email: string;
  username?: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  username: string;
  role: string;
  school_id: number | null;
}

export const login = async (username: string, password: string) => {
  //  Correct: build payload with username (not email)
  const payload = { username, password };
  const response = await api.post('/auth/login', payload);
  return response.data; // { message, token, user }
};

export const register = async (payload: RegisterPayload) => {
  const response = await api.post('/auth/register', payload);
  return response.data; // { message }
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data; // { message } - You might want to handle different responses
  } catch (error: any) {
    // Handle potential errors during logout API call
    console.error("Logout API error:", error);
    throw error; // Re-throw the error for the component to handle
  } finally {
    // Perform client-side logout actions regardless of API success/failure
    localStorage.removeItem('token');
    // Remove other relevant authentication tokens or data
    // Redirect to login page or update authentication state
    window.location.href = '/login'; // Or use your router's navigation
  }
};

interface ChangePasswordPayload {
  username: string;
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await api.post('/auth/change-password', payload);
  return response.data; // { message }
};
