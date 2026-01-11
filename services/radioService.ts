import api from './api';
import { Radio } from '@/types';

export const radioService = {
  getAll: async (): Promise<Radio[]> => {
    const response = await api.get<Radio[]>('/radios');
    return response.data;
  },

  getById: async (id: string): Promise<Radio> => {
    const response = await api.get<Radio>(`/radios/${id}`);
    return response.data;
  },

  create: async (radio: Partial<Radio>): Promise<Radio> => {
    const response = await api.post<Radio>('/radios', radio);
    return response.data;
  },

  update: async (id: string, radio: Partial<Radio>): Promise<Radio> => {
    const response = await api.put<Radio>(`/radios/${id}`, radio);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/radios/${id}`);
  },

  search: async (query: string): Promise<Radio[]> => {
    const response = await api.get<Radio[]>('/radios', {
      params: { search: query },
    });
    return response.data;
  },
};












