'use client';

import { useState } from 'react';
import { 
  Users, 
  School, 
  Settings, 
  ShieldCheck, 
  MessageSquare,
  CreditCard,
  Calendar,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import UserManagement from './user-management/page';
import SystemSettings from './system-settings/page';
import ModuleAccess from './module-access/page';
import RolesPage from './roles/page';
import SchoolManagement from './schools/page';
import FeeManagement from './fees/page';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const adminStats = [
    { title: 'Total Users', value: '156', icon: Users },
    { title: 'Active Schools', value: '12', icon: School },
    { title: 'Fee Categories', value: '8', icon: CreditCard },
    { title: 'System Modules', value: '15', icon: Settings }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage system settings, users, and configurations
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="communications">Messages</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        <TabsContent value="schools">
          <SchoolManagement />
        </TabsContent>
        <TabsContent value="fees">
          <FeeManagement />
        </TabsContent>
        <TabsContent value="modules">
          <ModuleAccess />
        </TabsContent>
        <TabsContent value="roles">
          <RolesPage />
        </TabsContent>
        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}