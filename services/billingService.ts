import api from './api';
import { Invoice } from '@/types';

export const billingService = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await api.get('/invoices');
    return response.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  getByPatient: async (patientId: string): Promise<Invoice[]> => {
    const response = await api.get(`/invoices/patient/${patientId}`);
    return response.data;
  },

  create: async (data: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  markAsPaid: async (id: string): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}/pay`);
    return response.data;
  },
};










