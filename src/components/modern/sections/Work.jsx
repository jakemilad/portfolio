'use client';

import { useReveal } from '../hooks';

const PROJECTS = [
  {
    id: 'contain-urself',
    name: 'Contain Urself',
    tagline: 'Docker, rebuilt from scratch in Go',
    date: '2025',
    tech: ['Go', 'Linux namespaces', 'chroot', 'ARM64'],
    description:
      'Always thought Docker doesn’t make any sense, so I ripped it apart and rebuilt it from scratch.',
    bullets: [
      'Lightweight container runtime using PID, mount, and UTS namespaces, chroot, and clone syscalls for strict process isolation.',
      'Automated container setup: minimal root filesystems with selective binary/library injection and integrated networking.',
      'Debugged kernel-level edge cases across architectures, fixing namespace conflicts and ensuring ARM64 compatibility.',
    ],
  },
  {
    id: 'spendy',
    name: 'Spendy.af',
    tagline: 'AI-powered personal finance tracker',
    date: '2024',
    tech: ['Next.js', 'TypeScript', 'OpenAI', 'PostgreSQL'],
    description:
      'An AI finance platform that tells you where your money actually goes (and judges you for it).',
    bullets: [
      'Ingests transactions from multiple banks, normalizes schemas into PostgreSQL, and uses LLMs to auto-categorize spending.',
      'Rich visual analytics — pie charts, time series, summaries — with dynamic caching and rate limiting.',
      'Parallelized data pipeline with category-level caching to minimize API costs and enable real-time recommendations.',
    ],
  },
];

const ProjectRow = ({ project }) => {
  const [ref, visible] = useReveal();

  return (
    <article
      ref={ref}
      className={`reveal group border-t border-[var(--m-hairline)] py-14 first:border-t-0 sm:py-16 ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="m-mono text-[11px] tracking-[0.18em] text-[var(--m-slate)]">
            {project.date}
          </p>
          <h3 className="m-display mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-[linear-gradient(var(--m-phosphor),var(--m-phosphor))] bg-[length:0%_3px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_3px]">
              {project.name}
            </span>
          </h3>
          <p className="mt-3 text-base text-[var(--m-slate)]">{project.tagline}</p>
          <ul className="m-mono mt-6 flex flex-wrap gap-2 text-[10px] tracking-[0.12em]">
            {project.tech.map((item) => (
              <li
                key={item}
                className="rounded-full border border-[var(--m-hairline)] bg-[var(--m-paper)] px-3 py-1 text-[var(--m-slate)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-base leading-7 sm:text-lg sm:leading-8">{project.description}</p>
          <ul className="mt-6 space-y-3">
            {project.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm leading-6 text-[var(--m-slate)]">
                <span aria-hidden className="mt-[2px] text-[var(--m-phosphor)]">
                  →
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
};

export default function Work() {
  const [headRef, headVisible] = useReveal();

  return (
    <section id="era-work" className="bg-[var(--m-paper)]">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div ref={headRef} className={`reveal ${headVisible ? 'is-visible' : ''}`}>
          <p className="m-mono mb-4 text-[11px] tracking-[0.3em] text-[var(--m-slate)]">
            <span className="text-[var(--m-signal)]">●</span> CH2 · WORK
          </p>
          <h2 className="m-display max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Selected builds
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--m-slate)]">
            Still built by a guy who loves primary colors — they&apos;re just
            calibrated now.
          </p>
        </div>

        <div className="mt-10">
          {PROJECTS.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
