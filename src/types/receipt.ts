export interface Receipt {
  id: number;
  student_id: number;
  payment_id?: number | null;
  receipt_type: 'registration' | 'levy' | 'textBooks' | 'exerciseBooks' | 'furniture' | 'jersey_crest';
  amount: number;
  issued_by?: number;
  date_issued: string;
  venue?: string;
  logo_url?: string;
  exam_date?: string;
  class_id?: number;
  registration_id: number;
  fee_id?: number;
  school_id?: number;
  student_name?: string;
  class_name?: string;
  issued_by_name?: string;
  fullName?: string;
  school_name?: string;
  payment_date?: string;
   receipt_items: {
    id: number;
    receipt_type: string;
    amount: number;
  }[];
  payment_type?: string;
  payment_method?: string;
  registration_first_name?: string;
  registration_last_name?: string;
  amount_paid?: number;
}

export interface ReceiptFilters {
  search?: string;
  receipt_type?: string;
  date_from?: string;
  date_to?: string;
  student_id?: number;
  school_id?: number;
}

export interface CreateReceiptPayload {
  student_id: number;
  payment_id?: number;
  fee_id: number;
  receipt_type: string;
  amount: number;
  date_issued?: string;
  venue?: string;
  logo_url?: string;
  exam_date?: string;
  class_id?: number;
  school_id?: number;
}