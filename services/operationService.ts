import api from './api';
import { Operation } from '@/types';

export const operationService = {
  getAll: async (): Promise<Operation[]> => {
    const response = await api.get<Operation[]>('/operations');
    return response.data;
  },

  getById: async (id: string): Promise<Operation> => {
    const response = await api.get<Operation>(`/operations/${id}`);
    return response.data;
  },

  create: async (operation: Partial<Operation>): Promise<Operation> => {
    const response = await api.post<Operation>('/operations', operation);
    return response.data;
  },

  update: async (id: string, operation: Partial<Operation>): Promise<Operation> => {
    const response = await api.put<Operation>(`/operations/${id}`, operation);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/operations/${id}`);
  },

  search: async (query: string): Promise<Operation[]> => {
    const response = await api.get<Operation[]>('/operations', {
      params: { search: query },
    });
    return response.data;
  },
};












