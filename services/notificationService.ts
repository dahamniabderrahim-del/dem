import api from './api';

export interface PrescriptionNotification {
  id: string;
  patientName: string;
  patientId: string;
  expirationDate: Date | null;
  prescribedDate: Date;
  medicaments: string;
  status: 'expired' | 'expiring_soon';
  daysUntilExpiration?: number | null;
}

export interface PrescriptionNotificationsResponse {
  expired: PrescriptionNotification[];
  expiringSoon: PrescriptionNotification[];
  total: number;
}

export const notificationService = {
  getPrescriptionNotifications: async (): Promise<PrescriptionNotificationsResponse> => {
    const response = await api.get<PrescriptionNotificationsResponse>(
      '/notifications/prescriptions'
    );
    return response.data;
  },
};














