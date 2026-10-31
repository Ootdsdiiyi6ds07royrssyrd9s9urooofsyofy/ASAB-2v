/**
 * ASAB | AEROLAB 3D - Tactical Battlefield Theater Engine
 * Procedurally generates an immersive 3D military warzone:
 * - Topographical combat terrain (dunes, rocky ridges, craters, trenches)
 * - Forward Operating Base (FOB ALPHA): blast barriers, helipad, command bunker, radar mast, watchtower, SAM battery
 * - Atmospheric battlefield particle effects: rising smoke columns, tactical dust, searchlight beams
 * - Tactical military grid overlays, threat engagement domes, and target waypoints
 * - Multiple tactical optics: Day Combat, Night NVG, Thermal FLIR, Sandstorm, and Studio Hangar
 */

import * as THREE from 'three';

export type BattlefieldEnvironmentMode =
  | 'warzone-day'
  | 'warzone-night'
  | 'warzone-flir'
  | 'warzone-sandstorm'
  | 'hangar-studio';

export interface BattlefieldTheaterInstance {
  rootGroup: THREE.Group;
  terrainMesh: THREE.Mesh;
  fobGroup: THREE.Group;
  smokeParticles: THREE.Points;
  threatDomesGroup: THREE.Group;
  searchlightGroup: THREE.Group;
  radarDish: THREE.Mesh;
  runwayLights: THREE.PointLight[];
  update: (delta: number, elapsed: number) => void;
  setMode: (mode: BattlefieldEnvironmentMode, scene: THREE.Scene) => void;
  dispose: () => void;
}

/**
 * Creates high-detail procedural terrain texture for tactical battlefield
 */
