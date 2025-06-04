import { type ClassData } from "@/services/class";

export interface School {
  phone: string | undefined;
  website: string;
  code: string | undefined;
  capacity: number | undefined;
  status: "active" | "inactive";
  id: number;
  name: string;
  address?: string;
  phone_number?: string;
  email?: string;
  maxCapacity?: number;
  currentCapacity?: number;
  classes?: ClassData[];
}