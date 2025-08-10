/* eslint-disable no-console */
'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, } from '@/components/ui/dialog'; // use your dialog component
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from '@/components/ui/select';
import { toast } from 'sonner';
import { createFee } from '@/services/fee';
import { getAllAcademicYear } from '@/services/academic_year';
import { getAllCategories } from '@/services/categories';
import classService from '@/services/class';
export default function AddFeeDialog({ onSuccess }) {
    var _a, _b;
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState(null);
    const [classId, setClassId] = useState(null);
    const [feeType, setFeeType] = useState('tuition');
    const [academicYears, setAcademicYears] = useState([]);
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [academicYearId, setAcademicYearId] = useState(null);
    useEffect(() => {
        if (open) {
            // Load all data when dialog opens
            loadAcademicYears();
            loadCategories();
            loadClasses();
        }
    }, [open]);
    async function loadAcademicYears() {
        try {
            const years = await getAllAcademicYear();
            setAcademicYears(years);
        }
        catch (_a) {
            toast.error('Failed to load academic years');
        }
    }
    async function loadCategories() {
        try {
            const cats = await getAllCategories();
            setCategories(cats);
        }
        catch (_a) {
            toast.error('Failed to load fee categories');
        }
    }
    async function loadClasses() {
        try {
            const cls = await classService.getAll();
            setClasses(cls);
        }
        catch (_a) {
            toast.error('Failed to load classes');
        }
    }
    async function handleSubmit() {
        if (!amount ||
            !categoryId ||
            !classId ||
            !academicYearId) {
            toast.error('Please fill all required fields');
            return;
        }
        try {
            await createFee({
                amount: Number(amount),
                category_id: categoryId,
                class_id: classId,
                fee_type: feeType,
                description,
                academic_year_id: academicYearId,
            });
            toast.success('Fee created successfully');
            setOpen(false);
            onSuccess();
            resetForm();
        }
        catch (error) {
            toast.error('Failed to create fee');
            console.error(error);
        }
    }
    function resetForm() {
        setAmount('');
        setDescription('');
        setCategoryId(null);
        setClassId(null);
        setFeeType('tuition');
        setAcademicYearId(null);
    }
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Add Fee
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogTitle>Add New Fee</DialogTitle>
        <DialogDescription>
          Please fill in the details below to create a new fee.
        </DialogDescription>

        <div className="mt-4 space-y-4">
          <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required/>

          <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}/>

          <Select onValueChange={(val) => setCategoryId(Number(val))} value={(_a = categoryId === null || categoryId === void 0 ? void 0 : categoryId.toString()) !== null && _a !== void 0 ? _a : ''} aria-label="Select Fee Category">
            <SelectTrigger>
              <SelectValue placeholder="Select Fee Category"/>
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (<SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>))}
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => setFeeType(val)} value={feeType} aria-label="Select Fee Type">
            <SelectTrigger>
              <SelectValue placeholder="Select Fee Type"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="admission">Admission</SelectItem>
              <SelectItem value="tuition">Tuition</SelectItem>
              <SelectItem value="exam">Exam</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => setAcademicYearId(Number(val))} value={(_b = academicYearId === null || academicYearId === void 0 ? void 0 : academicYearId.toString()) !== null && _b !== void 0 ? _b : ''} aria-label="Select Academic Year">
            <SelectTrigger>
              <SelectValue placeholder="Select Academic Year"/>
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (<SelectItem key={year.id} value={year.id.toString()}>
                  {year.year}
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Create Fee</Button>
        </div>
      </DialogContent>
    </Dialog>);
}
