/**
 * ASAB | AEROLAB 3D - High-Fidelity Procedural VTOL Aircraft 3D Model
 * Premium aerospace digital twin with realistic aerodynamic geometry,
 * multi-layer PBR materials (carbon fiber, brushed titanium, optical dichroic glass),
 * panel line bump mapping, tactical Arabic sovereign decals, and modular CAD disassembly.
 */

import * as THREE from 'three';
import {
  createCarbonFiberTexture,
  createPanelLinesBumpMap,
  createAircraftMarkingsTexture,
  createOpticalGlassTexture,
} from './proceduralTextures';

export interface AircraftMeshPart {
  mesh: THREE.Object3D;
  componentId: string;
  basePosition: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]>;
}

export type AircraftFinishScheme = 'stealth' | 'sovereign' | 'camo' | 'test';

export function buildAircraftModel(scheme: AircraftFinishScheme = 'stealth'): {
  rootGroup: THREE.Group;
  parts: Map<string, AircraftMeshPart>;
  rotorBlades: THREE.Object3D[];
  pusherBlade: THREE.Object3D | null;
  navLights: THREE.Light[];
  setScheme: (newScheme: AircraftFinishScheme) => void;
  dispose: () => void;
} {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'ASAB_SOVEREIGN_VTOL_X100';

  const parts = new Map<string, AircraftMeshPart>();
  const rotorBlades: THREE.Object3D[] = [];
  let pusherBlade: THREE.Object3D | null = null;
  const navLights: THREE.Light[] = [];

  // Procedural Textures
  const carbonTexture = createCarbonFiberTexture();
  const panelBumpMap = createPanelLinesBumpMap();
  let markingsTexture = createAircraftMarkingsTexture(scheme);
  const opticalGlassTexture = createOpticalGlassTexture();

  // Track all created resources for pristine disposal
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [carbonTexture, panelBumpMap, markingsTexture, opticalGlassTexture];

  // Helper to configure material colors based on tactical finish scheme
  function getSchemeColors(s: AircraftFinishScheme) {
    switch (s) {
      case 'sovereign':
        return {
          bodyColor: 0x182433,
          accentColor: 0x1b4332,
          trimColor: 0xd4af37,
          metalness: 0.85,
          roughness: 0.22,
          emissiveColor: 0x35d5e8,
        };
      case 'camo':
        return {
          bodyColor: 0x6e634e,
          accentColor: 0x484234,
          trimColor: 0x8a7f66,
          metalness: 0.35,
          roughness: 0.55,
          emissiveColor: 0xf5b82e,
        };
      case 'test':
        return {
          bodyColor: 0xedf2f7,
          accentColor: 0xff6b00,
          trimColor: 0x1a202c,
          metalness: 0.45,
          roughness: 0.3,
          emissiveColor: 0x35d5e8,
        };
      case 'stealth':
      default:
        return {
          bodyColor: 0x121822,
          accentColor: 0x1e2838,
          trimColor: 0x35d5e8,
          metalness: 0.65,
          roughness: 0.32,
          emissiveColor: 0x35d5e8,
        };
    }
  }

  const initialColors = getSchemeColors(scheme);

  // 1. Primary Airframe Composite Material
  const primaryCompositeMat = new THREE.MeshStandardMaterial({
    color: initialColors.bodyColor,
    roughness: initialColors.roughness,
    metalness: initialColors.metalness,
    map: carbonTexture,
    bumpMap: panelBumpMap,
    bumpScale: 0.025,
  });
  materials.push(primaryCompositeMat);

  // 2. Secondary Structural Trim Material
  const secondaryStructureMat = new THREE.MeshStandardMaterial({
    color: initialColors.accentColor,
    roughness: 0.28,
    metalness: 0.75,
    bumpMap: panelBumpMap,
    bumpScale: 0.015,
  });
  materials.push(secondaryStructureMat);

  // 3. High-Fidelity Cockpit Optical Canopy Glass
  const canopyGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x071524,
    roughness: 0.05,
    metalness: 0.92,
    transparent: true,
    opacity: 0.82,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    transmission: 0.25,
    ior: 1.58,
  });
  materials.push(canopyGlassMat);

  // 4. Aerospace Titanium Alloy
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x8fa2b5,
    roughness: 0.18,
    metalness: 0.95,
  });
  materials.push(titaniumMat);

  // 5. Radome Dielectric Material
  const radomeMat = new THREE.MeshStandardMaterial({
    color: 0x253549,
    roughness: 0.45,
    metalness: 0.15,
    bumpMap: panelBumpMap,
    bumpScale: 0.01,
  });
  materials.push(radomeMat);

  // 6. High-Modulus Carbon Rotor Blade Material
  const rotorCarbonMat = new THREE.MeshStandardMaterial({
    color: 0x0c1118,
    roughness: 0.25,
    metalness: 0.7,
    map: carbonTexture,
  });
  materials.push(rotorCarbonMat);

  // 7. Rotor Blade High-Vis Warning Tip Material
  const rotorTipMat = new THREE.MeshStandardMaterial({
    color: 0xf5b82e,
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0xaa7810,
    emissiveIntensity: 0.35,
  });
  materials.push(rotorTipMat);

  // 8. Sovereign Mesh Processor & Avionics Glow Material
  const avionicsGlowMat = new THREE.MeshStandardMaterial({
    color: 0x112233,
    roughness: 0.2,
    metalness: 0.8,
    emissive: initialColors.emissiveColor,
    emissiveIntensity: 0.8,
  });
  materials.push(avionicsGlowMat);

  // 9. Solid State Battery Gold Electrolyte Material
  const goldBatteryMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.22,
    metalness: 0.9,
  });
  materials.push(goldBatteryMat);

  // 10. Thermal Jet Exhaust Heat Nozzle Material
  const exhaustThermalMat = new THREE.MeshStandardMaterial({
    color: 0x241d24,
    roughness: 0.3,
    metalness: 0.85,
    emissive: 0xff4422,
    emissiveIntensity: 0.45,
  });
  materials.push(exhaustThermalMat);

  // 11. Optical Dichroic Sensor Lens Material
  const opticalSensorMat = new THREE.MeshStandardMaterial({
    color: 0x051829,
    map: opticalGlassTexture,
    roughness: 0.05,
    metalness: 0.95,
    emissive: 0x35d5e8,
    emissiveIntensity: 0.4,
  });
  materials.push(opticalSensorMat);

  // 12. Tactical Navigation Strobe Materials
  const navPortRedMat = new THREE.MeshStandardMaterial({
    color: 0xff1744,
    emissive: 0xff0033,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });
  const navStbdGreenMat = new THREE.MeshStandardMaterial({
    color: 0x00e676,
    emissive: 0x00c853,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });
  materials.push(navPortRedMat, navStbdGreenMat);

  // 13. Decal Plane Material (Arabic Calligraphy & Stencils)
  const decalMat = new THREE.MeshBasicMaterial({
    map: markingsTexture,
    transparent: true,
    opacity: 0.92,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: THREE.DoubleSide,
  });
  materials.push(decalMat);

  // Registration Helper for CAD explosion & component inspection
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

  // -------------------------------------------------------------
  // 1. MAIN FUSELAGE (Faceted Stealth Blended Chine Body)
  // -------------------------------------------------------------
  {
    const fuselageGroup = new THREE.Group();

    // Streamlined aerodynamic lifting fuselage
    const bodyLength = 2.4;
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 0.28);
    bodyShape.lineTo(0.38, 0.12);
    bodyShape.lineTo(0.44, -0.08);
    bodyShape.lineTo(0.24, -0.24);
    bodyShape.lineTo(-0.24, -0.24);
    bodyShape.lineTo(-0.44, -0.08);
    bodyShape.lineTo(-0.38, 0.12);
    bodyShape.closePath();

    const bodyExtrude = new THREE.ExtrudeGeometry(bodyShape, {
      depth: bodyLength,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    bodyExtrude.translate(0, 0, -bodyLength / 2);
    geometries.push(bodyExtrude);
    const bodyMesh = new THREE.Mesh(bodyExtrude, primaryCompositeMat);
    fuselageGroup.add(bodyMesh);

    // Upper Spine Fairing with SATCOM blister
    const spineGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.6, 16);
    spineGeo.rotateX(Math.PI / 2);
    spineGeo.scale(1.0, 0.65, 1.0);
    spineGeo.translate(0, 0.28, 0.1);
    geometries.push(spineGeo);
    const spineMesh = new THREE.Mesh(spineGeo, secondaryStructureMat);
    fuselageGroup.add(spineMesh);

    // SATCOM Teardrop Dome
    const satcomGeo = new THREE.SphereGeometry(0.16, 16, 12);
    satcomGeo.scale(0.8, 0.45, 1.8);
    satcomGeo.translate(0, 0.38, -0.2);
    geometries.push(satcomGeo);
    const satcomMesh = new THREE.Mesh(satcomGeo, radomeMat);
    fuselageGroup.add(satcomMesh);

    // Cockpit Canopy Glass Window
    const canopyGeo = new THREE.SphereGeometry(0.34, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
    canopyGeo.scale(0.85, 0.6, 1.7);
    canopyGeo.translate(0, 0.22, 0.42);
    geometries.push(canopyGeo);
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyGlassMat);
    fuselageGroup.add(canopyMesh);

    // Interior HUD Reticle Projector inside canopy
    const hudProjectorGeo = new THREE.BoxGeometry(0.1, 0.06, 0.12);
    hudProjectorGeo.translate(0, 0.26, 0.55);
    geometries.push(hudProjectorGeo);
    const hudProjector = new THREE.Mesh(hudProjectorGeo, avionicsGlowMat);
    fuselageGroup.add(hudProjector);

    // Tactical Markings / Arabic Calligraphy Decal Plane on Upper Spine
    const decalGeo = new THREE.PlaneGeometry(0.55, 0.55);
    decalGeo.rotateX(-Math.PI / 2);
    decalGeo.translate(0, 0.35, 0.15);
    geometries.push(decalGeo);
    const decalMesh = new THREE.Mesh(decalGeo, decalMat);
    fuselageGroup.add(decalMesh);

    // Conformal AESA Radar Cheeks on left/right flanks
    for (const side of [-1, 1]) {
      const aesaGeo = new THREE.BoxGeometry(0.04, 0.14, 0.45);
      aesaGeo.translate(side * 0.44, 0.05, 0.6);
      geometries.push(aesaGeo);
      const aesaMesh = new THREE.Mesh(aesaGeo, radomeMat);
      fuselageGroup.add(aesaMesh);
    }

    registerPart('comp_fuselage_main', fuselageGroup, new THREE.Vector3(0, 0.62, 0), new THREE.Vector3(0, 0, 0));
  }

  // -------------------------------------------------------------
  // 2. NOSE RADOME & PITOT-STATIC SENSORS
  // -------------------------------------------------------------
  {
    const noseGroup = new THREE.Group();

    // Ogive Radome
    const noseGeo = new THREE.ConeGeometry(0.32, 0.95, 24);
    noseGeo.rotateX(Math.PI / 2);
    noseGeo.scale(1.15, 0.8, 1.0);
    geometries.push(noseGeo);
    const noseMesh = new THREE.Mesh(noseGeo, radomeMat);
    noseMesh.position.set(0, 0, 0.48);
    noseGroup.add(noseMesh);

    // Pitot-Static Mast Probe
    const probeGeo = new THREE.CylinderGeometry(0.012, 0.008, 0.35, 12);
    probeGeo.rotateX(Math.PI / 2);
    geometries.push(probeGeo);
    const probeMesh = new THREE.Mesh(probeGeo, titaniumMat);
    probeMesh.position.set(0, 0, 1.05);
    noseGroup.add(probeMesh);

    // Angle of Attack (AoA) Vanes
    for (const angle of [0, Math.PI / 2]) {
      const vaneGeo = new THREE.BoxGeometry(0.004, 0.05, 0.04);
      vaneGeo.rotateZ(angle);
      geometries.push(vaneGeo);
      const vane = new THREE.Mesh(vaneGeo, titaniumMat);
      vane.position.set(0, 0, 0.92);
      noseGroup.add(vane);
    }

    registerPart('comp_nose_radome', noseGroup, new THREE.Vector3(0, 0.62, 1.25), new THREE.Vector3(0, 0, 1.6));
  }

  // -------------------------------------------------------------
  // 3 & 4. HIGH-ASPECT SWEPT WINGS (PORT & STARBOARD)
  // -------------------------------------------------------------
  function buildWing(isPort: boolean) {
    const wingGroup = new THREE.Group();
    const sign = isPort ? -1 : 1;

    // Swept trapezoidal wing with aerodynamic camber
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.42);
    wingShape.lineTo(sign * 1.9, 0.22);
    wingShape.lineTo(sign * 1.9, -0.14);
    wingShape.lineTo(0, -0.42);
    wingShape.closePath();

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.052,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    wingGeo.rotateX(Math.PI / 2);
    geometries.push(wingGeo);
    const wingMesh = new THREE.Mesh(wingGeo, primaryCompositeMat);
    wingGroup.add(wingMesh);

    // Control Surface: Articulated Aileron
    const aileronGeo = new THREE.BoxGeometry(0.9, 0.024, 0.12);
    aileronGeo.translate(sign * 1.28, 0.008, -0.28);
    geometries.push(aileronGeo);
    const aileronMesh = new THREE.Mesh(aileronGeo, secondaryStructureMat);
    wingGroup.add(aileronMesh);

    // Vortex Generators along leading edge
    for (let i = 1; i <= 4; i++) {
      const vgGeo = new THREE.BoxGeometry(0.015, 0.02, 0.04);
      vgGeo.translate(sign * (0.4 + i * 0.32), 0.038, 0.15 - i * 0.03);
      geometries.push(vgGeo);
      const vgMesh = new THREE.Mesh(vgGeo, titaniumMat);
      wingGroup.add(vgMesh);
    }

    return wingGroup;
  }

  // Port Wing
  const wingL = buildWing(true);
  registerPart('comp_wing_left', wingL, new THREE.Vector3(-0.38, 0.68, 0.1), new THREE.Vector3(-2.4, 0.4, 0));

  // Starboard Wing
  const wingR = buildWing(false);
  registerPart('comp_wing_right', wingR, new THREE.Vector3(0.38, 0.68, 0.1), new THREE.Vector3(2.4, 0.4, 0));

  // -------------------------------------------------------------
  // 5 & 6. WINGLETS & TACTICAL STROBES
  // -------------------------------------------------------------
  function buildWinglet(isPort: boolean) {
    const wingletGroup = new THREE.Group();
    const sign = isPort ? -1 : 1;

    // Aerodynamic canted blended winglet
    const wingletShape = new THREE.Shape();
    wingletShape.moveTo(0, 0);
    wingletShape.lineTo(0.05, 0.42);
    wingletShape.lineTo(0.24, 0.38);
    wingletShape.lineTo(0.32, 0);
    wingletShape.closePath();

    const wingletGeo = new THREE.ExtrudeGeometry(wingletShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    });
    wingletGeo.rotateY(sign * Math.PI / 2);
    geometries.push(wingletGeo);
    const wingletMesh = new THREE.Mesh(wingletGeo, secondaryStructureMat);
    wingletGroup.add(wingletMesh);

    // Strobe navigation light
    const strobeGeo = new THREE.SphereGeometry(0.032, 12, 12);
    geometries.push(strobeGeo);
    const strobeMesh = new THREE.Mesh(strobeGeo, isPort ? navPortRedMat : navStbdGreenMat);
    strobeMesh.position.set(sign * 0.02, 0.35, 0.08);
    wingletGroup.add(strobeMesh);

    // Point light source
    const strobeLight = new THREE.PointLight(isPort ? 0xff2244 : 0x22ff66, 1.5, 4);
    strobeLight.position.copy(strobeMesh.position);
    wingletGroup.add(strobeLight);
    navLights.push(strobeLight);

    return wingletGroup;
  }

  const wingletL = buildWinglet(true);
  registerPart('comp_wingtip_left', wingletL, new THREE.Vector3(-2.28, 0.82, 0.12), new THREE.Vector3(-3.5, 0.8, 0));

  const wingletR = buildWinglet(false);
  registerPart('comp_wingtip_right', wingletR, new THREE.Vector3(2.28, 0.82, 0.12), new THREE.Vector3(3.5, 0.8, 0));

  // -------------------------------------------------------------
  // 7. TAIL BOOMS (Twin Carbon Structural Booms)
  // -------------------------------------------------------------
  {
    const boomsGroup = new THREE.Group();

    for (const side of [-0.92, 0.92]) {
      // Main tapered carbon tubular boom
      const boomGeo = new THREE.CylinderGeometry(0.048, 0.038, 2.1, 16);
      boomGeo.rotateX(Math.PI / 2);
      geometries.push(boomGeo);
      const boomMesh = new THREE.Mesh(boomGeo, secondaryStructureMat);
      boomMesh.position.set(side, 0, 0);
      boomsGroup.add(boomMesh);

      // Aerodynamic pylon root fairing
      const fairingGeo = new THREE.BoxGeometry(0.06, 0.12, 0.45);
      fairingGeo.translate(side, 0.04, 0.35);
      geometries.push(fairingGeo);
      const fairingMesh = new THREE.Mesh(fairingGeo, primaryCompositeMat);
      boomsGroup.add(fairingMesh);
    }

    registerPart('comp_tail_booms', boomsGroup, new THREE.Vector3(0, 0.68, -0.65), new THREE.Vector3(0, 0, -1.6));
  }

  // -------------------------------------------------------------
  // 8. VERTICAL STABILIZERS (Canted Twin V-Tail Fins)
  // -------------------------------------------------------------
  {
    const vertGroup = new THREE.Group();

    for (const side of [-0.92, 0.92]) {
      const cantAngle = (side > 0 ? 1 : -1) * 0.22; // 12.6 degrees cant for radar stealth & yaw authority

      const finShape = new THREE.Shape();
      finShape.moveTo(0, 0);
      finShape.lineTo(0.12, 0.62);
      finShape.lineTo(0.38, 0.55);
      finShape.lineTo(0.44, 0);
      finShape.closePath();

      const finGeo = new THREE.ExtrudeGeometry(finShape, {
        depth: 0.038,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.008,
        bevelThickness: 0.008,
      });
      finGeo.rotateY(Math.PI / 2);
      geometries.push(finGeo);
      const finMesh = new THREE.Mesh(finGeo, primaryCompositeMat);
      finMesh.position.set(side, 0.05, 0.15);
      finMesh.rotation.z = cantAngle;
      vertGroup.add(finMesh);

      // Rudder control trim surface
      const rudderGeo = new THREE.BoxGeometry(0.02, 0.52, 0.12);
      rudderGeo.translate(side + (side > 0 ? 0.06 : -0.06), 0.3, -0.2);
      rudderGeo.rotateZ(cantAngle);
      geometries.push(rudderGeo);
      const rudderMesh = new THREE.Mesh(rudderGeo, secondaryStructureMat);
      vertGroup.add(rudderMesh);
    }

    registerPart('comp_stabilizer_vert', vertGroup, new THREE.Vector3(0, 0.76, -1.65), new THREE.Vector3(0, 1.5, -2.5));
  }

  // -------------------------------------------------------------
  // 9. HORIZONTAL STABILIZER / INVERTED-V ELEVATOR
  // -------------------------------------------------------------
  {
    const horizGroup = new THREE.Group();

    const hStabGeo = new THREE.BoxGeometry(1.9, 0.04, 0.32);
    geometries.push(hStabGeo);
    const hStabMesh = new THREE.Mesh(hStabGeo, primaryCompositeMat);
    horizGroup.add(hStabMesh);

    // Full-span elevator flap
    const elevGeo = new THREE.BoxGeometry(1.82, 0.022, 0.11);
    elevGeo.translate(0, 0, -0.18);
    geometries.push(elevGeo);
    const elevMesh = new THREE.Mesh(elevGeo, secondaryStructureMat);
    horizGroup.add(elevMesh);

    registerPart('comp_stabilizer_horiz', horizGroup, new THREE.Vector3(0, 0.72, -1.68), new THREE.Vector3(0, 0.9, -2.9));
  }

  // -------------------------------------------------------------
  // 10, 11, 12, 13. HIGH-TORQUE VTOL ROTOR NACELLES (4 UNITS)
  // -------------------------------------------------------------
  function buildVTOLUnit(id: string, basePos: THREE.Vector3, explodeOffset: THREE.Vector3) {
    const motorGroup = new THREE.Group();

    // Aerodynamic Nacelle Cowling
    const nacelleGeo = new THREE.CylinderGeometry(0.088, 0.076, 0.32, 20);
    geometries.push(nacelleGeo);
    const nacelleMesh = new THREE.Mesh(nacelleGeo, titaniumMat);
    motorGroup.add(nacelleMesh);

    // Carbon motor mount strut
    const mountGeo = new THREE.BoxGeometry(0.08, 0.06, 0.15);
    mountGeo.translate(0, 0, 0.12);
    geometries.push(mountGeo);
    const mountMesh = new THREE.Mesh(mountGeo, secondaryStructureMat);
    motorGroup.add(mountMesh);

    // Rotor Hub Bell
    const rotorHub = new THREE.Group();
    rotorHub.position.set(0, 0.18, 0);

    const hubGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.07, 16);
    geometries.push(hubGeo);
    const hubMesh = new THREE.Mesh(hubGeo, titaniumMat);
    rotorHub.add(hubMesh);

    // Dual Twisted Carbon Aerofoil Blades with High-Vis Warning Tips
    const bladeSpan = 0.82;
    for (let b = 0; b < 2; b++) {
      const bladeArm = new THREE.Group();
      bladeArm.rotation.y = b * Math.PI;

      // Carbon blade root & body
      const bladeGeo = new THREE.BoxGeometry(bladeSpan / 2, 0.012, 0.058);
      bladeGeo.translate(bladeSpan / 4, 0, 0);
      geometries.push(bladeGeo);
      const bladeMesh = new THREE.Mesh(bladeGeo, rotorCarbonMat);
      bladeArm.add(bladeMesh);

      // Warning Tip
      const tipGeo = new THREE.BoxGeometry(0.06, 0.014, 0.058);
      tipGeo.translate(bladeSpan / 2 - 0.03, 0, 0);
      geometries.push(tipGeo);
      const tipMesh = new THREE.Mesh(tipGeo, rotorTipMat);
      bladeArm.add(tipMesh);

      rotorHub.add(bladeArm);
    }

    motorGroup.add(rotorHub);
    rotorBlades.push(rotorHub);

    registerPart(id, motorGroup, basePos, explodeOffset);
  }

  buildVTOLUnit('comp_vtol_front_l', new THREE.Vector3(-0.92, 0.72, 0.5), new THREE.Vector3(-1.8, 0.8, 1.4));
  buildVTOLUnit('comp_vtol_front_r', new THREE.Vector3(0.92, 0.72, 0.5), new THREE.Vector3(1.8, 0.8, 1.4));
  buildVTOLUnit('comp_vtol_rear_l', new THREE.Vector3(-0.92, 0.72, -0.5), new THREE.Vector3(-1.8, 0.8, -1.4));
  buildVTOLUnit('comp_vtol_rear_r', new THREE.Vector3(0.92, 0.72, -0.5), new THREE.Vector3(1.8, 0.8, -1.4));

  // -------------------------------------------------------------
  // 14. PUSHER PROPELLER & TURBOPROP EXHAUST
  // -------------------------------------------------------------
  {
    const pusherGroup = new THREE.Group();

    // Engine Exhaust Nacelle with Thermal Anodized Glow
    const exhaustGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.28, 20);
    exhaustGeo.rotateX(Math.PI / 2);
    geometries.push(exhaustGeo);
    const exhaustMesh = new THREE.Mesh(exhaustGeo, exhaustThermalMat);
    pusherGroup.add(exhaustMesh);

    // Propeller Hub
    const propHub = new THREE.Group();
    propHub.position.set(0, 0, -0.16);

    // Aerodynamic Spinner
    const spinnerGeo = new THREE.ConeGeometry(0.058, 0.14, 16);
    spinnerGeo.rotateX(-Math.PI / 2);
    geometries.push(spinnerGeo);
    const spinner = new THREE.Mesh(spinnerGeo, titaniumMat);
    propHub.add(spinner);

    // 5-Blade Composite Scimitar Propeller
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const bladeArm = new THREE.Group();
      bladeArm.rotation.z = angle;

      const bladeGeo = new THREE.BoxGeometry(0.038, 0.42, 0.014);
      bladeGeo.translate(0, 0.2, 0);
      geometries.push(bladeGeo);
      const blade = new THREE.Mesh(bladeGeo, rotorCarbonMat);
      bladeArm.add(blade);

      // Warning tip
      const tipGeo = new THREE.BoxGeometry(0.038, 0.05, 0.016);
      tipGeo.translate(0, 0.39, 0);
      geometries.push(tipGeo);
      const tip = new THREE.Mesh(tipGeo, rotorTipMat);
      bladeArm.add(tip);

      propHub.add(bladeArm);
    }

    pusherGroup.add(propHub);
    pusherBlade = propHub;

    registerPart('comp_pusher_prop', pusherGroup, new THREE.Vector3(0, 0.62, -1.3), new THREE.Vector3(0, 0, -2.4));
  }

  // -------------------------------------------------------------
  // 15. AVIONICS BAY & SOVEREIGN MESH PROCESSOR CORE
  // -------------------------------------------------------------
  {
    const avionicsGroup = new THREE.Group();

    // Core Enclosure
    const bayGeo = new THREE.BoxGeometry(0.28, 0.18, 0.42);
    geometries.push(bayGeo);
    const bayMesh = new THREE.Mesh(bayGeo, secondaryStructureMat);
    avionicsGroup.add(bayMesh);

    // Illuminated Cryptoprocessor Core
    const coreGeo = new THREE.BoxGeometry(0.2, 0.08, 0.28);
    coreGeo.translate(0, 0.06, 0);
    geometries.push(coreGeo);
    const coreMesh = new THREE.Mesh(coreGeo, avionicsGlowMat);
    avionicsGroup.add(coreMesh);

    // High-Density Cooling Micro-Fins
    for (let i = -3; i <= 3; i++) {
      const finGeo = new THREE.BoxGeometry(0.26, 0.03, 0.008);
      finGeo.translate(0, 0.1, i * 0.04);
      geometries.push(finGeo);
      const fin = new THREE.Mesh(finGeo, titaniumMat);
      avionicsGroup.add(fin);
    }

    registerPart('comp_avionics_bay', avionicsGroup, new THREE.Vector3(0, 0.66, 0.15), new THREE.Vector3(0, 1.4, 0.2));
  }

  // -------------------------------------------------------------
  // 16. SOLID STATE LITHIUM-METAL BATTERY PACK
  // -------------------------------------------------------------
  {
    const batteryGroup = new THREE.Group();

    // Main Cell Block
    const batGeo = new THREE.BoxGeometry(0.32, 0.22, 0.72);
    geometries.push(batGeo);
    const batMesh = new THREE.Mesh(batGeo, secondaryStructureMat);
    batteryGroup.add(batMesh);

    // Gold Terminals & Busbars
    for (const z of [-0.25, 0.25]) {
      const termGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 12);
      termGeo.translate(0, 0.12, z);
      geometries.push(termGeo);
      const termMesh = new THREE.Mesh(termGeo, goldBatteryMat);
      batteryGroup.add(termMesh);
    }

    registerPart('comp_battery_pack', batteryGroup, new THREE.Vector3(0, 0.48, -0.05), new THREE.Vector3(0, -1.2, 0));
  }

  // -------------------------------------------------------------
  // 17. MULTI-SPECTRAL EO/IR SENSOR GIMBAL TURRET
  // -------------------------------------------------------------
  {
    const sensorGroup = new THREE.Group();

    // Aerodynamic Gimbal Pylon
    const pylonGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.12, 16);
    pylonGeo.translate(0, 0.06, 0);
    geometries.push(pylonGeo);
    const pylon = new THREE.Mesh(pylonGeo, titaniumMat);
    sensorGroup.add(pylon);

    // Spherical Optical Turret Head
    const sphereGeo = new THREE.SphereGeometry(0.12, 24, 20);
    geometries.push(sphereGeo);
    const sphere = new THREE.Mesh(sphereGeo, secondaryStructureMat);
    sensorGroup.add(sphere);

    // FLIR Thermal Sapphire Window (Main Optical Aperture)
    const lensGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.02, 20);
    lensGeo.rotateX(Math.PI / 2);
    lensGeo.translate(0, 0, 0.11);
    geometries.push(lensGeo);
    const lens = new THREE.Mesh(lensGeo, opticalSensorMat);
    sensorGroup.add(lens);

    // Secondary Laser Rangefinder Emitter Window
    const lrfGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.015, 16);
    lrfGeo.rotateX(Math.PI / 2);
    lrfGeo.translate(0.045, -0.04, 0.105);
    geometries.push(lrfGeo);
    const lrf = new THREE.Mesh(lrfGeo, titaniumMat);
    sensorGroup.add(lrf);

    registerPart('comp_sensor_gimbal', sensorGroup, new THREE.Vector3(0, 0.38, 0.9), new THREE.Vector3(0, -1.4, 1.5));
  }

  // -------------------------------------------------------------
  // 18. TITANIUM LANDING GEAR SKIDS & SHOCK ABSORBERS
  // -------------------------------------------------------------
  {
    const gearGroup = new THREE.Group();

    for (const side of [-0.48, 0.48]) {
      // Longitudinal Skid with Curved Front Ski
      const skidShape = new THREE.Shape();
      skidShape.moveTo(0, 0);
      skidShape.lineTo(0, -1.5);
      skidShape.lineTo(0.04, -1.5);
      skidShape.lineTo(0.04, 0);
      skidShape.closePath();

      const skidGeo = new THREE.BoxGeometry(0.042, 0.03, 1.55);
      skidGeo.translate(side, 0, 0);
      geometries.push(skidGeo);
      const skid = new THREE.Mesh(skidGeo, titaniumMat);
      gearGroup.add(skid);

      // Curved Front Tip
      const tipGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 12);
      tipGeo.rotateX(Math.PI / 3);
      tipGeo.translate(side, 0.06, 0.8);
      geometries.push(tipGeo);
      const tipMesh = new THREE.Mesh(tipGeo, titaniumMat);
      gearGroup.add(tipMesh);

      // Hydraulic Oleo Struts (Forward & Aft)
      for (const z of [-0.38, 0.38]) {
        const strutGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.42, 12);
        strutGeo.rotateZ((side > 0 ? -1 : 1) * 0.28);
        geometries.push(strutGeo);
        const strut = new THREE.Mesh(strutGeo, titaniumMat);
        strut.position.set(side * 0.8, 0.2, z);
        gearGroup.add(strut);
      }
    }

    registerPart('comp_landing_gear', gearGroup, new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, -1.8, 0));
  }

  // Scheme update method (live switch without rebuilding scene graph)
  const setScheme = (newScheme: AircraftFinishScheme) => {
    const c = getSchemeColors(newScheme);
    primaryCompositeMat.color.setHex(c.bodyColor);
    primaryCompositeMat.roughness = c.roughness;
    primaryCompositeMat.metalness = c.metalness;

    secondaryStructureMat.color.setHex(c.accentColor);
    avionicsGlowMat.emissive.setHex(c.emissiveColor);

    // Replace markings texture
    const oldTex = markingsTexture;
    markingsTexture = createAircraftMarkingsTexture(newScheme);
    decalMat.map = markingsTexture;
    decalMat.needsUpdate = true;
    oldTex.dispose();
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  };

  return { rootGroup, parts, rotorBlades, pusherBlade, navLights, setScheme, dispose };
}
