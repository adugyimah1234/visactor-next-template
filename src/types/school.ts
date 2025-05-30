import { ClassData } from "@/services/class";

export interface School {
  id: number;
  name: string;
  address?: string;
  phone_number?: string;
  email?: string;
  maxCapacity?: number;
  currentCapacity?: number;
  classes?: ClassData[];
}