export interface School {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  code: string;
  logo?: string;
  website?: string;
  description?: string;
  type?: 'public' | 'private';
  capacity: number;
}

export interface SchoolClass {
  id: number;
  name: string;
  level: number;
  school_id: number;
  capacity?: number;
  students_count?: number;
  created_at?: string;
}

export interface Category {
  code: string | undefined;
  fees: number | undefined;
  id: number;
  name: string;
  description: string;
  school_id: number;
  status: 'active' | 'inactive';
  created_at?: string;
}