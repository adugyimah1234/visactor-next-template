/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  RefreshCw,
  ChevronsUpDown
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
import { getExams } from '@/services/exam';
import type { Exam } from '@/types/exam'; // Changed to import type
import { Label } from '@radix-ui/react-label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import registrations from '@/services/registrations';
import StudentSelect from './components/StudentSelect';
import studentService from '@/services/students';
import { Student } from '@/types/student';
import { Receipt } from '@/types/receipt';
import { Category, getAllCategories } from '@/services/categories';
import { useAuth } from "@/contexts/AuthContext";
import classService from '@/services/class';
import { isDeepStrictEqual } from 'util';

// Types based on your backend structure


interface ReceiptFilters {
  search?: string;
  receipt_type?: string;
  date_from?: string;
  date_to?: string;
  student_id?: number;
}

interface CreateReceiptData {
  student_id?: number;
  registration_id?: number;
  payment_id?: number;
  receipt_type: { type: string; amount: number }[]; // ✅ changed from string
  date_issued?: string;
  venue?: string;
  fee_id: number;
  exam_date?: string;
  class_id?: number;
  exam_id?: number;
  payment_type?: string;
  amount: number; // ✅ total amount
}

// ✅ Small deep equal helper for safe comparison
function deepEqual(x: any, y: any): boolean {
  if (x === y) return true;
  if (typeof x !== "object" || typeof y !== "object" || x == null || y == null) return false;
  const keysX = Object.keys(x);
  const keysY = Object.keys(y);
  if (keysX.length !== keysY.length) return false;
  for (const key of keysX) {
    if (!keysY.includes(key)) return false;
    if (!deepEqual(x[key], y[key])) return false;
  }
  return true;
}

export default function ReceiptManagement() {
  
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReceiptFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<number | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [applicants, setApplicants] = useState<RegistrationData[]>([]);
  const [realStudents, setRealStudents] = useState<Student[]>([]);
const [payerType, setPayerType] = useState<'applicant' | 'student'>('applicant');
    const [categories, setCategories] = useState<Category[]>([]);
const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);


useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchInput);
  }, 300); // 300ms delay

  return () => clearTimeout(timer);
}, [searchInput]);

useEffect(() => {
  async function loadStudents() {
    try {
      const data = await registrationService.getAll();
      setApplicants(data); // changed
    } catch (err) {
      console.error("Failed to fetch applicants", err);
    }
  }
  loadStudents();
}, []);

useEffect(() => {
  const fetchClasses = async () => {
    try {
      const data = await classService.getAll(); // or your actual fetch function
      setClasses(data);
    } catch (err) {
      console.error("Failed to load classes!", err);
    }
  };

  fetchClasses();
}, []);

// ✅ 1) Outside or inside - doesn't matter
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };
  fetchCategories();
}, []);

