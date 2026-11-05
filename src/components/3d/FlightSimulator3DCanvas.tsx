/**
 * ASAB | AEROLAB 3D - Interactive 3D Flight Simulator Engine
 * Features 6-DoF aerodynamic flight controls, runway, terrain, chase/cockpit cams, HUD instrumentation, and training scenarios.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useSimulation } from '../../context/SimulationContext';
import { useAssets } from '../../context/AssetContext';
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

type CamMode = 'chase' | 'cockpit' | 'free';
const CAM_ORDER: CamMode[] = ['chase', 'cockpit', 'free'];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const wrap360 = (v: number) => ((v % 360) + 360) % 360;
const smoothstep = (x: number, a: number, b: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const INITIAL_STATE = () => ({
  x: 0, y: 0.5, z: -300, vx: 0, vy: 0, vz: 0,
  pitch: 0, roll: 0, yaw: 90,
  throttle: 0, vtolMode: true, time: 0,
  windX: 0, windZ: 0,
  onGround: true, touchdownTimer: 0, hardLanding: 0, lastVy: 0, gForce: 1,
});

/** Virtual analog stick for touch devices (up = nose up, right = bank right). */
const VirtualStick: React.FC<{ onChange: (x: number, y: number) => void; label: string }> = ({ onChange, label }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const R = 42;
  const update = (e: React.PointerEvent) => {
    const rect = baseRef.current!.getBoundingClientRect();
    let dx = e.clientX - (rect.left + rect.width / 2);
    let dy = e.clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > R) { dx = (dx / len) * R; dy = (dy / len) * R; }
    setKnob({ x: dx, y: dy });
    onChange(dx / R, -dy / R);
  };
  const end = () => { setKnob({ x: 0, y: 0 }); onChange(0, 0); };
  return (
    <div
      ref={baseRef}
      aria-label={label}
      onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); update(e); }}
      onPointerMove={(e) => { if (e.buttons || e.pressure > 0) update(e); }}
      onPointerUp={end}
      onPointerCancel={end}
      style={{ touchAction: 'none' }}
      className="relative w-28 h-28 rounded-full bg-[#1a140e]/80 border border-[#9a6a3a]/40 backdrop-blur-md pointer-events-auto"
    >
      <div className="absolute inset-3 rounded-full border border-dashed border-[#9a6a3a]/25" />
      <div
        className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-[#e6cfa6] to-[#b5793f] shadow-lg shadow-black/50"
        style={{ left: `calc(50% - 24px + ${knob.x}px)`, top: `calc(50% - 24px + ${knob.y}px)` }}
      />
    </div>
  );
};

/** Vertical throttle slider (touch). */
const ThrottleSlider: React.FC<{ value: number; onChange: (pct: number) => void; label: string }> = ({ value, onChange, label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const set = (e: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    onChange(clamp(((rect.bottom - e.clientY) / rect.height) * 100, 0, 100));
  };
  return (
    <div className="flex flex-col items-center gap-1 pointer-events-auto">
      <span className="text-[10px] font-mono text-[#b9a58c]">{label}</span>
      <div
        ref={ref}
        onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); set(e); }}
        onPointerMove={(e) => { if (e.buttons || e.pressure > 0) set(e); }}
        style={{ touchAction: 'none' }}
        className="relative w-9 h-28 rounded-full bg-[#1a140e]/80 border border-[#9a6a3a]/40 backdrop-blur-md overflow-hidden"
      >
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#b5793f] to-[#9a6a3a]" style={{ height: `${value}%`, opacity: 0.85 }} />
        <div className="absolute inset-x-0 text-center text-[10px] font-mono font-bold text-[#f6ecdd] top-1/2 -translate-y-1/2 mix-blend-difference">
          {Math.round(value)}
        </div>
      </div>
    </div>
  );
};

