import api from '@/lib/axios';
export const getExams = async () => {
    const res = await api.get('/exams');
    return res.data;
};
export const getExamById = async (id) => {
    const res = await api.get(`/exams/${id}`);
    return res.data;
};
export const createExam = async (data) => {
    const res = await api.post('/exams', data);
    return res.data;
};
export const updateExam = async (id, data) => {
    await api.put(`/exams/${id}`, data);
};
export const deleteExam = async (id) => {
    await api.delete(`/exams/${id}`);
};
