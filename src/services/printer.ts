/**
 * Printer Service
 * 
 * Handles printing operations for various document types including
 * invoices, receipts, reports, and other financial documents.
 */

import { ReceiptTemplateOptions } from './receipt';
import { ExportFormat } from './financial-reports';

// Print document types
export type PrintDocumentType = 'invoice' | 'receipt' | 'report' | 'statement' | 'letter';

// Print options interface
export interface PrintOptions {
  copies?: number;
  color?: boolean;
  paperSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  scale?: number;
  printBackground?: boolean;
  headerFooter?: boolean;
  pageRanges?: string; // E.g., '1-5, 8, 11-13'
  customCss?: string;
}

// Print task interface
export interface PrintTask {
  id: string;
  documentType: PrintDocumentType;
  documentId: number;
  options: PrintOptions;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Queue for managing print tasks
class PrintQueue {
  private tasks: PrintTask[] = [];
  private processing: boolean = false;
  private maxConcurrent: number = 1;
  private currentlyProcessing: number = 0;
  
  constructor(maxConcurrent: number = 1) {
    this.maxConcurrent = maxConcurrent;
  }
  
  /**
   * Add a task to the print queue
   * @param task The print task to add
   * @returns The added task
   */
  addTask(task: PrintTask): PrintTask {
    this.tasks.push(task);
    this.processTasks();
    return task;
  }
  
