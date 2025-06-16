import api from "@/lib/axios";

export interface ClassData {
  id: number;
  name: string;
  level?: number;
  school_id: number;
  school_name?: string;
  slots: number;
  capacity: number;
  students_count: number;
}

const classService = {
  getAll: async (): Promise<ClassData[]> => {
    const res = await api.get('/classes');
    return res.data;
  },

  getBySchool: async (schoolId: number): Promise<ClassData[]> => {
    const res = await api.get('/classes', {
      params: { school_id: schoolId }
    });
    return res.data;
  },

  getById: async (id: number): Promise<ClassData> => {
    const res = await api.get(`/classes/${id}`);
    return res.data;
  },

  create: async (data: Omit<ClassData, "id" | "school_name">): Promise<ClassData> => {
    const res = await api.post('/classes', data);
    return res.data;
  },

update: async (cls: ClassData): Promise<ClassData> => {
  const res = await api.put(`/classes/${cls.id}`, cls);
  return res.data;
},


  delete: async (id: number): Promise<void> => {
    await api.delete(`/classes/${id}`);
  },
};

export default classService;
