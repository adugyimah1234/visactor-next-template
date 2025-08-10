'use client';
import React, { useEffect, useState } from 'react';
import { Users, BarChart2 } from 'lucide-react';
import { getAllCategories } from '@/services/categories';
import studentService from '@/services/students';
import { getReceipts } from '@/services/receipt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getCategoryStats } from '@/services/receiptItemService';
const MetricCard = ({ title, value, icon: Icon, color }) => {
    return (<Card className={cn('rounded-2xl shadow-md border-0', {
            'bg-green-100': color === 'green',
            'bg-yellow-100': color === 'yellow',
            'bg-blue-100': color === 'blue',
        })}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-gray-700"/>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">GHS {value.toLocaleString()}</div>
      </CardContent>
    </Card>);
};
const CategoryStatsCards = () => {
    const [stats, setStats] = useState([]);
    const [receiptStats, setReceiptStats] = useState([]);
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const [students, categories, receipts] = await Promise.all([
                    studentService.getAll(),
                    getAllCategories(),
                    getReceipts({ receipt_type: 'levy' })
                ]);
                const colorCycle = ['green', 'yellow', 'blue'];
                const computedStats = categories.map((category, index) => {
                    var _a;
                    const studentsInCategory = students.filter((s) => Number(s.category_id) === Number(category.id));
                    const studentIds = new Set(studentsInCategory.map((s) => Number(s.id)));
                    const receiptsForCategory = receipts.filter((r) => r.receipt_type === 'levy' && studentIds.has(Number(r.student_id)));
                    const uniqueStudentsPaid = new Set(receiptsForCategory.map((r) => Number(r.student_id))).size;
                    const totalPaid = receiptsForCategory.reduce((sum, r) => { var _a; return sum + Number((_a = r.amount) !== null && _a !== void 0 ? _a : 0); }, 0);
                    const color = colorCycle[index % colorCycle.length];
                    return {
                        code: (_a = category.code) !== null && _a !== void 0 ? _a : `Category ${category.id}`,
                        studentCount: uniqueStudentsPaid,
                        totalPaid,
                        color,
                    };
                });
                setStats(computedStats);
            }
            catch (err) {
                console.error('Failed to load category levy stats:', err);
            }
        };
        const fetchReceiptStats = async () => {
            try {
                const data = await getCategoryStats();
                setReceiptStats(data);
            }
            catch (error) {
                console.error('Failed to load receipt type stats:', error);
            }
        };
        fetchCategoryData();
        fetchReceiptStats();
    }, []);
    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 🧮 Category-based levy stats */}
      {stats.map((stat) => (<div key={stat.code} className="space-y-2">
          <MetricCard title={`${stat.code} Revenue`} value={stat.totalPaid} icon={Users} color={stat.color}/>
          <p className="text-sm text-gray-600 ml-4">
            {stat.studentCount} student{stat.studentCount !== 1 ? 's' : ''} paid
          </p>
        </div>))}

      {/* 🧾 Receipt-type breakdown */}
      {receiptStats.map((entry, index) => {
            const colorCycle = ['green', 'yellow', 'blue'];
            return (<div key={entry.receipt_type} className="space-y-2">
            <MetricCard title={`${entry.receipt_type} Total`} value={entry.total_amount} icon={BarChart2} color={colorCycle[index % colorCycle.length]}/>
            <p className="text-sm text-gray-600 ml-4">
              {entry.count} entr{entry.count !== 1 ? 'ies' : 'y'}
            </p>
          </div>);
        })}
    </div>);
};
export default CategoryStatsCards;
