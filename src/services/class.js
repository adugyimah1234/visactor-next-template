import api from "@/lib/axios";
const classService = {
    getAll: async () => {
        const res = await api.get('/classes');
        return res.data;
    },
    getBySchool: async (schoolId) => {
        const res = await api.get('/classes', {
            params: { school_id: schoolId }
        });
        return res.data;
    },
    getById: async (id) => {
        const res = await api.get(`/classes/${id}`);
        return res.data;
    },
    create: async (data) => {
        const res = await api.post('/classes', data);
        return res.data;
    },
    update: async (cls) => {
        const res = await api.put(`/classes/${cls.id}`, cls);
        return res.data;
    },
    delete: async (id) => {
        await api.delete(`/classes/${id}`);
    },
};
export default classService;
