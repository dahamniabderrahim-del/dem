import api from './api';
import { User } from '@/types';

export const receptionistService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/receptionists');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/receptionists/${id}`);
    return response.data;
  },

  create: async (receptionist: Partial<User>): Promise<User> => {
    const response = await api.post<User>('/receptionists', receptionist);
    return response.data;
  },

  update: async (id: string, receptionist: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/receptionists/${id}`, receptionist);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/receptionists/${id}`);
  },
};













