/* eslint-disable no-console */
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from 'lucide-react';
import { School, Student, getQualifiedStudents, getSchools, assignSchool } from '@/services/admissions';

export default function AdmissionProcess() {
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSchoolAssignment = async (studentId: number, schoolId: number, classId: number) => {
    try {
      await assignSchool(studentId, schoolId, classId);
      // Refresh the students list
      const updatedStudents = await getQualifiedStudents();
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Failed to assign school:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <div className="relative w-[300px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <Input
                placeholder="Search students..."
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Exam Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned School</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.examScore}%</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      student.status === 'enrolled' ? 'default' :
                      student.status === 'assigned' ? 'secondary' : 'outline'
                    }
                  >
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    disabled={student.status === 'enrolled'}
                    onValueChange={(schoolId) => {
                      // Handle school selection
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem
                          key={school.id}
                          value={school.id.toString()}
                          disabled={school.currentCapacity >= school.maxCapacity}
                        >
                          {school.name} ({school.currentCapacity}/{school.maxCapacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!student.schoolId || student.status === 'enrolled'}
                    onClick={() => handleSchoolAssignment(student.id, student.schoolId!, 1)}
                  >
                    Confirm Assignment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}