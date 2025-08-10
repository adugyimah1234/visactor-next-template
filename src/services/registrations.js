/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";
const API_BASE_URL = "/registrations";
const registrationService = {
    async getAll() {
        var _a, _b;
        try {
            const response = await api.get(API_BASE_URL);
            return response.data;
        }
        catch (error) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || "Failed to fetch registrations");
        }
    },
    async getById(id) {
        var _a, _b;
        try {
            const response = await api.get(`${API_BASE_URL}/${id}`);
            return response.data;
        }
        catch (error) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || "Failed to fetch registration");
        }
    },
    async create(data) {
        var _a, _b;
        try {
            const response = await api.post(`${API_BASE_URL}/create`, data);
            return response.data.id;
        }
        catch (error) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || "Failed to create registration");
        }
    },
    async update(id, data) {
        var _a, _b;
        try {
            const response = await api.put(`${API_BASE_URL}/${id}`, data);
            return response.data;
        }
        catch (error) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || "Failed to update registration");
        }
    },
    async remove(id) {
        var _a, _b;
        try {
            await api.delete(`${API_BASE_URL}/${id}`);
        }
        catch (error) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || "Failed to delete registration");
        }
    },
    async updatePartial(id, data) {
        var _a, _b;
        try {
            const response = await api.patch(`${API_BASE_URL}/${id}`, data);
            return response.data;
        }
        catch (error) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || "Failed to update registration");
        }
    },
    async getStats(startDate, endDate) {
        var _a, _b;
        try {
            const registrations = await this.getAll();
            // Filter by date range if provided
            const filteredRegistrations = startDate && endDate
                ? registrations.filter(reg => {
                    const date = new Date(reg.registration_date || '');
                    return date >= new Date(startDate) && date <= new Date(endDate);
                })
                : registrations;
            // Calculate totals
            const stats = {
                totalRegistered: filteredRegistrations.length,
                totalPending: filteredRegistrations.filter(r => r.status === 'pending').length,
                totalAccepted: filteredRegistrations.filter(r => r.status === 'approved').length,
                totalRejected: filteredRegistrations.filter(r => r.status === 'rejected').length,
                metrics: []
            };
            // Group by date and status for metrics
            const groupedByDate = filteredRegistrations.reduce((acc, reg) => {
                var _a;
                const date = ((_a = reg.registration_date) === null || _a === void 0 ? void 0 : _a.split('T')[0]) || '';
                if (!acc[date]) {
                    acc[date] = {
                        pending: 0,
                        approved: 0,
                        rejected: 0
                    };
                }
                acc[date][reg.status]++;
                return acc;
            }, {});
            // Convert to metrics array
            stats.metrics = Object.entries(groupedByDate).flatMap(([date, statuses]) => Object.entries(statuses).map(([status, count]) => ({
                date,
                count,
                status: status
            })));
            return stats;
        }
        catch (error) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || "Failed to fetch registration statistics");
        }
    }
};
export default registrationService;
