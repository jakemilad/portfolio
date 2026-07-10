'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './hooks';

const START_YEAR = 2001;
const END_YEAR = 2026;

export default function EraTrigger() {
  const [year, setYear] = useState(START_YEAR);
  const [counting, setCounting] = useState(false);
  const timeoutRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const glitchTier = !counting
    ? 0
    : year < 2010
      ? 1
      : year < 2020
        ? 2
        : 3;

  const startWarp = () => {
    if (counting) return;

    if (reduced) {
      window.dispatchEvent(new Event('era-warp'));
      return;
    }

    setCounting(true);

    // Accelerating count: each year ticks faster than the last.
    const step = (currentYear) => {
      if (currentYear >= END_YEAR) {
        setYear(END_YEAR);
        timeoutRef.current = setTimeout(() => {
          window.dispatchEvent(new Event('era-warp'));
          setCounting(false);
          setYear(START_YEAR);
        }, 250);
        return;
      }

      const next = currentYear + 1;
      const progress = (next - START_YEAR) / (END_YEAR - START_YEAR);
      const delay = Math.max(120 - progress * 100, 20);
      setYear(next);
      timeoutRef.current = setTimeout(() => step(next), delay);
    };

    step(START_YEAR);
  };

  return (
    <button
      type="button"
      onClick={startWarp}
      title="?"
      aria-label="Travel to the present day"
      className={`era-trigger bg-transparent border-0 p-0 is-glitching-${glitchTier}`}
    >
      © <span className="era-trigger__year">{year}</span>
    </button>
  );
}
