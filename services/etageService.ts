import api from './api';
import { Etage } from '@/types';

export const etageService = {
  getAll: async (): Promise<Etage[]> => {
    const response = await api.get<Etage[]>('/etages');
    return response.data;
  },

  getById: async (id: string): Promise<Etage> => {
    const response = await api.get<Etage>(`/etages/${id}`);
    return response.data;
  },

  create: async (data: Omit<Etage, 'id' | 'createdAt' | 'updatedAt'>): Promise<Etage> => {
    const response = await api.post<Etage>('/etages', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<Etage, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Etage> => {
    const response = await api.put<Etage>(`/etages/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/etages/${id}`);
  },
};












