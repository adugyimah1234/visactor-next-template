'use client';
import { useState } from 'react';
import { School, Calendar, Users, Tag, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SchoolSettings from './components/school-settings';
import AcademicYearSettings from './components/academic-year-settings';
import SecuritySettings from './components/security-settings';
import AdminSchoolsPage from '../classes/page';
import ExamManagement from '../exam-management/page';
import RolesPage from '../roles/page';
export default function SystemSettings() {
    const [activeTab, setActiveTab] = useState('schools');
    return (<div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Manage your system configuration and preferences
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Users className="h-4 w-4"/>
            Classes
          </TabsTrigger>
          <TabsTrigger value="academic-years" className="flex items-center gap-2">
            <Calendar className="h-4 w-4"/>
            Academic Years
          </TabsTrigger>

          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4"/>
            Categories
          </TabsTrigger>

          <TabsTrigger value="exams" className="flex items-center gap-2">
            <School className="h-4 w-4"/>
          Exams
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4"/>
            Security
          </TabsTrigger>
   
          <TabsTrigger value="roles">
            <Users className="h-4 w-4"/>
          Roles
          </TabsTrigger>

        </TabsList>
        <TabsContent value="schools">
          <SchoolSettings />
        </TabsContent>

        <TabsContent value="academic-years">
          <AcademicYearSettings />
        </TabsContent>

        <TabsContent value="exams">
          <ExamManagement />
        </TabsContent>

        
                <TabsContent value="roles">
                  <RolesPage />
                </TabsContent>
                
        <TabsContent value="classes">
          <AdminSchoolsPage />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>);
}
