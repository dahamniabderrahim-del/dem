import api from './api';
import { ConsultationTemplate } from '@/types';

export const consultationTemplateService = {
  getAll: async (category?: string, onlyPublic: boolean = true): Promise<ConsultationTemplate[]> => {
    const params: any = { onlyPublic: onlyPublic.toString() };
    if (category) {
      params.category = category;
    }
    const response = await api.get<ConsultationTemplate[]>('/consultation-templates', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ConsultationTemplate> => {
    const response = await api.get<ConsultationTemplate>(`/consultation-templates/${id}`);
    return response.data;
  },

  create: async (template: Partial<ConsultationTemplate>): Promise<ConsultationTemplate> => {
    const response = await api.post<ConsultationTemplate>('/consultation-templates', template);
    return response.data;
  },

  update: async (id: string, template: Partial<ConsultationTemplate>): Promise<ConsultationTemplate> => {
    const response = await api.put<ConsultationTemplate>(`/consultation-templates/${id}`, template);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/consultation-templates/${id}`);
  },
};












