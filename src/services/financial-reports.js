var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { format, subDays, subMonths, startOfMonth, getYear } from 'date-fns';
// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
/**
 * Generate an income report
 * @param params Report parameters
 * @returns Income report data
 */
export const generateIncomeReport = async (params) => {
    var _a, _b;
    try {
        // Convert parameters to query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
        const response = await axios.get(`${API_URL}/reports/income?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to generate income report');
        }
        throw error;
    }
};
/**
 * Generate an outstanding payments report
 * @param params Report parameters
 * @returns Outstanding payments report data
 */
export const generateOutstandingPaymentsReport = async (params) => {
    var _a, _b;
    try {
        // Convert parameters to query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
        const response = await axios.get(`${API_URL}/reports/outstanding-payments?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to generate outstanding payments report');
        }
        throw error;
    }
};
/**
 * Generate a fee collection report
 * @param params Report parameters
 * @returns Fee collection report data
 */
export const generateFeeCollectionReport = async (params) => {
    var _a, _b;
    try {
        // Convert parameters to query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
        const response = await axios.get(`${API_URL}/reports/fee-collection?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to generate fee collection report');
        }
        throw error;
    }
};
/**
 * Generate a student financial statement
 * @param params Student statement parameters
 * @returns Student financial statement data
 */
export const generateStudentFinancialStatement = async (params) => {
    var _a, _b;
    try {
        if (!params.student_id) {
            throw new Error('Student ID is required');
        }
        // Convert parameters to query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
        const response = await axios.get(`${API_URL}/reports/student-statement?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to generate student financial statement');
        }
        throw error;
    }
};
/**
 * Generate a class financial summary report
 * @param params Class summary parameters
 * @returns Class financial summary data
 */
export const generateClassFinancialSummary = async (params) => {
    var _a, _b;
    try {
        if (!params.class_id && !params.grade_level) {
            throw new Error('Either class ID or grade level is required');
        }
        // Convert parameters to query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
        const response = await axios.get(`${API_URL}/reports/class-summary?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to generate class financial summary');
        }
        throw error;
    }
};
/**
 * Generate a receivables aging report
 * @param params Aging report parameters
 * @returns Receivables aging report data
 */
export const generateReceivablesAgingReport = async (params) => {
    var _a, _b;
    try {
        // Convert parameters to query string
        const queryParams = new URLSearchParams();
        // Handle special case for aging intervals array
        if (params.aging_intervals && Array.isArray(params.aging_intervals)) {
            params.aging_intervals.forEach(interval => {
                queryParams.append('aging_intervals', interval.toString());
            });
            // Remove from params to avoid double processing
            const { aging_intervals } = params, restParams = __rest(params, ["aging_intervals"]);
            params = restParams;
        }
        // Process remaining parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
        const response = await axios.get(`${API_URL}/reports/receivables-aging?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to generate receivables aging report');
        }
        throw error;
    }
};
/**
 * Export a report in the specified format
 * @param reportType The type of report to export
 * @param params Report parameters
 * @param format Export format
 * @returns URL to download the exported report
 */
export const exportReport = async (reportType, params, format) => {
    var _a, _b;
    try {
        // Convert parameters to query string
        const queryParams = new URLSearchParams();
        // Add report type and format
        queryParams.append('report_type', reportType);
        queryParams.append('format', format);
        // Process remaining parameters, handling arrays properly
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v.toString()));
                }
                else {
                    queryParams.append(key, value.toString());
                }
            }
        });
        const response = await axios.get(`${API_URL}/reports/export?${queryParams.toString()}`);
        return response.data.export_url;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to export ${reportType} report`);
        }
        throw error;
    }
};
/**
 * Download a report directly
 * @param reportType The type of report to download
 * @param params Report parameters
 * @param format Export format
 */
export const downloadReport = async (reportType, params, format) => {
    try {
        const exportUrl = await exportReport(reportType, params, format);
        // Create a direct link and trigger download
        const link = document.createElement('a');
        link.href = exportUrl;
        link.setAttribute('download', `${reportType}_report.${format === 'excel' ? 'xlsx' : format}`);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    catch (error) {
        console.error(`Error downloading ${reportType} report:`, error);
        throw new Error(`Failed to download ${reportType} report`);
    }
};
// ------- Utility Functions for Report Formatting -------
/**
 * Format currency values consistently
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};
/**
 * Format percentage values consistently
 * @param value Percentage value (0-100)
 * @param decimalPlaces Number of decimal places to show
 * @returns Formatted percentage string
 */
export const formatPercentage = (value, decimalPlaces = 1) => {
    return `${value.toFixed(decimalPlaces)}%`;
};
/**
 * Format date values consistently
 * @param date Date to format
 * @param formatString Optional format string
 * @returns Formatted date string
 */
export const formatReportDate = (date, formatString = 'MMMM d, yyyy') => {
    return format(typeof date === 'string' ? new Date(date) : date, formatString);
};
/**
 * Get predefined date range for report periods
 * @param period Report period
 * @returns Object with start and end dates
 */
export const getDateRangeForPeriod = (period) => {
    const today = new Date();
    const end_date = format(today, 'yyyy-MM-dd');
    let start_date;
    switch (period) {
        case 'daily':
            start_date = format(today, 'yyyy-MM-dd');
            break;
        case 'weekly':
            start_date = format(subDays(today, 7), 'yyyy-MM-dd');
            break;
        case 'monthly':
            start_date = format(subMonths(today, 1), 'yyyy-MM-dd');
            break;
        case 'quarterly':
            start_date = format(subMonths(today, 3), 'yyyy-MM-dd');
            break;
        case 'yearly':
            start_date = format(subMonths(today, 12), 'yyyy-MM-dd');
            break;
        default:
            // Default to current month
            start_date = format(startOfMonth(today), 'yyyy-MM-dd');
    }
    return { start_date, end_date };
};
/**
 * Generate a friendly label for a date range
 * @param startDate Start date
 * @param endDate End date
 * @returns Friendly label (e.g., "May 2025", "Q2 2025", "May 15-30, 2025")
 */
export const generateDateRangeLabel = (startDate, endDate) => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    // Same day
    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
        return format(start, 'MMMM d, yyyy');
    }
    // Same month and year
    if (format(start, 'yyyy-MM') === format(end, 'yyyy-MM')) {
        return `${format(start, 'MMMM d')} - ${format(end, 'd')}, ${format(end, 'yyyy')}`;
    }
    // Same year
    if (getYear(start) === getYear(end)) {
        return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d')}, ${format(end, 'yyyy')}`;
    }
    // Different years
    return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
};
// Export all functions
export default {
    // Report generation functions
    generateIncomeReport,
    generateOutstandingPaymentsReport,
    generateFeeCollectionReport,
    generateStudentFinancialStatement,
    generateClassFinancialSummary,
    generateReceivablesAgingReport,
    // Export functions
    exportReport,
    downloadReport,
    // Utility functions
    formatCurrency,
    formatPercentage,
    formatReportDate,
    getDateRangeForPeriod,
    generateDateRangeLabel
};
