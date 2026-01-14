import api from './api';
import { PrescriptionTemplate } from '@/types';

export const prescriptionTemplateService = {
  getAll: async (): Promise<PrescriptionTemplate[]> => {
    const response = await api.get<PrescriptionTemplate[]>('/prescription-templates');
    return response.data;
  },

  getById: async (id: string): Promise<PrescriptionTemplate> => {
    const response = await api.get<PrescriptionTemplate>(`/prescription-templates/${id}`);
    return response.data;
  },

  create: async (template: Partial<PrescriptionTemplate>): Promise<PrescriptionTemplate> => {
    const response = await api.post<PrescriptionTemplate>('/prescription-templates', template);
    return response.data;
  },

  update: async (id: string, template: Partial<PrescriptionTemplate>): Promise<PrescriptionTemplate> => {
    const response = await api.put<PrescriptionTemplate>(`/prescription-templates/${id}`, template);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/prescription-templates/${id}`);
  },
};













