'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Search, Filter, Calendar, Play, Download } from 'lucide-react';

export default function RecordingsPage() {
  const recordings = [
    {
      id: 'REC001',
      examTitle: 'Mathematics Advanced',
      date: '2024-05-15',
      duration: '2h 30m',
      participants: 45,
      status: 'completed'
    },
    // Add more recordings as needed
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Exam Recordings</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search recordings..."
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recordings.map((recording) => (
          <Card key={recording.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="relative">
              <div className="absolute top-2 right-2">
                <Badge>
                  {recording.status}
                </Badge>
              </div>
              <CardTitle className="text-lg font-medium">
                {recording.examTitle}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {recording.date} • {recording.duration}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Participants:</span>
                  <span>{recording.participants}</span>
                </div>
                <div className="flex gap-2">
                  <Button className="w-full" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}