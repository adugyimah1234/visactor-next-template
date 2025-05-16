'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Users, School, CheckCircle } from 'lucide-react';
import AdmissionProcess from './admission-process/page';
import EnrolledStudents from './enrolled-students/page';

export default function AdmissionsPage() {
  const stats = [
    {
      title: 'Qualified Students',
      value: '156',
      icon: GraduationCap,
      description: 'Passed entrance exams'
    },
    {
      title: 'Available Schools',
      value: '12',
      icon: School,
      description: 'With open slots'
    },
    {
      title: 'Enrolled Students',
      value: '892',
      icon: Users,
      description: 'Current academic year'
    },
    {
      title: 'Completed Admissions',
      value: '78%',
      icon: CheckCircle,
      description: 'Processing rate'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admissions Management</h2>
          <p className="text-muted-foreground">Process and track student admissions</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="process" className="space-y-4">
        <TabsList>
          <TabsTrigger value="process">Admission Process</TabsTrigger>
          <TabsTrigger value="enrolled">Enrolled Students</TabsTrigger>
        </TabsList>

        <TabsContent value="process">
          <AdmissionProcess />
        </TabsContent>

        <TabsContent value="enrolled">
          <EnrolledStudents />
        </TabsContent>
      </Tabs>
    </div>
  );
}