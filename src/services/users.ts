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
    // Validate payload
    if (Object.keys(payload).length === 0) {
      throw new Error("No fields to update");
    }

    const response = await api.put(`/users/${userId}`, payload);
    if (response.status === 200 && response.data?.user) {
      return response.data.user;
    }
    throw new Error("Failed to update user");
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw new Error(error.response?.data?.error || "Failed to update user");
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    if (!response.data || !Array.isArray(response.data.users)) {
      throw new Error('Invalid response format');
    }
    return response.data.users;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch users");
  }
};