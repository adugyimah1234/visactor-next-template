/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, Plus, Search, MoreHorizontal, AlertCircle, Loader2, X, Printer, Filter, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { getReceipts, createReceipt, getPrintableReceipt } from "@/services/receipt";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import registrationService from '@/services/registrations';
import { toast } from 'sonner';
import { getExams } from '@/services/exam';
import { Label } from '@radix-ui/react-label';
import studentService from '@/services/students';
import { getAllCategories } from '@/services/categories';
import { useAuth } from "@/contexts/AuthContext";
import classService from '@/services/class';
import { calculateStudentTotalDue } from './calculateStudentTotalDue';
// ✅ Small deep equal helper for safe comparison
function deepEqual(x, y) {
    if (x === y)
        return true;
    if (typeof x !== "object" || typeof y !== "object" || x == null || y == null)
        return false;
    const keysX = Object.keys(x);
    const keysY = Object.keys(y);
    if (keysX.length !== keysY.length)
        return false;
    for (const key of keysX) {
        if (!keysY.includes(key))
            return false;
        if (!deepEqual(x[key], y[key]))
            return false;
    }
    return true;
}
// Add this helper to sum all receipts for a student
function getStudentTotalPaid(studentId, receipts) {
    if (!studentId || !receipts)
        return 0;
    return receipts
        .filter(r => Number(r.student_id) === Number(studentId))
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}
export default function ReceiptManagement() {
    const { user } = useAuth();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});
    const [searchInput, setSearchInput] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [processingAction, setProcessingAction] = useState(null);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [showReceiptDetails, setShowReceiptDetails] = useState(false);
    const [applicants, setApplicants] = useState([]);
    const [realStudents, setRealStudents] = useState([]);
    const [payerType, setPayerType] = useState('applicant');
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    useEffect(() => {
        async function loadStudents() {
            try {
                const data = await registrationService.getAll();
                setApplicants(data); // changed
            }
            catch (err) {
                console.error("Failed to fetch applicants", err);
            }
        }
        loadStudents();
    }, []);
    // ✅ 1) Outside or inside - doesn't matter
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                setCategories(data);
            }
            catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);
    // ✅ Fetch unique classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await classService.getAll();
                setClasses(data); // <-- Use all classes, no deduplication!
            }
            catch (err) {
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
        }
        catch (err) {
            console.error("Error fetching receipts:", err);
            setError("Failed to load receipts");
        }
        finally {
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
    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(Object.assign(Object.assign({}, filters), { search: searchInput }));
    };
    const filteredReceipts = receipts.filter((receipt) => {
        const searchTerm = searchInput.toLowerCase().trim();
        if (!searchTerm)
            return true;
        // Student name
        const student = realStudents.find((s) => Number(s.id) === Number(receipt.student_id));
        const studentName = student
            ? `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.toLowerCase()
            : '';
        // Applicant name
        const applicant = applicants.find((a) => Number(a.id) === Number(receipt.registration_id));
        const applicantName = applicant
            ? `${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name}`.toLowerCase()
            : '';
        // Receipt id
        const receiptId = `r-${receipt.id.toString().padStart(6, '0')}`;
        return (studentName.includes(searchTerm) ||
            applicantName.includes(searchTerm) ||
            receiptId.includes(searchTerm) ||
            receipt.id.toString().includes(searchTerm));
    });
    // Handle receipt actions
    const handleAction = async (actionType, receiptId) => {
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
                        }
                        else {
                            toast("Unable to open print window. Please allow pop-ups.");
                        }
                    }
                    catch (err) {
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
        }
        catch (error) {
            console.error(`Error performing action GHC{actionType}:`, error);
            alert('Action failed');
        }
        finally {
            setProcessingAction(null);
        }
    };
    // Get receipt type badge variant
    const getReceiptTypeBadge = (type) => {
        const variants = {
            levy: { variant: 'default', label: 'Levy' },
            registration: { variant: 'secondary', label: 'Registration' },
            textBooks: { variant: 'outline', label: 'Text Books' },
            exerciseBooks: { variant: 'destructive', label: 'Exercise Books' },
            jersey: { variant: 'default', label: 'Jersey' },
            crest: { variant: 'secondary', label: 'Crest' },
        };
        return variants[type] || { variant: 'default', label: type };
    };
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS'
        }).format(amount);
    };
    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    const [exams, setExams] = useState([]);
    useEffect(() => {
        async function loadExams() {
            try {
                const data = await getExams();
                setExams(data);
            }
            catch (err) {
                console.error("Failed to fetch exams", err);
            }
        }
        loadExams();
    }, []);
    const CreateReceiptForm = ({ categories }) => {
        var _a, _b;
        const [formData, setFormData] = useState({
            student_id: 0,
            registration_id: undefined,
            payment_id: undefined,
            receipt_type: [], // ✅ now an array
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
        const handleSubmit = async (e) => {
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
            // 🚫 Prevent duplicate registration receipt for applicants
            if (isRegistration && formData.registration_id) {
                const alreadyExists = receipts.some(r => {
                    var _a;
                    return Number(r.registration_id) === Number(formData.registration_id) &&
                        ((_a = r.receipt_items) === null || _a === void 0 ? void 0 : _a.some(item => item.receipt_type === 'registration'));
                });
                if (alreadyExists) {
                    toast.error("A registration receipt already exists for this applicant.");
                    return;
                }
            }
            // ✅ Open popup FIRST
            let printWindow = null;
            printWindow = window.open('', '_blank');
            if (!printWindow) {
                toast.warning("Please allow pop-ups to print the receipt.");
            }
            try {
                if (isRegistration && !formData.registration_id) {
                    toast.error("Please select an applicant.");
                    return;
                }
                if (!isRegistration && !formData.student_id) {
                    toast.error("Please select a student.");
                    return;
                }
                const exists = realStudents.some((s) => s.id === formData.student_id);
                if (!isRegistration && !exists) {
                    toast.error("Student not in database.");
                    return;
                }
                const payload = Object.assign(Object.assign({}, formData), { fee_id: formData.student_id ? `02500${formData.student_id}` : undefined });
                if (isRegistration && formData.registration_id) {
                    try {
                        await registrationService.updatePartial(formData.registration_id, {
                            payment_status: 'paid',
                        });
                    }
                    catch (_a) {
                        toast.warning("Receipt created but payment status not updated.");
                    }
                }
                if (isRegistration)
                    delete payload.student_id;
                else
                    delete payload.registration_id;
                const createdReceipt = await createReceipt(payload);
                toast.success("Receipt created!");
                // reset
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
                setShowCreateDialog(false);
                await fetchReceipts();
                // ✅ Finally, trigger print
                if (printWindow && (createdReceipt === null || createdReceipt === void 0 ? void 0 : createdReceipt.id)) {
                    printWindow.location.href = `/print/receipt/${createdReceipt.id}`;
                }
            }
            catch (error) {
                console.error(error);
                toast.error("Failed to create receipt");
            }
        };
        const isRegistration = (_a = formData.receipt_type) === null || _a === void 0 ? void 0 : _a.some(item => item.type === 'registration');
        const filteredStudents = useMemo(() => {
            const source = isRegistration ? applicants : realStudents;
            return studentSearchQuery.trim()
                ? source.filter((s) => {
                    var _a;
                    return `${s.first_name} ${(_a = s.middle_name) !== null && _a !== void 0 ? _a : ''} ${s.last_name}`.toLowerCase().includes(studentSearchQuery.toLowerCase());
                })
                : source;
        }, [isRegistration, studentSearchQuery, applicants, realStudents]);
        const handleStudentSelect = (id) => {
            var _a, _b, _c, _d;
            const isRegistration = (_a = formData.receipt_type) === null || _a === void 0 ? void 0 : _a.some(item => item.type === 'registration');
            if (isRegistration) {
                setFormData((prev) => (Object.assign(Object.assign({}, prev), { registration_id: id, student_id: undefined })));
            }
            else {
                setFormData((prev) => (Object.assign(Object.assign({}, prev), { student_id: id, registration_id: undefined })));
            }
            const selected = isRegistration
                ? applicants.find((s) => s.id === id)
                : realStudents.find((s) => s.id === id);
            setStudentSearchQuery(`${(_b = selected === null || selected === void 0 ? void 0 : selected.first_name) !== null && _b !== void 0 ? _b : ''} ${(_c = selected === null || selected === void 0 ? void 0 : selected.middle_name) !== null && _c !== void 0 ? _c : ''} ${(_d = selected === null || selected === void 0 ? void 0 : selected.last_name) !== null && _d !== void 0 ? _d : ''}`.trim());
            setOpenStudentCombobox(false);
        };
        // 2️⃣ Use as normal
        const getCategoryName = (id) => {
            const found = categories.find((c) => c.id === Number(id));
            return found ? found.name : undefined;
        };
        // ✅ NEW: Check if selected student has null/empty academic_year_id (existing student)
        const selectedStudent = realStudents.find(s => s.id === formData.student_id);
        const isExistingStudent = selectedStudent && (!selectedStudent.academic_year_id || selectedStudent.academic_year_id === null);
        // ✅ NEW: Warning when student tries to add registration
        const hasRegistrationPayment = (_b = formData.receipt_type) === null || _b === void 0 ? void 0 : _b.some(item => item.type === 'registration');
        const showRegistrationWarning = selectedStudent && hasRegistrationPayment;
        useEffect(() => {
            var _a, _b;
            if (!((_a = formData.receipt_type) === null || _a === void 0 ? void 0 : _a.length))
                return;
            const isRegistration = formData.receipt_type.some(item => item.type === "registration");
            const selected = isRegistration
                ? applicants.find(s => s.id === formData.registration_id)
                : realStudents.find(s => s.id === formData.student_id);
            if (!selected)
                return; // Don't run until student is selected
            const categoryId = selected.category_id;
            const categoryName = categoryId ? getCategoryName(categoryId) : undefined;
            const classId = isRegistration
                ? selected === null || selected === void 0 ? void 0 : selected.class_applying_for
                : selected === null || selected === void 0 ? void 0 : selected.class_id;
            const classNameRaw = classId ? (_b = classes.find(cls => cls.id === Number(classId))) === null || _b === void 0 ? void 0 : _b.name : undefined;
            const className = classNameRaw === null || classNameRaw === void 0 ? void 0 : classNameRaw.trim().toLowerCase();
            // ...inside your useEffect for updating amounts...
            const textBooksMap = {
                'kg 1 a': 345,
                'kg 1 b': 345,
                'kg 1 c': 345,
                'kg 1 d': 345,
                'kg 2 a': 345,
                'kg 2 b': 345,
                'kg 2 c': 345,
                'kg 2 d': 345,
                'basic 1': 615,
                'basic 2': 590,
                'basic 3': 590,
                'basic 4': 660,
                'basic 5': 650,
                'basic 6': 650,
                'basic 7': 990,
                'basic 8': 415,
                'basic 9': 350,
            };
            const exerciseBooksMap = {
                'kg 1 a': 104,
                'kg 1 b': 104,
                'kg 1 c': 104,
                'kg 1 d': 104,
                'kg 2 a': 104,
                'kg 2 b': 104,
                'kg 2 c': 104,
                'kg 2 d': 104,
                'basic 1': 181,
                'basic 2': 181,
                'basic 3': 181,
                'basic 4': 186,
                'basic 5': 274,
                'basic 6': 274,
                'basic 7': 341,
                'basic 8': 341,
                'basic 9': 341,
            };
            const updatedTypes = formData.receipt_type.map(item => {
                let fixedAmount = item.amount; // Keep previous by default
                switch (item.type) {
                    case "levy":
                        if (categoryName === "SVC" || categoryName === "MOD")
                            fixedAmount = 200;
                        else if (categoryName === "CIV")
                            fixedAmount = 220;
                        else
                            fixedAmount = 0;
                        break;
                    case "furniture":
                        fixedAmount = 100;
                        break;
                    case "jersey":
                        fixedAmount = 0; // or your desired jersey amount
                        break;
                    case "crest":
                        fixedAmount = 10;
                        break;
                    case "registration":
                        fixedAmount = 40;
                        break;
                    case "textBooks":
                        fixedAmount = textBooksMap[className || ''] || 0;
                        break;
                    case "exerciseBooks":
                        fixedAmount = exerciseBooksMap[className || ''] || 0;
                        break;
                    default:
                        fixedAmount = 0;
                }
                return Object.assign(Object.assign({}, item), { amount: fixedAmount });
            });
            const newTotal = updatedTypes.reduce((sum, item) => sum + item.amount, 0);
            const typesEqual = deepEqual(formData.receipt_type, updatedTypes);
            const totalEqual = formData.amount === newTotal;
            if (!typesEqual || !totalEqual) {
                setFormData(prev => (Object.assign(Object.assign({}, prev), { receipt_type: updatedTypes, amount: newTotal })));
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
        const paidTypes = useMemo(() => {
            // If no student/applicant selected, nothing is paid
            if (!formData.student_id && !formData.registration_id)
                return [];
            // Find all receipts for this student/applicant
            const relevantReceipts = receipts.filter(r => isRegistration
                ? Number(r.registration_id) === Number(formData.registration_id)
                : Number(r.student_id) === Number(formData.student_id));
            // Collect all paid types
            const types = new Set();
            relevantReceipts.forEach(r => {
                (r.receipt_items || []).forEach(item => {
                    types.add(item.receipt_type);
                });
            });
            return Array.from(types);
        }, [
            formData.student_id,
            formData.registration_id,
            isRegistration,
            receipts
        ]);
        const isAmountLocked = useMemo(() => {
            var _a;
            return (_a = formData.receipt_type) === null || _a === void 0 ? void 0 : _a.some(item => ['levy', 'registration', 'furniture', 'jersey_crest'].includes(item.type));
        }, [formData.receipt_type]);
        // 🚫 Check if duplicate registration receipt exists for selected applicant
        const duplicateRegistrationReceipt = useMemo(() => {
            if (!isRegistration || !formData.registration_id)
                return false;
            return receipts.some(r => {
                var _a;
                return Number(r.registration_id) === Number(formData.registration_id) &&
                    ((_a = r.receipt_items) === null || _a === void 0 ? void 0 : _a.some(item => item.receipt_type === 'registration'));
            });
        }, [isRegistration, formData.registration_id, receipts]);
        return (<form onSubmit={handleSubmit} className="space-y-4">

  {/* === Payment Option === */}
  <div>
    <label className="block text-sm font-medium mb-1">Payment Options</label>
            {formData.receipt_type.map((opt, idx) => {
                // Prevent duplicate selection: get all selected types except current index
                const selectedTypes = formData.receipt_type.map((item, i) => i !== idx ? item.type : null).filter(Boolean);
                return (<div key={idx} className="flex items-center space-x-4 mb-2">
      {/* ✅ Select using shadcn */}
      <Select value={opt.type} onValueChange={(newType) => {
                        // Prevent selecting a type already chosen elsewhere
                        if (selectedTypes.includes(newType)) {
                            toast.error("You cannot select the same payment type twice.");
                            return;
                        }
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
                        setFormData(Object.assign(Object.assign({}, formData), { receipt_type: newOptions, amount: totalAmount }));
                    }}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select type"/>
        </SelectTrigger>
        <SelectContent>
          {/* Only show options NOT in paidTypes and NOT already selected in other rows */}
          {!isExistingStudent && !paidTypes.includes('registration') && !selectedTypes.includes('registration') && (<SelectItem value="registration">Registration</SelectItem>)}
          {!paidTypes.includes('levy') && !selectedTypes.includes('levy') && (<SelectItem value="levy">Levy</SelectItem>)}
          {!paidTypes.includes('furniture') && !selectedTypes.includes('furniture') && (<SelectItem value="furniture">Furniture</SelectItem>)}
          {!paidTypes.includes('textBooks') && !selectedTypes.includes('textBooks') && (<SelectItem value="textBooks">Text Books</SelectItem>)}
          {!paidTypes.includes('exerciseBooks') && !selectedTypes.includes('exerciseBooks') && (<SelectItem value="exerciseBooks">Exercise Books</SelectItem>)}
          {!paidTypes.includes('jersey') && !selectedTypes.includes('jersey') && (<SelectItem value="jersey">Jersey</SelectItem>)}
          {!paidTypes.includes('crest') && !selectedTypes.includes('crest') && (<SelectItem value="crest">Crest</SelectItem>)}
        </SelectContent>
      </Select>

      {/* ✅ Show amount */}
      <span className="font-medium text-gray-700">GHS {opt.amount}</span>

      {/* ✅ Remove option with icon button */}
      <Button type="button" variant="ghost" size="icon" onClick={() => {
                        const newOptions = [...formData.receipt_type];
                        newOptions.splice(idx, 1);
                        const totalAmount = newOptions.reduce((sum, item) => sum + item.amount, 0);
                        setFormData(Object.assign(Object.assign({}, formData), { receipt_type: newOptions, amount: totalAmount }));
                    }}>
        <X className="w-4 h-4 text-red-600"/>
      </Button>
    </div>);
            })}

        {/* ✅ Add option button with plus icon */}
        <Button type="button" variant="secondary" onClick={() => setFormData(Object.assign(Object.assign({}, formData), { receipt_type: [...formData.receipt_type, { type: "", amount: 0 }] }))} className="mt-2">
  <Plus className="w-4 h-4 mr-1"/>
  Add Option
        </Button>
 {showRegistrationWarning && (<Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4"/>
        <AlertTitle>Invalid Payment Type</AlertTitle>
        <AlertDescription>
          Students cannot pay registration fees. Please remove the registration option or select an applicant instead.
        </AlertDescription>
      </Alert>)}
  </div>
        {/* 🚫 Duplicate registration receipt warning */}
    {duplicateRegistrationReceipt && (<Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4"/>
        <AlertTitle>Duplicate Registration Receipt</AlertTitle>
        <AlertDescription>
          A registration receipt has already been created for this applicant. You cannot create another.
        </AlertDescription>
      </Alert>)}
  {/* === Search Student === */}
  <div className="grid grid-cols-4 items-center gap-4 relative">
    <div className="col-span-3 relative">
      <Label htmlFor="student-search" className="block text-sm font-medium mb-1">
        {formData.receipt_type.some(item => item.type === 'registration') ? 'Applicant' : 'Student'}
      </Label>
      <Input id="student-search" type="text" placeholder="Type to search..." value={studentSearchQuery} onChange={(e) => setStudentSearchQuery(e.target.value)} onFocus={() => setOpenStudentCombobox(true)}/>
      {openStudentCombobox && filteredStudents.length > 0 && (<ul className="absolute z-50 border rounded shadow-md w-full mt-1 max-h-48 overflow-y-auto">
          {filteredStudents.map((student) => {
                    var _a;
                    return (<li key={student.id} className="px-4 py-2 bg-white text-black cursor-pointer hover:bg-gray-700" onClick={() => {
                            var _a, _b;
                            handleStudentSelect((_a = student.id) !== null && _a !== void 0 ? _a : 0);
                            setStudentSearchQuery(`${student.first_name} ${(_b = student.middle_name) !== null && _b !== void 0 ? _b : ""} ${student.last_name}`);
                            setOpenStudentCombobox(false);
                        }}>
              {student.first_name} {(_a = student.middle_name) !== null && _a !== void 0 ? _a : ""} {student.last_name}
            </li>);
                })}
        </ul>)}
    </div>
  </div>

  {/* === Amount === */}
  <div>
    <label className="block text-sm font-medium mb-1">Total Amount</label>
    <Input type="text" value={new Intl.NumberFormat('en-GH', {
                style: 'currency',
                currency: 'GHS',
            }).format(formData.amount)} disabled/>
    <p className="text-sm text-muted-foreground mt-1">
      This total is calculated automatically based on your selected Payment Options.
    </p>
  </div>

  {/* === Venue Display (Optional) === */}
  {formData.venue && (<p className="text-sm text-muted-foreground mt-1">Venue: {formData.venue}</p>)}

  {/* === Submit Buttons === */}
  <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
        Cancel
      </Button>
      <Button type="submit" disabled={showRegistrationWarning || duplicateRegistrationReceipt}>
        Create Receipt
      </Button>
    
  </div>
        </form>);
    };
    if (error && !loading) {
        return (<Alert variant="destructive">
        <AlertCircle className="h-4 w-4"/>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchReceipts}>
          <RefreshCw className="mr-2 h-4 w-4"/>
          Try Again
        </Button>
      </Alert>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Receipt Management</h1>
          <p className="text-muted-foreground">Manage and track payment receipts</p>
        </div>

      <Dialog open={showCreateDialog} onOpenChange={(open) => {
            setShowCreateDialog(open);
        }}>
  <DialogTrigger asChild>
    <Button>
      <Plus className="mr-2 h-4 w-4"/>
      Create Receipt
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-md" key={showCreateDialog ? 'open' : 'closed'}>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input placeholder="Search by receipt ID..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10"/>
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4"/>
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters(Object.assign(Object.assign({}, filters), { receipt_type: 'furniture' }))}>
                  Furniture
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(Object.assign(Object.assign({}, filters), { receipt_type: 'registration' }))}>
                  Registration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(Object.assign(Object.assign({}, filters), { receipt_type: 'textBooks' }))}>
                  Text Books
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(Object.assign(Object.assign({}, filters), { receipt_type: 'levy' }))}>
                  Levy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters(Object.assign(Object.assign({}, filters), { receipt_type: 'exerciseBooks' }))}>
                  Exercise Books
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters(Object.assign(Object.assign({}, filters), { receipt_type: 'jersey_crest' }))}>
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
          {loading ? (<div className="space-y-3">
              {[...Array(5)].map((_, i) => (<div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20"/>
                  <Skeleton className="h-4 w-40"/>
                  <Skeleton className="h-4 w-24"/>
                  <Skeleton className="h-4 w-20"/>
                  <Skeleton className="h-4 w-16"/>
                </div>))}
            </div>) : (<Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Amount Left</TableHead> {/* <-- Add this column */}
                  <TableHead className="w-24">
                    <div className="flex items-center justify-between">
                      Actions
                      <Button variant="ghost" size="sm" onClick={() => fetchReceipts()}>
                        <RefreshCw className="h-4 w-4"/>
                      </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                
                {filteredReceipts.map((receipt, index) => {
                var _a;
                const realstudent = realStudents.find(s => Number(s.id) === Number(receipt.student_id));
                const applicant = applicants.find(a => Number(a.id) === Number(receipt.registration_id));
                const studentForCalc = realstudent || applicant;
                // Gather all receipts for this student/applicant UP TO AND INCLUDING this receipt
                const allStudentReceiptsUpToCurrent = receipts
                    .filter(r => Number(r.student_id) === Number(receipt.student_id) &&
                    Number(r.id) <= Number(receipt.id));
                // Collect all paid receipt items' types for this student up to this receipt
                const paidTypes = new Set();
                allStudentReceiptsUpToCurrent.forEach(r => {
                    (r.receipt_items || []).forEach(item => {
                        paidTypes.add(item.receipt_type);
                    });
                });
                let amountLeft = 'N/A';
                if (studentForCalc && categories.length && classes.length) {
                    const totalDue = calculateStudentTotalDue(studentForCalc, categories, classes, Array.from(paidTypes));
                    amountLeft = formatCurrency(totalDue);
                }
                // Add this helper at the top of your file
                // Add this helper at the top of your file
                function getReceiptDisplayName(receipt) {
                    var _a, _b;
                    // Try student_name
                    if (receipt.student_name && receipt.student_name.trim())
                        return receipt.student_name.trim();
                    // Try registration_first_name + registration_last_name
                    const regFirst = ((_a = receipt.registration_first_name) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                    const regLast = ((_b = receipt.registration_last_name) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                    if (regFirst || regLast)
                        return `${regFirst} ${regLast}`.trim();
                    // Try student_id or registration_id
                    if (receipt.student_id)
                        return `Student #${receipt.student_id}`;
                    if (receipt.registration_id)
                        return `Applicant #${receipt.registration_id}`;
                    // Fallback
                    return 'N/A';
                }
                // console.log('Rendering receipt:', receipt);
                return (<TableRow key={receipt.id || index}>
        <TableCell>{index + 1}</TableCell>
        <TableCell className="font-mono">
          R-{receipt.id.toString().padStart(6, '0')}
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium">{getReceiptDisplayName(receipt)}</p>
            <p className="text-sm text-muted-foreground">{receipt.class_name}</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {(_a = receipt.receipt_items) === null || _a === void 0 ? void 0 : _a.map(item => (<Badge key={item.id} {...getReceiptTypeBadge(item.receipt_type)}>
                {getReceiptTypeBadge(item.receipt_type).label}
              </Badge>))}
          </div>
        </TableCell>
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
          {studentForCalc ? amountLeft : '0.00'}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {processingAction === receipt.id ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<MoreHorizontal className="h-4 w-4"/>)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAction('print', receipt.id)}>
                <Printer className="mr-2 h-4 w-4"/>
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>);
            })}
        </TableBody>
            </Table>)}

          {!loading && receipts.length === 0 && (<div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground"/>
              <p className="mt-2 text-muted-foreground">No receipts found</p>
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
