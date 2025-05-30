/* eslint-disable no-console */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Filter, 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal, 
  AlertCircle, 
  Calendar, 
  Download, 
  Mail, 
  Loader2, 
  ArrowUpDown, 
  Check,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Import services
import invoiceService, { Invoice, InvoiceStatus, CreateInvoicePayload } from '@/services/invoice';
import printerService from '@/services/printer';
import notificationService from '@/services/notification';
import financialReports from '@/services/financial-reports';
import { useToast } from '@/hooks/use-toast';

// Define invoice filter parameters
interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | InvoiceStatus[];
  date_from?: string;
  date_to?: string;
}

// Form schema for creating a new invoice
const createInvoiceSchema = z.object({
  student_id: z.number({
    required_error: "Student is required",
  }),
  issue_date: z.string({
    required_error: "Issue date is required",
  }),
  due_date: z.string({
    required_error: "Due date is required",
  }),
  items: z.array(z.object({
    fee_id: z.number({
      required_error: "Fee is required",
    }),
    description: z.string().min(1, "Description is required"),
    amount: z.number({
      required_error: "Amount is required",
    }).positive("Amount must be positive"),
    quantity: z.number({
      required_error: "Quantity is required",
    }).positive("Quantity must be positive"),
  })).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

type CreateInvoiceForm = z.infer<typeof createInvoiceSchema>;

export default function InvoicesPage() {
  // State for invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for UI
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<number | null>(null);
  
  // Toast hook for notifications
  const { toast } = useToast();

  // Fetch invoices on component mount and when filters change
  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  // Function to fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await invoiceService.getInvoices(filters);
      setInvoices(data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError(error instanceof Error ? error.message : 'Failed to load invoices');
      setLoading(false);
    }
  }, [filters]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
  };

  // Filter invoices by status
  const handleFilterByStatus = (status: InvoiceStatus | InvoiceStatus[]) => {
    setFilters({ ...filters, status });
    setShowFilterDialog(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchInput("");
    setShowFilterDialog(false);
  };

  // Handle invoice actions
  const handleAction = async (actionType: string, invoiceId: number) => {
    setProcessingAction(invoiceId);
    
    try {
      switch (actionType) {
        case 'view':
          // This would typically navigate to a details page
          window.open(`/dashboard/fees/invoices/${invoiceId}`, '_blank');
          break;
        
        case 'download':
          await printerService.printInvoice(invoiceId);
          toast({
            title: "PDF Generated",
            description: "Invoice PDF has been generated and downloaded.",
          });
          break;
        
        case 'remind':
          await sendPaymentReminder(invoiceId);
          toast({
            title: "Reminder Sent",
            description: "Payment reminder has been sent to the student.",
          });
          break;
        
        case 'mark-paid':
          // Open a dialog to enter payment details
          // This would be implemented separately
          toast({
            title: "Payment Recording",
            description: "Payment recording feature coming soon.",
          });
          break;
        
        case 'cancel':
          await invoiceService.cancelInvoice(invoiceId, "Cancelled by administrator");
          toast({
            title: "Invoice Cancelled",
            description: "The invoice has been cancelled.",
          });
          // Refresh invoices
          fetchInvoices();
          break;
      }
    } catch (error) {
      console.error(`Error performing action ${actionType}:`, error);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Create form using react-hook-form
  const form = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days from now
      items: [{ fee_id: 0, description: '', amount: 0, quantity: 1 }],
      notes: '',
    },
  });

  // Handle form submission for new invoice
  const onSubmit = async (data: CreateInvoiceForm) => {
    try {
      const result = await invoiceService.createInvoice(data as CreateInvoicePayload);
      
      toast({
        title: "Invoice Created",
        description: `Invoice has been created successfully.`,
      });
      
      setShowCreateDialog(false);
      form.reset();
      
      // Refresh invoices list
      fetchInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        variant: "destructive",
        title: "Failed to Create Invoice",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  // Send payment reminder for an invoice
  const sendPaymentReminder = async (invoiceId: number) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    
    await notificationService.sendPaymentReminder({
      student_id: invoice.student_id,
      invoice_id: invoice.id,
      amount: invoice.total_amount,
      due_date: invoice.due_date,
      days_before_due: 0, // Immediate reminder
      include_parents: true,
      delivery_methods: ['email', 'in_app'],
    });
  };

  // Get status badge variant based on invoice status
  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'partially_paid':
        return 'outline';
      case 'draft':
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'cancelled':
        return 'ghost';
      default:
        return 'secondary';
    }
  };

  // Display error message if one exists
  if (error && !loading) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchInvoices}>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative w-[300px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <Input
                placeholder="Search invoices..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Create a new invoice for a student
              </DialogDescription>
            </DialogHeader>
            {/* Your form content */}
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* ...rest of your invoice page content... */}
    </div>
  );
}