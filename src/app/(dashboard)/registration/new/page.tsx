/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/consistent-type-imports */
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
import { format } from "date-fns"
import registrationService, { type RegistrationCreateInput, type RegistrationData } from '@/services/registrations'; // Import the registration service
import { Toaster, toast } from 'sonner';
import classService, { ClassData } from '@/services/class';
import { Category, getAllCategories } from '@/services/categories';
import { academicYear, getAllAcademicYear } from '@/services/academic_year';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { saveOfflineRegistration } from '@/lib/offlineRegistrations';

const NewRegistrationPage = () => {
    const [gender, setGender] = useState<"Male" | "Female" >('Male');
const [registrationData, setRegistrationData] = useState<Omit<RegistrationData, 'id'>>({
    first_name: '',
    last_name: '',
    scores: 0,
    status: 'pending',
    email: '',
    middle_name: '',
    phone_number: '',
    previous_school: '',
    date_of_birth: '',
    class_applying_for: '',
    gender: gender as "Male" | "Female",
    academic_year: '',
    category: '',
    address: '',
    guardian_name: '',
    relationship: '',
    guardian_phone_number: '',
    school_id: 0,
    student_id: 0,
    class_id: 0,
    academic_year_id: 0
});

    const [date, setDate] = useState<Date>()
    const [loading, setLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState<academicYear[]>([]); // State for academic years
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null); // State for selected academic year ID
    const [studentId, setStudentId] = useState<number>(0); //  Initialize.  Get this dynamically.
    const [schoolId, setSchoolId] = useState<number>(0); //  Initialize.  Get this dynamically.
    const [classId, setClassId] = useState<number>(0); //  Initialize.  Get this dynamically.
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [showReceiptDialog, setShowReceiptDialog] = useState(false);
    const [newRegistrationId, setNewRegistrationId] = useState<number | null>(null);


    useEffect(() => {
        const fetchAcademicYears = async () => {
            // Replace this with your actual API call to fetch academic years
            const mockAcademicYears = await getAllAcademicYear();
            setAcademicYears(mockAcademicYears);

        };

        fetchAcademicYears();
    }, []);

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

const getCategoryName = (id: number | string) => {
  const found = categories.find((c) => c.id === Number(id));
  return found ? found.name : `Unknown (${id})`;
};

async function loadSchools() {
  setLoading(true);
  try {
    const allClasses = await classService.getAll();

    // Extract unique class names
    const uniqueClassMap = new Map<string, ClassData>();

    for (const classItem of allClasses) {
      if (!uniqueClassMap.has(classItem.name)) {
        uniqueClassMap.set(classItem.name, classItem);
      }
    }

    setClasses(Array.from(uniqueClassMap.values()));
  } catch {
    setError("Failed to load schools.");
  } finally {
    setLoading(false);
  }
}

    
      useEffect(() => {
        loadSchools();
      }, []);

 const handleChange = (field: keyof typeof registrationData, value: any) => {
    setRegistrationData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Function to calculate age from date string YYYY-MM-DD
  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const age = calculateAge(registrationData.date_of_birth ?? '');


    const handleAcademicYearChange = (value: string) => {
        const selectedYear = academicYears.find(year => year.year.toString() === value);
        setSelectedAcademicYearId(selectedYear ? selectedYear.id : null);
    };

    const initialRegistrationData: RegistrationData = {
        school_id: 0,
        student_id: 0,
        scores: 0,
        status: 'pending',
        previous_school: '',
        class_id: 0,
        academic_year_id: 0,
        academic_year: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
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

  if (
    !registrationData.first_name ||
    !registrationData.last_name ||
    !registrationData.date_of_birth ||
    !registrationData.class_applying_for ||
    !registrationData.gender ||
    !registrationData.address ||
    !registrationData.guardian_name ||
    !registrationData.relationship ||
    !registrationData.guardian_phone_number
  ) {
    toast.error("Please fill in all required fields.");
    return;
  }

  if (!selectedAcademicYearId) {
    toast.error("Please select an academic year.");
    return;
  }

  setLoading(true);

  try {
    const backendData: RegistrationCreateInput = {
      school_id: schoolId,
      student_id: studentId,
      scores: 0,
      status: "pending",
      class_id: classId,
      academic_year_id: selectedAcademicYearId,
      academic_year:
        academicYears.find((y) => y.id === selectedAcademicYearId)?.year.toString() ?? "",
      first_name: registrationData.first_name,
      middle_name: registrationData.middle_name,
      last_name: registrationData.last_name,
      date_of_birth: format(new Date(registrationData.date_of_birth), "yyyy-MM-dd"),
      class_applying_for: registrationData.class_applying_for,
      gender: registrationData.gender as "Male" | "Female",
      email: registrationData.email || "",
      phone_number: registrationData.phone_number || "",
      category: registrationData.category,
      address: registrationData.address || "",
      guardian_name: registrationData.guardian_name || "",
      relationship: registrationData.relationship || "",
      previous_school: registrationData.previous_school || "",
      guardian_phone_number: registrationData.guardian_phone_number || "",
    };

    if (!navigator.onLine) {
      await saveOfflineRegistration(backendData);
      toast.success("You're offline. Registration saved locally and will sync later.");
    } else {
      await registrationService.create(backendData);
      toast.success("Registration successful!");
    }

    // Reset form
    setRegistrationData(initialRegistrationData);
    setDate(undefined);
    // Optionally reset academic year or other fields

  } catch (error: any) {
    toast.error(error.message || "An error occurred during registration.");
  } finally {
    setLoading(false);
  }
};



const handleFinalSubmit = async () => {
  setLoading(true);
  try {
    const backendData: RegistrationCreateInput = {
      ...registrationData,
      academic_year_id: selectedAcademicYearId!,
      academic_year:
        academicYears.find(y => y.id === selectedAcademicYearId)?.year.toString() ?? '',
      category: registrationData.category,
      class_id: classId,
      school_id: schoolId,
      scores: registrationData.scores ?? 0,
      status: registrationData.status ?? "pending"
    };
  if (
    !registrationData.first_name ||
    !registrationData.last_name ||
    !registrationData.date_of_birth ||
    !registrationData.class_applying_for ||
    !registrationData.gender ||
    !registrationData.address ||
    !registrationData.guardian_name ||
    !registrationData.relationship ||
    !registrationData.guardian_phone_number
  ) {
    toast.error("Please fill in all required fields.");
    return;
  }

  if (!selectedAcademicYearId) {
    toast.error("Please select an academic year.");
    return;
  }
    let regId: number | undefined;

    if (!navigator.onLine) {
      await saveOfflineRegistration(backendData);
      toast.success("You're offline. Registration saved locally and will sync when you're back online.");
    } else {
      regId = await registrationService.create(backendData);
      toast.success("Registration successful!");
    }
    // Reset form
    setRegistrationData(initialRegistrationData);
    setDate(undefined);

    if (regId) {
      setNewRegistrationId(regId);
      setShowPreviewDialog(false);
      setShowReceiptDialog(true); // 👈 open receipt popup
    }

  } catch (error: any) {
    toast.error("Registration failed.");
  } finally {
    setLoading(false);
  }
};

    return (
        <div className="p-4 md:p-8">
            
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-left">New Applicant Registration</h1>
            <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-semibold">Registrations</h1>
    </div>
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
<div className="relative">
  <Label
    htmlFor="dateOfBirth"
    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
  >
    Date of Birth <span className="text-red-500">*</span>
  </Label>

  <Input
    type="date"
    id="dateOfBirth"
    value={registrationData.date_of_birth ?? ''}
    onChange={e => handleChange('date_of_birth', e.target.value)}
    required
    disabled={loading}
    max={new Date().toISOString().split('T')[0]}
    className="pr-24 mt-1"
  />

  {registrationData.date_of_birth && (
    <span className="absolute right-3 top-[33px] text-sm text-gray-500 pointer-events-none">
      {calculateAge(registrationData.date_of_birth)} yrs
    </span>
  )}
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
                                {classes.map((name, id) => (
                                    <SelectItem key={id} value={name.name}>
                                        {name.name}
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
                            
                        </RadioGroup>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Email */}
                    <div>
  <Label htmlFor="previousSchool" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Previous School
  </Label>
  <Input
    type="text"
    id="previousSchool"
    value={registrationData.previous_school ?? ''}
    onChange={e => handleChange('previous_school', e.target.value)}
    placeholder="Enter previous school name"
    className="mt-1"
    disabled={loading}
  />
</div>


                
                <div>
                    <Label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category <span className="text-red-500">*</span>
                    </Label>
<Select
  onValueChange={(value) => handleChange('category', parseInt(value))}
  value={registrationData.category.toString()}
  disabled={loading}
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
<div>
                    <Label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Academic Year <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        onValueChange={handleAcademicYearChange}
                        value={academicYears.find(y => y.id === selectedAcademicYearId)?.year.toString()}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.year.toString()}>
                                    {year.year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
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
                    </div>
                
<Button
  type="button"
  className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
  disabled={loading}
  onClick={() => setShowPreviewDialog(true)}
>
  Preview & Submit
</Button>
            </form>
            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
  <DialogContent className="max-w-xl">
    <DialogHeader>
      <DialogTitle>Confirm Registration</DialogTitle>
    </DialogHeader>
    <div className="space-y-2 text-sm">
      <p><strong>Name:</strong> {registrationData.first_name} {registrationData.last_name}</p>
      <p><strong>Class:</strong> {registrationData.class_applying_for}</p>
      <p><strong>Category:</strong> {getCategoryName(registrationData.category)}</p>
      <p><strong>Guardian:</strong> {registrationData.guardian_name}</p>
    </div>
    <DialogFooter className="mt-4">
      <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
        Cancel
      </Button>
      <Button onClick={handleFinalSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Confirm & Submit'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>



        </div>
    );
};

export default NewRegistrationPage;

