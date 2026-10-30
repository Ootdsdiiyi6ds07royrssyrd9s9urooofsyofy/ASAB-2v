/**
 * ASAB | AEROLAB 3D - Interactive 3D Flight Simulator Engine
 * Features 6-DoF aerodynamic flight controls, runway, terrain, chase/cockpit cams, HUD instrumentation, and training scenarios.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { calculateAeroDynamics } from '../../utils/rules';

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

  // Flight simulation state
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

  // Mutable flight physics refs for 60Hz loop
  const flightState = useRef({
    x: 0,
    y: 0.5,
    z: -300,
    vx: 0,
    vy: 0,
    vz: 0,
    pitch: 0,
    roll: 0,
    yaw: 90,
    pitchRate: 0,
    rollRate: 0,
    yawRate: 0,
    throttle: 0,
    vtolMode: true,
    time: 0,
    windX: 0,
    windZ: 0,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Reset aircraft position
  const resetFlight = useCallback(() => {
    flightState.current = {
      x: 0,
      y: 0.5,
      z: -300,
      vx: 0,
      vy: 0,
      vz: 0,
      pitch: 0,
      roll: 0,
      yaw: 90,
      pitchRate: 0,
      rollRate: 0,
      yawRate: 0,
      throttle: 0,
      vtolMode: true,
      time: 0,
      windX: 0,
      windZ: 0,
    };
    setTelemetry({
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
  }, []);

  // Set scenario conditions
  useEffect(() => {
    if (activeScenario === 'Wind Disturbance') {
      flightState.current.windX = 8;
      flightState.current.windZ = 4;
    } else if (activeScenario === 'Level Flight') {
      flightState.current.y = 80;
      flightState.current.vz = 35;
      flightState.current.throttle = 65;
      flightState.current.vtolMode = false;
    } else {
      flightState.current.windX = 0;
      flightState.current.windZ = 0;
    }
  }, [activeScenario]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.code === 'Space') {
        setIsPaused((p) => !p);
      } else if (e.key.toLowerCase() === 'r') {
        resetFlight();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetFlight]);

  // Three.js simulator setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1424);
    scene.fog = new THREE.FogExp2(0x0a1424, 0.003);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.2, 2000);
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Lighting
    const hemi = new THREE.HemisphereLight(0xb0d4ff, 0x08101a, 1.2);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(100, 300, 100);
    scene.add(sun);

    // Terrain ground plane
    const groundGeo = new THREE.PlaneGeometry(3000, 3000, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0c1726,
      roughness: 0.8,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Runway
    const runwayGeo = new THREE.PlaneGeometry(30, 800);
    const runwayMat = new THREE.MeshStandardMaterial({
      color: 0x141f2d,
      roughness: 0.6,
      metalness: 0.3,
    });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(0, 0.05, 0);
    scene.add(runway);

    // Centerline markings
    for (let z = -350; z <= 350; z += 30) {
      const lineGeo = new THREE.PlaneGeometry(1.2, 16);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x35d5e8 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.08, z);
      scene.add(line);
    }

    // Sky dome horizon rings
    for (let r = 200; r <= 800; r += 200) {
      const ringGeo = new THREE.RingGeometry(r - 1, r + 1, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x172c44, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.1;
      scene.add(ring);
    }

    // Waypoint rings in sky
    const waypointGroup = new THREE.Group();
    const waypoints = [
      new THREE.Vector3(0, 45, -50),
      new THREE.Vector3(60, 70, 150),
      new THREE.Vector3(120, 90, 400),
      new THREE.Vector3(40, 80, 650),
      new THREE.Vector3(-80, 60, 400),
      new THREE.Vector3(0, 25, 100),
    ];
    waypoints.forEach((pt, i) => {
      const torusGeo = new THREE.TorusGeometry(12, 0.8, 12, 24);
      const torusMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x35d5e8 : 0x3ddc97,
        transparent: true,
        opacity: 0.75,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.position.copy(pt);
      waypointGroup.add(torus);
    });
    scene.add(waypointGroup);

    // Aircraft in flight
    const aircraftGroup = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.6, 0.4, 4.2, 16);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f2e42, roughness: 0.3, metalness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    aircraftGroup.add(body);

    const wingGeo = new THREE.BoxGeometry(6.8, 0.1, 1.2);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x172638, roughness: 0.3, metalness: 0.8 });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0.1, 0.2);
    aircraftGroup.add(wings);

    // VTOL Rotors
    const rotors: THREE.Mesh[] = [];
    for (const [x, z] of [[-1.8, 1.2], [1.8, 1.2], [-1.8, -1.2], [1.8, -1.2]]) {
      const rGeo = new THREE.BoxGeometry(1.6, 0.02, 0.12);
      const rMat = new THREE.MeshBasicMaterial({ color: 0x35d5e8 });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.set(x, 0.35, z);
      aircraftGroup.add(rMesh);
      rotors.push(rMesh);
    }

    scene.add(aircraftGroup);

    // Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Flight Dynamics & Render loop
    let animId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          animId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          animId = window.setTimeout(cb, 80);
        }
      };
      animId = window.setTimeout(poll, 5);
    }

    let lastTelemUpdate = 0;

    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.05);

      if (!isPaused) {
        const fs = flightState.current;
        fs.time += dt;

        // Process inputs
        const k = keysPressed.current;
        if (k['w']) fs.pitch = Math.max(-35, fs.pitch - 40 * dt); // pitch down
        else if (k['s']) fs.pitch = Math.min(35, fs.pitch + 40 * dt); // pitch up
        else fs.pitch *= 0.95; // auto-trim

        if (k['a']) fs.roll = Math.max(-45, fs.roll - 50 * dt); // roll left
        else if (k['d']) fs.roll = Math.min(45, fs.roll + 50 * dt); // roll right
        else fs.roll *= 0.93;

        if (k['q']) fs.yaw = (fs.yaw - 25 * dt + 360) % 360; // yaw left
        else if (k['e']) fs.yaw = (fs.yaw + 25 * dt) % 360; // yaw right

        // Throttle control via Shift / Ctrl
        if (k['shift']) fs.throttle = Math.min(100, fs.throttle + 40 * dt);
        if (k['control']) fs.throttle = Math.max(0, fs.throttle - 40 * dt);

        // Turn rate from banking
        fs.yaw = (fs.yaw + fs.roll * 0.4 * dt) % 360;

        // VTOL vs Forward flight transition logic
        const airspeed = Math.sqrt(fs.vx * fs.vx + fs.vz * fs.vz) * 3.6;
        if (airspeed > 60) {
          fs.vtolMode = false;
        } else if (airspeed < 35) {
          fs.vtolMode = true;
        }

        // Aerodynamics calculations
        const aero = calculateAeroDynamics(airspeed, fs.pitch, fs.roll, 28.5, 0, 0);

        // Forward thrust along heading
        const headingRad = (fs.yaw * Math.PI) / 180;
        const forwardThrust = (fs.throttle / 100) * 180; // Newtons
        const fAccel = forwardThrust / 28.5;

        // Velocities
        fs.vx += Math.sin(headingRad) * fAccel * dt;
        fs.vz += Math.cos(headingRad) * fAccel * dt;

        // Air drag damping
        fs.vx *= 0.99;
        fs.vz *= 0.99;

        // Vertical lift & gravity
        let vertThrust = 0;
        if (fs.vtolMode) {
          vertThrust = (fs.throttle / 100) * 350; // VTOL rotors
        }
        const totalLift = aero.liftNewtons + vertThrust;
        const netVertForce = totalLift - aero.gravityNewtons;
        fs.vy += (netVertForce / 28.5) * dt;

        // Apply velocities to positions
        fs.x += (fs.vx + fs.windX) * dt;
        fs.z += (fs.vz + fs.windZ) * dt;
        fs.y += fs.vy * dt;

        // Ground collision & terrain clearance
        if (fs.y < 0.5) {
          fs.y = 0.5;
          fs.vy = 0;
          fs.pitch = Math.max(0, fs.pitch);
          fs.roll = 0;
        }

        // Update 3D aircraft mesh position & attitude
        aircraftGroup.position.set(fs.x, fs.y, fs.z);
        aircraftGroup.rotation.y = headingRad;
        aircraftGroup.rotation.x = -(fs.pitch * Math.PI) / 180;
        aircraftGroup.rotation.z = -(fs.roll * Math.PI) / 180;

        // Spin VTOL rotors
        rotors.forEach((r, idx) => {
          r.rotation.y += (idx % 2 === 0 ? 1 : -1) * (fs.vtolMode ? 0.35 : 0.05);
        });

        // Camera tracking
        if (cameraMode === 'chase') {
          const camOffset = new THREE.Vector3(
            -Math.sin(headingRad) * 16,
            6,
            -Math.cos(headingRad) * 16
          );
          camera.position.copy(aircraftGroup.position).add(camOffset);
          camera.lookAt(aircraftGroup.position.clone().add(new THREE.Vector3(0, 1, 0)));
        } else if (cameraMode === 'cockpit') {
          const cockpitPos = aircraftGroup.position.clone().add(new THREE.Vector3(0, 0.4, 0.8));
          camera.position.copy(cockpitPos);
          const target = cockpitPos.clone().add(new THREE.Vector3(Math.sin(headingRad) * 10, 0, Math.cos(headingRad) * 10));
          camera.lookAt(target);
        } else {
          // Free look
          camera.position.set(fs.x + 30, fs.y + 40, fs.z + 50);
          camera.lookAt(aircraftGroup.position);
        }

        // Throttle UI telemetry state update (approx 10Hz)
        if (Date.now() - lastTelemUpdate > 100) {
          lastTelemUpdate = Date.now();
          const telemData: FlightTelemetryData = {
            airspeedKmh: Math.round(airspeed),
            altitudeM: Math.round(fs.y * 10),
            headingDeg: Math.round(fs.yaw),
            pitchDeg: Math.round(fs.pitch),
            rollDeg: Math.round(fs.roll),
            yawDeg: Math.round(fs.yaw),
            throttlePercent: Math.round(fs.throttle),
            vtolMode: fs.vtolMode,
            flightTimeSec: Math.round(fs.time),
            status:
              fs.y < 1
                ? fs.throttle > 20
                  ? 'Takeoff Roll'
                  : 'Pre-flight'
                : fs.vy > 1
                ? 'Climb'
                : 'Cruise',
            gForce: Number((1.0 + Math.abs(aero.verticalAcceleration) / 9.81).toFixed(2)),
          };
          setTelemetry(telemData);
          if (onTelemetryUpdate) onTelemetryUpdate(telemData);
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(loop);
      } else {
        animId = requestAnimationFrame(loop);
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [cameraMode, isPaused, onTelemetryUpdate]);

  return (
    <div className="relative w-full h-full bg-[#080D16] select-none overflow-hidden">
      {/* 3D Flight Canvas */}
      <div ref={mountRef} className="w-full h-full" data-testid="flight-simulator-canvas" />

      {/* Primary Flight Display (PFD) HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
        {/* Top HUD Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#111E2D]/85 border border-[#172638] text-xs font-mono text-[#EDF4FA]">
            <div>المهمة التدريبية: <span className="text-[#35D5E8] font-bold">{activeScenario}</span></div>
            <div className="w-px h-3 bg-[#172638]" />
            <div>
              النمط:{' '}
              <span className={telemetry.vtolMode ? 'text-[#F5B82E] font-bold' : 'text-[#3DDC97] font-bold'}>
                {telemetry.vtolMode ? 'رفع عمودي (VTOL)' : 'طيران أمامي مثبت الأجنحة'}
              </span>
            </div>
            <div className="w-px h-3 bg-[#172638]" />
            <div>قوة G: <span className="text-[#35D5E8] font-bold">{telemetry.gForce} G</span></div>
          </div>

          {/* Camera Selectors */}
          <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-lg bg-[#111E2D]/90 border border-[#172638]">
            <button
              onClick={() => setCameraMode('chase')}
              className={`px-2.5 py-1 text-xs font-mono rounded ${cameraMode === 'chase' ? 'bg-[#35D5E8] text-[#080D16] font-bold' : 'text-[#92A4B8] hover:text-[#EDF4FA]'}`}
            >
              كاميرا المطاردة
            </button>
            <button
              onClick={() => setCameraMode('cockpit')}
              className={`px-2.5 py-1 text-xs font-mono rounded ${cameraMode === 'cockpit' ? 'bg-[#35D5E8] text-[#080D16] font-bold' : 'text-[#92A4B8] hover:text-[#EDF4FA]'}`}
            >
              قمرة القيادة HUD
            </button>
            <button
              onClick={() => setCameraMode('free')}
              className={`px-2.5 py-1 text-xs font-mono rounded ${cameraMode === 'free' ? 'bg-[#35D5E8] text-[#080D16] font-bold' : 'text-[#92A4B8] hover:text-[#EDF4FA]'}`}
            >
              منظور خارجي
            </button>
          </div>
        </div>

        {/* Center Artificial Horizon & Pitch Ladder */}
        <div className="self-center flex items-center justify-center w-64 h-64 relative">
          <div
            className="w-48 h-48 border border-[#35D5E8]/30 rounded-full flex items-center justify-center relative transition-transform duration-75"
            style={{ transform: `rotate(${-telemetry.rollDeg}deg)` }}
          >
            {/* Horizon bar */}
            <div
              className="w-40 h-0.5 bg-[#35D5E8] transition-transform duration-75"
              style={{ transform: `translateY(${telemetry.pitchDeg * 2}px)` }}
            />
            {/* Pitch ladder marks */}
            <div className="absolute w-12 h-px bg-[#35D5E8]/50 -translate-y-6" />
            <div className="absolute w-12 h-px bg-[#35D5E8]/50 translate-y-6" />
          </div>

          {/* Fixed aircraft reticle in center */}
          <div className="absolute w-8 h-2 border-b-2 border-l-2 border-r-2 border-[#F5B82E]" />
          <div className="absolute w-2 h-2 rounded-full bg-[#F5B82E]" />
        </div>

        {/* Bottom Instruments & Controls Strip */}
        <div className="flex items-end justify-between">
          {/* Airspeed Gauge Tape */}
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-[#111E2D]/85 border border-[#172638] font-mono text-xs w-36">
            <div className="text-[10px] text-[#92A4B8]">السرعة الجوية</div>
            <div className="text-2xl font-bold text-[#35D5E8]">{telemetry.airspeedKmh} <span className="text-xs font-normal text-[#92A4B8]">كم/س</span></div>
            <div className="text-[10px] text-[#92A4B8]">
              الحالة:{' '}
              {telemetry.status === 'Pre-flight'
                ? 'جاهز للإقلاع'
                : telemetry.status === 'Takeoff Roll'
                ? 'تدحرج وتسارع'
                : telemetry.status === 'Climb'
                ? 'صعود جوي'
                : 'طيران مستقر'}
            </div>
          </div>

          {/* Heading Tape Center */}
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#111E2D]/85 border border-[#172638] font-mono text-xs">
            <div className="text-[10px] text-[#92A4B8]">بوصلة الاتجاه الجوي</div>
            <div className="text-lg font-bold text-[#EDF4FA] tracking-wider">{telemetry.headingDeg}°</div>
            <div className="text-[10px] text-[#3DDC97]">W / S: الميلان الرأسي | A / D: الدوران الجانبي | Q / E: الانعطاف</div>
          </div>

          {/* Altimeter & Throttle */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-[#111E2D]/85 border border-[#172638] font-mono text-xs w-36 text-right">
              <div className="text-[10px] text-[#92A4B8]">الارتفاع</div>
              <div className="text-2xl font-bold text-[#3DDC97]">{telemetry.altitudeM} <span className="text-xs font-normal text-[#92A4B8]">متر</span></div>
              <div className="text-[10px] text-[#92A4B8]">زاوية الميل: {telemetry.pitchDeg}°</div>
            </div>

            {/* Interactive Throttle Slider */}
            <div className="pointer-events-auto p-3 rounded-lg bg-[#111E2D]/90 border border-[#172638] flex flex-col items-center gap-1 font-mono text-xs">
              <div className="text-[10px] text-[#92A4B8]">الدفع (THROTTLE)</div>
              <input
                type="range"
                min="0"
                max="100"
                value={flightState.current.throttle}
                onChange={(e) => {
                  flightState.current.throttle = Number(e.target.value);
                  setTelemetry((prev) => ({ ...prev, throttlePercent: Number(e.target.value) }));
                }}
                className="h-24 w-4 appearance-none rounded bg-[#080D16] accent-[#35D5E8] cursor-pointer"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                aria-label="Throttle Control"
              />
              <div className="text-[#35D5E8] font-bold">{Math.round(flightState.current.throttle)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