/** Artificial horizon (SVG) */
const Horizon: React.FC<{ pitch: number; roll: number }> = ({ pitch, roll }) => (
  <svg viewBox="-60 -60 120 120" className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-lg" aria-hidden>
    <defs>
      <clipPath id="hz-clip"><circle r="56" /></clipPath>
    </defs>
    <g clipPath="url(#hz-clip)">
      <g transform={`rotate(${-roll}) translate(0 ${pitch * 2.2})`}>
        <rect x="-200" y="-300" width="400" height="300" fill="#6b4c33" />
        <rect x="-200" y="0" width="400" height="300" fill="#2a1d12" />
        <line x1="-200" y1="0" x2="200" y2="0" stroke="#e6cfa6" strokeWidth="1.5" />
        {[-20, -10, 10, 20].map((d) => (
          <g key={d}>
            <line x1={d % 20 === 0 ? -22 : -12} y1={-d * 2.2} x2={d % 20 === 0 ? 22 : 12} y2={-d * 2.2} stroke="#e6cfa6" strokeWidth="1" opacity="0.8" />
          </g>
        ))}
      </g>
    </g>
    <circle r="56" fill="none" stroke="#9a6a3a" strokeOpacity="0.6" strokeWidth="1.5" />
    <path d="M-18 0 H-6 M6 0 H18 M0 -3 V3" stroke="#f5b82e" strokeWidth="2" fill="none" />
    <path d="M0 -56 l-4 -7 h8 z" fill="#9a6a3a" transform={`rotate(${-roll})`} />
  </svg>
);

