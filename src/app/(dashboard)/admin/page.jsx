/* eslint-disable no-console */
'use client';
import { Users, School, Settings, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from './user-management/page';
import SystemSettings from './system-settings/page';
import RolesPage from './roles/page';
import SchoolManagement from './schools/page';
import FeeManagement from './fees/page';
import ExamManagement from './exam-management/page';
import { getAllUsers } from '@/services/users';
import { useState, useEffect } from 'react';
import schoolService from '@/services/schools';
export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSchools: 0,
        feeCategories: 0,
        systemModules: 0
    });
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [users, schools] = await Promise.all([
                    getAllUsers(),
                    schoolService.getAll()
                ]);
                setStats({
                    totalUsers: users.length,
                    activeSchools: schools.length,
                    feeCategories: 0, // Placeholder
                    systemModules: 0 // Placeholder
                });
            }
            catch (error) {
                console.error("Error fetching admin stats", error);
            }
        };
        fetchStats();
    }, []);
    const adminStats = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users },
        { title: 'Active Schools', value: stats.activeSchools, icon: School },
        { title: 'Fee Categories', value: stats.feeCategories, icon: CreditCard },
        { title: 'System Modules', value: stats.systemModules, icon: Settings }
    ];
    return (<div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage system settings, users, and configurations
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat, index) => (<Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>))}
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
        <TabsContent value="exams">
  <ExamManagement />
    </TabsContent>

        <TabsContent value="roles">
          <RolesPage />
        </TabsContent>
        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>);
}
