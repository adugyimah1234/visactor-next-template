/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';
export const getAllRoles = async () => {
    var _a, _b, _c;
    try {
        const response = await api.get('/roles');
        return response.data;
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            throw new Error('Authentication required');
        }
        throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Failed to fetch roles');
    }
};
export const getRoleById = async (id) => {
    var _a, _b, _c;
    try {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            throw new Error('Authentication required');
        }
        throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Failed to fetch role');
    }
};
export const createRole = async (data) => {
    var _a, _b, _c;
    try {
        const response = await api.post('/roles', data);
        return response.data;
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            throw new Error('Authentication required');
        }
        throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Failed to create role');
    }
};
export const updateRole = async (id, data) => {
    var _a, _b, _c;
    try {
        const response = await api.put(`/roles/${id}`, data);
        return response.data;
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            throw new Error('Authentication required');
        }
        throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Failed to update role');
    }
};
export const deleteRole = async (id) => {
    var _a, _b, _c;
    try {
        await api.delete(`/roles/${id}`);
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            throw new Error('Authentication required');
        }
        throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Failed to delete role');
    }
};
