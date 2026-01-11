import api from './api';
import { Document } from '@/types';

export const documentService = {
  getAll: async (params?: {
    patientId?: string;
    appointmentId?: string;
    category?: string;
  }): Promise<Document[]> => {
    const response = await api.get<Document[]>('/documents', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Document> => {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  upload: async (formData: FormData): Promise<Document> => {
    const response = await api.post<Document>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};












