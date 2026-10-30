/**
 * ASAB | AEROLAB 3D - Procedural VTOL Aircraft 3D Model
 * High-fidelity composite aircraft model with 14+ addressable components for 3D Studio & Airspace.
 */

import * as THREE from 'three';

export interface AircraftMeshPart {
  mesh: THREE.Object3D;
  componentId: string;
  basePosition: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]>;
}

export function buildAircraftModel(): {
  rootGroup: THREE.Group;
  parts: Map<string, AircraftMeshPart>;
  rotorBlades: THREE.Object3D[];
  pusherBlade: THREE.Object3D | null;
  dispose: () => void;
} {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'ASAB_V100_AIRCRAFT';

  const parts = new Map<string, AircraftMeshPart>();
  const rotorBlades: THREE.Object3D[] = [];
  let pusherBlade: THREE.Object3D | null = null;

  // Materials with varied roughness and metalness
  const carbonDarkMat = new THREE.MeshStandardMaterial({
    color: 0x141b24,
    roughness: 0.35,
    metalness: 0.65,
  });

  const carbonAccentMat = new THREE.MeshStandardMaterial({
    color: 0x223246,
    roughness: 0.25,
    metalness: 0.85,
  });

  const canopyGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a1c2a,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.75,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const radomeMat = new THREE.MeshStandardMaterial({
    color: 0x2e3c4d,
    roughness: 0.5,
    metalness: 0.2,
  });

  const motorMetalMat = new THREE.MeshStandardMaterial({
    color: 0x3d4b5c,
    roughness: 0.2,
    metalness: 0.9,
  });

  const rotorCarbonMat = new THREE.MeshStandardMaterial({
    color: 0x0d131a,
    roughness: 0.4,
    metalness: 0.5,
  });

  const cyanEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0x112233,
    emissive: 0x35d5e8,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.5,
  });

  const goldBatteryMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.3,
    metalness: 0.8,
  });

  const redNavMat = new THREE.MeshStandardMaterial({
    color: 0xff3344,
    emissive: 0xff2233,
    emissiveIntensity: 0.8,
  });

  const greenNavMat = new THREE.MeshStandardMaterial({
    color: 0x22ff66,
    emissive: 0x22ee55,
    emissiveIntensity: 0.8,
  });

  const sensorGlassMat = new THREE.MeshStandardMaterial({
    color: 0x082030,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x1a8cff,
    emissiveIntensity: 0.4,
  });

  // Track all created geometries and materials for disposal
  const geometries: THREE.BufferGeometry[] = [];
  const materials = [
    carbonDarkMat,
    carbonAccentMat,
    canopyGlassMat,
    radomeMat,
    motorMetalMat,
    rotorCarbonMat,
    cyanEmissiveMat,
    goldBatteryMat,
    redNavMat,
    greenNavMat,
    sensorGlassMat,
  ];

  function registerPart(
    id: string,
    object: THREE.Object3D,
    basePos: THREE.Vector3,
    explodeOffset: THREE.Vector3
  ) {
    object.position.copy(basePos);
    object.userData = { componentId: id };

    const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    object.traverse((child) => {
      child.userData = { componentId: id };
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        originalMaterials.set(child, child.material);
      }
    });

    parts.set(id, {
      mesh: object,
      componentId: id,
      basePosition: basePos.clone(),
      explodeOffset: explodeOffset.clone(),
      originalMaterials,
    });

    rootGroup.add(object);
  }

  // 1. FUSELAGE MAIN
  {
    const fuselageGroup = new THREE.Group();
    // Main fuselage body: aerodynamic extruded/scaled capsule
    const bodyGeo = new THREE.CylinderGeometry(0.32, 0.22, 2.4, 24, 8);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.scale(1.2, 0.8, 1.0);
    geometries.push(bodyGeo);
    const bodyMesh = new THREE.Mesh(bodyGeo, carbonDarkMat);
    fuselageGroup.add(bodyMesh);

    // Upper aerodynamic spine
    const spineGeo = new THREE.BoxGeometry(0.28, 0.16, 1.8);
    spineGeo.translate(0, 0.22, -0.1);
    geometries.push(spineGeo);
    const spineMesh = new THREE.Mesh(spineGeo, carbonAccentMat);
    fuselageGroup.add(spineMesh);

    // Cockpit / avionics canopy window
    const canopyGeo = new THREE.SphereGeometry(0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    canopyGeo.scale(0.85, 0.5, 1.6);
    canopyGeo.translate(0, 0.18, 0.35);
    geometries.push(canopyGeo);
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyGlassMat);
    fuselageGroup.add(canopyMesh);

    registerPart('comp_fuselage_main', fuselageGroup, new THREE.Vector3(0, 0.6, 0), new THREE.Vector3(0, 0, 0));
  }

  // 2. NOSE RADOME
  {
    const noseGroup = new THREE.Group();
    const noseGeo = new THREE.ConeGeometry(0.28, 0.85, 24);
    noseGeo.rotateX(Math.PI / 2);
    noseGeo.scale(1.1, 0.75, 1.0);
    geometries.push(noseGeo);
    const noseMesh = new THREE.Mesh(noseGeo, radomeMat);
    noseMesh.position.set(0, 0, 0.42);
    noseGroup.add(noseMesh);

    // Pitot-Static probe
    const probeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8);
    probeGeo.rotateX(Math.PI / 2);
    geometries.push(probeGeo);
    const probeMesh = new THREE.Mesh(probeGeo, motorMetalMat);
    probeMesh.position.set(0, 0, 0.95);
    noseGroup.add(probeMesh);

    registerPart('comp_nose_radome', noseGroup, new THREE.Vector3(0, 0.6, 1.2), new THREE.Vector3(0, 0, 1.6));
  }

  // 3. WING LEFT (PORT)
  {
    const wingLGroup = new THREE.Group();
    // Swept trapezoidal wing
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.35);
    wingShape.lineTo(-1.8, 0.15);
    wingShape.lineTo(-1.8, -0.12);
    wingShape.lineTo(0, -0.35);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.045, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.012, bevelThickness: 0.012 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.rotateX(Math.PI / 2);
    geometries.push(wingGeo);
    const wingMesh = new THREE.Mesh(wingGeo, carbonDarkMat);
    wingLGroup.add(wingMesh);

    // Aileron trim panel
    const aileronGeo = new THREE.BoxGeometry(0.8, 0.02, 0.1);
    aileronGeo.translate(-1.2, 0.01, -0.25);
    geometries.push(aileronGeo);
    const aileronMesh = new THREE.Mesh(aileronGeo, carbonAccentMat);
    wingLGroup.add(aileronMesh);

    registerPart('comp_wing_left', wingLGroup, new THREE.Vector3(-0.35, 0.65, 0.1), new THREE.Vector3(-2.2, 0.3, 0));
  }

  // 4. WING RIGHT (STARBOARD)
  {
    const wingRGroup = new THREE.Group();
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.35);
    wingShape.lineTo(1.8, 0.15);
    wingShape.lineTo(1.8, -0.12);
    wingShape.lineTo(0, -0.35);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.045, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.012, bevelThickness: 0.012 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.rotateX(Math.PI / 2);
    geometries.push(wingGeo);
    const wingMesh = new THREE.Mesh(wingGeo, carbonDarkMat);
    wingRGroup.add(wingMesh);

    const aileronGeo = new THREE.BoxGeometry(0.8, 0.02, 0.1);
    aileronGeo.translate(1.2, 0.01, -0.25);
    geometries.push(aileronGeo);
    const aileronMesh = new THREE.Mesh(aileronGeo, carbonAccentMat);
    wingRGroup.add(aileronMesh);

    registerPart('comp_wing_right', wingRGroup, new THREE.Vector3(0.35, 0.65, 0.1), new THREE.Vector3(2.2, 0.3, 0));
  }

  // 5. WINGTIP LEFT (WINGLET)
  {
    const wingletLGroup = new THREE.Group();
    const wingletGeo = new THREE.BoxGeometry(0.04, 0.35, 0.22);
    geometries.push(wingletGeo);
    const wingletMesh = new THREE.Mesh(wingletGeo, carbonAccentMat);
    wingletLGroup.add(wingletMesh);

    // Red tactical strobe
    const strobeGeo = new THREE.SphereGeometry(0.025, 8, 8);
    geometries.push(strobeGeo);
    const strobeMesh = new THREE.Mesh(strobeGeo, redNavMat);
    strobeMesh.position.set(-0.025, 0.16, 0);
    wingletLGroup.add(strobeMesh);

    registerPart('comp_wingtip_left', wingletLGroup, new THREE.Vector3(-2.15, 0.8, 0.12), new THREE.Vector3(-3.2, 0.7, 0));
  }

  // 6. WINGTIP RIGHT (WINGLET)
  {
    const wingletRGroup = new THREE.Group();
    const wingletGeo = new THREE.BoxGeometry(0.04, 0.35, 0.22);
    geometries.push(wingletGeo);
    const wingletMesh = new THREE.Mesh(wingletGeo, carbonAccentMat);
    wingletRGroup.add(wingletMesh);

    // Green tactical strobe
    const strobeGeo = new THREE.SphereGeometry(0.025, 8, 8);
    geometries.push(strobeGeo);
    const strobeMesh = new THREE.Mesh(strobeGeo, greenNavMat);
    strobeMesh.position.set(0.025, 0.16, 0);
    wingletRGroup.add(strobeMesh);

    registerPart('comp_wingtip_right', wingletRGroup, new THREE.Vector3(2.15, 0.8, 0.12), new THREE.Vector3(3.2, 0.7, 0));
  }

  // 7. TAIL BOOMS
  {
    const boomsGroup = new THREE.Group();
    // Port boom
    const boomLGeo = new THREE.CylinderGeometry(0.045, 0.035, 1.9, 12);
    boomLGeo.rotateX(Math.PI / 2);
    geometries.push(boomLGeo);
    const boomL = new THREE.Mesh(boomLGeo, carbonAccentMat);
    boomL.position.set(-0.85, 0, 0);
    boomsGroup.add(boomL);

    // Starboard boom
    const boomRGeo = boomLGeo.clone();
    geometries.push(boomRGeo);
    const boomR = new THREE.Mesh(boomRGeo, carbonAccentMat);
    boomR.position.set(0.85, 0, 0);
    boomsGroup.add(boomR);

    registerPart('comp_tail_booms', boomsGroup, new THREE.Vector3(0, 0.65, -0.6), new THREE.Vector3(0, 0, -1.5));
  }

  // 8. VERTICAL STABILIZERS
  {
    const vertStabGroup = new THREE.Group();
    // Port vertical fin
    const finGeo = new THREE.BoxGeometry(0.03, 0.55, 0.35);
    geometries.push(finGeo);
    const finL = new THREE.Mesh(finGeo, carbonDarkMat);
    finL.position.set(-0.85, 0.25, 0);
    finL.rotation.z = -0.12; // Cant out slightly for stealth/aerodynamics
    vertStabGroup.add(finL);

    // Starboard fin
    const finR = new THREE.Mesh(finGeo, carbonDarkMat);
    finR.position.set(0.85, 0.25, 0);
    finR.rotation.z = 0.12;
    vertStabGroup.add(finR);

    registerPart('comp_stabilizer_vert', vertStabGroup, new THREE.Vector3(0, 0.75, -1.55), new THREE.Vector3(0, 1.4, -2.4));
  }

  // 9. HORIZONTAL STABILIZER / ELEVATOR
  {
    const horizStabGroup = new THREE.Group();
    const horizGeo = new THREE.BoxGeometry(1.7, 0.035, 0.28);
    geometries.push(horizGeo);
    const horizMesh = new THREE.Mesh(horizGeo, carbonDarkMat);
    horizStabGroup.add(horizMesh);

    // Elevator trim flap
    const elevatorGeo = new THREE.BoxGeometry(1.6, 0.02, 0.08);
    elevatorGeo.translate(0, 0, -0.15);
    geometries.push(elevatorGeo);
    const elevatorMesh = new THREE.Mesh(elevatorGeo, carbonAccentMat);
    horizStabGroup.add(elevatorMesh);

    registerPart('comp_stabilizer_horiz', horizStabGroup, new THREE.Vector3(0, 0.7, -1.55), new THREE.Vector3(0, 0.9, -2.8));
  }

  // Helper for VTOL motor nacelles
  function createVTOLUnit(id: string, basePos: THREE.Vector3, explodeOffset: THREE.Vector3) {
    const motorGroup = new THREE.Group();
    // Motor housing nacelle
    const nacelleGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.28, 16);
    geometries.push(nacelleGeo);
    const nacelleMesh = new THREE.Mesh(nacelleGeo, motorMetalMat);
    motorGroup.add(nacelleMesh);

    // Motor rotor hub & blades
    const rotorHub = new THREE.Group();
    rotorHub.position.set(0, 0.16, 0);

    const hubGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12);
    geometries.push(hubGeo);
    const hubMesh = new THREE.Mesh(hubGeo, motorMetalMat);
    rotorHub.add(hubMesh);

    // 2 carbon blades
    const bladeGeo = new THREE.BoxGeometry(0.72, 0.012, 0.05);
    geometries.push(bladeGeo);
    const bladeMesh = new THREE.Mesh(bladeGeo, rotorCarbonMat);
    rotorHub.add(bladeMesh);

    motorGroup.add(rotorHub);
    rotorBlades.push(rotorHub);

    registerPart(id, motorGroup, basePos, explodeOffset);
  }

  // 10, 11, 12, 13: VTOL MOTORS
  createVTOLUnit('comp_vtol_front_l', new THREE.Vector3(-0.85, 0.68, 0.45), new THREE.Vector3(-1.6, 0.7, 1.2));
  createVTOLUnit('comp_vtol_front_r', new THREE.Vector3(0.85, 0.68, 0.45), new THREE.Vector3(1.6, 0.7, 1.2));
  createVTOLUnit('comp_vtol_rear_l', new THREE.Vector3(-0.85, 0.68, -0.45), new THREE.Vector3(-1.6, 0.7, -1.2));
  createVTOLUnit('comp_vtol_rear_r', new THREE.Vector3(0.85, 0.68, -0.45), new THREE.Vector3(1.6, 0.7, -1.2));

  // 14. PUSHER PROPELLER
  {
    const pusherGroup = new THREE.Group();
    const motorMountGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.22, 16);
    motorMountGeo.rotateX(Math.PI / 2);
    geometries.push(motorMountGeo);
    const motorMount = new THREE.Mesh(motorMountGeo, motorMetalMat);
    pusherGroup.add(motorMount);

    const propHub = new THREE.Group();
    propHub.position.set(0, 0, -0.14);

    const spinnerGeo = new THREE.ConeGeometry(0.05, 0.1, 16);
    spinnerGeo.rotateX(-Math.PI / 2);
    geometries.push(spinnerGeo);
    const spinner = new THREE.Mesh(spinnerGeo, motorMetalMat);
    propHub.add(spinner);

    // 3-blade prop
    for (let i = 0; i < 3; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.04, 0.38, 0.012);
      bladeGeo.translate(0, 0.18, 0);
      geometries.push(bladeGeo);
      const blade = new THREE.Mesh(bladeGeo, rotorCarbonMat);
      blade.rotation.z = (i * Math.PI * 2) / 3;
      propHub.add(blade);
    }

    pusherGroup.add(propHub);
    pusherBlade = propHub;

    registerPart('comp_pusher_prop', pusherGroup, new THREE.Vector3(0, 0.6, -1.25), new THREE.Vector3(0, 0, -2.2));
  }

  // 15. AVIONICS BAY & SOVEREIGN MESH PROCESSOR
  {
    const avionicsGroup = new THREE.Group();
    const bayGeo = new THREE.BoxGeometry(0.24, 0.15, 0.38);
    geometries.push(bayGeo);
    const bayMesh = new THREE.Mesh(bayGeo, cyanEmissiveMat);
    avionicsGroup.add(bayMesh);

    // Conformal heat dissipation fins
    for (let i = -2; i <= 2; i++) {
      const finGeo = new THREE.BoxGeometry(0.22, 0.02, 0.01);
      finGeo.translate(0, 0.08, i * 0.06);
      geometries.push(finGeo);
      const fin = new THREE.Mesh(finGeo, motorMetalMat);
      avionicsGroup.add(fin);
    }

    registerPart('comp_avionics_bay', avionicsGroup, new THREE.Vector3(0, 0.64, 0.15), new THREE.Vector3(0, 1.2, 0.2));
  }

  // 16. SOLID STATE BATTERY PACK
  {
    const batteryGroup = new THREE.Group();
    const batGeo = new THREE.BoxGeometry(0.3, 0.18, 0.65);
    geometries.push(batGeo);
    const batMesh = new THREE.Mesh(batGeo, goldBatteryMat);
    batteryGroup.add(batMesh);

    registerPart('comp_battery_pack', batteryGroup, new THREE.Vector3(0, 0.48, -0.05), new THREE.Vector3(0, -1.0, 0));
  }

  // 17. SENSOR GIMBAL
  {
    const sensorGroup = new THREE.Group();
    // Gimbal yoke
    const yokeGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI);
    yokeGeo.rotateX(Math.PI / 2);
    geometries.push(yokeGeo);
    const yoke = new THREE.Mesh(yokeGeo, motorMetalMat);
    sensorGroup.add(yoke);

    // Gimbal sphere
    const sphereGeo = new THREE.SphereGeometry(0.09, 16, 16);
    geometries.push(sphereGeo);
    const sphere = new THREE.Mesh(sphereGeo, carbonAccentMat);
    sensorGroup.add(sphere);

    // Optical lens
    const lensGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16);
    lensGeo.rotateX(Math.PI / 2);
    lensGeo.translate(0, 0, 0.085);
    geometries.push(lensGeo);
    const lens = new THREE.Mesh(lensGeo, sensorGlassMat);
    sensorGroup.add(lens);

    registerPart('comp_sensor_gimbal', sensorGroup, new THREE.Vector3(0, 0.4, 0.85), new THREE.Vector3(0, -1.2, 1.4));
  }

  // 18. LANDING GEAR SKIDS
  {
    const gearGroup = new THREE.Group();
    // Port skid
    const skidGeo = new THREE.BoxGeometry(0.035, 0.025, 1.4);
    geometries.push(skidGeo);
    const skidL = new THREE.Mesh(skidGeo, carbonAccentMat);
    skidL.position.set(-0.45, 0, 0);
    gearGroup.add(skidL);

    // Starboard skid
    const skidR = new THREE.Mesh(skidGeo, carbonAccentMat);
    skidR.position.set(0.45, 0, 0);
    gearGroup.add(skidR);

    // 4 vertical struts
    for (const x of [-0.45, 0.45]) {
      for (const z of [-0.35, 0.35]) {
        const strutGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.38, 8);
        strutGeo.rotateZ((x > 0 ? -1 : 1) * 0.25);
        geometries.push(strutGeo);
        const strut = new THREE.Mesh(strutGeo, motorMetalMat);
        strut.position.set(x * 0.75, 0.19, z);
        gearGroup.add(strut);
      }
    }

    registerPart('comp_landing_gear', gearGroup, new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, -1.6, 0));
  }

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  };

  return { rootGroup, parts, rotorBlades, pusherBlade, dispose };
}
