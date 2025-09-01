'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import studentService, { CreateStudentPayload } from '@/services/students';

import schoolService from '@/services/schools';
import { toast } from 'sonner';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { getAllCategories } from '@/services/categories';
import classService from '@/services/class';
import { getAllAcademicYear } from '@/services/academic_year';
import { useForm } from 'react-hook-form';
import { RefreshCcw } from "lucide-react";
import { Printer } from "lucide-react";
import { ChangeSchoolDialog } from '@/components/admission/ChangeSchoolDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Student {
  id?: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob: string;
  gender: string;
  category_id: number;
  jersey_size?: string;
  class_id: number;
  academic_year_id: number;
  school_id: number;
  admission_status: string;
}

interface NamedItem {
  id: number;
  name: string;
  year?: string;
}

export default function StudentListPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [categories, setCategories] = useState<NamedItem[]>([]);
  const [classes, setClasses] = useState<NamedItem[]>([]);
  const [academicYears, setAcademicYears] = useState<NamedItem[]>([]);
  const [schools, setSchools] = useState<NamedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const [isChangeSchoolDialogOpen, setIsChangeSchoolDialogOpen] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null);
  const [selectedCurrentSchoolId, setSelectedCurrentSchoolId] = useState<string | null>(null);

  const handleChangeSchoolClick = (admissionId: number, currentSchoolId: number) => {
    setSelectedAdmissionId(String(admissionId));
    setSelectedCurrentSchoolId(String(currentSchoolId));
    setIsChangeSchoolDialogOpen(true);
  };
const {
  register,
  handleSubmit,
  reset,
  watch,
  formState: { errors, isSubmitting }
} = useForm<CreateStudentPayload>();

const [derivedSchoolId, setDerivedSchoolId] = useState<number | null>(null);

// Automatically fetch school_id based on selected class_id
const selectedClassId = watch('class_id');

useEffect(() => {
  const fetchSchoolFromClass = async () => {
    if (selectedClassId) {
      try {
        const cls = await classService.getById(Number(selectedClassId));
        setDerivedSchoolId(cls.school_id);
      } catch (error) {
        toast.error('Failed to fetch class info');
      }
    }
  };
  fetchSchoolFromClass();
}, [selectedClassId]);


