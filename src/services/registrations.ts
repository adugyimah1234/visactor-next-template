/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

const API_BASE_URL = "/registrations";

export interface RegistrationData {
  id?: number;
  school_id: number;
  student_id: number;
  class_id: number;
  academic_year_id: number;
  first_name: string;
  middle_name?: string;
  academic_year: string;
  last_name: string;
  category: string;
  date_of_birth: string | undefined;
  class_applying_for: string;
  gender: "Male" | "Female" | "Other";
  email?: string;
  phone_number: string;
  address: string;
  guardian_name: string;
  relationship: string;
  guardian_phone_number: string;
  registration_date?: string;
}

export type RegistrationCreateInput = Omit<
  RegistrationData,
  "registration_date" | "id"
>;

export type RegistrationUpdateInput = Partial<RegistrationCreateInput>;

const registrationService = {
  async getAll(): Promise<RegistrationData[]> {
    try {
      const response = await api.get<RegistrationData[]>(API_BASE_URL);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch registrations");
    }
  },

  async getById(id: number): Promise<RegistrationData> {
    try {
      const response = await api.get<RegistrationData>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch registration");
    }
  },

  async create(data: RegistrationCreateInput): Promise<number> {
    try {
      const response = await api.post<{ id: number }>(`${API_BASE_URL}/create`, data);
      return response.data.id;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create registration");
    }
  },

async update(id: number, data: RegistrationUpdateInput): Promise<RegistrationData> {
  try {
    const response = await api.put<RegistrationData>(`${API_BASE_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update registration");
  }
},

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`${API_BASE_URL}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete registration");
    }
  },
};

export default registrationService;
