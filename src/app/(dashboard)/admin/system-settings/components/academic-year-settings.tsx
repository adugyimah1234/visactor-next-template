'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from "sonner";

interface AcademicYear {
  id: number;
  year: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
}

export default function AcademicYearSettings() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([
    {
      id: 1,
      year: '2023-2024',
      startDate: '2023-09-01',
      endDate: '2024-06-30',
      status: 'active'
    },
    {
      id: 2,
      year: '2024-2025',
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      status: 'upcoming'
    }
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Academic Years</CardTitle>
          <CardDescription>Manage academic years and their schedules</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Academic Year
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Academic Year</DialogTitle>
              <DialogDescription>
                Create a new academic year with start and end dates
              </DialogDescription>
            </DialogHeader>
            {/* Add form fields here */}
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Academic Year</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {academicYears.map((year) => (
              <TableRow key={year.id}>
                <TableCell className="font-medium">{year.year}</TableCell>
                <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      year.status === 'active' 
                        ? 'default' 
                        : year.status === 'upcoming' 
                          ? 'secondary' 
                          : 'outline'
                    }
                  >
                    {year.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
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