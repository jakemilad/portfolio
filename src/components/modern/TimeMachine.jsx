'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import WarpOverlay from './WarpOverlay';
import { usePrefersReducedMotion } from './hooks';

const ModernSite = dynamic(() => import('./ModernSite'), { ssr: false });

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

const setEra = (era) => {
  if (era === '2026') {
    localStorage.setItem('portfolio-era', '2026');
    document.documentElement.dataset.era = '2026';
  } else {
    localStorage.removeItem('portfolio-era');
    delete document.documentElement.dataset.era;
  }
  window.dispatchEvent(new CustomEvent('era-changed', { detail: { era: era ?? '2001' } }));
};

export default function TimeMachine() {
  // idle → warping → modern → reversing → idle
  const [phase, setPhase] = useState('idle');
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const timeoutRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  // Direct load in 2026 mode (data-era already set pre-hydration): skip the boot gag.
  useEffect(() => {
    if (document.documentElement.dataset.era === '2026') {
      setPhase('modern');
    }
  }, []);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const enterModern = useCallback(() => {
    setEra('2026');
    setPhase('modern');
  }, []);

  // Primary trigger: the © 2001 footer buttons dispatch 'era-warp'.
  useEffect(() => {
    const onWarp = () => {
      if (phaseRef.current !== 'idle') return;
      if (reduced) {
        enterModern();
      } else {
        setPhase('warping');
      }
    };

    window.addEventListener('era-warp', onWarp);
    return () => window.removeEventListener('era-warp', onWarp);
  }, [reduced, enterModern]);

  // Secondary trigger: Konami code.
  useEffect(() => {
    let progress = 0;

    const onKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches('input, textarea, select, [contenteditable]')) return;
      if (phaseRef.current !== 'idle') return;

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;

      if (progress === KONAMI.length) {
        progress = 0;
        window.dispatchEvent(new Event('era-warp'));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const reverse = useCallback(() => {
    if (phaseRef.current !== 'modern') return;

    if (reduced) {
      setEra(null);
      setPhase('idle');
      return;
    }

    setPhase('reversing');
    timeoutRef.current = setTimeout(() => {
      setEra(null);
      setPhase('idle');
    }, 700);
  }, [reduced]);

  return (
    <div id="time-machine">
      {phase === 'warping' && <WarpOverlay onComplete={enterModern} />}
      {(phase === 'modern' || phase === 'reversing') && (
        <ModernSite onReverse={reverse} reversing={phase === 'reversing'} />
      )}
    </div>
  );
}
