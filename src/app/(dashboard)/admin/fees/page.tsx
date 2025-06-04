/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Pencil, Trash } from 'lucide-react';
import { type FeeWithDetails, type CreateFeePayload } from '@/types/fee';
import { toast } from 'sonner';
import { createFee, deleteFee, getAllFees } from '@/services/fee';
import AddFeeDialog from '@/components/AddFeeDialog';

export default function FeeManagement() {
  const [fees, setFees] = useState<FeeWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFees();
  }, []);

  async function fetchFees() {
    try {
      const data = await getAllFees();
      setFees(data);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteFee(id);
      toast.success("Fee deleted successfully");
      fetchFees();
    } catch (error) {
      toast.error("Failed to delete fee");
      console.error(error);
    }
  }

  async function handleCreate() {
    const payload: CreateFeePayload = {
      category_id: 1,
      class_id: 1,
      fee_type: 'tuition',
      amount: 100,
      academic_year_id: 1, // Assuming you have a way to get the current academic year ID
      description: 'Initial tuition fee'
    };
    try {
      await createFee(payload);
      toast.success("Fee created successfully");
      fetchFees();
    } catch (error) {
      toast.error("Failed to create fee");
      console.error(error);
    }
  }

  const filteredFees = fees.filter(fee =>
    fee.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
<CardHeader>
  <div className="flex justify-between items-center">
    <div>
      <CardTitle className="text-2xl">Fee Management</CardTitle>
      <p className="text-muted-foreground mt-1">
        Manage fee categories and payment settings
      </p>
    </div>
  </div>
</CardHeader>
      <CardContent>
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Fee Categories</TabsTrigger>
            <TabsTrigger value="settings">Payment Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  placeholder="Search categories..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map(fee => (
                    <TableRow key={fee.id}>
                      <TableCell>{fee.category_name}</TableCell>
                      <TableCell>{fee.amount}</TableCell>
                      <TableCell>{fee.description}</TableCell>
                      <TableCell>{fee.status}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" variant="outline" onClick={() => toast.info("Edit modal to be implemented")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(fee.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
