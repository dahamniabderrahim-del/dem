import api from './api';
import { User } from '@/types';

export interface AvailableDoctor extends User {
  available: boolean;
}

export const doctorService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/doctors');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/doctors/${id}`);
    return response.data;
  },

  getAvailable: async (date: string, time: string, duration: number = 30): Promise<AvailableDoctor[]> => {
    const response = await api.get<{ doctors: AvailableDoctor[] }>('/doctors/available', {
      params: {
        date,
        time,
        duration,
        onlyAvailable: 'false', // Retourner tous les médecins avec leur statut de disponibilité
      },
    });
    return response.data.doctors;
  },

  create: async (doctor: Partial<User>): Promise<User> => {
    const response = await api.post<User>('/doctors', doctor);
    return response.data;
  },

  update: async (id: string, doctor: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/doctors/${id}`, doctor);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/doctors/${id}`);
  },
};
