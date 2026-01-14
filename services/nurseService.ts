import api from './api';
import { User } from '@/types';

export const nurseService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/nurses');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/nurses/${id}`);
    return response.data;
  },

  create: async (nurse: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<Omit<User, 'password'>> => {
    const response = await api.post<Omit<User, 'password'>>('/nurses', nurse);
    return response.data;
  },

  update: async (id: string, nurse: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<Omit<User, 'password'>> => {
    const response = await api.put<Omit<User, 'password'>>(`/nurses/${id}`, nurse);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/nurses/${id}`);
  },
};


























