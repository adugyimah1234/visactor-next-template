export interface School {
  id: number;
  name: string;
  code: string;
  capacity: number;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SchoolClass {
  id: number;
  name: string;
  schoolId: number;
  capacity: number;
  currentStudents: number;
  category: string;
  academicYear: string;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  fees: number;
}