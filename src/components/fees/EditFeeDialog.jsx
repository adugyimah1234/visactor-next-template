/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
'use client';
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
// Services
import { updateFee } from '@/services/fee';
import { getAllCategories } from '@/services/categories';
import classService from '@/services/class';
import { getAllAcademicYear } from '@/services/academic_year';
// Form schema with validation
const feeFormSchema = z.object({
    amount: z
        .number({ required_error: "Amount is required" })
        .positive("Amount must be greater than zero"),
    category_id: z
        .number({ required_error: "Category is required" }),
    class_id: z
        .number({ required_error: "Class is required" }),
    fee_type: z
        .enum(["registration", "admission", "tuition", "exam"], {
        required_error: "Fee type is required",
    }),
    description: z
        .string()
        .optional(),
    academic_year_id: z
        .number({ required_error: "Academic year is required" }),
});
export default function EditFeeDialog({ fee, open, onOpenChange, onSuccess }) {
    var _a, _b, _c;
    // Loading states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    // Data for select inputs
    const [academicYears, setAcademicYears] = useState([]);
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    // Default values based on the fee being edited
    const defaultValues = {
        amount: fee.amount,
        category_id: fee.category_id,
        class_id: (_a = fee.class_id) !== null && _a !== void 0 ? _a : undefined,
        fee_type: fee.fee_type,
        description: (_b = fee.description) !== null && _b !== void 0 ? _b : '',
        academic_year_id: (_c = fee.academic_year_id) !== null && _c !== void 0 ? _c : undefined,
    };
    // Form setup
    const form = useForm({
        resolver: zodResolver(feeFormSchema),
        defaultValues,
    });
    // Load reference data when dialog opens
    useEffect(() => {
        if (open) {
            loadReferenceData();
        }
    }, [open]);
    // Reset form when fee changes
    useEffect(() => {
        var _a, _b, _c;
        if (fee) {
            form.reset({
                amount: fee.amount,
                category_id: fee.category_id,
                class_id: (_a = fee.class_id) !== null && _a !== void 0 ? _a : undefined,
                fee_type: fee.fee_type,
                description: (_b = fee.description) !== null && _b !== void 0 ? _b : '',
                academic_year_id: (_c = fee.academic_year_id) !== null && _c !== void 0 ? _c : undefined,
            });
        }
    }, [fee, form]);
    // Load all reference data needed for the form
    const loadReferenceData = async () => {
        setIsLoadingData(true);
        try {
            // Load in parallel for better performance
            const [yearsData, categoriesData, classesData] = await Promise.all([
                getAllAcademicYear(),
                getAllCategories(),
                classService.getAll()
            ]);
            setAcademicYears(yearsData);
            setCategories(categoriesData);
            setClasses(classesData);
            // Set values if not already set
            if (!form.getValues('academic_year_id') && yearsData.length > 0) {
                form.setValue('academic_year_id', fee.academic_year_id || yearsData[0].id);
            }
            if (!form.getValues('class_id') && classesData.length > 0) {
                form.setValue('class_id', fee.class_id || classesData[0].id);
            }
        }
        catch (error) {
            console.error('Error loading reference data:', error);
            toast.error('Failed to load necessary data. Please try again.');
        }
        finally {
            setIsLoadingData(false);
        }
    };
    // Add validation function
    const validateForm = (data) => {
        if (!data.class_id) {
            toast.error('Class selection is required');
            return false;
        }
        if (!data.academic_year_id) {
            toast.error('Academic year is required');
            return false;
        }
        return true;
    };
    // Handle form submission
    const onSubmit = async (data) => {
        if (!validateForm(data))
            return;
        setIsSubmitting(true);
        try {
            const payload = {
                amount: data.amount,
                category_id: data.category_id,
                class_id: data.class_id,
                fee_type: data.fee_type,
                academic_year_id: data.academic_year_id,
                description: data.description
            };
            await updateFee(fee.id, payload);
            // Success notification handled by parent component
            onOpenChange(false);
            onSuccess();
        }
        catch (error) {
            console.error('Error updating fee:', error);
            if (error instanceof Error) {
                toast.error(error.message);
            }
            else {
                toast.error('Failed to update fee. Please try again.');
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle>Edit Fee</DialogTitle>
        <DialogDescription>
          Update the fee details below. All fields marked with * are required.
        </DialogDescription>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Amount Field */}
            <FormField control={form.control} name="amount" render={({ field }) => (<FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} disabled={isSubmitting || isLoadingData}/>
                  </FormControl>
                  <FormDescription>
                    The fee amount in your local currency
                  </FormDescription>
                  <FormMessage />
                </FormItem>)}/>

            {/* Fee Type Field */}
            <FormField control={form.control} name="fee_type" render={({ field }) => (<FormItem>
                  <FormLabel>Fee Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || isLoadingData}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="admission">Admission</SelectItem>
                      <SelectItem value="tuition">Tuition</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Type of fee being charged
                  </FormDescription>
                  <FormMessage />
                </FormItem>)}/>

            {/* Category Field */}
            <FormField control={form.control} name="category_id" render={({ field }) => {
            var _a;
            return (<FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={(_a = field.value) === null || _a === void 0 ? void 0 : _a.toString()} disabled={isSubmitting || isLoadingData || categories.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingData ? (<div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                          Loading...
                        </div>) : categories.length === 0 ? (<div className="p-2 text-center text-sm">No categories found</div>) : (categories.map((category) => (<SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>)))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>);
        }}/>

            {/* Class Field */}
            <FormField control={form.control} name="class_id" render={({ field }) => {
            var _a;
            return (<FormItem>
                  <FormLabel>Class *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={(_a = field.value) === null || _a === void 0 ? void 0 : _a.toString()} disabled={isSubmitting || isLoadingData || classes.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingData ? (<div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                          Loading...
                        </div>) : classes.length === 0 ? (<div className="p-2 text-center text-sm">No classes found</div>) : (classes.map((cls) => (<SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>)))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>);
        }}/>

            {/* Academic Year Field */}
            <FormField control={form.control} name="academic_year_id" render={({ field }) => {
            var _a;
            return (<FormItem>
                  <FormLabel>Academic Year *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={(_a = field.value) === null || _a === void 0 ? void 0 : _a.toString()} disabled={isSubmitting || isLoadingData || academicYears.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingData ? (<div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                          Loading...
                        </div>) : academicYears.length === 0 ? (<div className="p-2 text-center text-sm">No academic years found</div>) : (academicYears.map((year) => (<SelectItem key={year.id} value={year.id.toString()}>
                            {year.year}
                          </SelectItem>)))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>);
        }}/>

            {/* Description Field */}
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add additional details about this fee" className="resize-none" {...field} disabled={isSubmitting || isLoadingData}/>
                  </FormControl>
                  <FormDescription>
                    Optional description or notes about the fee
                  </FormDescription>
                  <FormMessage />
                </FormItem>)}/>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingData} className="flex items-center gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin"/>}
                {isSubmitting ? 'Updating...' : 'Update Fee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
