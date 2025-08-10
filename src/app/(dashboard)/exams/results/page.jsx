/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import registrationService from '@/services/registrations';
import studentService from '@/services/students';
import classService from '@/services/class';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import schoolService from '@/services/schools';
import { format } from 'date-fns';
import { Toaster, toast } from 'sonner';
import { getAllRoles } from '@/services/roles';
import { getAllCategories } from '@/services/categories';
import { getAllAcademicYear } from '@/services/academic_year';
export default function ResultsPage() {
    const [applicants, setApplicants] = useState([]);
    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [roles, setRoles] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [passMark, setPassMark] = useState(50);
    const [classSlots, setClassSlots] = useState({});
    const { token, user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedAppliedClass, setSelectedAppliedClass] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    // Loading state for promote button
    const [promotingId, setPromotingId] = useState(null);
    // Search bar state
    const [searchName, setSearchName] = useState('');
    // Check if user is admin based on role name from roles table
    const isAdmin = userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'administrator';
    useEffect(() => {
        const fetchInitial = async () => {
            if (!token)
                return; // wait until token is ready
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
                if ((user === null || user === void 0 ? void 0 : user.role_id) && roleData.length > 0) {
                    const userRoleData = roleData.find(role => Number(role.id) === user.role_id);
                    setUserRole((userRoleData === null || userRoleData === void 0 ? void 0 : userRoleData.name) || '');
                }
            }
            catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchInitial();
    }, [token, user === null || user === void 0 ? void 0 : user.role_id]);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoryData = await getAllCategories();
                setCategories(categoryData);
            }
            catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);
    useEffect(() => {
        const fetchAllStudents = async () => {
            try {
                const students = await registrationService.getAll();
                setAllStudents(students);
            }
            catch (error) {
                console.error('Error fetching all students:', error);
            }
        };
        fetchAllStudents();
    }, []);
    const [currentAcademicYearId, setCurrentAcademicYearId] = useState(null);
    useEffect(() => {
        const fetchYear = async () => {
            try {
                const yearData = await getAllAcademicYear();
                setAcademicYears(yearData.map((y) => {
                    var _a, _b;
                    return ({
                        id: y.id,
                        name: (_b = (_a = y.name) !== null && _a !== void 0 ? _a : y.year) !== null && _b !== void 0 ? _b : String(y.id), // fallback if no name
                        year: y.year
                    });
                }));
                // Set the most recent year as current (adjust logic as needed)
                if (yearData && yearData.length > 0) {
                    // If your API returns years sorted, pick the last one
                    setCurrentAcademicYearId(yearData[yearData.length - 1].id);
                }
            }
            catch (error) {
                console.error('Error fetching academic years:', error);
            }
        };
        fetchYear();
    }, []);
    const handleSchoolChange = async (index, schoolId) => {
        if (typeof schoolId === 'number') {
            const filtered = await classService.getBySchool(schoolId);
            // Use allStudents to count students per class
            const slotMap = {};
            for (const cls of filtered) {
                slotMap[cls.id] = allStudents.filter(s => s.class_id === cls.id).length;
            }
            setClasses(filtered);
            setClassSlots(slotMap);
        }
        else {
            setClasses([]);
            setClassSlots({});
        }
        const updated = [...applicants];
        updated[index].school_id = schoolId;
        updated[index].class_id = undefined; // Reset class selection
        setApplicants(updated);
    };
    const handleClassSelect = async (index, classId) => {
        const cls = classes.find((c) => c.id === classId);
        // Get current count from students table
        let currentStudentCount = 0;
        try {
            const studentsInClass = await studentService.getById(classId);
            currentStudentCount = studentsInClass.length;
        }
        catch (error) {
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
        setClassSlots(prev => (Object.assign(Object.assign({}, prev), { [classId]: currentStudentCount })));
    };
    const handleScoreChange = async (index, value) => {
        const updated = [...applicants];
        updated[index].scores = parseFloat(value);
        setApplicants(updated);
        // Update backend immediately
    };
    const handleExcelUpload = async (e) => {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const parsed = XLSX.utils.sheet_to_json(sheet);
                const updated = [...applicants];
                let updatedCount = 0;
                // Update scores and sync with backend
                for (let i = 0; i < updated.length; i++) {
                    const applicant = updated[i];
                    const fullName = `${applicant.first_name} ${applicant.last_name}`.toLowerCase();
                    const match = parsed.find(p => { var _a; return ((_a = p.Name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === fullName; });
                    if (match && !isNaN(match.Score)) {
                        applicant.scores = match.Score;
                        updatedCount++;
                        // Update backend for each matched applicant
                        try {
                            await registrationService.update(applicant.id, Object.assign(Object.assign({}, applicant), { scores: match.Score }));
                        }
                        catch (error) {
                            console.error(`Error updating score for ${fullName}:`, error);
                        }
                    }
                }
                setApplicants(updated);
                toast.success(`Updated ${updatedCount} student scores from Excel`);
            }
            catch (error) {
                console.error('Error processing Excel file:', error);
                toast.error('Failed to process Excel file');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    const handlePromote = async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const updatedApplicants = [...applicants];
        let createdCount = 0;
        const duplicates = [];
        const errors = [];
        for (const applicant of updatedApplicants) {
            // Prevent promotion if score is default (0, empty, or not changed)
            if (applicant.scores === undefined || applicant.scores === null || isNaN(applicant.scores) || applicant.scores === 0) {
                toast.warning(`Cannot promote ${applicant.first_name}: Score not entered or is default.`);
                continue;
            }
            const hasPassed = ((_a = applicant.scores) !== null && _a !== void 0 ? _a : 0) >= passMark;
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
                        academic_year_id: (_b = applicant.academic_year_id) !== null && _b !== void 0 ? _b : 3,
                        dob: dob,
                        gender: applicant.gender,
                        scores: (_c = applicant.scores) !== null && _c !== void 0 ? _c : 0,
                        registration_date: format(new Date((_d = applicant.registration_date) !== null && _d !== void 0 ? _d : ''), 'yyyy-MM-dd'),
                        category_id: Number(applicant.category),
                        class_id: applicant.class_id,
                        status: 'inactive',
                        middle_name: (_e = applicant.middle_name) !== null && _e !== void 0 ? _e : ''
                    };
                    // ...existing code...
                    setClassSlots(prev => (Object.assign(Object.assign({}, prev), { [applicant.class_id]: (prev[applicant.class_id] || 0) + 1 })));
                    try {
                        await Promise.all([
                            studentService.create(studentPayload),
                            registrationService.updatePartial((_f = applicant.id) !== null && _f !== void 0 ? _f : 0, { status: "approved" })
                        ]);
                        createdCount++;
                    }
                    catch (err) {
                        if (((_g = err.response) === null || _g === void 0 ? void 0 : _g.status) === 400) {
                            duplicates.push(`${applicant.first_name} ${applicant.last_name}`);
                        }
                        else {
                            errors.push(`${applicant.first_name} ${applicant.last_name}`);
                        }
                    }
                }
                else {
                    // skip if missing class/school
                    console.warn(`Skipping ${applicant.first_name} due to missing class/school`);
                }
            }
            else {
                try {
                    await registrationService.updatePartial((_h = applicant.id) !== null && _h !== void 0 ? _h : 0, { status: "rejected" });
                }
                catch (err) {
                    console.error(`Failed to reject ${applicant.first_name} ${applicant.last_name}`, err);
                }
            }
        }
        // Show messages
        if (createdCount > 0)
            toast.success(`${createdCount} student(s) promoted successfully.`);
        if (duplicates.length > 0)
            toast.warning(`Duplicates: ${duplicates.join(', ')}`);
        if (errors.length > 0)
            toast.error(`Errors: ${errors.join(', ')}`);
        // Refresh to reflect changes
        try {
            const refreshedApplicants = await registrationService.getAll();
            setApplicants(refreshedApplicants);
        }
        catch (error) {
            console.error('Error refreshing applicants:', error);
        }
    };
    const handleSinglePromote = async (applicant) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        setPromotingId((_a = applicant.id) !== null && _a !== void 0 ? _a : null);
        // Validate all required fields before promoting
        const missingFields = [];
        if (!applicant.first_name)
            missingFields.push('First Name');
        if (!applicant.last_name)
            missingFields.push('Last Name');
        if (!applicant.school_id)
            missingFields.push('School');
        if (!applicant.class_id)
            missingFields.push('Class');
        if (!applicant.category)
            missingFields.push('Category');
        if (!applicant.gender)
            missingFields.push('Gender');
        if (!applicant.date_of_birth)
            missingFields.push('Date of Birth');
        if (!applicant.registration_date)
            missingFields.push('Registration Date');
        if (applicant.scores === undefined || applicant.scores === null || isNaN(applicant.scores))
            missingFields.push('Scores');
        // Prevent promotion if score is default (0, empty, or not changed)
        if (applicant.scores === 0) {
            toast.warning(`Cannot promote ${applicant.first_name}: Score not entered or is default.`);
            setPromotingId(null);
            return;
        }
        if (missingFields.length > 0) {
            toast.warning(`Please fill in all required fields for ${applicant.first_name}: ${missingFields.join(', ')}`);
            setPromotingId(null);
            return;
        }
        const hasPassed = ((_b = applicant.scores) !== null && _b !== void 0 ? _b : 0) >= passMark;
        // ❌ If failed, reject and stop here (no need to check class or school)
        if (!hasPassed) {
            await registrationService.updatePartial((_c = applicant.id) !== null && _c !== void 0 ? _c : 0, { status: "rejected" });
            toast.warning(`${applicant.first_name} did not meet the pass mark and has been rejected.`);
            const refreshedApplicants = await registrationService.getAll();
            setApplicants(refreshedApplicants);
            setPromotingId(null);
            return;
        }
        // Validate class slots
        const selectedClass = classes.find((cls) => cls.id === applicant.class_id);
        const currentCount = applicants.filter((a) => a.class_id === applicant.class_id && a.status === 'approved').length;
        if (selectedClass && selectedClass.slots !== undefined && currentCount >= selectedClass.slots) {
            toast.error(`Class "${selectedClass.name}" is full (${selectedClass.slots} slots). Cannot promote ${applicant.first_name}.`);
            setPromotingId(null);
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
                academic_year_id: (_d = applicant.academic_year_id) !== null && _d !== void 0 ? _d : 3, // Use current year if not set 
                dob: dob,
                gender: applicant.gender,
                scores: (_e = applicant.scores) !== null && _e !== void 0 ? _e : 0,
                registration_date: format(new Date((_f = applicant.registration_date) !== null && _f !== void 0 ? _f : ''), 'yyyy-MM-dd'),
                category_id: Number(applicant.category),
                class_id: applicant.class_id,
                status: 'inactive',
                middle_name: (_g = applicant.middle_name) !== null && _g !== void 0 ? _g : ''
            };
            await Promise.all([
                studentService.create(studentPayload),
                registrationService.updatePartial((_h = applicant.id) !== null && _h !== void 0 ? _h : 0, { status: "approved" })
            ]);
            toast.success(`${applicant.first_name} promoted successfully.`);
            const refreshedApplicants = await registrationService.getAll();
            setApplicants(refreshedApplicants);
        }
        catch (err) {
            if (((_j = err.response) === null || _j === void 0 ? void 0 : _j.status) === 400) {
                toast.warning(`Duplicate entry: ${applicant.first_name} ${applicant.last_name}`);
            }
            else {
                toast.error(`Failed to promote ${applicant.first_name}`);
                console.error(`Promotion error for ${applicant.first_name}:`, err);
            }
        }
        setPromotingId(null);
    };
    // Filter applicants based on index, not a separate variable
    const categoryOrder = ['SVC', 'MOD', 'CIV'];
    const pendingApplicants = useMemo(() => {
        return applicants
            .filter((a) => {
            var _a, _b;
            const matchesStatus = a.status === 'pending';
            const isPaymentValid = a.payment_status !== 'unpaid';
            const matchesClass = selectedClassId === '' || a.class_id === selectedClassId;
            const matchesAppliedClass = selectedAppliedClass === '' || a.class_applying_for === selectedAppliedClass;
            const categoryName = (_a = categories.find(c => Number(c.id) === Number(a.category))) === null || _a === void 0 ? void 0 : _a.name;
            const matchesCategory = categoryName && categoryOrder.includes(categoryName);
            // Search by name
            const fullName = `${a.first_name} ${(_b = a.middle_name) !== null && _b !== void 0 ? _b : ''} ${a.last_name}`.toLowerCase();
            const searchTerm = searchName.trim().toLowerCase();
            const matchesSearch = !searchTerm || fullName.includes(searchTerm);
            return matchesStatus && isPaymentValid && matchesClass && matchesAppliedClass && matchesCategory && matchesSearch;
        })
            .sort((a, b) => {
            var _a, _b;
            const aName = ((_a = categories.find(c => Number(c.id) === Number(a.category))) === null || _a === void 0 ? void 0 : _a.name) || '';
            const bName = ((_b = categories.find(c => Number(c.id) === Number(b.category))) === null || _b === void 0 ? void 0 : _b.name) || '';
            return categoryOrder.indexOf(aName) - categoryOrder.indexOf(bName);
        });
    }, [applicants, selectedClassId, selectedAppliedClass, categories, passMark, searchName]);
    const uniqueAppliedClasses = Array.from(new Set(applicants.map((a) => a.class_applying_for).filter(Boolean)));
    const uniqueCategories = Array.from(new Set(applicants.map((a) => a.category).filter(Boolean))).map(catId => {
        const category = categories.find(c => Number(c.id) === Number(catId));
        return category ? category.name : catId; // fallback to ID if name not found
    });
    const handleSaveScores = async () => {
        let updatedCount = 0;
        const failed = [];
        for (const applicant of applicants) {
            if (applicant.scores !== undefined && applicant.scores !== null) {
                try {
                    const formattedDOB = applicant.date_of_birth
                        ? format(new Date(applicant.date_of_birth), 'yyyy-MM-dd')
                        : null;
                    await registrationService.update(applicant.id, Object.assign(Object.assign({}, applicant), { scores: applicant.scores, date_of_birth: formattedDOB }));
                    updatedCount++;
                }
                catch (error) {
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
            }
            catch (err) {
                console.error('Failed to refresh applicants after saving:', err);
                toast.error('Could not refresh updated scores from server.');
            }
        }
        if (failed.length > 0) {
            toast.error(`Failed to save scores for: ${failed.join(', ')}`);
        }
    };
    return (<div className="p-6 space-y-6">
      <Toaster richColors/>
      <h1 className="text-2xl font-bold">Applicant Result Management</h1>

      <div className="flex items-center gap-4">
        {/* Search bar for name */}
        <Input type="text" placeholder="Search by name..." value={searchName} onChange={e => setSearchName(e.target.value)} className="w-64"/>
        {/* Only show pass mark input to admins */}
        {isAdmin && (<>
            <label>Pass Mark:</label>
            <Input type="number" value={passMark} onChange={(e) => setPassMark(parseInt(e.target.value) || 0)} className="w-24"/>
          </>)}
        
        <Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="w-80"/>
        
        {isAdmin && (<Button onClick={handlePromote} className="bg-blue-600 text-white">
            Promote Passed
          </Button>)}
      </div>

      <div className="flex items-center gap-4">
        <label htmlFor="appliedClassFilter">Filter by Applied Class:</label>
        <select id="appliedClassFilter" className="border p-1 rounded" value={selectedAppliedClass} onChange={(e) => setSelectedAppliedClass(e.target.value)}>
          <option value="">All</option>
          {uniqueAppliedClasses.map((clsName) => (<option key={clsName} value={clsName}>
              {clsName}
            </option>))}
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
            <TableHead>#</TableHead>
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
          {pendingApplicants.map((applicant, idx) => {
            var _a, _b, _c, _d;
            // Use the original applicant index for state updates
            const originalIndex = applicants.findIndex(a => a.id === applicant.id);
            const passed = ((_a = applicant.scores) !== null && _a !== void 0 ? _a : 0) >= passMark;
            return (<TableRow key={applicant.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  {((_b = categories.find(c => Number(c.id) === Number(applicant.category))) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown'}
                </TableCell>
                <TableCell>{applicant.first_name} {applicant.middle_name} {applicant.last_name}</TableCell>
                <TableCell>
                  {applicant.class_applying_for || 'N/A'}
                </TableCell>
                <TableCell>
                  <Input type="number" value={applicant.scores === undefined || applicant.scores === null ? '' : applicant.scores} onChange={(e) => {
                    const updated = [...applicants];
                    updated[originalIndex].scores = parseFloat(e.target.value);
                    setApplicants(updated); // update UI instantly
                }} className="w-20" placeholder="0"/>
                </TableCell>
                {isAdmin && (<TableCell>
                    <select title="Select School" aria-label="Select School" className="border p-1 rounded" value={(_c = applicant.school_id) !== null && _c !== void 0 ? _c : ''} onChange={(e) => handleSchoolChange(originalIndex, parseInt(e.target.value))}>
                      <option value="">--Select--</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </TableCell>)}
                {isAdmin && (<TableCell>
                    <select title="Select Class" aria-label="Select Class" value={(_d = applicant.class_id) !== null && _d !== void 0 ? _d : ''} onChange={(e) => handleClassSelect(originalIndex, parseInt(e.target.value))} className="border p-1 rounded w-full">
                      <option value="">Select Class</option>
                      {classes.map((cls) => {
                        var _a;
                        return (<option key={cls.id} value={cls.id}>
                          {cls.name} ({(_a = classSlots[cls.id]) !== null && _a !== void 0 ? _a : 0}/{cls.slots})
                        </option>);
                    })}
                    </select>
                  </TableCell>)}
                {isAdmin && (<TableCell>
                    {passed ? (<span className="text-green-600 font-bold">Passed</span>) : (<span className="text-red-600">Failed</span>)}
                  </TableCell>)}
                {isAdmin && (<TableCell>
                    {applicant.status === 'pending' && (<Button onClick={async () => {
                            await handleSinglePromote(applicant);
                        }} size="sm" className="bg-green-600 text-white" disabled={promotingId === applicant.id}>
                        {promotingId === applicant.id ? 'Promoting...' : 'Promote'}
                      </Button>)}
                  </TableCell>)}
              </TableRow>);
        })}
        </TableBody>
      </Table>
    </div>);
}
