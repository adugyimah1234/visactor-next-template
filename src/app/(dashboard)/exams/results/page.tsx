/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';
import React, { useEffect, useState } from 'react';
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

export default function ResultsPage() {
  const [applicants, setApplicants] = useState<RegistrationData[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [passMark, setPassMark] = useState<number>(50);
  const [classSlots, setClassSlots] = useState<Record<number, number>>({});
  const { token, user } = useAuth();

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
          const userRoleData = roleData.find(role => role.id === user.role_id);
          setUserRole(userRoleData?.name || '');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchInitial();
  }, [token, user?.role_id]);

  const handleSchoolChange = async (index: number, schoolId: number) => {
    if (typeof schoolId === 'number') {
      const filtered = await classService.getBySchool(schoolId);
      setClasses(filtered);
    } else {
      setClasses([]);
    }
    const updated = [...applicants];
    updated[index].school_id = schoolId;
    updated[index].class_id = undefined;
    setApplicants(updated);
  };

  const handleClassSelect = (index: number, classId: number) => {
    const updated = [...applicants];
    updated[index].class_id = classId;
    setApplicants(updated);

    setClassSlots(prev => ({ ...prev, [classId]: (prev[classId] ?? 0) + 1 }));
  };

  const handleScoreChange = async (index: number, value: string) => {
    try {
      const updated = [...applicants];
      const applicant = updated[index];
      
      // Handle empty string - keep as undefined/null, don't convert to 0 immediately
      if (value === '' || value === null || value === undefined) {
        applicant.scores = 0;
      } else {
        const numericScore = parseInt(value);
        applicant.scores = isNaN(numericScore) ? 0 : numericScore;
      }
      
      // Update local state first for immediate UI feedback
      setApplicants(updated);
      
      // Only update backend if we have a valid numeric value or empty (to clear)
      const scoreToSave = applicant.scores === undefined ? null : applicant.scores;
      await registrationService.update(applicant.id as number, { scores: scoreToSave });
      
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Failed to update score');
      
      // Revert the local state change on error
      const revertedApplicants = await registrationService.getAll();
      setApplicants(revertedApplicants);
    }
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
              await registrationService.update(applicant.id as number, { scores: match.Score });
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
    const passed = applicants.filter(a => 
      (a.scores ?? 0) >= passMark && 
      typeof a.class_id === 'number' && 
      typeof a.school_id === 'number'
    );
    
    let createdCount = 0;
    const duplicates: string[] = [];
    const errors: string[] = [];

    for (const applicant of passed) {
      const studentPayload = {
        first_name: `${applicant.first_name}`,
        last_name: `${applicant.last_name}`,
        school_id: applicant.school_id ?? 0,
        admission_status: 'admitted',
        dob: format(new Date(applicant.date_of_birth ?? '0'), 'yyyy-MM-dd'),
        gender: applicant.gender ?? '',
        scores: applicant.scores ?? 0,
        registration_date: format(new Date(applicant.registration_date ?? ''), 'yyyy-MM-dd'),
        category_id: 2,
        class_id: applicant.class_id ?? 0,
        status: 'inactive',
        id: 0,
        middle_name: ''
      };
      
      try {
        await studentService.create(studentPayload);
        await registrationService.update(applicant.id as number, { status: 'approved' });
        createdCount++;
      } catch (err: any) {
        console.error('Error promoting student:', err);
        if (err.response?.status === 400) {
          duplicates.push(`${studentPayload.first_name} ${studentPayload.last_name}`);
        } else {
          errors.push(`${studentPayload.first_name} ${studentPayload.last_name}`);
        }
      }
    }

    // Show appropriate messages
    if (createdCount > 0) {
      toast.success(`${createdCount} student(s) promoted successfully.`);
    }
    if (duplicates.length > 0) {
      toast.warning(`Skipped ${duplicates.length} duplicate(s): ${duplicates.join(', ')}`);
    }
    if (errors.length > 0) {
      toast.error(`Failed to promote ${errors.length} student(s): ${errors.join(', ')}`);
    }
    if (createdCount === 0 && duplicates.length === 0 && errors.length === 0) {
      toast.info('No students were promoted.');
    }

    // Refresh applicants data to reflect status changes
    try {
      const refreshedApplicants = await registrationService.getAll();
      setApplicants(refreshedApplicants);
    } catch (error) {
      console.error('Error refreshing applicants:', error);
    }
  };

  // Filter applicants based on index, not a separate variable
  const pendingApplicants = applicants.filter((a) => a.status === "pending");

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingApplicants.map((applicant, idx) => {
            // Use the original applicant index for state updates
            const originalIndex = applicants.findIndex(a => a.id === applicant.id);
            const passed = (applicant.scores ?? 0) >= passMark;
            const availableClasses = classes.filter(c => c.school_id === applicant.school_id);

            return (
              <TableRow key={applicant.id}>
                <TableCell>{applicant.first_name} {applicant.last_name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={applicant.scores === undefined || applicant.scores === null ? '' : applicant.scores.toString()}
                    onChange={(e) => {
                      handleScoreChange(originalIndex, e.target.value);
                    }}
                    className="w-20"
                    placeholder="0"
                  />
                </TableCell>
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
                <TableCell>
                  <select
                    title="Select Class"
                    aria-label="Select Class"
                    className="border p-1 rounded"
                    value={applicant.class_id ?? ''}
                    onChange={(e) => handleClassSelect(originalIndex, parseInt(e.target.value))}
                    disabled={!applicant.school_id}
                  >
                    <option value="">--Select--</option>
                    {availableClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (Lvl {c.level})</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  {passed ? (
                    <span className="text-green-600 font-bold">Passed</span>
                  ) : (
                    <span className="text-red-600">Failed</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}