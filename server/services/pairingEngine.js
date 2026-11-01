// server/services/pairingEngine.js
const { computeStandings } = require('./scoringEngine');

const PAIR_INF = 100000;
const REPEAT_PENALTY = 10;

function searchBudget(n) {
  return n <= 16 ? 300000 : 10000;
}

function colorState(playerId, games) {
  let diff = 0;
  const lastColors = [];
  for (const g of games) {
    if (g.is_bye || g.white_id === null || g.black_id === null) continue;
    if (g.white_id === playerId) {
      diff += 1;
      lastColors.push('w');
    } else if (g.black_id === playerId) {
      diff -= 1;
      lastColors.push('b');
    }
  }
  return { diff, lastColors };
}

function colorPenalty(state, color, strict) {
  const newDiff = state.diff + (color === 'w' ? 1 : -1);
  if (strict && Math.abs(newDiff) > 2) return { penalty: PAIR_INF, ok: false };

  const last = state.lastColors.length > 0 ? state.lastColors[state.lastColors.length - 1] : null;
  let streak = 1;
  if (last === color) {
    for (let i = state.lastColors.length - 1; i >= 0 && state.lastColors[i] === color; i--) {
      streak++;
    }
    streak--; // fix loop counting one extra
  } else {
    streak = 1;
  }

  if (strict && streak >= 3) return { penalty: PAIR_INF, ok: false };

  let due = 'w';
  if (state.diff > 0) due = 'b';
  else if (state.diff < 0) due = 'w';
  else if (last === 'w') due = 'b';
  else due = 'w';

  let penalty = (color === due ? 0 : 1) + (Math.abs(newDiff) === 2 ? 2 : 0);
  if (!strict) {
    penalty += Math.max(0, Math.abs(newDiff) - 2) * 1000;
    if (streak >= 3) penalty += 1000;
  }
  return { penalty, ok: true };
}

function playedBefore(a, b, games) {
  for (const g of games) {
    if (
      !g.is_bye &&
      ((g.white_id === a && g.black_id === b) || (g.white_id === b && g.black_id === a))
    ) {
      return true;
    }
  }
  return false;
}

function bestOrientation(a, b, colorStates, strictColors) {
  const ca = colorStates[a];
  const cb = colorStates[b];
  const aw = colorPenalty(ca, 'w', strictColors);
  const ab = colorPenalty(ca, 'b', strictColors);
  const bw = colorPenalty(cb, 'w', strictColors);
  const bb = colorPenalty(cb, 'b', strictColors);

  const opt1 = aw.penalty + bb.penalty;
  const opt2 = ab.penalty + bw.penalty;
  const ok1 = aw.ok && bb.ok;
  const ok2 = ab.ok && bw.ok;

  if (!ok1 && !ok2) return { whiteId: a, blackId: b, penalty: PAIR_INF, ok: false };
  if (ok1 && !ok2) return { whiteId: a, blackId: b, penalty: opt1, ok: true };
  if (!ok1 && ok2) return { whiteId: b, blackId: a, penalty: opt2, ok: true };
  if (opt1 <= opt2) return { whiteId: a, blackId: b, penalty: opt1, ok: true };
  return { whiteId: b, blackId: a, penalty: opt2, ok: true };
}

function orientPair(a, b, colorStates, strictColors) {
  const orient = bestOrientation(a, b, colorStates, strictColors);
  if (!orient.ok) return { whiteId: a, blackId: b, penalty: PAIR_INF };
  return { whiteId: orient.whiteId, blackId: orient.blackId, penalty: orient.penalty };
}

