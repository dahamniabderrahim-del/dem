import api from './api';
import { FamilyHistory } from '@/types';

export const familyHistoryService = {
  getByPatient: async (patientId: string): Promise<FamilyHistory[]> => {
    const response = await api.get<FamilyHistory[]>(`/patients/${patientId}/family-histories`);
    return response.data;
  },

  create: async (patientId: string, history: Partial<FamilyHistory>): Promise<FamilyHistory> => {
    const response = await api.post<FamilyHistory>(`/patients/${patientId}/family-histories`, history);
    return response.data;
  },

  update: async (patientId: string, historyId: string, history: Partial<FamilyHistory>): Promise<FamilyHistory> => {
    const response = await api.put<FamilyHistory>(`/patients/${patientId}/family-histories/${historyId}`, history);
    return response.data;
  },

  delete: async (patientId: string, historyId: string): Promise<void> => {
    await api.delete(`/patients/${patientId}/family-histories/${historyId}`);
  },
};












