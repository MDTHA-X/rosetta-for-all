import { apiClient } from './client.js';

export const getHealth = () => apiClient('/health');
export const getStats = () => apiClient('/stats');
