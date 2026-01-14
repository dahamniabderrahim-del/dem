import api from './api';
import { Bloc } from '@/types';

export const blocService = {
  getAll: async (): Promise<Bloc[]> => {
    const response = await api.get<Bloc[]>('/blocs');
    return response.data;
  },

  getById: async (id: string): Promise<Bloc> => {
    const response = await api.get<Bloc>(`/blocs/${id}`);
    return response.data;
  },

  create: async (bloc: Partial<Bloc>): Promise<Bloc> => {
    const response = await api.post<Bloc>('/blocs', bloc);
    return response.data;
  },

  update: async (id: string, bloc: Partial<Bloc>): Promise<Bloc> => {
    const response = await api.put<Bloc>(`/blocs/${id}`, bloc);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/blocs/${id}`);
  },
};













