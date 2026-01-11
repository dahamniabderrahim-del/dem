import api from './api';
import { Invoice } from '@/types';

export const invoiceService = {
  getAll: async (params?: {
    patientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> => {
    const response = await api.get<Invoice[]>('/invoices', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  create: async (invoice: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.post<Invoice>('/invoices', invoice);
    return response.data;
  },

  update: async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.put<Invoice>(`/invoices/${id}`, invoice);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  markAsPaid: async (id: string, paymentMethod: string): Promise<Invoice> => {
    const response = await api.put<Invoice>(`/invoices/${id}`, {
      status: 'paid',
      paymentMethod,
    });
    return response.data;
  },
};












