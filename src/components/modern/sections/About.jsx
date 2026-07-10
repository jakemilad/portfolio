'use client';

import { useReveal } from '../hooks';

const FOCUS_AREAS = [
  {
    title: 'Product applications',
    description:
      'User-facing software that turns complex hardware and systems workflows into clear product experiences.',
  },
  {
    title: 'Platform tooling',
    description:
      'Shared tooling and application foundations that help teams develop, validate, debug, and support products.',
  },
  {
    title: 'Systems interfaces',
    description:
      'Telemetry, diagnostics, and low-level system capabilities connected to interfaces that make technical work easier.',
  },
];

const Eyebrow = ({ children }) => (
  <p className="m-mono mb-4 text-[11px] tracking-[0.3em] text-[var(--m-slate)]">
    <span className="text-[var(--m-signal)]">●</span> {children}
  </p>
);

export default function About() {
  const [headRef, headVisible] = useReveal();
  const [areasRef, areasVisible] = useReveal();
  const [logRef, logVisible] = useReveal();

  return (
    <section id="era-profile" className="bg-[var(--m-porcelain)]">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div ref={headRef} className={`reveal ${headVisible ? 'is-visible' : ''}`}>
          <Eyebrow>CH1 · PROFILE</Eyebrow>
          <h2 className="m-display max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Applications for complex systems
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--m-slate)] sm:text-lg sm:leading-8">
            My work sits between product engineering, developer tooling, and
            systems software: translating low-level capabilities into
            interfaces and workflows that people can use effectively.
          </p>
        </div>

        <div
          ref={areasRef}
          className={`reveal-stagger mt-16 grid gap-px overflow-hidden rounded-lg border border-[var(--m-hairline)] bg-[var(--m-hairline)] sm:grid-cols-3 ${
            areasVisible ? 'is-visible' : ''
          }`}
        >
          {FOCUS_AREAS.map((area) => (
            <article key={area.title} className="bg-[var(--m-paper)] p-7">
              <h3 className="m-display text-lg font-semibold tracking-tight">{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--m-slate)]">{area.description}</p>
            </article>
          ))}
        </div>

        {/* Career log, telemetry style */}
        <div
          ref={logRef}
          className={`reveal-stagger mt-16 space-y-px overflow-hidden rounded-lg border border-[var(--m-hairline)] bg-[var(--m-hairline)] ${
            logVisible ? 'is-visible' : ''
          }`}
        >
          <div className="grid gap-4 bg-[var(--m-paper)] p-7 sm:grid-cols-[140px_1fr]">
            <p className="m-mono text-[11px] tracking-[0.18em] text-[var(--m-signal)]">NOW</p>
            <div>
              <h3 className="m-display text-xl font-semibold tracking-tight">
                Astera Labs — COSMOS tooling
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--m-slate)]">
                COSMOS is software for managing and optimizing connectivity
                across rack-scale AI infrastructure. I build application
                tooling that makes system capabilities available through
                practical workflows for link management, monitoring,
                debugging, validation, and diagnostics.
              </p>
              <a
                href="https://www.asteralabs.com/products/cosmos/"
                target="_blank"
                rel="noopener noreferrer"
                className="m-mono mt-4 inline-block text-[11px] tracking-[0.18em] text-[var(--m-ink)] underline decoration-[var(--m-phosphor)] decoration-2 underline-offset-4 hover:decoration-4"
              >
                VIEW COSMOS ↗
              </a>
            </div>
          </div>

          <div className="grid gap-4 bg-[var(--m-paper)] p-7 sm:grid-cols-[140px_1fr]">
            <p className="m-mono text-[11px] tracking-[0.18em] text-[var(--m-slate)]">BEFORE</p>
            <div>
              <h3 className="m-display text-xl font-semibold tracking-tight">
                lululemon — Observability
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--m-slate)]">
                Tools that helped engineering teams understand the health of
                critical digital systems — checkout, orders, identity,
                inventory, payments. Centralized service health, SLOs, alerts,
                and telemetry; Datadog automation, reliability standards,
                incident reviews.
              </p>
            </div>
          </div>

          <div className="grid gap-4 bg-[var(--m-paper)] p-7 sm:grid-cols-[140px_1fr]">
            <p className="m-mono text-[11px] tracking-[0.18em] text-[var(--m-slate)]">ROOT</p>
            <div>
              <h3 className="m-display text-xl font-semibold tracking-tight">
                Business + Computer Science, UBC
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--m-slate)]">
                Where the whole signal chain started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
