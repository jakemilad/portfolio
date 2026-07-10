'use client';

import { useReveal } from '../hooks';

const LINKS = [
  ['LINKEDIN', 'https://linkedin.com/in/jakemilad'],
  ['GITHUB', 'https://github.com/jakemilad'],
];

export default function Contact() {
  const [ref, visible] = useReveal();

  return (
    <section id="era-contact" className="bg-[var(--m-scope)] text-[var(--m-porcelain)]">
      <div
        ref={ref}
        className={`reveal mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 ${
          visible ? 'is-visible' : ''
        }`}
      >
        <p className="m-mono mb-4 text-[11px] tracking-[0.3em] text-[color-mix(in_srgb,var(--m-porcelain)_55%,transparent)]">
          <span className="text-[var(--m-signal)]">●</span> CH3 · CONTACT
        </p>
        <h2 className="m-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Establish a link
        </h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-[color-mix(in_srgb,var(--m-porcelain)_65%,transparent)]">
          No Pokémon battle required this time. (He remains undefeated,
          though.)
        </p>

        <a
          href="mailto:jake.milad@gmail.com"
          className="m-display mt-12 block break-all text-2xl font-bold tracking-tight text-[var(--m-phosphor)] underline decoration-[rgba(255,176,0,0.3)] decoration-2 underline-offset-8 transition-colors hover:text-[var(--m-porcelain)] hover:decoration-[var(--m-phosphor)] sm:text-5xl"
        >
          jake.milad@gmail.com
        </a>

        <div className="m-mono mt-12 flex flex-wrap gap-6 text-[11px] tracking-[0.2em]">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[rgba(242,243,241,0.25)] px-4 py-2 transition-colors hover:border-[var(--m-phosphor)] hover:text-[var(--m-phosphor)]"
            >
              {label} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
