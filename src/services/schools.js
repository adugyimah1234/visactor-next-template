import api from "@/lib/axios";
const schoolService = {
    // 🔹 Fetch
    getAll: async () => {
        const res = await api.get('/schools');
        return res.data;
    },
    getById: async (id) => {
        const res = await api.get(`/schools/${id}`);
        return res.data;
    },
    // 🔹 Create/Update/Delete
    create: async (school) => {
        const res = await api.post('/schools', school);
        return res.data;
    },
    update: async (id, school) => {
        const res = await api.put(`/schools/${id}`, school);
        return res.data;
    },
    delete: async (id) => {
        await api.delete(`/schools/${id}`);
    },
    // 🔹 Search by attribute
    search: async (params) => {
        const formattedParams = Object.assign({}, params);
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