export const FlightSimulator3DCanvas: React.FC<FlightSimProps> = ({
  onTelemetryUpdate,
  activeScenario = 'Basic Takeoff',
}) => {
  const { settings } = useSimulation();
  const { urls } = useAssets();
  const customAircraftUrl = urls.aircraft;
  const isArabic = settings.language === 'ar';
  const mountRef = useRef<HTMLDivElement>(null);
  const [telemetry, setTelemetry] = useState<FlightTelemetryData>({
    airspeedKmh: 0, altitudeM: 0, headingDeg: 270, pitchDeg: 0, rollDeg: 0, yawDeg: 90,
    throttlePercent: 0, vtolMode: true, flightTimeSec: 0, status: 'Pre-flight', gForce: 1.0,
  });
  const [warning, setWarning] = useState<string>('');
  const [cameraMode, setCameraMode] = useState<CamMode>('chase');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const flightState = useRef(INITIAL_STATE());
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const stick = useRef({ x: 0, y: 0 });
  const camModeRef = useRef<CamMode>('chase');
  const pausedRef = useRef(false);
  const callbackRef = useRef(onTelemetryUpdate);
  const customAircraftRef = useRef<THREE.Object3D | null>(null);
  useEffect(() => { callbackRef.current = onTelemetryUpdate; }, [onTelemetryUpdate]);
  useEffect(() => { camModeRef.current = cameraMode; }, [cameraMode]);
  useEffect(() => { pausedRef.current = isPaused; }, [isPaused]);

  const setKey = (key: string, pressed: boolean) => { keysPressed.current[key.toLowerCase()] = pressed; };
  const cycleCamera = useCallback(() => {
    setCameraMode((m) => CAM_ORDER[(CAM_ORDER.indexOf(m) + 1) % CAM_ORDER.length]);
  }, []);

  const resetFlight = useCallback(() => {
    flightState.current = INITIAL_STATE();
    stick.current = { x: 0, y: 0 };
    setWarning('');
  }, []);

  useEffect(() => {
    const isTyping = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA');
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;
      if (e.code === 'Space') { e.preventDefault(); setIsPaused((p) => !p); }
      else if (key === 'r') resetFlight();
      else if (key === 'c') cycleCamera();
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = false; };
    const clearKeys = () => { keysPressed.current = {}; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearKeys);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, [resetFlight, cycleCamera]);

  // Scene is created ONCE (no more rebuild on pause / camera change).
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const q = settings.quality;
    const maxDpr = q === 'low' ? 1 : q === 'medium' ? 1.5 : window.innerWidth < 768 ? 1.75 : 2;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1424);
    scene.fog = new THREE.FogExp2(0x0a1424, 0.003);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.2, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: q !== 'low', powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.enabled = false;
    orbit.minDistance = 8;
    orbit.maxDistance = 200;

    const handleResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => handleResize()) : null;
    resizeObs?.observe(container);

    const theater = buildBattlefieldTheater('warzone-day');
    scene.add(theater.rootGroup);
    theater.setMode('warzone-day', scene);

    const aircraft = buildAircraftModel('stealth');
    aircraft.rootGroup.rotation.order = 'YXZ'; // yaw -> pitch -> roll, so pitch/roll are in the aircraft's own frame
    scene.add(aircraft.rootGroup);
    if (customAircraftUrl) {
      aircraft.rootGroup.visible = false;
      new GLTFLoader().load(customAircraftUrl, (gltf) => {
        const custom = gltf.scene;
        custom.scale.setScalar(1);
        custom.position.y = 0.35;
        custom.traverse((child) => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; } });
        customAircraftRef.current = custom;
        scene.add(custom);
      });
    }

    scene.add(new THREE.HemisphereLight(0xb0d4ff, 0x08101a, 1.2));
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(100, 300, 100);
    scene.add(sun);

    // ---- Engine exhaust trail (ring buffer of additive points) ----
    const TRAIL_N = q === 'low' ? 60 : q === 'medium' ? 110 : 180;
    const trailPos = new Float32Array(TRAIL_N * 3);
    const trailCol = new Float32Array(TRAIL_N * 3);
    const trailAge = new Float32Array(TRAIL_N).fill(99);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));
    const trailMat = new THREE.PointsMaterial({
      size: 1.1, sizeAttenuation: true, vertexColors: true, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const trail = new THREE.Points(trailGeo, trailMat);
    trail.frustumCulled = false;
    scene.add(trail);
    let trailHead = 0;
    let trailAcc = 0;

    // ---- helpers (allocated once) ----
    const raycaster = new THREE.Raycaster();
    const rayOrigin = new THREE.Vector3();
    const rayDir = new THREE.Vector3(0, -1, 0);
    const tmpV = new THREE.Vector3();
    const camTarget = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const flipY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    let groundH = 0;
    let groundTimer = 0;
    let lastMode: CamMode = 'chase';
    let camInit = false;
    let telemetryTimer = 0;
    let lastWarning = '';

    const sampleGround = (x: number, z: number) => {
      rayOrigin.set(x, 1500, z);
      raycaster.set(rayOrigin, rayDir);
      const hit = raycaster.intersectObject(theater.terrainMesh, false)[0];
      return hit ? hit.point.y : 0;
    };

    const clock = new THREE.Clock();
    let rafId = 0;
    let disposed = false;

    const loop = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(loop);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const fs = flightState.current;
      const paused = pausedRef.current;

      if (!paused) {
        fs.time += delta;
        const k = keysPressed.current;

        // ---- Inputs (keyboard + analog stick). Positive = nose up / bank right / yaw right ----
        const pitchIn = clamp((k['s'] ? 1 : 0) - (k['w'] ? 1 : 0) + stick.current.y, -1, 1);
        const rollIn = clamp((k['d'] ? 1 : 0) - (k['a'] ? 1 : 0) + stick.current.x, -1, 1);
        const yawIn = (k['e'] ? 1 : 0) - (k['q'] ? 1 : 0);
        const decay = Math.pow(0.95, delta * 60);

        if (pitchIn !== 0) fs.pitch = clamp(fs.pitch + (pitchIn * 35 - fs.pitch) * Math.min(1, 3 * delta), -35, 35);
        else fs.pitch *= decay;
        if (rollIn !== 0) fs.roll = clamp(fs.roll + (rollIn * 45 - fs.roll) * Math.min(1, 3 * delta), -45, 45);
        else fs.roll *= Math.pow(0.93, delta * 60);

        if (k['shift']) fs.throttle = Math.min(100, fs.throttle + 40 * delta);
        if (k['control']) fs.throttle = Math.max(0, fs.throttle - 40 * delta);

        // Heading: increasing yaw = turning LEFT in this frame, so bank-right / yaw-right DEcrease it.
        fs.yaw = wrap360(fs.yaw - yawIn * 25 * delta - fs.roll * 0.45 * delta);

        const speedMs = Math.hypot(fs.vx, fs.vz);
        const airspeed = speedMs * 3.6;
        const wing = smoothstep(speedMs, 22, 32);        // 0 = pure VTOL, 1 = wing-borne
        fs.vtolMode = wing < 0.5;
        const headingRad = (fs.yaw * Math.PI) / 180;
        const pitchRad = (fs.pitch * Math.PI) / 180;
        const aero = calculateAeroDynamics(airspeed, fs.pitch, fs.roll, 28.5, 0, 0);

        // Horizontal: thrust (weak in hover, full in forward flight) minus quadratic drag
        const thrustAcc = ((fs.throttle / 100) * 180 / 28.5) * (0.3 + 0.7 * wing);
        let ax = Math.sin(headingRad) * thrustAcc;
        let az = Math.cos(headingRad) * thrustAcc;
        if (speedMs > 0.01) {
          const dragAcc = (aero.dragNewtons / 28.5) + 0.05 * speedMs;
          ax -= (fs.vx / speedMs) * dragAcc;
          az -= (fs.vz / speedMs) * dragAcc;
        }
        fs.vx += ax * delta; fs.vz += az * delta;
        if (fs.onGround) {
          const fr = Math.max(0, 1 - 0.6 * delta);
          fs.vx *= fr; fs.vz *= fr;
        }

        // Vertical: thrust-borne (VTOL) blended with attitude-following (wing-borne)
        const vtolAcc = ((fs.throttle / 100) * 350 - aero.gravityNewtons) / 28.5;
        fs.vy += vtolAcc * (1 - wing) * delta;
        fs.vy -= fs.vy * (1 - wing) * 0.5 * delta;                    // hover damping
        const vyTarget = Math.sin(pitchRad) * speedMs * 0.9 * Math.cos((fs.roll * Math.PI) / 180);
        fs.vy += (vyTarget - fs.vy) * wing * Math.min(1, 2 * delta);

        fs.x += (fs.vx + fs.windX) * delta;
        fs.z += (fs.vz + fs.windZ) * delta;
        fs.y += fs.vy * delta;

        // Terrain collision (terrain sampled at ~8 Hz, and only when low)
        groundTimer += delta;
        if (groundTimer > 0.12 && fs.y < 120) { groundH = sampleGround(fs.x, fs.z); groundTimer = 0; }
        const floorY = groundH + 0.5;
        fs.onGround = false;
        if (fs.y <= floorY) {
          if (fs.vy < -6) { fs.hardLanding = 3; }
          else if (fs.lastVy < -1.2 && airspeedOk(fs)) { fs.touchdownTimer = 3; }
          fs.y = floorY;
          if (fs.vy < 0) fs.vy = 0;
          fs.onGround = true;
          fs.pitch *= 0.9; // wheels settle
        }
        const ay = (fs.vy - fs.lastVy) / Math.max(delta, 1e-3);
        fs.lastVy = fs.vy;
        const gTarget = clamp((1 + ay / 9.81) / Math.max(0.5, Math.cos((fs.roll * Math.PI) / 180)), -2, 6);
        fs.gForce += (gTarget - fs.gForce) * Math.min(1, 4 * delta);
        fs.touchdownTimer = Math.max(0, fs.touchdownTimer - delta);
        fs.hardLanding = Math.max(0, fs.hardLanding - delta);

        // ---- Sync aircraft ----
        aircraft.rootGroup.position.set(fs.x, fs.y, fs.z);
        aircraft.rootGroup.rotation.y = headingRad;
        aircraft.rootGroup.rotation.x = -pitchRad;
        aircraft.rootGroup.rotation.z = (fs.roll * Math.PI) / 180;
        aircraft.rootGroup.updateMatrixWorld(true);
        if (customAircraftRef.current) {
          customAircraftRef.current.position.set(fs.x, fs.y + 0.35, fs.z);
          customAircraftRef.current.rotation.order = 'YXZ';
          customAircraftRef.current.rotation.y = headingRad;
          customAircraftRef.current.rotation.x = -pitchRad;
          customAircraftRef.current.rotation.z = (fs.roll * Math.PI) / 180;
        }

        const spin = 0.12 + (fs.throttle / 100) * 0.5;
        aircraft.rotorBlades.forEach((r, idx) => {
          r.rotation.y += (idx % 2 === 0 ? 1 : -1) * (fs.vtolMode ? spin : 0.05);
        });
        if (aircraft.pusherBlade) aircraft.pusherBlade.rotation.z += 0.15 + (fs.throttle / 100) * 0.5;

        theater.update(delta, elapsed);

        // ---- Exhaust trail ----
        for (let i = 0; i < TRAIL_N; i++) trailAge[i] += delta;
        trailAcc += delta;
        if (fs.throttle > 8 && trailAcc > 0.018) {
          trailAcc = 0;
          tmpV.set(0, 0.1, -2.6).applyQuaternion(aircraft.rootGroup.quaternion).add(aircraft.rootGroup.position);
          trailPos[trailHead * 3] = tmpV.x; trailPos[trailHead * 3 + 1] = tmpV.y; trailPos[trailHead * 3 + 2] = tmpV.z;
          trailAge[trailHead] = 0;
          trailHead = (trailHead + 1) % TRAIL_N;
        }
        const heat = 0.25 + fs.throttle / 140;
        for (let i = 0; i < TRAIL_N; i++) {
          const f = Math.max(0, 1 - trailAge[i] / 1.4) * heat;
          trailCol[i * 3] = 0.9 * f; trailCol[i * 3 + 1] = 0.62 * f; trailCol[i * 3 + 2] = 0.3 * f;
        }
        trailGeo.attributes.position.needsUpdate = true;
        trailGeo.attributes.color.needsUpdate = true;

        // ---- Warnings ----
        let w = '';
        const agl = fs.y - groundH;
        if (fs.hardLanding > 0) w = isArabicRef.current ? 'هبوط عنيف' : 'HARD LANDING';
        else if (!fs.vtolMode && agl < 30 && fs.vy < -4) w = isArabicRef.current ? 'ارفع المقدمة!' : 'PULL UP';
        else if (!fs.onGround && wing > 0.05 && wing < 0.6 && fs.vy < -3) w = isArabicRef.current ? 'خطر الانهيار' : 'STALL';
        else if (fs.touchdownTimer > 0) w = isArabicRef.current ? 'لمس الأرض' : 'TOUCHDOWN';
        if (w !== lastWarning) { lastWarning = w; setWarning(w); }
      }

      // ---- Camera ----
      const mode = camModeRef.current;
      if (mode !== lastMode || !camInit) {
        camInit = true;
        orbit.enabled = mode === 'free';
        aircraft.rootGroup.visible = mode !== 'cockpit';
        if (mode === 'free') {
          camera.position.set(fs.x + 30, fs.y + 20, fs.z + 40);
        } else if (mode === 'chase') {
          const h = (fs.yaw * Math.PI) / 180;
          camera.position.set(fs.x - Math.sin(h) * 14, fs.y + 5, fs.z - Math.cos(h) * 14);
          lookTarget.set(fs.x, fs.y + 1, fs.z);
        }
        lastMode = mode;
      }
      const hRad = (fs.yaw * Math.PI) / 180;
      const speedMs = Math.hypot(fs.vx, fs.vz);
      if (mode === 'chase') {
        camTarget.set(fs.x - Math.sin(hRad) * 14, fs.y + 5 + fs.pitch * 0.05, fs.z - Math.cos(hRad) * 14);
        camera.position.lerp(camTarget, 1 - Math.exp(-5 * delta));
        tmpV.set(fs.x + Math.sin(hRad) * 8, fs.y + 1.5, fs.z + Math.cos(hRad) * 8);
        lookTarget.lerp(tmpV, 1 - Math.exp(-8 * delta));
        camera.lookAt(lookTarget);
      } else if (mode === 'cockpit') {
        tmpV.set(0, 0.55, 1.3).applyQuaternion(aircraft.rootGroup.quaternion).add(aircraft.rootGroup.position);
        camera.position.copy(tmpV);
        camera.quaternion.copy(aircraft.rootGroup.quaternion).multiply(flipY);
      } else {
        orbit.target.set(fs.x, fs.y, fs.z);
        orbit.update();
      }
      const fovTarget = mode === 'free' ? 55 : 58 + clamp(speedMs * 0.15, 0, 14);
      if (Math.abs(camera.fov - fovTarget) > 0.05) {
        camera.fov += (fovTarget - camera.fov) * Math.min(1, 3 * delta);
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);

      // ---- Telemetry (10 Hz) ----
      telemetryTimer += delta;
      if (telemetryTimer > 0.1) {
        telemetryTimer = 0;
        const sp = Math.hypot(fs.vx, fs.vz) * 3.6;
        const agl = Math.max(0, fs.y - groundH - 0.5);
        let status: FlightTelemetryData['status'] = 'Cruise';
        if (fs.touchdownTimer > 0) status = 'Touchdown';
        else if (fs.onGround) status = sp > 4 ? 'Takeoff Roll' : 'Pre-flight';
        else if (fs.vy > 1.5) status = 'Climb';
        else if (fs.vy < -1.5 && agl < 150) status = 'Approach';
        const data: FlightTelemetryData = {
          airspeedKmh: Math.round(sp),
          altitudeM: Math.round(agl),
          headingDeg: Math.round(wrap360(360 - fs.yaw)),
          pitchDeg: Number(fs.pitch.toFixed(1)),
          rollDeg: Number(fs.roll.toFixed(1)),
          yawDeg: Math.round(fs.yaw),
          throttlePercent: Math.round(fs.throttle),
          vtolMode: fs.vtolMode,
          flightTimeSec: Math.floor(fs.time),
          status,
          gForce: Number(fs.gForce.toFixed(1)),
        };
        setTelemetry(data);
        callbackRef.current?.(data);
      }
    };
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObs?.disconnect();
      orbit.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      theater.dispose();
      aircraft.dispose();
      if (customAircraftRef.current) {
        customAircraftRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => material.dispose());
          }
        });
        customAircraftRef.current = null;
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.quality, customAircraftUrl]);

  const isArabicRef = useRef(isArabic);
  useEffect(() => { isArabicRef.current = isArabic; }, [isArabic]);

  const camLabel = (m: CamMode) =>
    isArabic ? (m === 'chase' ? 'خلف الطائرة' : m === 'cockpit' ? 'قمرة القيادة' : 'حرة') : m === 'chase' ? 'CHASE' : m === 'cockpit' ? 'COCKPIT' : 'FREE';
  const statusLabel: Record<FlightTelemetryData['status'], [string, string]> = {
    'Pre-flight': ['جاهزة للإقلاع', 'PRE-FLIGHT'],
    'Takeoff Roll': ['جري الإقلاع', 'TAKEOFF ROLL'],
    Climb: ['صعود', 'CLIMB'],
    Cruise: ['تحليق', 'CRUISE'],
    Approach: ['اقتراب', 'APPROACH'],
    Touchdown: ['لمس الأرض', 'TOUCHDOWN'],
  };
  const t = telemetry;
  const cell = 'flex flex-col leading-tight';
  const lbl = 'text-[10px] text-[#b9a58c]';

  return (
    <div className="relative w-full h-full bg-[#120e0a] select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full" data-testid="flight-simulator-canvas" />

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-5">
        {/* Top bar */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="px-3 py-1.5 rounded bg-[#1a140e]/90 border border-[#9a6a3a]/40 backdrop-blur-md text-[11px] sm:text-xs font-mono text-[#9a6a3a] flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-[#f5b82e]' : 'bg-[#8fc46a] animate-pulse'}`} />
            <span className="truncate max-w-[46vw] sm:max-w-none">{activeScenario}</span>
            <span className="text-[#b9a58c]">· {statusLabel[t.status][isArabic ? 0 : 1]}</span>
          </div>
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button onClick={cycleCamera} className="px-2.5 py-1.5 rounded bg-[#231a12]/90 border border-[#32261b] text-[11px] font-mono text-[#f6ecdd]">
              📷 {camLabel(cameraMode)}
            </button>
            <button onClick={() => setIsPaused((p) => !p)} className="px-2.5 py-1.5 rounded bg-[#231a12]/90 border border-[#32261b] text-[11px] font-mono text-[#9a6a3a]">
              {isPaused ? (isArabic ? 'استئناف' : 'RESUME') : (isArabic ? 'إيقاف' : 'PAUSE')}
            </button>
            <button onClick={resetFlight} className="px-2.5 py-1.5 rounded bg-[#e8584a]/20 border border-[#e8584a]/40 text-[11px] font-mono text-[#e8584a]">
              {isArabic ? 'إعادة' : 'RESET'}
            </button>
          </div>
        </div>

        {/* Centre: warnings + instruments */}
        <div className="flex items-center justify-between gap-2">
          <div className="p-2 rounded-lg bg-[#1a140e]/75 border border-[#32261b] font-mono text-xs text-[#f6ecdd] backdrop-blur-sm">
            <div className={cell}><span className={lbl}>{isArabic ? 'السرعة كم/س' : 'السرعة km/h'}</span><span className="text-lg font-bold text-[#9a6a3a] tabular-nums">{t.airspeedKmh}</span></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            {warning && (
              <div className="px-3 py-1 rounded bg-[#e8584a]/90 text-[#120e0a] text-xs font-bold font-mono animate-pulse">⚠ {warning}</div>
            )}
            <Horizon pitch={t.pitchDeg} roll={t.rollDeg} />
            <div className="px-2 py-0.5 rounded bg-[#1a140e]/80 border border-[#32261b] text-[11px] font-mono text-[#9a6a3a] tabular-nums">
              {String(t.headingDeg).padStart(3, '0')}° · {t.vtolMode ? 'VTOL' : (isArabic ? 'أجنحة' : 'WING')}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#1a140e]/75 border border-[#32261b] font-mono text-xs text-[#f6ecdd] backdrop-blur-sm">
            <div className={cell}><span className={lbl}>{isArabic ? 'الارتفاع م' : 'ALT m'}</span><span className="text-lg font-bold text-[#8fc46a] tabular-nums">{t.altitudeM}</span></div>
          </div>
        </div>

        {/* Bottom: throttle / telemetry / stick */}
        <div className="flex items-end justify-between gap-2">
          <div className="pointer-coarse:flex hidden">
            <ThrottleSlider
              label={isArabic ? 'الدفع' : 'THR'}
              value={t.throttlePercent}
              onChange={(p) => { flightState.current.throttle = p; setTelemetry((s) => ({ ...s, throttlePercent: Math.round(p) })); }}
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-1 p-2.5 rounded-lg bg-[#1a140e]/90 border border-[#32261b] backdrop-blur-md font-mono text-xs text-[#f6ecdd] pointer-events-auto">
            <div className={cell}><span className={lbl}>{isArabic ? 'الدفع' : 'THROTTLE'}</span><b className="text-[#f5b82e] tabular-nums">{t.throttlePercent}%</b></div>
            <div className={cell}><span className={lbl}>G</span><b className="text-[#9a6a3a] tabular-nums">{t.gForce.toFixed(1)}</b></div>
            <div className={cell}><span className={lbl}>{isArabic ? 'الميل' : 'PITCH'}</span><b className="tabular-nums">{t.pitchDeg}°</b></div>
            <div className={`${cell} hidden sm:flex`}><span className={lbl}>{isArabic ? 'الانحراف' : 'ROLL'}</span><b className="tabular-nums">{t.rollDeg}°</b></div>
            <div className={`${cell} hidden sm:flex`}><span className={lbl}>{isArabic ? 'الزمن' : 'TIME'}</span><b className="tabular-nums">{Math.floor(t.flightTimeSec / 60)}:{String(t.flightTimeSec % 60).padStart(2, '0')}</b></div>
            <div className={`${cell} hidden sm:flex`}><span className={lbl}>{isArabic ? 'الحالة' : 'الحالة'}</span><b className="text-[#8fc46a]">{statusLabel[t.status][isArabic ? 0 : 1]}</b></div>
          </div>

          <div className="pointer-coarse:flex hidden">
            <VirtualStick
              label="flight stick"
              onChange={(x, y) => { stick.current = { x, y }; }}
            />
          </div>
          <div className="pointer-coarse:hidden hidden md:flex flex-col gap-1 p-2 rounded-lg bg-[#1a140e]/80 border border-[#32261b] text-[10px] font-mono text-[#b9a58c]">
            <span>W/S {isArabic ? 'ميل' : 'pitch'} · A/D {isArabic ? 'انحراف' : 'bank'} · Q/E {isArabic ? 'دفة' : 'yaw'}</span>
            <span>Shift/Ctrl {isArabic ? 'الدفع' : 'throttle'} · C {isArabic ? 'الكاميرا' : 'camera'} · Space {isArabic ? 'إيقاف' : 'pause'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function airspeedOk(fs: { vx: number; vz: number }) {
  return Math.hypot(fs.vx, fs.vz) > 0.5;
}
