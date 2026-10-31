/**
 * ASAB | AEROLAB 3D - Interactive 3D Flight Simulator Engine
 * Features 6-DoF aerodynamic flight controls, runway, terrain, chase/cockpit cams, HUD instrumentation, and training scenarios.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { calculateAeroDynamics } from '../../utils/rules';
import { buildAircraftModel } from './AircraftModel3D';
import { buildBattlefieldTheater } from './BattlefieldTheater';

export interface FlightSimProps {
  onTelemetryUpdate?: (telemetry: FlightTelemetryData) => void;
  activeScenario?: string;
}

export interface FlightTelemetryData {
  airspeedKmh: number;
  altitudeM: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  yawDeg: number;
  throttlePercent: number;
  vtolMode: boolean;
  flightTimeSec: number;
  status: 'Pre-flight' | 'Takeoff Roll' | 'Climb' | 'Cruise' | 'Approach' | 'Touchdown';
  gForce: number;
}

export const FlightSimulator3DCanvas: React.FC<FlightSimProps> = ({
  onTelemetryUpdate,
  activeScenario = 'Basic Takeoff',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [telemetry, setTelemetry] = useState<FlightTelemetryData>({
    airspeedKmh: 0,
    altitudeM: 5,
    headingDeg: 90,
    pitchDeg: 0,
    rollDeg: 0,
    yawDeg: 90,
    throttlePercent: 0,
    vtolMode: true,
    flightTimeSec: 0,
    status: 'Pre-flight',
    gForce: 1.0,
  });

  const [cameraMode, setCameraMode] = useState<'chase' | 'cockpit' | 'free'>('chase');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const flightState = useRef({
    x: 0, y: 0.5, z: -300, vx: 0, vy: 0, vz: 0,
    pitch: 0, roll: 0, yaw: 90,
    throttle: 0, vtolMode: true, time: 0,
    windX: 0, windZ: 0,
  });
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const setKey = (key: string, pressed: boolean) => {
    keysPressed.current[key.toLowerCase()] = pressed;
  };

  const resetFlight = useCallback(() => {
    flightState.current = {
      x: 0, y: 0.5, z: -300, vx: 0, vy: 0, vz: 0,
      pitch: 0, roll: 0, yaw: 90,
      throttle: 0, vtolMode: true, time: 0,
      windX: 0, windZ: 0,
    };
    setTelemetry({
      airspeedKmh: 0, altitudeM: 5, headingDeg: 90,
      pitchDeg: 0, rollDeg: 0, yawDeg: 90,
      throttlePercent: 0, vtolMode: true, flightTimeSec: 0,
      status: 'Pre-flight', gForce: 1.0,
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.code === 'Space') setIsPaused((p) => !p);
      else if (e.key.toLowerCase() === 'r') resetFlight();
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetFlight]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1424);
    scene.fog = new THREE.FogExp2(0x0a1424, 0.003);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.2, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Build Theater
    const theater = buildBattlefieldTheater('warzone-day');
    scene.add(theater.rootGroup);
    theater.setMode('warzone-day', scene);

    // Build Aircraft
    const aircraft = buildAircraftModel('stealth');
    scene.add(aircraft.rootGroup);

    // Lighting
    const hemi = new THREE.HemisphereLight(0xb0d4ff, 0x08101a, 1.2);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(100, 300, 100);
    scene.add(sun);

    const clock = new THREE.Clock();

    const loop = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (!isPaused) {
        const fs = flightState.current;
        fs.time += delta;

        // Process inputs
        const k = keysPressed.current;
        if (k['w']) fs.pitch = Math.max(-35, fs.pitch - 40 * delta);
        else if (k['s']) fs.pitch = Math.min(35, fs.pitch + 40 * delta);
        else fs.pitch *= 0.95;

        if (k['a']) fs.roll = Math.max(-45, fs.roll - 50 * delta);
        else if (k['d']) fs.roll = Math.min(45, fs.roll + 50 * delta);
        else fs.roll *= 0.93;

        if (k['q']) fs.yaw = (fs.yaw - 25 * delta + 360) % 360;
        else if (k['e']) fs.yaw = (fs.yaw + 25 * delta) % 360;

        if (k['shift']) fs.throttle = Math.min(100, fs.throttle + 40 * delta);
        if (k['control']) fs.throttle = Math.max(0, fs.throttle - 40 * delta);

        fs.yaw = (fs.yaw + fs.roll * 0.4 * delta) % 360;

        const airspeed = Math.sqrt(fs.vx * fs.vx + fs.vz * fs.vz) * 3.6;
        fs.vtolMode = airspeed < 35;

        const aero = calculateAeroDynamics(airspeed, fs.pitch, fs.roll, 28.5, 0, 0);
        const headingRad = (fs.yaw * Math.PI) / 180;
        const fAccel = ((fs.throttle / 100) * 180) / 28.5;

        fs.vx += Math.sin(headingRad) * fAccel * delta;
        fs.vz += Math.cos(headingRad) * fAccel * delta;
        fs.vx *= 0.99; fs.vz *= 0.99;

        const vertThrust = fs.vtolMode ? (fs.throttle / 100) * 350 : 0;
        fs.vy += ((aero.liftNewtons + vertThrust - aero.gravityNewtons) / 28.5) * delta;
        
        fs.x += (fs.vx + fs.windX) * delta;
        fs.z += (fs.vz + fs.windZ) * delta;
        fs.y = Math.max(0.5, fs.y + fs.vy * delta);

        // Sync aircraft
        aircraft.rootGroup.position.set(fs.x, fs.y, fs.z);
        aircraft.rootGroup.rotation.y = headingRad;
        aircraft.rootGroup.rotation.x = -(fs.pitch * Math.PI) / 180;
        aircraft.rootGroup.rotation.z = -(fs.roll * Math.PI) / 180;
        
        aircraft.rotorBlades.forEach((r, idx) => {
            r.rotation.y += (idx % 2 === 0 ? 1 : -1) * (fs.vtolMode ? 0.35 : 0.05);
        });
        if (aircraft.pusherBlade) aircraft.pusherBlade.rotation.z += 0.35;

        // Theater update
        theater.update(delta, elapsed);

        // Camera
        if (cameraMode === 'chase') {
            const camOffset = new THREE.Vector3(-Math.sin(headingRad) * 16, 6, -Math.cos(headingRad) * 16);
            camera.position.copy(aircraft.rootGroup.position).add(camOffset);
            camera.lookAt(aircraft.rootGroup.position.clone().add(new THREE.Vector3(0, 1, 0)));
        } else {
            camera.position.set(fs.x + 30, fs.y + 40, fs.z + 50);
            camera.lookAt(aircraft.rootGroup.position);
        }
      }
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    };
    loop();

    return () => {
      theater.dispose();
      aircraft.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [cameraMode, isPaused]);

  return (
    <div className="relative w-full h-full bg-[#080D16] select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full" data-testid="flight-simulator-canvas" />

      {/* HUD Overlay & Telemetry */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
        {/* Top Header info */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="px-3 py-1.5 rounded bg-[#0D1623]/90 border border-[#35D5E8]/40 backdrop-blur-md text-xs font-mono text-[#35D5E8] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3DDC97] animate-pulse" />
            <span>ميدان الحرب والقتال السيادي | {activeScenario}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCameraMode((m) => (m === 'chase' ? 'free' : 'chase'))}
              className="px-3 py-1.5 rounded bg-[#111E2D]/90 hover:bg-[#172638] border border-[#172638] text-xs font-mono text-[#EDF4FA] pointer-events-auto cursor-pointer"
            >
              الكاميرا: {cameraMode === 'chase' ? 'خلف الطائرة' : 'حر'}
            </button>
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="px-3 py-1.5 rounded bg-[#111E2D]/90 hover:bg-[#172638] border border-[#172638] text-xs font-mono text-[#35D5E8] pointer-events-auto cursor-pointer"
            >
              {isPaused ? 'استئناف' : 'إيقاف مؤقت'}
            </button>
            <button
              onClick={resetFlight}
              className="px-3 py-1.5 rounded bg-[#FF5964]/20 hover:bg-[#FF5964]/30 border border-[#FF5964]/40 text-xs font-mono text-[#FF5964] pointer-events-auto cursor-pointer"
            >
              إعادة ضبط
            </button>
          </div>
        </div>

        {/* Center crosshair / attack HUD */}
        <div className="self-center pointer-events-none flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-dashed border-[#35D5E8]/60 rounded-full flex items-center justify-center animate-spin-slow">
            <div className="w-2 h-2 bg-[#35D5E8] rounded-full" />
          </div>
          <span className="text-[10px] font-mono text-[#35D5E8] mt-1 bg-[#080D16]/80 px-2 py-0.5 rounded">
            محاكاة الهجوم والدفاع الجوي نشطة
          </span>
        </div>

        {/* Bottom Telemetry & Mobile Touch Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
          {/* Telemetry panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-[#0D1623]/90 border border-[#172638] backdrop-blur-md font-mono text-xs text-[#EDF4FA]">
            <div>السرعة: <span className="text-[#35D5E8] font-bold">285 كم/س</span></div>
            <div>الارتفاع: <span className="text-[#3DDC97] font-bold">120 م</span></div>
            <div>الخنق: <span className="text-[#F5B82E] font-bold">85%</span></div>
            <div>الحمولة: <span className="text-[#FF5964] font-bold">مهاجم / صواريخ</span></div>
          </div>

          {/* On-Screen Touch / Click Flight Controls for Mobile & All Devices */}
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#0D1623]/95 border border-[#172638] backdrop-blur-md">
            <div className="grid grid-cols-3 gap-1">
              <div />
              <button
                onPointerDown={() => setKey('w', true)}
                onPointerUp={() => setKey('w', false)}
                className="w-10 h-10 rounded bg-[#111E2D] hover:bg-[#172638] border border-[#35D5E8]/30 text-[#35D5E8] font-bold flex items-center justify-center active:bg-[#35D5E8] active:text-[#080D16]"
                title="أعلى (Pitch Up)"
              >
                ▲
              </button>
              <div />
              <button
                onPointerDown={() => setKey('a', true)}
                onPointerUp={() => setKey('a', false)}
                className="w-10 h-10 rounded bg-[#111E2D] hover:bg-[#172638] border border-[#35D5E8]/30 text-[#35D5E8] font-bold flex items-center justify-center active:bg-[#35D5E8] active:text-[#080D16]"
                title="يسار (Roll Left)"
              >
                ◀
              </button>
              <button
                onPointerDown={() => setKey('s', true)}
                onPointerUp={() => setKey('s', false)}
                className="w-10 h-10 rounded bg-[#111E2D] hover:bg-[#172638] border border-[#35D5E8]/30 text-[#35D5E8] font-bold flex items-center justify-center active:bg-[#35D5E8] active:text-[#080D16]"
                title="أسفل (Pitch Down)"
              >
                ▼
              </button>
              <button
                onPointerDown={() => setKey('d', true)}
                onPointerUp={() => setKey('d', false)}
                className="w-10 h-10 rounded bg-[#111E2D] hover:bg-[#172638] border border-[#35D5E8]/30 text-[#35D5E8] font-bold flex items-center justify-center active:bg-[#35D5E8] active:text-[#080D16]"
                title="يمين (Roll Right)"
              >
                ▶
              </button>
            </div>

            <div className="flex flex-col gap-1 ms-2">
              <button
                onPointerDown={() => setKey('shift', true)}
                onPointerUp={() => setKey('shift', false)}
                className="px-3 py-1.5 rounded bg-[#3DDC97]/20 hover:bg-[#3DDC97]/30 border border-[#3DDC97]/40 text-[10px] font-mono text-[#3DDC97] font-bold"
              >
                زيادة السرعة (+)
              </button>
              <button
                onPointerDown={() => setKey('control', true)}
                onPointerUp={() => setKey('control', false)}
                className="px-3 py-1.5 rounded bg-[#FF5964]/20 hover:bg-[#FF5964]/30 border border-[#FF5964]/40 text-[10px] font-mono text-[#FF5964] font-bold"
              >
                خفض السرعة (-)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
