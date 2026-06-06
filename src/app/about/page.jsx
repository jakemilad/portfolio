'use client';

import Image from 'next/image';
import Link from 'next/link';

const focusAreas = [
  {
    title: 'Product Applications',
    description: 'I build user-facing software that turns complex hardware and systems workflows into clear product experiences.',
  },
  {
    title: 'Platform Tooling',
    description: 'I create shared tooling and application foundations that help teams develop, validate, debug, and support products.',
  },
  {
    title: 'Systems Interfaces',
    description: 'I connect telemetry, diagnostics, and low-level system capabilities to interfaces that make technical work easier.',
  },
];

const cosmosWorkflows = [
  'Link management',
  'Monitoring',
  'Debugging',
  'System validation',
  'Diagnostics',
];

const RainbowText = ({ children, className = '' }) => (
  <span className={`inline-block animate-[rainbow_3s_infinite] ${className}`}>
    {children}
  </span>
);

const SectionTitle = ({ eyebrow, children }) => (
  <div className="mb-5">
    <div className="mb-1 font-mono text-[10px] tracking-[0.3em] text-yellow-300">
      {eyebrow}
    </div>
    <h2 className="text-2xl font-bold sm:text-3xl">
      <RainbowText>{children}</RainbowText>
    </h2>
  </div>
);

export default function About() {
  return (
    <main className="min-h-screen bg-black px-3 py-16 text-green-400 sm:px-5 font-['Comic_Sans_MS']">
      <div className="mx-auto max-w-5xl border-[3px] border-[#c0c0c0] bg-[#000033] p-3 sm:border-[5px] sm:p-6">
        <header className="border-[3px] border-[#c0c0c0] bg-[#000066] p-4 text-center sm:p-7">
          <div className="mb-2 font-mono text-xs tracking-[0.35em] text-yellow-300">
            PERSONNEL FILE // JAKE MILAD
          </div>
          <RainbowText className="block text-4xl font-bold [text-shadow:2px_2px_#ff0000,_-2px_-2px_#0000ff] sm:text-6xl">
            Product and Platform Applications Engineer
          </RainbowText>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 sm:text-base">
            I build product applications and platform tooling for complex technical systems. My work
            sits between product engineering, developer tooling, and systems software: translating
            low-level capabilities into interfaces and workflows that people can use effectively.
          </p>
        </header>

        <section className="my-6 grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="border-[3px] border-[#c0c0c0] bg-[#000066] p-3">
            <div className="border-2 border-[#808080] border-inset p-2">
              <Image
                src="/img.jpg"
                alt="Jake Milad"
                width={350}
                height={350}
                className="aspect-square w-full object-cover"
                priority
              />
            </div>
            <div className="mt-3 border border-[#808080] bg-black p-3 font-mono text-xs leading-6">
              <div><span className="text-yellow-300">ROLE:</span> Product + Platform Applications</div>
              <div><span className="text-yellow-300">COMPANY:</span> Astera Labs</div>
              <div><span className="text-yellow-300">FOCUS:</span> COSMOS Tooling</div>
              <div><span className="text-yellow-300">EDUCATION:</span> Business + CS, UBC</div>
            </div>
          </div>

          <div className="border-[3px] border-[#c0c0c0] bg-[#000066] p-4 sm:p-6">
            <SectionTitle eyebrow="01 // WHAT I DO">Applications for Complex Systems</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              {focusAreas.map((area) => (
                <article
                  key={area.title}
                  className="border-2 border-[#c0c0c0] bg-[#000033] p-4"
                >
                  <h3 className="mb-2 text-lg font-bold text-yellow-300">{area.title}</h3>
                  <p className="text-sm leading-6">{area.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="my-6 border-[3px] border-[#c0c0c0] bg-[#000066] p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <SectionTitle eyebrow="02 // CURRENT WORK">COSMOS Tooling at Astera Labs</SectionTitle>
              <p className="text-sm leading-7 sm:text-base">
                I work as a Product and Platform Applications Engineer at Astera Labs on COSMOS
                tooling. COSMOS is software for managing and optimizing connectivity across
                rack-scale AI infrastructure. I work on application tooling that makes system
                capabilities available through practical workflows for link management, monitoring,
                debugging, validation, and diagnostics.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ['PRODUCT', 'Interfaces for complex connectivity and device workflows'],
                  ['PLATFORM', 'Reusable foundations that support COSMOS applications'],
                  ['SYSTEMS', 'Telemetry and diagnostics connected to useful workflows'],
                ].map(([title, description]) => (
                  <div key={title} className="border border-[#808080] bg-black p-3">
                    <div className="mb-1 font-mono text-xs font-bold text-yellow-300">{title}</div>
                    <div className="text-xs leading-5">{description}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="border-2 border-[#c0c0c0] bg-[#000033] p-4">
              <div className="mb-4 text-center font-mono text-xs text-yellow-300">
                COSMOS WORKFLOWS
              </div>
              <div className="space-y-2">
                {cosmosWorkflows.map((workflow, index) => (
                  <div key={workflow}>
                    <div className="flex items-center gap-3 border border-[#808080] bg-black p-2 font-mono text-xs">
                      <span className="text-red-500">[ ]</span>
                      <span>{workflow}</span>
                    </div>
                    {index < cosmosWorkflows.length - 1 && (
                      <div className="mx-auto h-2 w-px bg-[#c0c0c0]" />
                    )}
                  </div>
                ))}
              </div>
              <a
                href="https://www.asteralabs.com/products/cosmos/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block border-2 border-[#c0c0c0] bg-[#000066] p-2 text-center font-mono text-xs hover:text-yellow-300"
              >
                View COSMOS
              </a>
            </aside>
          </div>
        </section>

        <section className="my-6">
          <div className="border-[3px] border-[#c0c0c0] bg-[#000066] p-4 sm:p-6">
            <SectionTitle eyebrow="03 // PREVIOUS EXPERIENCE">Observability at lululemon</SectionTitle>
            <p className="text-sm leading-7">
              Previously, I built tools that helped engineering teams understand the health of
              critical digital systems including checkout, orders, identity, inventory, and
              payments. My main project centralized service health, SLOs, order metrics, alerts,
              and telemetry to improve issue detection during peak traffic and reduce fragmented
              tooling. I also built Datadog automation and supported reliability standards,
              incident reviews, and service mapping.
            </p>
          </div>
        </section>

        <section className="border-[3px] border-[#c0c0c0] bg-[#000066] p-5 text-center sm:p-7">
          <h2 className="mb-5 text-2xl font-bold sm:text-3xl">
            <RainbowText>See What I&apos;ve Built</RainbowText>
          </h2>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/portfolio"
              className="border-[3px] border-[#c0c0c0] bg-[#000033] px-5 py-3 text-lg no-underline hover:text-yellow-300"
            >
              Explore Projects
            </Link>
            <Link
              href="/"
              className="border-[3px] border-[#c0c0c0] bg-[#000033] px-5 py-3 text-lg no-underline hover:text-yellow-300"
            >
              Back Home
            </Link>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes rainbow {
          0% { color: var(--theme-rainbow-1); }
          20% { color: var(--theme-rainbow-2); }
          40% { color: var(--theme-rainbow-3); }
          60% { color: var(--theme-rainbow-4); }
          80% { color: var(--theme-rainbow-5); }
          100% { color: var(--theme-rainbow-1); }
        }

        @keyframes marquee {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </main>
  );
}
