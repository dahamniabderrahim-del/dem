import api from './api';
import { StockMovement } from '@/types';

export const stockMovementService = {
  getAll: async (params?: {
    medicamentId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<StockMovement[]> => {
    const response = await api.get<StockMovement[]>('/stock-movements', { params });
    return response.data;
  },

  create: async (movement: Partial<StockMovement>): Promise<StockMovement> => {
    const response = await api.post<StockMovement>('/stock-movements', movement);
    return response.data;
  },
};













