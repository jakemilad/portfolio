/**
 * Cryptographically-backed dice randomness.
 *
 * Shared by the standalone roller and the Catan game so there is exactly one
 * source of randomness in the app.
 */

/* ------------------------------------------------------------------ */
/*  Randomness                                                         */
/* ------------------------------------------------------------------ */

/**
 * Uniform integer in [0, max) from the CSPRNG.
 *
 * Rejection sampling: 256 is not divisible by 6, so a plain `byte % 6`
 * would make 0..3 come up 43 times per 256 draws and 4..5 only 42 —
 * a real bias. Throwing away bytes >= floor(256/max)*max removes it.
 */
export function secureRandomInt(max) {
  const c = typeof window !== 'undefined' ? window.crypto : null;
  if (!c || !c.getRandomValues) return Math.floor(Math.random() * max);

  const limit = Math.floor(256 / max) * max;
  const buf = new Uint8Array(1);
  let v;
  do {
    c.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

export const rollDie = () => secureRandomInt(6) + 1;