function createBattlefieldGroundTexture(mode: BattlefieldEnvironmentMode = 'warzone-day'): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base terrain color depending on mode
  if (mode === 'warzone-flir') {
    ctx.fillStyle = '#10141a';
    ctx.fillRect(0, 0, size, size);
  } else if (mode === 'warzone-sandstorm') {
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(0, 0, size, size);
  } else {
    // Arid desert / rocky warzone soil
    ctx.fillStyle = '#261e16';
    ctx.fillRect(0, 0, size, size);
  }

  // Procedural noise & gravel variation
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 26;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.8));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.6));
  }
  ctx.putImageData(imgData, 0, 0);

  // Tactical Military Grid Lines (MGRS Grid)
  ctx.strokeStyle = mode === 'warzone-flir' ? 'rgba(53, 213, 232, 0.25)' : 'rgba(53, 213, 232, 0.18)';
  ctx.lineWidth = 1.5;
  const step = 128;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Tactical Sector Coordinates & Military Annotations
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = mode === 'warzone-flir' ? 'rgba(53, 213, 232, 0.6)' : 'rgba(53, 213, 232, 0.45)';
  const sectors = ['ALPHA-01', 'BRAVO-02', 'CHARLIE-03', 'DELTA-04', 'ECHO-05', 'FOXTROT-06', 'GOLF-07', 'HOTEL-08'];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const label = `${sectors[(i + j) % 8]}`;
      ctx.fillText(label, i * step + 8, j * step + 20);
      // Small tactical tick
      ctx.strokeRect(i * step + 4, j * step + 4, 6, 6);
    }
  }

  // Scorch Marks & Bomb Blast Craters
  const craters = [
    { x: 260, y: 720, r: 65 },
    { x: 310, y: 680, r: 45 },
    { x: 780, y: 320, r: 85 },
    { x: 840, y: 400, r: 50 },
    { x: 180, y: 220, r: 60 },
  ];
  for (const c of craters) {
    const blastGrad = ctx.createRadialGradient(c.x, c.y, 5, c.x, c.y, c.r);
    blastGrad.addColorStop(0, '#05070a');
    blastGrad.addColorStop(0.5, '#151310');
    blastGrad.addColorStop(0.85, '#201812');
    blastGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = blastGrad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();

    // Shockwave ring
    ctx.strokeStyle = 'rgba(255, 89, 100, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Tank & Armored Vehicle Tracks (Ruts in the dirt)
  ctx.strokeStyle = 'rgba(15, 12, 10, 0.65)';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  // Route 1 towards base
  ctx.moveTo(100, 950);
  ctx.quadraticCurveTo(350, 600, 512, 512);
  ctx.moveTo(116, 950);
  ctx.quadraticCurveTo(366, 600, 528, 512);
  // Route 2 towards radar outpost
  ctx.moveTo(900, 950);
  ctx.quadraticCurveTo(700, 650, 512, 512);
  ctx.moveTo(916, 950);
  ctx.quadraticCurveTo(716, 650, 528, 512);
  ctx.stroke();
  ctx.setLineDash([]);

  // Central Forward Operating Base (FOB) Landing Apron
  ctx.save();
  ctx.translate(512, 512);
  // Concrete hexagon apron
  ctx.fillStyle = '#222d3b';
  ctx.beginPath();
  const hexR = 140;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const hx = Math.cos(angle) * hexR;
    const hy = Math.sin(angle) * hexR;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();

  // Yellow & Black Perimeter Warning Chevrons
  ctx.strokeStyle = '#F5B82E';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Tactical Helipad Cross & Stencils
  ctx.strokeStyle = '#35D5E8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 75, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = 'bold 52px monospace';
  ctx.fillStyle = '#35D5E8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('H', 0, -2);

  // Arabic FOB Sovereign Title
  ctx.font = 'bold 15px "IBM Plex Sans Arabic", sans-serif';
  ctx.direction = 'rtl';
  ctx.fillStyle = '#EDF4FA';
  ctx.fillText('قاعدة العمليات المتقدمة - عَصَب', 0, 48);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Builds the comprehensive 3D military battlefield theater
 */
export function buildBattlefieldTheater(initialMode: BattlefieldEnvironmentMode = 'warzone-day'): BattlefieldTheaterInstance {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'BattlefieldTheaterRoot';

  // 1. Procedural Topographical Combat Terrain with Heightmap (Mountains, Valleys, Strategic Roads & FOB)
  const terrainWidth = 180;
  const terrainDepth = 180;
  const segments = 110;
  const terrainGeo = new THREE.PlaneGeometry(terrainWidth, terrainDepth, segments, segments);
  terrainGeo.rotateX(-Math.PI / 2);

  // Displace vertices to create majestic mountain ridges (جبال), tactical valleys (وديان), strategic roads, and blast craters
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);

    // Keep central FOB landing apron flat
    const distFromCenter = Math.sqrt(x * x + z * z);
    if (distFromCenter < 16) {
      posAttr.setY(i, 0.1);
      continue;
    }

    // Blend outer terrain
    const blend = Math.min(1, (distFromCenter - 16) / 24);

    // Base rolling desert terrain & dunes
    let elevation =
      Math.sin(x * 0.038) * Math.cos(z * 0.038) * 4.2 +
      Math.sin(x * 0.08 + z * 0.06) * 2.5 +
      Math.cos(x * 0.14 - z * 0.11) * 1.2;

    // 1. Majestic Mountain Ranges (جبال) along Northern and Western Periphery
    const northernMountainDist = Math.abs(z + 65);
    const westernMountainDist = Math.abs(x + 65);
    if (z < -35) {
      const ridgeFactor = Math.max(0, 1 - (northernMountainDist / 35));
      const jaggedPeaks = Math.abs(Math.sin(x * 0.12) * Math.cos(z * 0.12)) * 18.0 + ridgeFactor * 14.0;
      elevation += jaggedPeaks;
    }
    if (x < -45) {
      const ridgeFactor = Math.max(0, 1 - (westernMountainDist / 35));
      const westernPeaks = Math.abs(Math.cos(x * 0.1) * Math.sin(z * 0.09)) * 16.0 + ridgeFactor * 12.0;
      elevation += westernPeaks;
    }

    // 2. Carved Tactical Valleys (وديان) between ridges
    const valleyCurve = Math.sin(x * 0.05) * 12;
    const valleyDist = Math.abs((z - 15) - valleyCurve);
    if (valleyDist < 10 && z < 20 && z > -25) {
      const valleyDepth = (1 - valleyDist / 10) * 5.5;
      elevation -= valleyDepth;
    }

    // 3. Strategic Logistics Roads (طرق استراتيجية) - Flattened paths for supply trucks & armor
    const road1Dist = Math.abs(x - (z * 0.6)); // Road from FOB to North
    const road2Dist = Math.abs(z + (x * 0.4) + 10); // Road across sector
    if (road1Dist < 3.2 || road2Dist < 3.2) {
      elevation = elevation * 0.25; // Flatten into supply roadway
    }

    // Bomb blast crater depressions
    const crater1Dist = Math.hypot(x - 35, z + 40);
    if (crater1Dist < 12) {
      elevation -= Math.cos((crater1Dist / 12) * (Math.PI / 2)) * 3.5;
    }
    const crater2Dist = Math.hypot(x + 45, z - 30);
    if (crater2Dist < 14) {
      elevation -= Math.cos((crater2Dist / 14) * (Math.PI / 2)) * 4.0;
    }

    // Defensive frontline trench zig-zag cut
    if (z > 40 && z < 48 && Math.abs(x) < 60) {
      const trenchCenter = 44 + Math.sin(x * 0.22) * 2.5;
      const trenchDist = Math.abs(z - trenchCenter);
      if (trenchDist < 2.8) {
        elevation -= (1 - trenchDist / 2.8) * 2.5;
      }
    }

    posAttr.setY(i, elevation);
  }
  terrainGeo.computeVertexNormals();

  const groundTexture = createBattlefieldGroundTexture(initialMode);
  const terrainMat = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: false,
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  terrainMesh.position.y = -0.05;
  rootGroup.add(terrainMesh);

  // 2. Forward Operating Base (FOB) Structures Group
  const fobGroup = new THREE.Group();
  fobGroup.name = 'FOB_Structures';

  // Concrete HESCO Blast Walls / Perimeter Barriers
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x3d4b3a, // Military olive drab / sand
    roughness: 0.85,
    metalness: 0.15,
  });

  const barrierGeo = new THREE.BoxGeometry(2.4, 1.2, 0.7);
  // Place perimeter walls in a secure octagonal boundary around FOB
  const wallRadius = 15;
  const wallSegments = 24;
  for (let i = 0; i < wallSegments; i++) {
    // Leave gate openings at north and south
    if (i === 0 || i === 1 || i === 12 || i === 13) continue;
    const angle = (i / wallSegments) * Math.PI * 2;
    const wx = Math.cos(angle) * wallRadius;
    const wz = Math.sin(angle) * wallRadius;
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.position.set(wx, 0.6, wz);
    barrier.rotation.y = -angle + Math.PI / 2;
    barrier.castShadow = true;
    barrier.receiveShadow = true;
    fobGroup.add(barrier);
  }

  // Hardened Tactical Command Bunker
  const bunkerGeo = new THREE.BoxGeometry(7, 2.4, 5);
  const bunkerMat = new THREE.MeshStandardMaterial({
    color: 0x1f2a38,
    roughness: 0.7,
    metalness: 0.3,
  });
  const bunker = new THREE.Mesh(bunkerGeo, bunkerMat);
  bunker.position.set(-9, 1.2, -6);
  bunker.castShadow = true;
  bunker.receiveShadow = true;
  fobGroup.add(bunker);

  // Bunker Roof Satellite Terminal Dish
  const bunkerDishGeo = new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4);
  const dishMat = new THREE.MeshStandardMaterial({ color: 0x35d5e8, roughness: 0.3, metalness: 0.8 });
  const bunkerDish = new THREE.Mesh(bunkerDishGeo, dishMat);
  bunkerDish.rotation.x = -Math.PI / 3;
  bunkerDish.position.set(-9, 2.8, -6);
  fobGroup.add(bunkerDish);

  // Stacked Military Cargo Containers (ISO Containers)
  const containerGeo = new THREE.BoxGeometry(5.2, 1.8, 2.0);
  const containerColors = [0x4d5b45, 0x5a4a35, 0x1a2636];
  const containerPositions = [
    { x: -9.5, y: 0.9, z: 4.5, rot: 0.2, c: 0 },
    { x: -9.5, y: 2.7, z: 4.5, rot: 0.2, c: 1 },
    { x: 9.5, y: 0.9, z: 3.5, rot: -0.4, c: 2 },
    { x: 9.5, y: 0.9, z: 6.0, rot: -0.35, c: 0 },
  ];
  containerPositions.forEach((pos) => {
    const cMat = new THREE.MeshStandardMaterial({
      color: containerColors[pos.c],
      roughness: 0.65,
      metalness: 0.4,
    });
    const cont = new THREE.Mesh(containerGeo, cMat);
    cont.position.set(pos.x, pos.y, pos.z);
    cont.rotation.y = pos.rot;
    cont.castShadow = true;
    cont.receiveShadow = true;
    fobGroup.add(cont);
  });

  // Early Warning Air Defense Radar & Communications Mast
  const radarGroup = new THREE.Group();
  radarGroup.position.set(11, 0, -8);

  // Mast trellis structure
  const mastGeo = new THREE.CylinderGeometry(0.2, 0.45, 8.5, 6);
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x223246, roughness: 0.5, metalness: 0.8 });
  const mast = new THREE.Mesh(mastGeo, mastMat);
  mast.position.y = 4.25;
  mast.castShadow = true;
  radarGroup.add(mast);

  // Cross arms & platform
  const platGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.2, 8);
  const plat = new THREE.Mesh(platGeo, mastMat);
  plat.position.y = 8.5;
  radarGroup.add(plat);

  // Rotating Radar Array Dish
  const radarDishGeo = new THREE.BoxGeometry(3.6, 1.2, 0.35);
  const radarDishMat = new THREE.MeshStandardMaterial({
    color: 0x35d5e8,
    roughness: 0.3,
    metalness: 0.85,
    emissive: 0x113344,
  });
  const radarDish = new THREE.Mesh(radarDishGeo, radarDishMat);
  radarDish.position.y = 9.4;
  radarDish.castShadow = true;
  radarGroup.add(radarDish);

  // Red blinking obstacle strobe light on mast tip
  const mastLight = new THREE.PointLight(0xff3344, 2.5, 30);
  mastLight.position.set(0, 10.2, 0);
  radarGroup.add(mastLight);

  fobGroup.add(radarGroup);

  // Watchtower with Searchlight
  const towerGroup = new THREE.Group();
  towerGroup.position.set(12, 0, 11);

  const towerLegsGeo = new THREE.CylinderGeometry(0.12, 0.22, 5.5, 4);
  const towerLegsMat = new THREE.MeshStandardMaterial({ color: 0x1c2b3d, roughness: 0.6, metalness: 0.7 });
  const towerLegs = new THREE.Mesh(towerLegsGeo, towerLegsMat);
  towerLegs.position.y = 2.75;
  towerGroup.add(towerLegs);

  const towerCabinGeo = new THREE.BoxGeometry(2.4, 1.6, 2.4);
  const towerCabin = new THREE.Mesh(towerCabinGeo, bunkerMat);
  towerCabin.position.y = 6.2;
  towerCabin.castShadow = true;
  towerGroup.add(towerCabin);

  // Searchlight beam
  const searchlightGroup = new THREE.Group();
  searchlightGroup.position.set(0, 7.2, 0);

  const searchLightConeGeo = new THREE.ConeGeometry(3.5, 24, 16, 1, true);
  searchLightConeGeo.rotateX(Math.PI / 2);
  const searchLightConeMat = new THREE.MeshBasicMaterial({
    color: 0x35d5e8,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const searchlightCone = new THREE.Mesh(searchLightConeGeo, searchLightConeMat);
  searchlightCone.position.set(0, 0, 12);
  searchlightGroup.add(searchlightCone);

  const spot = new THREE.SpotLight(0x35d5e8, 8, 40, Math.PI / 6, 0.4);
  spot.position.set(0, 0, 0);
  spot.target.position.set(0, -6, 25);
  searchlightGroup.add(spot);
  searchlightGroup.add(spot.target);

  towerGroup.add(searchlightGroup);
  fobGroup.add(towerGroup);

  // Tactical Patriot / Surface-to-Air Missile (SAM) Launcher Battery
  const samGroup = new THREE.Group();
  samGroup.position.set(-11, 0, 10);
  samGroup.rotation.y = Math.PI / 4;

  const samBaseGeo = new THREE.BoxGeometry(4.5, 0.8, 2.6);
  const samBaseMat = new THREE.MeshStandardMaterial({ color: 0x273626, roughness: 0.7, metalness: 0.3 });
  const samBase = new THREE.Mesh(samBaseGeo, samBaseMat);
  samBase.position.y = 0.4;
  samBase.castShadow = true;
  samGroup.add(samBase);

  // Missile Launch Canisters (Quad Box) angled at 65 degrees
  const samBoxGeo = new THREE.BoxGeometry(3.6, 1.2, 1.8);
  const samBox = new THREE.Mesh(samBoxGeo, samBaseMat);
  samBox.rotation.z = 0.45; // Angled skyward
  samBox.position.set(0.4, 2.0, 0);
  samBox.castShadow = true;
  samGroup.add(samBox);

  // 4 Missile tips visible
  for (let my = -0.3; my <= 0.3; my += 0.6) {
    for (let mz = -0.5; mz <= 0.5; mz += 1.0) {
      const tipGeo = new THREE.ConeGeometry(0.18, 0.6, 8);
      tipGeo.rotateZ(-Math.PI / 2 + 0.45);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(2.4, 2.9 + my, mz);
      samGroup.add(tip);
    }
  }

  fobGroup.add(samGroup);

  // Runway / Helipad Perimeter Threshold Lights (Green and Amber LED points)
  const runwayLights: THREE.PointLight[] = [];
  const lightColors = [0x3ddc97, 0xf5b82e, 0x35d5e8];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const lx = Math.cos(angle) * 7.5;
    const lz = Math.sin(angle) * 7.5;

    // Small light fixture post
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6);
    const postMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(lx, 0.12, lz);
    fobGroup.add(post);

    const ptLight = new THREE.PointLight(lightColors[i % 3], 0.8, 6);
    ptLight.position.set(lx, 0.28, lz);
    fobGroup.add(ptLight);
    runwayLights.push(ptLight);
  }

  // Armored Combat Vehicles (Tanks & APCs) across the battlefield
  const armoredGroup = new THREE.Group();
  armoredGroup.name = 'ArmoredVehicles';

  const hullMat = new THREE.MeshStandardMaterial({ color: 0x364132, roughness: 0.7, metalness: 0.3 });
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.5 });
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.8 });

  function createTank(x: number, z: number, rotation: number) {
    const tankGroup = new THREE.Group();
    tankGroup.position.set(x, 0, z);
    tankGroup.rotation.y = rotation;

    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 4.2), hullMat);
    hull.position.y = 0.45;
    hull.castShadow = true;
    tankGroup.add(hull);

    const turret = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 2.0), hullMat);
    turret.position.set(0, 1.15, 0.2);
    turret.castShadow = true;
    tankGroup.add(turret);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 12), gunMat);
    barrel.rotateX(Math.PI / 2);
    barrel.position.set(0, 1.3, 1.8);
    tankGroup.add(barrel);

    for (const sx of [-1.3, 1.3]) {
      const track = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 4.4), trackMat);
      track.position.set(sx, 0.35, 0);
      tankGroup.add(track);
    }
    return tankGroup;
  }

  armoredGroup.add(createTank(-24, 20, 0.6));
  armoredGroup.add(createTank(26, -28, -1.1));
  armoredGroup.add(createTank(35, 22, 2.2));
  armoredGroup.add(createTank(-32, -18, 1.5));
  fobGroup.add(armoredGroup);

  rootGroup.add(fobGroup);

  // 3. Smoke Particles Rising from Impact / Battle Craters
  const smokeCount = 180;
  const smokePositions = new Float32Array(smokeCount * 3);
  const smokeSizes = new Float32Array(smokeCount);
  const smokeAlphas = new Float32Array(smokeCount);
  const smokeOrigins = [
    { x: 35, y: -0.5, z: -40 },
    { x: -45, y: -0.5, z: 30 },
    { x: 55, y: 1.0, z: 45 },
  ];

  for (let i = 0; i < smokeCount; i++) {
    const origin = smokeOrigins[i % smokeOrigins.length];
    const progress = Math.random(); // 0 to 1 along column
    smokePositions[i * 3] = origin.x + (Math.random() - 0.5) * progress * 14 + progress * 8; // Wind drift
    smokePositions[i * 3 + 1] = origin.y + progress * 28; // Rising altitude
    smokePositions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * progress * 14;
    smokeSizes[i] = 2.0 + progress * 6.5;
    smokeAlphas[i] = (1 - progress) * 0.45;
  }

  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
  smokeGeo.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));

  // Procedural Smoke Texture
  const smokeCanvas = document.createElement('canvas');
  smokeCanvas.width = 64;
  smokeCanvas.height = 64;
  const sCtx = smokeCanvas.getContext('2d')!;
  const sGrad = sCtx.createRadialGradient(32, 32, 4, 32, 32, 30);
  sGrad.addColorStop(0, 'rgba(120, 110, 100, 0.8)');
  sGrad.addColorStop(0.5, 'rgba(80, 75, 70, 0.4)');
  sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 64, 64);
  const smokeTex = new THREE.CanvasTexture(smokeCanvas);

  const smokeMat = new THREE.PointsMaterial({
    map: smokeTex,
    size: 4.5,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.NormalBlending,
    color: 0x887766,
  });

  const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
  rootGroup.add(smokeParticles);

  // 4. Tactical Threat Dome & Target Waypoints
  const threatDomesGroup = new THREE.Group();
  threatDomesGroup.name = 'TacticalThreatOverlays';

  // Red Hostile SAM Engagement Envelope Dome (Distant wireframe sphere)
  const domeGeo = new THREE.SphereGeometry(32, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const domeMat = new THREE.MeshBasicMaterial({
    color: 0xff3b47,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  });
  const domeMesh = new THREE.Mesh(domeGeo, domeMat);
  domeMesh.position.set(50, 0, -45);
  threatDomesGroup.add(domeMesh);

  // Target lock ring above crater 1
  const targetRingGeo = new THREE.RingGeometry(4, 4.4, 32);
  targetRingGeo.rotateX(-Math.PI / 2);
  const targetRingMat = new THREE.MeshBasicMaterial({
    color: 0xff5964,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
  targetRing.position.set(35, 1.5, -40);
  threatDomesGroup.add(targetRing);

  // Friendly Sovereign Recon Waypoint Beacons (Cyan holographic rings)
  const wpPoints = [
    new THREE.Vector3(-25, 8, -25),
    new THREE.Vector3(25, 12, 30),
    new THREE.Vector3(0, 16, -35),
  ];
  wpPoints.forEach((pt, idx) => {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.08, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x35d5e8, transparent: true, opacity: 0.75 })
    );
    torus.position.copy(pt);
    torus.rotation.x = Math.PI / 2;
    threatDomesGroup.add(torus);

    // Vertical beacon drop line to ground
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(pt.x, 0, pt.z),
      new THREE.Vector3(pt.x, pt.y, pt.z),
    ]);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x35d5e8,
      dashSize: 1,
      gapSize: 0.6,
      transparent: true,
      opacity: 0.45,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();
    threatDomesGroup.add(line);
  });

  rootGroup.add(threatDomesGroup);

  // Mode switcher to dynamically alter scene atmosphere and fog
  const setMode = (mode: BattlefieldEnvironmentMode, scene: THREE.Scene) => {
    if (mode === 'hangar-studio') {
      rootGroup.visible = false;
      scene.background = new THREE.Color(0x080d16);
      scene.fog = new THREE.FogExp2(0x080d16, 0.022);
      return;
    }

    rootGroup.visible = true;

    if (mode === 'warzone-day') {
      scene.background = new THREE.Color(0x1a212d);
      scene.fog = new THREE.FogExp2(0x1a212d, 0.009);
      terrainMat.color.setHex(0xffffff);
      smokeMat.color.setHex(0x776655);
      smokeMat.opacity = 0.35;
    } else if (mode === 'warzone-night') {
      scene.background = new THREE.Color(0x050a12);
      scene.fog = new THREE.FogExp2(0x050a12, 0.014);
      terrainMat.color.setHex(0x556677);
      smokeMat.color.setHex(0x223344);
      smokeMat.opacity = 0.25;
    } else if (mode === 'warzone-flir') {
      // High contrast thermal
      scene.background = new THREE.Color(0x03060a);
      scene.fog = new THREE.FogExp2(0x03060a, 0.016);
      terrainMat.color.setHex(0x223344);
      smokeMat.color.setHex(0x5588aa);
      smokeMat.opacity = 0.4;
    } else if (mode === 'warzone-sandstorm') {
      scene.background = new THREE.Color(0x382818);
      scene.fog = new THREE.FogExp2(0x382818, 0.025);
      terrainMat.color.setHex(0xbba588);
      smokeMat.color.setHex(0xaa8866);
      smokeMat.opacity = 0.55;
    }
  };

  // Run initial mode setup
  // (Caller passes scene in canvas useEffect)

  // Per-frame animation update for smoke, radar dish, searchlight, and runway beacons
  const update = (delta: number, elapsed: number) => {
    // 1. Rotate radar dish
    radarDish.rotation.y = elapsed * 1.4;

    // 2. Sweep searchlight
    searchlightGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.75 + Math.PI / 4;
    searchlightGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.15;

    // 3. Blink runway lights & obstacle mast strobe
    const blinkCycle = Math.sin(elapsed * 4);
    mastLight.intensity = blinkCycle > 0.4 ? 4.0 : 0.2;

    runwayLights.forEach((light, idx) => {
      light.intensity = 0.6 + Math.sin(elapsed * 3 + idx * 0.8) * 0.4;
    });

    // 4. Animate rising smoke particles
    const positions = smokeGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < smokeCount; i++) {
      const idx = i * 3;
      // Drift upwards
      positions[idx + 1] += delta * (4.2 + (i % 3));
      // Drift with simulated wind
      positions[idx] += delta * 1.5;

      // Reset when reaching smoke ceiling
      if (positions[idx + 1] > 32) {
        const origin = smokeOrigins[i % smokeOrigins.length];
        positions[idx] = origin.x + (Math.random() - 0.5) * 2;
        positions[idx + 1] = origin.y + Math.random() * 2;
        positions[idx + 2] = origin.z + (Math.random() - 0.5) * 2;
      }
    }
    smokeGeo.attributes.position.needsUpdate = true;

    // 5. Spin target lock ring
    targetRing.rotation.z = elapsed * 0.9;
  };

  const dispose = () => {
    terrainGeo.dispose();
    terrainMat.dispose();
    groundTexture.dispose();
    barrierGeo.dispose();
    barrierMat.dispose();
    bunkerGeo.dispose();
    bunkerMat.dispose();
    bunkerDishGeo.dispose();
    dishMat.dispose();
    containerGeo.dispose();
    mastGeo.dispose();
    mastMat.dispose();
    radarDishGeo.dispose();
    radarDishMat.dispose();
    smokeGeo.dispose();
    smokeMat.dispose();
    smokeTex.dispose();
    domeGeo.dispose();
    domeMat.dispose();
    targetRingGeo.dispose();
    targetRingMat.dispose();
  };

  return {
    rootGroup,
    terrainMesh,
    fobGroup,
    smokeParticles,
    threatDomesGroup,
    searchlightGroup,
    radarDish,
    runwayLights,
    update,
    setMode,
    dispose,
  };
}
