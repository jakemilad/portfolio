'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Randomness                                                         */
/* ------------------------------------------------------------------ */

/**
 * Uniform integer in [0, max) from the CSPRNG.
 *
 * Rejection sampling: 256 is not divisible by 6, so a plain `byte % 6`
 * would make 0..3 come up 43 times per 256 draws and 4..5 only 42 —
 * a real bias. Throwing away bytes >= floor(256/max)*max removes it.
 */
function secureRandomInt(max) {
  const c = typeof window !== 'undefined' ? window.crypto : null;
  if (!c || !c.getRandomValues) return Math.floor(Math.random() * max);

  const limit = Math.floor(256 / max) * max;
  const buf = new Uint8Array(1);
  let v;
  do {
    c.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

const rollDie = () => secureRandomInt(6) + 1;

/* ------------------------------------------------------------------ */
/*  Pip textures                                                       */
/* ------------------------------------------------------------------ */

// Pip positions on a 0..1 grid, per face value.
const PIP_LAYOUT = {
  1: [[0.5, 0.5]],
  2: [[0.27, 0.27], [0.73, 0.73]],
  3: [[0.27, 0.27], [0.5, 0.5], [0.73, 0.73]],
  4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]],
  5: [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]],
  6: [[0.27, 0.25], [0.73, 0.25], [0.27, 0.5], [0.73, 0.5], [0.27, 0.75], [0.73, 0.75]],
};

