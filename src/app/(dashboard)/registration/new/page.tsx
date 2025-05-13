/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import registrationService, { type RegistrationCreateInput, type RegistrationData } from '@/services/registrations'; // Import the registration service
import { Toaster, toast } from 'sonner';

interface AcademicYear {
    id: number;
    year: string;
}

const classes = [
    'JHS 1',
    'JHS 2',
    'JHS 3',
    'SHS 1',
    'SHS 2',
    'SHS 3',
];

const NewRegistrationPage = () => {
    const [gender, setGender] = useState<"Male" | "Female" | "Other">('Male');
    const [registrationData, setRegistrationData] = useState<RegistrationData>({
    first_name: '',
    last_name: '',
    email: '',
    middle_name: '',
    phone_number: '',
    date_of_birth: '',
    class_applying_for: '',
    gender: gender as "Male" | "Female" | "Other",
    academic_year: '',
    category: '',
    address: '',
    guardian_name: '',
    relationship: '',
    guardian_phone_number: '',
    school_id: 0, // Add a default value or get it from somewhere
    student_id: 0, // Add a default value or get it from somewhere
    class_id: 0, // Add a default value or get it from somewhere
    academic_year_id: 0
    });

    const [date, setDate] = useState<Date>()
    const [loading, setLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]); // State for academic years
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null); // State for selected academic year ID
    const [studentId, setStudentId] = useState<number>(0); //  Initialize.  Get this dynamically.
    const [schoolId, setSchoolId] = useState<number>(0); //  Initialize.  Get this dynamically.
    const [classId, setClassId] = useState<number>(0); //  Initialize.  Get this dynamically.

    // Simulate fetching academic years (replace with your actual API call)
    useEffect(() => {
        const fetchAcademicYears = async () => {
            // Replace this with your actual API call to fetch academic years
            const mockAcademicYears: AcademicYear[] = [
                { id: 1, year: '2023-2024' },
                { id: 2, year: '2024-2025' },
                { id: 3, year: '2025-2026' },
            ];
            setAcademicYears(mockAcademicYears);
        };

        fetchAcademicYears();
    }, []);

    const handleChange = (field: keyof RegistrationData, value: any) => {
        setRegistrationData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    };

    const handleAcademicYearChange = (value: string) => {
        const selectedYear = academicYears.find(year => year.year === value);
        setSelectedAcademicYearId(selectedYear ? selectedYear.id : null);
    };

    const initialRegistrationData: RegistrationData = {
    school_id: 0,
    student_id: 0,
    class_id: 0,
    academic_year_id: 0,
    academic_year: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: undefined,
    class_applying_for: '',
    gender: 'Male',
    email: '',
    phone_number: '',
    address: '',
    guardian_name: '',
    relationship: '',
    guardian_phone_number: '',
    category: '',
};

