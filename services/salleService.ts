import api from './api';
import { Salle } from '@/types';

export const salleService = {
  getAll: async (): Promise<Salle[]> => {
    const response = await api.get<Salle[]>('/salles');
    return response.data;
  },

  getById: async (id: string): Promise<Salle> => {
    const response = await api.get<Salle>(`/salles/${id}`);
    return response.data;
  },

  getByBloc: async (blocId: string): Promise<Salle[]> => {
    const response = await api.get<Salle[]>(`/salles?blocId=${blocId}`);
    return response.data;
  },

  create: async (salle: Partial<Salle>): Promise<Salle> => {
    const response = await api.post<Salle>('/salles', salle);
    return response.data;
  },

  update: async (id: string, salle: Partial<Salle>): Promise<Salle> => {
    const response = await api.put<Salle>(`/salles/${id}`, salle);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/salles/${id}`);
  },
};












