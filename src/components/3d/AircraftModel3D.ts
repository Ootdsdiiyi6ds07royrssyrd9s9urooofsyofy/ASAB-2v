import * as THREE from 'three';
import { createCarbonFiberTexture, createPanelLinesBumpMap, createAircraftMarkingsTexture, createOpticalGlassTexture } from './proceduralTextures';

export interface AircraftMeshPart { mesh: THREE.Object3D; componentId: string; basePosition: THREE.Vector3; explodeOffset: THREE.Vector3; originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]>; }
export type AircraftFinishScheme = 'stealth' | 'sovereign' | 'camo' | 'test';

/** Concept VTOL fighter: broad blended delta wing, central lift fan, twin canted fins and buried propulsion. */
export function buildAircraftModel(scheme: AircraftFinishScheme = 'stealth') {
  const rootGroup = new THREE.Group(); rootGroup.name = 'ASAB_CONCEPT_MULTI_ROLE_VTOL_FIGHTER';
  const parts = new Map<string, AircraftMeshPart>(); const rotorBlades: THREE.Object3D[] = []; const navLights: THREE.Light[] = []; let pusherBlade: THREE.Object3D | null = null;
  const geometries: THREE.BufferGeometry[] = []; const materials: THREE.Material[] = []; const textures: THREE.Texture[] = [];
  const carbon = createCarbonFiberTexture(); const panelBump = createPanelLinesBumpMap(); let markings = createAircraftMarkingsTexture(scheme); const glassTexture = createOpticalGlassTexture(); textures.push(carbon, panelBump, markings, glassTexture);
  const palette = (f: AircraftFinishScheme) => ({ body: f === 'test' ? 0xd4c5b2 : f === 'camo' ? 0x4d5948 : f === 'sovereign' ? 0x3c3a35 : 0x2a3032, structure: f === 'test' ? 0x44505a : 0x111719, trim: f === 'test' ? 0xff7b36 : f === 'sovereign' ? 0xc5a46d : 0x8b9596, glow: f === 'test' ? 0xff6a22 : 0xb58b58 });
  let colors = palette(scheme);
  const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body, map: carbon, bumpMap: panelBump, bumpScale: .012, roughness: .46, metalness: .55 });
  const structureMat = new THREE.MeshStandardMaterial({ color: colors.structure, bumpMap: panelBump, bumpScale: .008, roughness: .48, metalness: .78 });
  const metalMat = new THREE.MeshStandardMaterial({ color: colors.trim, roughness: .28, metalness: .86 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x09171d, map: glassTexture, roughness: .08, metalness: .3, transmission: .13, clearcoat: 1, clearcoatRoughness: .06, opacity: .92, transparent: true });
  const ductMat = new THREE.MeshStandardMaterial({ color: 0x101518, map: carbon, roughness: .28, metalness: .82 });
  const rotorMat = new THREE.MeshStandardMaterial({ color: 0x050709, map: carbon, roughness: .22, metalness: .82 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0x193b43, emissive: colors.glow, emissiveIntensity: .3, roughness: .26, metalness: .7 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xff2141, emissive: 0xff002d, emissiveIntensity: 1.2 }); const greenMat = new THREE.MeshStandardMaterial({ color: 0x2cff80, emissive: 0x00bd55, emissiveIntensity: 1.1 });
  const decalMat = new THREE.MeshBasicMaterial({ map: markings, transparent: true, opacity: .8, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  materials.push(bodyMat, structureMat, metalMat, glassMat, ductMat, rotorMat, glowMat, redMat, greenMat, decalMat);
  const track = <T extends THREE.BufferGeometry>(g: T) => { geometries.push(g); return g; };
  const add = (group: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, position = new THREE.Vector3()) => { const mesh = new THREE.Mesh(track(geometry), material); mesh.position.copy(position); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; };
  const box = (g: THREE.Group, s: [number, number, number], m: THREE.Material, p = new THREE.Vector3()) => add(g, new THREE.BoxGeometry(...s), m, p);
  const cyl = (g: THREE.Group, r: number, h: number, m: THREE.Material, p = new THREE.Vector3(), n = 24) => add(g, new THREE.CylinderGeometry(r, r * .95, h, n), m, p);
  function register(id: string, object: THREE.Object3D, base: THREE.Vector3, offset: THREE.Vector3) { object.position.copy(base); object.userData = { componentId: id }; object.traverse((c) => { c.userData = { componentId: id }; }); const original = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>(); object.traverse((c) => { if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true; original.set(c, c.material); } }); parts.set(id, { mesh: object, componentId: id, basePosition: base.clone(), explodeOffset: offset.clone(), originalMaterials: original }); rootGroup.add(object); }

  function loftBody() {
    const rings = [{ z: 2.38, w: .02, h: .02, y: .08 }, { z: 2.05, w: .22, h: .16, y: .1 }, { z: 1.48, w: .48, h: .3, y: .1 }, { z: .72, w: .72, h: .48, y: .04 }, { z: -.1, w: .84, h: .56, y: 0 }, { z: -.82, w: .82, h: .52, y: .01 }, { z: -1.46, w: .64, h: .4, y: .04 }, { z: -2.02, w: .32, h: .25, y: .08 }, { z: -2.32, w: .06, h: .06, y: .08 }];
    const sides = 36; const pos: number[] = []; const idx: number[] = [];
    rings.forEach((r) => { for (let i = 0; i < sides; i++) { const a = i / sides * Math.PI * 2; pos.push(Math.cos(a) * r.w, r.y + Math.sin(a) * r.h, r.z); } });
    for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < sides; i++) { const a = j * sides + i, b = j * sides + (i + 1) % sides, c = (j + 1) * sides + (i + 1) % sides, d = (j + 1) * sides + i; idx.push(a, b, d, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  {
    const group = new THREE.Group(); add(group, loftBody(), bodyMat);
    const belly = new THREE.CapsuleGeometry(.24, 1.75, 8, 20); belly.rotateX(Math.PI / 2); belly.scale(1.05, .72, 1); add(group, belly, structureMat, new THREE.Vector3(0, -.34, -.18));
    const spine = box(group, [.16, .18, 1.7], metalMat, new THREE.Vector3(0, .48, -.25)); spine.rotation.x = -.04;
    const canopy = new THREE.SphereGeometry(.48, 32, 20, 0, Math.PI * 2, 0, Math.PI * .56); canopy.scale(.78, .48, 1.25); add(group, canopy, glassMat, new THREE.Vector3(0, .53, 1.04)); box(group, [.035, .045, .68], metalMat, new THREE.Vector3(0, .65, .9));
    for (const side of [-1, 1]) { box(group, [.035, .12, .82], metalMat, new THREE.Vector3(side * .62, .16, -.12)); box(group, [.045, .08, .34], glowMat, new THREE.Vector3(side * .72, .23, -.54)); }
    const decal = new THREE.PlaneGeometry(.7, 1.05); decal.rotateX(-Math.PI / 2); add(group, decal, decalMat, new THREE.Vector3(0, .58, -.22)); register('comp_fuselage_main', group, new THREE.Vector3(0, .73, 0), new THREE.Vector3(0, .14, 0));
  }
  {
    const group = new THREE.Group(); const nose = new THREE.CapsuleGeometry(.24, .58, 8, 20); nose.rotateX(Math.PI / 2); nose.scale(.9, .84, 1.25); add(group, nose, bodyMat, new THREE.Vector3(0, 0, .18)); add(group, new THREE.SphereGeometry(.07, 16, 12), glowMat, new THREE.Vector3(0, -.08, .54)); register('comp_nose_radome', group, new THREE.Vector3(0, .73, 1.78), new THREE.Vector3(0, 0, 1.9));
  }

  function blendedDeltaWing(side: number) {
    const stations = [{ x: .35, lead: .82, trail: -1.28, thick: .25 }, { x: .95, lead: .72, trail: -1.34, thick: .22 }, { x: 1.85, lead: .3, trail: -1.22, thick: .15 }, { x: 2.75, lead: -.25, trail: -.94, thick: .1 }, { x: 3.38, lead: -.62, trail: -.78, thick: .045 }];
    const p: number[] = []; const faces: number[] = [];
    stations.forEach((s) => { const x = side * s.x; p.push(x, s.thick / 2, s.lead, x, -s.thick / 2, s.lead, x, s.thick * .2, s.trail, x, -s.thick * .2, s.trail); });
    for (let i = 0; i < stations.length - 1; i++) { const a = i * 4, b = (i + 1) * 4; faces.push(a, b, a + 1, a + 1, b, b + 1, a + 2, a + 3, b + 2, a + 3, b + 3, b + 2, a, a + 2, b, a + 2, b + 2, b, a + 1, b + 1, a + 3, a + 3, b + 1, b + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(faces); g.computeVertexNormals(); return g;
  }
  const buildWing = (side: number) => { const group = new THREE.Group(); add(group, blendedDeltaWing(side), bodyMat); const root = new THREE.CapsuleGeometry(.2, 1.05, 8, 18); root.rotateZ(Math.PI / 2); add(group, root, structureMat, new THREE.Vector3(side * .7, -.02, -.05)); box(group, [1.55, .035, .1], metalMat, new THREE.Vector3(side * 2.05, .11, -.36)); return group; };
  register('comp_wing_left', buildWing(-1), new THREE.Vector3(0, .73, 0), new THREE.Vector3(-3.6, .42, 0)); register('comp_wing_right', buildWing(1), new THREE.Vector3(0, .73, 0), new THREE.Vector3(3.6, .42, 0));
  function wingtip(side: number) { const g = new THREE.Group(); const lamp = add(g, new THREE.SphereGeometry(.05, 14, 12), side < 0 ? redMat : greenMat, new THREE.Vector3(0, .04, 0)); const light = new THREE.PointLight(side < 0 ? 0xff244a : 0x27ff80, 1.1, 3); light.position.copy(lamp.position); g.add(light); navLights.push(light); return g; }
  register('comp_wingtip_left', wingtip(-1), new THREE.Vector3(-3.38, .73, -.73), new THREE.Vector3(-3.8, .4, 0)); register('comp_wingtip_right', wingtip(1), new THREE.Vector3(3.38, .73, -.73), new THREE.Vector3(3.8, .4, 0));

  // Large central lift fan, the signature feature of the reference aircraft.
  {
    const group = new THREE.Group(); const shroud = new THREE.CylinderGeometry(.72, .76, .22, 48); add(group, shroud, ductMat, new THREE.Vector3(0, .38, .18)); const rim = new THREE.TorusGeometry(.75, .075, 12, 48); rim.rotateX(Math.PI / 2); add(group, rim, metalMat, new THREE.Vector3(0, .51, .18)); const inner = new THREE.TorusGeometry(.59, .035, 10, 40); inner.rotateX(Math.PI / 2); add(group, inner, structureMat, new THREE.Vector3(0, .525, .18));
    const hub = new THREE.Group(); hub.position.set(0, .55, .18); cyl(hub, .11, .1, metalMat); for (let i = 0; i < 10; i++) { const blade = new THREE.Group(); blade.rotation.y = i * Math.PI * 2 / 10; box(blade, [.48, .035, .075], rotorMat, new THREE.Vector3(.27, 0, 0)); hub.add(blade); } group.add(hub); rotorBlades.push(hub); pusherBlade = hub; box(group, [1.35, .035, .08], metalMat, new THREE.Vector3(0, .62, .18)); register('comp_central_lift_fan', group, new THREE.Vector3(0, .73, 0), new THREE.Vector3(0, 1.2, .2));
  }

  // Twin canted vertical stabilizers and rear thrust exhausts.
  {
    const group = new THREE.Group();
    for (const side of [-1, 1]) { const finShape = new THREE.Shape(); finShape.moveTo(0, 0); finShape.lineTo(.12, .94); finShape.lineTo(.58, .67); finShape.lineTo(.65, .05); finShape.closePath(); const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: .12, bevelEnabled: true, bevelSegments: 3, bevelSize: .025 }); finGeo.rotateY(Math.PI / 2); const fin = add(group, finGeo, bodyMat, new THREE.Vector3(side * 1.05, .42, -1.3)); fin.rotation.z = side * .28; const boom = new THREE.CapsuleGeometry(.13, 1.35, 7, 16); boom.rotateX(Math.PI / 2); add(group, boom, structureMat, new THREE.Vector3(side * .92, .12, -1.08)); }
    for (const side of [-1, 1]) { const nozzle = new THREE.CylinderGeometry(.25, .32, .18, 20); nozzle.rotateX(Math.PI / 2); add(group, nozzle, ductMat, new THREE.Vector3(side * .5, .02, -2.2)); const exhaust = new THREE.TorusGeometry(.25, .045, 8, 24); exhaust.rotateX(Math.PI / 2); add(group, exhaust, glowMat, new THREE.Vector3(side * .5, .02, -2.3)); }
    register('comp_stabilizer_vert', group, new THREE.Vector3(0, .73, -1.28), new THREE.Vector3(0, 1.05, -1.9));
  }

  // Retractable weapon/sensor fairings under the broad wing, kept as non-functional visual concept details.
  {
    const group = new THREE.Group(); for (const side of [-1, 1]) { for (let i = 0; i < 3; i++) { const pod = new THREE.CapsuleGeometry(.075, .46, 5, 12); pod.rotateX(Math.PI / 2); add(group, pod, structureMat, new THREE.Vector3(side * (1.95 + i * .38), -.18, -.73 - i * .07)); const tip = new THREE.ConeGeometry(.075, .18, 12); tip.rotateX(-Math.PI / 2); add(group, tip, metalMat, new THREE.Vector3(side * (1.95 + i * .38), -.18, -.99 - i * .07)); } }
    register('comp_mission_bays', group, new THREE.Vector3(0, .73, 0), new THREE.Vector3(0, -.65, -.65));
  }
  {
    const group = new THREE.Group(); box(group, [.38, .2, .64], structureMat, new THREE.Vector3(0, 0, -.15)); box(group, [.25, .045, .42], glowMat, new THREE.Vector3(0, .13, -.15)); register('comp_avionics_bay', group, new THREE.Vector3(0, .46, .25), new THREE.Vector3(0, 1.1, .2)); const battery = new THREE.Group(); box(battery, [.48, .2, .82], structureMat); register('comp_battery_pack', battery, new THREE.Vector3(0, .4, -.65), new THREE.Vector3(0, -.9, 0));
  }
  { const sensor = new THREE.Group(); add(sensor, new THREE.SphereGeometry(.14, 18, 14), glowMat, new THREE.Vector3(0, -.03, 0)); add(sensor, new THREE.SphereGeometry(.055, 14, 10), glassMat, new THREE.Vector3(0, -.03, .13)); register('comp_sensor_gimbal', sensor, new THREE.Vector3(0, .3, 1.18), new THREE.Vector3(0, -.6, 1.4)); }
  {
    const gear = new THREE.Group(); for (const [x, z] of [[-1.2, .58], [1.2, .58], [0, -1.35]] as const) { const strut = cyl(gear, .035, .3, metalMat, new THREE.Vector3(x, -.2, z), 10); strut.rotation.z = x === 0 ? 0 : x > 0 ? -.18 : .18; cyl(gear, .1, .05, rotorMat, new THREE.Vector3(x, -.36, z), 16); } register('comp_landing_gear', gear, new THREE.Vector3(0, .73, 0), new THREE.Vector3(0, -1, 0));
  }
  const setScheme = (next: AircraftFinishScheme) => { colors = palette(next); bodyMat.color.setHex(colors.body); structureMat.color.setHex(colors.structure); metalMat.color.setHex(colors.trim); glowMat.emissive.setHex(colors.glow); const nextMarkings = createAircraftMarkingsTexture(next); textures.push(nextMarkings); markings.dispose(); markings = nextMarkings; decalMat.map = nextMarkings; decalMat.needsUpdate = true; };
  const dispose = () => { geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); textures.forEach((t) => t.dispose()); };
  return { rootGroup, parts, rotorBlades, pusherBlade, navLights, setScheme, dispose };
}
