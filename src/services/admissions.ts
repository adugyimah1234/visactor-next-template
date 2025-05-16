import api from "@/lib/axios";

export interface School {
  id: number;
  name: string;
  maxCapacity: number;
  currentCapacity: number;
  classes: SchoolClass[];
}

export interface SchoolClass {
  id: number;
  name: string;
  maxStudents: number;
  currentStudents: number;
}

export interface Student {
  id: number;
  name: string;
  examScore: number;
  status: 'pending' | 'assigned' | 'enrolled';
  schoolId?: number;
  classId?: number;
  admissionDate?: string;
  contactInfo: {
    email: string;
    phone: string;
  };
}

export const getQualifiedStudents = async () => {
  const response = await api.get('/admissions/qualified-students');
  return response.data;
};

export const getSchools = async () => {
  const response = await api.get('/admissions/schools');
  return response.data;
};

export const assignSchool = async (studentId: number, schoolId: number, classId: number) => {
  const response = await api.post(`/admissions/assign`, {
    studentId,
    schoolId,
    classId
  });
  return response.data;
};

export const getEnrolledStudents = async () => {
  const response = await api.get('/admissions/enrolled');
  return response.data;
};