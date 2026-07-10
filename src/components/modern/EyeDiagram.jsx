'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Eye diagram: the signal-integrity plot from Jake's world of high-speed
// links. Many NRZ traces overlaid across two unit intervals accumulate into
// the classic "open eye" — dense at the crossings, clear in the centers.

const TRACES = 64;
const POINTS = 96;
const SEGMENTS = POINTS - 1;
const FLOATS_PER_TRACE = SEGMENTS * 2 * 3;
const PLOT_WIDTH = 4; // two unit intervals, each 2 world units wide
const AMPLITUDE = 0.75;

const smoothstepTanh = (x) => 0.5 * (1 + Math.tanh(x));

// Write one randomized trace into its slice of the shared position buffer.
function writeTrace(positions, traceIndex) {
  const bits = [Math.round(Math.random()), Math.round(Math.random()), Math.round(Math.random())];
  const levels = bits.map((bit) => (bit === 1 ? AMPLITUDE : -AMPLITUDE) * (0.94 + Math.random() * 0.12));
  const rise = 0.16 + Math.random() * 0.22;
  const jitterA = (Math.random() - 0.5) * 0.14;
  const jitterB = (Math.random() - 0.5) * 0.14;
  const noise = 0.008 + Math.random() * 0.02;

  const sample = (x) => {
    // Bit boundaries at t=1 and t=3 keep the open eye centered in the window.
    const edgeA = smoothstepTanh((x - (1 + jitterA)) / rise);
    const edgeB = smoothstepTanh((x - (3 + jitterB)) / rise);
    return (
      levels[0] +
      (levels[1] - levels[0]) * edgeA +
      (levels[2] - levels[1]) * edgeB +
      (Math.random() - 0.5) * noise
    );
  };

  let offset = traceIndex * FLOATS_PER_TRACE;
  let prevX = -PLOT_WIDTH / 2;
  let prevY = sample(0);

  for (let i = 1; i < POINTS; i++) {
    const t = (i / SEGMENTS) * PLOT_WIDTH; // 0..4 in signal space
    const x = t - PLOT_WIDTH / 2;
    const y = sample(t);

    positions[offset++] = prevX;
    positions[offset++] = prevY;
    positions[offset++] = 0;
    positions[offset++] = x;
    positions[offset++] = y;
    positions[offset++] = 0;

    prevX = x;
    prevY = y;
  }
}

function buildGraticule() {
  const points = [];
  // Verticals at unit-interval boundaries and eye centers.
  for (let x = -2; x <= 2; x += 1) {
    points.push(x, -1.15, 0, x, 1.15, 0);
  }
  // Horizontals at the logic levels and zero crossing.
  for (const y of [-AMPLITUDE, 0, AMPLITUDE]) {
    points.push(-2.15, y, 0, 2.15, y, 0);
  }
  return new Float32Array(points);
}

function Traces() {
  const groupRef = useRef(null);
  const geometryRef = useRef(null);
  const nextTraceRef = useRef(0);
  const { viewport } = useThree();

  const positions = useMemo(() => {
    const buffer = new Float32Array(TRACES * FLOATS_PER_TRACE);
    for (let i = 0; i < TRACES; i++) writeTrace(buffer, i);
    return buffer;
  }, []);

  const graticule = useMemo(buildGraticule, []);

  useFrame((state) => {
    // Regenerate a few traces per frame so the eye shimmers like a live scope.
    for (let i = 0; i < 3; i++) {
      writeTrace(positions, nextTraceRef.current);
      nextTraceRef.current = (nextTraceRef.current + 1) % TRACES;
    }
    if (geometryRef.current) {
      geometryRef.current.attributes.position.needsUpdate = true;
    }

    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        state.pointer.y * 0.06,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        state.pointer.x * 0.06,
        0.05
      );
    }
  });

  const scale = Math.min(viewport.width / 4.6, viewport.height / 3.2);

  return (
    <group ref={groupRef} scale={scale}>
      <lineSegments>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#FFB000"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[graticule, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#FFB000"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export default function EyeDiagram() {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], zoom: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ background: 'transparent' }}
    >
      <Traces />
    </Canvas>
  );
}
