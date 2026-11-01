// server/services/scoringEngine.js

const REAL_RESULTS = ['1-0', '0-1', '1/2'];

function pointsForPlayer(result, isWhite) {
  switch (result) {
    case '1-0':
      return isWhite ? 1 : 0;
    case '0-1':
      return isWhite ? 0 : 1;
    case '1/2':
      return 0.5;
    case '+':
      return isWhite ? 1 : 0;
    case '-':
      return isWhite ? 0 : 1;
    default:
      return 0;
  }
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function headToHead(a, b, games) {
  let game = null;
  for (const g of games) {
    if (
      !g.is_bye &&
      ((g.white_id === a.playerId && g.black_id === b.playerId) ||
        (g.white_id === b.playerId && g.black_id === a.playerId)) &&
      g.result !== null
    ) {
      game = g;
      break;
    }
  }
  if (!game) return 0;
  const aIsWhite = game.white_id === a.playerId;
  const aPoints = pointsForPlayer(game.result, aIsWhite);
  if (aPoints === 1) return -1;
  if (aPoints === 0) return 1;
  return 0;
}

function computeStandings(players, games) {
  const agg = {};
  const playersById = {};

  for (const p of players) {
    playersById[p.id] = p;
    agg[p.id] = {
      score: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      byes: 0,
      played: 0,
      opponents: [],
      realOpponentIds: [],
      oppRatings: [],
      whiteCount: 0,
      blackCount: 0,
      games: [],
    };
  }

  // Pass 1: scores and individual game entries
  for (const g of games) {
    if (g.is_bye && g.bye_for_id !== null && g.bye_for_id !== undefined) {
      if (agg[g.bye_for_id]) {
        agg[g.bye_for_id].score += 0.5;
        agg[g.bye_for_id].draws += 1;
        agg[g.bye_for_id].byes += 1;
        agg[g.bye_for_id].games.push({
          round: g.round,
          opponentId: null,
          opponentName: null,
          color: null,
          result: null,
          isBye: true,
        });
      }
      continue;
    }

    if (g.white_id === null || g.black_id === null || g.result === null) continue;
    if (!agg[g.white_id] || !agg[g.black_id]) continue;

    const isReal = REAL_RESULTS.includes(g.result);
    const wPoints = pointsForPlayer(g.result, true);
    const bPoints = pointsForPlayer(g.result, false);

    agg[g.white_id].score += wPoints;
    agg[g.black_id].score += bPoints;

    if (wPoints === 1) agg[g.white_id].wins += 1;
    else if (wPoints === 0.5) agg[g.white_id].draws += 1;
    else agg[g.white_id].losses += 1;

    if (bPoints === 1) agg[g.black_id].wins += 1;
    else if (bPoints === 0.5) agg[g.black_id].draws += 1;
    else agg[g.black_id].losses += 1;

    if (isReal) {
      agg[g.white_id].played += 1;
      agg[g.black_id].played += 1;
      agg[g.white_id].whiteCount += 1;
      agg[g.black_id].blackCount += 1;
    }

    agg[g.white_id].opponents.push({ id: g.black_id, score: 0, real: isReal });
    agg[g.black_id].opponents.push({ id: g.white_id, score: 0, real: isReal });

    if (isReal) {
      agg[g.white_id].realOpponentIds.push(g.black_id);
      agg[g.black_id].realOpponentIds.push(g.white_id);
      if (playersById[g.black_id]) agg[g.white_id].oppRatings.push(playersById[g.black_id].rating);
      if (playersById[g.white_id]) agg[g.black_id].oppRatings.push(playersById[g.white_id].rating);
    }

    agg[g.white_id].games.push({
      round: g.round,
      opponentId: g.black_id,
      opponentName: playersById[g.black_id]?.name || null,
      color: 'w',
      result: g.result,
      isBye: false,
    });
    agg[g.black_id].games.push({
      round: g.round,
      opponentId: g.white_id,
      opponentName: playersById[g.white_id]?.name || null,
      color: 'b',
      result: g.result,
      isBye: false,
    });
  }

  // Pass 2: compute opponent scores for Buchholz
  for (const g of games) {
    if (g.white_id === null || g.black_id === null || g.result === null) continue;
    if (!agg[g.white_id] || !agg[g.black_id]) continue;

    for (const opp of agg[g.white_id].opponents) {
      if (opp.id === g.black_id) opp.score = agg[g.black_id].score;
    }
    for (const opp of agg[g.black_id].opponents) {
      if (opp.id === g.white_id) opp.score = agg[g.white_id].score;
    }
  }

  const standings = [];

  for (const p of players) {
    const a = agg[p.id];
    const realOppScores = a.opponents.filter((o) => o.real).map((o) => o.score);
    const allOppScores = a.opponents.map((o) => o.score);
    const buchholz = allOppScores.reduce((sum, v) => sum + v, 0) + a.byes * 0.5;

    let medianBuchholz = buchholz;
    if (a.opponents.length >= 3) {
      const sorted = [...allOppScores].sort((x, y) => x - y);
      medianBuchholz = buchholz - sorted[0] - sorted[sorted.length - 1];
    }

    const gameFor = (oppId) => {
      for (const g of a.games) {
        if (!g.isBye && g.opponentId === oppId && g.result !== null) return g;
      }
      return null;
    };

    let sb = 0;
    for (let i = 0; i < realOppScores.length; i++) {
      const score = realOppScores[i];
      const oppId = a.realOpponentIds[i];
      const game = gameFor(oppId);
      const res = game ? game.result : null;
      if (!res) continue;
      if (res === '1/2') {
        sb += score / 2;
        continue;
      }
      const won = (res === '1-0' && game.color === 'w') || (res === '0-1' && game.color === 'b');
      sb += won ? score : 0;
    }

    let koya = 0;
    for (const oppId of a.realOpponentIds) {
      const opp = agg[oppId];
      const oppGames = opp ? opp.opponents.length + opp.byes : 0;
      if (!opp || oppGames === 0 || opp.score < oppGames / 2) continue;
      const game = gameFor(oppId);
      const res = game ? game.result : null;
      if (res === '1/2') {
        koya += 0.5;
        continue;
      }
      const won = (res === '1-0' && game.color === 'w') || (res === '0-1' && game.color === 'b');
      koya += won ? 1 : 0;
    }

    let tpr = null;
    if (a.played > 0 && a.oppRatings.length > 0) {
      const avg = a.oppRatings.reduce((sum, r) => sum + r, 0) / a.oppRatings.length;
      let realWins = 0;
      let realLosses = 0;
      for (const oppId of a.realOpponentIds) {
        const game = gameFor(oppId);
        const res = game ? game.result : null;
        if (!res) continue;
        const color = game.color;
        if ((res === '1-0' && color === 'w') || (res === '0-1' && color === 'b')) realWins++;
        if ((res === '0-1' && color === 'w') || (res === '1-0' && color === 'b')) realLosses++;
      }
      tpr = Math.round(avg + (400 * (realWins - realLosses)) / a.played);
    }

    standings.push({
      playerId: p.id,
      name: p.name,
      title: p.title || '',
      rating: p.rating,
      ratingType: p.rating_type,
      score: a.score,
      wins: a.wins,
      draws: a.draws,
      losses: a.losses,
      byes: a.byes,
      played: a.played,
      buchholz: round1(buchholz),
      medianBuchholz: round1(medianBuchholz),
      sonnebornBerger: round1(sb),
      koya: round1(koya),
      tpr: tpr,
      whiteCount: a.whiteCount,
      blackCount: a.blackCount,
      games: a.games,
    });
  }

  standings.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.buchholz !== b.buchholz) return b.buchholz - a.buchholz;
    if (a.medianBuchholz !== b.medianBuchholz) return b.medianBuchholz - a.medianBuchholz;
    if (a.sonnebornBerger !== b.sonnebornBerger) return b.sonnebornBerger - a.sonnebornBerger;
    if (a.koya !== b.koya) return b.koya - a.koya;
    if (a.wins !== b.wins) return b.wins - a.wins;

    if (a.score === 0 && a.played === 0 && b.played === 0) {
      if (a.playerId !== b.playerId) return b.playerId - a.playerId;
    }

    if (a.rating !== b.rating) return b.rating - a.rating;

    const h2h = headToHead(a, b, games);
    if (h2h !== 0) return h2h;

    return b.playerId - a.playerId;
  });

  standings.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return standings;
}

module.exports = {
  REAL_RESULTS,
  pointsForPlayer,
  round1,
  headToHead,
  computeStandings,
};
