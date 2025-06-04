/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { type Exam, type CreateExamInput } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createExam, deleteExam, getExams } from '@/services/exam';

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [formData, setFormData] = useState<CreateExamInput>({
    name: '',
    date: '',
    venue: '',
    class_id: 1,
    category_id: 1,
  });

  const loadExams = async () => {
    try {
      const data = await getExams();
      setExams(data);
    } catch (err) {
      toast.error('Failed to load exams');
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleCreate = async () => {
    try {
      await createExam(formData);
      toast.success('Exam created');
      setFormData({ name: '', date: '', venue: '', class_id: 1, category_id: 1 });
      loadExams();
    } catch (err) {
      toast.error('Failed to create exam');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExam(id);
      toast.success('Exam deleted');
      loadExams();
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Exam</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Exam Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            placeholder="Venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          />
          {/* You can replace class/category fields with selects if needed */}
          <Button onClick={handleCreate}>Create Exam</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardHeader>
              <CardTitle>{exam.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Date: {exam.date}</p>
              <p>Venue: {exam.venue}</p>
              <Button variant="destructive" onClick={() => handleDelete(exam.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
