export interface Exam {
  id: number;
  class_id: number;
  category_id: number;
  name: string;
  date: string; // ISO date string, e.g., "2025-06-10"
  venue: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Class {
  students_count: number;
  level: number | undefined;
  school_id: number | undefined;
  capacity: number | undefined;
  id: number;
  name: string;
}

export interface CreateExamInput {
  class_id: number;
  category_id: number;
  name: string;
  date: string;
  venue: string;
}
export interface UpdateExamInput {
  id: number;
  class_id?: number;
  category_id?: number;
  name?: string;
  date?: string;
  venue?: string;
}
export interface DeleteExamInput {
  id: number;
}