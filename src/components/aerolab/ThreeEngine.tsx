/**
 * ASAB | AEROLAB 3D - ThreeEngine.tsx
 * Foundation 3D scene component using @react-three/fiber and Three.js for the AEROLAB 3D studio.
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RotatingSovereignCube() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#9a6a3a" roughness={0.2} metalness={0.8} />
    </mesh>
  );
}

export const ThreeEngine: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-[#120e0a]" data-testid="three-engine-canvas">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 10, 5]} intensity={2.0} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <RotatingSovereignCube />
        <gridHelper args={[20, 20, 0xd8b98a, 0x32261b]} position={[0, -2, 0]} />
      </Canvas>
    </div>
  );
};
