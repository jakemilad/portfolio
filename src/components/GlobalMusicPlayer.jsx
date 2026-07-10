'use client';

import { useEffect, useRef, useState } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';

const MusicAlert = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-28 right-2 sm:right-4 z-40 animate-[slideInRight_0.5s_ease-out]">
      <div className="bg-[#000066] border-3 border-[#c0c0c0] border-ridge p-3 sm:p-4 rounded shadow-xl max-w-[200px] sm:max-w-xs">
        <div className="text-center">
          <div className="text-xl sm:text-2xl mb-2 animate-[pulse_1s_infinite]">🎵</div>
          <div className="text-yellow-300 font-bold text-xs sm:text-sm mb-2">
            MUSIC AVAILABLE
          </div>
          <div className="text-green-400 text-[10px] sm:text-xs mb-3">
            Click the volume button above to enjoy some tunes 🎶
          </div>
          <div className="flex items-center justify-center gap-1 text-white text-[10px] sm:text-xs">
            <span className="animate-[blink_1s_infinite]">♪</span>
            <span>Auto-dismissing...</span>
            <span className="animate-[blink_1s_infinite]">♪</span>
          </div>
        </div>
        <div className="absolute -top-2 right-6 sm:right-8 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[#c0c0c0]" />
      </div>
    </div>
  );
};

export default function GlobalMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [isControlsMinimized, setIsControlsMinimized] = useState(false);
  const [showMusicAlert, setShowMusicAlert] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const [isModernEra, setIsModernEra] = useState(false);
  const audioRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    setIsModernEra(document.documentElement.dataset.era === '2026');

    const onEraChanged = (event) => {
      const modern = event.detail?.era === '2026';
      if (modern) {
        audioRef.current?.pause();
      } else {
        // Let the <audio> element remount before resuming the retro tunes.
        setTimeout(() => playAudio(), 200);
      }
      setIsModernEra(modern);
    };

    window.addEventListener('era-changed', onEraChanged);
    return () => window.removeEventListener('era-changed', onEraChanged);
  }, []);

  useEffect(() => {
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const playAudio = async ({ showAlertOnBlock = false } = {}) => {
    if (!audioRef.current) return;
    if (document.documentElement.dataset.era === '2026') return;

    try {
      audioRef.current.volume = 0.45;
      await audioRef.current.play();
      setNeedsUserGesture(false);
      setShowMusicAlert(false);
    } catch (error) {
      console.log('Audio playback prevented:', error);
      setNeedsUserGesture(true);
      if (showAlertOnBlock) setShowMusicAlert(true);
    }
  };

  // On phones the full player + alert would sit on top of the page content,
  // so start minimized and skip the alert there.
  useEffect(() => {
    if (window.matchMedia('(max-width: 639px)').matches) {
      setIsControlsMinimized(true);
    }
  }, []);

  useEffect(() => {
    const isPhone = window.matchMedia('(max-width: 639px)').matches;
    const timeoutId = setTimeout(() => playAudio({ showAlertOnBlock: !isPhone }), 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!needsUserGesture) return undefined;

    const resumeAfterGesture = (event) => {
      if (controlsRef.current?.contains(event.target)) return;
      playAudio();
    };

    document.addEventListener('pointerdown', resumeAfterGesture);
    document.addEventListener('keydown', resumeAfterGesture);

    return () => {
      document.removeEventListener('pointerdown', resumeAfterGesture);
      document.removeEventListener('keydown', resumeAfterGesture);
    };
  }, [needsUserGesture]);

  useEffect(() => {
    if (!showMusicAlert) return;

    const timeoutId = setTimeout(() => {
      setShowMusicAlert(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [showMusicAlert]);

  const toggleAudio = async () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      await playAudio({ showAlertOnBlock: true });
    } else {
      audioRef.current.pause();
    }
  };

  if (isModernEra) return null;

  return (
    <>
      <MusicAlert show={showMusicAlert} />
      <div
        ref={controlsRef}
        className="fixed top-4 right-2 sm:right-4 bg-[#000066] border-2 border-[#c0c0c0] border-ridge rounded overflow-hidden z-50 text-green-400"
      >
        {!isControlsMinimized ? (
          <div className="p-2 flex items-center gap-2">
            <div className="bg-black text-red-500 font-mono p-1 border border-[#808080] border-inset rounded text-sm">
              {currentTime ? currentTime.toLocaleTimeString() : '00:00:00'}
            </div>
            <div className="w-px h-6 bg-[#c0c0c0]" />
            <Music className="w-5 h-5" />
            <button
              type="button"
              onClick={toggleAudio}
              className="hover:text-yellow-300"
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
              {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="w-px h-6 bg-[#c0c0c0]" />
            <button
              type="button"
              onClick={() => setIsControlsMinimized(true)}
              className="hover:text-yellow-300 text-xs font-mono"
              title="Minimize controls"
            >
              ⊟
            </button>
          </div>
        ) : (
          <div className="p-1 flex items-center gap-1">
            <div className="text-red-500 text-xs font-mono">●</div>
            <div className="text-green-400 text-xs">♪</div>
            <button
              type="button"
              onClick={() => setIsControlsMinimized(false)}
              className="hover:text-yellow-300 text-xs font-mono ml-1"
              title="Restore controls"
            >
              ⊞
            </button>
          </div>
        )}
      </div>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        playsInline
        src="/lake.mp3"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser doesn&apos;t support audio playback
      </audio>
    </>
  );
}
