/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';
export const getAllAcademicYear = async () => {
    var _a, _b;
    try {
        const response = await api.get('/academic-years');
        return response.data;
    }
    catch (error) {
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Failed to fetch categories');
    }
};
export const createAcademicYear = async (data) => {
    var _a, _b;
    try {
        const response = await api.post('/academic-years', data);
        return response.data;
    }
    catch (error) {
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Failed to create category');
    }
};
export const updateAcademicYear = async (id, data) => {
    var _a, _b;
    try {
        const response = await api.put(`/academic-years/${id}`, data);
        return response.data;
    }
    catch (error) {
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Failed to update category');
    }
};
export const deleteAcademicYear = async (id) => {
    var _a, _b;
    try {
        await api.delete(`/academic-years/${id}`);
    }
    catch (error) {
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Failed to delete category');
    }
};
