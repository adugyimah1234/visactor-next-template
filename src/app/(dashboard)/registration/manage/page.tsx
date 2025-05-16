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
import registrationService, { type RegistrationData } from '@/services/registrations';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

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

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);

    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

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

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const addApplicant = useCallback(() => {
        if (!name.trim() || !email.trim() || !phone.trim()) {
            alert('Please fill in all fields.'); // Basic validation
            return;
        }
        const newApplicant: Applicant = {
            id: crypto.randomUUID(),
            name,
            email,
            phone,
            role,
            status,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        };
        setApplicants((prevApplicants) => [...prevApplicants, newApplicant]);
        setOpen(false); // Close dialog
        // Reset form fields
        setName('');
        setEmail('');
        setPhone('');
        setRole('');
        setStatus('pending');
    }, [name, email, phone, role, status]);

    const addRegistration = useCallback(async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim()) {
            alert('Please fill in all fields.');
            return;
        }
        const newRegistration: RegistrationData = {
            id: Date.now(),
            first_name: firstName,
            last_name: lastName,
            email,
            phone_number: phoneNumber,
            date_of_birth: dateOfBirth,
            class_applying_for: classApplyingFor,
            gender: gender as "Male" | "Female" | "Other",
            address,
            category: '',
            academic_year: '',
            guardian_name: guardianName,
            relationship,
            scores: 0,
            status: 'Pending',
            guardian_phone_number: guardianPhoneNumber,
            school_id: 0,
            student_id: 0,
            class_id: 0,
            academic_year_id: 0
        };
        try {
            await registrationService.create(newRegistration);
            setIsRegistrationFormOpen(false);
            // Reset form fields
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhoneNumber('');
            setDateOfBirth('');
            setClassApplyingFor('');
            setGender('Male');
            setAddress('');
            setGuardianName('');
            setRelationship('');
            setGuardianPhoneNumber('');
            // Refresh registrations
            fetchRegistrations();
        } catch (error) {
            console.error(error);
        }
    }, [
        firstName, lastName, email, phoneNumber, dateOfBirth, classApplyingFor, gender,
        address, guardianName, relationship, guardianPhoneNumber, fetchRegistrations
    ]);

    const handleDeleteRegistration = async (id: number) => {
        try {
            await registrationService.remove(id);
            setRegistrations(registrations.filter((registration) => registration.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateRegistration = async (id: number, data: RegistrationData) => {
        try {
            const updatedRegistration = await registrationService.update(id, data);
            setRegistrations(registrations.map((registration) => (registration.id === id ? updatedRegistration : registration)));
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (applicant: Applicant) => {
        setEditApplicant(applicant);
        setName(applicant.name);
        setEmail(applicant.email);
        setPhone(applicant.phone);
        setRole(applicant.role);
        setStatus(applicant.status);
        setOpen(true); // Reuse the dialog
    };

    const deleteApplicant = (id: string) => {
        setApplicants(prevApplicants => prevApplicants.filter(app => app.id !== id));
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

    const confirmEdit = async () => {
        if (selectedRegistration?.id) {
            try {
                await handleUpdateRegistration(selectedRegistration.id, {
                    ...selectedRegistration,
                    school_id: selectedRegistration.school_id,
                    student_id: selectedRegistration.student_id,
                    class_id: selectedRegistration.class_id,
                    academic_year_id: selectedRegistration.academic_year_id,
                    first_name: selectedRegistration.first_name,
                    last_name: selectedRegistration.last_name,
                    academic_year: selectedRegistration.academic_year ?? '',
                    date_of_birth: selectedRegistration.date_of_birth,
                    class_applying_for: selectedRegistration.class_applying_for,
                    gender: selectedRegistration.gender,
                    phone_number: selectedRegistration.phone_number,
                    address: selectedRegistration.address,
                    guardian_name: selectedRegistration.guardian_name,
                    relationship: selectedRegistration.relationship,
                    guardian_phone_number: selectedRegistration.guardian_phone_number,
                    category: selectedRegistration.category ?? '',
                    scores: selectedRegistration.scores ?? 0,
                    status: selectedRegistration.status ?? 'Pending'
                });
                toast.success("Registration updated successfully");
                // Refresh the registrations list
                fetchRegistrations();
            } catch (error) {
                toast.error("Failed to update registration");
                console.error(error);
            }
        }
        setIsEditDialogOpen(false);
        setSelectedRegistration(null);
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
    const filteredRegistrations = registrations.filter(registration =>
    (registration.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registration.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registration.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registration.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        registration.class_applying_for?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
    const handlePrintPDF = (registration: RegistrationData) => {
        const receiptContent = `
            REGISTRATION RECEIPT
            -------------------
            Registration ID: ${registration.id}
            Date: ${new Date().toLocaleDateString()}
            
            Student Information:
            ------------------
            Name: ${registration.first_name} ${registration.last_name}
            Class: ${registration.class_applying_for}
            Email: ${registration.email}
            Phone: ${registration.phone_number}
            
            Guardian Information:
            -------------------
            Name: ${registration.guardian_name}
            Relationship: ${registration.relationship}
            Phone: ${registration.guardian_phone_number}
            
            Payment Details:
            --------------
            Registration Fee: $XXX.XX
            Status: ${registration.status}
        `;

        const blob = new Blob([receiptContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `registration-receipt-${registration.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

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
                        <title>Registration Receipt</title>
                        <style>
                            @media print {
                                @page { size: A4; margin: 2cm; }
                            }
                            body { 
                                font-family: Arial, sans-serif; 
                                padding: 20px;
                                max-width: 800px;
                                margin: 0 auto;
                            }
                            .logo {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .logo img {
                                height: 80px;
                                width: auto;
                            }
                            .header { 
                                text-align: center; 
                                margin-bottom: 30px;
                                border-bottom: 2px solid #333;
                                padding-bottom: 20px;
                            }
                            .section { 
                                margin-bottom: 20px;
                                padding: 15px;
                                background: #f8f9fa;
                                border-radius: 5px;
                            }
                            .section-title { 
                                font-weight: bold;
                                border-bottom: 1px solid #dee2e6;
                                margin-bottom: 10px;
                                padding-bottom: 5px;
                                color: #2c5282;
                            }
                            .row { 
                                display: flex;
                                margin-bottom: 8px;
                                padding: 4px 0;
                            }
                            .label { 
                                font-weight: bold;
                                width: 150px;
                                color: #4a5568;
                            }
                            .footer {
                                margin-top: 40px;
                                text-align: center;
                                font-size: 0.9em;
                                color: #666;
                            }
                            .watermark {
                                position: fixed;
                                bottom: 10px;
                                right: 10px;
                                opacity: 0.1;
                                transform: rotate(-45deg);
                                font-size: 60px;
                                z-index: -1;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="logo">
                            <img src="/logo.png" alt="School Logo"/>
                        </div>
                        <div class="header">
                            <h1>Registration Receipt</h1>
                            <p>Registration ID: ${registration.id}</p>
                            <p>Date: ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Student Information</div>
                            <div class="row">
                                <span class="label">Name:</span>
                                <span>${registration.first_name} ${registration.last_name}</span>
                            </div>
                            <div class="row">
                                <span class="label">Class:</span>
                                <span>${registration.class_applying_for}</span>
                            </div>
                            <div class="row">
                                <span class="label">Email:</span>
                                <span>${registration.email}</span>
                            </div>
                            <div class="row">
                                <span class="label">Phone:</span>
                                <span>${registration.phone_number}</span>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Guardian Information</div>
                            <div class="row">
                                <span class="label">Name:</span>
                                <span>${registration.guardian_name}</span>
                            </div>
                            <div class="row">
                                <span class="label">Relationship:</span>
                                <span>${registration.relationship}</span>
                            </div>
                            <div class="row">
                                <span class="label">Phone:</span>
                                <span>${registration.guardian_phone_number}</span>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">Payment Details</div>
                            <div class="row">
                                <span class="label">Registration Fee:</span>
                                <span>$XXX.XX</span>
                            </div>
                            <div class="row">
                                <span class="label">Status:</span>
                                <span>${registration.status}</span>
                            </div>
                        </div>

                        <div class="footer">
                            <p>Thank you for choosing our institution</p>
                            <p>For any queries, please contact: support@school.com</p>
                        </div>

                        <div class="watermark">
                            OFFICIAL RECEIPT
                        </div>
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
                        <div class="logo">
                            <img src="/logo.png" alt="School Logo"/>
                        </div>
                        <div class="header">
                            <h1>Registration Records</h1>
                            <p>Generated on: ${new Date().toLocaleDateString()}</p>
                            <p>Total Records: ${filteredRegistrations.length}</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Date of Birth</th>
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
                                        <td>${registration.date_of_birth 
                                            ? new Date(registration.date_of_birth).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: '2-digit',
                                            })
                                            : ''}</td>
                                        <td>${registration.class_applying_for}</td>
                                        <td>${registration.gender}</td>
                                        <td>${registration.scores ?? ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="footer">
                            <p>Generated from the School Management System</p>
                            <p>Date: ${new Date().toLocaleDateString()}</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    // --- UI ---
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4 md:mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 md:w-8 md:h-8" />
                Applicant Management
            </h1>

            {/* Search and Add Button */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search applicants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64"
                    />
                </div>
                <div className="flex items-center gap-y-2">
                    <Button
                        onClick={() => router.push('/registration/new')}
                        className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                        disabled={loading}
                    >
                        <Plus className="w-4 h-4" />
                        Add Registration
                    </Button>
                    {loading && <Loader className="ml-2" />}
                </div>
                <div className="flex items-center gap-y-2">
                    <Button
                        onClick={handlePrintTable}
                        className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print Table
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">No.</TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Date</span>
                                </Button>
                            </TableHead>
                            <TableHead className="w-[100px]">
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>First Name</span>
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Last Name</span>
                                </Button>
                            </TableHead>
                            {/* <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Email</span>
                                </Button>
                            </TableHead> */}
                            {/* <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Phone Number</span>
                                </Button>
                            </TableHead> */}
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Date of Birth</span>
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Class Applying For</span>
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Gender</span>
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Scores</span>
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {currentItems.map((registration, idx) => (
                                <motion.tr
                                    key={registration.id?.toString()}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>
                                        {/* Format registration.registration_date as "MMM dd, yyyy" if available */}
                                        {registration.registration_date
                                            ? new Date(registration.registration_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: '2-digit',
                                            })
                                            : ''}
                                    </TableCell>
                                    <TableCell className="font-medium">{registration.first_name}</TableCell>
                                    <TableCell>{registration.last_name}</TableCell>
                                    {/* <TableCell>{registration.email}</TableCell> */}
                                    {/* <TableCell>{registration.phone_number}</TableCell> */}
                                    <TableCell>
                                        {/* Format date_of_birth as "MMM dd, yyyy" if available */}
                                        {registration.date_of_birth
                                            ? new Date(registration.date_of_birth).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: '2-digit',
                                            })
                                            : ''}
                                    </TableCell>
                                    <TableCell>{registration.class_applying_for}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {registration.gender}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {/* Show registration.scores if available, else blank */}
                                        {registration.scores ?? ''}
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hover:bg-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handlePrintPDF(registration)}>
                                                    Download PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePrintExcel(registration)}>
                                                    Download Excel
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePrint(registration)}>
                                                    Print Receipt
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {user?.role === "admin" && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEditClick(registration)}
                                                    className="hover:bg-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(registration)}
                                                    className="hover:bg-red-700"
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

            {/* Pagination */}            {/* Enhanced Pagination */}
            {filteredRegistrations.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Rows per page:</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue>{pageSize}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {[5, 10, 20, 50, 100].map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span>
                            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRegistrations.length)} of{" "}
                            {filteredRegistrations.length} items
                        </span>
                    </div>
            
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="hidden sm:flex"
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronFirst className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
            
                        <div className="flex items-center gap-2">
                            {getPaginationRange(currentPage, Math.ceil(filteredRegistrations.length / pageSize)).map((page, i) => (
                                <React.Fragment key={i}>
                                    {page === '...' ? (
                                        <span className="px-2">...</span>
                                    ) : (
                                        <Button
                                            variant={currentPage === page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => paginate(Number(page))}
                                            className={cn(
                                                "hidden sm:flex",
                                                currentPage === page
                                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {page}
                                        </Button>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
            
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRegistrations.length / pageSize)))}
                            disabled={currentPage === Math.ceil(filteredRegistrations.length / pageSize)}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.ceil(filteredRegistrations.length / pageSize))}
                            disabled={currentPage === Math.ceil(filteredRegistrations.length / pageSize)}
                            className="hidden sm:flex"
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronLast className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

                        {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this registration?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the registration
                            for {selectedRegistration?.first_name} {selectedRegistration?.last_name}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Edit Confirmation Dialog */}
            <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Edit Registration</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to edit the registration for{' '}
                            {selectedRegistration?.first_name} {selectedRegistration?.last_name}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsEditDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmEdit}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Edit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ApplicantManagement;
