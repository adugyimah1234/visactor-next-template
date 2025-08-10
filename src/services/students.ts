import api from "@/lib/axios";

export interface CreateStudentPayload {
  id?: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
  gender: string;
  category_id: number;
  scores: number;
  class_id: number;
  registration_date: string;
  admission_status: string;
  status: string;
  school_id?: number;
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

  
    promote: async (id: number) => {
      const res = await api.post(`/students/${id}/promote`);
      return res.data;
    },
  
    transfer: async (id: number, newSchoolId: number, newClassId: number) => {
      const res = await api.post(`/students/${id}/transfer`, {
        school_id: newSchoolId,
        class_id: newClassId,
      });
      return res.data;
    },
  

  enroll: async (id: number, class_id: number, school_id: number) => {
    const res = await api.post(`/students/${id}/enroll`, {
      class_id,
      school_id,
    });
    return res.data;
  },

  updatePartial: async (id: number, data: Partial<CreateStudentPayload>) => {
    const res = await api.patch(`/students/${id}`, data);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  },
};

// Named export for getStudents
export const getStudents = studentService.getAll;

export default studentService;
