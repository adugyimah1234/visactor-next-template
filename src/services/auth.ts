/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// lib/services/auth.ts

import api from "@/lib/axios";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: string;
  school_id: number;
}

export const login = async (email: string, password: string) => {
  const payload: LoginPayload = { email, password }; // Construct the payload here
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