function makeFaceTexture(value, bodyColor, pipColor) {
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bodyColor;
  ctx.fillRect(0, 0, S, S);

  // Soft inner vignette so the flat face doesn't read as plastic.
  const grad = ctx.createRadialGradient(S * 0.5, S * 0.5, S * 0.1, S * 0.5, S * 0.5, S * 0.75);
  grad.addColorStop(0, 'rgba(255,255,255,0.10)');
  grad.addColorStop(1, 'rgba(0,0,0,0.16)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  const r = S * 0.075;
  for (const [px, py] of PIP_LAYOUT[value]) {
    const x = px * S;
    const y = py * S;

    // Drop shadow gives the pip a recessed, drilled-in look.
    ctx.beginPath();
    ctx.arc(x + r * 0.16, y + r * 0.16, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = pipColor;
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  Face orientations                                                  */
/* ------------------------------------------------------------------ */

/*
 * BoxGeometry orders its material groups [+X, -X, +Y, -Y, +Z, -Z].
 * We lay the die out as a standard right-handed western die
 * (opposite faces sum to 7; 1-2-3 counter-clockwise about a corner):
 *
 *   +X = 1   -X = 6
 *   +Y = 2   -Y = 5
 *   +Z = 3   -Z = 4
 */
const FACE_VALUES = [1, 6, 2, 5, 3, 4];

// Rotation that brings each face value up to world +Y.
const FACE_UP_QUATERNIONS = (() => {
  const X = new THREE.Vector3(1, 0, 0);
  const Z = new THREE.Vector3(0, 0, 1);
  const q = (axis, angle) => new THREE.Quaternion().setFromAxisAngle(axis, angle);
  return {
    1: q(Z, Math.PI / 2),   // +X -> +Y
    2: new THREE.Quaternion(),
    3: q(X, -Math.PI / 2),  // +Z -> +Y
    4: q(X, Math.PI / 2),   // -Z -> +Y
    5: q(Z, Math.PI),       // -Y -> +Y
    6: q(Z, -Math.PI / 2),  // -X -> +Y
  };
})();

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */

const DIE_SIZE = 1;
const REST_Y = DIE_SIZE / 2;
const TUMBLE_END = 0.62; // fraction of flight spent spinning freely

const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);

// Decaying parabolic hops; returns to 0 at every segment boundary.
const BOUNCES = [
  [0.0, 0.52, 1.0],
  [0.52, 0.78, 0.30],
  [0.78, 0.92, 0.10],
  [0.92, 1.0, 0.03],
];

function bounceHeight(p, peak) {
  for (const [a, b, h] of BOUNCES) {
    if (p >= a && p <= b) {
      const k = (p - a) / (b - a);
      return peak * h * 4 * k * (1 - k);
    }
  }
  return 0;
}

const rand = (a, b) => a + Math.random() * (b - a);

/* ------------------------------------------------------------------ */
/*  A single die                                                       */
/* ------------------------------------------------------------------ */

function Die({ value, rollId, restPosition, palette }) {
  const meshRef = useRef();

  const materials = useMemo(() => {
    const mats = FACE_VALUES.map(
      (v) =>
        new THREE.MeshStandardMaterial({
          map: makeFaceTexture(v, palette.body, palette.pip),
          roughness: 0.42,
          metalness: 0.02,
        })
    );
    return mats;
  }, [palette.body, palette.pip]);

  useEffect(() => {
    return () => materials.forEach((m) => {
      m.map?.dispose();
      m.dispose();
    });
  }, [materials]);

  const anim = useRef({
    active: false,
    t: 0,
    delay: 0,
    duration: 1,
    captured: false,
    peak: 3,
    spinAxis: new THREE.Vector3(),
    spinSpeed: 0,
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    startQ: new THREE.Quaternion(),
    endQ: new THREE.Quaternion(),
  });

  // rollId === 0 is the initial mount: place the die at rest, don't animate.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const a = anim.current;
    a.to.set(restPosition[0], REST_Y, restPosition[2]);

    const yaw = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rand(0, Math.PI * 2)
    );
    a.endQ.multiplyQuaternions(yaw, FACE_UP_QUATERNIONS[value]);

    if (rollId === 0) {
      mesh.position.copy(a.to);
      mesh.quaternion.copy(a.endQ);
      a.active = false;
      return;
    }

    // Thrown in from off-camera, up and to the right.
    a.from.set(restPosition[0] * 0.3 + rand(3.5, 5), rand(4.5, 6.5), rand(4.5, 6));
    a.spinAxis.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
    a.spinSpeed = rand(16, 26);
    a.peak = rand(2.6, 3.6);
    a.delay = rand(0, 0.12);
    a.duration = rand(1.45, 1.7);
    a.t = 0;
    a.captured = false;
    a.active = true;

    mesh.position.copy(a.from);
    mesh.quaternion.setFromEuler(
      new THREE.Euler(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28))
    );
  }, [rollId, value, restPosition]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const a = anim.current;
    if (!mesh) return;

    if (!a.active) {
      // Idle: gently ease toward the resting slot if the layout changed.
      mesh.position.lerp(a.to, 0.12);
      return;
    }

    a.t += Math.min(delta, 1 / 30);
    const local = a.t - a.delay;
    if (local < 0) return;

    const p = Math.min(local / a.duration, 1);
    const glide = easeOutCubic(p);

    mesh.position.x = THREE.MathUtils.lerp(a.from.x, a.to.x, glide);
    mesh.position.z = THREE.MathUtils.lerp(a.from.z, a.to.z, glide);
    mesh.position.y =
      THREE.MathUtils.lerp(a.from.y, a.to.y, glide) + bounceHeight(p, a.peak);

    if (p < TUMBLE_END) {
      mesh.rotateOnWorldAxis(a.spinAxis, a.spinSpeed * delta);
    } else {
      if (!a.captured) {
        a.startQ.copy(mesh.quaternion);
        a.captured = true;
      }
      const k = (p - TUMBLE_END) / (1 - TUMBLE_END);
      mesh.quaternion.slerpQuaternions(a.startQ, a.endQ, easeOutCubic(k));
    }

    if (p >= 1) {
      mesh.position.copy(a.to);
      mesh.quaternion.copy(a.endQ);
      a.active = false;
    }
  });

  return (
    <mesh ref={meshRef} material={materials} castShadow receiveShadow>
      <boxGeometry args={[DIE_SIZE, DIE_SIZE, DIE_SIZE]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

const PALETTES = [
  { body: '#b3312a', pip: '#f7efe2' }, // catan red
  { body: '#efe4cd', pip: '#3a2f27' }, // bone
  { body: '#2f6f4f', pip: '#f2f7f2' }, // forest
  { body: '#2b4a80', pip: '#eef3fb' }, // ocean
  { body: '#d8a12b', pip: '#3a2f18' }, // wheat
  { body: '#4a4a52', pip: '#e9e9ef' }, // ore
];

function restSlots(count) {
  const spacing = 1.55;
  const perRow = Math.min(count, 3);
  const rows = Math.ceil(count / 3);

  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const inRow = Math.min(count - row * 3, perRow);
    const x = (col - (inRow - 1) / 2) * spacing;
    const z = (row - (rows - 1) / 2) * spacing;
    return [x, REST_Y, z];
  });
}

