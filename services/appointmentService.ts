import api from './api';
import { Appointment } from '@/types';

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  },

  getByDate: async (date: Date): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments', {
      params: { date: date.toISOString() },
    });
    return response.data;
  },

  getByDoctor: async (doctorId: string): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/appointments/doctor/${doctorId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  create: async (appointment: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', appointment);
    return response.data;
  },

  update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, appointment);
    return response.data;
  },

  cancel: async (id: string): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}/cancel`);
    return response.data;
  },
};

















