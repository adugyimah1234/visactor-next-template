import axios from 'axios';
import { ReceiptType, Receipt, ReceiptWithDetails } from '../types/fee';
import { format } from 'date-fns';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Filter parameters for receipt queries
export interface ReceiptFilterParams {
  student_id?: number;
  payment_id?: number;
  receipt_type?: ReceiptType;
  date_from?: string;
  date_to?: string;
  school_id?: number;
  class_id?: number;
  search?: string;
}

// Receipt template options for customization
export interface ReceiptTemplateOptions {
  logo_url?: string;
  school_name?: string;
  school_address?: string;
  school_contact?: string;
  show_signature_line?: boolean;
  additional_notes?: string;
  custom_footer?: string;
  include_payment_details?: boolean;
  include_student_details?: boolean;
}

// Formatted receipt for display
export interface FormattedReceipt extends ReceiptWithDetails {
  formatted_date: string;
  formatted_amount: string;
  receipt_number: string; // formatted as R-000123
  student_details: {
    name: string;
    admission_number?: string;
    class?: string;
    grade_level?: string;
  };
  payment_details?: {
    method?: string;
    date?: string;
    reference?: string;
  };
  school_details?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
}

/**
 * Get all receipts with optional filters
 * @param filters Optional filter parameters
 * @returns Array of receipts
 */
