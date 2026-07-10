'use client';

export default function ModernFooter({ onReverse }) {
  return (
    <footer className="border-t border-[rgba(242,243,241,0.14)] bg-[var(--m-scope-deep)] text-[var(--m-porcelain)]">
      <div className="m-mono mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-[11px] tracking-[0.18em] text-[color-mix(in_srgb,var(--m-porcelain)_55%,transparent)] sm:px-8">
        <span>© 2026 JAKE MILAD — OR IS IT?</span>
        <button
          type="button"
          onClick={onReverse}
          className="border border-[rgba(242,243,241,0.25)] bg-transparent px-4 py-2 transition-colors hover:border-[var(--m-phosphor)] hover:text-[var(--m-phosphor)]"
        >
          ⏮ TAKE ME BACK TO 2001
        </button>
      </div>
    </footer>
  );
}
