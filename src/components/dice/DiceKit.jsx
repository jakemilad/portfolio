'use client';

/**
 * The 3D die: pip textures, face layout, landing orientations and the throw
 * animation. Rendered by both /dice-roll and /catan.
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

export const DIE_SIZE = 1;
export const REST_Y = DIE_SIZE / 2;
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

export function Die({ value, rollId, restPosition, palette }) {
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

export const PALETTES = [
  { body: '#b3312a', pip: '#f7efe2' }, // catan red
  { body: '#efe4cd', pip: '#3a2f27' }, // bone
  { body: '#2f6f4f', pip: '#f2f7f2' }, // forest
  { body: '#2b4a80', pip: '#eef3fb' }, // ocean
  { body: '#d8a12b', pip: '#3a2f18' }, // wheat
  { body: '#4a4a52', pip: '#e9e9ef' }, // ore
];

export function restSlots(count) {
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
