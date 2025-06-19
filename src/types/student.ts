
// Student profile types
export interface StudentProfile {
  id: number;
  admission_status: string;
  date_of_birth: string;
first_name: string;
middle_name: string;
last_name: string; 
dob: Date;
gender: string;
category_id: number;
class_id: number;
registration_date: string;
status: string;
school_id: number;
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


// Student with basic information
export interface Student {
  id: number;
  admission_status: string;
  date_of_birth: string;
first_name: string;
academic_year_id: number;
student_name?: string;
middle_name: string;
last_name: string; 
dob: Date;
gender: string;
category_id: number;
class_id: number;
registration_date: string;
status: string;
school_id: number;
 category?: 'SVC' | 'MOD' | 'CIV'; 
}


// Request payloads
export interface CreateStudentPayload {
  id: number;
  admission_status: string;
  date_of_birth: string;
first_name: string;
middle_name: string;
last_name: string; 
dob: Date;
gender: string;
category_id: number;
scores: string;
class_id: number;
registration_date: string;
status: string;
school_id: number;
  guardians?: {
    guardian_id: number;
    relationship?: string;
    is_primary_contact?: boolean;
    contact_priority?: number;
  }[];
}

export interface UpdateStudentPayload {
  id: number;
  admission_status: string;
  date_of_birth: string;
first_name: string;
middle_name: string;
last_name: string; 
dob: Date;
gender: string;
category_id: number;
class_id: number;
registration_date: string;
status: string;
school_id: number;
  guardians?: {
    guardian_id: number;
    relationship?: string;
    is_primary_contact?: boolean;
    contact_priority?: number;
  }[];
}

