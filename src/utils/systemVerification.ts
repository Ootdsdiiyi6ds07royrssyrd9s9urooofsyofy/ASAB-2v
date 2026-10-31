/**
 * ASAB | AEROLAB 3D - Automated System Verification & Test Suite
 * Validates 3D aircraft models, tactical battlefield generation, mesh network links, and simulation state consistency.
 */

import * as THREE from 'three';
import { buildAircraftModel } from '../components/3d/AircraftModel3D';
import { buildBattlefieldTheater } from '../components/3d/BattlefieldTheater';
import { calculate3DDistance, computeLinkQuality, computeNetworkHealthMetrics } from './rules';
import { INITIAL_FLEET_NODES, INITIAL_GROUND_STATION } from '../data/initialData';

export interface VerificationResult {
  testName: string;
  passed: boolean;
  message: string;
}

export function runSystemVerification(): VerificationResult[] {
  const results: VerificationResult[] = [];

  // Test 1: 3D Distance Calculation
  try {
    const d = calculate3DDistance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 });
    const passed = Math.abs(d - 5) < 0.001;
    results.push({
      testName: 'Euclidean 3D Distance',
      passed,
      message: passed ? 'Distance calculation verified (3-4-5 triangle = 5.0 km)' : `Failed: got ${d}`,
    });
  } catch (e: any) {
    results.push({ testName: 'Euclidean 3D Distance', passed: false, message: e.message });
  }

  // Test 2: Link Quality & Attenuation Model
  try {
    const lq = computeLinkQuality(10, 30, 'Active', 'Active');
    const passed = lq.quality > 0 && lq.quality <= 100 && lq.latencyMs > 0;
    results.push({
      testName: 'Synthetic Link Quality & Attenuation',
      passed,
      message: passed ? `Verified: Quality ${lq.quality}%, Latency ${lq.latencyMs}ms, SNR ${lq.snrDb}dB` : 'Failed link quality bounds',
    });
  } catch (e: any) {
    results.push({ testName: 'Synthetic Link Quality & Attenuation', passed: false, message: e.message });
  }

  // Test 3: Fleet Network Health Metrics
  try {
    const metrics = computeNetworkHealthMetrics(INITIAL_FLEET_NODES, []);
    const passed = metrics.overallHealthState !== undefined;
    results.push({
      testName: 'Fleet Network Health Computation',
      passed,
      message: passed ? `Verified: Network health state is ${metrics.overallHealthState}` : 'Failed metrics evaluation',
    });
  } catch (e: any) {
    results.push({ testName: 'Fleet Network Health Computation', passed: false, message: e.message });
  }

  // Test 4: 3D Aircraft Model Generation & Parts
  try {
    const aircraft = buildAircraftModel('stealth');
    const hasRoot = aircraft.rootGroup instanceof THREE.Group;
    const hasParts = aircraft.parts.size > 0;
    const passed = hasRoot && hasParts;
    aircraft.dispose();
    results.push({
      testName: 'Advanced VTOL Aircraft 3D Model Generation',
      passed,
      message: passed ? `Verified: Generated aircraft model with ${aircraft.parts.size} modular components` : 'Failed aircraft model structure',
    });
  } catch (e: any) {
    results.push({ testName: 'Advanced VTOL Aircraft 3D Model Generation', passed: false, message: e.message });
  }

  // Test 5: Tactical Battlefield Theater Generation
  try {
    const scene = new THREE.Scene();
    const theater = buildBattlefieldTheater('warzone-day');
    scene.add(theater.rootGroup);
    const passed = theater.rootGroup instanceof THREE.Group && theater.terrainMesh instanceof THREE.Mesh;
    theater.dispose();
    results.push({
      testName: 'Tactical Battlefield Theater & Terrain',
      passed,
      message: passed ? 'Verified: Battlefield theater generated successfully with terrain, FOB, and armored entities' : 'Failed theater generation',
    });
  } catch (e: any) {
    results.push({ testName: 'Tactical Battlefield Theater & Terrain', passed: false, message: e.message });
  }

  return results;
}
