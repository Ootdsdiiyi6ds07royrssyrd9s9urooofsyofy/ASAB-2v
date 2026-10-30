import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculate3DDistance,
  computeLinkQuality,
  generateMeshLinks,
  computeNetworkHealthMetrics,
  calculateSemanticCompression,
  calculateAeroDynamics,
} from './rules';
import { AircraftNode, GroundStation } from '../types';

test('3D distance calculation computes Euclidean distance correctly', () => {
  const p1 = { x: 0, y: 0, z: 0 };
  const p2 = { x: 3, y: 4, z: 0 };
  assert.equal(calculate3DDistance(p1, p2), 5);

  const p3 = { x: 1, y: 2, z: 2 };
  const p4 = { x: 4, y: 2, z: 6 };
  // dx = 3, dy = 0, dz = 4 -> 5
  assert.equal(calculate3DDistance(p3, p4), 5);
});

test('computeLinkQuality drops to 0 when node is disconnected or exceeds range', () => {
  const inactiveResult = computeLinkQuality(10, 30, 'Active', 'Disconnected');
  assert.equal(inactiveResult.quality, 0);
  assert.equal(inactiveResult.status, 'broken');

  const outOfRange = computeLinkQuality(40, 30, 'Active', 'Active');
  assert.equal(outOfRange.quality, 0);
  assert.equal(outOfRange.status, 'broken');

  const inRangeOptimal = computeLinkQuality(5, 30, 'Active', 'Active');
  assert.ok(inRangeOptimal.quality > 70);
  assert.equal(inRangeOptimal.status, 'optimal');
  assert.ok(inRangeOptimal.bandwidthMbps > 30);
});

test('generateMeshLinks creates ground station and inter-aircraft links correctly', () => {
  const gs: GroundStation = {
    id: 'GS-01',
    name: 'Sovereign Base Station Alpha',
    callsign: 'COMMAND-1',
    position: { x: 0, y: 0, z: 0 },
    status: 'Online',
    uplinkFrequencyGHz: 5.8,
    downlinkFrequencyGHz: 2.4,
    activeAntennaType: 'Phased Array Steerable',
    connectedNodes: [],
  };

  const nodes: AircraftNode[] = [
    {
      id: 'NODE-01',
      name: 'ASAB Alpha-1',
      callsign: 'EAGLE-1',
      type: 'ASAB-V100 VTOL',
      role: 'Command Node',
      status: 'Active',
      position: { x: 5, y: 1.5, z: 5 },
      telemetry: {
        altitude: 1500,
        airspeed: 120,
        groundSpeed: 115,
        heading: 45,
        pitch: 2,
        roll: 0,
        yaw: 45,
        batteryPercent: 88,
        signalStrength: -45,
        packetLossPercent: 0.1,
        latencyMs: 12,
        cpuLoadPercent: 34,
        temperatureC: 38,
      },
      activeChannels: ['CH-01', 'CH-04'],
      maxRangeKm: 35,
      ipAddress: '10.240.1.1',
      hopCountToGateway: 1,
      encryptionStatus: 'SOVEREIGN-ECC',
    },
    {
      id: 'NODE-02',
      name: 'ASAB Relay-2',
      callsign: 'RELAY-2',
      type: 'ASAB-R200 Relay',
      role: 'Relay Node',
      status: 'Active',
      position: { x: 10, y: 2.0, z: 8 },
      telemetry: {
        altitude: 2000,
        airspeed: 95,
        groundSpeed: 90,
        heading: 90,
        pitch: 1,
        roll: 0,
        yaw: 90,
        batteryPercent: 92,
        signalStrength: -50,
        packetLossPercent: 0.2,
        latencyMs: 14,
        cpuLoadPercent: 42,
        temperatureC: 36,
      },
      activeChannels: ['CH-01', 'CH-06'],
      maxRangeKm: 40,
      ipAddress: '10.240.1.2',
      hopCountToGateway: 2,
      encryptionStatus: 'SOVEREIGN-ECC',
    },
  ];

  const links = generateMeshLinks(nodes, gs, 35);
  // Ground station to NODE-01, GS to NODE-02, and NODE-01 to NODE-02
  assert.ok(links.length >= 3);
  const interAircraftLink = links.find(
    (l) => (l.sourceId === 'NODE-01' && l.targetId === 'NODE-02') || (l.sourceId === 'NODE-02' && l.targetId === 'NODE-01')
  );
  assert.ok(interAircraftLink !== undefined);
  assert.ok(interAircraftLink!.quality > 50);
});

test('computeNetworkHealthMetrics accurately rates healthy vs disconnected network', () => {
  const healthy = computeNetworkHealthMetrics(
    [
      { id: '1', status: 'Active' } as AircraftNode,
      { id: '2', status: 'Active' } as AircraftNode,
    ],
    [
      { id: 'l1', status: 'optimal', quality: 90, latencyMs: 10, bandwidthMbps: 45 } as any,
    ]
  );
  assert.ok(healthy.networkHealthPercent > 50);
  assert.equal(healthy.overallHealthState, 'Healthy');

  const disconnected = computeNetworkHealthMetrics([], []);
  assert.equal(disconnected.overallHealthState, 'Disconnected');
  assert.equal(disconnected.activeLinksCount, 0);
});

test('calculateSemanticCompression yields high data reduction ratio', () => {
  const comp = calculateSemanticCompression(1024, 3); // Level 3 sovereign tokenization
  assert.ok(comp.reductionPercent > 80);
  assert.ok(comp.compressedSizeBytes < 200);
  assert.ok(comp.timeSavedPercent > 80);
});

test('calculateAeroDynamics generates realistic aerodynamic forces', () => {
  const aero = calculateAeroDynamics(120, 5, 0, 28, 10, 0);
  assert.ok(aero.liftNewtons > 0);
  assert.ok(aero.dragNewtons > 0);
  assert.ok(aero.liftToDragRatio > 1);
  assert.ok(aero.dynamicPressurePa > 100);
});
