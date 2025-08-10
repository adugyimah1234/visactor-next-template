/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';
export const getAllCategories = async () => {
    var _a, _b;
    try {
        const response = await api.get('/categories');
        return response.data;
    }
    catch (error) {
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Failed to fetch categories');
    }
};
export const createCategory = async (data) => {
    var _a, _b;
    try {
        const response = await api.post('/categories', data);
        return response.data;
    }
    catch (error) {
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Failed to create category');
    }
};
export const updateCategory = async (id, data) => {
    var _a, _b;
    try {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    }
    catch (error) {
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Failed to update category');
    }
};
export const deleteCategory = async (id) => {
    var _a, _b;
    try {
        await api.delete(`/categories/${id}`);
    }
    catch (error) {
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Failed to delete category');
    }
};
