import api from "@/lib/axios";
const studentService = {
    create: async (data) => {
        const res = await api.post('/students', data);
        return res.data;
    },
    getAll: async () => {
        const res = await api.get('/students');
        return res.data;
    },
    getById: async (id) => {
        const res = await api.get(`/students/${id}`);
        return res.data;
    },
    promote: async (id) => {
        const res = await api.post(`/students/${id}/promote`);
        return res.data;
    },
    transfer: async (id, newSchoolId, newClassId) => {
        const res = await api.post(`/students/${id}/transfer`, {
            school_id: newSchoolId,
            class_id: newClassId,
        });
        return res.data;
    },
    enroll: async (id, class_id, school_id) => {
        const res = await api.post(`/students/${id}/enroll`, {
            class_id,
            school_id,
        });
        return res.data;
    },
    remove: async (id) => {
        const res = await api.delete(`/students/${id}`);
        return res.data;
    },
};
// Named export for getStudents
export const getStudents = studentService.getAll;
export default studentService;
