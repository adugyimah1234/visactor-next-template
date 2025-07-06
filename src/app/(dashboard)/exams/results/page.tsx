/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import registrationService, { type RegistrationData } from '@/services/registrations';
import studentService from '@/services/students';
import classService, { type ClassData } from '@/services/class';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import schoolService from '@/services/schools';
import { type School } from '@/types/school';
import { format } from 'date-fns';
import { Toaster, toast } from 'sonner';
import { getAllRoles, Role } from '@/services/roles';
import { Class } from '@/types/class';
import { getAllCategories } from '@/services/categories';
import { getAllAcademicYear } from '@/services/academic_year';

interface NamedItem {
  id: number;
  name: string;
  year?: string;
}

export default function ResultsPage() {
  const [applicants, setApplicants] = useState<RegistrationData[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
    const [academicYears, setAcademicYears] = useState<NamedItem[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [passMark, setPassMark] = useState<number>(50);
  const [classSlots, setClassSlots] = useState<Record<number, number>>({});
  const { token, user } = useAuth();
const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
const [selectedAppliedClass, setSelectedAppliedClass] = useState<string>('');
const [selectedCategory, setSelectedCategory] = useState<string>('');
const [selectedCategoryName, setSelectedCategoryName] = useState('');

  // Check if user is admin based on role name from roles table
  const isAdmin = userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'administrator';

  useEffect(() => {
    const fetchInitial = async () => {
      if (!token) return; // wait until token is ready

      try {

        const [applicantData, schoolData, roleData] = await Promise.all([
          registrationService.getAll(),
          schoolService.getAll(),
          getAllRoles(),
        ]);
        setApplicants(applicantData);
        setSchools(schoolData);
        setRoles(roleData);
        
        // Get user role name based on role_id
        if (user?.role_id && roleData.length > 0) {
          const userRoleData = roleData.find(role => Number(role.id) === user.role_id);
          setUserRole(userRoleData?.name || '');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchInitial();
  }, [token, user?.role_id]);

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const categoryData = await getAllCategories();
      setCategories(categoryData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  fetchCategories();
}, []);

useEffect(() => {
  const fetchAllStudents = async () => {
    try {
      const students = await studentService.getAll();
      setAllStudents(students);
    } catch (error) {
      console.error('Error fetching all students:', error);
    }
  };
  fetchAllStudents();
}, []);

  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchYear = async () => {
      try {
        const yearData = await getAllAcademicYear();
                setAcademicYears(
          yearData.map((y: any) => ({
            id: y.id,
            name: y.name ?? y.year ?? String(y.id), // fallback if no name
            year: y.year
          }))
        );
  
        // Set the most recent year as current (adjust logic as needed)
        if (yearData && yearData.length > 0) {
          // If your API returns years sorted, pick the last one
          setCurrentAcademicYearId(yearData[yearData.length - 1].id);
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
    };
    fetchYear();
  }, []);

const handleSchoolChange = async (index: number, schoolId: number) => {
  if (typeof schoolId === 'number') {
    const filtered = await classService.getBySchool(schoolId);

    // Use allStudents to count students per class
    const slotMap: Record<number, number> = {};
    for (const cls of filtered) {
      slotMap[cls.id] = allStudents.filter(s => s.class_id === cls.id).length;
    }

    setClasses(filtered);
    setClassSlots(slotMap);
  } else {
    setClasses([]);
    setClassSlots({});
  }

  const updated = [...applicants];
  updated[index].school_id = schoolId;
  updated[index].class_id = undefined; // Reset class selection
  setApplicants(updated);
};

const handleClassSelect = async (index: number, classId: number) => {
  const cls = classes.find((c) => c.id === classId);
  
  // Get current count from students table
  let currentStudentCount = 0;
  try {
    const studentsInClass = await studentService.getById(classId);
    currentStudentCount = studentsInClass.length;
  } catch (error) {
    console.error(`Error fetching students for class ${classId}:`, error);
    currentStudentCount = classSlots[classId] || 0;
  }

  if (cls && cls.slots !== undefined && currentStudentCount >= cls.slots) {
    toast.warning(`Class "${cls.name}" is full (${currentStudentCount}/${cls.slots} slots).`);
    return;
  }

  const updated = [...applicants];
  const previousClassId = updated[index].class_id;

  // Update the applicant's class
  updated[index].class_id = classId;
  setApplicants(updated);

  // Update the slot count display
  setClassSlots(prev => ({
    ...prev,
    [classId]: currentStudentCount,
  }));
};

const handleScoreChange = async (index: number, value: string) => {
    const updated = [...applicants];
    updated[index].scores = parseFloat(value);
    setApplicants(updated);
    // Update backend immediately
};

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json<{ Name: string; Score: number }>(sheet);

        const updated = [...applicants];
        let updatedCount = 0;

        // Update scores and sync with backend
        for (let i = 0; i < updated.length; i++) {
          const applicant = updated[i];
          const fullName = `${applicant.first_name} ${applicant.last_name}`.toLowerCase();
          const match = parsed.find(p => p.Name?.toLowerCase() === fullName);
          
          if (match && !isNaN(match.Score)) {
            applicant.scores = match.Score;
            updatedCount++;
            
            // Update backend for each matched applicant
            try {
              await registrationService.update(applicant.id as number, {
  ...applicant, 
  scores: match.Score, 
});

            } catch (error) {
              console.error(`Error updating score for ${fullName}:`, error);
            }
          }
        }

        setApplicants(updated);
        toast.success(`Updated ${updatedCount} student scores from Excel`);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        toast.error('Failed to process Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

const handlePromote = async () => {
  const updatedApplicants = [...applicants];
  let createdCount = 0;
  const duplicates: string[] = [];
  const errors: string[] = [];

for (const applicant of updatedApplicants) {
  const hasPassed = (applicant.scores ?? 0) >= passMark;

  const dob = applicant.date_of_birth 
    ? format(new Date(applicant.date_of_birth), 'yyyy-MM-dd') 
    : '';

  if (hasPassed) {
if (applicant.class_id && applicant.school_id) {
  const selectedClass = classes.find(c => c.id === applicant.class_id);
  const currentSlotCount = classSlots[applicant.class_id] || 0;

  if (selectedClass && selectedClass.slots !== undefined && currentSlotCount >= selectedClass.slots) {
    toast.warning(`Class "${selectedClass.name}" is full. Skipping ${applicant.first_name}.`);
    continue; // Skip if class is full
  }
      // ...existing code...
      const studentPayload = {
        first_name: applicant.first_name,
        last_name: applicant.last_name,
        school_id: applicant.school_id,
        admission_status: 'admitted',
        academic_year_id: applicant.academic_year_id ?? 3,
        dob: dob,
        gender: applicant.gender,
        scores: applicant.scores ?? 0,
        registration_date: format(new Date(applicant.registration_date ?? ''), 'yyyy-MM-dd'),
        category_id: Number(applicant.category),
        class_id: applicant.class_id,
        status: 'inactive',
        middle_name: applicant.middle_name ?? ''
      };
      // ...existing code...
      
      setClassSlots(prev => ({
        ...prev,
        [applicant.class_id!]: (prev[applicant.class_id!] || 0) + 1,
      }));
      try {
        await Promise.all ([
          studentService.create(studentPayload),
          registrationService.updatePartial(applicant.id ?? 0, { status: "approved" })
        ]);
        createdCount++;
      } catch (err: any) {
        if (err.response?.status === 400) {
          duplicates.push(`${applicant.first_name} ${applicant.last_name}`);
        } else {
          errors.push(`${applicant.first_name} ${applicant.last_name}`);
        }
      }
    } else {
      // skip if missing class/school
      console.warn(`Skipping ${applicant.first_name} due to missing class/school`);
    }
  } else {
    try {
      await registrationService.updatePartial(applicant.id ?? 0, { status: "rejected" });
    } catch (err) {
      console.error(`Failed to reject ${applicant.first_name} ${applicant.last_name}`, err);
    }
  }
}

  // Show messages
  if (createdCount > 0) toast.success(`${createdCount} student(s) promoted successfully.`);
  if (duplicates.length > 0) toast.warning(`Duplicates: ${duplicates.join(', ')}`);
  if (errors.length > 0) toast.error(`Errors: ${errors.join(', ')}`);

  // Refresh to reflect changes
  try {
    const refreshedApplicants = await registrationService.getAll();
    setApplicants(refreshedApplicants);
  } catch (error) {
    console.error('Error refreshing applicants:', error);
  }
};

const handleSinglePromote = async (applicant: RegistrationData) => {
  const hasPassed = (applicant.scores ?? 0) >= passMark;

  // ❌ If failed, reject and stop here (no need to check class or school)
  if (!hasPassed) {
    await registrationService.updatePartial(applicant.id ?? 0, { status: "rejected" });
    toast.warning(`${applicant.first_name} did not meet the pass mark and has been rejected.`);
    const refreshedApplicants = await registrationService.getAll();
    setApplicants(refreshedApplicants);
    return;
  }

  if(scores === 0) {
    toast.warning(`${applicant.first_name} scores was not entered!!`)
  }

  // ✅ Passed, now ensure class and school are set
  if (!applicant.class_id || !applicant.school_id) {
    toast.warning(`Please assign a class and school for ${applicant.first_name} first.`);
    return;
  }

  const selectedClass = classes.find((cls) => cls.id === applicant.class_id);
  const currentCount = applicants.filter(
    (a) => a.class_id === applicant.class_id && a.status === 'approved'
  ).length;

  if (selectedClass && selectedClass.slots !== undefined && currentCount >= selectedClass.slots) {
    toast.error(`Class "${selectedClass.name}" is full (${selectedClass.slots} slots). Cannot promote ${applicant.first_name}.`);
    return;
  }

  try {
    const dob = applicant.date_of_birth 
      ? format(new Date(applicant.date_of_birth), 'yyyy-MM-dd') 
      : '';

    const studentPayload = {
      first_name: applicant.first_name,
      last_name: applicant.last_name,
      school_id: applicant.school_id,
      admission_status: 'admitted',
      academic_year_id: applicant.academic_year_id ?? 3,// Use current year if not set 
      dob: dob,
      gender: applicant.gender,
      scores: applicant.scores ?? 0,
      registration_date: format(new Date(applicant.registration_date ?? ''), 'yyyy-MM-dd'),
      category_id: Number(applicant.category),
      class_id: applicant.class_id,
      status: 'inactive',
      middle_name: applicant.middle_name ?? ''
    };

    await Promise.all([
      studentService.create(studentPayload),
      registrationService.updatePartial(applicant.id ?? 0, { status: "approved" })
    ]);

    toast.success(`${applicant.first_name} promoted successfully.`);

    const refreshedApplicants = await registrationService.getAll();
    setApplicants(refreshedApplicants);
  } catch (err: any) {
    if (err.response?.status === 400) {
      toast.warning(`Duplicate entry: ${applicant.first_name} ${applicant.last_name}`);
    } else {
      toast.error(`Failed to promote ${applicant.first_name}`);
      console.error(`Promotion error for ${applicant.first_name}:`, err);
    }
  }
};


  // Filter applicants based on index, not a separate variable
const categoryOrder = ['SVC', 'MOD', 'CIV'];

const pendingApplicants = useMemo(() => {
  return applicants
    .filter((a) => {
      const matchesStatus = a.status === 'pending';
      const isPaymentValid = a.payment_status !== 'unpaid';
      const matchesClass = selectedClassId === '' || a.class_id === selectedClassId;
      const matchesAppliedClass = selectedAppliedClass === '' || a.class_applying_for === selectedAppliedClass;

      const categoryName = categories.find(c => Number(c.id) === Number(a.category))?.name;
      const matchesCategory = categoryName && categoryOrder.includes(categoryName);

      return matchesStatus && isPaymentValid && matchesClass && matchesAppliedClass && matchesCategory;
    })
    .sort((a, b) => {
      const aName = categories.find(c => Number(c.id) === Number(a.category))?.name || '';
      const bName = categories.find(c => Number(c.id) === Number(b.category))?.name || '';
      return categoryOrder.indexOf(aName) - categoryOrder.indexOf(bName);
    });
}, [applicants, selectedClassId, selectedAppliedClass, categories, passMark]);


const uniqueAppliedClasses = Array.from(
  new Set(applicants.map((a) => a.class_applying_for).filter(Boolean))
);

const uniqueCategories = Array.from(
  new Set(applicants.map((a) => a.category).filter(Boolean))
).map(catId => {
  const category = categories.find(c => Number(c.id) === Number(catId));
  return category ? category.name : catId; // fallback to ID if name not found
});

const handleSaveScores = async () => {
  let updatedCount = 0;
  const failed: string[] = [];

  for (const applicant of applicants) {
    if (applicant.scores !== undefined && applicant.scores !== null) {
      try {
        const formattedDOB = applicant.date_of_birth
          ? format(new Date(applicant.date_of_birth), 'yyyy-MM-dd')
          : null;

        await registrationService.update(applicant.id as number, {
          ...applicant,
          scores: applicant.scores,
          date_of_birth: formattedDOB,
        });

        updatedCount++;
      } catch (error) {
        console.error(`Error saving score for ${applicant.first_name}:`, error);
        failed.push(`${applicant.first_name} ${applicant.last_name}`);
      }
    }
  }

  if (updatedCount > 0) {
    toast.success(`${updatedCount} scores saved successfully.`);

    // ✅ Refresh applicant list from backend
    try {
      const refreshed = await registrationService.getAll();
      setApplicants(refreshed);
    } catch (err) {
      console.error('Failed to refresh applicants after saving:', err);
      toast.error('Could not refresh updated scores from server.');
    }
  }

  if (failed.length > 0) {
    toast.error(`Failed to save scores for: ${failed.join(', ')}`);
  }
};


  return (
    <div className="p-6 space-y-6">
      <Toaster richColors />
      <h1 className="text-2xl font-bold">Applicant Result Management</h1>

      <div className="flex items-center gap-4">
        {/* Only show pass mark input to admins */}
        {isAdmin && (
          <>
            <label>Pass Mark:</label>
            <Input 
              type="number" 
              value={passMark} 
              onChange={(e) => setPassMark(parseInt(e.target.value) || 0)} 
              className="w-24" 
            />
          </>
        )}
        
        <Input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleExcelUpload} 
          className="w-80" 
        />
        
        {isAdmin && (
          <Button onClick={handlePromote} className="bg-blue-600 text-white">
            Promote Passed
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label htmlFor="appliedClassFilter">Filter by Applied Class:</label>
        <select
          id="appliedClassFilter"
          className="border p-1 rounded"
          value={selectedAppliedClass}
          onChange={(e) => setSelectedAppliedClass(e.target.value)}
        >
          <option value="">All</option>
          {uniqueAppliedClasses.map((clsName) => (
            <option key={clsName} value={clsName}>
              {clsName}
            </option>
          ))}
        </select>
      </div>

  <div className="flex justify-end my-4">
    <Button onClick={handleSaveScores} className="bg-emerald-600 text-white">
      Save Scores
    </Button>
  </div>

      <Table>
        <TableHeader>
          <TableRow>
          <TableHead>Category</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Class Applied For</TableHead>
            <TableHead>Score</TableHead>
{isAdmin && <TableHead>School</TableHead>}
{isAdmin && <TableHead>Class</TableHead>}
{isAdmin && <TableHead>Status</TableHead>}
{isAdmin && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingApplicants.map((applicant) => {
            // Use the original applicant index for state updates
            const originalIndex = applicants.findIndex(a => a.id === applicant.id);
            const passed = (applicant.scores ?? 0) >= passMark;

            return (
              <TableRow key={applicant.id}>
              <TableCell>
              {categories.find(c => Number(c.id) === Number(applicant.category))?.name || 'Unknown'}
</TableCell>

<TableCell>{applicant.first_name} {applicant.middle_name} {applicant.last_name}</TableCell>
                <TableCell>
                  {applicant.class_applying_for || 'N/A'}
                </TableCell>
                <TableCell>
<Input
  type="number"
  value={applicant.scores === undefined || applicant.scores === null ? '' : applicant.scores}
  onChange={(e) => {
    const updated = [...applicants];
    updated[originalIndex].scores = parseFloat(e.target.value);
    setApplicants(updated); // update UI instantly
  }}
  className="w-20"
  placeholder="0"
/>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                  <select
                    title="Select School"
                    aria-label="Select School"
                    className="border p-1 rounded"
                    value={applicant.school_id ?? ''}
                    onChange={(e) => handleSchoolChange(originalIndex, parseInt(e.target.value))}
                  >
                    <option value="">--Select--</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell>
                    <select
                    title="Select Class"
                    aria-label="Select Class"
                    value={applicant.class_id ?? ''}
                    onChange={(e) => handleClassSelect(originalIndex, parseInt(e.target.value))}
                    className="border p-1 rounded w-full"
                    >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({classSlots[cls.id] ?? 0}/{cls.slots})
                        </option>
                      ))}
                      </select>
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell>
                      {passed ? (
                        <span className="text-green-600 font-bold">Passed</span>
                      ) : (
                        <span className="text-red-600">Failed</span>
                      )}
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell>
                  {applicant.status === 'pending' && (
                    <Button
                      onClick={() => handleSinglePromote(applicant)}
                      size="sm"
                      className="bg-green-600 text-white"
                    >
                      Promote
                      </Button>
                    )}
                    </TableCell>
                  )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}