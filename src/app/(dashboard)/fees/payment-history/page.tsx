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

export default function PaymentHistoryPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [activeSchool, setActiveSchool] = useState<string | null>(null);
  const [activeClassTab, setActiveClassTab] = useState<Record<string, string>>({});
  const [activeReceiptTab, setActiveReceiptTab] = useState<Record<string, string>>({});

  // === Load base data ===
  useEffect(() => {
    const loadAll = async () => {
      const [s, c, st] = await Promise.all([
        schoolService.getAll(),
        classService.getAll(),
        studentService.getAll()
      ]);
      setSchools(s);
      setClasses(c);
      setStudents(st);
    };
    loadAll();
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

  const renderStudentName = (r: Receipt) => {
    const s = students.find((s) => Number(s.id) === Number(r.student_id));
    return s ? [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ") : "Unknown";
  };

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

          const selectedStudents = schoolStudents.filter((s) =>
            selectedClassTab === "all" ? true : `${s.class_id}` === selectedClassTab
          );
          const studentIds = selectedStudents.map((s) => s.id);

          const filteredReceipts = receipts.filter((r) =>
            r.student_id ? studentIds.includes(r.student_id) : true
          );

          const allTypes = Array.from(
            new Set(
              filteredReceipts.flatMap((r) =>
                r.receipt_items?.map((i) => i.receipt_type) ?? [r.receipt_type]
              )
            )
          ).filter(Boolean) as string[];

          const selectedReceiptTab = activeReceiptTab[schoolId] || "all";
          const receiptTabData =
            selectedReceiptTab === "all"
              ? filteredReceipts
              : filteredReceipts.filter((r) =>
                  r.receipt_items?.some((i) => i.receipt_type === selectedReceiptTab) ||
                  r.receipt_type === selectedReceiptTab
                );

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
                                <TableHead>Receipt #</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Types</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Remaining</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {receiptTabData.map((r) => {
                                const paid = r.amount_paid ?? r.amount ?? 0;
                                const remaining = r.amount - paid;
                                const balance = remaining;

                                return (
                                  <TableRow key={r.id}>
                                    <TableCell>
                                      R-{r.id.toString().padStart(6, "0")}
                                    </TableCell>
                                    <TableCell>{renderStudentName(r)}</TableCell>
                                    <TableCell className="space-x-1">
                                      {(r.receipt_items ?? [{ receipt_type: r.receipt_type }]).map(
                                        (i, idx) => (
                                          <Badge
                                            key={`${i.receipt_type}-${idx}`}
                                            {...getReceiptTypeBadge(i.receipt_type)}
                                          >
                                            {getReceiptTypeBadge(i.receipt_type).label}
                                          </Badge>
                                        )
                                      )}
                                    </TableCell>
                                    <TableCell>{formatCurrency(paid)}</TableCell>
                                    <TableCell>{formatCurrency(remaining)}</TableCell>
                                    <TableCell>{formatCurrency(balance)}</TableCell>
                                    <TableCell>
                                      {format(new Date(r.date_issued), "MMM dd, yyyy")}
                                    </TableCell>
                                    <TableCell className="flex space-x-2">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleAction("print", r.id)}
                                      >
                                        <Printer className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleAction("download", r.id)}
                                      >
                                        <Download className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleAction("email", r.id)}
                                      >
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
