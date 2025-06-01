/* eslint-disable no-console */
'use client';

import { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Star,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Computer,
  List,
  Send,
  View,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import studentService from '@/services/students';

// ✅ Define TypeScript type for student
type Student = {
  id: number;
  first_name: string;
  last_name: string;
  exam_score: number;
status: string;
  avatar?: string;
  dob: string;
  gender: string;
  category_id: number;
  scores: number;
  class_id: number;
  registration_date: string;
  admission_status: string;
  school_id: number;
};

export default function ShortlistedPage() {
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const allStudents: Student[] = await studentService.getAll();
        const shortlisted = allStudents.filter((s: Student) => s.status === 'inactive');
        setStudents(shortlisted);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shortlisted Candidates</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Notify All
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export List
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </span>
                <Input placeholder="Search candidates..." className="pl-9" />
              </div>
            </div>
            <Select
              value={selectedProgram}
              onValueChange={setSelectedProgram}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Candidates List */}
          <ScrollArea className="h-[600px]">
            {loading ? (
    <div className="flex justify-center items-center h-full text-muted-foreground">
      Loading shortlisted candidates...
    </div>
  ) : (
<div className="overflow-auto">
  <table className="min-w-full border text-sm">
    <thead className="bg-muted text-left">
      <tr>
        <th className="p-3 border">Name</th>
        <th className="p-3 border">DOB</th>
        <th className="p-3 border">Score</th>
        <th className="p-3 border">Status After Exams</th>
        <th className="p-3 border">Actions</th>
      </tr>
    </thead>
    <tbody>
      {students.map((student) => (
        <tr key={student.id} className="hover:bg-accent/30">
          <td className="p-3 border font-medium">
            {student.first_name} {student.last_name}
          </td>
          <td className="p-3 border text-muted-foreground">{student.dob}</td>
          <td className="p-3 border">{student.scores}%</td>
          <td className="p-3 border">
            <Badge variant="secondary">{student.status}</Badge>
          </td>
          <td className="p-3 border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                <DropdownMenuItem>Send Message</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
