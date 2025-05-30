/**
 * Notification Service
 * 
 * Handles all notification-related operations for the fee management system,
 * including payment reminders, overdue notices, and receipt confirmations.
 */

import axios from 'axios';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Notification types
export type NotificationType = 
  | 'payment_reminder'       // Reminder for upcoming payments
  | 'payment_confirmation'   // Confirmation of received payment
  | 'payment_overdue'        // Notice for overdue payment
  | 'receipt_confirmation'   // Confirmation of receipt generation
  | 'invoice_created'        // Notification when invoice is created
  | 'fee_update'             // Notification about fee changes
  | 'statement_available'    // Notification about available financial statement
  | 'custom_message';        // Any custom message

// Delivery method types
export type DeliveryMethod = 'email' | 'sms' | 'in_app' | 'push' | 'whatsapp';

// Notification priority levels
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Notification status
export type NotificationStatus = 
  | 'pending'       // Waiting to be sent
  | 'sending'       // In process of being sent
  | 'sent'          // Successfully sent
  | 'delivered'     // Confirmed delivered to recipient
  | 'read'          // Confirmed read by recipient
  | 'failed'        // Failed to send
  | 'cancelled';    // Cancelled before sending

// Base notification interface
export interface Notification {
  id?: number;
  type: NotificationType;
  title: string;
  message: string;
  recipient_id: number;      // ID of the recipient (usually student or parent ID)
  recipient_type: 'student' | 'parent' | 'staff';
  delivery_methods: DeliveryMethod[];
  priority?: NotificationPriority;
  status?: NotificationStatus;
  scheduled_for?: string;    // ISO date string for scheduled notifications
  metadata?: Record<string, any>;
  created_at?: string;
  sent_at?: string;
  created_by?: number;
}

// Notification with delivery status details
export interface NotificationWithStatus extends Notification {
  delivery_status: {
    method: DeliveryMethod;
    status: NotificationStatus;
    sent_at?: string;
    error?: string;
  }[];
  recipient_name: string;
  recipient_contact?: {
    email?: string;
    phone?: string;
  };
  created_by_name?: string;
}

// Parameters for creating a notification
export interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  recipient_id: number;
  recipient_type: 'student' | 'parent' | 'staff';
  delivery_methods: DeliveryMethod[];
  priority?: NotificationPriority;
  scheduled_for?: Date | string;
  metadata?: Record<string, any>;
}

// Parameters for sending a payment reminder
export interface PaymentReminderParams {
  student_id: number;
  invoice_id?: number;
  fee_id?: number;
  amount?: number;
  due_date: Date | string;
  days_before_due?: number;
  include_parents?: boolean;
  delivery_methods?: DeliveryMethod[];
  message_template?: string;
}

// Parameters for sending a payment overdue notice
export interface PaymentOverdueParams {
  student_id: number;
  invoice_id?: number;
  fee_id?: number;
  amount?: number;
  due_date: Date | string;
  days_overdue?: number;
  include_parents?: boolean;
  delivery_methods?: DeliveryMethod[];
  message_template?: string;
  priority?: NotificationPriority;
}

// Parameters for sending a payment confirmation
export interface PaymentConfirmationParams {
  student_id: number;
  payment_id: number;
  amount: number;
  receipt_id?: number;
  include_parents?: boolean;
  delivery_methods?: DeliveryMethod[];
  message_template?: string;
}

// Parameters for sending a receipt confirmation
export interface ReceiptConfirmationParams {
  student_id: number;
  receipt_id: number;
  receipt_type: string;
  amount: number;
  include_parents?: boolean;
  delivery_methods?: DeliveryMethod[];
  include_pdf?: boolean;
  message_template?: string;
}

// Template variables for notification messages
export interface NotificationTemplateVars {
  [key: string]: string | number | boolean | undefined;
}

// Notification filter parameters
export interface NotificationFilterParams {
  recipient_id?: number;
  recipient_type?: 'student' | 'parent' | 'staff';
  type?: NotificationType | NotificationType[];
  status?: NotificationStatus | NotificationStatus[];
  delivery_method?: DeliveryMethod;
  start_date?: string;
  end_date?: string;
  search?: string;
}

/**
 * Create a new notification
 * @param params Notification parameters
 * @returns Created notification
 */
export const createNotification = async (
  params: CreateNotificationParams
): Promise<Notification> => {
  try {
    // Format date if it's a Date object
    if (params.scheduled_for instanceof Date) {
      params.scheduled_for = params.scheduled_for.toISOString();
    }
    
    const response = await axios.post<Notification>(`${API_URL}/notifications`, params);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to create notification');
    }
    throw error;
  }
};

/**
 * Send a payment reminder notification
 * @param params Payment reminder parameters
 * @returns Created notification
 */
