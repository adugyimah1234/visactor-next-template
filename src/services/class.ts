/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
// services/classService.ts
import api from "@/lib/axios";

export interface Class {
  id: number;
  name: string;
  level: number;
  school_id: number;
  capacity?: number;
  students_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClassDTO {
  name: string;
  level: number;
  school_id: number;
  capacity?: number;
}

export interface UpdateClassDTO extends Partial<CreateClassDTO> {}

export const getClasses = async (): Promise<Class[]> => {
  try {
    const response = await api.get("/classes");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch classes');
  }
};

export const getClassById = async (id: number): Promise<Class> => {
  try {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch class');
  }
};

export const createClass = async (data: CreateClassDTO): Promise<Class> => {
  try {
    const response = await api.post("/classes", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create class');
  }
};

export const updateClass = async (id: number, data: UpdateClassDTO): Promise<Class> => {
  try {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update class');
  }
};

export const deleteClass = async (id: number): Promise<void> => {
  try {
    await api.delete(`/classes/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete class');
  }
};
