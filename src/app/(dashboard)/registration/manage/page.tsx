/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from "@/components/ui/loader";
import {
    ChevronLeft,
    ChevronRight,
    ChevronFirst,
    ChevronLast
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ArrowUpDown,
    CheckCircle,
    XCircle,
    Plus,
    Edit,
    Trash2,
    Search,
    Users,
    Download,
    Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "@/contexts/AuthContext";
import registrationService, { RegistrationUpdateInput, type RegistrationData } from '@/services/registrations';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, Toaster } from 'sonner';
import schoolService from '@/services/schools';
import { Category, getAllCategories } from '@/services/categories';

// ...other imports...
interface Applicant {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
    date: string; // Store as string, format on display
}

const ApplicantManagement = () => {
    const router = useRouter();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [open, setOpen] = useState(false);
    const [editApplicant, setEditApplicant] = useState<Applicant | null>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<string>(''); // or a default role string like 'user'
    const [status, setStatus] = useState<Applicant['status']>('pending');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Applicant; direction: 'ascending' | 'descending' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
const [showConfirmEdit, setShowConfirmEdit] = useState(false);
const [showEditForm, setShowEditForm] = useState(false);
    const [itemsPerPage] = useState(10); // Number of items per page
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
    const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [classApplyingFor, setClassApplyingFor] = useState('');
    const [gender, setGender] = useState<"Male" | "Female" | "Other">('Male');
    const [address, setAddress] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [guardianPhoneNumber, setGuardianPhoneNumber] = useState('');
    const { user } = useAuth(); // Get the current user

    const [selectedClass, setSelectedClass] = useState<string>('All');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);
    const [selectedSchool, setSelectedSchool] = useState<string>('All');
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>(''); // store ID, not name
    const [schools, setSchools] = useState<{ id: number, name: string }[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Add this helper function inside your component or in a separate utils file
    const getPaginationRange = (current: number, total: number) => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (current <= 3) {
            return [1, 2, 3, 4, '...', total];
        }

        if (current >= total - 2) {
            return [1, '...', total - 3, total - 2, total - 1, total];
        }

        return [
            1,
            '...',
            current - 1,
            current,
            current + 1,
            '...',
            total
        ];
    };

    const fetchRegistrations = useCallback(async () => {
        try {
            const allRegistrations = await registrationService.getAll();
            setRegistrations(allRegistrations);
        } catch (error) {
            console.error(error);
        }
    }, []);

    // results in '2022-06-23'

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    useEffect(() => {
            fetchCategories();
          }, []);
        
          const fetchCategories = async () => {
            try {
              setLoading(true);
              const data = await getAllCategories();
              setCategories(data);
            } catch (error: any) {
                console.error("failed to load categories!")
            } finally {
              setLoading(false);
            }
          };
    

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await schoolService.getAll(); // adjust based on your actual API
                setSchools(response);
            } catch (error) {
                console.error('Error fetching schools:', error);
            }
        };
        fetchSchools();
    }, []);

    const getSchoolName = (id: number | undefined | null): string => {
        const school = schools.find(s => s.id === id);
        return school ? school.name : 'Unknown';
    };

    const classOptionsForSelectedSchool = registrations
        .filter(r => r.school_id?.toString() === selectedSchoolId)
        .map(r => r.class_applying_for)
        .filter(Boolean);

    const uniqueClasses = Array.from(new Set(classOptionsForSelectedSchool));

    const schoolOptions = Array.from(new Set(
        registrations.map(r => getSchoolName(r.school_id)).filter(Boolean)
    ));

    const classOptions = Array.from(
        new Set(registrations.map(r => r.class_applying_for).filter(Boolean))
    );


    const handleDeleteRegistration = async (id: number) => {
        try {
            await registrationService.remove(id);
            setRegistrations(registrations.filter((registration) => registration.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

const handleUpdateRegistration = async (id: number, data: RegistrationUpdateInput) => {
  try {
    const updatedRegistration = await registrationService.updatePartial(id, data);
    setRegistrations((prev) =>
      prev.map((registration) =>
        registration.id === id ? updatedRegistration : registration
      )
    );
  } catch (error) {
    console.error(error);
  }
};



    const handleDeleteClick = (registration: RegistrationData) => {
        setSelectedRegistration(registration);
        setIsDeleteDialogOpen(true);
    };

    const handleEditClick = (registration: RegistrationData) => {
        setSelectedRegistration(registration);
        setIsEditDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedRegistration?.id) {
            try {
                await handleDeleteRegistration(selectedRegistration.id);
                toast.success("Registration deleted successfully");
            } catch (error) {
                toast.error("Failed to delete registration");
            }
        }
        setIsDeleteDialogOpen(false);
        setSelectedRegistration(null);
    };


const handleSubmitEdit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedRegistration?.id) return;

  try {
    const formattedDOB = new Date(selectedRegistration.date_of_birth || '')
      .toISOString()
      .split('T')[0];

    const payload = {
      school_id: selectedRegistration.school_id,
      student_id: selectedRegistration.student_id,
      scores: selectedRegistration.scores ?? 0,
      status: selectedRegistration.status ?? 'pending',
      class_id: selectedRegistration.class_id,
      academic_year_id: selectedRegistration.academic_year_id,
      first_name: selectedRegistration.first_name,
      middle_name: selectedRegistration.middle_name,
      last_name: selectedRegistration.last_name,
      date_of_birth: formattedDOB,
      class_applying_for: selectedRegistration.class_applying_for,
      gender: selectedRegistration.gender as 'Male' | 'Female',
      email: selectedRegistration.email ?? '',
      phone_number: selectedRegistration.phone_number ?? '',
      category: selectedRegistration.category,
      address: selectedRegistration.address ?? '',
      guardian_name: selectedRegistration.guardian_name ?? '',
      relationship: selectedRegistration.relationship ?? '',
      guardian_phone_number: selectedRegistration.guardian_phone_number ?? '',
    };

    console.log('Updating with payload:', payload);

    // ✅ Actually update via your service
    await handleUpdateRegistration(selectedRegistration.id, payload);

    // ✅ Feedback + Refresh + Cleanup
    toast.success('Registration updated successfully');
    await fetchRegistrations(); // make sure this awaits
    setIsEditDialogOpen(false); // close the form/dialog
    setSelectedRegistration(null); // clear selection
  } catch (err) {
    console.error(err);
    toast.error('Failed to update registration');
  }
};


const handleChange = (field: keyof RegistrationData, value: any) => {
  setSelectedRegistration((prev) => ({
    ...prev!,
    [field]: value,
  }));
};



    // --- Sorting ---
    const sortedApplicants = React.useMemo(() => {
        let sortableItems = [...applicants];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [applicants, sortConfig]);

    // --- Filtering ---
    const filteredRegistrations = registrations.filter((r) => {
        const matchesSearch = (
            r.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.class_applying_for?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesClass = selectedClass === 'All' || r.class_applying_for === selectedClass;
        const matchesSchool = selectedSchool === 'All' || getSchoolName(r.school_id) === selectedSchool;

        return matchesSearch && matchesClass && matchesSchool;
    });

    // --- Pagination ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // --- Effects ---
    useEffect(() => {
        if (!open) {
            setEditApplicant(null);
            setName('');
            setEmail('');
            setPhone('');
            setRole('');
            setStatus('pending');
        }
    }, [open]);

    // --- Print and Export Functions ---


    const handlePrintExcel = (registration: RegistrationData) => {
        const data = [
            ['Registration Receipt'],
            ['Registration ID', registration.id],
            ['Date', new Date().toLocaleDateString()],
            [''],
            ['Student Information'],
            ['Name', `${registration.first_name} ${registration.last_name}`],
            ['Class', registration.class_applying_for],
            ['Email', registration.email],
            ['Phone', registration.phone_number],
            [''],
            ['Guardian Information'],
            ['Name', registration.guardian_name],
            ['Relationship', registration.relationship],
            ['Phone', registration.guardian_phone_number],
            [''],
            ['Payment Details'],
            ['Registration Fee', 'XXX.XX'],
            ['Status', registration.status],
        ];

        const csvContent = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `registration-receipt-${registration.id}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = (registration: RegistrationData) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
            <html>
                <head>
                    <title>Official School Registration Receipt</title>
                    <style>
                        @media print {
                            @page { 
                                size: A4; 
                                margin: 1.5cm; 
                            }
                            body {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                        }
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body { 
                            font-family: 'Times New Roman', serif;
                            line-height: 1.4;
                            color: #2c3e50;
                            background: #ffffff;
                            padding: 20px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        
                        .receipt-container {
                            border: 3px solid #1e40af;
                            border-radius: 8px;
                            overflow: hidden;
                            background: #ffffff;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        
                        .header-banner {
                            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                            color: white;
                            padding: 20px;
                            text-align: center;
                            position: relative;
                        }
                        
                        .header-banner::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                            opacity: 0.3;
                        }
                        
                        .logo-section {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 20px;
                            margin-bottom: 15px;
                            position: relative;
                            z-index: 1;
                        }
                        
                        .logo {
                            width: 80px;
                            height: 80px;
                            background: white;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        }
                        
                        .logo img {
                            width: 60px;
                            height: 60px;
                            object-fit: contain;
                        }
                        
                        .school-info {
                            text-align: center;
                            position: relative;
                            z-index: 1;
                        }
                        
                        .school-name {
                            font-size: 28px;
                            font-weight: bold;
                            margin-bottom: 5px;
                            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                        }
                        
                        .school-subtitle {
                            font-size: 16px;
                            opacity: 0.9;
                            font-style: italic;
                        }
                        
                        .receipt-title {
                            background: #f8fafc;
                            border-bottom: 2px solid #e2e8f0;
                            padding: 15px 20px;
                            text-align: center;
                        }
                        
                        .receipt-title h2 {
                            font-size: 24px;
                            color: #1e40af;
                            margin-bottom: 8px;
                            font-weight: bold;
                        }
                        
                        .receipt-meta {
                            display: flex;
                            justify-content: space-between;
                            font-size: 14px;
                            color: #64748b;
                        }
                        
                        .content-body {
                            padding: 25px;
                        }
                        
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 25px;
                            margin-bottom: 25px;
                        }
                        
                        .info-section {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 20px;
                            position: relative;
                            overflow: hidden;
                        }
                        
                        .info-section::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 4px;
                            height: 100%;
                            background: linear-gradient(to bottom, #3b82f6, #1e40af);
                        }
                        
                        .section-title {
                            font-size: 16px;
                            font-weight: bold;
                            color: #1e40af;
                            margin-bottom: 15px;
                            padding-bottom: 8px;
                            border-bottom: 1px solid #cbd5e1;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        
                        .section-icon {
                            width: 20px;
                            height: 20px;
                            background: #1e40af;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 12px;
                        }
                        
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 10px;
                            padding: 8px 0;
                            border-bottom: 1px dotted #cbd5e1;
                        }
                        
                        .info-row:last-child {
                            border-bottom: none;
                            margin-bottom: 0;
                        }
                        
                        .info-label {
                            font-weight: 600;
                            color: #374151;
                            font-size: 14px;
                        }
                        
                        .info-value {
                            color: #1f2937;
                            font-weight: 500;
                            text-align: right;
                            font-size: 14px;
                        }
                        
                        .exam-section {
                            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                            border: 2px solid #f59e0b;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 25px 0;
                            text-align: center;
                        }
                        
                        .exam-title {
                            font-size: 20px;
                            font-weight: bold;
                            color: #92400e;
                            margin-bottom: 15px;
                        }
                        
                        .exam-details {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 15px;
                        }
                        
                        .exam-item {
                            background: rgba(255, 255, 255, 0.8);
                            padding: 10px;
                            border-radius: 5px;
                            border: 1px solid rgba(245, 158, 11, 0.3);
                        }
                        
                        .exam-item-label {
                            font-weight: bold;
                            color: #92400e;
                            font-size: 12px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .exam-item-value {
                            font-size: 16px;
                            color: #451a03;
                            margin-top: 2px;
                        }
                        
                        .payment-section {
                            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                            border: 2px solid #10b981;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        
                        .payment-title {
                            font-size: 18px;
                            font-weight: bold;
                            color: #047857;
                            margin-bottom: 15px;
                            text-align: center;
                        }
                        
                        .status-badge {
                            display: inline-block;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .status-confirmed {
                            background: #d1fae5;
                            color: #047857;
                            border: 1px solid #10b981;
                        }
                        
                        .status-pending {
                            background: #fef3c7;
                            color: #92400e;
                            border: 1px solid #f59e0b;
                        }
                        
                        .footer-section {
                            background: #f1f5f9;
                            padding: 20px;
                            text-align: center;
                            border-top: 2px solid #e2e8f0;
                        }
                        
                        .footer-message {
                            font-size: 16px;
                            color: #475569;
                            margin-bottom: 10px;
                            font-style: italic;
                        }
                        
                        .contact-info {
                            font-size: 14px;
                            color: #64748b;
                        }
                        
                        .signatures {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #cbd5e1;
                        }
                        
                        .signature-box {
                            text-align: center;
                            width: 200px;
                        }
                        
                        .signature-line {
                            border-bottom: 2px solid #374151;
                            margin-bottom: 5px;
                            height: 40px;
                        }
                        
                        .signature-label {
                            font-size: 12px;
                            color: #6b7280;
                            font-weight: 600;
                        }
                        
                        .watermark {
                            position: fixed;
                            bottom: 20px;
                            right: 20px;
                            opacity: 0.05;
                            transform: rotate(-15deg);
                            font-size: 80px;
                            font-weight: bold;
                            color: #1e40af;
                            z-index: -1;
                            pointer-events: none;
                        }
                        
                        .receipt-number {
                            font-family: 'Courier New', monospace;
                            font-weight: bold;
                            font-size: 16px;
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <!-- Header Banner -->
                        <div class="header-banner">
                            <div class="logo-section">
                                <div class="logo">
                                    <img src="/logo.png" alt="School Logo" onerror="this.style.display='none'"/>
                                </div>
                                <div class="school-info">
                                    <div class="school-name">EXCELLENCE ACADEMY</div>
                                    <div class="school-subtitle">Excellence in Education Since 1985</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Receipt Title -->
                        <div class="receipt-title">
                            <h2>OFFICIAL REGISTRATION RECEIPT</h2>
                            <div class="receipt-meta">
                                <span>Receipt No: <span class="receipt-number">#${registration.id || 'REG-' + Date.now()}</span></span>
                                <span>Date: ${new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</span>
                            </div>
                        </div>
                        
                        <!-- Content Body -->
                        <div class="content-body">
                            <!-- Student and Guardian Info Grid -->
                            <div class="info-grid">
                                <!-- Student Information -->
                                <div class="info-section">
                                    <div class="section-title">
                                        <div class="section-icon">👨‍🎓</div>
                                        Student Information
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Full Name:</span>
                                        <span class="info-value">${registration.first_name || 'N/A'} ${registration.last_name || ''}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Class Applied:</span>
                                        <span class="info-value">${registration.class_applying_for || 'N/A'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Category:</span>
                                        <span class="info-value">${registration.category || 'Regular'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Phone Number:</span>
                                        <span class="info-value">${registration.phone_number || 'N/A'}</span>
                                    </div>
                                </div>
                                
                                <!-- Guardian Information -->
                                <div class="info-section">
                                    <div class="section-title">
                                        <div class="section-icon">👥</div>
                                        Guardian Information
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Guardian Name:</span>
                                        <span class="info-value">${registration.guardian_name || 'N/A'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Relationship:</span>
                                        <span class="info-value">${registration.relationship || 'Parent'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Contact Number:</span>
                                        <span class="info-value">${registration.guardian_phone_number || 'N/A'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Front Desk Officer:</span>
                                        <span class="info-value">${user?.full_name || 'Mrs. Sarah Johnson'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Exam Information -->
                            <div class="exam-section">
                                <div class="exam-title">📋 3G.S.E.C. EXAMINATION DETAILS</div>
                                <div class="exam-details">
                                    <div class="exam-item">
                                        <div class="exam-item-label">Exam Date</div>
                                        <div class="exam-item-value">${'15th March, 2025'}</div>
                                    </div>
                                    <div class="exam-item">
                                        <div class="exam-item-label">Venue</div>
                                        <div class="exam-item-value">${'Main Hall, Block A'}</div>
                                    </div>
                                    <div class="exam-item">
                                        <div class="exam-item-label">Time</div>
                                        <div class="exam-item-value">'9:00 AM - 12:00 PM'</div>
                                    </div>
                                    <div class="exam-item">
                                        <div class="exam-item-label">Reporting Time</div>
                                        <div class="exam-item-value">${'8:30 AM'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Payment Information -->
                            <div class="payment-section">
                                <div class="payment-title">💳 Payment Details</div>
                                <div class="info-grid">
                                    <div class="info-row">
                                        <span class="info-label">Registration Fee:</span>
                                        <span class="info-value">$${'150.00'}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Payment Status:</span>
                                        <span class="info-value">
                                            <span class="status-badge ${(registration.status || 'confirmed').toLowerCase() === 'confirmed' ? 'status-confirmed' : 'status-pending'}">
                                                ${registration.status || 'CONFIRMED'}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Signatures -->
                            <div class="signatures">
                                <div class="signature-box">
                                    <div class="signature-line"></div>
                                    <div class="signature-label">Student/Guardian Signature</div>
                                </div>
                                <div class="signature-box">
                                    <div class="signature-line"></div>
                                    <div class="signature-label">Authorized Officer</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer-section">
                            <div class="footer-message">
                                Thank you for choosing Excellence Academy. We look forward to welcoming you to our academic family.
                            </div>
                            <div class="contact-info">
                                📧 admissions@excellenceacademy.edu | 📞 +1 (555) 123-4567 | 🌐 www.excellenceacademy.edu
                            </div>
                        </div>
                    </div>
                    
                    <!-- Watermark -->
                    <div class="watermark">OFFICIAL</div>
                </body>
            </html>
        `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handlePrintTable = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Registrations Table</title>
                        <style>
                            @media print {
                                @page { size: landscape; margin: 2cm; }
                            }
                            body { 
                                font-family: Arial, sans-serif;
                                padding: 20px;
                            }
                            .logo {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .logo img {
                                height: 60px;
                                width: auto;
                            }
                            .header {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 20px;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: left;
                            }
                            th {
                                background-color: #f4f4f4;
                            }
                            .footer {
                                margin-top: 20px;
                                text-align: center;
                                font-size: 0.9em;
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        
                        <div class="header">
                            <p>Total Records: ${filteredRegistrations.length}</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Gender</th>
                                    <th>Scores</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredRegistrations.map((registration, idx) => `
                                    <tr>
                                        <td>${idx + 1}</td>
                                        <td>${registration.registration_date
                    ? new Date(registration.registration_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                    })
                    : ''}</td>
                                        <td>${registration.first_name} ${registration.middle_name} ${registration.last_name}</td>
                                       
                                        <td>${registration.class_applying_for}</td>
                                        <td>${registration.gender}</td>
                                        <td>${registration.scores ?? ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    // --- UI ---
    return (
        <div className= "p-4 md:p-8" >
        
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4 md:mb-6 flex items-center gap-2" >
            <Users className="w-6 h-6 md:w-8 md:h-8" />
                Applicant Management
                    </h1>

    {/* Search and Add Button */ }
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6" >
        <div className="flex items-center gap-2 w-full md:w-auto" >
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Input
                        type="text"
    placeholder = "Search applicants..."
    value = { searchQuery }
    onChange = {(e) => setSearchQuery(e.target.value)}
className = "w-full md:w-64"
    />
    </div>
    < Select value = { selectedClass } onValueChange = { setSelectedClass } >
        <SelectTrigger className="w-48" >
            <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All" > All Classes </SelectItem>
{
    classOptions.map((cls, i) => (
        <SelectItem key= { i } value = { cls } > { cls } </SelectItem>
    ))
}
</SelectContent>
    </Select>

    < div className = "flex items-center gap-y-2" >
        <Button
  onClick={ handlePrintTable }
className = "bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
    >
    <Printer className="w-4 h-4" />
        Print Class List
            </Button>
            </div>
            < div className = "flex items-center gap-y-2" >
                <Button
          onClick={ () => router.push('/registration/new') }
className = "bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
disabled = { loading }
    >
    <Plus className="w-4 h-4" />
        Add Registration
            </Button>
{ loading && <Loader className="ml-2" />}
</div>
    </div>

{/* Table */ }
<div className="rounded-md border" >
    <Table>
    <TableHeader>
    <TableRow>
    <TableHead className="w-[50px]" > No.</TableHead>
        < TableHead >
        <Button
                                    variant="ghost"
className = "h-8 px-0 font-normal"
    >
    <span>Date </span>
    </Button>
    </TableHead>
    < TableHead className = "w-[100px]" >
        <Button
                                    variant="ghost"
className = "h-8 px-0 font-normal"
    >
    <span>First Name </span>
        </Button>
        </TableHead>
        < TableHead >
        <Button
                                    variant="ghost"
className = "h-8 px-0 font-normal"
    >
    <span>Last Name </span>
        </Button>
        </TableHead>
<TableHead>
    <Button
                            variant="ghost"
className = "h-8 px-0 font-normal"
    >
    <span>Date of Birth </span>
        </Button>
        </TableHead>
        < TableHead >
        <Button
                            variant="ghost"
className = "h-8 px-0 font-normal"
    >
    <span>Class Applying For </span>
        </Button>
        </TableHead>
        < TableHead >
        <Button
                                    variant="ghost"
className = "h-8 px-0 font-normal"
    >
    <span>Gender </span>
    </Button>
    </TableHead>

    < TableHead >
    <Button
                                    variant="ghost"
className = "h-8 px-0 font-normal"
    >
    <span>Registration</span>
    </Button>
    </TableHead>
    < TableHead >
    <Button
                                    variant="ghost"
className = "h-8 px-0 font-normal"
    >
    <span>Payment Method </span>
        </Button>
        </TableHead>
        < TableHead className = "text-right" > Actions </TableHead>
            </TableRow>
            </TableHeader>
            < TableBody >
            <AnimatePresence>
            {
                currentItems.map((registration, idx) => (
                    <motion.tr
                                    key= { registration.id?.toString() }
                                    initial = {{ opacity: 0, x: -20 }}
animate = {{ opacity: 1, x: 0 }}
exit = {{ opacity: 0, x: 20 }}
transition = {{ duration: 0.2 }}
                                >
    <TableCell>{ idx + 1}</TableCell>
        <TableCell>
{/* Format registration.registration_date as "MMM dd, yyyy" if available */ }
{
    registration.registration_date
    ? new Date(registration.registration_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    })
    : ''
}
</TableCell>
    < TableCell className = "font-medium" > { registration.first_name } </TableCell>
        < TableCell > { registration.last_name } </TableCell>

<TableCell>
    {/* Format date_of_birth as "MMM dd, yyyy" if available */ }
{
    registration.date_of_birth
    ? new Date(registration.date_of_birth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    })
    : ''
}
</TableCell>
    < TableCell > { registration.class_applying_for } </TableCell>
    < TableCell >
    <Badge variant="secondary" >
        { registration.gender }
        </Badge>
        </TableCell>

        < TableCell >
        <Badge variant="secondary" >
            { registration.payment_status }
            </Badge>
            </TableCell>
            < TableCell >
            <Badge variant="secondary" >
                { registration.payment_type }
                </Badge>
                </TableCell>
                < TableCell className = "flex justify-end gap-2" >
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild >
                    <Button
                                                    variant="outline"
size = "icon"
className = "hover:bg-gray-200 dark:hover:bg-gray-700"
    >
    <Download className="h-4 w-4" />
        </Button>
        </DropdownMenuTrigger>
        < DropdownMenuContent align = "end" >
            <DropdownMenuItem onClick={ () => handlePrintExcel(registration) }>
                Download Excel
                    </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
{
    user?.role_id === 1 && (
        <>
        <Button
                                                    variant="outline"
    size = "icon"
    onClick = {() => handleEditClick(registration)
}
className = "hover:bg-gray-200 dark:hover:bg-gray-700"
    >
    <Edit className="h-4 w-4" />
        </Button>
        < Button
variant = "destructive"
size = "icon"
onClick = {() => handleDeleteClick(registration)}
className = "hover:bg-red-700"
    >
    <Trash2 className="h-4 w-4" />
        </Button>
        </>
                                        )}
</TableCell>
    </motion.tr>
                            ))}
</AnimatePresence>
    </TableBody>
    </Table>
    </div>

{/* Pagination */ }
{
    filteredRegistrations.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4" >
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400" >
                <span>Rows per page: </span>
                    < Select
    value = { pageSize.toString() }
    onValueChange = {(value) => {
        setPageSize(Number(value));
        setCurrentPage(1);
    }
}
                        >
    <SelectTrigger className="h-8 w-[70px]" >
        <SelectValue>{ pageSize } </SelectValue>
        </SelectTrigger>
        <SelectContent>
{
    [5, 10, 20, 50, 100].map((size) => (
        <SelectItem key= { size } value = { size.toString() } >
        { size }
        </SelectItem>
    ))
}
</SelectContent>
    </Select>
    <span>
{ indexOfFirstItem + 1 } -{ Math.min(indexOfLastItem, filteredRegistrations.length) } of{ " " }
{ filteredRegistrations.length } items
    </span>
    </div>

    < div className = "flex items-center gap-2" >
        <Button
                            variant="outline"
size = "sm"
onClick = {() => setCurrentPage(1)}
disabled = { currentPage === 1}
className = "hidden sm:flex"
    >
    <span className="sr-only" > Go to first page </span>
        < ChevronFirst className = "h-4 w-4" />
            </Button>
            < Button
variant = "outline"
size = "sm"
onClick = {() => setCurrentPage(prev => Math.max(prev - 1, 1))}
disabled = { currentPage === 1}
                        >
    <span className="sr-only" > Go to previous page </span>
        < ChevronLeft className = "h-4 w-4" />
            </Button>

            < div className = "flex items-center gap-2" >
                {
                    getPaginationRange(currentPage, Math.ceil(filteredRegistrations.length / pageSize)).map((page, i) => (
                        <React.Fragment key= { i } >
                            { page === '...' ? (
                                <span className= "px-2" >...</span>
                    ) : (
                        <Button
                                            variant={ currentPage === page ? 'default' : 'outline'}
                        size = "sm"
                                            onClick = {() => paginate(Number(page))}
                        className = {
                            cn(
                                                "hidden sm:flex",
                                currentPage === page
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                                        >
    { page }
    </Button>
                                    )}
</React.Fragment>
                            ))}
</div>

    < Button
variant = "outline"
size = "sm"
onClick = {() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRegistrations.length / pageSize)))}
disabled = { currentPage === Math.ceil(filteredRegistrations.length / pageSize)}
                        >
    <span className="sr-only" > Go to next page </span>
        < ChevronRight className = "h-4 w-4" />
            </Button>
            < Button
variant = "outline"
size = "sm"
onClick = {() => setCurrentPage(Math.ceil(filteredRegistrations.length / pageSize))}
disabled = { currentPage === Math.ceil(filteredRegistrations.length / pageSize)}
className = "hidden sm:flex"
    >
    <span className="sr-only" > Go to last page </span>
        < ChevronLast className = "h-4 w-4" />
            </Button>
            </div>
            </div>
            )}

{/* Delete Confirmation Dialog */ }
<AlertDialog open={ isDeleteDialogOpen } onOpenChange = { setIsDeleteDialogOpen } >
    <AlertDialogContent>
    <AlertDialogHeader>
    <AlertDialogTitle>Are you sure you want to delete this registration ? </AlertDialogTitle>
        <AlertDialogDescription>
                            This action cannot be undone.This will permanently delete the registration
for { selectedRegistration?.first_name } { selectedRegistration?.last_name }.
                        </AlertDialogDescription>
    </AlertDialogHeader>
    < AlertDialogFooter >
    <AlertDialogCancel onClick= {() => setIsDeleteDialogOpen(false)}> Cancel </AlertDialogCancel>
        < AlertDialogAction
onClick = { confirmDelete }
className = "bg-red-600 hover:bg-red-700"
    >
    Delete
    </AlertDialogAction>
    </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>

{/* Edit Confirmation Dialog */ }
<AlertDialog open={showConfirmEdit} onOpenChange={setShowConfirmEdit}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm Edit Registration</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to edit {selectedRegistration?.first_name} {selectedRegistration?.last_name}?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => setShowConfirmEdit(false)}>
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={() => {
          // ✅ Close confirm and open edit form
          setShowConfirmEdit(false);
          setShowEditForm(true);
        }}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Yes, Edit
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>


<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Edit Registration</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmitEdit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div>
      <label className="block text-sm font-medium mb-1">First Name</label>
      <Input
        placeholder="First Name"
        value={selectedRegistration?.first_name || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, first_name: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Middle Name</label>
      <Input
        placeholder="Middle Name"
        value={selectedRegistration?.middle_name || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, middle_name: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Last Name</label>
      <Input
        placeholder="Last Name"
        value={selectedRegistration?.last_name || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, last_name: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Date of Birth</label>
      <Input
        type="date"
        placeholder="Date of Birth"
        value={
          selectedRegistration?.date_of_birth
            ? new Date(selectedRegistration.date_of_birth).toISOString().split('T')[0]
            : ''
        }
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, date_of_birth: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Class Applying For</label>
      <Input
        placeholder="Class Applying For"
        value={selectedRegistration?.class_applying_for || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, class_applying_for: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Gender</label>
      <Input
        placeholder="Gender"
        value={selectedRegistration?.gender || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, gender: e.target.value as 'Male' | 'Female' }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Email</label>
      <Input
        placeholder="Email"
        value={selectedRegistration?.email || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, email: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Phone Number</label>
      <Input
        placeholder="Phone Number"
        value={selectedRegistration?.phone_number || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, phone_number: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Address</label>
      <Input
        placeholder="Address"
        value={selectedRegistration?.address || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, address: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Guardian Name</label>
      <Input
        placeholder="Guardian Name"
        value={selectedRegistration?.guardian_name || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, guardian_name: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Relationship</label>
      <Input
        placeholder="Relationship"
        value={selectedRegistration?.relationship || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({ ...prev!, relationship: e.target.value }))
        }
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Guardian Phone Number</label>
      <Input
        placeholder="Guardian Phone Number"
        value={selectedRegistration?.guardian_phone_number || ''}
        onChange={(e) =>
          setSelectedRegistration((prev) => ({
            ...prev!,
            guardian_phone_number: e.target.value,
          }))
        }
      />
    </div>

    <div>
  <label className="block text-sm font-medium mb-1">
    Category <span className="text-red-500">*</span>
  </label>
<Select
  onValueChange={(value) => handleChange('category', parseInt(value))}
  value={selectedRegistration?.category?.toString() || ""}
>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select Category" />
    </SelectTrigger>
    <SelectContent>
      {categories.map((category) => (
        <SelectItem key={category.id} value={category.id.toString()}>
          {category.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

    </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

    </div>
    );
};

export default ApplicantManagement;
