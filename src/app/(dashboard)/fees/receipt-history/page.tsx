"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Search,
  Download,
  Printer,
  Mail,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { getReceipts, getPrintableReceipt } from "@/services/receipt";
import studentService from "@/services/students";
import { Receipt } from "@/types/receipt";
import { Student } from "@/types/student";

export default function PaymentHistoryPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [realStudents, setRealStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [tab, setTab] = useState<string>("all");

  const fetchPayments = useCallback(async () => {
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
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentService.getAll();
        setRealStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  const getReceiptTypeBadge = (type: string) => {
    const variants = {
      levy: { variant: "default" as const, label: "Levy" },
      registration: { variant: "secondary" as const, label: "Registration" },
      textBooks: { variant: "outline" as const, label: "Text Books" },
      exerciseBooks: { variant: "destructive" as const, label: "Exercise Books" },
      furniture: { variant: "default" as const, label: "Furniture" },
      jersey_crest: { variant: "outline" as const, label: "Jersey/Crest" }
    };
    return variants[type as keyof typeof variants] || { variant: "default" as const, label: type };
  };

  const formatCurrency = (amt: number) => new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS"
  }).format(amt);

  const renderStudentName = (r: Receipt) => {
    const s = realStudents.find(s => Number(s.id) === Number(r.student_id));
    if (s) return [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");
    return r.student_name || "Unknown Student";
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
      console.error("Action error:", err);
      toast.error("Action failed");
    }
  };

  // 🟢 Extract unique receipt types
  const allTypes = Array.from(new Set(
    receipts.flatMap(r => r.receipt_items?.map(i => i.receipt_type) ?? [r.receipt_type])
  )).filter(Boolean) as string[];

  const tabs = ["all", ...allTypes];

  // 🟢 Dynamic filter
  const tabData = tab === "all"
    ? receipts
    : receipts.filter(r =>
        r.receipt_items?.some(i => i.receipt_type === tab) || r.receipt_type === tab
      );

  // 🟢 Render Table
  const renderTable = (data: Receipt[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Receipt #</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Types</TableHead>
          <TableHead>Total Paid</TableHead>
          <TableHead>Remaining</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((r) => {
          const paid = r.amount_paid ?? r.amount ?? 0;
          const remaining = r.amount - paid;
          const balance = remaining; // same here, adjust if needed

          return (
            <TableRow key={r.id}>
              <TableCell>R-{r.id.toString().padStart(6, "0")}</TableCell>
              <TableCell>{renderStudentName(r)}</TableCell>
              <TableCell className="space-x-1">
                {r.receipt_items?.length ? (
                  r.receipt_items.map((i, idx) => (
                    <Badge key={`${i.receipt_type}-${idx}`} {...getReceiptTypeBadge(i.receipt_type)}>
                      {getReceiptTypeBadge(i.receipt_type).label}
                    </Badge>
                  ))
                ) : (
                  <Badge {...getReceiptTypeBadge(r.receipt_type as string)}>
                    {getReceiptTypeBadge(r.receipt_type as string).label}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatCurrency(paid)}</TableCell>
              <TableCell>{formatCurrency(remaining)}</TableCell>
              <TableCell>{formatCurrency(balance)}</TableCell>
              <TableCell>{format(new Date(r.date_issued), "MMM dd, yyyy")}</TableCell>
              <TableCell className="flex space-x-2">
                <Button size="icon" variant="ghost" onClick={() => handleAction("print", r.id)}>
                  <Printer className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleAction("download", r.id)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleAction("email", r.id)}>
                  <Mail className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
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
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => toast.info("CSV export coming soon!")}
        >
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} defaultValue="all">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t === "all" ? "All" : getReceiptTypeBadge(t).label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t} value={t}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t === "all" ? "All Receipts" : getReceiptTypeBadge(t).label} ({tabData.length})
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTable(tabData)}</CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