function searchEven(pool, games, colorStates, options, maxIterations) {
  const n = pool.length;
  const half = n / 2;
  const holder = { best: null };
  let iterations = 0;

  const used = {};
  const pairs = [];

  const partnerPenalty = (first, second) => {
    const repeated = playedBefore(first, second, games);
    if (!options.allowRepeats && repeated) return { penalty: PAIR_INF, ok: false };
    const orient = bestOrientation(first, second, colorStates, options.strictColors);
    if (!orient.ok) return { penalty: PAIR_INF, ok: false };
    return {
      penalty: orient.penalty + (options.allowRepeats && repeated ? REPEAT_PENALTY : 0),
      ok: true,
    };
  };

  const rec = () => {
    iterations++;
    if (iterations > maxIterations) return false;
    if (pairs.length === half) {
      const cost = pairs.reduce((s, p) => s + p.penalty, 0);
      if (!holder.best || cost < holder.best.cost) {
        holder.best = { pairs: [...pairs], cost };
        if (cost === 0) return true;
      }
      return false;
    }

    const unused = pool.filter((p) => !used[p]);
    if (unused.length === 0) return false;

    let first = unused[0];
    let firstIdx = pool.indexOf(first);
    let fewest = Infinity;
    for (const p of unused) {
      let viable = 0;
      for (const q of unused) {
        if (q === p) continue;
        if (partnerPenalty(p, q).ok) viable++;
      }
      if (viable < fewest) {
        fewest = viable;
        first = p;
        firstIdx = pool.indexOf(p);
      }
    }

    used[first] = true;
    const mirror = (firstIdx + half) % n;
    const candidates = [];
    pool.forEach((p, i) => {
      if (!used[p]) {
        candidates.push({ p, i });
      }
    });

    candidates.sort((x, y) => {
      const distX = Math.min((x.i - mirror + n) % n, (mirror - x.i + n) % n);
      const distY = Math.min((y.i - mirror + n) % n, (mirror - y.i + n) % n);
      return distX - distY;
    });

    for (const cand of candidates) {
      const second = cand.p;
      const check = partnerPenalty(first, second);
      if (!check.ok) continue;

      const oriented = orientPair(first, second, colorStates, options.strictColors);
      if (options.allowRepeats && playedBefore(first, second, games)) {
        oriented.penalty += REPEAT_PENALTY;
      }
      used[second] = true;
      pairs.push(oriented);

      if (rec()) return true;

      pairs.pop();
      delete used[second];
    }

    delete used[first];
    return false;
  };

  rec();
  if (!holder.best) return null;
  return { pairs: holder.best.pairs };
}

function pairGroup(players, games, colorStates, options, maxIterations) {
  const pool = players;
  if (pool.length % 2 === 1) {
    const floaterCandidates = [pool[pool.length - 1], ...pool.slice(0, -1)];
    for (const floater of floaterCandidates) {
      const rest = pool.filter((p) => p !== floater);
      const res = searchEven(rest, games, colorStates, options, maxIterations);
      if (res) {
        return {
          pairs: res.pairs,
          floater,
          allowRepeats: options.allowRepeats,
          colorRelaxed: !options.strictColors,
        };
      }
    }
    return null;
  }
  const res = searchEven(pool, games, colorStates, options, maxIterations);
  if (!res) return null;
  return {
    pairs: res.pairs,
    floater: null,
    allowRepeats: options.allowRepeats,
    colorRelaxed: !options.strictColors,
  };
}

function pickBye(ordered, games) {
  const byeCount = {};
  for (const g of games) {
    if (g.is_bye && g.bye_for_id !== null && g.bye_for_id !== undefined) {
      byeCount[g.bye_for_id] = (byeCount[g.bye_for_id] || 0) + 1;
    }
  }
  for (const p of ordered) {
    if (!byeCount[p.id]) return p.id;
  }
  return ordered[ordered.length - 1].id;
}

