/**
 * ASAB | AEROLAB 3D - High-End Aircraft 3D Studio Viewport
 * Implements orbit controls, smooth exponential damping, PBR studio lighting,
 * procedural tarmac floor, live finish schemes, exploded CAD disassembly, and zero-occlusion bottom dock.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildAircraftModel, AircraftFinishScheme, AircraftMeshPart } from './AircraftModel3D';
import { createTarmacTexture } from './proceduralTextures';
import { useSimulation } from '../../context/SimulationContext';
import {
  Maximize2,
  Minimize2,
  Eye,
  Sliders,
  Grid,
  Ruler,
  Compass,
  Palette,
  RotateCw,
  Sparkles,
} from 'lucide-react';

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
    setExplodeFactor,
    cameraPreset,
    setCameraPreset,
    settings,
  } = useSimulation();

  const isArabic = settings.language === 'ar';

  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const [activeFinish, setActiveFinish] = useState<AircraftFinishScheme>('stealth');
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // References to keep mutable three.js objects outside React renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const aircraftDataRef = useRef<ReturnType<typeof buildAircraftModel> | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const tarmacMeshRef = useRef<THREE.Mesh | null>(null);
  const measurementGroupRef = useRef<THREE.Group | null>(null);

  // Target camera positions for smooth damping transitions
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(3.4, 2.2, 4.2));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.62, 0));
  const currentExplode = useRef<number>(0);

  // Handle camera presets
  useEffect(() => {
    if (!controlsRef.current) return;
    switch (cameraPreset) {
      case 'front':
        targetCamPos.current.set(0, 0.65, 5.2);
        targetLookAt.current.set(0, 0.62, 0);
        break;
      case 'side':
        targetCamPos.current.set(-5.6, 0.65, 0);
        targetLookAt.current.set(0, 0.62, 0);
        break;
      case 'top':
        targetCamPos.current.set(0, 6.2, 0.01);
        targetLookAt.current.set(0, 0.62, 0);
        break;
      case 'bottom':
        targetCamPos.current.set(0, -4.8, 0.01);
        targetLookAt.current.set(0, 0.62, 0);
        break;
      case 'iso':
        targetCamPos.current.set(3.4, 2.4, 3.8);
        targetLookAt.current.set(0, 0.62, 0);
        break;
      case 'reset':
      default:
        targetCamPos.current.set(3.4, 2.0, 4.2);
        targetLookAt.current.set(0, 0.62, 0);
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
    scene.fog = new THREE.FogExp2(0x080d16, 0.022);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
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
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio Environment map via RoomEnvironment + PMREM
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
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

    // Studio 3-Point Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xedf4fa, 0x080d16, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(5.5, 9, 6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x35d5e8, 2.2);
    rimLight.position.set(-6, 4, -7);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x5587ff, 0.9);
    fillLight.position.set(4, 2, -4);
    scene.add(fillLight);

    // Procedural Tarmac Helipad Apron
    const tarmacTexture = createTarmacTexture();
    const tarmacGeo = new THREE.PlaneGeometry(16, 16);
    const tarmacMat = new THREE.MeshStandardMaterial({
      map: tarmacTexture,
      roughness: 0.85,
      metalness: 0.2,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const tarmacMesh = new THREE.Mesh(tarmacGeo, tarmacMat);
    tarmacMesh.rotation.x = -Math.PI / 2;
    tarmacMesh.position.y = 0;
    tarmacMesh.receiveShadow = !isSoftwareGl;
    scene.add(tarmacMesh);
    tarmacMeshRef.current = tarmacMesh;

    // Grid Floor Overlay
    const gridHelper = new THREE.GridHelper(16, 32, 0x35d5e8, 0x172638);
    gridHelper.position.y = 0.002;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.4;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Contact shadow radial plane directly under aircraft skids
    const shadowGeo = new THREE.PlaneGeometry(6.4, 6.4);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 15, 128, 128, 120);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.005;
    scene.add(shadowMesh);

    // Build High-Fidelity 3D Aircraft Model
    const aircraft = buildAircraftModel(activeFinish);
    scene.add(aircraft.rootGroup);
    aircraftDataRef.current = aircraft;

    // Measurement Overlays Group
    const measureGroup = new THREE.Group();
    // Wingspan line
    const wingLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.9, 0.7, 0.1),
      new THREE.Vector3(1.9, 0.7, 0.1),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x35d5e8, transparent: true, opacity: 0.9 });
    const wingLine = new THREE.Line(wingLineGeo, lineMat);
    measureGroup.add(wingLine);

    // Length line
    const lenLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.62, -1.4),
      new THREE.Vector3(0, 0.62, 1.4),
    ]);
    const lenLine = new THREE.Line(lenLineGeo, lineMat);
    measureGroup.add(lenLine);

    measureGroup.visible = measurementMode;
    scene.add(measureGroup);
    measurementGroupRef.current = measureGroup;

    // Raycasting for interactive CAD component selection
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
      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && !topObj.userData?.componentId && topObj !== aircraft.rootGroup) {
          topObj = topObj.parent;
        }
        if (topObj && topObj.userData?.componentId) {
          selectComponent(topObj.userData.componentId);
          return;
        }
      }
      // Clicked background or tarmac: deselect component to view entire model
      selectComponent('');
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // Resize handler
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
      emissiveIntensity: 0.65,
      roughness: 0.15,
      metalness: 0.85,
    });

    const renderTick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Auto-rotation when enabled
      if (controls.autoRotate !== autoRotate) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 1.2;
      }

      // Smooth camera transition toward preset target
      camera.position.lerp(targetCamPos.current, 0.06);
      controls.target.lerp(targetLookAt.current, 0.06);
      controls.update();

      // Smoothly interpolate explode factor using exponential damp
      currentExplode.current = THREE.MathUtils.damp(currentExplode.current, explodeFactor, 6, delta);

      // Update positions of all aircraft parts for CAD explosion
      if (aircraftDataRef.current) {
        aircraftDataRef.current.parts.forEach((part, compId) => {
          if (isolatedMode && selectedComponentId && compId !== selectedComponentId) {
            part.mesh.visible = false;
          } else {
            part.mesh.visible = true;
          }

          // Compute smooth exploded offset
          const offset = part.explodeOffset.clone().multiplyScalar(currentExplode.current);
          part.mesh.position.copy(part.basePosition).add(offset);

          // Component highlight logic without destroying textures
          const isSelected = selectedComponentId === compId;
          const isHovered = hoveredComponentId === compId;

          part.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material.wireframe = showWireframe;
              const orig = part.originalMaterials.get(child) as THREE.MeshStandardMaterial;

              if (orig && orig.emissive) {
                if (isSelected) {
                  orig.emissive.setHex(0x1a3b50);
                  orig.emissiveIntensity = 0.55;
                } else if (isHovered) {
                  orig.emissive.setHex(0x122535);
                  orig.emissiveIntensity = 0.35;
                } else {
                  // Restore default subtle emissive
                  if (compId === 'comp_avionics_bay') {
                    orig.emissive.setHex(0x35d5e8);
                    orig.emissiveIntensity = 0.7;
                  } else if (compId.includes('wingtip')) {
                    // Strobe light handles its own emissive
                  } else {
                    orig.emissive.setHex(0x000000);
                    orig.emissiveIntensity = 0;
                  }
                }
              }
            }
          });
        });

        // Rotate VTOL rotors smoothly
        aircraftDataRef.current.rotorBlades.forEach((rotor, idx) => {
          rotor.rotation.y += (idx % 2 === 0 ? 1 : -1) * 0.22;
        });

        if (aircraftDataRef.current.pusherBlade) {
          aircraftDataRef.current.pusherBlade.rotation.z += 0.35;
        }

        // Pulse tactical navigation lights
        const strobePulse = Math.sin(clock.getElapsedTime() * 6) > 0.4 ? 2.5 : 0.2;
        aircraftDataRef.current.navLights.forEach((light) => {
          light.intensity = strobePulse;
        });
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
      tarmacGeo.dispose();
      tarmacMat.dispose();
      tarmacTexture.dispose();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectComponent]); // mount once

  // Handle Finish Scheme Updates
  useEffect(() => {
    if (aircraftDataRef.current) {
      aircraftDataRef.current.setScheme(activeFinish);
    }
  }, [activeFinish]);

  // Dynamic prop updates
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
    if (tarmacMeshRef.current) {
      tarmacMeshRef.current.visible = showGrid;
    }
  }, [showGrid]);

  useEffect(() => {
    if (measurementGroupRef.current) {
      measurementGroupRef.current.visible = measurementMode;
    }
  }, [measurementMode]);

  return (
    <div className="relative w-full h-full bg-[#080D16] select-none overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full" data-testid="aircraft-studio-canvas" />

      {/* Top Floating Badge & Quick Actions */}
      <div className="absolute top-4 start-4 z-10 flex items-center gap-3 pointer-events-none">
        <div className="px-3 py-1.5 rounded-md bg-[#0D1623]/90 border border-[#35D5E8]/30 shadow-xl backdrop-blur-sm pointer-events-auto flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#35D5E8]" />
          <div className="font-mono text-xs text-[#EDF4FA]">
            <span className="font-bold text-[#35D5E8]">ASAB-V100</span>{' '}
            <span className="text-[#92A4B8] text-[11px]">{isArabic ? '| توأم رقمي 3D فائق الدقة' : '| 3D High-Fidelity Twin'}</span>
          </div>
        </div>

        {hoveredComponentId && (
          <div className="px-3 py-1.5 rounded-md bg-[#111E2D]/95 border border-[#35D5E8]/60 shadow-lg text-xs font-mono text-[#35D5E8] animate-in fade-in">
            {isArabic ? 'معاينة جزء: ' : 'INSPECT: '}
            <span className="text-[#EDF4FA] font-bold">{hoveredComponentId}</span>
          </div>
        )}
      </div>

      {/* Top End: Measurement Badge if active */}
      {measurementMode && (
        <div className="absolute top-4 end-4 z-10 p-3 rounded-lg bg-[#0D1623]/95 border border-[#35D5E8]/40 shadow-xl text-xs font-mono text-[#EDF4FA] space-y-1">
          <div className="text-[#35D5E8] font-bold flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5" />
            <span>{isArabic ? 'المواصفات الهندسية والأبعاد' : 'GEOMETRIC DIMENSIONS'}</span>
          </div>
          <div>{isArabic ? 'باع الجناح (Wingspan):' : 'Wingspan:'} <span className="text-[#3DDC97]">3.80 m</span></div>
          <div>{isArabic ? 'طول الهيكل (Length):' : 'Fuselage Length:'} <span className="text-[#3DDC97]">2.40 m</span></div>
          <div>{isArabic ? 'الارتفاع (Height):' : 'Height:'} <span className="text-[#3DDC97]">0.85 m</span></div>
          <div>{isArabic ? 'الوزن الإجمالي (MTOW):' : 'Gross MTOW:'} <span className="text-[#3DDC97]">28.5 kg</span></div>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl transition-all duration-300">
        {/* Toggle Cinema / Dock button */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
            className="px-3 py-1 text-[11px] font-mono rounded-t-md bg-[#111E2D]/90 hover:bg-[#172638] text-[#92A4B8] hover:text-[#35D5E8] border-t border-x border-[#172638] shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isControlsExpanded ? (
              <>
                <Minimize2 className="w-3 h-3 text-[#35D5E8]" />
                <span>{isArabic ? 'إخفاء لوحة التحكم (وضع السينما)' : 'Minimize Controls'}</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3 text-[#35D5E8]" />
                <span>{isArabic ? 'إظهار لوحة التحكم والتشطيبات' : 'Expand 3D Controls'}</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container */}
        {isControlsExpanded && (
          <div className="p-3 sm:p-4 rounded-xl bg-[#0D1623]/95 border border-[#172638] shadow-2xl backdrop-blur-md text-xs font-mono space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* 1. Exploded CAD View Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#92A4B8]">
                  <span className="flex items-center gap-1.5 text-[#EDF4FA]">
                    <Sliders className="w-3.5 h-3.5 text-[#35D5E8]" />
                    <span>{isArabic ? 'تفكيك الأجزاء الهندسي (CAD Explode)' : 'Exploded CAD'}</span>
                  </span>
                  <span className="text-[#35D5E8] font-bold">{Math.round(explodeFactor * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodeFactor}
                  onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#172638] rounded-lg appearance-none cursor-pointer accent-[#35D5E8]"
                />
              </div>

              {/* 2. Tactical Finish Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#EDF4FA]">
                  <Palette className="w-3.5 h-3.5 text-[#35D5E8]" />
                  <span>{isArabic ? 'تشطيب وهيكل الطائرة (Finish)' : 'Material Scheme'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setActiveFinish('stealth')}
                    className={`py-1 px-1.5 rounded text-[10px] text-center transition-all cursor-pointer border ${
                      activeFinish === 'stealth'
                        ? 'bg-[#172638] text-[#35D5E8] border-[#35D5E8] font-bold'
                        : 'bg-[#111E2D] text-[#92A4B8] border-[#172638] hover:border-[#35D5E8]/40'
                    }`}
                  >
                    {isArabic ? 'كربوني' : 'Stealth'}
                  </button>
                  <button
                    onClick={() => setActiveFinish('sovereign')}
                    className={`py-1 px-1.5 rounded text-[10px] text-center transition-all cursor-pointer border ${
                      activeFinish === 'sovereign'
                        ? 'bg-[#172638] text-[#3DDC97] border-[#3DDC97] font-bold'
                        : 'bg-[#111E2D] text-[#92A4B8] border-[#172638] hover:border-[#3DDC97]/40'
                    }`}
                  >
                    {isArabic ? 'سيادي' : 'Sovereign'}
                  </button>
                  <button
                    onClick={() => setActiveFinish('camo')}
                    className={`py-1 px-1.5 rounded text-[10px] text-center transition-all cursor-pointer border ${
                      activeFinish === 'camo'
                        ? 'bg-[#172638] text-[#F5B82E] border-[#F5B82E] font-bold'
                        : 'bg-[#111E2D] text-[#92A4B8] border-[#172638] hover:border-[#F5B82E]/40'
                    }`}
                  >
                    {isArabic ? 'صحراوي' : 'Camo'}
                  </button>
                  <button
                    onClick={() => setActiveFinish('test')}
                    className={`py-1 px-1.5 rounded text-[10px] text-center transition-all cursor-pointer border ${
                      activeFinish === 'test'
                        ? 'bg-[#172638] text-[#FF5964] border-[#FF5964] font-bold'
                        : 'bg-[#111E2D] text-[#92A4B8] border-[#172638] hover:border-[#FF5964]/40'
                    }`}
                  >
                    {isArabic ? 'تجارب' : 'Flight Test'}
                  </button>
                </div>
              </div>

              {/* 3. Camera View & Rotation Tools */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#EDF4FA]">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#35D5E8]" />
                    <span>{isArabic ? 'زاوية الرؤية والدوران' : 'Camera Presets'}</span>
                  </span>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                      autoRotate ? 'bg-[#35D5E8]/20 text-[#35D5E8] border border-[#35D5E8]/50' : 'bg-[#111E2D] text-[#92A4B8] hover:text-[#EDF4FA]'
                    }`}
                  >
                    <RotateCw className="w-2.5 h-2.5" />
                    <span>{isArabic ? 'دوران تلقائي' : 'Auto Rotate'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCameraPreset('iso')}
                    className="flex-1 py-1 rounded bg-[#111E2D] hover:bg-[#172638] text-[#92A4B8] hover:text-[#35D5E8] text-[10px] text-center border border-[#172638] cursor-pointer"
                  >
                    {isArabic ? 'أيزو' : 'ISO'}
                  </button>
                  <button
                    onClick={() => setCameraPreset('front')}
                    className="flex-1 py-1 rounded bg-[#111E2D] hover:bg-[#172638] text-[#92A4B8] hover:text-[#35D5E8] text-[10px] text-center border border-[#172638] cursor-pointer"
                  >
                    {isArabic ? 'أمامي' : 'Front'}
                  </button>
                  <button
                    onClick={() => setCameraPreset('side')}
                    className="flex-1 py-1 rounded bg-[#111E2D] hover:bg-[#172638] text-[#92A4B8] hover:text-[#35D5E8] text-[10px] text-center border border-[#172638] cursor-pointer"
                  >
                    {isArabic ? 'جانبي' : 'Side'}
                  </button>
                  <button
                    onClick={() => setCameraPreset('top')}
                    className="flex-1 py-1 rounded bg-[#111E2D] hover:bg-[#172638] text-[#92A4B8] hover:text-[#35D5E8] text-[10px] text-center border border-[#172638] cursor-pointer"
                  >
                    {isArabic ? 'علوي' : 'Top'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