// ✅ Fetch unique classes
useEffect(() => {
  const fetchClasses = async () => {
    try {
            const data = await classService.getAll(); // or your actual fetch function
      // Deduplicate by name (case-insensitive)
      const uniqueByName = Array.from(
        new Map(data.map(cls => [cls.name.trim().toLowerCase(), cls])).values()
      );
      setClasses(uniqueByName);
    } catch (err) {
      console.error("Failed to load classes!", err);
    }
  };

  fetchClasses();
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

useEffect(() => {
  const fetchData = async () => {
    const res = await studentService.getAll(); // ✅ fetch from student table
    setRealStudents(res);
  };
  fetchData();
}, []);


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
      console.error(`Error performing action GHC{actionType}:`, error);
      alert('Action failed');
    } finally {
      setProcessingAction(null);
    }
  };

  // Get receipt type badge variant
 const getReceiptTypeBadge = (type: string) => {
    const variants = {
      levy: { variant: 'default' as const, label: 'Levy' },
      registration: { variant: 'secondary' as const, label: 'Registration' },
      textBooks: { variant: 'outline' as const, label: 'Text Books' },
      exerciseBooks: { variant: 'destructive' as const, label: 'Exercise Books' }
    };
    return variants[type as keyof typeof variants] || { variant: 'default' as const, label: type };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
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

  

const [exams, setExams] = useState<Exam[]>([]);
useEffect(() => {
  async function loadExams() {
    try {
      const data = await getExams();
      setExams(data);
    } catch (err) {
      console.error("Failed to fetch exams", err);
    }
  }
  loadExams();
}, []);
  // Create Receipt Form Component
  interface CreateReceiptFormProps {
  categories: Category[]; // ✅ pass from parent
}

const CreateReceiptForm: React.FC<CreateReceiptFormProps> = ({ categories }) => {
const [formData, setFormData] = useState<CreateReceiptData>({
  student_id: 0,
  registration_id: undefined,
  payment_id: undefined,
  receipt_type: [

  ], // ✅ now an array
  fee_id: 0,
  amount: 0,
  date_issued: new Date().toISOString().split('T')[0],
  venue: '',
  exam_id: undefined,
  class_id: undefined,
  exam_date: '',
  payment_type: ''
});

const [openStudentCombobox, setOpenStudentCombobox] = useState(false);
const [studentSearchQuery, setStudentSearchQuery] = useState('');
const [loadingStudents, setLoadingStudents] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.receipt_type.length === 0) {
    toast.error("Please add at least one payment option.");
    return;
  }

  const isRegistration = formData.receipt_type.some(item => item.type === 'registration');

  if (isRegistration && exams.length === 0) {
    toast.error("No exams available. Cannot create registration receipt.");
    return;
  }

  try {
    // Enforce correct ID based on payer type
    if (isRegistration) {
      if (!formData.registration_id) {
        toast.error("Please select an applicant for this receipt.");
        return;
      }
    } else {
      if (!formData.student_id) {
        toast.error("Please select a student for this receipt.");
        return;
      }

      const exists = realStudents.some((s) => s.id === formData.student_id);
      if (!exists) {
        toast.error("Selected student does not exist in the database.");
        return;
      }
    }

    // Safely construct payload
    const payload: any = {
      ...formData,
      fee_id: formData.student_id ? `02500${formData.student_id}` : undefined,
    };

    if (isRegistration) {
      delete payload.student_id;
    } else {
      delete payload.registration_id;
    }

    // ✅ Create the receipt and get the response with the receipt ID
    const createdReceipt = await createReceipt(payload);
    
    toast.success("Receipt created successfully!");

    // ✅ Update payment status if it's a registration
    if (
      formData.receipt_type?.some(item => item.type === 'registration') &&
      formData.registration_id
    ) {
      try {
        await registrationService.updatePartial(formData.registration_id, {
          payment_status: 'paid'
        });
        console.log("Registration marked as paid");
      } catch (err) {
        console.error("Failed to update payment status", err);
        toast.warning("Receipt created, but payment status update failed.");
      }
    }

    // ✅ Close the dialog first
    setShowCreateDialog(false);
    
    // ✅ Refresh the receipts list
    fetchReceipts();

    // ✅ Auto-print the receipt
    try {
      // Get the receipt ID from the created receipt response
      const receiptId = createdReceipt.id || createdReceipt.id;
      
      if (receiptId) {
        // Generate and open the printable receipt
        const html = await getPrintableReceipt(receiptId);
        const newWindow = window.open('', '_blank');
        
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
          
          // ✅ Automatically trigger print dialog
          newWindow.onload = () => {
            newWindow.print();
          };
          
          toast.success("Receipt created and print dialog opened!");
        } else {
          toast.warning("Receipt created successfully, but unable to open print window. Please allow pop-ups and try printing manually.");
        }
      } else {
        toast.warning("Receipt created successfully, but unable to get receipt ID for printing.");
      }
    } catch (printError) {
      console.error("Print error:", printError);
      toast.warning("Receipt created successfully, but failed to generate printable version.");
    }

    // ✅ Reset form
    setFormData({
      student_id: undefined,
      registration_id: undefined,
      receipt_type: [],
      amount: 0,
      date_issued: new Date().toISOString().split('T')[0],
      venue: '',
      payment_type: '',
      fee_id: 0,
      exam_id: undefined,
      class_id: undefined,
      exam_date: ''
    });

  } catch (error) {
    console.error(error);
    toast.error("Failed to create receipt");
  }
};


