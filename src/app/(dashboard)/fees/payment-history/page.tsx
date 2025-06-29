"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Download,
  Printer,
  Mail,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getReceipts, getPrintableReceipt } from "@/services/receipt";
import studentService from "@/services/students";
import schoolService from "@/services/schools";
import { Receipt } from "@/types/receipt";
import { Student } from "@/types/student";
import classService, { ClassData } from "@/services/class";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAllCategories, Category } from "@/services/categories";
import { calculateStudentTotalDue } from "../invoices/calculateStudentTotalDue";
import registrationService, { type RegistrationData } from "@/services/registrations";


export default function PaymentHistoryPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [activeSchool, setActiveSchool] = useState<string | null>(null);
  const [activeClassTab, setActiveClassTab] = useState<Record<string, string>>({});
  const [activeReceiptTab, setActiveReceiptTab] = useState<Record<string, string>>({});
  const [applicants, setApplicants] = useState<RegistrationData[]>([]);

  // === Load base data ===
  useEffect(() => {
  const loadAll = async () => {
    const [s, c, st ] = await Promise.all([
      schoolService.getAll(),
      classService.getAll(),
      studentService.getAll(),
    ]);
    setSchools(s);
    setClasses(c);
    setStudents(st);
  };
  loadAll();
}, []);

useEffect(() => {
  getAllCategories().then(setCategories);
}, []);

