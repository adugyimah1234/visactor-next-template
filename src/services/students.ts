import api from "@/lib/axios";

export interface CreateStudentPayload {
id: number;
first_name: string;
middle_name: string;
last_name: string; 
dob: string;
gender: string;
category_id: number;
scores: number,
class_id: number;
registration_date: string;
admission_status: string;
status: string;
school_id: number;
}

const studentService = {
  create: async (data: CreateStudentPayload) => {
    const res = await api.post('/students', data);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/students');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get(`/students/${id}`);
    return res.data;
  },
  enroll: async (id: number, class_id: number, school_id: number) => {
  const res = await api.post(`/students/${id}/enroll`, {
    class_id,
    school_id,
  });
  return res.data;
}

};

export default studentService;
