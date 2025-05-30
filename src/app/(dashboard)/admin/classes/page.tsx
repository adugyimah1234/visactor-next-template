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
import { useToast } from "@/hooks/use-toast";

import schoolService from "@/services/schools";
import classService, { ClassData } from "@/services/class";
import { School } from "@/types/school";

interface ClassWithSlots extends ClassData {
  slots: number;
}

export default function AdminSchoolsPage() {
  const { toast } = useToast();

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
    field: "name" | "level" | "slots",
    value: string | number
  ) {
    setClasses((prev) =>
      prev.map((cls) =>
        cls.id === id
          ? {
              ...cls,
              [field]: field === "level" || field === "slots" ? Number(value) : value,
            }
          : cls
      )
    );
  }

  // Add new empty class
function addClass() {
  if (!selectedSchool) return;

  const newClass: Omit<ClassWithSlots, 'id' | 'created_at' | 'updated_at'> = {
    name: '',
    level: 1,
    school_id: selectedSchool.id,
    school_name: selectedSchool.name,
    slots: 0,
  };

  setClasses((prev) => [...prev, newClass as ClassWithSlots]); // type override if needed
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
      toast({
        title: "Class deleted",
        description: "Class deleted successfully",
        variant: "default",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
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
      toast({
        title: "School deleted",
        description: "School deleted successfully",
        variant: "default",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete school",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  // Save school and classes (create or update)
  async function onSave() {
    if (!selectedSchool) return;
    setSaving(true);
    setError(null);

    try {
      if (!selectedSchool.name) throw new Error("School name is required");

      // Save or update school
      let savedSchool = selectedSchool;
    if (!selectedSchool.id || selectedSchool.id === 0) {
      const { id } = await schoolService.create(selectedSchool);
      savedSchool = await schoolService.getById(id); // 🛠 Fetch full object
      setSelectedSchool(savedSchool);
      setSchools((prev) => [...prev, savedSchool]);
    } else {
      await schoolService.update(selectedSchool);
      savedSchool = selectedSchool;
      setSchools((prev) =>
        prev.map((s) => (s.id === savedSchool.id ? savedSchool : s))
      );
    }

      // Save or update classes
const classRequests = classes.map((cls) => {
  if (!cls.name) throw new Error("Class name is required");
  if (!cls.level) throw new Error("Class level is required");

  const payload: Omit<ClassData, "id" | "school_name"> = {
    name: cls.name,
    level: cls.level,
    school_id: savedSchool.id!,
    slots: cls.slots,
  };

  if (!cls.id) {
    // No ID means new class
    return classService.create(payload);
  } else {
    // ID exists, safe to update
    return classService.update({
      id: cls.id,
      ...payload,
    });
  }
});


      await Promise.all(classRequests);

      toast({
        title: "Success",
        description: "School and classes saved successfully!",
        variant: "default",
      });
    } catch (error: any) {
      setError(error.message || "Failed to save data.");
      toast({
        title: "Error",
        description: error.message || "Failed to save data. Please try again.",
        variant: "destructive",
      });
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
    });
    setClasses([]);
  }

  return (
    <div className="max-w-7xl mx-auto p-6 flex gap-6">
      {/* Left sidebar: Schools list */}
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
                    key={cls.id}
                    className="grid grid-cols-5 gap-4 items-center border-b border-border py-2"
                  >
                    <div>
                      <Label htmlFor={`class-name-${cls.id}`}>Class Name</Label>
                      <Input
                        id={`class-name-${cls.id}`}
                        value={cls.name}
                        onChange={(e) =>
                          onClassChange(cls.id, "name", e.target.value)
                        }
                        placeholder="Class Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`class-level-${cls.id}`}>Level</Label>
                      <Input
                        id={`class-level-${cls.id}`}
                        type="number"
                        min={1}
                        value={cls.level}
                        onChange={(e) =>
                          onClassChange(cls.id, "level", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`class-slots-${cls.id}`}>
                        Slots Available
                      </Label>
                      <Input
                        id={`class-slots-${cls.id}`}
                        type="number"
                        min={0}
                        value={cls.slots}
                        onChange={(e) =>
                          onClassChange(cls.id, "slots", e.target.value)
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
