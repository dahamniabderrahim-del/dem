import api from './api';
import { Medicament } from '@/types';

export const medicamentService = {
  getAll: async (): Promise<Medicament[]> => {
    const response = await api.get<Medicament[]>('/medicaments');
    return response.data;
  },

  getById: async (id: string): Promise<Medicament> => {
    const response = await api.get<Medicament>(`/medicaments/${id}`);
    return response.data;
  },

  create: async (medicament: Partial<Medicament>): Promise<Medicament> => {
    const response = await api.post<Medicament>('/medicaments', medicament);
    return response.data;
  },

  update: async (id: string, medicament: Partial<Medicament>): Promise<Medicament> => {
    const response = await api.put<Medicament>(`/medicaments/${id}`, medicament);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/medicaments/${id}`);
  },

  search: async (query: string): Promise<Medicament[]> => {
    const response = await api.get<Medicament[]>('/medicaments', {
      params: { search: query },
    });
    return response.data;
  },
};













