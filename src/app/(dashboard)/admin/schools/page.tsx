'use client';

import { useState } from 'react';
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
import { School as SchoolType, SchoolClass, Category } from '@/types/school';

export default function SchoolManagement() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingSchool, setIsAddingSchool] = useState(false);

  const mockSchools = [
    {
      id: 1,
      name: 'Main Campus',
      code: 'MC001',
      capacity: 1000,
      address: '123 Education Street',
      status: 'active',
      createdAt: '2024-01-01'
    },
    // Add more mock schools
  ];

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
              <DialogHeader>
                <DialogTitle>Add New School</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Input
                    id="name"
                    placeholder="School name"
                    className="col-span-4"
                  />
                  <Input
                    id="code"
                    placeholder="School code"
                    className="col-span-2"
                  />
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Capacity"
                    className="col-span-2"
                  />
                  <Input
                    id="address"
                    placeholder="Address"
                    className="col-span-4"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingSchool(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save School</Button>
              </DialogFooter>
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
                    <TableHead>Code</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSchools.map((school) => (
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
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Similar structure for Classes and Categories tabs */}
        </Tabs>
      </CardContent>
    </Card>
  );
}