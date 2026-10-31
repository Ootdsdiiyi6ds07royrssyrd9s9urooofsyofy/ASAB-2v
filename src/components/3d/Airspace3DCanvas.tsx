/**
 * ASAB | AEROLAB 3D - Interactive 3D Tactical Airspace Canvas
 * Renders virtual ground station, VTOL aircraft nodes, mesh links, coverage spheres, and telemetry markers.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useSimulation } from '../../context/SimulationContext';

export interface Airspace3DProps {
  viewMode?: '3d' | 'topdown';
  trainingActive?: boolean;
  convoyPatrolMode?: boolean;
  defenseGridActive?: boolean;
}

const TRAIL_MAX = 48;
const LINK_SEGMENTS = 20;

interface NodeObj {
  group: THREE.Group;
  dropLine: THREE.Line;
  labelSprite: THREE.Sprite;
  coverageMesh: THREE.Mesh;
  ring: THREE.Mesh;
  strobes: THREE.Mesh[];
  discs: THREE.Mesh[];
  target: THREE.Vector3;
  targetHeading: number;
  roleColor: number;
  trail: { line: THREE.Line; pos: Float32Array; col: Float32Array; count: number; timer: number };
}
interface LinkObj {
  line: THREE.Line;
  packetMesh: THREE.Mesh;
  sourceId: string;
  targetId: string;
  phase: number;
}

function disposeTree(obj: THREE.Object3D) {
  obj.traverse((o: any) => {
    o.geometry?.dispose?.();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    mats.forEach((m: any) => { m.map?.dispose?.(); m.dispose?.(); });
  });
}

export const Airspace3DCanvas: React.FC<Airspace3DProps> = ({ viewMode = '3d', trainingActive = true, convoyPatrolMode = true, defenseGridActive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    nodes,
    groundStation,
    links,
    selectedNodeId,
    selectNode,
    settings,
  } = useSimulation();

  // Internal references to sync dynamic simulation state without remounting canvas
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeObjectsRef = useRef<Map<string, NodeObj>>(new Map());
  const linkObjectsRef = useRef<Map<string, LinkObj>>(new Map());
  const selectedNodeRef = useRef<string | null>(selectedNodeId);
  const focusRef = useRef<THREE.Vector3 | null>(null);
  const gsIdRef = useRef<string>(groundStation.id);
  const firstFocusRef = useRef(true);
  const qualityRef = useRef(settings.quality);
  const trainingActiveRef = useRef(trainingActive);
  const convoyPatrolRef = useRef(convoyPatrolMode);
  const defenseGridRef = useRef(defenseGridActive);
  const gridRef = useRef<THREE.Object3D | null>(null);
  const sweepRef = useRef<THREE.Object3D | null>(null);
  const patrolRef = useRef<THREE.Object3D | null>(null);
  const defenseRef = useRef<THREE.Object3D | null>(null);
  qualityRef.current = settings.quality;
  trainingActiveRef.current = trainingActive;
  convoyPatrolRef.current = convoyPatrolMode;
  defenseGridRef.current = defenseGridActive;
  gsIdRef.current = groundStation.id;

  useEffect(() => {
    selectedNodeRef.current = selectedNodeId;
  }, [selectedNodeId]);

  // Adjust camera based on viewMode
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (viewMode === 'topdown') {
      cameraRef.current.position.set(0, 48, 0.01);
      controlsRef.current.target.set(0, 0, 0);
    } else {
      cameraRef.current.position.set(22, 24, 32);
      controlsRef.current.target.set(0, 2, 0);
    }
    controlsRef.current.update();
  }, [viewMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Software WebGL check
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
    scene.background = new THREE.Color(0x120e0a);
    scene.fog = new THREE.FogExp2(0x2a1e14, 0.011);
    sceneRef.current = scene;

    // Gradient sky dome (warm horizon glow -> deep espresso zenith)
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color(0x120e0a) },
        mid: { value: new THREE.Color(0x2e2117) },
        horizon: { value: new THREE.Color(0x7a5535) },
      },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; varying vec3 vDir; void main(){ float h = clamp(vDir.y, 0.0, 1.0); vec3 c = mix(horizon, mid, smoothstep(0.0, 0.22, h)); c = mix(c, top, smoothstep(0.18, 0.9, h)); gl_FragColor = vec4(c, 1.0);\n#include <colorspace_fragment>\n}',
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(250, 24, 16), skyMat);
    sky.renderOrder = -10;
    scene.add(sky);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(22, 24, 32);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 120;
    controls.minDistance = 6;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0xf6ecdd, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xd8b98a, 1.5);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Tactical Airspace Ground Grid - Battlefield Terrain
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x231a12,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = Math.PI / 2;
    groundMesh.position.y = -0.05;
    scene.add(groundMesh);

    // Grid Overlay
    const grid = new THREE.GridHelper(100, 50, 0xd8b98a, 0x2b2119);
    grid.position.y = 0;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.2;
    scene.add(grid);
    gridRef.current = grid;

    // Radar concentric range rings on ground
    for (const radius of [10, 20, 30, 40]) {
      const ringGeo = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 64);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x4b3a2c, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.02;
      scene.add(ringMesh);
    }

    // Ground Station Base 3D Model
    const gsGroup = new THREE.Group();
    gsGroup.position.set(0, 0, 0);

    const baseGeo = new THREE.CylinderGeometry(0.8, 1.1, 0.4, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x3d2f22, roughness: 0.4, metalness: 0.8 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.2;
    gsGroup.add(baseMesh);

    const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8);
    const mastMesh = new THREE.Mesh(mastGeo, baseMat);
    mastMesh.position.y = 1.0;
    gsGroup.add(mastMesh);

    // Phased array dish
    const dishGeo = new THREE.SphereGeometry(0.65, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xd8b98a, roughness: 0.3, metalness: 0.7 });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = -Math.PI / 4;
    dishMesh.position.y = 1.8;
    gsGroup.add(dishMesh);

    scene.add(gsGroup);
    defenseRef.current = gsGroup;

    // Radar sweep on the ground (rotating translucent wedge)
    const sweepGroup = new THREE.Group();
    const wedgeGeo = new THREE.CircleGeometry(40, 28, 0, Math.PI / 5);
    wedgeGeo.rotateX(-Math.PI / 2);
    const wedgeMat = new THREE.MeshBasicMaterial({
      color: 0xd8b98a, transparent: true, opacity: 0.11, side: THREE.DoubleSide,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const wedge = new THREE.Mesh(wedgeGeo, wedgeMat);
    sweepGroup.add(wedge);
    const edgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(Math.PI / 5) * 40, 0, -Math.sin(Math.PI / 5) * 40),
    ]);
    const edgeLine = new THREE.Line(edgeGeo, new THREE.LineBasicMaterial({ color: 0xe6cfa6, transparent: true, opacity: 0.7 }));
    sweepGroup.add(edgeLine);
    sweepGroup.position.y = 0.06;
    scene.add(sweepGroup);
    sweepRef.current = sweepGroup;

    // Visible patrol markers: the convoy toggle now controls a real layer in the arena.
    const patrolGroup = new THREE.Group();
    [[-18, 0, 14], [18, 0, 18], [28, 0, -12]].forEach(([x, y, z]) => {
      const beacon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.2, 1.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x8a6a42, emissive: 0x3a2615, emissiveIntensity: 0.4 }),
      );
      beacon.position.set(x, y + 0.9, z);
      patrolGroup.add(beacon);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.8, 1.95, 32),
        new THREE.MeshBasicMaterial({ color: 0xb5793f, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.04, z);
      patrolGroup.add(ring);
    });
    scene.add(patrolGroup);
    patrolRef.current = patrolGroup;

    // Floating dust (atmosphere + sense of motion)
    const DUST_N = settings.quality === 'low' ? 120 : settings.quality === 'medium' ? 320 : 600;
    const dustPos = new Float32Array(DUST_N * 3);
    for (let i = 0; i < DUST_N; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 90;
      dustPos[i * 3 + 1] = 0.5 + Math.random() * 26;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xe6cfa6, size: 0.16, transparent: true, opacity: 0.45,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    scene.add(dust);

    // Raycaster for aircraft clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let downX = 0, downY = 0;
    const handlePointerDown = (evt: PointerEvent) => { downX = evt.clientX; downY = evt.clientY; };
    const handlePointerUp = (evt: PointerEvent) => {
      if (Math.hypot(evt.clientX - downX, evt.clientY - downY) > 6) return; // it was an orbit drag, not a tap
      const rect = container.getBoundingClientRect();
      mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets: THREE.Object3D[] = [];
      nodeObjectsRef.current.forEach((obj) => targets.push(obj.group));

      const intersects = raycaster.intersectObjects(targets, true);
      if (intersects.length > 0) {
        let root: THREE.Object3D | null = intersects[0].object;
        while (root && !root.userData?.nodeId && root.parent) root = root.parent;
        if (root && root.userData?.nodeId) selectNode(root.userData.nodeId);
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerup', handlePointerUp);
    controls.addEventListener('start', () => { focusRef.current = null; });

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
    const resizeObs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => handleResize()) : null;
    resizeObs?.observe(container);

    // Animation loop with packet motion
    let animId = 0;
    let packetT = 0;

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

    const clock = new THREE.Clock();
    const pA = new THREE.Vector3();
    const pB = new THREE.Vector3();
    const pC = new THREE.Vector3();
    const tmpCol = new THREE.Color();
    const prevTarget = new THREE.Vector3();

    const getEndpoint = (id: string, out: THREE.Vector3) => {
      if (id === gsIdRef.current) return out.set(0, 1.8, 0);
      const o = nodeObjectsRef.current.get(id);
      return o ? out.copy(o.group.position) : out.set(0, 1.8, 0);
    };

    const render = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;
      const k = 1 - Math.exp(-4 * dt);

      // Camera lock-on after selecting an aircraft (released as soon as the user orbits)
      if (focusRef.current) {
        prevTarget.copy(controls.target);
        controls.target.lerp(focusRef.current, 1 - Math.exp(-6 * dt));
        camera.position.add(pB.copy(controls.target).sub(prevTarget));
      }
      controls.update();

      // Smooth aircraft motion between 1 Hz simulation ticks
      nodeObjectsRef.current.forEach((n) => {
        const motionK = trainingActiveRef.current ? k : 0;
        n.group.position.lerp(n.target, motionK);
        const cur = n.group.rotation.y;
        n.group.rotation.y = cur + Math.atan2(Math.sin(n.targetHeading - cur), Math.cos(n.targetHeading - cur)) * k;

        const gp = n.group.position;
        const dl = (n.dropLine.geometry as THREE.BufferGeometry).attributes.position;
        dl.setXYZ(0, gp.x, gp.y, gp.z);
        dl.setXYZ(1, gp.x, 0, gp.z);
        dl.needsUpdate = true;
        n.dropLine.computeLineDistances();
        n.coverageMesh.position.copy(gp);
        n.coverageMesh.rotation.y += dt * 0.12;

        // blinking nav strobes + pulsing selection ring + breathing rotor discs
        const blink = Math.sin(time * 7 + gp.x) > 0.75;
        n.strobes.forEach((m) => { m.visible = blink; });
        if (n.ring.visible) {
          const sc = 1 + Math.sin(time * 3) * 0.06;
          n.ring.scale.set(sc, 1, sc);
          n.ring.rotation.y += dt * 0.6;
        }
        n.discs.forEach((d, i) => {
          (d.material as THREE.MeshBasicMaterial).opacity = 0.28 + 0.12 * Math.sin(time * 18 + i);
        });

        // flight trail
        if (qualityRef.current !== 'low') {
          n.trail.timer += dt;
          if (n.trail.timer > 0.2) {
            n.trail.timer = 0;
            const t = n.trail;
            const last = t.count - 1;
            const moved = t.count === 0 || Math.hypot(t.pos[last * 3] - gp.x, t.pos[last * 3 + 1] - gp.y, t.pos[last * 3 + 2] - gp.z) > 0.04;
            if (moved) {
              if (t.count < TRAIL_MAX) t.count++;
              else t.pos.copyWithin(0, 3);
              const i = t.count - 1;
              t.pos[i * 3] = gp.x; t.pos[i * 3 + 1] = gp.y; t.pos[i * 3 + 2] = gp.z;
              for (let j = 0; j < t.count; j++) {
                const f = t.count > 1 ? (j / (t.count - 1)) * 0.85 : 0.5;
                tmpCol.setHex(n.roleColor);
                t.col[j * 3] = tmpCol.r * f; t.col[j * 3 + 1] = tmpCol.g * f; t.col[j * 3 + 2] = tmpCol.b * f;
              }
              const g = t.line.geometry as THREE.BufferGeometry;
              g.attributes.position.needsUpdate = true;
              g.attributes.color.needsUpdate = true;
              g.setDrawRange(0, t.count);
            }
          }
        }
      });

      if (gridRef.current) gridRef.current.visible = defenseGridRef.current;
      if (sweepRef.current) sweepRef.current.visible = defenseGridRef.current;
      if (defenseRef.current) defenseRef.current.visible = defenseGridRef.current;
      if (patrolRef.current) patrolRef.current.visible = convoyPatrolRef.current;

      // Curved mesh links with travelling data packets
      linkObjectsRef.current.forEach((l) => {
        if (!l.line.visible) return;
        getEndpoint(l.sourceId, pA);
        getEndpoint(l.targetId, pB);
        pC.copy(pA).add(pB).multiplyScalar(0.5);
        pC.y += pA.distanceTo(pB) * 0.12;
        const attr = (l.line.geometry as THREE.BufferGeometry).attributes.position;
        for (let i = 0; i <= LINK_SEGMENTS; i++) {
          const t = i / LINK_SEGMENTS, u = 1 - t;
          attr.setXYZ(i,
            u * u * pA.x + 2 * u * t * pC.x + t * t * pB.x,
            u * u * pA.y + 2 * u * t * pC.y + t * t * pB.y,
            u * u * pA.z + 2 * u * t * pC.z + t * t * pB.z);
        }
        attr.needsUpdate = true;
        const t = (time * 0.35 + l.phase) % 1, u = 1 - t;
        l.packetMesh.position.set(
          u * u * pA.x + 2 * u * t * pC.x + t * t * pB.x,
          u * u * pA.y + 2 * u * t * pC.y + t * t * pB.y,
          u * u * pA.z + 2 * u * t * pC.z + t * t * pB.z);
      });

      // Radar sweep, dish, dust, sky
      sweepGroup.rotation.y += dt * 0.9;
      dishMesh.rotation.y += dt * 0.9;
      const dp = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < DUST_N; i++) {
        let x = dp.getX(i) + dt * 0.5;
        let y = dp.getY(i) + Math.sin(time * 0.6 + i) * dt * 0.15;
        if (x > 45) x = -45;
        dp.setXYZ(i, x, y, dp.getZ(i));
      }
      dp.needsUpdate = true;
      sky.position.copy(camera.position);

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
      window.removeEventListener('resize', handleResize);
      resizeObs?.disconnect();
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      disposeTree(scene);
      nodeObjectsRef.current.clear();
      linkObjectsRef.current.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectNode]);

  // Synchronize Aircraft Nodes in Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Check removed nodes
    const currentNodeIds = new Set(nodes.map((n) => n.id));
    nodeObjectsRef.current.forEach((obj, id) => {
      if (!currentNodeIds.has(id)) {
        [obj.group, obj.dropLine, obj.coverageMesh, obj.trail.line].forEach((o) => { scene.remove(o); disposeTree(o); });
        nodeObjectsRef.current.delete(id);
      }
    });

    // Add or update existing nodes
    nodes.forEach((node) => {
      const isSelected = selectedNodeId === node.id;
      const isOnline = node.status === 'Active' || node.status === 'Standby';

      let nodeObj = nodeObjectsRef.current.get(node.id);

      if (!nodeObj) {
        // Build aircraft visual marker
        const group = new THREE.Group();
        group.userData = { nodeId: node.id };

        // Build realistic composite mini VTOL airframe
        const roleColor = node.role === 'Command Node' ? 0xd8b98a : node.role === 'Relay Node' ? 0xb5793f : 0x8fc46a;
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x201b16,
          roughness: 0.35,
          metalness: 0.8,
        });
        const trimMat = new THREE.MeshStandardMaterial({
          color: roleColor,
          roughness: 0.25,
          metalness: 0.9,
          emissive: roleColor,
          emissiveIntensity: 0.3,
        });
        const canopyMat = new THREE.MeshStandardMaterial({
          color: 0x150f0a,
          roughness: 0.1,
          metalness: 0.95,
        });

        // 1. Aerodynamic fuselage
        const bodyGeo = new THREE.CylinderGeometry(0.22, 0.14, 1.8, 12);
        bodyGeo.rotateX(Math.PI / 2);
        bodyGeo.scale(1.2, 0.7, 1.0);
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(bodyMesh);

        // 2. Cockpit canopy
        const canopyGeo = new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
        canopyGeo.scale(0.8, 0.5, 1.2);
        canopyGeo.translate(0, 0.12, 0.25);
        const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
        group.add(canopyMesh);

        // 3. Swept main wings with camber
        const wingGeo = new THREE.BoxGeometry(2.8, 0.035, 0.45);
        wingGeo.translate(0, 0.05, 0);
        const wingMesh = new THREE.Mesh(wingGeo, bodyMat);
        group.add(wingMesh);

        // 4. Winglets & Port/Stbd Nav Strobes
        const portNavGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const portNavMat = new THREE.MeshBasicMaterial({ color: 0xff2244 });
        const portNav = new THREE.Mesh(portNavGeo, portNavMat);
        portNav.position.set(-1.42, 0.1, 0);
        group.add(portNav);
        const strobes: THREE.Mesh[] = [portNav];

        const stbdNavGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const stbdNavMat = new THREE.MeshBasicMaterial({ color: 0x22ff66 });
        const stbdNav = new THREE.Mesh(stbdNavGeo, stbdNavMat);
        stbdNav.position.set(1.42, 0.1, 0);
        group.add(stbdNav);
        strobes.push(stbdNav);
        const discs: THREE.Mesh[] = [];

        // 5. Twin tail booms & canted fins
        for (const side of [-0.65, 0.65]) {
          const boomGeo = new THREE.CylinderGeometry(0.03, 0.025, 1.2, 8);
          boomGeo.rotateX(Math.PI / 2);
          const boom = new THREE.Mesh(boomGeo, trimMat);
          boom.position.set(side, 0.04, -0.4);
          group.add(boom);

          const finGeo = new THREE.BoxGeometry(0.02, 0.32, 0.2);
          const fin = new THREE.Mesh(finGeo, bodyMat);
          fin.position.set(side, 0.18, -0.9);
          fin.rotation.z = (side > 0 ? 1 : -1) * 0.2;
          group.add(fin);
        }

        // 6. 4 VTOL Rotor Discs
        for (const x of [-0.65, 0.65]) {
          for (const z of [0.15, -0.65]) {
            const discGeo = new THREE.RingGeometry(0.02, 0.28, 12);
            discGeo.rotateX(Math.PI / 2);
            const discMat = new THREE.MeshBasicMaterial({
              color: roleColor,
              transparent: true,
              opacity: 0.35,
              side: THREE.DoubleSide,
            });
            const disc = new THREE.Mesh(discGeo, discMat);
            disc.position.set(x, 0.12, z);
            group.add(disc);
            discs.push(disc);
          }
        }

        // Selection ring
        const ringGeo = new THREE.RingGeometry(1.6, 1.75, 24);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xd8b98a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const selectRing = new THREE.Mesh(ringGeo, ringMat);
        selectRing.name = 'selectRing';
        group.add(selectRing);

        // Drop line to terrain
        const dropLineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(node.position.x, node.position.y * 3, node.position.z),
          new THREE.Vector3(node.position.x, 0, node.position.z),
        ]);
        const dropLineMat = new THREE.LineDashedMaterial({
          color: 0x4b3a2c,
          dashSize: 0.4,
          gapSize: 0.2,
          transparent: true,
          opacity: 0.6,
        });
        const dropLine = new THREE.Line(dropLineGeo, dropLineMat);
        dropLine.computeLineDistances();

        // Label sprite
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#120e0a';
        ctx.strokeStyle = '#9a6a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(4, 4, 248, 56, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = '#9a6a3a';
        ctx.textAlign = 'center';
        ctx.fillText(`${node.id} | ${node.callsign}`, 128, 38);

        const spriteTex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: spriteTex, depthTest: false, transparent: true });
        const labelSprite = new THREE.Sprite(spriteMat);
        labelSprite.scale.set(4, 1, 1);
        labelSprite.position.set(0, 1.4, 0);
        group.add(labelSprite);

        // Coverage bubble
        const covGeo = new THREE.SphereGeometry(6, 16, 12);
        const covMat = new THREE.MeshBasicMaterial({
          color: 0xd8b98a,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
        });
        const coverageMesh = new THREE.Mesh(covGeo, covMat);
        scene.add(coverageMesh);

        // Flight trail (fading polyline)
        const trailPos = new Float32Array(TRAIL_MAX * 3);
        const trailCol = new Float32Array(TRAIL_MAX * 3);
        const trailGeo = new THREE.BufferGeometry();
        trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
        trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));
        trailGeo.setDrawRange(0, 0);
        const trailLine = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 }));
        trailLine.frustumCulled = false;
        scene.add(trailLine);

        scene.add(group);
        scene.add(dropLine);

        group.position.set(node.position.x, node.position.y * 3.5, node.position.z);
        nodeObj = {
          group, dropLine, labelSprite, coverageMesh,
          ring: selectRing, strobes, discs,
          target: group.position.clone(),
          targetHeading: (node.telemetry.heading * Math.PI) / 180,
          roleColor,
          trail: { line: trailLine, pos: trailPos, col: trailCol, count: 0, timer: 0 },
        };
        nodeObjectsRef.current.set(node.id, nodeObj);
      }

      // Targets (the render loop eases the aircraft towards them every frame)
      const actualY = node.position.y * 3.5;
      nodeObj.target.set(node.position.x, actualY, node.position.z);
      nodeObj.targetHeading = (node.telemetry.heading * Math.PI) / 180;
      nodeObj.coverageMesh.visible = settings.showCoverageLayer && isOnline;
      nodeObj.trail.line.visible = settings.showNetworkLayer && settings.quality !== 'low';
      nodeObj.group.visible = true;

      // Visibility toggles
      nodeObj.labelSprite.visible = settings.showLabels;
      const selectRing = nodeObj.group.getObjectByName('selectRing');
      if (selectRing) {
        selectRing.visible = isSelected;
      }
    });
  }, [nodes, selectedNodeId, settings]);

  // Camera lock-on when a different aircraft is selected (not on first mount)
  useEffect(() => {
    if (firstFocusRef.current) { firstFocusRef.current = false; return; }
    const obj = selectedNodeId ? nodeObjectsRef.current.get(selectedNodeId) : null;
    focusRef.current = obj ? obj.group.position : null;
  }, [selectedNodeId]);

  // Synchronize Mesh Communication Links in Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (!settings.showNetworkLayer) {
      linkObjectsRef.current.forEach((obj) => {
        obj.line.visible = false;
        obj.packetMesh.visible = false;
      });
      return;
    }

    const currentLinkIds = new Set(links.map((l) => l.id));
    linkObjectsRef.current.forEach((obj, id) => {
      if (!currentLinkIds.has(id)) {
        scene.remove(obj.line);
        scene.remove(obj.packetMesh);
        disposeTree(obj.line);
        disposeTree(obj.packetMesh);
        linkObjectsRef.current.delete(id);
      }
    });

    links.forEach((link, idx) => {
      const colorHex = link.status === 'optimal' ? 0xd8b98a : link.status === 'stable' ? 0xb5793f : 0xf5b82e;
      let linkObj = linkObjectsRef.current.get(link.id);

      if (!linkObj) {
        const pts = Array.from({ length: LINK_SEGMENTS + 1 }, () => new THREE.Vector3());
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.65 });
        const line = new THREE.Line(lineGeo, lineMat);
        line.frustumCulled = false;
        scene.add(line);

        const packetMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xfff1d6 })
        );
        scene.add(packetMesh);

        linkObj = { line, packetMesh, sourceId: link.sourceId, targetId: link.targetId, phase: (idx * 0.37) % 1 };
        linkObjectsRef.current.set(link.id, linkObj);
      } else {
        linkObj.sourceId = link.sourceId;
        linkObj.targetId = link.targetId;
        linkObj.line.visible = true;
        linkObj.packetMesh.visible = true;
        (linkObj.line.material as THREE.LineBasicMaterial).color.setHex(colorHex);
      }
    });
  }, [links, nodes, groundStation, settings.showNetworkLayer]);

  return (
    <div className="relative w-full h-full bg-[#120e0a] select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full" data-testid="airspace-3d-canvas" />

      {/* Compass / Orientation HUD Badge */}
      <div className="absolute top-2 end-2 sm:top-4 sm:end-4 pointer-events-none z-10 p-2 rounded-lg bg-[#231a12]/85 border border-[#32261b] text-[11px] font-mono text-[#b9a58c] flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#9a6a3a]" />
          <span className="hidden sm:inline">شبكة المجال الجوي السيادي</span>
        </div>
        <div className="text-[#9a6a3a] font-bold">40 KM RADIUS</div>
      </div>
    </div>
  );
};
