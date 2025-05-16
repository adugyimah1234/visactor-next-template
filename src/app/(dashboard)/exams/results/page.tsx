'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViewResultsPage() {
  const results = [
    {
      id: 'RES001',
      student: 'John Doe',
      examTitle: 'Mathematics Advanced',
      score: 85,
      grade: 'A',
      date: '2024-05-15'
    },
    // Add more results
  ];

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Examination Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Input
                placeholder="Search by student name or exam..."
                className="max-w-sm"
              />
              <Button variant="outline">
                Export Results
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.student}</TableCell>
                    <TableCell>{result.examTitle}</TableCell>
                    <TableCell>{result.score}%</TableCell>
                    <TableCell>
                      <Badge variant={
                        result.grade === 'A' ? 'default' :
                        result.grade === 'B' ? 'secondary' :
                        'destructive'
                      }>
                        {result.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>{result.date}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}