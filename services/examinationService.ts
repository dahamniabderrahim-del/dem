import api from './api';
import { Examination } from '@/types';

export const examinationService = {
  getAll: async (params?: {
    patientId?: string;
    appointmentId?: string;
    status?: string;
    type?: string;
  }): Promise<Examination[]> => {
    const response = await api.get<Examination[]>('/examinations', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Examination> => {
    const response = await api.get<Examination>(`/examinations/${id}`);
    return response.data;
  },

  create: async (examination: Partial<Examination>): Promise<Examination> => {
    const response = await api.post<Examination>('/examinations', examination);
    return response.data;
  },

  update: async (id: string, examination: Partial<Examination>): Promise<Examination> => {
    const response = await api.put<Examination>(`/examinations/${id}`, examination);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/examinations/${id}`);
  },

  markAsCompleted: async (id: string, results: string): Promise<Examination> => {
    const response = await api.put<Examination>(`/examinations/${id}`, {
      status: 'completed',
      results,
    });
    return response.data;
  },
};












