/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  School,
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { School as SchoolType } from '@/types/school';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { updateCategory, createCategory, deleteCategory, getAllCategories, Category } from '@/services/categories';
import classService from '@/services/class';
import schoolService from '@/services/schools';
import { Class } from '@/types/exam';

// Update the schema definition
// Define the Zod schema for form validation
const schoolFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  capacity: z.number().min(0, "Capacity must be a positive number"),
  address: z.string().min(1, "Address is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  status: z.enum(['active', 'inactive']) // Use enum for status
});

const classFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  level: z.number().min(1, "Level must be at least 1"),
  school_id: z.number().min(1, "School must be selected"),
  capacity: z.number().optional()
});

const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fees: z.number().min(0, "Fees cannot be negative"),
  status: z.enum(['active', 'inactive']) // Use enum for status
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;
type ClassFormValues = z.infer<typeof classFormSchema>;
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function SchoolManagement() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const { toast } = useToast();

  const [classes, setClasses] = useState<Class[]>([]); // Initialize as empty array
  const [categories, setCategories] = useState<Category[]>([]); // Initialize as empty array
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const data = await classService.getAll();
      setClasses(Array.isArray(data) ? data : []); // Ensure we're setting an array
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch classes",
        variant: "destructive"
      });
      setClasses([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchSchools(),
      fetchClasses(),
      fetchCategories()
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  // Update your form with all required fields from the schema
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      name: "",
      code: "",
      capacity: 0,
      address: "",
      phone_number: "",
      email: "",
      status: "active" as const
    }
  });
  
  // Update the onSubmit handler
  const onSubmit: SubmitHandler<SchoolFormValues> = async (values) => {
    try {
      setIsLoading(true);
      if (editingSchool) {
 await schoolService.update(editingSchool.id, data);
        toast({
          title: "Success",
          description: "School updated successfully"
        });
      } else {
        await schoolService.create(data);
        toast({
          title: "Success",
          description: "School created successfully"
        });
      }
      setIsAddingSchool(false);
      setEditingSchool(null);
      form.reset();
      await fetchSchools();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save school",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const classForm = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      level: 1,
      school_id: 0,
      capacity: undefined
    }
  });

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      fees: 0,
      status: "active"
    }
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const data = await schoolService.getAll();
      setSchools(data);
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


  const handleEdit = (school: SchoolType) => {
    setEditingSchool(school);
    form.reset({
      name: school.name,
      code: school.code,
      capacity: school.capacity,
      address: school.address,
      phone_number: school.phone_number,
      email: school.email,
      status: school.status as 'active' | 'inactive'
    });
    setIsAddingSchool(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await schoolService.delete(id);
      toast({
        title: "Success",
        description: "School deleted successfully"
      });
      fetchSchools();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // const handleClassSubmit: SubmitHandler<ClassFormValues> = async (values) => {
  //   try {
  //     if (editingClass) {
  //       await schoolService.update(editingClass.id);
  //       toast({
  //         title: "Success",
  //         description: "Class updated successfully"
  //       });
  //     } else {
  //       await schoolService.create(values);
  //       toast({
  //         title: "Success",
  //         description: "Class created successfully"
  //       });
  //     }
  //     setIsAddingClass(false);
  //     setEditingClass(null);
  //     classForm.reset();
  //     fetchClasses();
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message,
  //       variant: "destructive"
  //     });
  //   }
  // };

   const handleCategorySubmit: SubmitHandler<CategoryFormValues> = async (values) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
      } else {
        await createCategory(values);
        toast({
          title: "Success",
          description: "Category created successfully"
        });
      }
      setIsAddingCategory(false);
      setEditingCategory(null);
      categoryForm.reset();
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClassDelete = async (id: number) => {
    try {
      await classService.delete(id);
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
  };

  const handleCategoryDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClassEdit = (cls: Class) => {
    setEditingClass(cls);
    classForm.reset({
      name: cls.name,
      level: cls.level,
      school_id: cls.school_id,
      capacity: cls.capacity
    });
    setIsAddingClass(true);
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      code: category.code,
      description: category.description,
      fees: category.fees,
      status: category.status
    });
    setIsAddingCategory(true);
  };

  const handleReset = () => {
    form.reset({
      name: "",
      code: "",
      capacity: 0,
      address: "",
      phone_number: "",
      email: "",
      status: "active"
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">School Management</CardTitle>
            <p className="text-muted-foreground mt-1">
              Manage schools, classes, and categories
            </p>
          </div>
          <Dialog open={isAddingSchool} onOpenChange={setIsAddingSchool}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add School
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSchool ? 'Edit School' : 'Add New School'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddingSchool(false);
                      setEditingSchool(null);
                      form.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSchool ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schools" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schools" className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Schools
            </TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schools">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search schools..."
                    className="w-[300px]"
                  />
                  <Button variant="outline">Filter</Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : schools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No schools found
                      </TableCell>
                    </TableRow>
                  ) : (
                    schools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.code}</TableCell>
                        <TableCell>{school.capacity}</TableCell>
                        <TableCell>{school.address}</TableCell>
                        <TableCell>
                          <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                            {school.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(school)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete School</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {school.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(school.id)}
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
            </div>
          </TabsContent>
          
          <TabsContent value="classes">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search classes..."
                    className="w-[300px]"
                  />
                  <Button variant="outline">Filter</Button>
                </div>
                <Button onClick={() => setIsAddingClass(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              </div>
          
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : !classes?.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No classes found</TableCell>
                    </TableRow>
                  ) : (
                    classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>Level {cls.level}</TableCell>
                        <TableCell>{schools.find(s => s.id === cls.school_id)?.name}</TableCell>
                        <TableCell>{cls.capacity || 'N/A'}</TableCell>
                        <TableCell>{cls.students_count || 0} students</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleClassEdit(cls)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                              >
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
                                  onClick={() => handleClassDelete(cls.id)}
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
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search categories..."
                    className="w-[300px]"
                  />
                  <Button variant="outline">Filter</Button>
                </div>
                <Button onClick={() => setIsAddingCategory(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
          
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No categories found</TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>{schools.find(s => s.id === category.school_id)?.name}</TableCell>
                        <TableCell>
                          <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                            {category.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCategoryEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {category.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCategoryDelete(category.id)}
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}