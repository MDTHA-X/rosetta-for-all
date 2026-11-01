// client/src/services/playerService.js
import { apiRequest } from './api';

export const PlayerService = {
  getByTournament: async (tournamentId) => {
    return await apiRequest(`/players?tournament_id=${tournamentId}`);
  },

  create: async (playerData) => {
    return await apiRequest('/players', {
      method: 'POST',
      body: playerData,
    });
  },

  update: async (id, playerData) => {
    return await apiRequest(`/players/${id}`, {
      method: 'PUT',
      body: playerData,
    });
  },

  delete: async (id) => {
    return await apiRequest(`/players/${id}`, {
      method: 'DELETE',
    });
  },
};

