// client/src/services/roundService.js
import { apiRequest } from './api';

export const RoundService = {
  getByTournament: async (tournamentId, includeStandings = false, afterRound = null) => {
    let url = `/rounds?tournament_id=${tournamentId}`;
    if (includeStandings) url += '&standings=true';
    if (afterRound) url += `&after_round=${afterRound}`;
    return await apiRequest(url);
  },

  generate: async (tournamentId) => {
    return await apiRequest('/rounds/generate', {
      method: 'POST',
      body: { tournament_id: tournamentId },
    });
  },

  complete: async (tournamentId, roundId) => {
    return await apiRequest('/rounds/complete', {
      method: 'POST',
      body: { tournament_id: tournamentId, round_id: roundId },
    });
  },

  reopen: async (tournamentId, roundId) => {
    return await apiRequest('/rounds/reopen', {
      method: 'POST',
      body: { tournament_id: tournamentId, round_id: roundId },
    });
  },

  deleteRound: async (tournamentId, roundId) => {
    return await apiRequest(`/rounds/${roundId}`, {
      method: 'DELETE',
      body: { tournament_id: tournamentId },
    });
  },

  setPairingResult: async (pairingId, result) => {
    return await apiRequest('/rounds/pairings/result', {
      method: 'POST',
      body: { pairing_id: pairingId, result },
    });
  },
};