export const sendPaymentReminder = async (
  params: PaymentReminderParams
): Promise<Notification> => {
  try {
    // Format date if it's a Date object
    if (params.due_date instanceof Date) {
      params.due_date = params.due_date.toISOString();
    }
    
    const response = await axios.post<Notification>(
      `${API_URL}/notifications/payment-reminder`,
      params
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to send payment reminder');
    }
    throw error;
  }
};

/**
 * Send a payment overdue notification
 * @param params Payment overdue parameters
 * @returns Created notification
 */
export const sendPaymentOverdueNotice = async (
  params: PaymentOverdueParams
): Promise<Notification> => {
  try {
    // Format date if it's a Date object
    if (params.due_date instanceof Date) {
      params.due_date = params.due_date.toISOString();
    }
    
    const response = await axios.post<Notification>(
      `${API_URL}/notifications/payment-overdue`,
      params
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to send payment overdue notice');
    }
    throw error;
  }
};

/**
 * Send a payment confirmation notification
 * @param params Payment confirmation parameters
 * @returns Created notification
 */
export const sendPaymentConfirmation = async (
  params: PaymentConfirmationParams
): Promise<Notification> => {
  try {
    const response = await axios.post<Notification>(
      `${API_URL}/notifications/payment-confirmation`,
      params
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to send payment confirmation');
    }
    throw error;
  }
};

/**
 * Send a receipt confirmation notification
 * @param params Receipt confirmation parameters
 * @returns Created notification
 */
export const sendReceiptConfirmation = async (
  params: ReceiptConfirmationParams
): Promise<Notification> => {
  try {
    const response = await axios.post<Notification>(
      `${API_URL}/notifications/receipt-confirmation`,
      params
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to send receipt confirmation');
    }
    throw error;
  }
};

/**
 * Get notifications with optional filters
 * @param filters Optional filter parameters
 * @returns Array of notifications
 */
