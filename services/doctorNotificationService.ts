import api from './api';
import { DoctorNotification } from '@/types';

export const doctorNotificationService = {
  getAll: async (receptionistId?: string, unreadOnly?: boolean): Promise<DoctorNotification[]> => {
    const params = new URLSearchParams();
    if (receptionistId) params.append('receptionistId', receptionistId);
    if (unreadOnly) params.append('unreadOnly', 'true');
    
    const response = await api.get<DoctorNotification[]>(`/notifications/doctor?${params.toString()}`);
    return response.data;
  },

  create: async (data: {
    appointmentId: string;
    type: string;
    message?: string;
  }): Promise<DoctorNotification> => {
    const response = await api.post<DoctorNotification>('/notifications/doctor', data);
    return response.data;
  },

  markAsRead: async (id: string): Promise<DoctorNotification> => {
    const response = await api.patch<DoctorNotification>(`/notifications/doctor/${id}`, {});
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/doctor/${id}`);
  },
};













