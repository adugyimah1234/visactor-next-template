import api from '@/lib/axios';

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  created_at?: Date;
  updated_at?: Date;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get('/roles');
  return response.data;
};

export const createRole = async (role: Omit<Role, 'id' | 'createdAt' | 'usersCount'>): Promise<Role> => {
  const response = await api.post('/roles', role);
  return response.data;
};

export const updateRole = async (id: string, role: Partial<Role>): Promise<Role> => {
  const response = await api.put(`/roles/${id}`, role);
  return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/roles/${id}`);
};

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await api.get('/permissions');
  return response.data;
};