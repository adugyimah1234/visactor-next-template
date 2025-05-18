/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  role: string;
  school_id?: number | null;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

export interface CreateUserDTO {
  username: string;
  full_name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'staff';
  school_id?: number | null;
}

export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);
    if (!response.data || !response.data.user) {
      throw new Error('Invalid response format');
    }
    return response.data.user;
  } catch (error: any) {
    console.error("Error fetching user:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch user");
  }
};

export const updateUser = async (userId: number, payload: UpdateUserPayload): Promise<User> => {
  try {
    const response = await api.put(`/users/${userId}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    console.error("Error updating user:", error);
    throw new Error(error.response?.data?.error || "Failed to update user");
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    console.error("Error fetching users:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch users");
  }
};

export const createUser = async (userData: CreateUserDTO): Promise<User> => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    console.error("Error creating user:", error);
    throw new Error(error.response?.data?.error || "Failed to create user");
  }
};