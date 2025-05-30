import { User } from './user';
import { School } from './school';

// Student profile types
export interface StudentProfile {
  student_id: number;
  admission_number: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  phone_number?: string;
  blood_group?: string;
  medical_conditions?: string;
  emergency_contact?: string;
}

// Guardian relationship with student
export interface Guardian {
  guardian_id: number;
  full_name: string;
  email: string;
  relationship: string;
  is_primary_contact: boolean;
  contact_priority: number;
}

// Section where a student is enrolled
export interface Section {
  id: number;
  name: string;
  teacher_name?: string;
}

// Class information
export interface Class {
  id: number;
  name: string;
  grade_level: string;
}

// Academic year information
export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

// Enrollment information
export interface Enrollment {
  id: number;
  enrollment_date: string;
  end_date?: string;
  is_active: boolean;
  roll_number?: string;
  transfer_notes?: string;
  transfer_from_enrollment_id?: number;
  section: Section;
  class: Class;
}

// Grade information for a subject
export interface Grade {
  id: number;
  enrollment_id: number;
  grade_value: string;
  remarks?: string;
  graded_date: string;
  graded_by: string;
}

// Subject grade information
export interface SubjectGrade {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  terms: {
    [term: string]: Grade[];
  };
}

// Attendance summary
export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  present_percentage?: number;
  absent_percentage?: number;
}

// Attendance record
export interface AttendanceRecord {
  id: number;
  enrollment_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  reason?: string;
  class_name: string;
  academic_year_name: string;
}

// Transfer record
export interface TransferRecord {
  date: string;
  from: {
    section_name: string;
    class_name: string;
    grade_level: string;
  };
  to: {
    section_name: string;
    class_name: string;
    grade_level: string;
  };
  reason: string;
}

// Academic history for a year
export interface AcademicHistoryYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  enrollments: Enrollment[];
  grades: SubjectGrade[];
  attendance: AttendanceSummary;
}

// Student with basic information
export interface Student {
  id: number;
  full_name: string;
  email: string;
  school_id: number;
  school_name?: string;
  admission_number: string;
  date_of_birth: string;
  gender: string;
  address?: string;
  phone_number?: string;
  active_enrollments?: number;
  enrollment_status?: 'enrolled' | 'not_enrolled';
}

// Student with detailed information
export interface StudentDetail extends Student {
  created_at: string;
  updated_at: string;
  blood_group?: string;
  medical_conditions?: string;
  emergency_contact?: string;
  guardians: Guardian[];
  current_enrollments: Enrollment[];
}

// Student academic history response
export interface StudentAcademicHistory {
  student_id: number;
  student_name: string;
  academic_history: AcademicHistoryYear[];
  transfer_history: TransferRecord[];
  recent_attendance: AttendanceRecord[];
}

// Request payloads
export interface CreateStudentPayload {
  full_name: string;
  email: string;
  password: string;
  school_id: number;
  admission_number: string;
  date_of_birth: string;
  gender: string;
  address?: string;
  phone_number?: string;
  blood_group?: string;
  medical_conditions?: string;
  emergency_contact?: string;
  guardians?: {
    guardian_id: number;
    relationship?: string;
    is_primary_contact?: boolean;
    contact_priority?: number;
  }[];
}

export interface UpdateStudentPayload {
  full_name?: string;
  email?: string;
  password?: string;
  school_id?: number;
  admission_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone_number?: string;
  blood_group?: string;
  medical_conditions?: string;
  emergency_contact?: string;
  guardians?: {
    guardian_id: number;
    relationship?: string;
    is_primary_contact?: boolean;
    contact_priority?: number;
  }[];
}

export interface EnrollStudentPayload {
  section_id: number;
  roll_number?: string;
}

export interface TransferStudentPayload {
  from_section_id: number;
  to_section_id: number;
  roll_number?: string;
  transfer_reason?: string;
}

// Filter parameters for student list
export interface StudentFilterParams {
  class_id?: number;
  section_id?: number;
  academic_year_id?: number;
  search?: string;
  school_id?: number;
  status?: 'enrolled' | 'not_enrolled';
  grade_level?: string;
}

// Response types for API calls
export interface CreateStudentResponse {
  id: number;
  message: string;
}

export interface EnrollmentResponse {
  id: number;
  message: string;
  enrollment_date: string;
}

export interface TransferResponse {
  id: number;
  message: string;
  transfer_date: string;
  previous_enrollment_id: number;
}

