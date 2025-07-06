import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  BookOpen,
  GraduationCap,
  Shirt,
  Home,
  Calculator,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { getReceipts } from '@/services/receipt'
import { Category, getAllCategories } from '@/services/categories';
import { Student } from '@/types/student';
import studentService from '@/services/students';
// Import types and API function
import { HiUserGroup, HiCurrencyDollar, HiCheckCircle, HiChartBar } from "react-icons/hi";

type ReceiptType = "registration" | "levy" | "textBooks" | "exerciseBooks" | "furniture" | "jersey" | "crest";

interface ReceiptItem {
  id: number;
  receipt_type: ReceiptType;
  amount: number;
}

interface Receipt {
  id: number;
  student_id: number;
  payment_id?: number | null;
  receipt_items: ReceiptItem[]; 
  amount: number;
  issued_by?: number;
  date_issued: string;
  venue?: string;
  logo_url?: string;
  exam_date?: string;
  class_id?: number;
  registration_id: number;
  school_id?: number;
  student_name?: string;
  class_name?: string;
  issued_by_name?: string;
  school_name?: string;
  payment_date?: string;
  payment_type?: string;
  payment_method?: string;
  registration_first_name?: string;
  registration_last_name?: string;
  amount_paid?: number;
}

export default function DailyPaymentDashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [categories, setCategories] = useState<Category[]>([]);
const [students, setStudents] = useState<Student[]>([]);


useEffect(() => {
  setLoading(true);
  const allowedTypes = [
  "registration",
  "levy",
  "textBooks",
  "exerciseBooks",
  "furniture",
  "jersey",
  "crest"
] as const;

type ReceiptType = typeof allowedTypes[number];

const normalizeReceiptItems = (items: any[]): ReceiptItem[] =>
  items
    .filter(item => allowedTypes.includes(item.receipt_type))
    .map(item => ({
      ...item,
      receipt_type: item.receipt_type as ReceiptType
    }));

  const fetchData = async () => {
  try {
    const [receiptData, categoryData, studentData] = await Promise.all([
      getReceipts(),
      getAllCategories(),
      studentService.getAll()
    ]);
    setReceipts(
      receiptData.map((receipt: any) => ({
        ...receipt,
        receipt_items: normalizeReceiptItems(receipt.receipt_items)
      }))
    );
    setCategories(categoryData);
    setStudents(studentData);
  } catch (err) {
    console.error('Failed to fetch data:', err);
    setError('Failed to load payment or category data');
    setReceipts([]);
  } finally {
    setLoading(false);
  }
};

  fetchData();
}, []);



  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // You can optimize this by adding date filters to your API
        // For now, we'll fetch all and filter client-side
        const data = await getReceipts();
        setReceipts(data);
      } catch (error) {
        console.error('Failed to fetch receipts:', error);
        setError('Failed to load payment data');
        setReceipts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []); // Re-fetch when date or view mode changes if needed

  const categoryConfig = {
    registration: { name: 'Registration', color: '#3b82f6', icon: GraduationCap },
    levy: { name: 'School Levy', color: '#10b981', icon: Calculator },
    textBooks: { name: 'Text Books', color: '#f59e0b', icon: BookOpen },
    exerciseBooks: { name: 'Exercise Books', color: '#ef4444', icon: BookOpen },
    furniture: { name: 'Furniture', color: '#8b5cf6', icon: Home },
    jersey_crest: { name: 'Jersey & Crest', color: '#06b6d4', icon: Shirt }
  };

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS'
  }).format(amount);
};


  const getDateRange = () => {
    const selected = new Date(selectedDate);
    
    switch (viewMode) {
      case 'daily':
        return {
          start: new Date(selected.setHours(0, 0, 0, 0)),
          end: new Date(selected.setHours(23, 59, 59, 999))
        };
      case 'weekly':
        const weekStart = new Date(selected);
        weekStart.setDate(selected.getDate() - selected.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return { start: weekStart, end: weekEnd };
      case 'monthly':
        return {
          start: new Date(selected.getFullYear(), selected.getMonth(), 1),
          end: new Date(selected.getFullYear(), selected.getMonth() + 1, 0)
        };
      default:
        return { start: new Date(), end: new Date() };
    }
  };

  const getFilteredReceipts = () => {
    const { start, end } = getDateRange();
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date_issued);
      return receiptDate >= start && receiptDate <= end;
    });
  };

  const getPreviousPeriodData = () => {
    const { start } = getDateRange();
    const previousStart = new Date(start);
    const previousEnd = new Date(start);
    
    switch (viewMode) {
      case 'daily':
        previousStart.setDate(start.getDate() - 1);
        previousEnd.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        previousStart.setDate(start.getDate() - 7);
        previousEnd.setDate(start.getDate() - 1);
        break;
      case 'monthly':
        previousStart.setMonth(start.getMonth() - 1);
        previousEnd.setMonth(start.getMonth() - 1, 0);
        break;
    }
    
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date_issued);
      return receiptDate >= previousStart && receiptDate <= previousEnd;
    });
  };


  