const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic client-side validation
    if (
        !registrationData.first_name ||
        !registrationData.last_name ||
        !registrationData.date_of_birth ||
        !registrationData.class_applying_for ||
        !registrationData.gender ||
        !registrationData.phone_number ||
        !registrationData.address ||
        !registrationData.guardian_name ||
        !registrationData.relationship ||
        !registrationData.guardian_phone_number
    ) {
        toast.error("Please fill in all required fields.");
        return; // Stop submission
    }
    if (!selectedAcademicYearId) {
        toast.error("Please select an academic year.");
        return;
    }

    setLoading(true); // Set loading to true before making the API call
    try {
        // Prepare the data to match the backend API's expected format
        const backendData: RegistrationCreateInput = {
            school_id: schoolId, // Assuming school ID is 1, update as needed
            student_id: studentId,
            class_id: classId, // Assuming class ID is 1, update as needed
            academic_year_id: selectedAcademicYearId,
            academic_year: academicYears.find(y => y.id === selectedAcademicYearId)?.year || '',
            first_name: registrationData.first_name,
            middle_name: registrationData.middle_name,
            last_name: registrationData.last_name,
date_of_birth: format(new Date(registrationData.date_of_birth), "yyyy-MM-dd"),            class_applying_for: registrationData.class_applying_for,
            gender: registrationData.gender as "Male" | "Female" | "Other",
            email: registrationData.email,
            phone_number: registrationData.phone_number,
            category: registrationData.category,
            address: registrationData.address,
            guardian_name: registrationData.guardian_name,
            relationship: registrationData.relationship,
            guardian_phone_number: registrationData.guardian_phone_number,
        };


        // Call the registration service to create the registration
        const newRegistrationId = await registrationService.create(backendData);
        toast.success(`Registration successful! Registration ID: ${newRegistrationId}`);
        // Optionally, reset the form or redirect the user
        setRegistrationData(initialRegistrationData);
        setDate(undefined);
        setSelectedAcademicYearId(null); // Reset the selected academic year
    } catch (error: any) {
        toast.error(error.message || "An error occurred during registration.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="p-4 md:p-8">
            <Toaster richColors />
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-left">New Applicant Registration</h1>
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* First Name */}
                    <div>
                        <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="firstName"
                            value={registrationData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            required
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                    {/* Middle Name */}
                    <div>
                        <Label htmlFor="middleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Middle Name
                        </Label>
                        <Input
                            type="text"
                            id="middleName"
                            value={registrationData.middle_name}
                            onChange={(e) => handleChange('middle_name', e.target.value)}
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                    {/* Last Name */}
                    <div>
                        <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="lastName"
                            value={registrationData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            required
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date of Birth */}
                    <div>
                        <Label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <Popover>
<PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start text-left font-normal">
        <CalendarIcon className="mr-2 h-4 w-4" />
        {registrationData.date_of_birth ? format(registrationData.date_of_birth, "PPP") : "Date of birth"}
    </Button>
</PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(selectedDate) => {
                                        setDate(selectedDate);
                                        handleChange('date_of_birth', selectedDate);
                                    }}
                                    initialFocus
                                    disabled={loading}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Class Applying For */}
                    <div>
                        <Label htmlFor="classApplyingFor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Class Applying For <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(value) => handleChange('class_applying_for', value)}
                            value={registrationData.class_applying_for}
                            disabled={loading}
                        >
                            <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((cls) => (
                                    <SelectItem key={cls} value={cls}>
                                        {cls}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Gender */}
                    <div>
                        <Label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Gender <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                            onValueChange={(value) => handleChange('gender', value)}
                            value={registrationData.gender}
                            className="mt-1 flex space-x-4"
                            disabled={loading}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Male" id="r1" required disabled={loading} />
                                <Label htmlFor="r1">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Female" id="r2" required disabled={loading} />
                                <Label htmlFor="r2">Female</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Other" id="r3" required disabled={loading} />
                                <Label htmlFor="r3">Other</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                        <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </Label>
                        <Input
                            type="email"
                            id="email"
                            value={registrationData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                    {/* Phone Number */}
                    <div>
                        <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="tel"
                            id="phoneNumber"
                            value={registrationData.phone_number}
                            onChange={(e) => handleChange('phone_number', e.target.value)}
                            required
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                </div>
                {/* Address */}
                <div>
                    <Label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="text"
                        id="address"
                        value={registrationData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        required
                        className="mt-1"
                        disabled={loading}
                    />
                </div>

                <div>
    <Label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Category <span className="text-red-500">*</span>
    </Label>
    <Select
        onValueChange={(value) => handleChange('category', value)}
        value={registrationData.category}
        disabled={loading}
    >
        <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="SVC">SVC</SelectItem>
            <SelectItem value="MOD">MOD</SelectItem>
            <SelectItem value="CIV">CIV</SelectItem>
        </SelectContent>
    </Select>
</div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8">Guardian Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Guardian Name */}
                    <div>
                        <Label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Guardian Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="guardianName"
                            value={registrationData.guardian_name}
                            onChange={(e) => handleChange('guardian_name', e.target.value)}
                            required
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                    {/* Guardian Relationship */}
                    <div>
                        <Label htmlFor="relationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Relationship <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="relationship"
                            value={registrationData.relationship}
                            onChange={(e) => handleChange('relationship', e.target.value)}
                            required
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                    {/* Guardian Phone Number */}
                    <div>
                        <Label htmlFor="guardianPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="tel"
                            id="guardianPhoneNumber"
                            value={registrationData.guardian_phone_number}
                            onChange={(e) => handleChange('guardian_phone_number', e.target.value)}
                            required
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                </div>
                {/* Academic Year Selection */}
                <div>
                    <Label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Academic Year <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        onValueChange={handleAcademicYearChange}
                        value={academicYears.find(y => y.id === selectedAcademicYearId)?.year}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.year}>
                                    {year.year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register'}
                </Button>
            </form>
        </div>
    );
};

export default NewRegistrationPage;

