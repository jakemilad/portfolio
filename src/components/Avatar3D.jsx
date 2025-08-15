'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, Text, Float } from '@react-three/drei';
import * as THREE from 'three';


function AvatarModel({ modelPath, ...props }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  

  const { scene, animations } = useGLTF(modelPath || '/placeholder-avatar.glb');
  

  const mixer = useRef();
  
  useEffect(() => {
    if (animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[0]);
      action.play();
    }
  }, [scene, animations]);


  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
    

    if (meshRef.current) {
      meshRef.current.rotation.y += hovered ? 0.01 : 0.005;
      

      meshRef.current.position.y = -1.2 + Math.sin(state.clock.elapsedTime) * 0.1;
      

      const targetScale = clicked ? 2.2 : 2;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={clicked ? 2.4 : 2}
      position={[0, -5, 0]}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      {...props}
    />
  );
}


function PlaceholderAvatar(props) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += hovered ? 0.02 : 0.01;
      meshRef.current.position.y = -1.2 + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group position={[0, -1.2, 0]} scale={1} {...props}>
      {/* Head */}
      <mesh
        ref={meshRef}
        position={[0, 1, 0]}
        onClick={() => setClicked(!clicked)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={hovered ? "#ff6b6b" : "#4ecdc4"} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1, 8]} />
        <meshStandardMaterial color="#95e1d3" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.6, 0.3, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#fce38a" />
      </mesh>
      <mesh position={[0.6, 0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#fce38a" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.2, 1.1, 0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.2, 1.1, 0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Floating text when clicked */}
      {clicked && (
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
          <Text
            position={[0, 2, 0]}
            fontSize={0.3}
            color="#ff6b6b"
            anchorX="center"
            anchorY="middle"
          >
            Hey there! 👋
          </Text>
        </Float>
      )}
    </group>
  );
}




export default function Avatar3D({ 
  modelPath, 
  enableControls = true, 
  autoRotate = true,
  className = "",
  style = {}
}) {
  const [modelError, setModelError] = useState(false);

  return (
    <div 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px', ...style }}
    >
      <Canvas>

        <PerspectiveCamera makeDefault position={[0, 2, 5]} />2
        

        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
        />
        

        {modelPath && !modelError ? (
          <AvatarModel 
            modelPath={modelPath}
            onError={() => setModelError(true)}
          />
        ) : (
          <PlaceholderAvatar />
        )}
        

        {enableControls && (
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
            enableDamping={true}
            dampingFactor={0.05}
          />
        )}
      </Canvas>
    </div>
  );
}


useGLTF.preload('/models/dance.glb');
useGLTF.preload('/models/agree.glb');
useGLTF.preload('/models/walk.glb');
useGLTF.preload('/models/run.glb');
