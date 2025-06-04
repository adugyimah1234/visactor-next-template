import api from '@/lib/axios';
import { type Exam, type CreateExamInput } from '@/types/exam';

export const getExams = async (): Promise<Exam[]> => {
  const res = await api.get<Exam[]>('/exams');
  return res.data;
};

export const getExamById = async (id: number): Promise<Exam> => {
  const res = await api.get<Exam>(`/exams/${id}`);
  return res.data;
};

export const createExam = async (data: CreateExamInput): Promise<{ insertId: number }> => {
  const res = await api.post('/exams', data);
  return res.data;
};

export const updateExam = async (id: number, data: CreateExamInput): Promise<void> => {
  await api.put(`/exams/${id}`, data);
};

export const deleteExam = async (id: number): Promise<void> => {
  await api.delete(`/exams/${id}`);
};
