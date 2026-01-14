import api from './api';
import { MedicalHistory } from '@/types';

export const medicalHistoryService = {
  getByPatient: async (patientId: string): Promise<MedicalHistory[]> => {
    const response = await api.get<MedicalHistory[]>(`/patients/${patientId}/medical-histories`);
    return response.data;
  },

  create: async (patientId: string, history: Partial<MedicalHistory>): Promise<MedicalHistory> => {
    const response = await api.post<MedicalHistory>(`/patients/${patientId}/medical-histories`, history);
    return response.data;
  },

  update: async (patientId: string, historyId: string, history: Partial<MedicalHistory>): Promise<MedicalHistory> => {
    const response = await api.put<MedicalHistory>(`/patients/${patientId}/medical-histories/${historyId}`, history);
    return response.data;
  },

  delete: async (patientId: string, historyId: string): Promise<void> => {
    await api.delete(`/patients/${patientId}/medical-histories/${historyId}`);
  },
};

// Note: Ce service est différent de medicalHistoryService qui récupère l'historique complet
// Ce service gère les antécédents médicaux personnels