function Scene({ values, rollId }) {
  const slots = useMemo(() => restSlots(values.length), [values.length]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 7.2, 7.4]} fov={42} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#3a2e22', 0.5]} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-6, 4, -3]} intensity={0.35} />

      {/* Table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[7.5, 64]} />
        <meshStandardMaterial color="#1d4b52" roughness={0.95} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[7.5, 7.9, 64]} />
        <meshStandardMaterial color="#c8a25a" roughness={0.6} metalness={0.25} />
      </mesh>

      {values.map((v, i) => (
        <Die
          key={i}
          value={v}
          rollId={rollId}
          restPosition={slots[i]}
          palette={PALETTES[i % PALETTES.length]}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.35}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  UI                                                                 */
/* ------------------------------------------------------------------ */

const SETTLE_MS = 1900;

const INITIAL_COUNT = 2;

export default function DiceRoller() {
  const [count, setCount] = useState(INITIAL_COUNT);
  // Seeded deterministically so the server and client render identical HTML;
  // the real random opening roll is drawn on mount below. Drawing it here
  // instead would hydration-mismatch, since SSR and the browser would each
  // get their own dice.
  const [values, setValues] = useState(() => Array(INITIAL_COUNT).fill(1));
  const [rollId, setRollId] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState([]);
  const [ready, setReady] = useState(false);

  const timerRef = useRef(null);
  const rollingRef = useRef(false);

  useEffect(() => {
    setValues(Array.from({ length: INITIAL_COUNT }, rollDie));
    setReady(true);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const roll = useCallback(() => {
    if (rollingRef.current) return;
    rollingRef.current = true;

    const next = Array.from({ length: count }, rollDie);
    setValues(next);
    setRollId((id) => id + 1);
    setRolling(true);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      rollingRef.current = false;
      setRolling(false);
      setHistory((h) => [next.reduce((a, b) => a + b, 0), ...h].slice(0, 60));
    }, SETTLE_MS);
  }, [count]);

  const changeCount = (n) => {
    if (rollingRef.current || n === count) return;
    setCount(n);
    setValues(Array.from({ length: n }, rollDie));
    setRollId(0); // place them at rest without a throw animation
    setHistory([]);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        roll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [roll]);

  const total = values.reduce((a, b) => a + b, 0);
  const min = count;
  const max = count * 6;

  const tally = useMemo(() => {
    const t = {};
    for (let s = min; s <= max; s++) t[s] = 0;
    history.forEach((s) => {
      if (t[s] !== undefined) t[s] += 1;
    });
    return t;
  }, [history, min, max]);

  const tallyPeak = Math.max(1, ...Object.values(tally));
  // Before the mount effect runs, `values` is still the SSR placeholder.
  const pending = rolling || !ready;
  const isSeven = count === 2 && total === 7 && !pending;

  return (
    <div className="min-h-screen bg-[var(--theme-page)] text-[var(--theme-text)] font-['Comic_Sans_MS'] p-4 sm:p-6">
      <div className="max-w-5xl mx-auto bg-[var(--theme-shell)] border-[5px] border-[var(--theme-border)] p-4 sm:p-6">

        <div className="text-center mb-4">
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--theme-accent)] [text-shadow:3px_3px_var(--theme-shadow-one),_-2px_-2px_var(--theme-shadow-two)]">
            🎲 Dice of Catan 🎲
          </h1>
          <p className="text-xs sm:text-sm mt-2 opacity-80">
            Cryptographically random. No loaded dice, no excuses.
          </p>
        </div>

        {/* Stage */}
        <div
          className="relative border-[3px] border-[var(--theme-border)] bg-[var(--theme-stage)] cursor-pointer select-none"
          style={{ height: 'min(52vh, 420px)' }}
          onClick={roll}
          title="Click to roll"
        >
          <Canvas
            shadows
            dpr={[1, 1.75]}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
            }}
          >
            <Scene values={values} rollId={rollId} />
          </Canvas>

          <div className="absolute bottom-2 left-3 text-[10px] sm:text-xs text-[var(--theme-muted)] pointer-events-none">
            drag to orbit · scroll to zoom · click or press space to roll
          </div>
        </div>

        {/* Readout */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <div className="text-center min-w-[110px]">
            <div className="text-[10px] sm:text-xs text-[var(--theme-muted)] uppercase tracking-widest">
              Total
            </div>
            <div
              className={`text-5xl sm:text-6xl font-bold leading-none ${
                pending ? 'opacity-30' : ''
              }`}
              style={{ color: isSeven ? 'var(--theme-alert)' : 'var(--theme-accent)' }}
            >
              {pending ? '—' : total}
            </div>
          </div>

          <div className="text-center">
            <div className="text-[10px] sm:text-xs text-[var(--theme-muted)] uppercase tracking-widest mb-1">
              Dice
            </div>
            <div className="text-xl sm:text-2xl font-mono">
              {pending ? values.map(() => '?').join(' + ') : values.join(' + ')}
            </div>
          </div>

          {isSeven && (
            <div className="text-lg sm:text-2xl font-bold text-[var(--theme-alert)] animate-pulse">
              🥷 ROBBER!
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-[var(--theme-muted)]">How many:</span>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => changeCount(n)}
                disabled={rolling}
                className={`w-9 h-9 border-[3px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  n === count
                    ? 'bg-[var(--theme-selected)] border-[var(--theme-selected-border)] text-black'
                    : 'bg-[var(--theme-panel)] border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-panel-hover)]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={roll}
            disabled={rolling}
            className="px-8 py-3 text-xl font-bold border-[4px] border-[var(--theme-border)] bg-[var(--theme-button)] text-[var(--theme-button-text)] hover:bg-[var(--theme-button-hover)] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {rolling ? 'ROLLING…' : 'ROLL 🎲'}
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="border-[3px] border-[var(--theme-border)] bg-[var(--theme-panel)] p-3">
            <div className="text-xs text-[var(--theme-muted)] uppercase tracking-widest mb-2">
              Distribution — {history.length} roll{history.length === 1 ? '' : 's'}
            </div>
            <div className="flex items-end gap-1 h-24">
              {Object.entries(tally).map(([sum, n]) => (
                <div key={sum} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <div className="text-[9px] text-[var(--theme-accent)] leading-none">
                    {n || ''}
                  </div>
                  <div
                    className="w-full transition-all duration-300"
                    style={{
                      height: `${(n / tallyPeak) * 100}%`,
                      minHeight: n ? '3px' : '0px',
                      background:
                        Number(sum) === 7 && count === 2
                          ? 'var(--theme-alert)'
                          : 'var(--theme-text)',
                    }}
                  />
                  <div className="text-[9px] sm:text-[10px] text-[var(--theme-muted)] leading-none">
                    {sum}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-[3px] border-[var(--theme-border)] bg-[var(--theme-panel)] p-3 sm:w-56">
            <div className="text-xs text-[var(--theme-muted)] uppercase tracking-widest mb-2">
              Recent
            </div>
            <div className="flex flex-wrap gap-1">
              {history.length === 0 && (
                <span className="text-xs text-[var(--theme-muted)]">nothing yet</span>
              )}
              {history.slice(0, 18).map((s, i) => (
                <span
                  key={i}
                  className="w-7 h-7 flex items-center justify-center text-xs font-mono border border-[var(--theme-border-dark)]"
                  style={{
                    color:
                      s === 7 && count === 2 ? 'var(--theme-alert)' : 'var(--theme-text)',
                    opacity: 1 - i * 0.035,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="mt-3 text-[10px] text-[var(--theme-muted)] hover:text-[var(--theme-accent)] underline"
              >
                clear history
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