useEffect(() => {
  registrationService.getAll().then(setApplicants);
}, []);


  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (search) filters.search = search;
      if (date) filters.date_from = format(date, "yyyy-MM-dd");
      const data = await getReceipts(filters);
      setReceipts(data);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  }, [search, date]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amt);

  const getReceiptTypeBadge = (type: string) => {
    const map = {
      levy: { variant: "default", label: "Levy" },
      registration: { variant: "secondary", label: "Registration" },
      textBooks: { variant: "outline", label: "Text Books" },
      exerciseBooks: { variant: "destructive", label: "Exercise Books" },
      furniture: { variant: "default", label: "Furniture" },
      jersey_crest: { variant: "outline", label: "Jersey/Crest" }
    };
    return map[type as keyof typeof map] || { variant: "default", label: type };
  };

  function renderStudentName(receipt: Receipt) {
    // Try to find in students
    const s = students.find((s) => Number(s.id) === Number(receipt.student_id));
    if (s) {
      return [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");
    }
    // Try to find in applicants
    const a = applicants.find((a) => Number(a.id) === Number(receipt.registration_id));
    if (a) {
      return [a.first_name, a.middle_name, a.last_name].filter(Boolean).join(" ");
    }
    // Fallback to receipt fields
    return (
      receipt.student_name ||
      `${receipt.registration_first_name ?? ""} ${receipt.registration_last_name ?? ""}`.trim() ||
      "Unknown"
    );
  }

  const handleAction = async (action: string, id: number) => {
    try {
      if (action === "print") {
        const html = await getPrintableReceipt(id);
        const w = window.open("", "_blank");
        w?.document.write(html);
        w?.document.close();
      } else {
        toast.info(`${action} feature coming soon`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex space-x-4">
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <CalendarIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
        <Button variant="outline" onClick={fetchReceipts}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* School Tabs */}
      <Tabs
        value={activeSchool ?? (schools[0]?.id?.toString() ?? "none")}
        onValueChange={(val) => setActiveSchool(val)}
      >
        <TabsList>
          {schools.map((s) => (
            <TabsTrigger key={s.id} value={s.id.toString()}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {schools.map((school) => {
          const schoolId = school.id.toString();
          const selectedClassTab = activeClassTab[schoolId] || "all";

          const schoolClasses = classes.filter((c) => `${c.school_id}` === schoolId);
          const schoolStudents = students.filter((s) => `${s.school_id}` === schoolId);

          // Get students in the selected school and class
          const selectedStudents = students.filter(
            (s) =>
              `${s.school_id}` === schoolId &&
              (selectedClassTab === "all" ? true : `${s.class_id}` === selectedClassTab)
          );
          const studentIds = selectedStudents.map((s) => s.id);

          // Get applicants in the selected school and class (if applicable)
          const selectedApplicants = applicants.filter(
            (a) =>
              `${a.school_id}` === schoolId &&
              (selectedClassTab === "all" ? true : `${a.class_id}` === selectedClassTab)
          );
          const applicantIds = selectedApplicants.map((a) => a.id);

          const selectedStudentsAndApplicants = [...selectedStudents, ...selectedApplicants];

          const filteredReceipts = receipts.filter((receipt) => {
  // Only include receipts for students/applicants in the selected school/class
  const isStudentInClass = studentIds.includes(receipt.student_id);
  const isApplicantInClass = applicantIds.includes(receipt.registration_id);

  if (!isStudentInClass && !isApplicantInClass) return false;

  const searchLower = search.trim().toLowerCase();

  // Receipt number match (e.g., "R-000123" or "123")
  const receiptNumber = `R-${receipt.id.toString().padStart(6, "0")}`;
  const matchesReceiptNumber =
    receiptNumber.toLowerCase().includes(searchLower) ||
    receipt.id.toString().includes(searchLower);

  // Student/applicant name match
  const student =
    students.find((s) => Number(s.id) === Number(receipt.student_id)) ||
    applicants.find((a) => Number(a.id) === Number(receipt.registration_id));
  const fullName = student
    ? [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ").toLowerCase()
    : "";

  const matchesName = fullName.includes(searchLower);

  return !searchLower || matchesReceiptNumber || matchesName;
});

          const allTypes = Array.from(
            new Set(
              filteredReceipts.flatMap((r) =>
                r.receipt_items?.map((i) => i.receipt_type) ?? [r.receipt_type]
              )
            )
          ).filter(Boolean) as string[];

          const selectedReceiptTab = activeReceiptTab[schoolId] || "all";
          const receiptTabData = (
  selectedReceiptTab === "all"
    ? filteredReceipts
    : filteredReceipts.filter((r) =>
        r.receipt_items?.some((i) => i.receipt_type === selectedReceiptTab) ||
        r.receipt_type === selectedReceiptTab
      )
).filter((r) => {
  // Filter out registration-only receipts
  const types = r.receipt_items?.map((i) => i.receipt_type) ?? [r.receipt_type];
  return !types.every((t) => t === "registration");
});


          return (
            <TabsContent key={school.id} value={schoolId} className="space-y-6">
              {/* Class Tabs */}
              <Tabs
                value={selectedClassTab}
                onValueChange={(val) =>
                  setActiveClassTab((prev) => ({ ...prev, [schoolId]: val }))
                }
              >
                <TabsList className="flex flex-wrap gap-2 mb-4">
                  <TabsTrigger value="all">All Classes</TabsTrigger>
                  {schoolClasses.map((c) => (
                    <TabsTrigger key={c.id} value={c.id.toString()}>
                      {c.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedClassTab}>
                  {/* Receipt Type Tabs */}
                  <Tabs
                    value={selectedReceiptTab}
                    onValueChange={(val) =>
                      setActiveReceiptTab((prev) => ({ ...prev, [schoolId]: val }))
                    }
                  >
                    <TabsList className="flex flex-wrap gap-2 mb-4">
                      <TabsTrigger value="all">All Receipts</TabsTrigger>
                      {allTypes.map((t) => (
                        <TabsTrigger key={t} value={t}>
                          {getReceiptTypeBadge(t).label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value={selectedReceiptTab}>
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {selectedReceiptTab === "all"
                              ? "All Receipts"
                              : getReceiptTypeBadge(selectedReceiptTab).label}{" "}
                            ({receiptTabData.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Receipt #</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Types</TableHead>
                                <TableHead>Amount Paid</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
  {filteredReceipts.map((receipt, index) => {
    // Find student or applicant
    const studentForCalc =
      students.find(s => Number(s.id) === Number(receipt.student_id)) ||
      applicants.find(a => Number(a.id) === Number(receipt.registration_id));

    // Gather all receipts for this student/applicant up to and including this receipt
    const allStudentReceiptsUpToCurrent = receipts.filter(r =>
      (Number(r.student_id) === Number(receipt.student_id) && r.student_id !== null) ||
      (Number(r.registration_id) === Number(receipt.registration_id) && r.registration_id !== null)
    ).filter(r => Number(r.id) <= Number(receipt.id));

    // Collect all paid receipt items' types for this student/applicant up to this receipt
    const paidTypes = new Set<string>();
    allStudentReceiptsUpToCurrent.forEach(r => {
      (r.receipt_items ?? [{ receipt_type: r.receipt_type }]).forEach(item => {
        paidTypes.add(item.receipt_type);
      });
    });

    let balance = 'N/A';
    let totalAmount = 0;
    if (studentForCalc && categories.length && classes.length) {
      totalAmount = calculateStudentTotalDue(
        studentForCalc,
        categories,
        classes,
        []
      );
      const amountLeft = calculateStudentTotalDue(
        studentForCalc,
        categories,
        classes,
        Array.from(paidTypes)
      );
      balance = formatCurrency(amountLeft);
    }

    const amountPaid = receipt.amount ?? 0;
    const isFullyPaid = balance === formatCurrency(0);
    const statusLabel = isFullyPaid ? "Paid in Full" : "Partially Paid";
    const statusVariant = isFullyPaid ? "default" : "secondary";

    return (
      <TableRow key={receipt.id || index}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>R-{receipt.id.toString().padStart(6, "0")}</TableCell>
        <TableCell>{renderStudentName(receipt)}</TableCell>
        <TableCell className="space-x-1">
          {(receipt.receipt_items ?? [{ receipt_type: receipt.receipt_type }]).map((i, idx) => (
            <Badge
              key={`${i.receipt_type}-${idx}`}
              variant={getReceiptTypeBadge(i.receipt_type).variant as "default" | "secondary" | "outline" | "destructive"}
            >
              {getReceiptTypeBadge(i.receipt_type).label}
            </Badge>
          ))}
        </TableCell>
        <TableCell>{formatCurrency(amountPaid)}</TableCell>
        <TableCell>{formatCurrency(totalAmount)}</TableCell>
        <TableCell>{balance}</TableCell>
        <TableCell>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </TableCell>
        <TableCell>{format(new Date(receipt.date_issued), "MMM dd, yyyy")}</TableCell>
        <TableCell className="flex space-x-2">
          <Button size="icon" variant="ghost" onClick={() => handleAction("print", receipt.id)}>
            <Printer className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" disabled>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" disabled>
            <Mail className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
