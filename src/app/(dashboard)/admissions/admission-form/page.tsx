// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable no-console */
// 'use client'

// import { useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import api from '@/lib/axios';
// import { type CreateStudentPayload } from '@/types/student';

// interface AdmissionFormModalProps {
//   student: CreateStudentPayload & { id: number }; // Assuming student has an id
//   onClose: () => void;
//   onAdmitted: () => void;
// }

// export default function AdmissionFormModal({ student, onClose, onAdmitted }: AdmissionFormModalProps) {
//   const [form, setForm] = useState({
//     ...student,
//     admission_status: 'admitted',
//     status: 'active',
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async () => {
//     setLoading(true);
//     try {
//       await api.put(`/students/${student.id}`, form);
//       onAdmitted();
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <Dialog open onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Fill Admission Form</DialogTitle>
//         </DialogHeader>

//         <div className="grid gap-4 py-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label>First Name</Label>
//               <Input name="first_name" value={form.first_name} onChange={handleChange} />
//             </div>
//             <div>
//               <Label>Last Name</Label>
//               <Input name="last_name" value={form.last_name} onChange={handleChange} />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label>Date of Birth</Label>
//               <Input name="dob" type="date" value={form.dob.toString()} onChange={handleChange} />
//             </div>
//             <div>
//               <Label>Gender</Label>
//               <select name="gender" value={form.gender} onChange={handleChange} className="border rounded px-2 py-1 w-full">
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//               </select>
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label>Class ID</Label>
//               <Input name="class_id" type="number" value={form.class_id} onChange={handleChange} />
//             </div>
//             <div>
//               <Label>Registration Date</Label>
//               <Input name="registration_date" type="date" value={form.registration_date} onChange={handleChange} />
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-between mt-4">
//           <Button variant="secondary" onClick={handlePrint}>Print</Button>
//           <Button onClick={handleSubmit} disabled={loading}>
//             {loading ? 'Saving...' : 'Submit'}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
