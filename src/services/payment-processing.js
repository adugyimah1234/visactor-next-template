/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
/**
 * Get all payments with optional filters
 * @param filters Optional filter parameters
 * @returns Array of payments
 */
export const getPayments = async (filters) => {
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
        const response = await axios.get(`${API_URL}/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch payments');
        }
        throw error;
    }
};
/**
 * Get a single payment by ID with full details
 * @param id Payment ID
 * @returns Payment with full details
 */
export const getPayment = async (id) => {
    var _a, _b;
    try {
        const response = await axios.get(`${API_URL}/payments/${id}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to fetch payment with ID ${id}`);
        }
        throw error;
    }
};
/**
 * Create a new payment
 * @param payment Payment data
 * @returns Created payment
 */
export const createPayment = async (payment) => {
    var _a, _b;
    try {
        const response = await axios.post(`${API_URL}/payments`, payment);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to create payment');
        }
        throw error;
    }
};
/**
 * Get payment transactions history
 * @param paymentId Payment ID
 * @returns Array of payment transactions
 */
export const getPaymentTransactions = async (paymentId) => {
    var _a, _b;
    try {
        const response = await axios.get(`${API_URL}/payments/${paymentId}/transactions`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to fetch transactions for payment ID ${paymentId}`);
        }
        throw error;
    }
};
/**
 * Process a refund for a payment
 * @param paymentId Payment ID
 * @param refundData Refund details
 * @returns Updated payment with refund details
 */
export const refundPayment = async (paymentId, refundData) => {
    var _a, _b;
    try {
        const response = await axios.post(`${API_URL}/payments/${paymentId}/refund`, refundData);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to process refund for payment ID ${paymentId}`);
        }
        throw error;
    }
};
/**
 * Void a payment
 * @param paymentId Payment ID
 * @param reason Reason for voiding the payment
 * @returns Updated payment
 */
export const voidPayment = async (paymentId, reason) => {
    var _a, _b;
    try {
        const response = await axios.post(`${API_URL}/payments/${paymentId}/void`, { reason });
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to void payment ID ${paymentId}`);
        }
        throw error;
    }
};
/**
 * Adjust a payment amount
 * @param paymentId Payment ID
 * @param adjustmentData Adjustment details
 * @returns Updated payment
 */
export const adjustPayment = async (paymentId, adjustmentData) => {
    var _a, _b;
    try {
        const response = await axios.post(`${API_URL}/payments/${paymentId}/adjust`, adjustmentData);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to adjust payment ID ${paymentId}`);
        }
        throw error;
    }
};
/**
 * Get payment history for a student
 * @param studentId Student ID
 * @returns Array of payments with details
 */
export const getStudentPaymentHistory = async (studentId) => {
    var _a, _b;
    try {
        const response = await axios.get(`${API_URL}/payments/student/${studentId}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to fetch payment history for student ID ${studentId}`);
        }
        throw error;
    }
};
/**
 * Generate receipt for a payment
 * @param paymentId Payment ID
 * @returns Receipt details
 */
export const generateReceipt = async (paymentId) => {
    var _a, _b;
    try {
        const response = await axios.post(`${API_URL}/payments/${paymentId}/generate-receipt`, {});
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || `Failed to generate receipt for payment ID ${paymentId}`);
        }
        throw error;
    }
};
/**
 * Process a bulk payment (multiple fees in one payment)
 * @param bulkPaymentData Bulk payment data
 * @returns Created payments
 */
export const processBulkPayment = async (bulkPaymentData) => {
    var _a, _b;
    try {
        const response = await axios.post(`${API_URL}/payments/bulk`, bulkPaymentData);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to process bulk payment');
        }
        throw error;
    }
};
/**
 * Get payment methods available in the system
 * @returns Array of available payment methods
 */
export const getPaymentMethods = async () => {
    var _a, _b;
    try {
        const response = await axios.get(`${API_URL}/payment-methods`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to fetch payment methods');
        }
        throw error;
    }
};
export default {
    getPayments,
    getPayment,
    createPayment,
    getPaymentTransactions,
    refundPayment,
    voidPayment,
    adjustPayment,
    getStudentPaymentHistory,
    generateReceipt,
    processBulkPayment,
    getPaymentMethods
};
