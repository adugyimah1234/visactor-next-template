'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';

// Icons
import { CalendarIcon, Receipt, CreditCard, DollarSign, AlertCircle } from 'lucide-react';

// Services
import { getOutstandingFees } from '@/services/fee';
import { createPayment, getPaymentMethods, type PaymentMethodType } from '@/services/payment-processing';
import { createReceipt } from '@/services/receipt';

// Student service
import { getStudents } from '@/services/students';

// Types
import { type FeeWithDetails } from '@/types/fee';

// Form validation schema
const paymentFormSchema = z.object({
  student_id: z.number({
    required_error: "Student is required",
  }),
  fee_id: z.number({
    required_error: "Fee selection is required",
  }),
  amount_paid: z.number({
    required_error: "Payment amount is required",
  }).positive("Amount must be greater than zero"),
  payment_date: z.string().optional(),
  payment_method: z.string({
    required_error: "Payment method is required",
  }),
  installment_number: z.number().optional(),
  reference_number: z.string().optional(),
  remarks: z.string().optional(),
  generate_receipt: z.boolean().default(true),
});

// Component props
interface PaymentFormProps {
  schoolId?: number;
  onPaymentSuccess?: (paymentId: number) => void;
}

export default function PaymentForm({ schoolId, onPaymentSuccess }: PaymentFormProps) {
  // Student state
  const [students, setStudents] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  
  // Fee state
  const [outstandingFees, setOutstandingFees] = useState<FeeWithDetails[]>([]);
  const [selectedFee, setSelectedFee] = useState<FeeWithDetails | null>(null);
  
  // Payment method state
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    id: number;
    name: string;
    type: PaymentMethodType;
    requires_reference: boolean;
  }>>([]);
  
  // Loading states
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Form setup
  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount_paid: 0,
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      installment_number: 1,
      payment_method: 'cash',
      generate_receipt: true,
    },
  });
  
  // Load students on component mount
  useEffect(() => {
    loadStudents();
    loadPaymentMethods();
  }, []);
  
  // Load outstanding fees when student is selected
  useEffect(() => {
    if (selectedStudent) {
      loadOutstandingFees(selectedStudent);
    } else {
      setOutstandingFees([]);
    }
  }, [selectedStudent]);
  
  // Update form values when fee is selected
  useEffect(() => {
    if (selectedFee) {
      form.setValue('fee_id', selectedFee.id);
      form.setValue('amount_paid', selectedFee.amount);
    } else {
      form.setValue('fee_id', 0);
      form.setValue('amount_paid', 0);
    }
  }, [selectedFee, form]);
  
  // Load students data
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await getStudents({ school_id: schoolId });
      const formattedStudents = response.map(student => ({
        id: student.id,
        name: `${student.first_name} ${student.middle_name || ''} ${student.last_name} (${student.admission_number || 'No Adm'})`,
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };
  
  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods.filter(m => m.is_active));
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
      // Set default payment methods
      setPaymentMethods([
        { id: 1, name: 'Cash', type: 'cash', requires_reference: false },
        { id: 2, name: 'Bank Transfer', type: 'bank_transfer', requires_reference: true },
        { id: 3, name: 'Mobile Payment', type: 'mobile_payment', requires_reference: true },
      ]);
    }
  };
  
  // Load outstanding fees for a student
  const loadOutstandingFees = async (studentId: number) => {
    setLoadingFees(true);
    try {
      const fees = await getOutstandingFees(studentId);
      setOutstandingFees(fees);
    } catch (error) {
      console.error('Error loading outstanding fees:', error);
      toast.error('Failed to load outstanding fees for the selected student');
      setOutstandingFees([]);
    } finally {
      setLoadingFees(false);
    }
  };
  
  // Handle student selection
  const handleStudentChange = (value: string) => {
    const studentId = parseInt(value, 10);
    setSelectedStudent(studentId);
    form.setValue('student_id', studentId);
    setSelectedFee(null);
  };
  
  // Handle fee selection
  const handleFeeSelection = (fee: FeeWithDetails) => {
    setSelectedFee(fee);
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    form.setValue('payment_method', value);
    // Check if reference number is required
    const method = paymentMethods.find(m => m.type === value);
    if (method?.requires_reference) {
      form.setError('reference_number', {
        type: 'manual',
        message: `Reference number is required for ${method.name} payments`,
      });
    } else {
      form.clearErrors('reference_number');
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof paymentFormSchema>) => {
    if (!selectedFee) {
      toast.error('Please select a fee to pay');
      return;
    }
    
    // Validate payment amount
    if (data.amount_paid <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }
    
    if (data.amount_paid > selectedFee.amount) {
      toast.error(`Payment amount cannot exceed the fee amount: ${selectedFee.amount}`);
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      // Create payment
      const payment = await createPayment({
        student_id: data.student_id,
        fee_id: data.fee_id,
        amount: data.amount_paid,
        payment_date: data.payment_date || format(new Date(), 'yyyy-MM-dd'),
        payment_method: data.payment_method as PaymentMethodType,
        reference_number: data.reference_number,
        notes: data.remarks,
        generate_receipt: data.generate_receipt,
        school_id: schoolId,
      });
      
      toast.success('Payment processed successfully!');
      
      // Generate receipt if needed
      if (data.generate_receipt) {
        toast.info('Receipt generated automatically');
      }
      
      // Reset form and selections
      form.reset();
      setSelectedStudent(null);
      setSelectedFee(null);
      
      // Call success callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess(payment.id);
      }
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(`Payment failed: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingPayment(false);
    }
  };
  
  // Determine if a payment method requires a reference
  const doesPaymentMethodRequireReference = () => {
    const methodType = form.watch('payment_method');
    const method = paymentMethods.find(m => m.type === methodType);
    return method?.requires_reference || false;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Process Fee Payment</CardTitle>
        <CardDescription>
          Record a new payment for a student's fee
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Student Selection */}
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Student</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(parseInt(value, 10));
                      handleStudentChange(value);
                    }}
                    value={field.value?.toString() || ''}
                    disabled={loadingStudents}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the student making the payment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Outstanding Fees Display */}
            {selectedStudent && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Outstanding Fees</h3>
                {loadingFees ? (
                  <p className="text-center py-4">Loading fees...</p>
                ) : outstandingFees.length === 0 ? (
                  <div className="bg-yellow-50 p-4 rounded-md flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    <p>No outstanding fees found for this student.</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Fee Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {outstandingFees.map((fee) => (
                          <TableRow 
                            key={fee.id}
                            className={`cursor-pointer ${selectedFee?.id === fee.id ? 'bg-primary/10' : ''}`}
                            onClick={() => handleFeeSelection(fee)}
                          >
                            <TableCell>
                              <Checkbox 
                                checked={selectedFee?.id === fee.id}
                                onCheckedChange={() => handleFeeSelection(fee)}
                              />
                            </TableCell>
                            <TableCell className="font-medium capitalize">{fee.fee_type}</TableCell>
                            <TableCell>{fee.description || '-'}</TableCell>
                            <TableCell className="text-right">{fee.amount.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
            
            {selectedFee && (
              <>
                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Payment Amount */}
                  <FormField
                    control={form.control}
                    name="amount_paid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Amount being paid (max: {selectedFee.amount})
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Payment Date */}
                  <FormField
                    control={form.control}
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value || format(new Date(), 'yyyy-MM-dd')}
                            />
                            <CalendarIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Installment Number */}
                  <FormField
                    control={form.control}
                    name="installment_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Installment Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          For tracking partial payments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Payment Method */}
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handlePaymentMethodChange(value);
                            }}
                            className="grid grid-cols-2 gap-2"
                          >
                            {paymentMethods.length > 0 ? (
                              paymentMethods.map(method => (
                                <div key={method.id} className="flex items-center space-x-2">
                                  <RadioGroupItem value={method.type} id={`method-${method.id}`} />
                                  <Label htmlFor={`method-${method.id}`}>{method.name}</Label>
                                </div>
                              ))
                            ) : (
                              <>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="cash" id="method-cash" />
                                  <Label htmlFor="method-cash">Cash</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="bank_transfer" id="method-bank" />
                                  <Label htmlFor="method-bank">Bank Transfer</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="mobile_payment" id="method-mobile" />
                                  <Label htmlFor="method-mobile">Mobile Payment</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="other" id="method-other" />
                                  <Label htmlFor="method-other">Other</Label>
                                </div>
                              </>
                            )}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Reference Number (shown conditionally) */}
                  {doesPaymentMethodRequireReference() && (
                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Transaction reference"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Transaction reference for this payment
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Remarks */}
                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Remarks (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes about this payment"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Generate Receipt */}
                  <FormField
                    control={form.control}
                    name="generate_receipt"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 col-span-full">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Generate Receipt</FormLabel>
                          <FormDescription>
                            Automatically generate a receipt for this payment
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={processingPayment || !selectedFee}
                className="flex items-center gap-2"
              >
                {processingPayment ? 
                  'Processing...' : 
                  <>
                    <DollarSign className="h-4 w-4" /> 
                    Process Payment
                  </>
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="bg-muted/50 flex justify-between">
        <div className="text-sm text-muted-foreground">
          <p>Payments are recorded immediately.</p>
          <p>Receipts can be printed after successful payment.</p>
        </div>
        
        {/* Payment Summary */}
        {selectedFee && (
          <div className="text-right">
            <p className="text-sm font-medium">Selected Fee: {selectedFee.fee_type}</p>
            <p className="text-sm text-muted-foreground">Total Amount: {selectedFee.amount.toLocaleString()}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