const calculateSummary = () => {
  const currentReceipts = getFilteredReceipts();
  const previousReceipts = getPreviousPeriodData();

  // Total revenue calculations
  const currentTotal = currentReceipts.reduce(
    (sum, r) =>
      sum + r.receipt_items?.reduce((s, item) => s + Number(item.amount || 0), 0),
    0
  );

  const previousTotal = previousReceipts.reduce(
    (sum, r) =>
      sum + r.receipt_items?.reduce((s, item) => s + Number(item.amount || 0), 0),
    0
  );

  const change =
    previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
// Step 1: Build lookup maps
const studentCategoryMap: Record<number, number> = {};
students.forEach((s) => {
  studentCategoryMap[s.id] = s.category_id;
});

const categoryNameMap: Record<number, string> = {};
const categoryAmountMap: Record<number, number> = {};
categories.forEach((c) => {
  categoryNameMap[c.id] = c.name;
  categoryAmountMap[c.id] = typeof c.amount === 'string'
    ? parseFloat(c.amount)
    : Number(c.amount) || 0;
});

// Step 2: Count total students per category
const studentCountMap: Record<number, number> = {};
students.forEach((s) => {
  const cid = s.category_id;
  studentCountMap[cid] = (studentCountMap[cid] || 0) + 1;
});

// Step 3: Identify levy-paying students and actual levy payments per category
const levyPayingStudentSet: Record<number, Set<number>> = {}; // categoryId → Set of studentIds
const actualLevyAmountMap: Record<number, number> = {}; // categoryId → total levy paid

currentReceipts.forEach((receipt) => {
  const studentId = receipt.student_id;
  const categoryId = studentCategoryMap[studentId];

  // Guard: skip if category info is missing
  if (!categoryId || !categoryNameMap[categoryId]) return;

  // Check if this receipt has any levy items
  const hasLevy = receipt.receipt_items?.some(item => item.receipt_type === 'levy');

  if (hasLevy) {
    // Track unique student
    if (!levyPayingStudentSet[categoryId]) {
      levyPayingStudentSet[categoryId] = new Set();
    }
    levyPayingStudentSet[categoryId].add(studentId);

    // Sum all levy item amounts
    const levyTotal = receipt.receipt_items
      ?.filter(item => item.receipt_type === 'levy')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;

    actualLevyAmountMap[categoryId] = (actualLevyAmountMap[categoryId] || 0) + levyTotal;
  }
});


  const categoryTotals = Object.keys(categoryNameMap).map((cidStr) => {
  const cid = Number(cidStr);
  const name = categoryNameMap[cid];
  const levyAmount = categoryAmountMap[cid];
  const totalStudents = studentCountMap[cid] || 0;
  const expected = levyAmount * totalStudents;
  const actual = actualLevyAmountMap[cid] || 0;
  const studentsPaid = levyPayingStudentSet[cid]?.size || 0;

  return {
    name,
    count: totalStudents,
    studentsPaid,
    expected,
    actual,
  };
});


  // ✅ Original summary by receipt_item.receipt_type
  const categoryMap: Record<string, { amount: number; count: number }> = {};

  currentReceipts.forEach((r) => {
    r.receipt_items?.forEach((item) => {
      const key = item.receipt_type;
      if (!categoryMap[key]) {
        categoryMap[key] = { amount: 0, count: 0 };
      }
      categoryMap[key].amount += item.amount;
      categoryMap[key].count += 1;
    });
  });

  const categoriesSummary = Object.entries(categoryConfig)
    .map(([key, config]) => {
      const cat = categoryMap[key] || { amount: 0, count: 0 };
      const percentage = currentTotal > 0 ? (cat.amount / currentTotal) * 100 : 0;

      return {
        name: config.name,
        amount: cat.amount,
        count: cat.count,
        percentage,
        color: config.color,
        icon: config.icon,
      };
    })
    .filter((cat) => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  

  return {
    totalRevenue: currentTotal,
    totalTransactions: currentReceipts.length,
    categories: categoriesSummary,
    categoryTotals, // ✅ NEW: Grouped by category name from receipt.category_id
    change,
    previousTotal,
  };
};



    const summary = calculateSummary();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 dark::bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">⚠️ Error Loading Data</div>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="dark::bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold dark::text-gray-900 mb-4">Daily Payment Collections</h1>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border dark::border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
        {/* Total Revenue */}
        <div className="dark::bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold dark::text-gray-900">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
            </div>
            <div className={`flex items-center space-x-1 text-sm ${summary.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span>{Math.abs(summary.change).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Previous period: {formatCurrency(summary.previousTotal)}
          </p>
        </div>

        {/* Total Transactions */}
        <div className="dark::bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
              <p className="text-2xl font-bold dark::text-gray-900">
                {summary.totalTransactions.toString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {viewMode === 'daily' ? 'Today' : viewMode === 'weekly' ? 'This week' : 'This month'}
          </p>
        </div>

        {/* Average Payment */}
        <div className="dark::bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Average Payment</h3>
              <p className="text-2xl font-bold dark::text-gray-900">
                {formatCurrency(summary.totalRevenue / summary.totalTransactions || 0)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Per transaction
          </p>
        </div>
      </div>

      {/* Category Breakdown Section */}

<div className="mt-10 max-w-7xl mx-auto">
  <h2 className="text-xl font-semibold mb-4">📂 Category Breakdown</h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {summary.categories.map((cat) => (
      <Card
        key={cat.name}
        className="relative overflow-hidden border shadow-sm rounded-xl"
        style={{ borderLeft: `4px solid ${cat.color}` }}
      >
        <CardHeader className="pb-1">
          <div className="flex items-center space-x-2">
            <cat.icon className="w-5 h-5 text-muted" style={{ color: cat.color }} />
            <CardTitle className="text-sm font-medium">{cat.name}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="text-sm text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Amount</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(cat.amount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Transactions</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {cat.count}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Share of Total</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {cat.percentage.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>


<div className="mt-10 max-w-6xl mx-auto">
  <h2 className="text-xl font-semibold mb-4">📊 Category Expected vs Actual</h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {summary.categoryTotals.map((cat) => (
      <Card key={cat.name} className="shadow-sm border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HiChartBar className="text-yellow-500" />
            {cat.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <HiUserGroup /> Total
            </span>
            <span className="font-medium">{cat.count}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <HiCheckCircle className="text-green-500" /> Paid
            </span>
            <span className="font-medium">{cat.studentsPaid}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <HiCurrencyDollar /> Expected
            </span>
            <span className="font-medium">{formatCurrency(cat.expected)}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <HiCurrencyDollar className="text-blue-500" /> Actual
            </span>
            <span className="font-medium">{formatCurrency(cat.actual)}</span>
          </div>

          <div className="flex justify-between">
            <span>Collected</span>
            <span className="font-medium">
              {cat.expected > 0
                ? `${((cat.actual / cat.expected) * 100).toFixed(1)}%`
                : "—"}
            </span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>


    </div>
  );
}