const onSubmit = async (data: CreateStudentPayload) => {
  if (!derivedSchoolId) {
    toast.error('Please select a valid class');
    return;
  }

  try {
    await studentService.create({
      ...data,
      school_id: derivedSchoolId,
      status: 'active',
      scores: 0,
      registration_date: new Date().toISOString().split('T')[0],
      admission_status: 'in_school',
    });
    toast.success("Student created successfully");
    reset(); // clear the form
  } catch (err) {
    console.error(err);
    toast.error("Failed to create student");
  }
};


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, catData, classData, yearData, schoolData] = await Promise.all([
          studentService.getAll(),
          getAllCategories(),
          classService.getAll(),
          getAllAcademicYear(),
          schoolService.getAll()
        ]);
        setStudents(studentsData);
        setCategories(catData);
        setClasses(classData);
        // Transform academicYear to NamedItem format
        const transformedYearData = yearData.map(year => ({
          id: year.id,
          name: year.year
        }));
        setAcademicYears(transformedYearData);
        setSchools(schoolData);
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json<Student>(ws);

      try {
        for (const s of data) {
await studentService.create({
  ...s,
  middle_name: s.middle_name || '',
  admission_status: s.admission_status || 'admitted',
  status: 'active',
  registration_date: new Date().toISOString().split('T')[0],
  scores: 0
});

        }
        toast.success('Students uploaded successfully');
      } catch (err) {
        console.error(err);
        toast.error('Upload failed');
      }
    };
    reader.readAsBinaryString(file);
  };

  const getNameById = (list: NamedItem[], id: number, fallback = '-') => {
    const found = list.find(item => item.id === id);
    return found?.name || found?.year || fallback;
  };

  const exportToExcel = (data: Student[]) => {
    const mapped = data.map((s) => ({
      'First Name': s.first_name,
      'Middle Name': s.middle_name,
      'Last Name': s.last_name,
      'Class': getNameById(classes, s.class_id),
      'Category': getNameById(categories, s.category_id),
      'Academic Year': getNameById(academicYears, s.academic_year_id),
      'School': getNameById(schools, s.school_id),
      'Date of Birth': new Date(s.dob).toISOString().split('T')[0],
      'Gender': s.gender,
      'Admission Status': s.admission_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(mapped);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'filtered_students.xlsx');
  };

  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const filteredStudents = students.filter(s =>
    (!selectedSchool || s.school_id === selectedSchool) &&
    (!selectedClass || s.class_id === selectedClass) &&
    (!selectedYear || s.academic_year_id === selectedYear)
  );

  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  
  const handleRefresh = async () => {
  setLoading(true);
  try {
    const [studentsData, catData, classData, yearData, schoolData] = await Promise.all([
      studentService.getAll(),
      getAllCategories(),
      classService.getAll(),
      getAllAcademicYear(),
      schoolService.getAll()
    ]);
    setStudents(studentsData);
    setCategories(catData);
    setClasses(classData);
    // Transform academicYear to NamedItem format for refresh too
    const transformedYearData = yearData.map(year => ({
      id: year.id,
      name: year.year
    }));
    setAcademicYears(transformedYearData);
    setSchools(schoolData);
    toast.success('Data refreshed');
  } catch (err: any) {
    console.error(err);
    toast.error('Failed to refresh data');
  } finally {
    setLoading(false);
  }
};

const handlePrint = () => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const printableHTML = `
    <html>
      <head>
        <title>Student List</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          h2 { text-align: center; }
        </style>
      </head>
      <body>
        <h2>Student List - ${getNameById(classes, selectedClass || 0)}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Category</th>
              <th>School</th>
              <th>Jersey Size</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStudents.map((s, index) => `
              <tr>
                <td>${ indexOfFirst + index + 1 }</td>
                <td>${s.first_name} ${s.middle_name || ''} ${s.last_name}</td>
                <td>${s.gender}</td>
                <td>${getNameById(categories, s.category_id)}</td>
                <td>${getNameById(schools, s.school_id)}</td>
                <td>${(s.jersey_size || "-")}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printableHTML);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};


return (
    <div className="space-y-6">
    <Card>
  <CardHeader>
    <CardTitle className="text-lg">Add Existing Student</CardTitle>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input {...register("first_name", { required: true })} placeholder="First Name" className="input" />
      <input {...register("middle_name")} placeholder="Middle Name" className="input" />
      <input {...register("last_name", { required: true })} placeholder="Last Name" className="input" />
      <input {...register("dob", { required: true })} type="date" className="input" />

      <select {...register("gender", { required: true })} className="input">
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <select {...register("class_id", { required: true })} className="input">
        <option value="">Select Class</option>
{classes.map(cls => (
  <option key={cls.id} value={cls.id}>
    {cls.name} ({'school_id' in cls ? schools.find(s => s.id === (cls as any).school_id)?.name : ''})
  </option>
))}
      </select>

      <select {...register("category_id", { required: true })} className="input">
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <div className="col-span-full flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Student'}
        </Button>
      </div>
    </form>

    {derivedSchoolId && (
      <p className="text-sm mt-2 text-muted-foreground">
        School auto-selected: <strong>{schools.find(s => s.id === derivedSchoolId)?.name}</strong>
      </p>
    )}
  </CardContent>
</Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by School and Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">


            <div>
            
              <h3 className="text-sm font-semibold mb-2">Admission Year</h3>
              <div className="flex flex-wrap gap-2">
                {academicYears.map((year) => (
                  <Button
                    key={year.id}
                    variant={selectedYear === year.id ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedYear(year.id);
                      setCurrentPage(1);
                    }}
                  >
                    {year.year}
                  </Button>
                ))}
              </div>
            </div>
