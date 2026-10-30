/**
 * ASAB | AEROLAB 3D - Interactive 3D Aircraft Studio Viewport
 * Implements orbit controls, exploded view damping, component raycasting, and studio lighting.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildAircraftModel, AircraftMeshPart } from './AircraftModel3D';
import { useSimulation } from '../../context/SimulationContext';

export interface AircraftStudioProps {
  showGrid?: boolean;
  showWireframe?: boolean;
  isolatedMode?: boolean;
  measurementMode?: boolean;
}

export const AircraftStudio3DCanvas: React.FC<AircraftStudioProps> = ({
  showGrid = true,
  showWireframe = false,
  isolatedMode = false,
  measurementMode = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    selectedComponentId,
    selectComponent,
    explodeFactor,
    cameraPreset,
  } = useSimulation();

  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);

  // References to keep mutable three.js objects outside React renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const aircraftDataRef = useRef<ReturnType<typeof buildAircraftModel> | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const measurementGroupRef = useRef<THREE.Group | null>(null);

  // Target camera positions for smooth damping transitions
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(3.2, 2.2, 4.0));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.6, 0));
  const currentExplode = useRef<number>(0);

  // Handle camera presets
  useEffect(() => {
    if (!controlsRef.current) return;
    switch (cameraPreset) {
      case 'front':
        targetCamPos.current.set(0, 0.6, 5.0);
        targetLookAt.current.set(0, 0.6, 0);
        break;
      case 'side':
        targetCamPos.current.set(-5.5, 0.6, 0);
        targetLookAt.current.set(0, 0.6, 0);
        break;
      case 'top':
        targetCamPos.current.set(0, 6.0, 0.01);
        targetLookAt.current.set(0, 0.6, 0);
        break;
      case 'bottom':
        targetCamPos.current.set(0, -4.5, 0.01);
        targetLookAt.current.set(0, 0.6, 0);
        break;
      case 'iso':
        targetCamPos.current.set(3.4, 2.4, 3.8);
        targetLookAt.current.set(0, 0.6, 0);
        break;
      case 'reset':
        targetCamPos.current.set(3.2, 2.0, 4.0);
        targetLookAt.current.set(0, 0.6, 0);
        break;
    }
  }, [cameraPreset]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
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

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080d16);
    scene.fog = new THREE.FogExp2(0x080d16, 0.025);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.copy(targetCamPos.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio Environment map
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      // Fallback
    }

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 25;
    controls.minDistance = 0.8;
    controls.target.copy(targetLookAt.current);
    controlsRef.current = controls;

    // Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xedf4fa, 0x080d16, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x35d5e8, 1.8);
    rimLight.position.set(-6, 3, -6);
    scene.add(rimLight);

    const underGlow = new THREE.DirectionalLight(0x112233, 0.8);
    underGlow.position.set(0, -4, 0);
    scene.add(underGlow);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(14, 28, 0x35d5e8, 0x162638);
    gridHelper.position.y = 0;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.45;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Contact shadow plane directly beneath the aircraft
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.005;
    scene.add(shadowMesh);

    // Build 3D Aircraft Model
    const aircraft = buildAircraftModel();
    scene.add(aircraft.rootGroup);
    aircraftDataRef.current = aircraft;

    // Measurement Overlays Group
    const measureGroup = new THREE.Group();
    // Wingspan line
    const wingLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.7, 0.65, 0.1),
      new THREE.Vector3(1.7, 0.65, 0.1),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x35d5e8, transparent: true, opacity: 0.8 });
    const wingLine = new THREE.Line(wingLineGeo, lineMat);
    measureGroup.add(wingLine);

    // Length line
    const lenLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.6, -1.2),
      new THREE.Vector3(0, 0.6, 1.2),
    ]);
    const lenLine = new THREE.Line(lenLineGeo, lineMat);
    measureGroup.add(lenLine);

    measureGroup.visible = measurementMode;
    scene.add(measureGroup);
    measurementGroupRef.current = measureGroup;

    // Raycasting for interactive selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (evt: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(aircraft.rootGroup.children, true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && !topObj.userData?.componentId && topObj !== aircraft.rootGroup) {
          topObj = topObj.parent;
        }
        if (topObj && topObj.userData?.componentId) {
          setHoveredComponentId(topObj.userData.componentId);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredComponentId(null);
      container.style.cursor = 'default';
    };

    const handleClick = (evt: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(aircraft.rootGroup.children, true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && !topObj.userData?.componentId && topObj !== aircraft.rootGroup) {
          topObj = topObj.parent;
        }
        if (topObj && topObj.userData?.componentId) {
          selectComponent(topObj.userData.componentId);
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // Resize observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
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

    const highlightMat = new THREE.MeshStandardMaterial({
      color: 0x35d5e8,
      emissive: 0x1da1b8,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
    });

    const renderTick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Smooth camera transition toward target
      camera.position.lerp(targetCamPos.current, 0.05);
      controls.target.lerp(targetLookAt.current, 0.05);
      controls.update();

      // Smoothly interpolate explode factor
      currentExplode.current = THREE.MathUtils.damp(currentExplode.current, explodeFactor, 5, delta);

      // Update positions of all aircraft parts for explode
      if (aircraftDataRef.current) {
        aircraftDataRef.current.parts.forEach((part, compId) => {
          // If in isolated mode, hide non-selected parts
          if (isolatedMode && selectedComponentId && compId !== selectedComponentId) {
            part.mesh.visible = false;
          } else {
            part.mesh.visible = true;
          }

          // Compute smooth exploded offset
          const offset = part.explodeOffset.clone().multiplyScalar(currentExplode.current);
          part.mesh.position.copy(part.basePosition).add(offset);

          // Component highlight logic
          const isSelected = selectedComponentId === compId;
          const isHovered = hoveredComponentId === compId;

          part.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (showWireframe) {
                child.material.wireframe = true;
              } else {
                child.material.wireframe = false;
              }

              if (isSelected) {
                child.material = highlightMat;
              } else if (isHovered) {
                child.material = highlightMat;
              } else {
                const orig = part.originalMaterials.get(child);
                if (orig) child.material = orig;
              }
            }
          });
        });

        // Rotate VTOL rotors if active
        aircraftDataRef.current.rotorBlades.forEach((rotor, idx) => {
          rotor.rotation.y += (idx % 2 === 0 ? 1 : -1) * 0.15;
        });

        if (aircraftDataRef.current.pusherBlade) {
          aircraftDataRef.current.pusherBlade.rotation.z += 0.25;
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(renderTick);
      } else {
        animId = requestAnimationFrame(renderTick);
      }
    };

    renderTick();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);

      if (aircraftDataRef.current) {
        aircraftDataRef.current.dispose();
      }
      highlightMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectComponent]); // mount once

  // Dynamic prop updates
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  useEffect(() => {
    if (measurementGroupRef.current) {
      measurementGroupRef.current.visible = measurementMode;
    }
  }, [measurementMode]);

  return (
    <div className="relative w-full h-full bg-[#080D16] select-none overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full" data-testid="aircraft-studio-canvas" />

      {/* Hover tooltip */}
      {hoveredComponentId && (
        <div className="absolute top-4 left-4 pointer-events-none z-10 px-3 py-1.5 rounded bg-[#111E2D]/90 border border-[#35D5E8]/40 shadow-lg text-xs font-mono text-[#35D5E8]">
          INSPECT: {hoveredComponentId}
        </div>
      )}

      {/* Measurement Mode Dimensions Tag */}
      {measurementMode && (
        <div className="absolute bottom-24 right-4 pointer-events-none z-10 p-3 rounded-lg bg-[#111E2D]/90 border border-[#35D5E8]/30 text-xs font-mono text-[#EDF4FA] space-y-1">
          <div className="text-[#35D5E8] font-bold">AIRCRAFT PHYSICAL SPECIFICATIONS</div>
          <div>Wingspan: <span className="text-[#3DDC97]">3.40 m</span></div>
          <div>Fuselage Length: <span className="text-[#3DDC97]">2.15 m</span></div>
          <div>Height Over Skids: <span className="text-[#3DDC97]">0.85 m</span></div>
          <div>MTOW (Gross Mass): <span className="text-[#3DDC97]">28.5 kg</span></div>
        </div>
      )}
    </div>
  );
};
