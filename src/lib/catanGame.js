/**
 * Catan session logic — players, seating, turn order.
 *
 * Pure functions only: no React, no DOM, no randomness of its own (rolls are
 * passed in). That keeps the turn rules testable in isolation.
 */

export const PHASES = {
  WELCOME: 'welcome',
  PLAYERS: 'players',
  SEATING: 'seating',
  ROLL_OFF: 'rollOff',
  PLACEMENT: 'placement',
  PLAY: 'play',
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

/** Seat colors, distinct from the dice palette so avatars never read as dice. */
export const PLAYER_COLORS = [
  { name: 'Red', body: '#c0392b', ink: '#ffffff' },
  { name: 'Blue', body: '#2563a8', ink: '#ffffff' },
  { name: 'White', body: '#e8e3d7', ink: '#2b2b2b' },
  { name: 'Orange', body: '#d97b18', ink: '#2b2b2b' },
  { name: 'Green', body: '#2f7d4f', ink: '#ffffff' },
  { name: 'Brown', body: '#6b4a2f', ink: '#ffffff' },
];

/* ------------------------------------------------------------------ */
/*  Players & seating                                                  */
/* ------------------------------------------------------------------ */

export function makePlayers(names) {
  return names.map((raw, i) => {
    const name = String(raw ?? '').trim();
    return {
      id: `p${i}`,
      name: name || `Player ${i + 1}`,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    };
  });
}

/**
 * `seats[i]` is the player id sitting at seat i. Seats advance clockwise
 * around the table, so seat order *is* play order.
 */
export function initialSeats(players) {
  return players.map((p) => p.id);
}

export function swapSeats(seats, a, b) {
  if (a === b || a < 0 || b < 0 || a >= seats.length || b >= seats.length) return seats;
  const next = [...seats];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Rotate who sits where without changing relative order (shift everyone round). */
export function rotateSeats(seats, step = 1) {
  const n = seats.length;
  if (n === 0) return seats;
  const k = ((step % n) + n) % n;
  return [...seats.slice(n - k), ...seats.slice(0, n - k)];
}

/* ------------------------------------------------------------------ */
/*  Turn order                                                         */
/* ------------------------------------------------------------------ */

/**
 * Play order starting at `firstSeat`, walking the table in `direction`
 * (1 = clockwise, -1 = counter-clockwise).
 */
export function buildTurnOrder(seats, firstSeat, direction = 1) {
  const n = seats.length;
  if (n === 0) return [];
  const start = ((firstSeat % n) + n) % n;
  return Array.from({ length: n }, (_, k) => seats[(start + k * direction + n * n) % n]);
}

/**
 * Catan's opening placement: everyone places one settlement in turn order,
 * then places their second in reverse — so the last player places twice in a
 * row and the order "slingshots" back to the first.
 */
export function snakeOrder(order) {
  return [...order, ...[...order].reverse()];
}

/* ------------------------------------------------------------------ */
/*  Roll-off for first player                                          */
/* ------------------------------------------------------------------ */

/**
 * Resolve a round of opening rolls.
 *
 * `rolls` maps playerId -> sum. Highest roll wins; on a tie only the tied
 * players roll again (classic rule), which is why this returns `contenders`
 * rather than picking arbitrarily.
 */
export function resolveRollOff(rolls) {
  const entries = Object.entries(rolls);
  if (entries.length === 0) return { winner: null, contenders: [], top: null, tied: false };

  const top = Math.max(...entries.map(([, v]) => v));
  const contenders = entries.filter(([, v]) => v === top).map(([id]) => id);

  return {
    top,
    contenders,
    tied: contenders.length > 1,
    winner: contenders.length === 1 ? contenders[0] : null,
  };
}

/* ------------------------------------------------------------------ */
/*  Turn advance                                                       */
/* ------------------------------------------------------------------ */

/** Step an index through a cyclic order, reporting when a full round closes. */
export function advanceTurn(turnIndex, orderLength) {
  if (orderLength <= 0) return { turnIndex: 0, wrapped: false };
  const next = turnIndex + 1;
  return { turnIndex: next % orderLength, wrapped: next >= orderLength };
}

/* ------------------------------------------------------------------ */
/*  Per-player roll stats                                              */
/* ------------------------------------------------------------------ */

export function playerRollStats(log, playerId) {
  const mine = log.filter((r) => r.playerId === playerId);
  const total = mine.length;
  const sum = mine.reduce((a, r) => a + r.sum, 0);
  return {
    total,
    mean: total ? sum / total : 0,
    sevens: mine.filter((r) => r.sum === 7).length,
    best: total ? Math.max(...mine.map((r) => r.sum)) : null,
  };
}
