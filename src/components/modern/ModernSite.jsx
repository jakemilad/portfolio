'use client';

import React, { useCallback, useRef, useState } from 'react';
import Hero from './sections/Hero';
import About from './sections/About';
import Work from './sections/Work';
import Contact from './sections/Contact';
import ModernFooter from './sections/ModernFooter';

const NAV_LINKS = [
  ['profile', 'PROFILE'],
  ['work', 'WORK'],
  ['contact', 'CONTACT'],
];

export default function ModernSite({ onReverse, reversing }) {
  const scrollRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const max = node.scrollHeight - node.clientHeight;
    setProgress(max > 0 ? node.scrollTop / max : 0);
  }, []);

  const scrollTo = (id) => {
    scrollRef.current
      ?.querySelector(`#era-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={`m-body fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-[var(--m-porcelain)] text-[var(--m-ink)] ${
        reversing ? 'era-crt-off' : 'era-modern-enter'
      }`}
    >
      {/* Scroll progress */}
      <div className="sticky top-0 z-30 h-[2px] bg-transparent">
        <div
          className="h-full bg-[var(--m-phosphor)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Nav — zero-height sticky so the hero starts at the very top;
          mix-blend-difference keeps it legible over scope + porcelain */}
      <header className="sticky top-[2px] z-20 h-0 overflow-visible mix-blend-difference text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="m-display text-lg font-bold tracking-tight bg-transparent border-0"
          >
            JM
          </button>
          <nav className="m-mono flex items-center gap-4 text-[10px] tracking-[0.2em] sm:gap-7 sm:text-[11px]">
            {NAV_LINKS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className="bg-transparent border-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={onReverse}
              title="Take me back to 2001"
              className="border border-current px-2 py-1 opacity-70 hover:opacity-100 transition-opacity bg-transparent"
            >
              ⏮ 2001
            </button>
          </nav>
        </div>
      </header>

      <main className="-mt-[2px]">
        <Hero />
        <About />
        <Work />
        <Contact />
        <ModernFooter onReverse={onReverse} />
      </main>
    </div>
  );
}
