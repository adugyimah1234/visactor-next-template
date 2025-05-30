/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

const API_BASE_URL = "/registrations";

export interface RegistrationData {
  id?: number;
  school_id?: number;
  student_id?: number;
  class_id?: number;
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
  scores: number;
  status: "pending" | "approved" | "rejected";
  relationship: string;
  guardian_phone_number: string;
  registration_date?: string;
}

export interface RegistrationStats {
  totalRegistered: number;
  totalPending: number;
  totalAccepted: number;
  totalRejected: number;
  metrics: {
    date: string;
    count: number;
    status: 'pending' | 'approved' | 'rejected';
  }[];
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

  async getStats(startDate?: string, endDate?: string): Promise<RegistrationStats> {
    try {
      const registrations = await this.getAll();
      
      // Filter by date range if provided
      const filteredRegistrations = startDate && endDate 
        ? registrations.filter(reg => {
            const date = new Date(reg.registration_date || '');
            return date >= new Date(startDate) && date <= new Date(endDate);
          })
        : registrations;

      // Calculate totals
      const stats: RegistrationStats = {
        totalRegistered: filteredRegistrations.length,
        totalPending: filteredRegistrations.filter(r => r.status === 'pending').length,
 totalAccepted: filteredRegistrations.filter(r => r.status === 'approved').length,
        totalRejected: filteredRegistrations.filter(r => r.status === 'rejected').length,
        metrics: []
      };

      // Group by date and status for metrics
      const groupedByDate = filteredRegistrations.reduce((acc, reg) => {
        const date = reg.registration_date?.split('T')[0] || '';
        if (!acc[date]) {
          acc[date] = {
            pending: 0,
            approved: 0,
            rejected: 0
          };
        }
        acc[date][reg.status]++;
        return acc;
      }, {} as Record<string, Record<'pending' | 'approved' | 'rejected', number>>);

      // Convert to metrics array
      stats.metrics = Object.entries(groupedByDate).flatMap(([date, statuses]) => 
        Object.entries(statuses).map(([status, count]) => ({
          date,
          count,
          status: status as 'pending' | 'approved' | 'rejected'
        }))
      );

      return stats;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch registration statistics");
    }
  }
};

export default registrationService;
