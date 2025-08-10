/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose, } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createAcademicYear, getAllAcademicYear, } from '@/services/academic_year';
export default function AcademicYearSettings() {
    const [academicYears, setAcademicYears] = useState([]);
    const [year, setYear] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    // Fetch all academic years on mount
    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                const data = await getAllAcademicYear();
                setAcademicYears(data);
            }
            catch (error) {
                toast.error(error.message);
            }
        };
        fetchAcademicYears();
    }, []);
    const handleCreate = async () => {
        if (!year || !startDate || !endDate) {
            toast.error('All fields are required');
            return;
        }
        setIsCreating(true);
        try {
            const payload = {
                year: year,
                start_date: new Date(startDate),
                end_date: new Date(endDate),
            };
            const created = await createAcademicYear(payload);
            setAcademicYears((prev) => [...prev, created]);
            toast.success('Academic year created');
            // Clear form
            setYear('');
            setStartDate('');
            setEndDate('');
            // ✅ Close dialog manually after success
            const closeButton = document.getElementById('close-dialog-button');
            if (closeButton)
                closeButton.click();
        }
        catch (error) {
            toast.error(error.message);
        }
        finally {
            setIsCreating(false);
        }
    };
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Academic Years</CardTitle>
          <CardDescription>
            Manage academic years and their schedules
          </CardDescription>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2"/>
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

            <div className="space-y-4 py-4">
              <Input placeholder="e.g. 2025" type="number" value={year} onChange={(e) => setYear(e.target.value)}/>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" id='close-dialog-button'>Cancel</Button>
              </DialogClose>
    <DialogClose asChild>
  <Button onClick={handleCreate} disabled={isCreating}>
    {isCreating ? 'Creating...' : 'Create'}
  </Button>
    </DialogClose>


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
            {academicYears.map((year) => {
            const status = new Date(year.end_date) < new Date()
                ? 'completed'
                : new Date(year.start_date) > new Date()
                    ? 'upcoming'
                    : 'active';
            return (<TableRow key={year.id}>
                  <TableCell className="font-medium">{year.year}</TableCell>
                  <TableCell>
                    {new Date(year.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(year.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status === 'active'
                    ? 'default'
                    : status === 'upcoming'
                        ? 'secondary'
                        : 'outline'}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </TableCell>
                </TableRow>);
        })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>);
}
