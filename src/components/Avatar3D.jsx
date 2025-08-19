'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, Text, Float } from '@react-three/drei';
import * as THREE from 'three';


function AvatarModel({ modelPath, ...props }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  

  const { scene, animations } = useGLTF(modelPath || '/models/walk-compressed.glb');
  

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
      
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1, 8]} />
        <meshStandardMaterial color="#95e1d3" />
      </mesh>
      
      <mesh position={[-0.6, 0.3, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#fce38a" />
      </mesh>
      <mesh position={[0.6, 0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#fce38a" />
      </mesh>
      
      <mesh position={[-0.2, 1.1, 0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.2, 1.1, 0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
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




function detectWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

function FallbackAvatar({ className = "" }) {
  const [currentEmoji, setCurrentEmoji] = useState('🤖');
  const emojis = ['🤖', '👨‍💻', '🧑‍💻', '💻', '🎮', '🚀'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 border-2 border-gray-400 ${className}`}>
      <div className="text-8xl mb-4 animate-bounce">
        {currentEmoji}
      </div>
      <div className="text-green-400 text-center px-4">
        <div className="text-lg font-bold mb-2">Jake Milad</div>
        <div className="text-sm">Software Engineer</div>
        <div className="text-xs mt-2 text-yellow-300">
          (3D mode unavailable - using 2D fallback)
        </div>
      </div>
    </div>
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
  const [webglSupported, setWebglSupported] = useState(true);
  const [webglError, setWebglError] = useState(null);

  useEffect(() => {
    // Check WebGL support on mount
    if (!detectWebGLSupport()) {
      setWebglSupported(false);
    }
  }, []);

  // Error boundary for Canvas
  const handleCanvasError = (error) => {
    console.warn('Canvas/WebGL Error:', error);
    setWebglError(error);
    setWebglSupported(false);
  };

  // If WebGL isn't supported or failed, show fallback
  if (!webglSupported || webglError) {
    return (
      <div 
        className={`w-full h-full ${className}`}
        style={{ minHeight: '400px', ...style }}
      >
        <FallbackAvatar className="h-full" />
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px', ...style }}
    >
      <Canvas 
        onError={handleCanvasError}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false
        }}
      >

        <PerspectiveCamera makeDefault position={[0, 0.5, 6]} />
        

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


useGLTF.preload('/models/dance-compressed.glb');
useGLTF.preload('/models/agree-compressed.glb');
useGLTF.preload('/models/walk-compressed.glb');
useGLTF.preload('/models/run-compressed.glb');
