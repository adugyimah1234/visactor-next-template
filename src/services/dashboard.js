/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios';
// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
/**
 * Get financial summary data
 * @param schoolId Optional school ID to filter data
 * @param period Optional period to filter data (month/year or date range)
 * @returns Financial summary statistics
 */
export const getFinancialSummary = async (schoolId, period) => {
    var _a, _b;
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (schoolId) {
            queryParams.append('school_id', schoolId.toString());
        }
        if (period) {
            if (typeof period === 'string') {
                queryParams.append('period', period);
            }
            else {
                if (period.start)
                    queryParams.append('start_date', period.start);
                if (period.end)
                    queryParams.append('end_date', period.end);
            }
        }
        const response = await axios.get(`${API_URL}/dashboard/financial-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch financial summary');
        }
        throw error;
    }
};
/**
 * Get collection progress data
 * @param schoolId Optional school ID to filter data
 * @param period Optional period to filter data (month/year)
 * @returns Collection progress data
 */
export const getCollectionProgress = async (schoolId, period) => {
    var _a, _b;
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (schoolId) {
            queryParams.append('school_id', schoolId.toString());
        }
        if (period) {
            queryParams.append('period', period);
        }
        const response = await axios.get(`${API_URL}/dashboard/collection-progress${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch collection progress');
        }
        throw error;
    }
};
/**
 * Get recent transactions
 * @param limit Number of transactions to retrieve (default 10)
 * @param schoolId Optional school ID to filter transactions
 * @returns Array of recent transactions
 */
export const getRecentTransactions = async (limit = 10, schoolId) => {
    var _a, _b;
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('limit', limit.toString());
        if (schoolId) {
            queryParams.append('school_id', schoolId.toString());
        }
        const response = await axios.get(`${API_URL}/dashboard/recent-transactions?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch recent transactions');
        }
        throw error;
    }
};
/**
 * Get complete financial overview with all dashboard data
 * @param schoolId Optional school ID to filter data
 * @param period Optional period to filter data (month/year)
 * @returns Complete financial overview data
 */
export const getFinancialOverview = async (schoolId, period) => {
    var _a, _b;
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (schoolId) {
            queryParams.append('school_id', schoolId.toString());
        }
        if (period) {
            queryParams.append('period', period);
        }
        const response = await axios.get(`${API_URL}/dashboard/financial-overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch financial overview');
        }
        throw error;
    }
};
/**
 * Get monthly fee collection data for charts
 * @param year Year to get data for (defaults to current year)
 * @param schoolId Optional school ID to filter data
 * @returns Monthly fee collection data for charting
 */
export const getMonthlyFeeCollectionData = async (year, schoolId) => {
    var _a, _b;
    try {
        // Default to current year if not provided
        const targetYear = year || new Date().getFullYear();
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('year', targetYear.toString());
        if (schoolId) {
            queryParams.append('school_id', schoolId.toString());
        }
        const response = await axios.get(`${API_URL}/dashboard/monthly-collection?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch monthly collection data');
        }
        throw error;
    }
};
/**
 * Get fee type distribution data for charts
 * @param schoolId Optional school ID to filter data
 * @param period Optional period to filter data (month/year or date range)
 * @returns Fee type distribution data for charting
 */
export const getFeeTypeDistribution = async (schoolId, period) => {
    var _a, _b;
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (schoolId) {
            queryParams.append('school_id', schoolId.toString());
        }
        if (period) {
            if (typeof period === 'string') {
                queryParams.append('period', period);
            }
            else {
                if (period.start)
                    queryParams.append('start_date', period.start);
                if (period.end)
                    queryParams.append('end_date', period.end);
            }
        }
        const response = await axios.get(`${API_URL}/dashboard/fee-distribution${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch fee type distribution');
        }
        throw error;
    }
};
// Export all functions
export default {
    getFinancialSummary,
    getCollectionProgress,
    getRecentTransactions,
    getFinancialOverview,
    getMonthlyFeeCollectionData,
    getFeeTypeDistribution
};
