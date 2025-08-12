/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, FilterX, FileDown, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { getAllFees, deleteFee } from '@/services/fee';
import { getAllCategories } from '@/services/categories';
import classService from '@/services/class';
import { getAllAcademicYear } from '@/services/academic_year';
// Import dialog components
import AddFeeDialog from './AddFeeDialog';
import EditFeeDialog from './EditFeeDialog';
export default function FeeList({ schoolId }) {
    // State for fees data
    const [fees, setFees] = useState([]);
    const [filteredFees, setFilteredFees] = useState([]);
    const [loading, setLoading] = useState(true);
    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    // Delete operation state
    const [deletingFeeId, setDeletingFeeId] = useState(null);
    // State for filter options
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeeType, setSelectedFeeType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    // Sorting
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    // Load initial data
    useEffect(() => {
        loadData();
    }, [schoolId]);
    // Apply filters when filter state changes
    useEffect(() => {
        applyFilters();
    }, [fees, searchTerm, selectedFeeType, selectedCategory, selectedClass, selectedAcademicYear]);
    const loadData = async () => {
        setLoading(true);
        try {
            // Load fees
            const params = {};
            if (schoolId) {
                params.school_id = schoolId;
            }
            const feesData = await getAllFees(params);
            setFees(feesData);
            // Load filter options
            const categoriesData = await getAllCategories();
            setCategories(categoriesData);
            const classesData = await classService.getAll();
            setClasses(classesData);
            const academicYearsData = await getAllAcademicYear();
            setAcademicYears(academicYearsData);
        }
        catch (error) {
            console.error('Error loading fee data:', error);
            toast.error('Failed to load fees data');
        }
        finally {
            setLoading(false);
        }
    };
    const applyFilters = () => {
        let result = [...fees];
        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(fee => {
                var _a, _b, _c;
                return fee.fee_type.toLowerCase().includes(term) ||
                    ((_a = fee.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(term)) ||
                    ((_b = fee.category_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(term)) ||
                    ((_c = fee.class_name) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(term));
            });
        }
        // Apply fee type filter
        if (selectedFeeType) {
            result = result.filter(fee => fee.fee_type === selectedFeeType);
        }
        // Apply category filter
        if (selectedCategory) {
            result = result.filter(fee => fee.category_id.toString() === selectedCategory);
        }
        // Apply class filter
        if (selectedClass) {
            result = result.filter(fee => { var _a; return ((_a = fee.class_id) === null || _a === void 0 ? void 0 : _a.toString()) === selectedClass; });
        }
        // Apply academic year filter
        if (selectedAcademicYear) {
            result = result.filter(fee => { var _a; return ((_a = fee.academic_year_id) === null || _a === void 0 ? void 0 : _a.toString()) === selectedAcademicYear; });
        }
        // Apply sorting
        result.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            if (aValue === undefined || bValue === undefined)
                return 0;
            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        setFilteredFees(result);
    };
    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            // New field, default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };
    const handleDeleteFee = async (id) => {
        if (!confirm('Are you sure you want to delete this fee?'))
            return;
        setDeletingFeeId(id);
        try {
            await deleteFee(id);
            toast.success('Fee deleted successfully');
            // Refresh data
            loadData();
        }
        catch (error) {
            console.error('Error deleting fee:', error);
            toast.error('Failed to delete fee. Please try again.');
        }
        finally {
            setDeletingFeeId(null);
        }
    };
    const handleEditFee = (fee) => {
        setSelectedFee(fee);
        setEditDialogOpen(true);
    };
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedFeeType('');
        setSelectedCategory('');
        setSelectedClass('');
        setSelectedAcademicYear('');
    };
    const exportToCSV = () => {
        // Generate CSV data
        const headers = ['ID', 'Fee Type', 'Category', 'Class', 'Amount', 'Description', 'Status'];
        const csvData = [
            headers.join(','),
            ...filteredFees.map(fee => [
                fee.id,
                fee.fee_type,
                fee.category_name || '-',
                fee.class_name || '-',
                fee.amount,
                fee.description || '-',
                fee.status
            ].join(','))
        ].join('\n');
        // Create download link
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fees_export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fee Management</CardTitle>
          <CardDescription>
            Manage and view all school fees
          </CardDescription>
        </div>
        <AddFeeDialog onSuccess={loadData}/>
      </CardHeader>
      
      <CardContent>
        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input placeholder="Search fees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm"/>
            
            <div className="flex flex-wrap gap-4">
              <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Fee Type"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Fee Types</SelectItem>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="admission">Admission</SelectItem>
                  <SelectItem value="tuition">Tuition</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (<SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>))}
                </SelectContent>
              </Select>
              
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Class"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {classes.map(cls => (<SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>))}
                </SelectContent>
              </Select>
              
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Academic Year"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Academic Years</SelectItem>
                  {academicYears.map(year => (<SelectItem key={year.id} value={year.id.toString()}>
                      {year.year}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={resetFilters} className="flex items-center gap-1">
              <FilterX className="h-4 w-4"/> Reset Filters
            </Button>
            
            <Button variant="outline" size="sm" onClick={exportToCSV} className="flex items-center gap-1">
              <FileDown className="h-4 w-4"/> Export CSV
            </Button>
          </div>
        </div>
        
        {/* Fees Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('fee_type')}>
                  Fee Type {sortField === 'fee_type' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                  Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (<TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Loading fees data...
                  </TableCell>
                </TableRow>) : filteredFees.length === 0 ? (<TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No fees found matching the criteria
                  </TableCell>
                </TableRow>) : (filteredFees.map((fee) => (<TableRow key={fee.id}>
                    <TableCell>{fee.id}</TableCell>
                    <TableCell className="capitalize">{fee.fee_type}</TableCell>
                    <TableCell>{fee.category_name || '-'}</TableCell>
                    <TableCell>{fee.class_name || '-'}</TableCell>
                    <TableCell>{fee.amount.toLocaleString()}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {fee.description || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${fee.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'}`}>
                        {fee.status || 'active'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4"/>
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleEditFee(fee);
            }} className="flex items-center gap-2 cursor-pointer">
                            <Pencil className="h-4 w-4"/> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleDeleteFee(fee.id);
            }} className="flex items-center gap-2 text-red-600 cursor-pointer" disabled={deletingFeeId === fee.id}>
                            {deletingFeeId === fee.id ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<Trash2 className="h-4 w-4"/>)}
                            {deletingFeeId === fee.id ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>)))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Edit Dialog */}
      {selectedFee && (<EditFeeDialog fee={selectedFee} open={editDialogOpen} onOpenChange={(open) => {
                setEditDialogOpen(open);
                if (!open)
                    setTimeout(() => setSelectedFee(null), 300); // Slight delay to avoid UI flicker
            }} onSuccess={() => {
                toast.success("Fee updated successfully");
                setEditDialogOpen(false);
                setSelectedFee(null);
                loadData();
            }}/>)}
    </Card>);
}