function pairRound(players, games) {
  const active = players.filter((p) => Number(p.active) === 1);
  if (active.length < 2) {
    return active.map((p, i) => ({
      board: i + 1,
      whiteId: null,
      blackId: null,
      isBye: true,
      byeForId: p.id,
    }));
  }

  const standings = computeStandings(active, games);
  const rankById = {};
  standings.forEach((s, idx) => {
    rankById[s.playerId] = idx;
  });

  const ordered = [...active].sort((a, b) => rankById[a.id] - rankById[b.id]);
  const byeFor = ordered.length % 2 === 1 ? pickBye(ordered, games) : null;
  const toPair = ordered.filter((p) => p.id !== byeFor);

  const groups = [];
  let currentScore = null;
  let currentGroup = [];
  const scoreById = {};
  standings.forEach((s) => {
    scoreById[s.playerId] = s.score;
  });

  for (const p of toPair) {
    const score = scoreById[p.id];
    if (currentScore !== score) {
      if (currentGroup.length > 0) groups.push(currentGroup);
      currentGroup = [];
      currentScore = score;
    }
    currentGroup.push(p.id);
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  const colorStates = {};
  for (const p of active) {
    colorStates[p.id] = colorState(p.id, games);
  }

  const plans = [];
  let floater = null;

  const tryStrict = (p) =>
    pairGroup(
      p,
      games,
      colorStates,
      { allowRepeats: false, strictColors: true },
      searchBudget(p.length)
    );

  for (let i = groups.length - 1; i > 0; i--) {
    const g = groups[i];
    if (g.length === 0) continue;
    const sorted = [...g].sort((a, b) => rankById[a] - rankById[b]);
    const standalone = tryStrict(sorted);
    const oddLast = i === groups.length - 1 && g.length % 2 === 1;
    if (!standalone || oddLast) {
      groups[i - 1] = groups[i - 1].concat(g);
      groups[i] = [];
    }
  }

  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi];
    if (group.length === 0) continue;
    const pool = floater !== null ? [floater, ...group] : group;
    const sortedPool = [...pool].sort((a, b) => rankById[a] - rankById[b]);

    const withRepeatsStrict = (p) =>
      pairGroup(
        p,
        games,
        colorStates,
        { allowRepeats: true, strictColors: true },
        searchBudget(p.length)
      );
    const withRepeatsRelaxed = (p) =>
      pairGroup(
        p,
        games,
        colorStates,
        { allowRepeats: true, strictColors: false },
        searchBudget(p.length)
      );

    let result = tryStrict(sortedPool);
    if (!result) {
      let merged = [...sortedPool];
      let ng = gi + 1;
      let lastOk = -1;
      while (ng < groups.length) {
        merged = merged.concat(groups[ng]);
        const mergedSorted = [...merged].sort((a, b) => rankById[a] - rankById[b]);
        const candidate =
          tryStrict(mergedSorted) ||
          withRepeatsStrict(mergedSorted) ||
          withRepeatsRelaxed(mergedSorted);
        if (candidate) {
          result = candidate;
          lastOk = ng;
          let allNoRepeat = true;
          for (const p of result.pairs) {
            if (playedBefore(p.whiteId, p.blackId, games)) allNoRepeat = false;
          }
          if (allNoRepeat) break;
        }
        ng++;
      }
      if (result) {
        for (let k = gi + 1; k <= lastOk; k++) groups[k] = [];
      }
    }

    if (!result) result = withRepeatsStrict(sortedPool);
    if (!result) result = withRepeatsRelaxed(sortedPool);

    if (!result) throw new Error('Unable to pair round');

    for (const p of result.pairs) {
      let warning = null;
      if (result.allowRepeats && playedBefore(p.whiteId, p.blackId, games)) {
        warning = 'Repeat pairing (no alternative)';
      } else if (result.colorRelaxed) {
        warning = 'Color rule relaxed (no alternative)';
      }
      plans.push({
        board: plans.length + 1,
        whiteId: p.whiteId,
        blackId: p.blackId,
        isBye: false,
        byeForId: null,
        warning,
      });
      colorStates[p.whiteId].diff += 1;
      colorStates[p.blackId].diff -= 1;
      colorStates[p.whiteId].lastColors.push('w');
      colorStates[p.blackId].lastColors.push('b');
    }
    floater = result.floater;
  }

  if (floater !== null) {
    plans.push({
      board: plans.length + 1,
      whiteId: null,
      blackId: null,
      isBye: true,
      byeForId: floater,
      warning: 'Unpaired after float chain',
    });
  }
  if (byeFor !== null) {
    plans.push({
      board: plans.length + 1,
      whiteId: null,
      blackId: null,
      isBye: true,
      byeForId: byeFor,
    });
  }

  return plans;
}

module.exports = {
  PAIR_INF,
  REPEAT_PENALTY,
  colorState,
  colorPenalty,
  playedBefore,
  pairRound,
};
