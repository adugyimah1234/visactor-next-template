/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/consistent-type-imports */
'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { User, getAllUsers, updateUser, createUser } from '@/services/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Role, getAllRoles } from '@/services/roles';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';

const userFormSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters"),
  full_name: z.string()
    .min(2, "Full name must be at least 2 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  role_id: z.number(),
  school_id: z.number().optional().nullable()
});

type UserFormValues = z.infer<typeof userFormSchema>;
export type RoleId = number;
export type RoleFilter = RoleId | 'all';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const { toast } = useToast();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
      role_id: 1,
      school_id: null
    }
  });
  
  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch roles",
        variant: "destructive"
      });
    }
  };
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  

  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    Promise.all([fetchUsers(), fetchRoles()]).catch(error => {
      console.error('Error initializing data:', error);
    });
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        // Redirect to login
        window.location.href = '/login';
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, status: 'active' | 'inactive') => {
    try {
      await updateUser(userId, { status });
      await fetchUsers(); // Refresh the list
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsLoading(true);
      await createUser({
        username: values.username,
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        role_id: values.role_id,
        school_id: values.school_id
      });

      toast({
        title: "Success",
        description: `User ${values.full_name} has been created successfully`,
        variant: "default",
        duration: 3000,
      });

      setIsCreatingUser(false);
      form.reset();
      await fetchUsers(); // Refresh the user list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create user",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users
    .filter(user => 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(user => {
      if (roleFilter === 'all') return true;
      return user.role_id === roleFilter;
    });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <div className="relative w-[300px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <Input
                placeholder="Search users..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
                       <Select 
              value={String(roleFilter)} 
              onValueChange={(value) => {
                setRoleFilter(value === 'all' ? value : Number(value));
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isCreatingUser} onOpenChange={setIsCreatingUser}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="johndoe" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreatingUser(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create User</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {roles.find(role =>                       Number(role.id) === user.role_id)?.name || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleStatusChange(
                        user.id, 
                        user.status === 'active' ? 'inactive' : 'active'
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at!).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {isLoading ? 'Loading...' : 'No users found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}