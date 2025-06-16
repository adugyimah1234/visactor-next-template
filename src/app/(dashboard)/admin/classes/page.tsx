/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import schoolService from "@/services/schools";
import classService, { ClassData } from "@/services/class";
import { School } from "@/types/school";
import { Toaster, toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ClassWithSlots extends ClassData {
  slots: number;
  temp_id?: number; // 👈 add this
}

export default function AdminSchoolsPage() {


  // List of all schools
  const [schools, setSchools] = useState<School[]>([]);
  // Selected school to edit
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  // Classes under the selected school
  const [classes, setClasses] = useState<ClassWithSlots[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load all schools initially


  async function loadSchools() {
    setLoading(true);
    try {
      const allSchools = await schoolService.getAll();
      setSchools(allSchools);
      if (allSchools.length > 0) {
        selectSchool(allSchools[0]);
      }
    } catch {
      setError("Failed to load schools.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSchools();
  }, []);
  
  async function selectSchool(school: School) {
    setError(null);
    setSelectedSchool(school);
    setLoading(true);
    try {
      const schoolClasses = await classService.getBySchool(school.id);
      setClasses(
        schoolClasses.map((cls) => ({
          ...cls,
          slots: cls.slots ?? 0,
        }))
      );
    } catch {
      setError("Failed to load classes.");
      setClasses([]);
    }
    setLoading(false);
  }

  // Handle form change for school details
  function onSchoolChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (!selectedSchool) return;
    setSelectedSchool((prev) => (prev ? { ...prev, [name]: value } : prev));
  }

  // Handle class changes
function onClassChange(
  id: number,
  field: "name" |  "slots",
  value: string | number
) {
  setClasses((prev) =>
    prev.map((cls) =>
      (cls.id ?? cls.temp_id) === id
        ? {
            ...cls,
            [field]: field === "slots" ? Number(value) : value,
          }
        : cls
    )
  );
}


  // Add new empty class
function addClass() {
  if (!selectedSchool) return;

  const tempId = Date.now() + Math.floor(Math.random() * 10000); // Unique fallback ID

  const newClass: ClassWithSlots = {
    id: tempId, // 👈 temp_id only
    name: '',
    school_id: selectedSchool.id,
    school_name: selectedSchool.name,
    slots: 0,
    capacity: 0,
    students_count: 0,
  };

  setClasses((prev) => [...prev, newClass]);
}





  // Delete class from UI and backend if exists
  async function deleteClass(id: number) {
    if (!selectedSchool) return;
    setLoading(true);
    try {
      if (id < 1000000000) {
        // existing class
        await classService.delete(id);
      }
      setClasses((prev) => prev.filter((cls) => cls.id !== id));
      toast.success("Class deleted successfully");
    } catch {
      toast.error("Failed to delete class");
    }
    setLoading(false);
  }

  // Delete school and clear selection
  async function deleteSchool(id: number) {
    setLoading(true);
    try {
      await schoolService.delete(id);
      setSchools((prev) => prev.filter((s) => s.id !== id));
      setSelectedSchool(null);
      setClasses([]);
      toast.success("School deleted successfully");
    } catch {
      toast.error("Failed to delete school");
    }
    setLoading(false);
  }

  // Save school and classes (create or update)
  async function onSave() {
    if (!selectedSchool) return;
    setSaving(true);
    setError(null);

    try {
      
if (!selectedSchool.name.trim()) {
  toast.error("School name is required.");
  setSaving(false);
  return;
}

      // Save or update school
      let savedSchool = selectedSchool;
    if (!selectedSchool.id || selectedSchool.id === 0) {
      const { id } = await schoolService.create(selectedSchool);
      savedSchool = await schoolService.getById(id); // 🛠 Fetch full object
      setSelectedSchool(savedSchool);
      setSchools((prev) => [...prev, savedSchool]);
    } else {
      await schoolService.update(selectedSchool.id, {
        name: selectedSchool.name,
        address: selectedSchool.address,
        phone_number: selectedSchool.phone_number,
        email: selectedSchool.email,
      });
      savedSchool = selectedSchool;
      setSchools((prev) =>
        prev.map((s) => (s.id === savedSchool.id ? savedSchool : s))
      );
    }

      // Save or update classes
const classRequests = classes.map((cls) => {
  if (!cls.name) throw new Error("Class name is required");

  if (cls.slots === null || cls.slots === undefined || isNaN(cls.slots)) {
    throw new Error("Class slots are required");
  }

  const payload: Omit<ClassData, "id" | "school_name"> = {
    name: cls.name,
    school_id: savedSchool.id!,
    slots: cls.slots,
    capacity: cls.slots,
    students_count: cls.students_count,
  };

if (cls.id >= 1000000000) {
  // Temporary class – create new
  return classService.create(payload);
} else {
  // Existing class – update
  return classService.update({
    id: cls.id,
    ...payload,
  });
} 
});


      await Promise.all(classRequests);

      toast.success("School and classes saved successfully!");
    } catch (error: any) {
      setError(error.message || "Failed to save data.");
      toast.error(error.message || "Failed to save data. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Add new school (blank form)
 function addSchool() {
  setSelectedSchool({
    id: 0,
    name: "",
    address: "",
    phone_number: "",
    email: "",
    phone: "",
    website: "",
    code: "",
    capacity: 0,
    status: "active", // or whatever default fits
  });
  setClasses([]);
}

// Suggested options
const CLASS_OPTIONS = [
  "KG1",
  "KG2",
  ...Array.from({ length: 8 }, (_, i) => `Basic ${i + 1}`),
];

  return (
    <div className="max-w-7xl mx-auto p-6 flex gap-6">
      {/* Left sidebar: Schools list */}
      <Toaster position="top-right" richColors />
      <Card className="w-1/3 max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle>Schools</CardTitle>
          <CardDescription>Manage all schools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full mb-4" onClick={addSchool}>
            + Add New School
          </Button>

          {loading && !selectedSchool && <p>Loading schools...</p>}
          {schools.length === 0 && <p>No schools found.</p>}

          <ul>
            {schools.map((schoolItem) => (
              <li
                key={schoolItem.id}
                className={`cursor-pointer p-3 rounded-md ${
                  selectedSchool?.id === schoolItem.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-muted"
                } flex justify-between items-center`}
                onClick={() => selectSchool(schoolItem)}
              >
                <span>{schoolItem.name}</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `Are you sure you want to delete school "${schoolItem.name}"?`
                      )
                    ) {
                      deleteSchool(schoolItem.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Right side: Selected school and classes */}
      <div className="flex-1 space-y-6 overflow-auto max-h-[80vh]">
        {!selectedSchool ? (
          <Card>
            <CardContent>
              <p className="text-center text-muted-foreground">Select a school to edit or create a new one.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>School Details</CardTitle>
                <CardDescription>Edit school information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">School Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={selectedSchool.name}
                    onChange={onSchoolChange}
                    placeholder="Example High School"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={selectedSchool.address}
                    onChange={onSchoolChange}
                    placeholder="123 Main St, City"
                    rows={2}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={selectedSchool.phone_number}
                      onChange={onSchoolChange}
                      placeholder="+1234567890"
                      type="tel"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={selectedSchool.email}
                      onChange={onSchoolChange}
                      placeholder="email@example.com"
                      type="email"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classes & Slots</CardTitle>
                <CardDescription>
                  Add, edit or delete classes for this school
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {classes.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No classes added yet.
                  </p>
                )}

                {classes.map((cls) => (
  <div
    key={cls.id ?? cls.temp_id}
    className="grid grid-cols-5 gap-4 items-center border-b border-border py-2"
  >
    <div>
      <Label htmlFor={`class-name-${cls.id ?? cls.temp_id}`}>
        Class Name
      </Label>

      {/* ✅ Combobox: Popover with list AND typing */}
      <Popover>
        <PopoverTrigger asChild>
          <Input
            value={cls.name}
            placeholder="Type or select class"
            onChange={(e) =>
              onClassChange(cls.id ?? cls.temp_id!, "name", e.target.value)
            }
          />
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <div className="flex flex-col">
            {CLASS_OPTIONS.map((option) => (
              <button
                key={option}
                className={cn(
                  "text-left w-full px-4 py-2 hover:bg-muted"
                )}
                onClick={() =>
                  onClassChange(cls.id ?? cls.temp_id!, "name", option)
                }
              >
                {option}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>

    <div>
      <Label htmlFor={`class-slots-${cls.id ?? cls.temp_id}`}>
        Slots Available
      </Label>
      <Input
        id={`class-slots-${cls.id ?? cls.temp_id}`}
        type="number"
        min={0}
        value={cls.slots}
        onChange={(e) =>
          onClassChange(cls.id ?? cls.temp_id!, "slots", e.target.value)
        }
        required
      />
    </div>

    <div className="pt-6">
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          if (
            window.confirm(
              `Are you sure you want to delete class "${cls.name}"?`
            )
          ) {
            deleteClass(cls.id);
          }
        }}
      >
        Delete
      </Button>
    </div>
  </div>
))}

                <Button variant="outline" onClick={addClass}>
                  + Add Class
                </Button>
              </CardContent>
            </Card>

            {error && (
              <p className="text-red-600 font-semibold text-center">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                onClick={onSave}
                disabled={saving}
                className="w-40"
                type="button"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