  /**
   * Process tasks in the queue
   */
  private async processTasks(): Promise<void> {
    if (this.processing || this.currentlyProcessing >= this.maxConcurrent) {
      return;
    }
    
    this.processing = true;
    
    try {
      // Process pending tasks up to maxConcurrent
      const pendingTasks = this.tasks.filter(task => task.status === 'pending');
      
      for (let i = 0; i < Math.min(pendingTasks.length, this.maxConcurrent - this.currentlyProcessing); i++) {
        const task = pendingTasks[i];
        this.currentlyProcessing++;
        task.status = 'printing';
        
        try {
          await this.processTask(task);
          task.status = 'completed';
          task.completedAt = new Date();
        } catch (error) {
          task.status = 'failed';
          task.error = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Print task ${task.id} failed:`, error);
        } finally {
          this.currentlyProcessing--;
        }
      }
    } finally {
      this.processing = false;
      
      // If there are still pending tasks and we have capacity, continue processing
      if (this.tasks.some(task => task.status === 'pending') && this.currentlyProcessing < this.maxConcurrent) {
        this.processTasks();
      }
    }
  }
  
  /**
   * Process an individual print task
   * @param task The task to process
   */
  private async processTask(task: PrintTask): Promise<void> {
    // Implementation depends on document type
    switch (task.documentType) {
      case 'invoice':
        await printInvoice(task.documentId, task.options);
        break;
      case 'receipt':
        await printReceipt(task.documentId, task.options);
        break;
      case 'report':
        await printReport(task.documentId, task.options);
        break;
      case 'statement':
        await printStatement(task.documentId, task.options);
        break;
      case 'letter':
        await printLetter(task.documentId, task.options);
        break;
      default:
        throw new Error(`Unsupported document type: ${task.documentType}`);
    }
  }
  
  /**
   * Get all tasks in the queue
   * @returns Array of print tasks
   */
  getTasks(): PrintTask[] {
    return [...this.tasks];
  }
  
  /**
   * Get a specific task by ID
   * @param id Task ID
   * @returns The task if found, undefined otherwise
   */
  getTask(id: string): PrintTask | undefined {
    return this.tasks.find(task => task.id === id);
  }
  
  /**
   * Clear completed and failed tasks from the queue
   * @returns Number of tasks cleared
   */
  clearCompletedTasks(): number {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.status !== 'completed' && task.status !== 'failed');
    return initialLength - this.tasks.length;
  }
  
  /**
   * Clear all tasks from the queue
   * @returns Number of tasks cleared
   */
  clearAllTasks(): number {
    const tasksCleared = this.tasks.length;
    this.tasks = [];
    return tasksCleared;
  }
}

// Create a singleton print queue instance
const printQueue = new PrintQueue();

/**
 * Generate a unique ID for print tasks
 * @returns Unique ID string
 */
function generatePrintTaskId(): string {
  return `print_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Print an invoice
 * @param invoiceId Invoice ID
 * @param options Print options
 */
export async function printInvoice(invoiceId: number, options: PrintOptions = {}): Promise<void> {
  const url = getInvoicePrintUrl(invoiceId, options);
  await printUrl(url, options);
}

/**
 * Print a receipt
 * @param receiptId Receipt ID
 * @param options Print options
 */
export async function printReceipt(receiptId: number, options: PrintOptions = {}): Promise<void> {
  const templateOptions: ReceiptTemplateOptions = {
    show_signature_line: true,
    include_payment_details: true,
    include_student_details: true
  };
  
  const url = getReceiptPrintUrl(receiptId, templateOptions);
  await printUrl(url, options);
}

/**
 * Print a report
 * @param reportId Report ID
 * @param options Print options
 */
export async function printReport(reportId: number, options: PrintOptions = {}): Promise<void> {
  const url = getReportPrintUrl(reportId, options);
  await printUrl(url, options);
}

/**
 * Print a student financial statement
 * @param studentId Student ID
 * @param options Print options
 */
export async function printStatement(studentId: number, options: PrintOptions = {}): Promise<void> {
  const url = getStatementPrintUrl(studentId, options);
  await printUrl(url, options);
}

/**
 * Print a notification letter
 * @param letterId Letter ID
 * @param options Print options
 */
export async function printLetter(letterId: number, options: PrintOptions = {}): Promise<void> {
  const url = getLetterPrintUrl(letterId, options);
  await printUrl(url, options);
}

/**
 * Get URL for printing an invoice
 * @param invoiceId Invoice ID
 * @param options Print options
 * @returns URL for printing
 */
export function getInvoicePrintUrl(invoiceId: number, options: PrintOptions = {}): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (options.paperSize) queryParams.append('paperSize', options.paperSize);
  if (options.orientation) queryParams.append('orientation', options.orientation);
  if (options.color !== undefined) queryParams.append('color', options.color.toString());
  
  return `${API_URL}/invoices/${invoiceId}/print${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
}

/**
 * Get URL for printing a receipt
 * @param receiptId Receipt ID
 * @param templateOptions Receipt template options
 * @returns URL for printing
 */
export function getReceiptPrintUrl(receiptId: number, templateOptions: ReceiptTemplateOptions = {}): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  Object.entries(templateOptions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'boolean') {
        queryParams.append(key, value ? 'true' : 'false');
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });
  
  return `${API_URL}/receipts/${receiptId}/print${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
}

/**
 * Get URL for printing a report
 * @param reportId Report ID
 * @param options Print options
 * @returns URL for printing
 */
export function getReportPrintUrl(reportId: number, options: PrintOptions = {}): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (options.paperSize) queryParams.append('paperSize', options.paperSize);
  if (options.orientation) queryParams.append('orientation', options.orientation);
  
  return `${API_URL}/reports/${reportId}/print${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
}

/**
 * Get URL for printing a student statement
 * @param studentId Student ID
 * @param options Print options
 * @returns URL for printing
 */
export function getStatementPrintUrl(studentId: number, options: PrintOptions = {}): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (options.paperSize) queryParams.append('paperSize', options.paperSize);
  queryParams.append('detailed', 'true'); // Always include details
  
  return `${API_URL}/reports/student-statement/${studentId}/print${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
}

/**
 * Get URL for printing a notification letter
 * @param letterId Letter ID
 * @param options Print options
 * @returns URL for printing
 */
export function getLetterPrintUrl(letterId: number, options: PrintOptions = {}): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (options.paperSize) queryParams.append('paperSize', options.paperSize);
  
  return `${API_URL}/letters/${letterId}/print${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
}

/**
 * Print content from a URL using an iframe
 * @param url URL to print
 * @param options Print options
 */
export async function printUrl(url: string, options: PrintOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.src = url;
      
      iframe.onload = () => {
        try {
          // Apply custom CSS if provided
          if (options.customCss && iframe.contentDocument) {
            const style = iframe.contentDocument.createElement('style');
            style.textContent = options.customCss;
            iframe.contentDocument.head.appendChild(style);
          }
          
          // Set up print options
          const printOptions: PrintOptions = { ...options };
          
          // Trigger print
          setTimeout(() => {
            try {
              iframe.contentWindow?.print();
              
              // Remove the iframe after printing (after a delay)
              setTimeout(() => {
                document.body.removeChild(iframe);
                resolve();
              }, 1000);
            } catch (err) {
              document.body.removeChild(iframe);
              reject(new Error('Failed to trigger print dialog'));
            }
          }, 500); // Short delay to ensure content is rendered
        } catch (err) {
          document.body.removeChild(iframe);
          reject(new Error('Error preparing content for printing'));
        }
      };
      
      iframe.onerror = () => {
        document.body.removeChild(iframe);
        reject(new Error('Failed to load print content'));
      };
      
      // Add iframe to document to start loading
      document.body.appendChild(iframe);
    } catch (err) {
      reject(new Error('Failed to initialize printing'));
    }
  });
}

/**
 * Open a print preview in a new window
 * @param url URL to preview
 * @param title Window title
 */
export function openPrintPreview(url: string, title: string): Window | null {
  return window.open(url, title, 'width=800,height=600');
}

/**
 * Add a document to the print queue
 * @param documentType Type of document
 * @param documentId Document ID
 * @param options Print options
 * @returns The created print task
 */
export function queuePrintJob(
  documentType: PrintDocumentType,
  documentId: number,
  options: PrintOptions = {}
): PrintTask {
  const task: PrintTask = {
    id: generatePrintTaskId(),
    documentType,
    documentId,
    options,
    status: 'pending',
    createdAt: new Date()
  };
  
  return printQueue.addTask(task);
}

/**
 * Get all print tasks in the queue
 * @returns Array of print tasks
 */
export function getPrintTasks(): PrintTask[] {
  return printQueue.getTasks();
}

/**
 * Clear completed and failed print tasks
 * @returns Number of tasks cleared
 */
export function clearCompletedPrintTasks(): number {
  return printQueue.clearCompletedTasks();
}

// Export all functions and types
export default {
  // Individual print functions
  printInvoice,
  printReceipt,
  printReport,
  printStatement,
  printLetter,
  
  // URL generators
  getInvoicePrintUrl,
  getReceiptPrintUrl,
  getReportPrintUrl,
  getStatementPrintUrl,
  getLetterPrintUrl,
  
  // Generic print
  printUrl,
  openPrintPreview,
  
  // Queue management
  queuePrintJob,
  getPrintTasks,
  clearCompletedPrintTasks
};

