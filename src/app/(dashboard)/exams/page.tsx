'use client';

import { 
  Clipboard,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExamsPage() {
  const stats = [
    { 
      title: 'Total Candidates',
      value: '2,856',
      change: '+12.5%',
      icon: Users,
      description: 'Registered for exams'
    },
    {
      title: 'Pass Rate',
      value: '78.3%',
      change: '+5.2%',
      icon: CheckCircle2,
      description: 'Average success rate'
    },
    {
      title: 'Upcoming Exams',
      value: '12',
      change: '3 this week',
      icon: Calendar,
      description: 'Scheduled examinations'
    },
    {
      title: 'Results Pending',
      value: '234',
      change: 'Processing',
      icon: Clock,
      description: 'Awaiting results'
    }
  ];

  const upcomingExams = [
    {
      id: 'EX001',
      title: 'Mathematics Advanced',
      date: '2024-05-20',
      time: '09:00 AM',
      candidates: 120,
      venue: 'Hall A'
    },
    // Add more exam data
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Examination Portal</h2>
          <p className="text-muted-foreground">Manage and monitor examination activities</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button>
            <Clipboard className="mr-2 h-4 w-4" />
            Schedule Exam
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <Badge variant="secondary" className="mt-2">
                {stat.change}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="results">Recent Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Input
                placeholder="Search exams..."
                className="w-[300px]"
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Exams Table/Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingExams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  <CardDescription>
                    {new Date(exam.date).toLocaleDateString()} at {exam.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Candidates:</span>
                      <span className="font-medium">{exam.candidates}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Venue:</span>
                      <span className="font-medium">{exam.venue}</span>
                    </div>
                    <Progress value={33} className="mt-2" />
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Add other TabsContent components for results and analytics */}
      </Tabs>
    </div>
  );
}