const isRegistration = formData.receipt_type?.some(item => item.type === 'registration');

const filteredStudents = useMemo(() => {
  const source = isRegistration ? applicants : realStudents;

  return studentSearchQuery.trim()
    ? source.filter((s: any) =>
        `${s.first_name} ${s.middle_name ?? ''} ${s.last_name}`.toLowerCase().includes(
          studentSearchQuery.toLowerCase()
        )
      )
    : source;
}, [isRegistration, studentSearchQuery, applicants, realStudents]);


const handleStudentSelect = (id: number) => {
  const isRegistration = formData.receipt_type?.some(item => item.type === 'registration');

  if (isRegistration) {
    setFormData((prev) => ({
      ...prev,
      registration_id: id,
      student_id: undefined
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      student_id: id,
      registration_id: undefined
    }));
  }

  const selected = isRegistration
    ? applicants.find((s) => s.id === id)
    : realStudents.find((s) => s.id === id);

  setStudentSearchQuery(
    `${selected?.first_name ?? ''} ${selected?.middle_name ?? ''} ${selected?.last_name ?? ''}`.trim()
  );
  setOpenStudentCombobox(false);
};

    



// 2️⃣ Use as normal
const getCategoryName = (id: number | string) => {
  const found = categories.find((c) => c.id === Number(id));
  return found ? found.name : undefined;
};


 useEffect(() => {
    if (!formData.receipt_type?.length) return;

    const isRegistration = formData.receipt_type.some(item => item.type === "registration");

    const selected = isRegistration
      ? applicants.find(s => s.id === formData.registration_id)
      : realStudents.find(s => s.id === formData.student_id);

    if (!selected) return; // Don't run until student is selected

    const categoryId = selected.category_id;
    const categoryName = categoryId ? getCategoryName(categoryId) : undefined;

    const classId = isRegistration
      ? (selected as RegistrationData)?.class_applying_for
      : (selected as Student)?.class_id;

    const classNameRaw = classId ? classes.find(cls => cls.id === Number(classId))?.name : undefined;
    const className = classNameRaw?.trim().toLowerCase();

    const updatedTypes = formData.receipt_type.map(item => {
      let fixedAmount = item.amount; // Keep previous by default

      switch (item.type) {
        case "levy":
          if (categoryName === "SVC" || categoryName === "MOD") fixedAmount = 200;
          else if (categoryName === "CIV") fixedAmount = 220;
          else fixedAmount = 0;
          break;
        case "furniture":
          fixedAmount = 100;
          break;
        case "jersey_crest":
          fixedAmount = 120;
          break;
        case "registration":
          fixedAmount = 40;
          break;
        case "textBooks":
          if (className?.includes("kg")) fixedAmount = 100;
          else if (className?.includes("basic 1") || className?.includes("basic 2")) fixedAmount = 120;
          else if (className?.includes("basic 3") || className?.includes("basic 4")) fixedAmount = 150;
          else if (className?.includes("basic 5") || className?.includes("basic 6")) fixedAmount = 180;
          else if (className?.includes("basic 7") || className?.includes("basic 8")) fixedAmount = 200;
          else fixedAmount = 200;
          break;
        case "exerciseBooks":
          if (className?.includes("kg")) fixedAmount = 30;
          else if (className?.includes("basic 1") || className?.includes("basic 2")) fixedAmount = 50;
          else if (className?.includes("basic 3") || className?.includes("basic 4")) fixedAmount = 60;
          else if (className?.includes("basic 5") || className?.includes("basic 6")) fixedAmount = 70;
          else if (className?.includes("basic 7") || className?.includes("basic 8")) fixedAmount = 80;
          else fixedAmount = 50;
          break;
        default:
          // no auto amount for other types
      }

      return { ...item, amount: fixedAmount };
    });

    const newTotal = updatedTypes.reduce((sum, item) => sum + item.amount, 0);

    const typesEqual = deepEqual(formData.receipt_type, updatedTypes);
    const totalEqual = formData.amount === newTotal;

    if (!typesEqual || !totalEqual) {
      setFormData(prev => ({
        ...prev,
        receipt_type: updatedTypes,
        amount: newTotal,
      }));
    }
  }, [
    formData.receipt_type,
    formData.registration_id,
    formData.student_id,
    applicants,
    realStudents,
    categories,
    classes,
  ]);


