import api from './api';
import { Patient } from '@/types';

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get<Patient[]>('/patients');
    return response.data;
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  create: async (patient: Partial<Patient>): Promise<Patient> => {
    const response = await api.post<Patient>('/patients', patient);
    return response.data;
  },

  update: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
    const response = await api.put<Patient>(`/patients/${id}`, patient);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },

  updateDoctor: async (id: string, doctorId: string | null): Promise<Patient> => {
    const response = await api.patch<Patient>(`/patients/${id}`, { doctorId });
    return response.data;
  },
};