export const getNotifications = async (
  filters?: NotificationFilterParams
): Promise<NotificationWithStatus[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await axios.get<NotificationWithStatus[]>(
      `${API_URL}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch notifications');
    }
    throw error;
  }
};

/**
 * Get a specific notification by ID
 * @param id Notification ID
 * @returns Notification with status details
 */
export const getNotification = async (id: number): Promise<NotificationWithStatus> => {
  try {
    const response = await axios.get<NotificationWithStatus>(`${API_URL}/notifications/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to fetch notification with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Cancel a pending notification
 * @param id Notification ID
 * @returns Cancelled notification
 */
export const cancelNotification = async (id: number): Promise<NotificationWithStatus> => {
  try {
    const response = await axios.post<NotificationWithStatus>(`${API_URL}/notifications/${id}/cancel`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to cancel notification with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Resend a failed notification
 * @param id Notification ID
 * @param delivery_methods Optional array of delivery methods to use (defaults to original)
 * @returns Updated notification
 */
export const resendNotification = async (
  id: number,
  delivery_methods?: DeliveryMethod[]
): Promise<NotificationWithStatus> => {
  try {
    const response = await axios.post<NotificationWithStatus>(
      `${API_URL}/notifications/${id}/resend`,
      { delivery_methods }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to resend notification with ID ${id}`);
    }
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param id Notification ID
 * @returns Updated notification
 */
export const markNotificationAsRead = async (id: number): Promise<NotificationWithStatus> => {
  try {
    const response = await axios.post<NotificationWithStatus>(`${API_URL}/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to mark notification ${id} as read`);
    }
    throw error;
  }
};

/**
 * Schedule automatic payment reminders for invoices coming due
 * @param days_before_due Number of days before due date to send reminders
 * @param delivery_methods Delivery methods to use
 * @returns Created scheduled tasks
 */
export const schedulePaymentReminders = async (
  days_before_due: number = 3,
  delivery_methods: DeliveryMethod[] = ['email', 'in_app']
): Promise<{ scheduled_count: number; message: string }> => {
  try {
    const response = await axios.post<{ scheduled_count: number; message: string }>(
      `${API_URL}/notifications/schedule-payment-reminders`,
      { days_before_due, delivery_methods }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to schedule payment reminders');
    }
    throw error;
  }
};

/**
 * Schedule automatic overdue notices for late payments
 * @param min_days_overdue Minimum days overdue to trigger notice
 * @param delivery_methods Delivery methods to use
 * @returns Created scheduled tasks
 */
export const scheduleOverdueNotices = async (
  min_days_overdue: number = 1,
  delivery_methods: DeliveryMethod[] = ['email', 'sms', 'in_app']
): Promise<{ scheduled_count: number; message: string }> => {
  try {
    const response = await axios.post<{ scheduled_count: number; message: string }>(
      `${API_URL}/notifications/schedule-overdue-notices`,
      { min_days_overdue, delivery_methods }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to schedule overdue notices');
    }
    throw error;
  }
};

/**
 * Send a bulk notification to multiple recipients
 * @param notification Base notification content
 * @param recipient_ids Array of recipient IDs
 * @param recipient_type Type of recipients
 * @returns Count of notifications created
 */
export const sendBulkNotification = async (
  notification: Omit<CreateNotificationParams, 'recipient_id' | 'recipient_type'>,
  recipient_ids: number[],
  recipient_type: 'student' | 'parent' | 'staff'
): Promise<{ count: number; message: string }> => {
  try {
    const response = await axios.post<{ count: number; message: string }>(
      `${API_URL}/notifications/bulk`,
      {
        ...notification,
        recipient_ids,
        recipient_type
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to send bulk notification');
    }
    throw error;
  }
};

/**
 * Get unread notifications count for a recipient
 * @param recipient_id Recipient ID
 * @param recipient_type Type of recipient
 * @returns Count of unread notifications
 */
export const getUnreadNotificationsCount = async (
  recipient_id: number,
  recipient_type: 'student' | 'parent' | 'staff'
): Promise<number> => {
  try {
    const response = await axios.get<{ count: number }>(
      `${API_URL}/notifications/unread-count`,
      { params: { recipient_id, recipient_type } }
    );
    return response.data.count;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to get unread notifications count');
    }
    throw error;
  }
};

/**
 * Mark all notifications as read for a recipient
 * @param recipient_id Recipient ID
 * @param recipient_type Type of recipient
 * @returns Count of notifications marked as read
 */
export const markAllNotificationsAsRead = async (
  recipient_id: number,
  recipient_type: 'student' | 'parent' | 'staff'
): Promise<{ count: number; message: string }> => {
  try {
    const response = await axios.post<{ count: number; message: string }>(
      `${API_URL}/notifications/mark-all-read`,
      { recipient_id, recipient_type }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to mark all notifications as read');
    }
    throw error;
  }
};

// ------- Template Handling Functions -------

/**
 * Compile a notification template with variables
 * @param template Template string with placeholders (e.g., "Hello {{name}}")
 * @param variables Object with variable values
 * @returns Compiled template string
 */
export const compileTemplate = (
  template: string,
  variables: NotificationTemplateVars
): string => {
  // Replace {{variable}} placeholders with actual values
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const value = variables[key.trim()];
    return value !== undefined ? String(value) : '';
  });
};

/**
 * Get a predefined notification template
 * @param templateName Name of the template to retrieve
 * @returns Template object with title and message templates
 */
export const getNotificationTemplate = async (
  templateName: string
): Promise<{ title: string; message: string }> => {
  try {
    const response = await axios.get<{ title: string; message: string }>(
      `${API_URL}/notifications/templates/${templateName}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Failed to get template: ${templateName}`);
    }
    throw error;
  }
};

/**
 * Generate a notification message from a template and variables
 * @param templateName Name of the template to use
 * @param variables Variables to substitute in the template
 * @returns Compiled notification content
 */
export const generateNotificationFromTemplate = async (
  templateName: string,
  variables: NotificationTemplateVars
): Promise<{ title: string; message: string }> => {
  try {
    // Get the template
    const template = await getNotificationTemplate(templateName);
    
    // Compile both title and message with variables
    return {
      title: compileTemplate(template.title, variables),
      message: compileTemplate(template.message, variables)
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate notification from template: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Create payment notification variables for templates
 * @param studentName Student name
 * @param amount Payment amount
 * @param dueDate Due date
 * @param invoiceNumber Optional invoice number
 * @param paymentId Optional payment ID
 * @returns Object with template variables
 */
export const createPaymentTemplateVars = (
  studentName: string,
  amount: number,
  dueDate: string | Date,
  invoiceNumber?: string,
  paymentId?: number
): NotificationTemplateVars => {
  // Format amount as currency
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
  
  // Format date if it's a Date object
  const formattedDate = dueDate instanceof Date
    ? dueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : dueDate;
  
  return {
    studentName,
    amount: formattedAmount,
    rawAmount: amount,
    dueDate: formattedDate,
    invoiceNumber: invoiceNumber || '',
    paymentId: paymentId || '',
    currentDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };
};

// Export all functions
export default {
  // Core notification functions
  createNotification,
  getNotifications,
  getNotification,
  cancelNotification,
  resendNotification,
  markNotificationAsRead,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  
  // Specialized notification functions
  sendPaymentReminder,
  sendPaymentOverdueNotice,
  sendPaymentConfirmation,
  sendReceiptConfirmation,
  sendBulkNotification,
  
  // Scheduled notifications
  schedulePaymentReminders,
  scheduleOverdueNotices,
  
  // Template handling functions
  compileTemplate,
  getNotificationTemplate,
  generateNotificationFromTemplate,
  createPaymentTemplateVars
};

