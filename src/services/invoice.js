/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-console */
import axios from 'axios';
// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
/**
 * Get all invoices with optional filters
 * @param filters Optional filter parameters
 * @returns Array of invoices
 */
export const getInvoices = async (filters) => {
    var _a, _b;
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        // Handle array values (like multiple statuses)
                        value.forEach(v => queryParams.append(key, v.toString()));
                    }
                    else {
                        queryParams.append(key, value.toString());
                    }
                }
            });
        }
        const response = await axios.get(`${API_URL}/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch invoices');
        }
        throw error;
    }
};
/**
 * Get a single invoice by ID with full details
 * @param id Invoice ID
 * @returns Invoice with full details
 */
export const getInvoice = async (id) => {
    var _a, _b;
    try {
        const response = await axios.get(`${API_URL}/invoices/${id}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to fetch invoice with ID ${id}`);
        }
        throw error;
    }
};
/**
 * Create a new invoice
 * @param invoice Invoice data
 * @returns Created invoice
 */
export const createInvoice = async (invoice) => {
    var _a, _b;
    try {
        const response = await axios.post(`${API_URL}/invoices`, invoice);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to create invoice');
        }
        throw error;
    }
};
/**
 * Update an existing invoice
 * @param id Invoice ID
 * @param invoice Updated invoice data
 * @returns Updated invoice
 */
export const updateInvoice = async (id, invoice) => {
    var _a, _b;
    try {
        const response = await axios.put(`${API_URL}/invoices/${id}`, invoice);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to update invoice with ID ${id}`);
        }
        throw error;
    }
};
/**
 * Delete an invoice
 * @param id Invoice ID
 * @returns Success message
 */
export const deleteInvoice = async (id) => {
    var _a, _b;
    try {
        const response = await axios.delete(`${API_URL}/invoices/${id}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to delete invoice with ID ${id}`);
        }
        throw error;
    }
};
/**
 * Mark an invoice as sent
 * @param id Invoice ID
 * @returns Updated invoice
 */
export const markInvoiceAsSent = async (id) => {
    var _a, _b;
    try {
        const response = await axios.put(`${API_URL}/invoices/${id}/mark-sent`, {});
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to mark invoice ${id} as sent`);
        }
        throw error;
    }
};
/**
 * Mark an invoice as paid
 * @param id Invoice ID
 * @param paymentDetails Payment details
 * @returns Updated invoice
 */
export const markInvoiceAsPaid = async (id, paymentDetails) => {
    var _a, _b;
    try {
        const response = await axios.put(`${API_URL}/invoices/${id}/mark-paid`, paymentDetails);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to mark invoice ${id} as paid`);
        }
        throw error;
    }
};
/**
 * Cancel an invoice
 * @param id Invoice ID
 * @param reason Reason for cancellation
 * @returns Updated invoice
 */
export const cancelInvoice = async (id, reason) => {
    var _a, _b;
    try {
        const response = await axios.put(`${API_URL}/invoices/${id}/cancel`, { reason });
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to cancel invoice ${id}`);
        }
        throw error;
    }
};
/**
 * Send an invoice to the student/parent via email
 * @param id Invoice ID
 * @param emailOptions Email options
 * @returns Success message
 */
export const sendInvoiceByEmail = async (id, emailOptions) => {
    var _a, _b;
    try {
        const response = await axios.post(`${API_URL}/invoices/${id}/send-email`, emailOptions || {});
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to send invoice ${id} by email`);
        }
        throw error;
    }
};
/**
 * Get URL for invoice PDF
 * @param id Invoice ID
 * @returns URL to invoice PDF
 */
export const getInvoicePdfUrl = (id) => {
    return `${API_URL}/invoices/${id}/pdf`;
};
/**
 * Generate and download invoice PDF
 * @param id Invoice ID
 */
export const downloadInvoicePdf = async (id) => {
    try {
        // Create a direct link to the PDF and trigger download
        const link = document.createElement('a');
        link.href = getInvoicePdfUrl(id);
        link.setAttribute('download', `invoice-${id}.pdf`);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    catch (error) {
        console.error('Error downloading invoice PDF:', error);
        throw new Error('Failed to download invoice PDF');
    }
};
/**
 * Trigger bulk tuition invoice generation
 * @returns Response message
 */
export const generateTuitionInvoices = async () => {
    var _a, _b;
    try {
        const response = await axios.post(`${API_URL}/invoices/generate-tuition`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to generate tuition invoices');
        }
        throw error;
    }
};
/**
 * Get invoices summary - counts by status
 * @param schoolId Optional school ID
 * @returns Invoice summary statistics
 */
export const getInvoicesSummary = async (schoolId) => {
    var _a, _b;
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (schoolId) {
            queryParams.append('school_id', schoolId.toString());
        }
        const response = await axios.get(`${API_URL}/invoices/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch invoices summary');
        }
        throw error;
    }
};
export default {
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    markInvoiceAsSent,
    markInvoiceAsPaid,
    cancelInvoice,
    sendInvoiceByEmail,
    getInvoicePdfUrl,
    downloadInvoicePdf,
    getInvoicesSummary,
    generateTuitionInvoices
};
