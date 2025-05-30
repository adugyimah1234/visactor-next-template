/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-imports */
'use client';

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Edit, Trash2, ChevronRight, Calendar, School } from 'lucide-react';
import { 
  Class, 
  ClassWithExams, 
  ClassExam,
  CreateClassDTO, 
  UpdateClassDTO, 
  CreateExamDTO, 
  UpdateExamDTO 
} from '@/types/class';
import { 
  getClasses, 
  getClassById, 
  createClass, 
  updateClass,
  deleteClass,
  getClassExams,
  createExam,
  updateExam,
  deleteExam
} from '@/services/class';

// Sample schools data - in a real app, you would fetch this from the API
const schools = [
  { id: 1, name: "Main Campus" },
  { id: 2, name: "North Branch" },
  { id: 3, name: "South Branch" },
];

// Sample categories data - in a real app, you would fetch this from the API
const categories = [
  { id: 1, name: "SVC" },
  { id: 2, name: "MOD" },
  { id: 3, name: "CIV" },
];

const classFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  level: z.number().min(1, "Level must be greater than 0"),
  school_id: z.number().min(1, "School must be selected"),
});

const examFormSchema = z.object({
  name: z.string().min(2, "Exam name must be at least 2 characters"),
  category_id: z.number().min(1, "Category must be selected"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().min(2, "Venue must be at least 2 characters"),
});

type ClassFormValues = z.infer<typeof classFormSchema>;
type ExamFormValues = z.infer<typeof examFormSchema>;

export default function ClassManagement() {
  const { toast } = useToast();
  
  // State for classes and exams
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassWithExams | null>(null);
  const [classExams, setClassExams] = useState<ClassExam[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog states
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingExam, setEditingExam] = useState<ClassExam | null>(null);
  
  // Filter states
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("classes");

  // Class form
  const classForm = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      level: 1,
      school_id: schools[0]?.id || 0,
    }
  });

  // Exam form
  const examForm = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      name: "",
      category_id: categories[0]?.id || 0,
      date: new Date().toISOString().split('T')[0],
      venue: "",
    }
  });

  // Fetch classes on mount and when school filter changes
  useEffect(() => {
    fetchClasses();
  }, [selectedSchoolId]);

  // Fetch exams when a class is selected and category filter changes
  useEffect(() => {
    if (selectedClass) {
      fetchClassExams(selectedClass.id);
    }
  }, [selectedClass, selectedCategoryId]);

  // Fetch classes with optional school filter
  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const filters = selectedSchoolId ? { school_id: selectedSchoolId } : undefined;
      const fetchedClasses = await getClasses(filters);
      setClasses(fetchedClasses);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch class details by ID
  const fetchClassDetails = async (id: number) => {
    setIsLoading(true);
    try {
      const classDetails = await getClassById(id);
      setSelectedClass(classDetails);
      setActiveTab("exams");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exams for a selected class
  const fetchClassExams = async (classId: number) => {
    setIsLoading(true);
    try {
      const params = selectedCategoryId ? { category_id: selectedCategoryId } : undefined;
      const exams = await getClassExams(classId, params?.category_id);
      setClassExams(exams);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle school filter change
  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(Number(schoolId));
  };

  // Handle category filter change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(Number(categoryId));
  };

  // Handle class submission (create/update)
  const onSubmitClass = async (values: ClassFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingClass) {
        // Update existing class
        await updateClass(editingClass.id, values);
        toast({
          title: "Success",
          description: "Class updated successfully"
        });
      } else {
        // Create new class
        await createClass(values);
        toast({
          title: "Success",
          description: "Class created successfully"
        });
      }
      // Reset form and close dialog
      setIsAddingClass(false);
      setEditingClass(null);
      classForm.reset();
      // Refresh class list
      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle exam submission (create/update)
  const onSubmitExam = async (values: ExamFormValues) => {
    if (!selectedClass) return;
    
    setIsSubmitting(true);
    try {
      if (editingExam) {
        // Update existing exam
        await updateExam(selectedClass.id, editingExam.id, values);
        toast({
          title: "Success",
          description: "Exam updated successfully"
        });
      } else {
        // Create new exam
        await createExam(selectedClass.id, values);
        toast({
          title: "Success",
          description: "Exam scheduled successfully"
        });
      }
      // Reset form and close dialog
      setIsAddingExam(false);
      setEditingExam(null);
      examForm.reset();
      // Refresh exam list
      fetchClassExams(selectedClass.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deletion of an exam
  const handleDeleteExam = async (examId: number) => {
    if (!selectedClass) return;
    
    try {
      await deleteExam(selectedClass.id, examId);
      toast({
        title: "Success",
        description: "Exam deleted successfully"
      });
      // Refresh exam list
      fetchClassExams(selectedClass.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Reset forms when opening dialogs
  const openAddClassDialog = () => {
    classForm.reset({
      name: "",
      level: 1,
      school_id: schools[0]?.id || 0,
    });
    setEditingClass(null);
    setIsAddingClass(true);
  };

  const openEditClassDialog = (cls: Class) => {
    classForm.reset({
      name: cls.name,
      level: cls.level,
      school_id: cls.school_id,
    });
    setEditingClass(cls);
    setIsAddingClass(true);
  };

  const openAddExamDialog = () => {
    examForm.reset({
      name: "",
      category_id: categories[0]?.id || 0,
      date: new Date().toISOString().split('T')[0],
      venue: "",
    });
    setEditingExam(null);
    setIsAddingExam(true);
  };

  const openEditExamDialog = (exam: ClassExam) => {
    examForm.reset({
      name: exam.name,
      category_id: exam.category_id,
      date: exam.date,
      venue: exam.venue,
    });
    setEditingExam(exam);
    setIsAddingExam(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Class Management</CardTitle>
          <CardDescription>
            Manage classes and exam schedules for each school
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-4">
          {/* School Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">School:</span>
            <Select
              value={selectedSchoolId?.toString() || ""}
              onValueChange={handleSchoolChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Schools</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id.toString()}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Add Class Button */}
          <Dialog open={isAddingClass} onOpenChange={setIsAddingClass}>
            <DialogTrigger asChild>
              <Button onClick={openAddClassDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Form {...classForm}>
                <form onSubmit={classForm.handleSubmit(onSubmitClass)}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingClass ? 'Edit Class' : 'Add New Class'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* School Selection */}
                    <FormField
                      control={classForm.control}
                      name="school_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School</FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select school" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {schools.map((school) => (
                                <SelectItem key={school.id} value={school.id.toString()}>
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Class Name */}
                    <FormField
                      control={classForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Level */}
                    <FormField
                      control={classForm.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddingClass(false);
                      setEditingClass(null);
                      classForm.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : (editingClass ? 'Update' : 'Create')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            {selectedClass && (
              <TabsTrigger value="exams">{selectedClass.name} Exams</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="classes">
            {/* Classes Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No classes found</TableCell>
                  </TableRow>
                ) : (
                  classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>{cls.name}</TableCell>
                      <TableCell>{cls.level}</TableCell>
                      <TableCell>{cls.school_name || "-"}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditClassDialog(cls)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fetchClassDetails(cls.id)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Class</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {cls.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    await deleteClass(cls.id);
                                    toast({
                                      title: "Success",
                                      description: "Class deleted successfully"
                                    });
                                    fetchClasses();
                                  } catch (error: any) {
                                    toast({
                                      title: "Error",
                                      description: error.message,
                                      variant: "destructive"
                                    });
                                  }
                                }}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="exams">
            {selectedClass ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">
                      {selectedClass.name} Exams
                    </h3>
                    
                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Category:</span>
                      <Select
                        value={selectedCategoryId?.toString() || ""}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Add Exam Button */}
                  <Dialog open={isAddingExam} onOpenChange={setIsAddingExam}>
                    <DialogTrigger asChild>
                      <Button onClick={openAddExamDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <Form {...examForm}>
                        <form onSubmit={examForm.handleSubmit(onSubmitExam)}>
                          <DialogHeader>
                            <DialogTitle>
                              {editingExam ? 'Edit Exam' : 'Schedule New Exam'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            {/* Exam Name */}
                            <FormField
                              control={examForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Exam Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Category Selection */}
                            <FormField
                              control={examForm.control}
                              name="category_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select
                                    value={field.value.toString()}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Exam Date */}
                            <FormField
                              control={examForm.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Exam Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Date when the exam will be held
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Venue */}
                            <FormField
                              control={examForm.control}
                              name="venue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Venue</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., Main Hall, Room 101" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                              setIsAddingExam(false);
                              setEditingExam(null);
                              examForm.reset();
                            }}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? 'Saving...' : (editingExam ? 'Update' : 'Schedule')}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {/* Exams Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : classExams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No exams scheduled for this class
                        </TableCell>
                      </TableRow>
                    ) : (
                      classExams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell>{exam.name}</TableCell>
                          <TableCell>{exam.category_name || "-"}</TableCell>
                          <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                          <TableCell>{exam.venue}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditExamDialog(exam)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the exam "{exam.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteExam(exam.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select a class to manage its exams</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab("classes")}
                >
                  Back to Classes
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