export const getReceipts = async (filters?: ReceiptFilterParams): Promise<Receipt[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await axios.get<Receipt[]>(
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
 * Get a receipt by ID with full details
 * @param id Receipt ID
 * @returns Receipt with details
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
 * Format a receipt for display and printing
 * @param receipt Receipt to format
 * @returns Formatted receipt
 */
export const formatReceipt = (receipt: ReceiptWithDetails): FormattedReceipt => {
  // Format date
  const dateIssued = new Date(receipt.date_issued);
  const formattedDate = format(dateIssued, 'MMMM d, yyyy');
  
  // Format amount
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  const formattedAmount = formatter.format(receipt.amount);
  
  // Format receipt number
  const receiptNumber = `R-${receipt.id.toString().padStart(6, '0')}`;
  
  // Organize student details
  const studentDetails = {
    name: receipt.student_name || '',
    admission_number: receipt.student_admission_number,
    class: receipt.class_name,
    grade_level: receipt.grade_level
  };
  
  // Organize payment details if available
  const paymentDetails = receipt.payment_details ? {
    method: receipt.payment_details.method,
    date: receipt.payment_details.date ? format(new Date(receipt.payment_details.date), 'MMMM d, yyyy') : undefined,
    reference: receipt.payment_details.reference
  } : undefined;
  
  // Organize school details
  const schoolDetails = {
    name: receipt.school_name || 'School Management System',
    address: receipt.school_address,
    phone: receipt.school_phone,
    email: receipt.school_email,
    logo_url: receipt.logo_url
  };
  
  return {
    ...receipt,
    formatted_date: formattedDate,
    formatted_amount: formattedAmount,
    receipt_number: receiptNumber,
    student_details: studentDetails,
    payment_details: paymentDetails,
    school_details: schoolDetails
  };
};

/**
 * Generate a new receipt from a payment
 * @param paymentId ID of the payment to generate receipt for
 * @returns Generated receipt
 */
export const generateReceiptFromPayment = async (paymentId: number): Promise<ReceiptWithDetails> => {
  try {
    const response = await axios.post<ReceiptWithDetails>(`${API_URL}/receipts/generate/${paymentId}`, {});
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to generate receipt for payment ID ${paymentId}`);
    }
    throw error;
  }
};

/**
 * Create a receipt manually
 * @param receiptData Receipt data
 * @returns Created receipt
 */
export const createReceipt = async (receiptData: {
  student_id: number;
  payment_id?: number;
  receipt_type: ReceiptType;
  amount: number;
  date_issued?: string;
  venue?: string;
  logo_url?: string;
  exam_date?: string;
  class_id?: number;
  school_id?: number;
}): Promise<ReceiptWithDetails> => {
  try {
    const response = await axios.post<ReceiptWithDetails>(`${API_URL}/receipts`, receiptData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to create receipt');
    }
    throw error;
  }
};

/**
 * Get URL for a printable receipt
 * @param id Receipt ID
 * @returns URL for printable receipt
 */
export const getPrintableReceiptUrl = (id: number, options?: ReceiptTemplateOptions): string => {
  // Build query parameters for template options
  const queryParams = new URLSearchParams();
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          queryParams.append(key, value ? 'true' : 'false');
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
  }
  
  return `${API_URL}/receipts/${id}/print${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
};

/**
 * Open a receipt in a printable format in a new window
 * @param id Receipt ID
 * @param options Optional template customization options
 */
export const openPrintableReceipt = (id: number, options?: ReceiptTemplateOptions): void => {
  const url = getPrintableReceiptUrl(id, options);
  window.open(url, `receipt_${id}`, 'width=800,height=600');
};

/**
 * Print a receipt directly
 * @param id Receipt ID
 * @param options Optional template customization options
 */
export const printReceipt = (id: number, options?: ReceiptTemplateOptions): void => {
  const url = getPrintableReceiptUrl(id, options);
  
  // Create an iframe to load the receipt for printing
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  
  // Add event listener to trigger print when the iframe loads
  iframe.onload = () => {
    try {
      iframe.contentWindow?.print();
      // Remove the iframe after printing (after a delay)
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } catch (error) {
      console.error('Error printing receipt:', error);
      // If printing failed, open in a new window as fallback
      openPrintableReceipt(id, options);
      document.body.removeChild(iframe);
    }
  };
  
  // Add iframe to the document to start loading
  document.body.appendChild(iframe);
};

/**
 * Get URL for receipt PDF download
 * @param id Receipt ID
 * @returns URL for PDF download
 */
export const getReceiptPdfUrl = (id: number): string => {
  return `${API_URL}/receipts/${id}/pdf`;
};

/**
 * Download a receipt as PDF
 * @param id Receipt ID
 */
export const downloadReceiptPdf = async (id: number): Promise<void> => {
  try {
    // Create a direct link to the PDF and trigger download
    const link = document.createElement('a');
    link.href = getReceiptPdfUrl(id);
    link.setAttribute('download', `receipt-${id}.pdf`);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading receipt PDF:', error);
    throw new Error('Failed to download receipt PDF');
  }
};

/**
 * Get student receipt history
 * @param studentId Student ID
 * @returns Array of receipts
 */
export const getStudentReceiptHistory = async (studentId: number): Promise<ReceiptWithDetails[]> => {
  try {
    const response = await axios.get<ReceiptWithDetails[]>(`${API_URL}/receipts/student/${studentId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch receipt history for student ID ${studentId}`);
    }
    throw error;
  }
};

/**
 * Email a receipt to specified recipients
 * @param id Receipt ID
 * @param emailOptions Email options
 * @returns Success message
 */
export const emailReceipt = async (
  id: number,
  emailOptions: {
    to: string[];
    cc?: string[];
    subject?: string;
    message?: string;
  }
): Promise<{ message: string }> => {
  try {
    const response = await axios.post<{ message: string }>(
      `${API_URL}/receipts/${id}/email`,
      emailOptions
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to email receipt ID ${id}`);
    }
    throw error;
  }
};

/**
 * Void a receipt
 * @param id Receipt ID
 * @param reason Reason for voiding
 * @returns Success message
 */
export const voidReceipt = async (id: number, reason: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post<{ message: string }>(
      `${API_URL}/receipts/${id}/void`,
      { reason }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to void receipt ID ${id}`);
    }
    throw error;
  }
};

// Export all functions
export default {
  getReceipts,
  getReceipt,
  formatReceipt,
  generateReceiptFromPayment,
  createReceipt,
  getPrintableReceiptUrl,
  openPrintableReceipt,
  printReceipt,
  getReceiptPdfUrl,
  downloadReceiptPdf,
  getStudentReceiptHistory,
  emailReceipt,
  voidReceipt
};

