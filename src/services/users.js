/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";
export const getUserById = async (userId) => {
    var _a, _b;
    try {
        const response = await api.get(`/users/${userId}`);
        if (!response.data || !response.data.user) {
            throw new Error('Invalid response format');
        }
        return response.data.user;
    }
    catch (error) {
        console.error("Error fetching user:", error);
        throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || "Failed to fetch user");
    }
};
export const updateUser = async (userId, payload) => {
    var _a, _b, _c;
    try {
        const response = await api.put(`/users/${userId}`, payload);
        return response.data;
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            throw new Error('Authentication required');
        }
        console.error("Error updating user:", error);
        throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || "Failed to update user");
    }
};
export const getAllUsers = async () => {
    var _a, _b, _c;
    try {
        const response = await api.get('/users');
        return response.data;
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            throw new Error('Authentication required');
        }
        console.error("Error fetching users:", error);
        throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || "Failed to fetch users");
    }
};
export const deleteUser = async (userId) => {
    var _a, _b, _c;
    try {
        await api.delete(`/users/${userId}`);
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            throw new Error('Authentication required');
        }
        console.error("Error deleting user:", error);
        throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || "Failed to delete user");
    }
};
export const createUser = async (userData) => {
    var _a, _b, _c;
    try {
        const response = await api.post('/users', userData);
        return response.data;
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            throw new Error('Authentication required');
        }
        console.error("Error creating user:", error);
        throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || "Failed to create user");
    }
};
