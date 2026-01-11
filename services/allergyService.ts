import api from './api';
import { Allergy } from '@/types';

export const allergyService = {
  getByPatient: async (patientId: string): Promise<Allergy[]> => {
    const response = await api.get<Allergy[]>(`/patients/${patientId}/allergies`);
    return response.data;
  },

  create: async (patientId: string, allergy: Partial<Allergy>): Promise<Allergy> => {
    const response = await api.post<Allergy>(`/patients/${patientId}/allergies`, allergy);
    return response.data;
  },

  update: async (patientId: string, allergyId: string, allergy: Partial<Allergy>): Promise<Allergy> => {
    const response = await api.put<Allergy>(`/patients/${patientId}/allergies/${allergyId}`, allergy);
    return response.data;
  },

  delete: async (patientId: string, allergyId: string): Promise<void> => {
    await api.delete(`/patients/${patientId}/allergies/${allergyId}`);
  },
};












