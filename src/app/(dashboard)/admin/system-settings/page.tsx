'use client';

import { useState } from 'react';
import { 
  School, 
  Calendar, 
  Users, 
  Tag, 
  Settings,
  UserCog,
  KeyRound
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SchoolSettings from './components/school-settings';
import AcademicYearSettings from './components/academic-year-settings';
import ClassSettings from './components/class-settings';
import CategorySettings from './components/category-settings';
import ProfileSettings from './components/profile-settings';
import SecuritySettings from './components/security-settings';
import AdminSchoolsPage from '../classes/page';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('schools');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Manage your system configuration and preferences
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          <TabsTrigger value="schools" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            Schools
          </TabsTrigger>
          <TabsTrigger value="academic-years" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Academic Years
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        <TabsContent value="schools">
          <SchoolSettings />
        </TabsContent>

        <TabsContent value="academic-years">
          <AcademicYearSettings />
        </TabsContent>

        <TabsContent value="classes">
          <AdminSchoolsPage />
        </TabsContent>

        <TabsContent value="categories">
          <CategorySettings />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}