const isAmountLocked = useMemo(() => {
  return formData.receipt_type?.some(item =>
    ['levy', 'registration', 'furniture', 'jersey_crest'].includes(item.type)
  );
}, [formData.receipt_type]);

return (
<form onSubmit={handleSubmit} className="space-y-4">

  {/* === Payment Option === */}
  <div>
    <label className="block text-sm font-medium mb-1">Payment Options</label>
{formData.receipt_type.map((opt, idx) => (
  <div key={idx} className="flex items-center space-x-4 mb-2">
    {/* ✅ Select using shadcn */}
    <Select
      value={opt.type}
      onValueChange={(newType) => {
        const newOptions = [...formData.receipt_type];
        let fixedAmount = 0;
        switch (newType) {
          case "registration":
            fixedAmount = 40;
            break;
          case "levy":
            fixedAmount = 0; // handled in useEffect for SVC/CIV
            break;
          case "furniture":
            fixedAmount = 100;
            break;
          case "jersey_crest":
            fixedAmount = 120;
            break;
          default:
            fixedAmount = 0;
        }
        newOptions[idx] = { type: newType, amount: fixedAmount };
        const totalAmount = newOptions.reduce((sum, item) => sum + item.amount, 0);
        setFormData({ ...formData, receipt_type: newOptions, amount: totalAmount });
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="registration">Registration</SelectItem>
        <SelectItem value="levy">Levy</SelectItem>
        <SelectItem value="furniture">Furniture</SelectItem>
        <SelectItem value="textBooks">TextBooks</SelectItem>
        <SelectItem value="exerciseBooks">ExerciseBooks</SelectItem>
        <SelectItem value="jersey_crest">Jersey/Crest</SelectItem>
      </SelectContent>
    </Select>

    {/* ✅ Show amount */}
    <span className="font-medium text-gray-700">GHS {opt.amount}</span>

    {/* ✅ Remove option with icon button */}
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => {
        const newOptions = [...formData.receipt_type];
        newOptions.splice(idx, 1);
        const totalAmount = newOptions.reduce((sum, item) => sum + item.amount, 0);
        setFormData({ ...formData, receipt_type: newOptions, amount: totalAmount });
      }}
    >
      <X className="w-4 h-4 text-red-600" />
    </Button>
  </div>
))}

{/* ✅ Add option button with plus icon */}
<Button
  type="button"
  variant="secondary"
  onClick={() =>
    setFormData({
      ...formData,
      receipt_type: [...formData.receipt_type, { type: "", amount: 0 }],
    })
  }
  className="mt-2"
>
  <Plus className="w-4 h-4 mr-1" />
  Add Option
</Button>
  </div>

  {/* === Search Student === */}
  <div className="grid grid-cols-4 items-center gap-4 relative">
    <div className="col-span-3 relative">
      <Label htmlFor="student-search" className="block text-sm font-medium mb-1">
        {formData.receipt_type.some(item => item.type === 'registration') ? 'Applicant' : 'Student'}
      </Label>
      <Input
        id="student-search"
        type="text"
        placeholder="Type to search..."
        value={studentSearchQuery}
        onChange={(e) => setStudentSearchQuery(e.target.value)}
        onFocus={() => setOpenStudentCombobox(true)}
      />
      {openStudentCombobox && filteredStudents.length > 0 && (
        <ul className="absolute z-50 border rounded shadow-md w-full mt-1 max-h-48 overflow-y-auto">
          {filteredStudents.map((student) => (
            <li
              key={student.id}
              className="px-4 py-2 bg-white text-black cursor-pointer hover:bg-gray-700"
              onClick={() => {
                handleStudentSelect(student.id ?? 0);
                setStudentSearchQuery(
                  `${student.first_name} ${student.middle_name ?? ""} ${student.last_name}`
                );
                setOpenStudentCombobox(false);
              }}
            >
              {student.first_name} {student.middle_name ?? ""} {student.last_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>

  {/* === Amount === */}
  <div>
    <label className="block text-sm font-medium mb-1">Total Amount</label>
    <Input
      type="text"
      value={new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
      }).format(formData.amount)}
      disabled
    />
    <p className="text-sm text-muted-foreground mt-1">
      This total is calculated automatically based on your selected Payment Options.
    </p>
  </div>

  {/* === Venue Display (Optional) === */}
  {formData.venue && (
    <p className="text-sm text-muted-foreground mt-1">Venue: {formData.venue}</p>
  )}

  {/* === Submit Buttons === */}
  <div className="flex justify-end space-x-2 pt-4">
    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
      Cancel
    </Button>
    <Button type="submit">Create Receipt</Button>
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
          {receipt.payment_type && (
  <div>
    <p className="text-sm font-medium">Payment Type</p>
    <p className="text-sm text-muted-foreground">{receipt.payment_type}</p>
  </div>
)}

{receipt.payment_method && (
  <div>
    <p className="text-sm font-medium">Payment Method</p>
    <p className="text-sm text-muted-foreground">{receipt.payment_method}</p>
  </div>
)}
          <div>
            <p className="text-sm font-medium">Class</p>
            <p className="text-sm text-muted-foreground">{receipt.class_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Receipt Type</p>
{receipt.receipt_items?.map(item => (
  <Badge key={item.id} {...getReceiptTypeBadge(item.receipt_type)}>
    {getReceiptTypeBadge(item.receipt_type).label}
  </Badge>
))}

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
            <CreateReceiptForm categories={categories}/>
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
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'furniture'})}>
                  Furniture
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'registration'})}>
                  Registration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'textBooks'})}>
                  Text Books
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'levy'})}>
                  Levy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'exerciseBooks'})}>
                  Exercise Books
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters({...filters, receipt_type: 'jersey_crest'})}>
                  Jersey/Crest
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
                  <TableHead>Payment Type</TableHead>
                  <TableHead className="w-24">
                    <div className="flex items-center justify-between">
                      Actions
                      <Button variant="ghost" size="sm" onClick={() => fetchReceipts()}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
  {receipts.map((receipt: Receipt) => {
    const realstudent: Student | undefined = realStudents.find(
      (s) => Number(s.id) === Number(receipt.student_id)
    );

    const renderStudentName = () => {
      if (
        receipt.receipt_items?.some(item => item.receipt_type === "registration")
      ) {
        return receipt.student_name || 'Unknown Student';
      }

      if (!realstudent) return 'Unknown Student';

      const fullName = [
        realstudent.first_name,
        realstudent.middle_name,
        realstudent.last_name,
      ].filter(Boolean).join(' ').trim();

      if (fullName) return fullName;

      return (
        (realstudent.first_name?.[0]?.toUpperCase() ?? '') +
        (realstudent.last_name?.[0]?.toUpperCase() ?? '')
      ) || 'NA';
    };

    return (
      <TableRow key={receipt.id}>
        <TableCell className="font-mono">
          R-{receipt.id.toString().padStart(6, '0')}
        </TableCell>

        <TableCell>
          <div>
            <p className="font-medium">{renderStudentName()}</p>
            <p className="text-sm text-muted-foreground">{receipt.class_name}</p>
          </div>
        </TableCell>

        {/* ✅ MULTIPLE RECEIPT TYPES */}
        <TableCell>
          <div className="flex flex-wrap gap-1">
{receipt.receipt_items?.map(item => (
  <Badge key={item.id} {...getReceiptTypeBadge(item.receipt_type)}>
    {getReceiptTypeBadge(item.receipt_type).label}
  </Badge>
))}

          </div>
        </TableCell>

        {/* ✅ SHOW TOTAL AMOUNT AS BEFORE */}
        <TableCell className="font-medium">
          {formatCurrency(receipt.amount)}
        </TableCell>

        <TableCell>{formatDate(receipt.date_issued)}</TableCell>

        <TableCell>
          <Badge variant={receipt.payment_method === 'Paid' ? 'default' : 'secondary'}>
            {receipt.payment_method || 'Paid'}
          </Badge>
        </TableCell>

        <TableCell>
          <Badge variant={receipt.payment_type ? 'default' : 'secondary'}>
            {receipt.payment_type || 'cash'}
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
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  })}
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