/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';
import { School, SchoolClass, Category } from '@/types/school';

export const getAllSchools = async (): Promise<School[]> => {
  try {
    const response = await api.get('/schools');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch schools');
  }
};

export const createSchool = async (schoolData: Omit<School, 'id' | 'createdAt'>): Promise<School> => {
  try {
    const response = await api.post('/schools', schoolData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create school');
  }
};

export const updateSchool = async (id: number, schoolData: Partial<School>): Promise<School> => {
  try {
    const response = await api.put(`/schools/${id}`, schoolData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update school');
  }
};

export const deleteSchool = async (id: number): Promise<void> => {
  try {
    await api.delete(`/schools/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete school');
  }
};