<div>
  <h3 className="text-sm font-semibold mb-2">Schools</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => {
                    setSelectedClass(null);
                    setCurrentPage(1);
                  }}>
                  Reset Class</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedSchool(null);
                    setSelectedClass(null);
                    setSelectedYear(null);
                    setCurrentPage(1);
                  }}
                >
                  Reset Filters
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedYear(null);
                    setCurrentPage(1);
                  }}
                >
                  Reset Year
                </Button>
                {schools.map((school) => (
                  <Button
                    key={school.id}
                    variant={selectedSchool === school.id ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedSchool(school.id);
                      setSelectedClass(null);
                      setCurrentPage(1);
                    }}
                  >
                    {school.name}
                  </Button>
                ))}
              </div>
            </div>

            {selectedSchool && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Classes</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Map(
                        students
                          .filter(s => s.school_id === selectedSchool)
                          .map(s => {
                            const cls = classes.find(c => c.id === s.class_id);
                            return cls ? [cls.id, cls] as [number, NamedItem] : null;
                          })
                          .filter((v): v is [number, NamedItem] => v !== null)
                      ).values()
                    ).map(cls => (
                      <Button
                        key={cls.id}
                        variant={selectedClass === cls.id ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedClass(cls.id);
                          setCurrentPage(1);
                        }}
                      >
                        {cls.name}
                      </Button>
                    ))}
                  </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Filtered Students ({filteredStudents.length})</CardTitle>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => exportToExcel(filteredStudents)}
              variant="outline"
            >
              Export to Excel
            </Button>
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} aria-label="Upload Excel file" />
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" /> Upload Excel
            </Button>
            <Button onClick={handleRefresh} variant="outline">
    <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
    </Button>
              <Button onClick={handlePrint} variant="outline">
  <Printer className="w-4 h-4 mr-2" /> Print
</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Middle Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Jersey Size</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Admission Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
  {currentStudents.length > 0 ? (
    currentStudents.map((s, index) => (
      <TableRow key={s.id || index}>
        <TableCell>{indexOfFirst + index + 1}</TableCell>
        <TableCell>{s.first_name}</TableCell>
        <TableCell>{s.middle_name}</TableCell>
        <TableCell>{s.last_name}</TableCell>
        <TableCell>{getNameById(classes, s.class_id)}</TableCell>
        <TableCell>{getNameById(categories, s.category_id)}</TableCell>
        <TableCell>{getNameById(academicYears, s.academic_year_id)}</TableCell>
        <TableCell>{s.jersey_size || '-'}</TableCell>
        <TableCell>{getNameById(schools, s.school_id)}</TableCell>
        <TableCell>{new Date(s.dob).toISOString().split('T')[0]}</TableCell>
        <TableCell>{s.gender}</TableCell>
        <TableCell>{s.admission_status}</TableCell>
        <TableCell>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangeSchoolClick(s.id!, s.school_id)}
            disabled={!s.id || !s.school_id}
          >
            Change School
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => {
              setEditStudent(s);
              setIsEditDialogOpen(true);
            }}
          >
            Edit
          </Button>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
        No students found for the selected filters.
      </TableCell>
    </TableRow>
  )}
</TableBody>
          </Table>

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} />
              </PaginationItem>
              <PaginationItem>
                Page {currentPage} of {totalPages}
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
      {selectedAdmissionId && selectedCurrentSchoolId && (
        <ChangeSchoolDialog
          isOpen={isChangeSchoolDialogOpen}
          onClose={() => setIsChangeSchoolDialogOpen(false)}
          admissionId={selectedAdmissionId}
          currentSchoolId={selectedCurrentSchoolId}
          onSchoolChanged={handleRefresh}
        />
      )}

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editStudent && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updated: Partial<Student> = {};
                formData.forEach((value, key) => {
                  updated[key as keyof Student] = value as any;
                });
                await studentService.updatePartial(editStudent.id!, updated);
                setIsEditDialogOpen(false);
                setEditStudent(null);
                handleRefresh();
              }}
              className="grid grid-cols-1 gap-2"
            >
              <input name="first_name" defaultValue={editStudent.first_name} placeholder="First Name" className="input" />
              <input name="middle_name" defaultValue={editStudent.middle_name} placeholder="Middle Name" className="input" />
              <input name="last_name" defaultValue={editStudent.last_name} placeholder="Last Name" className="input" />
              <input name="dob" defaultValue={editStudent.dob} type="date" className="input" />
              <input name="jersey_size" defaultValue={editStudent.jersey_size} placeholder="Jersey Size" className="input" />
              <select name="gender" defaultValue={editStudent.gender} className="input">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <button type="submit" className="btn btn-primary mt-2">Save Changes</button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
