"use client";
import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, Search, Download, Printer, Mail, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { getReceipts, getPrintableReceipt } from "@/services/receipt";
import studentService from "@/services/students";
export default function PaymentHistoryPage() {
    const [receipts, setReceipts] = useState([]);
    const [realStudents, setRealStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [date, setDate] = useState();
    const [tab, setTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20; // or any number you prefer
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            const filters = {};
            if (search)
                filters.search = search;
            if (date)
                filters.date_from = format(date, "yyyy-MM-dd");
            const data = await getReceipts(filters);
            setReceipts(data);
        }
        catch (err) {
            console.error("Error fetching receipts:", err);
        }
        finally {
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
            }
            catch (err) {
                console.error("Error fetching students:", err);
            }
        };
        fetchStudents();
    }, []);
    const getReceiptTypeBadge = (type) => {
        const variants = {
            levy: { variant: "default", label: "Levy" },
            registration: { variant: "secondary", label: "Registration" },
            textBooks: { variant: "outline", label: "Text Books" },
            exerciseBooks: { variant: "destructive", label: "Exercise Books" },
            furniture: { variant: "default", label: "Furniture" },
            jersey_crest: { variant: "outline", label: "Jersey/Crest" }
        };
        return variants[type] || { variant: "default", label: type };
    };
    const formatCurrency = (amt) => new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS"
    }).format(amt);
    const renderStudentName = (r) => {
        const s = realStudents.find(s => Number(s.id) === Number(r.student_id));
        if (s)
            return [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");
        return r.student_name || "Unknown Student";
    };
    const handleAction = async (action, id) => {
        try {
            if (action === "print") {
                const html = await getPrintableReceipt(id);
                const w = window.open("", "_blank");
                w === null || w === void 0 ? void 0 : w.document.write(html);
                w === null || w === void 0 ? void 0 : w.document.close();
            }
            else {
                toast.info(`${action} feature coming soon`);
            }
        }
        catch (err) {
            console.error("Action error:", err);
            toast.error("Action failed");
        }
    };
    // If you have applicants, fetch and use them for search
    // For now, let's add a local applicants state and fetch logic
    const [applicants, setApplicants] = useState([]);
    useEffect(() => {
        // Only fetch if not already fetched
        if (applicants.length === 0) {
            import('@/services/registrations').then(mod => {
                mod.default.getAll().then(setApplicants).catch(() => { });
            });
        }
    }, [applicants.length]);
    const filteredReceipts = receipts.filter((receipt) => {
        const searchTerm = search.toLowerCase().trim();
        // Try to find student
        const student = realStudents.find((s) => Number(s.id) === Number(receipt.student_id));
        // Try to find applicant
        const applicant = applicants.find((a) => Number(a.id) === Number(receipt.registration_id));
        const studentName = student
            ? `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.toLowerCase()
            : '';
        const applicantName = applicant
            ? `${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name}`.toLowerCase()
            : '';
        const receiptId = `r-${receipt.id.toString().padStart(6, '0')}`;
        return (studentName.includes(searchTerm) ||
            applicantName.includes(searchTerm) ||
            receiptId.includes(searchTerm) ||
            receipt.id.toString().includes(searchTerm));
    });
    // 🟢 Extract unique receipt types
    const allTypes = Array.from(new Set(receipts.flatMap(r => { var _a, _b; return (_b = (_a = r.receipt_items) === null || _a === void 0 ? void 0 : _a.map(i => i.receipt_type)) !== null && _b !== void 0 ? _b : []; }))).filter(Boolean);
    const tabs = ["all", ...allTypes];
    // 🟢 Dynamic filter
    const tabData = tab === "all"
        ? filteredReceipts
        : filteredReceipts.filter(r => { var _a; return (_a = r.receipt_items) === null || _a === void 0 ? void 0 : _a.some(i => i.receipt_type === tab); });
    const paginatedReceipts = tabData.slice(indexOfFirstItem, indexOfLastItem);
    // 🟢 Render Table
    const renderTable = (data) => (<Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Receipt #</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Types</TableHead>
          <TableHead>Total Paid</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((r, index) => {
            var _a, _b;
            const paid = (_a = r.amount) !== null && _a !== void 0 ? _a : 0;
            return (<TableRow key={r.id || index}>
              <TableCell>{indexOfFirstItem + index + 1}</TableCell>
              <TableCell>R-{r.id.toString().padStart(6, "0")}</TableCell>
              <TableCell>{renderStudentName(r)}</TableCell>
              <TableCell className="space-x-1">
                {((_b = r.receipt_items) === null || _b === void 0 ? void 0 : _b.length) ? (r.receipt_items.map((i, idx) => (<Badge key={`${i.receipt_type}-${idx}`} variant={getReceiptTypeBadge(i.receipt_type).variant}>
                      {getReceiptTypeBadge(i.receipt_type).label}
                    </Badge>))) : (<Badge variant={getReceiptTypeBadge(r.receipt_items[0].receipt_type).variant}>
                    {getReceiptTypeBadge(r.receipt_items[0].receipt_type).label}
                  </Badge>)}
              </TableCell>
              <TableCell>{formatCurrency(paid)}</TableCell>
              <TableCell>{format(new Date(r.date_issued), "MMM dd, yyyy")}</TableCell>
              <TableCell className="flex space-x-2">
                <Button size="icon" variant="ghost" onClick={() => handleAction("print", r.id)}>
                  <Printer className="w-4 h-4"/>
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleAction("download", r.id)}>
                  <Download className="w-4 h-4"/>
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleAction("email", r.id)}>
                  <Mail className="w-4 h-4"/>
                </Button>
              </TableCell>
            </TableRow>);
        })}
      </TableBody>
    </Table>);
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-[300px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4"/>
            </span>
            <Input placeholder="Search by student name or receipt ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-full"/>

          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4"/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus/>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={fetchPayments}>
            <RefreshCw className="h-4 w-4 mr-2"/> Refresh
          </Button>
        </div>

        <Button variant="outline" onClick={() => toast.info("CSV export coming soon!")}>
          <Download className="h-4 w-4 mr-2"/> Export CSV
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} defaultValue="all">
        <TabsList>
          {tabs.map((t) => (<TabsTrigger key={t} value={t}>
              {t === "all" ? "All" : getReceiptTypeBadge(t).label}
            </TabsTrigger>))}
        </TabsList>

        {tabs.map((t) => (<TabsContent key={t} value={t}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t === "all" ? "All Receipts" : getReceiptTypeBadge(t).label} ({tabData.length})
                </CardTitle>
              </CardHeader>
        <CardContent>{renderTable(paginatedReceipts)}</CardContent>

            </Card>
          </TabsContent>))}
      </Tabs>

      <div className="flex justify-end items-center gap-2 mt-4">
        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
          Prev
        </Button>
        <span>
          Page {currentPage} of {Math.ceil(tabData.length / itemsPerPage)}
        </span>
        <Button variant="outline" size="sm" disabled={indexOfLastItem >= tabData.length} onClick={() => setCurrentPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>);
}
