/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// lib/services/user.ts

import api from "@/lib/axios";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  school_id?: number | null;
}

export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data.user; // Assuming your backend returns { message: ..., user: { ... } }
  } catch (error: any) {
    console.error("Error fetching user:", error);
    throw error; // Re-throw the error for the component to handle
  }
};

// You might have other user-related service functions here, e.g.,
// export const updateUser = async (userId: string, payload: UpdateUserPayload) => { ... };
// export const deleteUser = async (userId: string) => { ... };