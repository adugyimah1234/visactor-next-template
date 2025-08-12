/**
 * Types for the school management system's classes and exams
 */

/**
 * Basic class interface
 */
export interface Class {
  level: number | undefined;
  id: number;
  name: string;
  grade_level: string;
  academic_year_id: number;
  school_id?: number;
  teacher_id?: number;
  capacity: number;
  current_students: number;
  sections?: Section[];
  created_at: string;
  updated_at: string;
}

/**
 * Section interface
 */
export interface Section {
  id: string;
  name: string;
  class_id: string;
  teacher_id?: string;
  capacity: number;
  current_students: number;
}

/**
 * Exam interface
 */
export interface ClassExam {
  id: number;
  class_id: number;
  category_id: number;
  category_name?: string;
  name: string;
  date: string;
  description?: string;
  total_marks: number;
  venue?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Class with exams
 */
export interface ClassWithExams extends Class {
  exams: ClassExam[];
}

/**
 * DTO interfaces
 */
export interface CreateClassDTO {
  name: string;
  grade_level: string;
  academic_year_id: number;
  school_id?: number;
  teacher_id?: number;
  capacity: number;
}

export interface UpdateClassDTO {
  name?: string;
  grade_level?: string;
  teacher_id?: number;
  capacity?: number;
}

export interface CreateSectionDTO {
  name: string;
  class_id: number;
  teacher_id?: number;
  capacity: number;
}

export interface UpdateSectionDTO {
  name?: string;
  teacher_id?: number;
  capacity?: number;
}

export interface CreateExamDTO {
  name: string;
  date: string;
  category_id: number;
  description?: string;
  total_marks: number;
  venue?: string;
}

export interface UpdateExamDTO {
  name?: string;
  date?: string;
  category_id?: number;
  description?: string;
  total_marks?: number;
  venue?: string;
}

/**
 * Filter interfaces
 */
export interface ClassFilters {
  academic_year_id?: number;
  school_id?: number;
  grade_level?: string;
  teacher_id?: number;
  category_id?: number;
}

/**
 * Response interfaces
 */
export interface CreateResponse {
  id: string;
  message: string;
}

export interface UpdateResponse {
  message: string;
  changes: number;
}

export interface DeleteResponse {
  message: string;
}

export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

