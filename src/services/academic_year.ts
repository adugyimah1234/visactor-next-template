/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';

export interface academicYear {
  id: number;
year: number;
start_date: Date; 
end_date: Date;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAcademicYear {
  id: number;
year: number;
start_date: Date; 
end_date: Date;
  created_at?: string;
  updated_at?: string;
}

export const getAllAcademicYear = async (): Promise<academicYear[]> => {
  try {
    const response = await api.get('/academic-years');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

export const createAcademicYear = async (data: CreateAcademicYear): Promise<academicYear> => {
  try {
    const response = await api.post('/academic-years', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
};

export const updateAcademicYear = async (id: number, data: Partial<CreateAcademicYear>): Promise<academicYear> => {
  try {
    const response = await api.put(`/academic-years/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
};

export const deleteAcademicYear = async (id: number): Promise<void> => {
  try {
    await api.delete(`/academic-years/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};