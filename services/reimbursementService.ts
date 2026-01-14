import api from './api';
import { Reimbursement } from '@/types';

export const reimbursementService = {
  getAll: async (params?: {
    invoiceId?: string;
    status?: string;
  }): Promise<Reimbursement[]> => {
    const response = await api.get<Reimbursement[]>('/reimbursements', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Reimbursement> => {
    const response = await api.get<Reimbursement>(`/reimbursements/${id}`);
    return response.data;
  },

  create: async (reimbursement: Partial<Reimbursement>): Promise<Reimbursement> => {
    const response = await api.post<Reimbursement>('/reimbursements', reimbursement);
    return response.data;
  },

  update: async (id: string, reimbursement: Partial<Reimbursement>): Promise<Reimbursement> => {
    const response = await api.put<Reimbursement>(`/reimbursements/${id}`, reimbursement);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reimbursements/${id}`);
  },
};













