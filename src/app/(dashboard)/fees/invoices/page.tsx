/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
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
  X,
  Printer,
  Eye,
  Filter,
  User,
  CreditCard,
  RefreshCw
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
import { getReceipts, createReceipt, getPrintableReceipt } from "@/services/receipt";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import registrationService, { type RegistrationData } from '@/services/registrations';
import { toast } from 'sonner';

// Types based on your backend structure
interface Receipt {
  id: number;
  student_id: number;
  payment_id?: number;
  receipt_type: 'registration' | 'admission' | 'tuition' | 'exam';
  amount: number;
  issued_by?: number;
  date_issued: string;
  venue?: string;
  logo_url?: string;
  exam_date?: string;
  class_id?: number;
  school_id?: number;
  student_name?: string;
  class_name?: string;
  issued_by_name?: string;
  school_name?: string;
  payment_date?: string;
  amount_paid?: number;
}

interface ReceiptFilters {
  search?: string;
  receipt_type?: string;
  date_from?: string;
  date_to?: string;
  student_id?: number;
}

interface CreateReceiptData {
  student_id: number;
  payment_id?: number;
  receipt_type: string;
  amount: number;
  date_issued?: string;
  venue?: string;
  exam_date?: string;
  class_id?: number;
}

export default function ReceiptManagement() {
  // State management
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReceiptFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<number | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [students, setStudents] = useState<RegistrationData[]>([]);

useEffect(() => {
  async function loadStudents() {
    try {
      const data = await registrationService.getAll();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  }
  loadStudents();
}, []);

const fetchReceipts = useCallback(async () => {
  try {
    setLoading(true);
    const data = await getReceipts(filters);
    setReceipts(data);
    setError(null);
  } catch (err: any) {
    console.error("Error fetching receipts:", err);
    setError("Failed to load receipts");
  } finally {
    setLoading(false);
  }
}, [filters]);


  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
  };

  // Handle receipt actions
  const handleAction = async (actionType: string, receiptId: number) => {
    setProcessingAction(receiptId);
    
    try {
      switch (actionType) {
        case 'view':
          const receipt = receipts.find(r => r.id === receiptId);
          if (receipt) {
            setSelectedReceipt(receipt);
            setShowReceiptDetails(true);
          }
          break;
        
        case 'print':
  try {
    const html = await getPrintableReceipt(receiptId);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    } else {
      toast("Unable to open print window. Please allow pop-ups.");
    }
  } catch (err) {
    console.error("Print error:", err);
    toast("Failed to generate printable receipt.");
  }
  break;
        
        case 'download':
          // Simulate download
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert('Receipt downloaded as PDF!');
          break;
        
        case 'email':
          // Simulate email
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert('Receipt emailed successfully!');
          break;
      }
    } catch (error) {
      console.error(`Error performing action ${actionType}:`, error);
      alert('Action failed');
    } finally {
      setProcessingAction(null);
    }
  };

  // Get receipt type badge variant
  const getReceiptTypeBadge = (type: string) => {
    const variants = {
      tuition: { variant: 'default' as const, label: 'Tuition' },
      registration: { variant: 'secondary' as const, label: 'Registration' },
      admission: { variant: 'outline' as const, label: 'Admission' },
      exam: { variant: 'destructive' as const, label: 'Exam' }
    };
    return variants[type as keyof typeof variants] || { variant: 'default' as const, label: type };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Create Receipt Form Component
  const CreateReceiptForm = () => {
    const [formData, setFormData] = useState<CreateReceiptData>({
      student_id: 0,
      receipt_type: '',
      amount: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        // Simulate API call
                await createReceipt(formData);
        // Reset form and close dialog
        setFormData({
          student_id: 0,
          receipt_type: '',
          amount: 0
        });
        setShowCreateDialog(false);
        fetchReceipts();
        
        alert('Receipt created successfully!');
      } catch (error) {
        alert('Failed to create receipt');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
  <label className="block text-sm font-medium mb-1">Student</label>
  <Select
    value={formData.student_id ? formData.student_id.toString() : ""}
    onValueChange={(value) =>
      setFormData({ ...formData, student_id: parseInt(value) })
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Select student" />
    </SelectTrigger>
    <SelectContent>
      {students.map((student) => (
        <SelectItem key={student.id} value={student.id.toString()}>
          {`${student.first_name} ${student.middle_name || ""} ${student.last_name}`}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

        
        <div>
          <label className="block text-sm font-medium mb-1">Receipt Type</label>
          <Select value={formData.receipt_type} onValueChange={(value) => setFormData({...formData, receipt_type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select receipt type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tuition">Tuition</SelectItem>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="admission">Admission</SelectItem>
              <SelectItem value="exam">Exam</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
            placeholder="Enter amount"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Venue (Optional)</label>
          <Input
            value={formData.venue || ''}
            onChange={(e) => setFormData({...formData, venue: e.target.value})}
            placeholder="Enter venue"
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button type="submit">
            Create Receipt
          </Button>
        </div>
      </form>
    );
  };

  // Receipt Details Component
  const ReceiptDetails = ({ receipt }: { receipt: Receipt }) => {
    const receiptNumber = `R-${receipt.id.toString().padStart(6, '0')}`;
    
    return (
      <div className="space-y-6">
        <div className="text-center border-b pb-4">
          <h3 className="text-lg font-semibold">{receipt.school_name}</h3>
          <p className="text-sm text-muted-foreground">Official Receipt</p>
          <p className="font-mono text-lg">{receiptNumber}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Student Name</p>
            <p className="text-sm text-muted-foreground">{receipt.student_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Class</p>
            <p className="text-sm text-muted-foreground">{receipt.class_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Receipt Type</p>
            <Badge {...getReceiptTypeBadge(receipt.receipt_type)}>
              {getReceiptTypeBadge(receipt.receipt_type).label}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">Date Issued</p>
            <p className="text-sm text-muted-foreground">{formatDate(receipt.date_issued)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Amount</p>
            <p className="text-lg font-semibold">{formatCurrency(receipt.amount)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Issued By</p>
            <p className="text-sm text-muted-foreground">{receipt.issued_by_name}</p>
          </div>
        </div>
        
        {receipt.payment_date && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium">Payment Information</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-xs text-muted-foreground">Payment Date</p>
                <p className="text-sm">{formatDate(receipt.payment_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount Paid</p>
                <p className="text-sm">{formatCurrency(receipt.amount_paid || 0)}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => handleAction('print', receipt.id)}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={() => handleAction('download', receipt.id)}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={() => handleAction('email', receipt.id)}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>
      </div>
    );
  };

  if (error && !loading) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchReceipts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Receipt Management</h1>
          <p className="text-muted-foreground">Manage and track payment receipts</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Receipt</DialogTitle>
              <DialogDescription>
                Generate a new receipt for a student payment
              </DialogDescription>
            </DialogHeader>
            <CreateReceiptForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or receipt ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'tuition'})}>
                  Tuition
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'registration'})}>
                  Registration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'admission'})}>
                  Admission
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'exam'})}>
                  Exam
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters({})}>
                  Clear Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Receipts ({receipts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono">
                      R-{receipt.id.toString().padStart(6, '0')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{receipt.student_name}</p>
                        <p className="text-sm text-muted-foreground">{receipt.class_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge {...getReceiptTypeBadge(receipt.receipt_type)}>
                        {getReceiptTypeBadge(receipt.receipt_type).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(receipt.amount)}
                    </TableCell>
                    <TableCell>{formatDate(receipt.date_issued)}</TableCell>
                    <TableCell>
                      <Badge variant={receipt.payment_id ? 'default' : 'secondary'}>
                        {receipt.payment_id ? 'Paid' : 'Issued'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {processingAction === receipt.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleAction('view', receipt.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('print', receipt.id)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('download', receipt.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('email', receipt.id)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Email Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && receipts.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No receipts found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Details Dialog */}
      <Dialog open={showReceiptDetails} onOpenChange={setShowReceiptDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedReceipt && <ReceiptDetails receipt={selectedReceipt} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}