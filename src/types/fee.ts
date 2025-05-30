/**
 * Fee-related type definitions for the school management system
 */

// Fee types as defined in the database
export type FeeType = 'registration' | 'admission' | 'tuition' | 'exam';

// Base fee structure
export interface Fee {
  id: number;
  category_id: number;
  class_id: number;
  fee_type: FeeType;
  amount: number;
  description?: string;
  effective_date?: string;
  school_id?: number;
}

// Fee with related information (category and class names)
export interface FeeWithDetails extends Fee {
  category_name?: string;
  class_name?: string;
  school_name?: string;
}

// Payment record
export interface Payment {
  id: number;
  student_id: number;
  fee_id: number;
  amount_paid: number;
  payment_date: string;
  installment_number?: number;
  recorded_by?: number;
  school_id?: number;
}

// Payment with related information
export interface PaymentWithDetails extends Payment {
  student_name?: string;
  fee_type?: FeeType;
  fee_description?: string;
  recorded_by_name?: string;
  school_name?: string;
}

// Receipt types match fee types
export type ReceiptType = FeeType;

// Receipt record
export interface Receipt {
  id: number;
  student_id: number;
  payment_id?: number;
  receipt_type: ReceiptType;
  amount: number;
  issued_by?: number;
  date_issued: string;
  venue?: string;
  logo_url?: string;
  exam_date?: string;
  class_id?: number;
  school_id?: number;
}

// Receipt with related information
export interface ReceiptWithDetails extends Receipt {
  student_name?: string;
  payment_details?: Payment;
  issued_by_name?: string;
  class_name?: string;
  school_name?: string;
}

// Request payloads
export interface CreateFeePayload {
  category_id: number;
  class_id: number;
  fee_type: FeeType;
  amount: number;
  description?: string;
  effective_date?: string;
  school_id?: number;
}

export interface UpdateFeePayload {
  category_id?: number;
  class_id?: number;
  fee_type?: FeeType;
  amount?: number;
  description?: string;
  effective_date?: string;
  school_id?: number;
}

export interface CreatePaymentPayload {
  student_id: number;
  fee_id: number;
  amount_paid: number;
  payment_date?: string;
  installment_number?: number;
  school_id?: number;
}

export interface CreateReceiptPayload {
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
}

// API Response types
export interface FeeResponse {
  message: string;
  data: Fee;
}

export interface PaymentResponse {
  message: string;
  data: Payment;
}

export interface ReceiptResponse {
  message: string;
  data: Receipt;
}

// Query parameters
export interface FeeQueryParams {
  category?: string | number;
  classLevel?: string | number;
  school_id?: number;
  fee_type?: FeeType;
}

export interface PaymentQueryParams {
  student_id?: number;
  fee_id?: number;
  payment_date_from?: string;
  payment_date_to?: string;
  school_id?: number;
}

export interface ReceiptQueryParams {
  student_id?: number;
  payment_id?: number;
  receipt_type?: ReceiptType;
  date_from?: string;
  date_to?: string;
  school_id?: number;
}

