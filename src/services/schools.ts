import api from "@/lib/axios";
import { type School } from "@/types/school";

const schoolService = {
  // 🔹 Fetch
  getAll: async (): Promise<School[]> => {
    const res = await api.get('/schools');
    return res.data;
  },

  getById: async (id: number): Promise<School> => {
    const res = await api.get(`/schools/${id}`);
    return res.data;
  },

  // 🔹 Create/Update/Delete
  create: async (school: Partial<Omit<School, "id">>): Promise<{ id: number }> => {
    const res = await api.post('/schools', school);
    return res.data;
  },

update: async (id: number, school: Partial<Omit<School, "id">>): Promise<School> => {
  const res = await api.put(`/schools/${id}`, school);
  return res.data;
},

  delete: async (id: number): Promise<void> => {
    await api.delete(`/schools/${id}`);
  },

  // 🔹 Search by attribute
  search: async (params: Partial<Record<
    | 'name'
    | 'location'
    | 'type'
    | 'capacity'
    | 'status'
    | 'owner_id'
    | 'start_date'
    | 'end_date'
    | 'rating'
    | 'features'
    | 'affiliation'
    | 'accreditation'
    | 'programs'
    | 'language',
    string | number | string[]
  >>): Promise<School[]> => {
    const formattedParams = { ...params };

    if (Array.isArray(params.features)) {
      formattedParams.features = params.features.join(',');
    }

    if (Array.isArray(params.programs)) {
      formattedParams.programs = params.programs.join(',');
    }

    const res = await api.get('/schools', { params: formattedParams });
    return res.data;
  }
};

export default schoolService;
