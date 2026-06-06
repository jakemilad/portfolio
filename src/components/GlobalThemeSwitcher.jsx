'use client';

import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';

const themes = [
  { id: 'classic', name: 'Jake Default', colors: ['#000000', '#000066', '#4ade80'] },
  { id: 'cyber', name: 'Candy Jake', colors: ['#12002f', '#ff1493', '#00f5ff'] },
  { id: 'toxic', name: 'Jake Terminal', colors: ['#071a0c', '#173d1d', '#b6ff00'] },
  { id: 'sunset', name: 'Sunset Orange Jake', colors: ['#2b0a3d', '#9d174d', '#ffb000'] },
  { id: 'ice', name: 'Ice Jake', colors: ['#061826', '#164e63', '#67e8f9'] },
];

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
};

export default function GlobalThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const initialTheme = themes.some(({ id }) => id === savedTheme) ? savedTheme : 'classic';

    setCurrentTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const selectTheme = (theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('portfolio-theme', theme);
  };

  const activeTheme = themes.find(({ id }) => id === currentTheme) ?? themes[0];

  return (
    <div className="theme-switcher fixed bottom-4 left-2 sm:left-4 z-50 font-mono">
      {isOpen && (
        <div
          id="theme-picker"
          className="theme-switcher__panel mb-1 w-52 border-2 border-ridge rounded p-2 shadow-xl"
        >
          <div className="theme-switcher__title mb-2 text-center text-[10px] font-bold tracking-widest">
            SELECT COLOR SYSTEM
          </div>
          <div className="space-y-1">
            {themes.map((theme) => {
              const isActive = theme.id === currentTheme;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => selectTheme(theme.id)}
                  className={`theme-switcher__option flex w-full items-center gap-2 border px-2 py-2 text-left text-xs ${
                    isActive ? 'is-active' : ''
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="flex overflow-hidden border border-black" aria-hidden="true">
                    {theme.colors.map((color) => (
                      <span
                        key={color}
                        className="h-4 w-4"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                  <span className="flex-1">{theme.name}</span>
                  {isActive && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="theme-switcher__toggle flex h-10 w-10 items-center justify-center border-2 border-ridge rounded-full"
        aria-expanded={isOpen}
        aria-controls="theme-picker"
        aria-label={`Choose theme. Current theme: ${activeTheme.name}`}
        title={`Theme: ${activeTheme.name}`}
      >
        <Palette className="h-5 w-5" />
      </button>
    </div>
  );
}
