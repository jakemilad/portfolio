'use client';
import React from 'react';
import Link from 'next/link';
import EraTrigger from '@/components/modern/EraTrigger';

const Portfolio = () => {
  const RainbowText = ({ children, className = "" }) => (
    <span className={`inline-block animate-[rainbow_3s_infinite] ${className}`}>
      {children}
    </span>
  );

  const projects = [
    {
      id: 'contain-urself',
      name: 'Contain Urself',
      emoji: '🐳',
      tagline: 'Built Docker from scratch in Go',
      tech: 'Go • Linux Namespaces • chroot • ARM64',
      date: 'Jun 2025',
      description: "Always thought Docker doesn't make any sense so I ripped it apart and rebuilt it from scratch.",
      bullets: [
        "Built a lightweight container runtime using Linux namespaces (PID, mount, UTS), chroot, and clone syscalls for strict process isolation",
        "Automated container setup by generating minimal root filesystems with selective binary/library injection and integrated networking utilities",
        "Debugged kernel-level edge cases across architectures, fixing namespace conflicts and ensuring ARM64 compatibility"
      ],
      color: 'var(--theme-project-one)'
    },
    {
      id: 'spendy',
      name: 'Spendy.af',
      emoji: '💸',
      tagline: 'AI-powered personal finance tracker',
      tech: 'NextJS • TypeScript • OpenAI • PostgreSQL • Tailwind',
      date: 'Dec 2024',
      description: "Built an AI finance platform that tells you where your money actually goes (and judges you for it).",
      bullets: [
        "Ingests transactions from multiple banks, normalizes schemas into PostgreSQL, and uses LLMs to auto-categorize spending for personalized insights",
        "Delivers rich visual analytics (pie charts, time series, summaries) with dynamic caching and rate-limiting for optimal performance",
        "Engineered a parallelized data pipeline with category-level caching to minimize API costs, reduce latency, and enable real-time recommendations"
      ],
      color: 'var(--theme-project-two)'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400 font-['Comic_Sans_MS'] p-5">
      <div className="max-w-4xl mx-auto bg-[#000033] border-[5px] border-[#c0c0c0] border-solid p-8">

        <RainbowText className="text-4xl sm:text-6xl font-bold block mb-3 [text-shadow:3px_3px_#ff0000,_-2px_-2px_#0000ff] text-center">
          Cool Stuff I've Built
        </RainbowText>

        <div className="text-center mb-8">
          <div className="overflow-hidden whitespace-nowrap">
            <div className="animate-[marquee_12s_linear_infinite] text-yellow-300 text-sm">
              Projects that I think are cool, built by a guy who loves primary colors
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="theme-project-card border-[3px] border-[#c0c0c0] border-solid bg-[#000066] p-6 transition-all"
            >
              <div className="mb-4 pb-3 border-b-2 border-[#c0c0c0]">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-5xl">{project.emoji}</span>
                  <div className="text-left flex-1">
                    <h2 className="text-3xl font-bold" style={{ color: project.color }}>
                      {project.name}
                    </h2>
                    <p className="text-green-400 text-sm mt-1">{project.tagline}</p>
                  </div>
                  <div className="text-yellow-300 text-xs font-mono">
                    {project.date}
                  </div>
                </div>
                <div className="text-yellow-300 text-xs font-mono mt-2">
                  {project.tech}
                </div>
              </div>

              <p className="text-green-400 mb-4 text-left text-base leading-relaxed">
                {project.description}
              </p>

              <div className="space-y-3 text-left">
                {project.bullets.map((bullet, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-yellow-300 text-xl flex-shrink-0">→</span>
                    <p className="text-green-400 text-sm leading-relaxed">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="mb-6">
            <p className="text-green-400 text-sm">
              Always cooking up something new
            </p>
          </div>

          <Link
            href="/"
            className="inline-block bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-4 hover:text-yellow-300 no-underline text-xl"
          >
            <span className="animate-[bounce_1s_ease-in-out_infinite] inline-block">👈</span>
            {' '}
            <RainbowText>Back to Homepage</RainbowText>
            {' '}
            <span className="animate-[bounce_1s_ease-in-out_infinite] inline-block">👈</span>
          </Link>

          <div className="overflow-hidden whitespace-nowrap my-5">
          </div>

          <p className="text-xs text-gray-500">
            <EraTrigger />
          </p>
        </div>
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

        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes marquee {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;
