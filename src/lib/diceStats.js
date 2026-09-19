/**
 * Pure statistics + serialization helpers for the dice roller.
 * No React, no DOM — everything here is unit-testable in isolation.
 */

/* ------------------------------------------------------------------ */
/*  Expected distributions                                             */
/* ------------------------------------------------------------------ */

/**
 * Probability distribution for the sum of `n` fair d6, by convolution.
 * Returns an array where index k is P(sum === n + k).
 */
export function sumDistribution(n) {
  let dist = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(dist.length + 5).fill(0);
    for (let s = 0; s < dist.length; s++) {
      for (let f = 0; f < 6; f++) next[s + f] += dist[s] / 6;
    }
    dist = next;
  }
  return dist;
}

/** P(sum) as a { sum: probability } map for `n` dice. */
export function expectedSumProbabilities(n) {
  const dist = sumDistribution(n);
  const out = {};
  dist.forEach((p, k) => {
    out[n + k] = p;
  });
  return out;
}

/* ------------------------------------------------------------------ */
/*  Chi-square goodness of fit                                         */
/* ------------------------------------------------------------------ */

// Lanczos approximation.
function lnGamma(z) {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  }
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < g.length; i++) x += g[i] / (z + i + 1);
  const t = z + g.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// Regularized lower incomplete gamma P(a,x), series expansion.
function gammaPSeries(a, x) {
  let sum = 1 / a;
  let term = sum;
  for (let i = 1; i < 500; i++) {
    term *= x / (a + i);
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
}

// Regularized upper incomplete gamma Q(a,x), Lentz continued fraction.
function gammaQContinuedFraction(a, x) {
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}

/** Upper tail Q(a,x) = 1 - P(a,x). */
function gammaQ(a, x) {
  if (x <= 0) return 1;
  return x < a + 1 ? 1 - gammaPSeries(a, x) : gammaQContinuedFraction(a, x);
}

/** P(X >= chi2) for a chi-square distribution with `df` degrees of freedom. */
export function chiSquarePValue(chi2, df) {
  if (df <= 0 || chi2 < 0) return NaN;
  return gammaQ(df / 2, chi2 / 2);
}

/**
 * Fairness test on individual die *faces* rather than on sums.
 *
 * Faces are uniform (expected N/6 each), which behaves far better at small
 * sample sizes than testing the sum distribution — there, the tails (2 and 12
 * at p=1/36) need ~180 rolls before their expected counts even reach 5.
 */
export function faceFairness(faceCounts) {
  const observed = [1, 2, 3, 4, 5, 6].map((f) => faceCounts[f] || 0);
  const total = observed.reduce((a, b) => a + b, 0);
  if (total === 0) return { total: 0, chi2: NaN, df: 5, p: NaN, expected: 0 };

  const expected = total / 6;
  const chi2 = observed.reduce((acc, o) => acc + (o - expected) ** 2 / expected, 0);
  return { total, chi2, df: 5, p: chiSquarePValue(chi2, 5), expected };
}

/** Human-readable verdict. Low p means the dice look biased. */
export function fairnessVerdict({ total, p, expected }) {
  if (total < 30) return { label: 'Need more rolls', tone: 'neutral' };
  if (expected < 5) return { label: 'Sample still small', tone: 'neutral' };
  if (Number.isNaN(p)) return { label: 'Not enough data', tone: 'neutral' };
  if (p < 0.01) return { label: 'Looks biased', tone: 'critical' };
  if (p < 0.05) return { label: 'Slightly off', tone: 'warning' };
  return { label: 'Looks fair', tone: 'good' };
}

/* ------------------------------------------------------------------ */
/*  Aggregation                                                        */
/* ------------------------------------------------------------------ */

/** Tally sums and per-die faces for a set of roll records. */
export function aggregate(rolls, diceCount) {
  const min = diceCount;
  const max = diceCount * 6;

  const sums = {};
  for (let s = min; s <= max; s++) sums[s] = 0;

  const allFaces = {};
  for (let f = 1; f <= 6; f++) allFaces[f] = 0;

  const perDie = Array.from({ length: diceCount }, () => {
    const o = {};
    for (let f = 1; f <= 6; f++) o[f] = 0;
    return o;
  });

  rolls.forEach((r) => {
    if (sums[r.sum] !== undefined) sums[r.sum] += 1;
    r.dice.forEach((v, i) => {
      allFaces[v] += 1;
      if (perDie[i]) perDie[i][v] += 1;
    });
  });

  const total = rolls.length;
  const mean = total ? rolls.reduce((a, r) => a + r.sum, 0) / total : 0;
  const expectedMean = diceCount * 3.5;

  return { sums, allFaces, perDie, total, mean, expectedMean, min, max };
}

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

const csvCell = (v) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Long format: one row per die per roll. Pivots cleanly in any spreadsheet.
 *
 * Player columns appear only when the log carries attribution (rolls made
 * inside a Catan game), so the standalone roller's export keeps its shape.
 */
export function toCSV(rolls) {
  const attributed = rolls.some((r) => r.playerId);
  const header = ['roll', 'timestamp', 'dice_count', 'die_index', 'face', 'roll_sum'];
  if (attributed) header.push('player', 'player_id', 'turn', 'round');
  const lines = [header.join(',')];

  rolls.forEach((r, i) => {
    r.dice.forEach((face, d) => {
      const row = [i + 1, new Date(r.t).toISOString(), r.dice.length, d + 1, face, r.sum];
      if (attributed) {
        row.push(r.playerName ?? '', r.playerId ?? '', r.turn ?? '', r.round ?? '');
      }
      lines.push(row.map(csvCell).join(','));
    });
  });

  return lines.join('\n');
}

export function toJSON(rolls) {
  const attributed = rolls.some((r) => r.playerId);
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      source: attributed ? 'dice-of-catan/game' : 'dice-of-catan',
      generator: 'crypto.getRandomValues (rejection sampled, unbiased)',
      rollCount: rolls.length,
      rolls: rolls.map((r, i) => ({
        roll: i + 1,
        timestamp: new Date(r.t).toISOString(),
        diceCount: r.dice.length,
        dice: r.dice,
        sum: r.sum,
        ...(attributed
          ? {
              player: r.playerName ?? null,
              playerId: r.playerId ?? null,
              turn: r.turn ?? null,
              round: r.round ?? null,
            }
          : {}),
      })),
    },
    null,
    2
  );
}
