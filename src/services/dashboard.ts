/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Types for dashboard data
export interface FinancialSummary {
  totalCollections: number;
  totalCollectionsChange: number;
  pendingPayments: number;
  pendingPaymentsChange: number;
  outstandingBalance: number;
  outstandingBalanceChange: number;
  overduePayments: number;
  overduePaymentsChange: number;
}

export interface CollectionProgress {
  target: number;
  collected: number;
  remaining: number;
  percentage: number;
  period: string; // e.g., 'May 2025', 'Q2 2025', etc.
}

export interface Transaction {
  id: string;
  student_id: number;
  student_name: string;
  amount: number;
  type: 'payment' | 'pending' | 'overdue' | 'refund';
  date: string;
  receipt_id?: number;
  payment_id?: number;
  fee_type?: string;
}

export interface FinancialOverview {
  summary: FinancialSummary;
  collectionProgress: CollectionProgress;
  recentTransactions: Transaction[];
}

/**
 * Get financial summary data
 * @param schoolId Optional school ID to filter data
 * @param period Optional period to filter data (month/year or date range)
 * @returns Financial summary statistics
 */
export const getFinancialSummary = async (
  schoolId?: number,
  period?: { start?: string; end?: string } | string
): Promise<FinancialSummary> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (schoolId) {
      queryParams.append('school_id', schoolId.toString());
    }
    
    if (period) {
      if (typeof period === 'string') {
        queryParams.append('period', period);
      } else {
        if (period.start) queryParams.append('start_date', period.start);
        if (period.end) queryParams.append('end_date', period.end);
      }
    }
    
    const response = await axios.get<FinancialSummary>(
      `${API_URL}/dashboard/financial-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch financial summary');
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
export const getCollectionProgress = async (
  schoolId?: number,
  period?: string
): Promise<CollectionProgress> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (schoolId) {
      queryParams.append('school_id', schoolId.toString());
    }
    
    if (period) {
      queryParams.append('period', period);
    }
    
    const response = await axios.get<CollectionProgress>(
      `${API_URL}/dashboard/collection-progress${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch collection progress');
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
export const getRecentTransactions = async (
  limit: number = 10,
  schoolId?: number
): Promise<Transaction[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    queryParams.append('limit', limit.toString());
    
    if (schoolId) {
      queryParams.append('school_id', schoolId.toString());
    }
    
    const response = await axios.get<Transaction[]>(
      `${API_URL}/dashboard/recent-transactions?${queryParams.toString()}`
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch recent transactions');
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
export const getFinancialOverview = async (
  schoolId?: number,
  period?: string
): Promise<FinancialOverview> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (schoolId) {
      queryParams.append('school_id', schoolId.toString());
    }
    
    if (period) {
      queryParams.append('period', period);
    }
    
    const response = await axios.get<FinancialOverview>(
      `${API_URL}/dashboard/financial-overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch financial overview');
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
export const getMonthlyFeeCollectionData = async (
  year?: number,
  schoolId?: number
): Promise<{ month: string; collected: number; target: number }[]> => {
  try {
    // Default to current year if not provided
    const targetYear = year || new Date().getFullYear();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    queryParams.append('year', targetYear.toString());
    
    if (schoolId) {
      queryParams.append('school_id', schoolId.toString());
    }
    
    const response = await axios.get<{ month: string; collected: number; target: number }[]>(
      `${API_URL}/dashboard/monthly-collection?${queryParams.toString()}`
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch monthly collection data');
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
export const getFeeTypeDistribution = async (
  schoolId?: number,
  period?: { start?: string; end?: string } | string
): Promise<{ feeType: string; amount: number; percentage: number }[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (schoolId) {
      queryParams.append('school_id', schoolId.toString());
    }
    
    if (period) {
      if (typeof period === 'string') {
        queryParams.append('period', period);
      } else {
        if (period.start) queryParams.append('start_date', period.start);
        if (period.end) queryParams.append('end_date', period.end);
      }
    }
    
    const response = await axios.get<{ feeType: string; amount: number; percentage: number }[]>(
      `${API_URL}/dashboard/fee-distribution${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch fee type distribution');
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

