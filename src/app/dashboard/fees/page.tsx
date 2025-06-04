/* eslint-disable no-console */
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// Fee Management Components
import FeeList from '@/components/fees/FeeList';
import PaymentForm from '@/components/fees/PaymentForm';
import PaymentHistory from '@/components/fees/PaymentHistory';

// Icons
import {
  CircleDollarSign,
  CreditCard,
  FileText,
  LayoutDashboard,
  RefreshCcw,
  School,
} from 'lucide-react';
import schoolService from '@/services/schools';

// Services

interface School {
  id: number;
  name: string;
}

export default function FeesPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // School selection state
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [loadingSchools, setLoadingSchools] = useState(false);
  
  // Refresh state - for triggering refreshes between components
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Get query parameters (for potential linking directly to tabs)
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const schoolParam = searchParams.get('school_id');
  
  // Initialize tab from URL params if available
  useEffect(() => {
    if (tabParam && ['overview', 'fees', 'payments', 'history'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    if (schoolParam) {
      setSelectedSchool(schoolParam);
    }
  }, [tabParam, schoolParam]);
  
  // Load schools for school selector
  useEffect(() => {
    loadSchools();
  }, []);
  
  const loadSchools = async () => {
    setLoadingSchools(true);
    try {
      const schoolsData = await schoolService.getAll();
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error loading schools:', error);
      toast.error('Failed to load schools');
    } finally {
      setLoadingSchools(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL without full page refresh
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url);
  };
  
  // Handle school change
  const handleSchoolChange = (value: string) => {
    setSelectedSchool(value);
    
    // Update URL without full page refresh
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('school_id', value);
    } else {
      url.searchParams.delete('school_id');
    }
    window.history.pushState({}, '', url);
    
    // Trigger a refresh of components
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Handle payment success
  const handlePaymentSuccess = (paymentId: number) => {
    toast.success(`Payment #${paymentId} processed successfully`);
    
    // Trigger refresh of payment history
    setRefreshTrigger(prev => prev + 1);
    
    // Switch to history tab
    handleTabChange('history');
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">
            Manage fees, process payments, and view payment history
          </p>
        </div>
        
        {/* School Selector */}
        <div className="flex items-center gap-2">
          <Select 
            value={selectedSchool} 
            onValueChange={handleSchoolChange}
            disabled={loadingSchools}
          >
            <SelectTrigger className="w-[240px]">
              <School className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Schools</SelectItem>
              {schools.map(school => (
                <SelectItem key={school.id} value={school.id.toString()}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4" /> Fee Structure
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Make Payment
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Payment History
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fee Management Card */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => handleTabChange('fees')}
            >
              <CardHeader className="pb-2">
                <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/10 mb-2">
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Fee Structure</CardTitle>
                <CardDescription>
                  Manage fee types and amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Create and update fees</li>
                  <li>Set fee amounts by category and class</li>
                  <li>Manage academic year fees</li>
                </ul>
                <div className="mt-4">
                  <Button variant="secondary" size="sm" className="w-full">
                    Manage Fees
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Process Payments Card */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => handleTabChange('payments')}
            >
              <CardHeader className="pb-2">
                <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/10 mb-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Process Payments</CardTitle>
                <CardDescription>
                  Record student fee payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Record full or partial payments</li>
                  <li>Multiple payment methods</li>
                  <li>Automatic receipt generation</li>
                </ul>
                <div className="mt-4">
                  <Button variant="secondary" size="sm" className="w-full">
                    Make Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment History Card */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => handleTabChange('history')}
            >
              <CardHeader className="pb-2">
                <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/10 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  View and manage payment records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>View all payment transactions</li>
                  <li>Generate and print receipts</li>
                  <li>Export payment history</li>
                </ul>
                <div className="mt-4">
                  <Button variant="secondary" size="sm" className="w-full">
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Payments on Overview */}
          <div className="pt-4">
            <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
            <PaymentHistory 
              key={`history-overview-${refreshTrigger}`}
              schoolId={selectedSchool ? parseInt(selectedSchool, 10) : undefined}
              showFilters={false}
              limit={5}
            />
          </div>
        </TabsContent>
        
        {/* Fee Structure Tab Content */}
        <TabsContent value="fees">
          <FeeList 
            key={`fees-${refreshTrigger}`}
            schoolId={selectedSchool ? parseInt(selectedSchool, 10) : undefined}
          />
        </TabsContent>
        
        {/* Process Payments Tab Content */}
        <TabsContent value="payments">
          <PaymentForm 
            key={`payment-form-${refreshTrigger}`}
            schoolId={selectedSchool ? parseInt(selectedSchool, 10) : undefined}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </TabsContent>
        
        {/* Payment History Tab Content */}
        <TabsContent value="history">
          <PaymentHistory 
            key={`history-full-${refreshTrigger}`}
            schoolId={selectedSchool ? parseInt(selectedSchool, 10) : undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

