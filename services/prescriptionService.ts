import api from './api';
import { Prescription } from '@/types';

export const prescriptionService = {
  getAll: async (): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>('/prescriptions');
    return response.data;
  },

  getByPatient: async (patientId: string): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(`/prescriptions/patient/${patientId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Prescription> => {
    const response = await api.get<Prescription>(`/prescriptions/${id}`);
    return response.data;
  },

  create: async (prescription: {
    patientId: string;
    medicamentIds: string[];
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    medicalRecordId?: string;
  }): Promise<Prescription> => {
    const response = await api.post<Prescription>('/prescriptions', prescription);
    return response.data;
  },

  update: async (id: string, prescription: Partial<Prescription>): Promise<Prescription> => {
    const response = await api.put<Prescription>(`/prescriptions/${id}`, prescription);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/prescriptions/${id}`);
  },
};














