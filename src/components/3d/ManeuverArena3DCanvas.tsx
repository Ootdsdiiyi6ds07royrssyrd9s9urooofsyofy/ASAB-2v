/**
 * ASAB | AEROLAB 3D - Maneuver Training Arena & Obstacle Avoidance
 * Demonstrates 3D trajectory ribbon, obstacle proximity vectors, safe corridor navigation, wind shear, jammer alerts, and sandstorm visibility.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildAircraftModel } from './AircraftModel3D';
import { buildBattlefieldTheater } from './BattlefieldTheater';

export interface ManeuverArenaProps {
  selectedManeuver?: string;
  speed?: number;
  altitudeOffset?: number;
  agility?: number;
  isPaused?: boolean;
  evasionActive?: boolean;
  windSpeed?: number;
  jammerActive?: boolean;
  sandstormMode?: boolean;
}

export const ManeuverArena3DCanvas: React.FC<ManeuverArenaProps> = ({
  selectedManeuver = 'Straight Flight',
  speed = 1.0,
  altitudeOffset = 6,
  agility = 1.0,
  isPaused = false,
  evasionActive = false,
  windSpeed = 15,
  jammerActive = false,
  sandstormMode = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [obstacleDistance, setObstacleDistance] = useState<number>(450);
  const [safetyStatus, setSafetyStatus] = useState<'Clear' | 'Caution' | 'Evasion Active' | 'Jammer Interference'>('Clear');

  // Use refs for animation loop variables to avoid recreating scene on slider tweaks
  const propsRef = useRef({ speed, altitudeOffset, agility, isPaused, evasionActive, selectedManeuver, windSpeed, jammerActive, sandstormMode });
  useEffect(() => {
    propsRef.current = { speed, altitudeOffset, agility, isPaused, evasionActive, selectedManeuver, windSpeed, jammerActive, sandstormMode };
  }, [speed, altitudeOffset, agility, isPaused, evasionActive, selectedManeuver, windSpeed, jammerActive, sandstormMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sandstormMode ? 0x2b1d0c : 0x080d16);
    scene.fog = new THREE.FogExp2(sandstormMode ? 0x4a3520 : 0x080d16, sandstormMode ? 0.04 : 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    camera.position.set(25, 20, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 4, 0);

    // Lights
    const hemi = new THREE.HemisphereLight(sandstormMode ? 0xd4a373 : 0xedf4fa, 0x08101a, 1.2);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(sandstormMode ? 0xf4a261 : 0x35d5e8, 1.8);
    dir.position.set(20, 30, 20);
    scene.add(dir);

    // Battlefield Theater
    const theater = buildBattlefieldTheater(sandstormMode ? 'warzone-sandstorm' : 'warzone-day');
    scene.add(theater.rootGroup);
    theater.setMode(sandstormMode ? 'warzone-sandstorm' : 'warzone-day', scene);

    // Aircraft Model
    const aircraft = buildAircraftModel('test');
    scene.add(aircraft.rootGroup);

    // Virtual Obstacles
    const obstacles = [
      { pos: new THREE.Vector3(12, 0, 8), r: 4, h: 18 },
      { pos: new THREE.Vector3(-14, 0, -10), r: 5, h: 22 },
      { pos: new THREE.Vector3(0, 0, 18), r: 3.5, h: 14 },
    ];

    // Trajectory Ribbon Trail
    const maxTrailPoints = 90;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({ color: jammerActive ? 0xf5b82e : 0x35d5e8, transparent: true, opacity: 0.8 });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);

    const trailHistory: THREE.Vector3[] = [];

    // Animation Loop
    let animId = 0;
    let t = 0;
    const render = () => {
      controls.update();
      const currentProps = propsRef.current;

      if (!currentProps.isPaused) {
        t += 0.02 * currentProps.speed * currentProps.agility;
      }

      let x = 0, y = currentProps.altitudeOffset, z = 0, bank = 0;
      const man = currentProps.selectedManeuver;

      if (man === 'Gradual Turns' || man === 'Banking') {
        const rad = 22;
        x = Math.sin(t * 0.5) * rad;
        z = Math.cos(t * 0.5) * rad;
        y = currentProps.altitudeOffset + Math.sin(t) * 2.5;
        bank = -0.4 * currentProps.agility;
      } else if (man === 'Obstacle Awareness') {
        x = Math.sin(t) * 16;
        z = Math.sin(t * 2) * 12;
        y = currentProps.altitudeOffset + Math.cos(t * 1.5) * 2.5;
        bank = Math.sin(t) * 0.35;
      } else if (man === 'Altitude Adjustment') {
        x = Math.sin(t * 0.3) * 12;
        z = Math.cos(t * 0.3) * 12;
        y = currentProps.altitudeOffset + Math.sin(t * 1.2) * 6;
        bank = 0.2;
      } else if (man === 'Safe Route Navigation') {
        x = Math.sin(t * 0.4) * 18;
        z = ((t * 10) % 80) - 40;
        y = currentProps.altitudeOffset + Math.sin(t * 0.8) * 3;
        bank = -0.25;
      } else {
        x = Math.sin(t * 0.2) * 4;
        z = ((t * 8) % 80) - 40;
        y = currentProps.altitudeOffset + Math.sin(t * 0.8) * 1.5;
      }

      // Wind shear effect & Jammer jitter
      const windDrift = (currentProps.windSpeed / 30) * Math.sin(t * 1.5);
      x += windDrift;
      z += windDrift * 0.7;

      if (currentProps.jammerActive) {
        x += (Math.random() - 0.5) * 0.8;
        y += (Math.random() - 0.5) * 0.6;
      }

      // Apply emergency evasion override if active
      if (currentProps.evasionActive) {
        y += 8 + Math.sin(t * 8) * 3;
        x += Math.cos(t * 6) * 5;
      }

      aircraft.rootGroup.position.set(x, y, z);
      
      // Update trajectory trail
      trailHistory.push(new THREE.Vector3(x, y, z));
      if (trailHistory.length > maxTrailPoints) trailHistory.shift();
      for (let i = 0; i < trailHistory.length; i++) {
        trailPositions[i * 3] = trailHistory[i].x;
        trailPositions[i * 3 + 1] = trailHistory[i].y;
        trailPositions[i * 3 + 2] = trailHistory[i].z;
      }
      trailGeo.attributes.position.needsUpdate = true;

      // Update theater & aircraft components
      theater.update(0.02, t);
      
      let minObstacleDist = 999;
      obstacles.forEach((obs) => {
        const dx = x - obs.pos.x;
        const dz = z - obs.pos.z;
        const d = Math.sqrt(dx * dx + dz * dz) * 10;
        if (d < minObstacleDist) minObstacleDist = d;
      });

      setObstacleDistance(Math.round(minObstacleDist));
      if (currentProps.evasionActive) setSafetyStatus('Evasion Active');
      else if (currentProps.jammerActive) setSafetyStatus('Jammer Interference');
      else setSafetyStatus(minObstacleDist < 80 ? 'Evasion Active' : minObstacleDist < 160 ? 'Caution' : 'Clear');

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      theater.dispose();
      aircraft.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [sandstormMode]);

  return (
    <div className="relative w-full h-full bg-[#080D16] select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full" data-testid="maneuver-arena-canvas" />
      <div className="absolute top-4 left-4 pointer-events-none z-10 p-3 rounded-lg bg-[#111E2D]/90 border border-[#172638] text-xs font-mono text-[#EDF4FA] space-y-1 shadow-lg">
        <div className="text-[10px] text-[#92A4B8]">ACTIVE MANEUVER: <span className="text-[#35D5E8] font-bold">{selectedManeuver}</span></div>
        <div>PROXIMITY TO OBSTACLE: <span className={obstacleDistance < 100 || evasionActive ? 'text-[#FF5964] font-bold' : 'text-[#3DDC97]'}>{obstacleDistance} M</span></div>
        <div className="flex items-center gap-2">
          <span>CORRIDOR STATUS:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${safetyStatus === 'Clear' && !evasionActive && !jammerActive ? 'bg-[#3DDC97]/20 text-[#3DDC97]' : safetyStatus === 'Caution' ? 'bg-[#F5B82E]/20 text-[#F5B82E]' : safetyStatus === 'Jammer Interference' ? 'bg-[#F5B82E]/20 text-[#F5B82E] animate-pulse' : 'bg-[#FF5964]/20 text-[#FF5964]'}`}>
            {evasionActive ? 'EVASION ACTIVE (OVERRIDE)' : safetyStatus}
          </span>
        </div>
        {windSpeed > 0 && <div className="text-[10px] text-[#35D5E8]">WIND DRIFT: {windSpeed} KN</div>}
      </div>
    </div>
  );
};
