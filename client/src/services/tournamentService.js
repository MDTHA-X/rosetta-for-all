// client/src/services/tournamentService.js
import { apiRequest } from './api';

export const TournamentService = {
  getAll: async () => {
    return await apiRequest('/tournaments');
  },

  getById: async (id) => {
    return await apiRequest(`/tournaments/${id}`);
  },

  getBySlug: async (slug) => {
    return await apiRequest(`/tournaments?slug=${slug}`);
  },

  create: async (tournamentData) => {
    return await apiRequest('/tournaments', {
      method: 'POST',
      body: tournamentData,
    });
  },

  update: async (id, updateData) => {
    return await apiRequest(`/tournaments/${id}`, {
      method: 'PUT',
      body: updateData,
    });
  },

  delete: async (id) => {
    return await apiRequest(`/tournaments/${id}`, {
      method: 'DELETE',
    });
  },

  assignAdmin: async (tournamentId, adminId) => {
    return await apiRequest('/tournaments/assign-admin', {
      method: 'POST',
      body: { tournament_id: tournamentId, admin_id: adminId },
    });
  },

  removeAdmin: async (tournamentId, adminId) => {
    return await apiRequest('/tournaments/remove-admin', {
      method: 'POST',
      body: { tournament_id: tournamentId, admin_id: adminId },
    });
  },
};

