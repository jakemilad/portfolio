'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Die, PALETTES, restSlots } from '@/components/dice/DiceKit';

const TABLE_R = 5.6;
const SEAT_R = 7.0;

/* ------------------------------------------------------------------ */
/*  Name plaques                                                       */
/* ------------------------------------------------------------------ */

/**
 * Names are drawn to a canvas rather than loaded through a font loader —
 * the same trick the dice pips use. It keeps the scene self-contained with
 * no font fetch to fail.
 */
function makeNameTexture(name, bg, ink) {
  const W = 512;
  const H = 128;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const r = 26;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(W, 0, W, H, r);
  ctx.arcTo(W, H, 0, H, r);
  ctx.arcTo(0, H, 0, 0, r);
  ctx.arcTo(0, 0, W, 0, r);
  ctx.closePath();
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.stroke();

  let size = 64;
  ctx.font = `600 ${size}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
  // Shrink to fit rather than letting a long name overflow the plaque.
  while (ctx.measureText(name).width > W - 56 && size > 20) {
    size -= 2;
    ctx.font = `600 ${size}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
  }

  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, W / 2, H / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function NamePlaque({ name, color, y }) {
  const texture = useMemo(
    () => makeNameTexture(name, color.body, color.ink),
    [name, color.body, color.ink]
  );
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <Billboard position={[0, y, 0]}>
      <mesh>
        <planeGeometry args={[2.0, 0.5]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */

function Avatar({ angle, color, name, active, isNext }) {
  const groupRef = useRef();
  const bodyRef = useRef();

  const x = Math.sin(angle) * SEAT_R;
  const z = Math.cos(angle) * SEAT_R;

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    // Active player floats and turns gently so the eye finds them instantly.
    const target = active ? 0.34 : 0;
    g.position.y = THREE.MathUtils.lerp(g.position.y, target, 0.08);
    if (active) {
      g.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.045;
    }
    if (bodyRef.current) {
      const s = active ? 1.06 : 1;
      bodyRef.current.scale.setScalar(
        THREE.MathUtils.lerp(bodyRef.current.scale.x, s, 0.1)
      );
    }
  });

  const emissive = active ? color.body : '#000000';

  return (
    <group position={[x, 0, z]} rotation={[0, angle + Math.PI, 0]}>
      {/* seat marker on the table edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -1.15]}>
        <ringGeometry args={[0.52, 0.72, 32]} />
        <meshStandardMaterial
          color={color.body}
          emissive={active ? color.body : '#000'}
          emissiveIntensity={active ? 0.7 : 0}
          opacity={active ? 1 : 0.45}
          transparent
        />
      </mesh>

      <group ref={groupRef}>
        <group ref={bodyRef}>
          {/* body */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <capsuleGeometry args={[0.36, 0.5, 6, 16]} />
            <meshStandardMaterial
              color={color.body}
              emissive={emissive}
              emissiveIntensity={active ? 0.35 : 0}
              roughness={0.55}
            />
          </mesh>
          {/* head */}
          <mesh position={[0, 1.28, 0]} castShadow>
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial
              color={color.body}
              emissive={emissive}
              emissiveIntensity={active ? 0.3 : 0}
              roughness={0.5}
            />
          </mesh>
          {/* eyes — give the avatar a facing so seating reads directionally */}
          <mesh position={[-0.11, 1.33, 0.25]}>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshBasicMaterial color="#14110f" toneMapped={false} />
          </mesh>
          <mesh position={[0.11, 1.33, 0.25]}>
            <sphereGeometry args={[0.052, 12, 12]} />
            <meshBasicMaterial color="#14110f" toneMapped={false} />
          </mesh>
        </group>

        <NamePlaque name={name} color={color} y={2.1} />

        {isNext && !active && (
          <mesh position={[0, 1.78, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.13, 0.26, 4]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} opacity={0.55} transparent />
          </mesh>
        )}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Camera                                                             */
/* ------------------------------------------------------------------ */

const CAM_DIR = [0, 13.5, 15.5];
const CAM_FOV = 40;
const CAM_BASE = Math.hypot(CAM_DIR[1], CAM_DIR[2]);

/**
 * Pulls back far enough that the whole seat ring fits horizontally.
 *
 * A fixed camera frames five seats fine on a wide canvas but crops the side
 * seats on a portrait phone, where the horizontal field of view is narrow.
 * Solving for the distance that fits `SEAT_R` keeps every player on screen at
 * any aspect ratio; the clamp stops a very tall, narrow canvas from pushing
 * the table into the distance.
 */
function FramedCamera() {
  const camRef = useRef();
  const { size } = useThree();

  useEffect(() => {
    const cam = camRef.current;
    if (!cam) return;

    const aspect = size.width / Math.max(size.height, 1);
    const vHalf = ((CAM_FOV / 2) * Math.PI) / 180;
    const hHalf = Math.atan(Math.tan(vHalf) * aspect);
    // + half a name plaque (1.0) + breathing room, or the outermost plaques
    // hang over the edge of the canvas.
    const needed = (SEAT_R + 2.1) / Math.max(Math.tan(hHalf), 0.05);
    const dist = Math.min(Math.max(CAM_BASE, needed), CAM_BASE * 2.1);
    const k = dist / CAM_BASE;

    cam.position.set(CAM_DIR[0], CAM_DIR[1] * k, CAM_DIR[2] * k);
    cam.updateProjectionMatrix();
  }, [size.width, size.height]);

  return (
    <PerspectiveCamera ref={camRef} makeDefault position={CAM_DIR} fov={CAM_FOV} />
  );
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

function Scene({ seatedPlayers, tableRotation, diceValues, rollId, activeId, nextId }) {
  const slots = useMemo(() => restSlots(diceValues.length), [diceValues.length]);
  const n = seatedPlayers.length;

  return (
    <>
      <FramedCamera />

      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#ffffff', '#2a2218', 0.5]} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.45}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-8, 6, -4]} intensity={0.3} />

      {/* table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[TABLE_R, 64]} />
        <meshStandardMaterial color="#1d4b52" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[TABLE_R, TABLE_R + 0.45, 64]} />
        <meshStandardMaterial color="#c8a25a" roughness={0.6} metalness={0.25} />
      </mesh>
      {/* floor, so avatars cast onto something beyond the table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#12100e" roughness={1} />
      </mesh>

      {seatedPlayers.map((p, i) => (
        <Avatar
          key={p.id}
          angle={tableRotation + (i * Math.PI * 2) / n}
          color={p.color}
          name={p.name}
          active={p.id === activeId}
          isNext={p.id === nextId}
        />
      ))}

      {diceValues.map((v, i) => (
        <Die
          key={i}
          value={v}
          rollId={rollId}
          restPosition={slots[i]}
          palette={PALETTES[i % PALETTES.length]}
        />
      ))}

      <OrbitControls
        target={[0, 0.9, 0]}
        enablePan={false}
        minDistance={9}
        maxDistance={46}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.3}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

export default function CatanTable({
  seatedPlayers,
  tableRotation = 0,
  diceValues,
  rollId,
  activeId,
  nextId,
  onRoll,
  height = 'min(56vh, 460px)',
}) {
  return (
    <div
      className="relative border-[3px] border-[var(--theme-border)] bg-[var(--theme-stage)] select-none"
      style={{ height, cursor: onRoll ? 'pointer' : 'default' }}
      onClick={onRoll}
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
        <Scene
          seatedPlayers={seatedPlayers}
          tableRotation={tableRotation}
          diceValues={diceValues}
          rollId={rollId}
          activeId={activeId}
          nextId={nextId}
        />
      </Canvas>
    </div>
  );
}
