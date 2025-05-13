/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    ArrowUpDown,
    CheckCircle,
    XCircle,
    Plus,
    Edit,
    Trash2,
    Search,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import registrationService, { type RegistrationData } from '@/services/registrations';

interface Applicant {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
    date: string; // Store as string, format on display
}



// Dummy data for initial state - Replace with API calls in a real app
const initialApplicants: Applicant[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        role: 'Software Engineer',
        status: 'pending',
        date: '2024-07-28',
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '987-654-3210',
        role: 'Data Scientist',
        status: 'reviewed',
        date: '2024-07-27',
    },
    {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '555-123-4567',
        role: 'Product Manager',
        status: 'accepted',
        date: '2024-07-26',
    },
    {
        id: '4',
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        phone: '111-222-3333',
        role: 'UX Designer',
        status: 'rejected',
        date: '2024-07-25',
    },
    {
        id: '5',
        name: 'Michael Davis',
        email: 'michael.davis@example.com',
        phone: '444-555-6666',
        role: 'Frontend Developer',
        status: 'pending',
        date: '2024-07-24'
    },
    {
        id: '6',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        phone: '777-888-9999',
        role: 'Backend Developer',
        status: 'reviewed',
        date: '2024-07-23'
    },
    {
        id: '7',
        name: 'David Garcia',
        email: 'david.garcia@example.com',
        phone: '222-333-4444',
        role: 'Data Analyst',
        status: 'accepted',
        date: '2024-07-22'
    },
    {
        id: '8',
        name: 'Jennifer Rodriguez',
        email: 'jennifer.rodriguez@example.com',
        phone: '666-777-8888',
        role: 'Project Manager',
        status: 'rejected',
        date: '2024-07-21'
    },
    {
        id: '9',
        name: 'Christopher Williams',
        email: 'chris.williams@example.com',
        phone: '333-444-5555',
        role: 'Software Engineer',
        status: 'pending',
        date: '2024-07-20'
    },
    {
        id: '10',
        name: 'Angela Garcia',
        email: 'angela.garcia@example.com',
        phone: '888-999-0000',
        role: 'Data Scientist',
        status: 'reviewed',
        date: '2024-07-19'
    }
];

const roles = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'Frontend Developer',
    'Backend Developer',
    'Data Analyst',
    'Project Manager',
];

const statusOptions = ['pending', 'reviewed', 'accepted', 'rejected'];

const ApplicantManagement = () => {
    const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
    const [open, setOpen] = useState(false);
    const [editApplicant, setEditApplicant] = useState<Applicant | null>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState(roles[0]);
    const [status, setStatus] = useState<Applicant['status']>('pending');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Applicant; direction: 'ascending' | 'descending' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
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
    // --- CRUD Operations ---
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
        setRole(roles[0]);
        setStatus('pending');
    }, [name, email, phone, role, status]);

    const handleRegistrationClick = () => {
        setIsRegistrationFormOpen(true);
    };
    const addRegistration = useCallback(() => {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim()) {
            alert('Please fill in all fields.'); // Basic validation
            return;
        }
        const newRegistration: RegistrationData = {
            id: Date.now(), // Use timestamp as a unique ID
            first_name: firstName,
            last_name: lastName,
            email,
            phone_number: phoneNumber,
            date_of_birth: dateOfBirth,
            class_applying_for: classApplyingFor,
            gender: gender as "Male" | "Female" | "Other",
            address,
            category: '', // Add a default value or get it from somewhere
            academic_year: '', // Add a default value or get it from somewhere
            guardian_name: guardianName,
            relationship,
            guardian_phone_number: guardianPhoneNumber,
            school_id: 0, // Add a default value or get it from somewhere
            student_id: 0, // Add a default value or get it from somewhere
            class_id: 0, // Add a default value or get it from somewhere
            academic_year_id: 0
        };
        setRegistrations((prevRegistrations) => [...prevRegistrations, newRegistration]);
        setIsRegistrationFormOpen(false); // Close dialog
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
    }, [firstName, lastName, email, phoneNumber, dateOfBirth, classApplyingFor, gender, address, guardianName, relationship, guardianPhoneNumber]);


    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const allRegistrations = await registrationService.getAll();
                setRegistrations(allRegistrations);
            } catch (error) {
                console.error(error);
            }
        };
        fetchRegistrations();
    }, []);

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

    const requestSort = (key: keyof Applicant) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Applicant) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortConfig.direction === 'ascending'
            ? <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
            : <ArrowUpDown className="ml-2 h-4 w-4" />;
    };

    // --- Filtering ---
    const filteredApplicants = sortedApplicants.filter(applicant =>
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Pagination ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // --- Status Badge Variants ---
    const getStatusBadgeVariant = (status: Applicant['status']) => {
        switch (status) {
            case 'pending': return 'secondary';
            case 'reviewed': return 'outline';
            case 'accepted': return 'default';
            case 'rejected': return 'destructive';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: Applicant['status']) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle className="h-4 w-4 ml-1 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 ml-1 text-red-500" />;
            default:
                return null;
        }
    };

    // --- Effects ---
    useEffect(() => {
        if (!open) {
            setEditApplicant(null);
            setName('');
            setEmail('');
            setPhone('');
            setRole(roles[0]);
            setStatus('pending');
        }
    }, [open]);

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
                <Button
                    onClick={() => setIsRegistrationFormOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Registration
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
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
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Email</span>
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                >
                                    <span>Phone Number</span>
                                </Button>
                            </TableHead>
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
                            <TableHead className="text-right">Actions</TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-0 font-normal"
                                    onClick={() => requestSort('date')}
                                >
                                    <span>Date</span>
                                    {getSortIcon('date')}
                                </Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {registrations.map((registration) => (
                                <motion.tr
                                    key={registration.id?.toString()}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <TableCell className="font-medium">{registration.first_name}</TableCell>
                                    <TableCell>{registration.last_name}</TableCell>
                                    <TableCell>{registration.email}</TableCell>
                                    <TableCell>{registration.phone_number}</TableCell>
                                    <TableCell>{registration.date_of_birth}</TableCell>
                                    <TableCell>{registration.class_applying_for}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {registration.gender}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleUpdateRegistration(registration.id!, {
                                                ...registration,
                                                category: '', // Add a default value or get it from somewhere
                                                academic_year: registration.academic_year ?? '', // Provide a default value if it's undefined
                                            })}
                                            className="hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleDeleteRegistration(registration.id!)}
                                            className="hover:bg-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {filteredApplicants.length > itemsPerPage && (
                <div className="flex items-center justify-center mt-4">
                    {Array.from({ length: Math.ceil(filteredApplicants.length / itemsPerPage) }, (_, i) => (
                        <Button
                            key={i + 1}
                            variant={currentPage === i + 1 ? 'default' : 'outline'}
                            onClick={() => paginate(i + 1)}
                            className={cn(
                                "mx-1",
                                currentPage === i + 1
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                            )}
                        >
                            {i + 1}
                        </Button>
                    ))}
                </div>
            )}

            {/* Add/Edit Applicant Dialog */}
            <Dialog open={isRegistrationFormOpen} onOpenChange={setIsRegistrationFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            Add Registration
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="first_name" className="text-right">
                                First Name
                            </label>
                            <Input
                                id="first_name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="last_name" className="text-right">
                                Last Name
                            </label>
                            <Input
                                id="last_name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        {/* ... other form fields ... */}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRegistrationFormOpen(false)}
                            className="hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={addRegistration}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ApplicantManagement;
