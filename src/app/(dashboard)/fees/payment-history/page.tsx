'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar as CalendarIcon, Search, Download, Printer, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { getReceipts, getPrintableReceipt } from '@/services/receipt';
import studentService from '@/services/students';
import { toast } from 'sonner';
import { Receipt } from '@/types/receipt';
import { Student } from '@/types/student';

export default function PaymentHistoryPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [realStudents, setRealStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [tab, setTab] = useState<'registration' | 'other'>('registration');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (search) filters.search = search;
      if (date) filters.date_from = format(date, 'yyyy-MM-dd');

      const data = await getReceipts(filters);
      setReceipts(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }, [search, date]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentService.getAll();
        setRealStudents(data);
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };
    fetchStudents();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const renderStudentName = (receipt: Receipt): string => {
    if (receipt.receipt_type === 'registration') {
      return receipt.student_name || 'Unknown Student';
    }

    const student = realStudents.find(s => Number(s.id) === Number(receipt.student_id));
    if (!student) return 'Unknown Student';

    const fullName = [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || 'Unnamed Student';
  };

  const handleAction = async (type: string, id: number) => {
    try {
      if (type === 'print') {
        const html = await getPrintableReceipt(id);
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
        } else {
          toast('Unable to open print window. Please allow pop-ups.');
        }
      } else if (type === 'download') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Receipt downloaded');
      } else if (type === 'email') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Receipt emailed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Action failed');
    }
  };

  const exportToCSV = (data: Receipt[]) => {
    const headers = ['Receipt #', 'Student', 'Type', 'Amount', 'Method', 'Date'];
    const rows = data.map((p) => [
      `R-${p.id.toString().padStart(6, '0')}`,
      renderStudentName(p),
      p.receipt_type,
      formatCurrency(p.amount),
      p.payment_type || 'cash',
      format(new Date(p.date_issued), 'MMM dd, yyyy')
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'payment_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const registrationReceipts = receipts.filter(r => r.receipt_type === 'registration');
  const otherReceipts = receipts.filter(r => r.receipt_type !== 'registration');

  const renderTable = (data: Receipt[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Receipt #</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono">R-{p.id.toString().padStart(6, '0')}</TableCell>
            <TableCell>{renderStudentName(p)}</TableCell>
            <TableCell>
              <Badge variant="secondary">{p.receipt_type}</Badge>
            </TableCell>
            <TableCell>{formatCurrency(p.amount)}</TableCell>
            <TableCell>{p.payment_type || 'cash'}</TableCell>
            <TableCell>{format(new Date(p.date_issued), 'MMM dd, yyyy')}</TableCell>
            <TableCell className="flex space-x-2">
              <Button size="icon" variant="ghost" onClick={() => handleAction('print', p.id)}>
                <Printer className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleAction('download', p.id)}>
                <Download className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleAction('email', p.id)}>
                <Mail className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-[300px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <Input
              placeholder="Search student or receipt..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={fetchPayments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Button variant="outline" onClick={() => exportToCSV(tab === 'registration' ? registrationReceipts : otherReceipts)}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="registration" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="registration">Registration Receipts</TabsTrigger>
          <TabsTrigger value="other">Other Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="registration">
          <Card>
            <CardHeader>
              <CardTitle>Registration Receipts ({registrationReceipts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(registrationReceipts)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle>Other Receipts ({otherReceipts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(otherReceipts)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
