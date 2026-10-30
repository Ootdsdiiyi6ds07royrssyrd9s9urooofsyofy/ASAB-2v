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
}

export const Airspace3DCanvas: React.FC<Airspace3DProps> = ({ viewMode = '3d' }) => {
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
  const nodeObjectsRef = useRef<Map<string, { group: THREE.Group; dropLine: THREE.Line; labelSprite: THREE.Sprite; coverageMesh: THREE.Mesh }>>(new Map());
  const linkObjectsRef = useRef<Map<string, { line: THREE.Line; packetMesh: THREE.Mesh }>>(new Map());
  const selectedNodeRef = useRef<string | null>(selectedNodeId);

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
    scene.background = new THREE.Color(0x080d16);
    scene.fog = new THREE.FogExp2(0x080d16, 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(22, 24, 32);
    cameraRef.current = camera;

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
    controls.maxDistance = 120;
    controls.minDistance = 6;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0xedf4fa, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x35d5e8, 1.5);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Tactical Airspace Ground Grid
    const grid = new THREE.GridHelper(80, 40, 0x35d5e8, 0x112233);
    grid.position.y = 0;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);

    // Radar concentric range rings on ground
    for (const radius of [10, 20, 30, 40]) {
      const ringGeo = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 64);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x1f3b58, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.02;
      scene.add(ringMesh);
    }

    // Ground Station Base 3D Model
    const gsGroup = new THREE.Group();
    gsGroup.position.set(0, 0, 0);

    const baseGeo = new THREE.CylinderGeometry(0.8, 1.1, 0.4, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e3046, roughness: 0.4, metalness: 0.8 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.2;
    gsGroup.add(baseMesh);

    const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8);
    const mastMesh = new THREE.Mesh(mastGeo, baseMat);
    mastMesh.position.y = 1.0;
    gsGroup.add(mastMesh);

    // Phased array dish
    const dishGeo = new THREE.SphereGeometry(0.65, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x35d5e8, roughness: 0.3, metalness: 0.7 });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = -Math.PI / 4;
    dishMesh.position.y = 1.8;
    gsGroup.add(dishMesh);

    scene.add(gsGroup);

    // Raycaster for aircraft clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (evt: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets: THREE.Object3D[] = [];
      nodeObjectsRef.current.forEach((obj) => targets.push(obj.group));

      const intersects = raycaster.intersectObjects(targets, true);
      if (intersects.length > 0) {
        let root = intersects[0].object;
        while (root && !root.userData?.nodeId && root.parent) {
          root = root.parent;
        }
        if (root && root.userData?.nodeId) {
          selectNode(root.userData.nodeId);
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);

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

    const render = () => {
      controls.update();
      packetT = (packetT + 0.015) % 1;

      // Animate packet packets along lines
      linkObjectsRef.current.forEach((item) => {
        const points = (item.line.geometry as THREE.BufferGeometry).attributes.position;
        if (points && points.count >= 2) {
          const p1 = new THREE.Vector3(points.getX(0), points.getY(0), points.getZ(0));
          const p2 = new THREE.Vector3(points.getX(1), points.getY(1), points.getZ(1));
          item.packetMesh.position.lerpVectors(p1, p2, packetT);
        }
      });

      // Slowly rotate ground station radar
      dishMesh.rotation.y += 0.015;

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
      container.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
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
        scene.remove(obj.group);
        scene.remove(obj.dropLine);
        scene.remove(obj.coverageMesh);
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

        // Aerodynamic arrow/delta mini aircraft body
        const shape = new THREE.ConeGeometry(0.5, 1.4, 4);
        shape.rotateX(Math.PI / 2);
        const mat = new THREE.MeshStandardMaterial({
          color: node.role === 'Command Node' ? 0x35d5e8 : node.role === 'Relay Node' ? 0x5587ff : 0x3ddc97,
          roughness: 0.3,
          metalness: 0.7,
        });
        const mesh = new THREE.Mesh(shape, mat);
        group.add(mesh);

        // Wings
        const wingG = new THREE.BoxGeometry(2.4, 0.04, 0.4);
        const wingM = new THREE.Mesh(wingG, mat);
        group.add(wingM);

        // Selection ring
        const ringGeo = new THREE.RingGeometry(1.4, 1.55, 24);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x35d5e8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
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
          color: 0x1f3b58,
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
        ctx.fillStyle = '#080D16';
        ctx.strokeStyle = '#35D5E8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(4, 4, 248, 56, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = '#35D5E8';
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
          color: 0x35d5e8,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
        });
        const coverageMesh = new THREE.Mesh(covGeo, covMat);
        scene.add(coverageMesh);

        scene.add(group);
        scene.add(dropLine);

        nodeObj = { group, dropLine, labelSprite, coverageMesh };
        nodeObjectsRef.current.set(node.id, nodeObj);
      }

      // Update position and heading
      const actualY = node.position.y * 3.5;
      nodeObj.group.position.set(node.position.x, actualY, node.position.z);
      nodeObj.group.rotation.y = (node.telemetry.heading * Math.PI) / 180;

      // Update drop line
      const linePositions = (nodeObj.dropLine.geometry as THREE.BufferGeometry).attributes.position;
      linePositions.setXYZ(0, node.position.x, actualY, node.position.z);
      linePositions.setXYZ(1, node.position.x, 0, node.position.z);
      linePositions.needsUpdate = true;
      nodeObj.dropLine.computeLineDistances();

      // Coverage bubble position & visibility
      nodeObj.coverageMesh.position.set(node.position.x, actualY, node.position.z);
      nodeObj.coverageMesh.visible = settings.showCoverageLayer && isOnline;

      // Visibility toggles
      nodeObj.labelSprite.visible = settings.showLabels;
      const selectRing = nodeObj.group.getObjectByName('selectRing');
      if (selectRing) {
        selectRing.visible = isSelected;
      }
    });
  }, [nodes, selectedNodeId, settings]);

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
        linkObjectsRef.current.delete(id);
      }
    });

    links.forEach((link) => {
      let sourcePos = new THREE.Vector3(0, 1.8, 0); // GS default
      let targetPos = new THREE.Vector3(0, 1.8, 0);

      if (link.sourceId !== groundStation.id) {
        const sNode = nodes.find((n) => n.id === link.sourceId);
        if (sNode) sourcePos = new THREE.Vector3(sNode.position.x, sNode.position.y * 3.5, sNode.position.z);
      }
      if (link.targetId !== groundStation.id) {
        const tNode = nodes.find((n) => n.id === link.targetId);
        if (tNode) targetPos = new THREE.Vector3(tNode.position.x, tNode.position.y * 3.5, tNode.position.z);
      }

      let linkObj = linkObjectsRef.current.get(link.id);

      const colorHex = link.status === 'optimal' ? 0x35d5e8 : link.status === 'stable' ? 0x5587ff : 0xf5b82e;

      if (!linkObj) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([sourcePos, targetPos]);
        const lineMat = new THREE.LineBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.65,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);

        // Data packet pulse
        const packetGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const packetMesh = new THREE.Mesh(packetGeo, packetMat);
        scene.add(packetMesh);

        linkObj = { line, packetMesh };
        linkObjectsRef.current.set(link.id, linkObj);
      } else {
        linkObj.line.visible = true;
        linkObj.packetMesh.visible = true;
        (linkObj.line.material as THREE.LineBasicMaterial).color.setHex(colorHex);
        const posAttr = (linkObj.line.geometry as THREE.BufferGeometry).attributes.position;
        posAttr.setXYZ(0, sourcePos.x, sourcePos.y, sourcePos.z);
        posAttr.setXYZ(1, targetPos.x, targetPos.y, targetPos.z);
        posAttr.needsUpdate = true;
      }
    });
  }, [links, nodes, groundStation, settings.showNetworkLayer]);

  return (
    <div className="relative w-full h-full bg-[#080D16] select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full" data-testid="airspace-3d-canvas" />

      {/* Compass / Orientation HUD Badge */}
      <div className="absolute top-4 right-4 pointer-events-none z-10 p-2.5 rounded-lg bg-[#111E2D]/85 border border-[#172638] text-[11px] font-mono text-[#92A4B8] flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#35D5E8]" />
          <span>SOVEREIGN AIRSPACE GRID</span>
        </div>
        <div className="text-[#35D5E8] font-bold">40 KM RADIUS</div>
      </div>
    </div>
  );
};
