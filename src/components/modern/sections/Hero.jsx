'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCountUp, usePrefersReducedMotion } from '../hooks';

const HeroFallback = () => (
  <div
    aria-hidden
    className="absolute inset-0"
    style={{
      background:
        'radial-gradient(ellipse 70% 45% at 50% 52%, rgba(255,176,0,0.22), rgba(255,176,0,0.05) 55%, transparent 75%), ' +
        'repeating-linear-gradient(to right, transparent 0 calc(20% - 1px), rgba(255,176,0,0.07) calc(20% - 1px) 20%), ' +
        'repeating-linear-gradient(to bottom, transparent 0 calc(25% - 1px), rgba(255,176,0,0.07) calc(25% - 1px) 25%), ' +
        'var(--m-scope)',
    }}
  />
);

const EyeDiagram = dynamic(() => import('../EyeDiagram'), {
  ssr: false,
  loading: HeroFallback,
});

class EyeDiagramErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <HeroFallback />;
    return this.props.children;
  }
}

const useClock = () => {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
};

export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const now = useClock();
  const lanes = useCountUp(64, { duration: 1800 });

  return (
    <section
      id="era-hero"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-[var(--m-scope)] text-[var(--m-porcelain)]"
    >
      {reduced ? (
        <HeroFallback />
      ) : (
        <EyeDiagramErrorBoundary>
          <div className="absolute inset-0">
            <EyeDiagram />
          </div>
        </EyeDiagramErrorBoundary>
      )}

      {/* Soft vignette so type stays readable over the traces */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(7,10,22,0.9) 0%, rgba(7,10,22,0.25) 35%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-24 pt-32 sm:px-8">
        <p className="m-mono mb-5 text-[11px] tracking-[0.3em] text-[var(--m-phosphor)]">
          PORTFOLIO / REV 2026 — SIGNAL LOCKED
        </p>
        <h1 className="m-display text-[17vw] font-bold leading-[0.92] tracking-tight sm:text-8xl md:text-9xl">
          Jake Milad
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[color-mix(in_srgb,var(--m-porcelain)_75%,transparent)] sm:text-lg sm:leading-8">
          Product &amp; platform applications engineer. I turn rack-scale AI
          infrastructure into software people can actually use.
        </p>
      </div>

      {/* Telemetry strip */}
      <div className="relative border-t border-[rgba(242,243,241,0.14)]">
        <div className="m-mono mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-5 py-4 text-[10px] tracking-[0.18em] text-[color-mix(in_srgb,var(--m-porcelain)_55%,transparent)] sm:px-8 sm:text-[11px]">
          <span className="flex items-center gap-2">
            <span className="era-live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--m-signal)]" />
            LIVE
          </span>
          <span suppressHydrationWarning>
            LOCAL {now ? now.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}
          </span>
          <span className="text-[var(--m-phosphor)]">LANES {String(lanes).padStart(2, '0')}/64</span>
          <span>UPTIME 25Y</span>
          <span className="hidden sm:inline">EST. 2001 — UPGRADED IN PLACE</span>
          <span className="ml-auto">SCROLL ▾</span>
        </div>
      </div>
    </section>
  );
}
