/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';
import { useEffect, useState } from 'react';
import { Search, Download, MoreHorizontal, } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import studentService from '@/services/students';
import classService from '@/services/class';
import schoolService from '@/services/schools';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
export default function ShortlistedPage() {
    var _a, _b;
    const [selectedProgram, setSelectedProgram] = useState('all');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentToRemove, setStudentToRemove] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSchoolId, setActiveSchoolId] = useState(''); // school ID as string
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [activeClassTab, setActiveClassTab] = useState({});
    const getCategoryName = (categoryId) => {
        switch (categoryId) {
            case 1:
                return 'SVC';
            case 2:
                return 'MOD';
            case 3:
                return 'CIV';
            default:
                return 'Unknown';
        }
    };
    const handleViewProfile = (student) => {
        setSelectedStudent(student);
        setShowProfile(true);
    };
    useEffect(() => {
        const loadStudents = async () => {
            try {
                const allStudents = await studentService.getAll();
                const shortlisted = allStudents.filter((s) => s.status === 'inactive');
                setStudents(shortlisted);
            }
            catch (err) {
                console.error('Failed to fetch students:', err);
            }
            finally {
                setLoading(false);
            }
        };
        loadStudents();
    }, []);
    useEffect(() => {
        const loadData = async () => {
            try {
                const allStudents = await studentService.getAll();
                const shortlisted = allStudents.filter((s) => s.status === 'inactive');
                setStudents(shortlisted);
                const allClasses = await classService.getAll();
                setClasses(allClasses);
            }
            catch (err) {
                console.error('Failed to fetch data:', err);
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    useEffect(() => {
        const fetchClassesForSchool = async () => {
            if (!activeSchoolId)
                return;
            try {
                const classList = await classService.getBySchool(Number(activeSchoolId));
                setClasses(classList);
            }
            catch (err) {
                console.error("Failed to fetch classes for school:", err);
            }
        };
        fetchClassesForSchool();
    }, [activeSchoolId]);
    const getClassName = (classId) => {
        const classItem = classes.find(c => c.id === classId);
        return classItem ? `${classItem.name} ` : '—';
    };
    const [schools, setSchools] = useState([]);
    useEffect(() => {
        const fetchSchools = async () => {
            const schoolList = await schoolService.getAll();
            setSchools(schoolList);
        };
        fetchSchools();
    }, []);
    const getSchoolName = (schoolId) => {
        const school = schools.find(s => s.id === schoolId);
        return school ? school.name : '—';
    };
    const filteredStudents = (_a = students.filter((s) => {
        const fullName = `${s.first_name} ${s.middle_name} ${s.last_name}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase());
        const matchesClass = selectedClassId === 'all' || s.class_id.toString() === selectedClassId;
        return matchesSearch && matchesClass;
    })) !== null && _a !== void 0 ? _a : [];
    const handleExport = (schoolId) => {
        var _a, _b;
        const filtered = (_a = students.filter((s) => {
            const fullName = `${s.first_name} ${s.middle_name} ${s.last_name}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase());
            const matchesClass = selectedClassId === 'all' || s.class_id.toString() === selectedClassId;
            return matchesSearch && matchesClass;
        })) !== null && _a !== void 0 ? _a : [];
        if (filtered.length === 0) {
            toast({ title: "No students to export for this selection." });
            return;
        }
        const schoolName = getSchoolName(schoolId).replace(/\s+/g, '-');
        const className = selectedClassId === 'all'
            ? 'AllClasses'
            : ((_b = classes.find(c => c.id.toString() === selectedClassId)) === null || _b === void 0 ? void 0 : _b.name.replace(/\s+/g, '-')) || 'Class';
        const exportData = filtered.map((s) => ({
            Name: `${s.first_name} ${s.middle_name} ${s.last_name}`,
            Score: `${s.scores}%`,
            Class: getClassName(s.class_id),
            Category: getCategoryName(s.category_id),
            Status: s.status,
            AdmissionStatus: s.admission_status,
            Gender: s.gender,
            DOB: s.dob,
            RegisteredOn: s.registration_date
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        XLSX.writeFile(workbook, `students-${schoolName}-${className}.xlsx`);
    };
    const printAdmittedList = (schoolId, classId, students) => {
        const admitted = students.filter((s) => s.school_id === schoolId &&
            (classId === 'all' || s.class_id.toString() === classId) &&
            s.admission_status === 'admitted');
        const schoolName = getSchoolName(schoolId);
        const className = classId === 'all' ? 'All Classes' : getClassName(Number(classId));
        const printWindow = window.open('', '', 'width=900,height=700');
        if (!printWindow)
            return;
        const tableRows = admitted.map((s) => `
    <tr>
      <td style="border:1px solid #ccc;padding:8px;">${s.first_name} ${s.middle_name} ${s.last_name}</td>
      <td style="border:1px solid #ccc;padding:8px;">${getClassName(s.class_id)}</td>
      <td style="border:1px solid #ccc;padding:8px;">${getCategoryName(s.category_id)}</td>
    </tr>
  `).join('');
        const htmlContent = `
    <html>
    <head>
      <title>Admitted Students</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      </style>
    </head>
    <body>
      <h2>Admitted Students - ${schoolName} (${className})</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };
    return (<div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shortlisted Candidates</CardTitle>

        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
  <div className="flex-1">
    <div className="relative max-w-sm">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search className="h-4 w-4"/>
      </span>
      <Input placeholder="Search candidates..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
    </div>

  </div>

    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Select Class"/>
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Classes</SelectItem>
    {classes
            .filter((cls) => cls.school_id === Number(activeSchoolId))
            .map((cls) => (<SelectItem key={cls.id} value={cls.id.toString()}>
          {cls.name}
        </SelectItem>))}
  </SelectContent>
    </Select>

    </div>


          {/* Candidates List */}
    <Tabs value={activeSchoolId || ((_b = schools[0]) === null || _b === void 0 ? void 0 : _b.id.toString())} onValueChange={(val) => {
            setActiveSchoolId(val);
            setSelectedClassId(val); // reset class filter on school change
        }} className="w-full">

  <TabsList className="flex overflow-x-auto">
    {schools.map((school) => (<TabsTrigger key={school.id} value={school.id.toString()}>
        {school.name}
      </TabsTrigger>))}
  </TabsList>

        {schools.map((school) => {
            const selectedClassTab = activeClassTab[school.id] || 'all';
            const filteredStudents = students.filter((s) => s.school_id === school.id &&
                (selectedClassTab === 'all' || s.class_id.toString() === selectedClassTab) &&
                `${s.first_name} ${s.middle_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
            return (<TabsContent key={school.id} value={school.id.toString()}>
      {/* Class Tabs */}
      <Tabs value={selectedClassTab} onValueChange={(val) => setActiveClassTab((prev) => (Object.assign(Object.assign({}, prev), { [school.id]: val })))} className="mt-4">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="all">All Classes</TabsTrigger>
          {classes
                    .filter((cls) => cls.school_id === school.id)
                    .map((cls) => (<TabsTrigger key={cls.id} value={cls.id.toString()}>
                {cls.name}
              </TabsTrigger>))}
        </TabsList>

        <TabsContent value={selectedClassTab}>
          <div className="flex justify-end mb-4 gap-2">

            <Button onClick={() => printAdmittedList(school.id, selectedClassTab, students)} className="mb-4">
  Print Admitted List
            </Button>
            <Button onClick={() => handleExport(school.id)}>
              <Download className="mr-2 h-4 w-4"/>
              Export
            </Button>
          </div>

          <div id={`print-area-${school.id}-${selectedClassTab}`} className="overflow-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Score</th>
                  <th className="p-3 border">Class</th>
                  <th className="p-3 border">Category</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (<tr key={student.id} className="hover:bg-accent/30">
                    <td className="p-3 border font-medium">
                      {student.first_name} {student.middle_name} {student.last_name}
                    </td>
                    <td className="p-3 border">{student.scores}%</td>
                    <td className="p-3 border">{getClassName(student.class_id)}</td>
                    <td className="p-3 border">{getCategoryName(student.category_id)}</td>
                    <td className="p-3 border">
                      <Badge variant="secondary">{student.status}</Badge>
                    </td>
                    <td className="p-3 border">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewProfile(student)}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStudentToRemove(student)} className="text-red-600">
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </TabsContent>);
        })}

    </Tabs>

    <Dialog open={showProfile} onOpenChange={setShowProfile}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Student Profile</DialogTitle>
    </DialogHeader>
    {selectedStudent && (<div className="grid grid-cols-2 gap-4 text-sm">
        <div><strong>Name:</strong> {selectedStudent.first_name} {selectedStudent.middle_name} {selectedStudent.last_name}</div>
        <div><strong>DOB:</strong> {selectedStudent.dob}</div>
        <div><strong>Gender:</strong> {selectedStudent.gender}</div>
        <div><strong>Scores:</strong> {selectedStudent.scores}%</div>
        <div><strong>Admission Status:</strong> {selectedStudent.admission_status}</div>
        <div><strong>Status:</strong> {selectedStudent.status}</div>
        <div><strong>Class ID:</strong> {getClassName(selectedStudent.class_id)}</div>
        <div><strong>School ID:</strong> {getSchoolName(selectedStudent.school_id)} ({selectedStudent.school_id})</div>
        <div><strong>Category ID:</strong> {getCategoryName(selectedStudent.category_id)} ({selectedStudent.category_id})</div>
        <div><strong>Registered On:</strong> {selectedStudent.registration_date}</div>
      </div>)}
  </DialogContent>
    </Dialog>

    <AlertDialog open={!!studentToRemove} onOpenChange={() => setStudentToRemove(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        You are about to remove <strong>{studentToRemove === null || studentToRemove === void 0 ? void 0 : studentToRemove.first_name} {studentToRemove === null || studentToRemove === void 0 ? void 0 : studentToRemove.last_name}</strong> from the list. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={async () => {
            if (!studentToRemove)
                return;
            try {
                await studentService.remove(studentToRemove.id);
                setStudents(prev => prev.filter(s => s.id !== studentToRemove.id)); // 👈 update list
                setStudentToRemove(null);
            }
            catch (err) {
                console.error("Failed to remove student:", err);
            }
        }}>
        Confirm Remove
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
    </AlertDialog>

        </CardContent>
      </Card>
    </div>);
}
