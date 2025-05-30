/* eslint-disable @typescript-eslint/consistent-type-imports */
'use client';
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateStudentPayload } from "@/types/student";
import studentService from "@/services/students";
import schoolService from "@/services/schools";
import { getAllCategories } from "@/services/categories";
import AdmissionFormModal from "./admission-form/page";

export default function ShortlistedApplicants() {
  const [students, setStudents] = useState<CreateStudentPayload[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<CreateStudentPayload[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<CreateStudentPayload | null>(null);
  const [schools, setSchools] = useState<Record<number, string>>({});
  const [categories, setCategories] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const [studentData, schoolData, categoryData] = await Promise.all([
        studentService.getAll(),
        schoolService.getAll(),
        getAllCategories(),
      ]);

      const inactiveStudents = studentData.filter((s: CreateStudentPayload) => s.status === "inactive");
      setStudents(inactiveStudents);
      setFilteredStudents(inactiveStudents);

      const schoolMap: Record<number, string> = {};
      schoolData.forEach((school) => {
        schoolMap[school.id] = school.name;
      });
      setSchools(schoolMap);

      const categoryMap: Record<number, string> = {};
      categoryData.forEach((category) => {
        categoryMap[category.id] = category.name;
      });
      setCategories(categoryMap);
    };

    fetchData();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const lower = term.toLowerCase();
    const filtered = students.filter(
      (s) =>
        s.first_name.toLowerCase().includes(lower) ||
        s.last_name.toLowerCase().includes(lower) ||
        s.middle_name.toLowerCase().includes(lower)
    );
    setFilteredStudents(filtered);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                {student.first_name} {student.middle_name} {student.last_name}
              </TableCell>
              <TableCell>{student.gender}</TableCell>
              <TableCell>{categories[student.category_id] || "-"}</TableCell>
              <TableCell>{schools[student.school_id] || "-"}</TableCell>
              <TableCell>
                <Button onClick={() => setSelectedStudent(student)}>Fill Form</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedStudent && (
        <AdmissionFormModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdate={() => {
            const updated = students.filter((s) => s.id !== selectedStudent.id);
            setStudents(updated);
            setFilteredStudents(updated);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}
