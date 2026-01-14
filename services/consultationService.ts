import api from './api';
import { Consultation } from '@/types';

export const consultationService = {
  getAll: async (): Promise<Consultation[]> => {
    const response = await api.get('/consultations');
    return response.data;
  },

  getById: async (id: string): Promise<Consultation> => {
    const response = await api.get(`/consultations/${id}`);
    return response.data;
  },

  getByPatient: async (patientId: string): Promise<Consultation[]> => {
    const response = await api.get(`/consultations/patient/${patientId}`);
    return response.data;
  },

  getByDoctor: async (doctorId: string): Promise<Consultation[]> => {
    const response = await api.get(`/consultations/doctor/${doctorId}`);
    return response.data;
  },

  create: async (data: Partial<Consultation>): Promise<Consultation> => {
    const response = await api.post('/consultations', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Consultation>): Promise<Consultation> => {
    const response = await api.put(`/consultations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/consultations/${id}`);
  },
};










