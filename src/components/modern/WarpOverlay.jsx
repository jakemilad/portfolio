'use client';

import { useEffect, useRef, useState } from 'react';

const BOOT_LOG = [
  { text: '> UPGRADE.EXE — installing 25 years of web standards', delay: 0 },
  { text: 'CSS2 → CSS3 .................. OK', delay: 350 },
  { text: 'table layouts ................ deprecated', delay: 250 },
  { text: 'jQuery installed ............. OK', delay: 300 },
  { text: 'jQuery removed ............... OK', delay: 220 },
  { text: 'flexbox unlocked ............. OK', delay: 200 },
  { text: 'dark mode invented ........... OK', delay: 200 },
  { text: 'npm install .................. 4,308 packages', delay: 320 },
  { text: 'left-pad incident ............ survived', delay: 260 },
  { text: 'react hydrated ............... eventually', delay: 260 },
  { text: 'WebGL context acquired ....... OK', delay: 200 },
  { text: 'visitor counter .............. still hardcoded', delay: 280 },
  { text: '', delay: 180 },
  { text: '> welcome to 2026', delay: 300 },
];

export default function WarpOverlay({ onComplete }) {
  const [lineCount, setLineCount] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let index = 0;

    const showNext = () => {
      if (index >= BOOT_LOG.length) {
        timeoutRef.current = setTimeout(() => {
          setFlashing(true);
          timeoutRef.current = setTimeout(onComplete, 450);
        }, 350);
        return;
      }

      index += 1;
      setLineCount(index);
      const nextDelay = BOOT_LOG[index]?.delay ?? 200;
      timeoutRef.current = setTimeout(showNext, nextDelay);
    };

    timeoutRef.current = setTimeout(showNext, BOOT_LOG[0].delay + 200);
    return () => clearTimeout(timeoutRef.current);
  }, [onComplete]);

  return (
    <div className="era-warp fixed inset-0 z-[200] bg-black overflow-hidden" role="status" aria-live="polite">
      <div className="era-warp__scanlines absolute inset-0 pointer-events-none" />
      <div className="h-full flex items-center justify-center p-6">
        <div className="w-full max-w-xl font-[family-name:var(--font-geist-mono),monospace] text-[13px] sm:text-sm leading-6 text-[#FFB000]">
          {BOOT_LOG.slice(0, lineCount).map((line, i) => (
            <div key={i} className="era-warp__line whitespace-pre-wrap">
              {line.text || ' '}
            </div>
          ))}
          <span className="era-warp__caret inline-block w-2.5 h-4 bg-[#FFB000] align-middle" />
        </div>
      </div>
      {flashing && <div className="era-warp__flash absolute inset-0 bg-white" />}
    </div>
  );
}
