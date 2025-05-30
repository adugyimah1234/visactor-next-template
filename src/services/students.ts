import axios from 'axios';
import { 
  Student, 
  StudentDetail, 
  StudentFilterParams, 
  CreateStudentPayload, 
  UpdateStudentPayload, 
  CreateStudentResponse, 
  EnrollStudentPayload, 
  EnrollmentResponse, 
  TransferStudentPayload, 
  TransferResponse, 
  StudentAcademicHistory 
} from '../types/student';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Get all students with optional filters
 * @param filters Optional query parameters to filter students
 * @returns Array of students
 */
export const getStudents = async (filters?: StudentFilterParams): Promise<Student[]> => {
  try {
    // Build query parameters from filters
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await axios.get<Student[]>(`${API_URL}/students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch students');
    }
    throw error;
  }
};

/**
 * Get detailed student information by ID
 * @param id Student ID
 * @returns Detailed student information
 */
export const getStudent = async (id: number): Promise<StudentDetail> => {
  try {
    const response = await axios.get<StudentDetail>(`${API_URL}/students/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch student with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Register a new student
 * @param student Student data
 * @returns Created student response
 */
export const createStudent = async (student: CreateStudentPayload): Promise<CreateStudentResponse> => {
  try {
    const response = await axios.post<CreateStudentResponse>(`${API_URL}/students`, student);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to create student');
    }
    throw error;
  }
};

/**
 * Update student information
 * @param id Student ID
 * @param student Updated student data
 * @returns Success message
 */
export const updateStudent = async (id: number, student: UpdateStudentPayload): Promise<{ message: string }> => {
  try {
    const response = await axios.put<{ message: string }>(`${API_URL}/students/${id}`, student);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to update student with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Delete a student
 * @param id Student ID
 * @returns Success message
 */
export const deleteStudent = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await axios.delete<{ message: string }>(`${API_URL}/students/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to delete student with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Enroll student in a class/section
 * @param id Student ID
 * @param enrollmentData Enrollment information
 * @returns Enrollment response
 */
export const enrollStudent = async (id: number, enrollmentData: EnrollStudentPayload): Promise<EnrollmentResponse> => {
  try {
    const response = await axios.post<EnrollmentResponse>(`${API_URL}/students/${id}/enroll`, enrollmentData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to enroll student with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Transfer student to a different section
 * @param id Student ID
 * @param transferData Transfer information
 * @returns Transfer response
 */
export const transferStudent = async (id: number, transferData: TransferStudentPayload): Promise<TransferResponse> => {
  try {
    const response = await axios.put<TransferResponse>(`${API_URL}/students/${id}/transfer`, transferData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to transfer student with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Get student's academic history
 * @param id Student ID
 * @returns Student academic history
 */
export const getStudentAcademicHistory = async (id: number): Promise<StudentAcademicHistory> => {
  try {
    const response = await axios.get<StudentAcademicHistory>(`${API_URL}/students/${id}/academic-history`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch academic history for student with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Check if a student exists by admission number or email
 * @param admissionNumber Admission number to check
 * @param email Email to check
 * @returns Boolean indicating if student exists
 */
export const checkStudentExists = async (admissionNumber: string, email: string): Promise<boolean> => {
  try {
    // We'll just try to find students with this admission number or email
    const byAdmission = await getStudents({ search: admissionNumber });
    const byEmail = await getStudents({ search: email });
    
    return byAdmission.length > 0 || byEmail.length > 0;
  } catch (error) {
    console.error('Error checking if student exists:', error);
    return false;
  }
};

export default {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollStudent,
  transferStudent,
  getStudentAcademicHistory,
  checkStudentExists
};

