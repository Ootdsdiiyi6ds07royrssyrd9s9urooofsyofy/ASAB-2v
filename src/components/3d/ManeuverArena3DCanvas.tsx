/**
 * ASAB | AEROLAB 3D - Maneuver Training Arena & Obstacle Avoidance
 * Demonstrates 3D trajectory ribbon, obstacle proximity vectors, and safe corridor navigation.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ManeuverArenaProps {
  selectedManeuver?: string;
}

export const ManeuverArena3DCanvas: React.FC<ManeuverArenaProps> = ({
  selectedManeuver = 'Straight Flight',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [obstacleDistance, setObstacleDistance] = useState<number>(450);
  const [safetyStatus, setSafetyStatus] = useState<'Clear' | 'Caution' | 'Evasion Active'>('Clear');

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
    scene.background = new THREE.Color(0x080d16);
    scene.fog = new THREE.FogExp2(0x080d16, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    camera.position.set(25, 20, 35);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 4, 0);

    // Lights
    const hemi = new THREE.HemisphereLight(0xedf4fa, 0x080d16, 1.2);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0x35d5e8, 1.8);
    dir.position.set(20, 30, 20);
    scene.add(dir);

    // Grid Floor
    const grid = new THREE.GridHelper(100, 50, 0x35d5e8, 0x112233);
    grid.position.y = 0;
    scene.add(grid);

    // Virtual Obstacles (Pylons & Radar Threat Bubbles)
    const obstacles = [
      { pos: new THREE.Vector3(12, 0, 8), r: 4, h: 18 },
      { pos: new THREE.Vector3(-14, 0, -10), r: 5, h: 22 },
      { pos: new THREE.Vector3(0, 0, 18), r: 3.5, h: 14 },
    ];

    obstacles.forEach((obs) => {
      // Cylinder Pylon
      const cylGeo = new THREE.CylinderGeometry(0.8, 1.2, obs.h, 16);
      const cylMat = new THREE.MeshStandardMaterial({ color: 0xff5964, roughness: 0.3, metalness: 0.7 });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.position.set(obs.pos.x, obs.h / 2, obs.pos.z);
      scene.add(cyl);

      // Warning perimeter ring
      const ringGeo = new THREE.RingGeometry(obs.r - 0.1, obs.r + 0.1, 32);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xff5964, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(obs.pos.x, 0.05, obs.pos.z);
      scene.add(ring);
    });

    // Moving Drone
    const droneGroup = new THREE.Group();
    const droneGeo = new THREE.ConeGeometry(0.8, 2.2, 4);
    droneGeo.rotateX(Math.PI / 2);
    const droneMat = new THREE.MeshStandardMaterial({ color: 0x35d5e8, roughness: 0.2, metalness: 0.8 });
    const drone = new THREE.Mesh(droneGeo, droneMat);
    droneGroup.add(drone);
    scene.add(droneGroup);

    // Trajectory Ribbon Trail
    const maxTrailPoints = 80;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({ color: 0x35d5e8, transparent: true, opacity: 0.7 });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);

    const trailHistory: THREE.Vector3[] = [];

    // Animation Loop
    let animId = 0;
    let t = 0;

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

    const render = () => {
      controls.update();
      t += 0.02;

      // Trajectory paths based on maneuver
      let x = 0;
      let y = 6;
      let z = 0;
      let bank = 0;

      if (selectedManeuver === 'Gradual Turns' || selectedManeuver === 'Banking') {
        const rad = 20;
        x = Math.sin(t * 0.5) * rad;
        z = Math.cos(t * 0.5) * rad;
        y = 6 + Math.sin(t) * 2;
        bank = -0.4;
        droneGroup.rotation.y = t * 0.5 + Math.PI / 2;
      } else if (selectedManeuver === 'Obstacle Awareness') {
        // Weaving figure 8 around obstacles
        x = Math.sin(t) * 16;
        z = Math.sin(t * 2) * 12;
        y = 5 + Math.cos(t * 1.5) * 2;
        droneGroup.rotation.y = Math.atan2(Math.cos(t) * 16, Math.cos(t * 2) * 24);
        bank = Math.sin(t) * 0.35;
      } else {
        // Straight flight with altitude variation
        x = Math.sin(t * 0.2) * 4;
        z = ((t * 8) % 80) - 40;
        y = 6 + Math.sin(t * 0.8) * 1.5;
        droneGroup.rotation.y = 0;
      }

      droneGroup.position.set(x, y, z);
      droneGroup.rotation.z = bank;

      // Update trajectory trail
      trailHistory.push(new THREE.Vector3(x, y, z));
      if (trailHistory.length > maxTrailPoints) {
        trailHistory.shift();
      }
      for (let i = 0; i < trailHistory.length; i++) {
        trailPositions[i * 3] = trailHistory[i].x;
        trailPositions[i * 3 + 1] = trailHistory[i].y;
        trailPositions[i * 3 + 2] = trailHistory[i].z;
      }
      trailGeo.attributes.position.needsUpdate = true;

      // Check proximity to nearest obstacle
      let minObstacleDist = 999;
      obstacles.forEach((obs) => {
        const dx = x - obs.pos.x;
        const dz = z - obs.pos.z;
        const d = Math.sqrt(dx * dx + dz * dz) * 10;
        if (d < minObstacleDist) minObstacleDist = d;
      });

      setObstacleDistance(Math.round(minObstacleDist));
      if (minObstacleDist < 80) {
        setSafetyStatus('Evasion Active');
      } else if (minObstacleDist < 160) {
        setSafetyStatus('Caution');
      } else {
        setSafetyStatus('Clear');
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(render);
      } else {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(animId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedManeuver]);

  return (
    <div className="relative w-full h-full bg-[#080D16] select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full" data-testid="maneuver-arena-canvas" />

      {/* Maneuver HUD Metrics */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 p-3 rounded-lg bg-[#111E2D]/90 border border-[#172638] text-xs font-mono text-[#EDF4FA] space-y-1">
        <div className="text-[10px] text-[#92A4B8]">ACTIVE MANEUVER: <span className="text-[#35D5E8] font-bold">{selectedManeuver}</span></div>
        <div>PROXIMITY TO OBSTACLE: <span className={obstacleDistance < 100 ? 'text-[#FF5964] font-bold' : 'text-[#3DDC97]'}>{obstacleDistance} M</span></div>
        <div className="flex items-center gap-2">
          <span>SAFE CORRIDOR STATUS:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${safetyStatus === 'Clear' ? 'bg-[#3DDC97]/20 text-[#3DDC97]' : safetyStatus === 'Caution' ? 'bg-[#F5B82E]/20 text-[#F5B82E]' : 'bg-[#FF5964]/20 text-[#FF5964]'}`}>
            {safetyStatus}
          </span>
        </div>
      </div>
    </div>
  );
};
