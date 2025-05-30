import axios from 'axios';
import { 
  Fee, 
  FeeWithDetails,
  Payment,
  PaymentWithDetails,
  Receipt,
  ReceiptWithDetails,
  CreateFeePayload,
  UpdateFeePayload,
  CreatePaymentPayload,
  CreateReceiptPayload,
  FeeResponse,
  PaymentResponse,
  ReceiptResponse,
  FeeQueryParams,
  PaymentQueryParams,
  ReceiptQueryParams
} from '../types/fee';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Get all fees with optional filters
 * @param params Optional query parameters to filter fees
 * @returns Array of fees
 */
export const getAllFees = async (params?: FeeQueryParams): Promise<FeeWithDetails[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await axios.get<FeeWithDetails[]>(
      `${API_URL}/fees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch fees');
    }
    throw error;
  }
};

/**
 * Get a specific fee by category and class level
 * @param params Query parameters to find the specific fee
 * @returns Fee information
 */
export const getFee = async (params: FeeQueryParams): Promise<Fee> => {
  try {
    if (!params.category || !params.classLevel) {
      throw new Error('Category and class level are required to get a specific fee');
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await axios.get<Fee>(`${API_URL}/fees/get?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch fee details');
    }
    throw error;
  }
};

/**
 * Create a new fee structure
 * @param feeData Fee data to create
 * @returns Created fee response
 */
export const createFee = async (feeData: CreateFeePayload): Promise<FeeResponse> => {
  try {
    const response = await axios.post<FeeResponse>(`${API_URL}/fees`, feeData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to create fee');
    }
    throw error;
  }
};

/**
 * Update an existing fee
 * @param id Fee ID to update
 * @param feeData Updated fee data
 * @returns Success message
 */
export const updateFee = async (id: number, feeData: UpdateFeePayload): Promise<{ message: string }> => {
  try {
    const response = await axios.put<{ message: string }>(`${API_URL}/fees/${id}`, feeData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to update fee with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Delete a fee structure
 * @param id Fee ID to delete
 * @returns Success message
 */
export const deleteFee = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await axios.delete<{ message: string }>(`${API_URL}/fees/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to delete fee with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Get all payments with optional filters
 * @param params Optional query parameters to filter payments
 * @returns Array of payments
 */
export const getPayments = async (params?: PaymentQueryParams): Promise<PaymentWithDetails[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await axios.get<PaymentWithDetails[]>(
      `${API_URL}/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch payments');
    }
    throw error;
  }
};

/**
 * Get a specific payment by ID
 * @param id Payment ID
 * @returns Payment information with details
 */
export const getPayment = async (id: number): Promise<PaymentWithDetails> => {
  try {
    const response = await axios.get<PaymentWithDetails>(`${API_URL}/payments/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch payment with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Create a new payment record
 * @param paymentData Payment data to create
 * @returns Created payment response
 */
export const createPayment = async (paymentData: CreatePaymentPayload): Promise<PaymentResponse> => {
  try {
    const response = await axios.post<PaymentResponse>(`${API_URL}/payments`, paymentData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to create payment');
    }
    throw error;
  }
};

/**
 * Get all receipts with optional filters
 * @param params Optional query parameters to filter receipts
 * @returns Array of receipts
 */
export const getReceipts = async (params?: ReceiptQueryParams): Promise<ReceiptWithDetails[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await axios.get<ReceiptWithDetails[]>(
      `${API_URL}/receipts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch receipts');
    }
    throw error;
  }
};

/**
 * Get a specific receipt by ID
 * @param id Receipt ID
 * @returns Receipt information with details
 */
export const getReceipt = async (id: number): Promise<ReceiptWithDetails> => {
  try {
    const response = await axios.get<ReceiptWithDetails>(`${API_URL}/receipts/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch receipt with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Create a new receipt
 * @param receiptData Receipt data to create
 * @returns Created receipt response
 */
export const createReceipt = async (receiptData: CreateReceiptPayload): Promise<ReceiptResponse> => {
  try {
    const response = await axios.post<ReceiptResponse>(`${API_URL}/receipts`, receiptData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to create receipt');
    }
    throw error;
  }
};

/**
 * Get outstanding fees for a student
 * @param studentId Student ID
 * @returns Array of outstanding fees
 */
export const getOutstandingFees = async (studentId: number): Promise<FeeWithDetails[]> => {
  try {
    const response = await axios.get<FeeWithDetails[]>(`${API_URL}/fees/outstanding/${studentId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch outstanding fees for student ${studentId}`);
    }
    throw error;
  }
};

/**
 * Get payment history for a student
 * @param studentId Student ID
 * @returns Array of payments with details
 */
export const getStudentPaymentHistory = async (studentId: number): Promise<PaymentWithDetails[]> => {
  try {
    const response = await axios.get<PaymentWithDetails[]>(`${API_URL}/payments/student/${studentId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch payment history for student ${studentId}`);
    }
    throw error;
  }
};

export default {
  getAllFees,
  getFee,
  createFee,
  updateFee,
  deleteFee,
  getPayments,
  getPayment,
  createPayment,
  getReceipts,
  getReceipt,
  createReceipt,
  getOutstandingFees,
  getStudentPaymentHistory
};

