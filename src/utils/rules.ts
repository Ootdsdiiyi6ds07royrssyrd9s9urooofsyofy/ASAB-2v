/**
 * ASAB | AEROLAB 3D - Pure Logic, Network Mesh Math, Aerodynamics & Semantic Compression
 */

import { AircraftNode, GroundStation, NetworkLink } from '../types';

/**
 * Calculates 3D Euclidean distance between two points in km
 */
export function calculate3DDistance(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Computes synthetic link quality (0-100%) and SNR (dB) between two nodes based on distance,
 * transmission ranges, and operational node statuses.
 */
export function computeLinkQuality(
  distanceKm: number,
  maxRangeKm: number,
  statusA: string,
  statusB: string
): { quality: number; latencyMs: number; snrDb: number; bandwidthMbps: number; status: 'optimal' | 'stable' | 'degraded' | 'broken' } {
  if (statusA !== 'Active' || statusB !== 'Active') {
    return {
      quality: 0,
      latencyMs: 999,
      snrDb: -20,
      bandwidthMbps: 0,
      status: 'broken',
    };
  }

  if (distanceKm > maxRangeKm) {
    return {
      quality: 0,
      latencyMs: 999,
      snrDb: -15,
      bandwidthMbps: 0,
      status: 'broken',
    };
  }

  // Free-space synthetic attenuation model
  const normalizedDist = Math.max(0, Math.min(1, distanceKm / maxRangeKm));
  const baseQuality = Math.round((1 - Math.pow(normalizedDist, 1.4)) * 100);
  const quality = Math.max(5, Math.min(100, baseQuality));

  const snrDb = Math.round(35 - normalizedDist * 40); // 35 dBm down to -5 dBm
  const latencyMs = Math.round(4 + normalizedDist * 18); // 4ms to 22ms per hop
  const bandwidthMbps = Number((Math.max(1, (quality / 100) * 54)).toFixed(1)); // Up to 54 Mbps mesh link

  let status: 'optimal' | 'stable' | 'degraded' | 'broken' = 'optimal';
  if (quality < 25) status = 'degraded';
  else if (quality < 65) status = 'stable';

  return { quality, latencyMs, snrDb, bandwidthMbps, status };
}

/**
 * Generates active mesh links for a set of fleet nodes and ground station
 */
export function generateMeshLinks(
  nodes: AircraftNode[],
  groundStation: GroundStation,
  maxDistanceThresholdKm: number = 32
): NetworkLink[] {
  const links: NetworkLink[] = [];

  // Ground station to airborne nodes
  for (const node of nodes) {
    if (node.status === 'Unavailable' || node.status === 'Disconnected') continue;
    const dist = calculate3DDistance(groundStation.position, node.position);
    if (dist <= maxDistanceThresholdKm) {
      const q = computeLinkQuality(dist, maxDistanceThresholdKm, 'Active', node.status);
      if (q.quality > 0) {
        links.push({
          id: `link-gs-${node.id}`,
          sourceId: groundStation.id,
          targetId: node.id,
          quality: q.quality,
          latencyMs: q.latencyMs,
          bandwidthMbps: q.bandwidthMbps,
          snrDb: q.snrDb,
          status: q.status,
          protocol: 'ASAB-Mesh-v3',
        });
      }
    }
  }

  // Inter-aircraft links (mesh)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];
      if (nodeA.status === 'Unavailable' || nodeB.status === 'Unavailable') continue;
      if (nodeA.status === 'Disconnected' || nodeB.status === 'Disconnected') continue;

      const dist = calculate3DDistance(nodeA.position, nodeB.position);
      const effectiveRange = Math.min(nodeA.maxRangeKm, nodeB.maxRangeKm);
      if (dist <= effectiveRange) {
        const q = computeLinkQuality(dist, effectiveRange, nodeA.status, nodeB.status);
        if (q.quality > 0) {
          links.push({
            id: `link-${nodeA.id}-${nodeB.id}`,
            sourceId: nodeA.id,
            targetId: nodeB.id,
            quality: q.quality,
            latencyMs: q.latencyMs,
            bandwidthMbps: q.bandwidthMbps,
            snrDb: q.snrDb,
            status: q.status,
            protocol: 'ASAB-Mesh-v3',
          });
        }
      }
    }
  }

  return links;
}

/**
 * Evaluates overall fleet network health metrics from live simulation state
 */
export function computeNetworkHealthMetrics(
  nodes: AircraftNode[],
  links: NetworkLink[]
): {
  networkHealthPercent: number;
  averageLatencyMs: number;
  packetDeliveryRatio: number;
  totalThroughputMbps: number;
  activeLinksCount: number;
  overallHealthState: 'Healthy' | 'Degraded' | 'Disconnected';
} {
  const activeNodes = nodes.filter((n) => n.status === 'Active');
  if (nodes.length === 0 || activeNodes.length === 0) {
    return {
      networkHealthPercent: 0,
      averageLatencyMs: 0,
      packetDeliveryRatio: 0,
      totalThroughputMbps: 0,
      activeLinksCount: 0,
      overallHealthState: 'Disconnected',
    };
  }

  const activeLinks = links.filter((l) => l.status !== 'broken');
  const activeLinksCount = activeLinks.length;

  const averageLatencyMs =
    activeLinksCount > 0
      ? Math.round(activeLinks.reduce((acc, l) => acc + l.latencyMs, 0) / activeLinksCount)
      : 999;

  const avgLinkQuality =
    activeLinksCount > 0
      ? activeLinks.reduce((acc, l) => acc + l.quality, 0) / activeLinksCount
      : 0;

  const nodeAvailabilityRatio = activeNodes.length / nodes.length;
  const packetDeliveryRatio = Number(
    Math.max(0, Math.min(100, avgLinkQuality * 0.95 * (nodeAvailabilityRatio > 0.6 ? 1 : 0.8))).toFixed(1)
  );

  const totalThroughputMbps = Number(
    activeLinks.reduce((acc, l) => acc + l.bandwidthMbps, 0).toFixed(1)
  );

  const networkHealthPercent = Math.round(
    nodeAvailabilityRatio * 40 + (packetDeliveryRatio / 100) * 40 + (Math.min(activeLinksCount * 5, 20))
  );

  let overallHealthState: 'Healthy' | 'Degraded' | 'Disconnected' = 'Healthy';
  if (networkHealthPercent < 35 || activeLinksCount === 0) {
    overallHealthState = 'Disconnected';
  } else if (networkHealthPercent < 75) {
    overallHealthState = 'Degraded';
  }

  return {
    networkHealthPercent,
    averageLatencyMs,
    packetDeliveryRatio,
    totalThroughputMbps,
    activeLinksCount,
    overallHealthState,
  };
}

/**
 * Calculates synthetic semantic compression demonstration metrics
 */
export function calculateSemanticCompression(rawPayloadSizeBytes: number, compressionLevel: number) {
  // Level 1: Standard telemetry deduplication
  // Level 2: Delta-vector & quantization
  // Level 3: Sovereign Semantic Tokenization
  const ratios = [0.45, 0.22, 0.08]; // 55% to 92% data reduction
  const appliedRatio = ratios[Math.min(ratios.length - 1, Math.max(0, compressionLevel - 1))];
  const compressedSizeBytes = Math.round(rawPayloadSizeBytes * appliedRatio);
  const reductionPercent = Number(((1 - compressedSizeBytes / rawPayloadSizeBytes) * 100).toFixed(1));
  const rawTxTimeMs = Number(((rawPayloadSizeBytes * 8) / (1000 * 10)).toFixed(2)); // over 10kbps degraded channel
  const compressedTxTimeMs = Number(((compressedSizeBytes * 8) / (1000 * 10)).toFixed(2));
  const processingTimeMs = Number((1.2 + compressionLevel * 0.9).toFixed(1));

  return {
    rawPayloadSizeBytes,
    compressedSizeBytes,
    reductionPercent,
    rawTxTimeMs,
    compressedTxTimeMs,
    timeSavedPercent: Number(((1 - compressedTxTimeMs / rawTxTimeMs) * 100).toFixed(1)),
    processingTimeMs,
  };
}

/**
 * Aerodynamics calculation for dynamic flight simulation
 */
export function calculateAeroDynamics(
  airspeedKmh: number,
  pitchDeg: number,
  rollDeg: number,
  massKg: number,
  windSpeedKmh: number,
  windAngleDeg: number
) {
  const airspeedMs = airspeedKmh / 3.6;
  const rho = 1.225; // air density kg/m^3
  const wingArea = 2.4; // m^2 for ASAB-V100
  const q = 0.5 * rho * airspeedMs * airspeedMs; // dynamic pressure

  // Angle of attack approx
  const alphaRad = (pitchDeg * Math.PI) / 180;
  const liftCoeff = Math.sin(2 * alphaRad) * 1.1 + 0.2;
  const dragCoeff = 0.03 + Math.pow(Math.sin(alphaRad), 2) * 1.2;

  const liftN = Math.max(0, q * wingArea * liftCoeff);
  const dragN = q * wingArea * dragCoeff;
  const gravityN = massKg * 9.81;

  const verticalAccelMs2 = (liftN - gravityN) / massKg;
  const rollRestoringMoment = -rollDeg * 12.5;

  return {
    dynamicPressurePa: Math.round(q),
    liftNewtons: Math.round(liftN),
    dragNewtons: Math.round(dragN),
    gravityNewtons: Math.round(gravityN),
    liftToDragRatio: dragN > 0 ? Number((liftN / dragN).toFixed(2)) : 0,
    verticalAcceleration: Number(verticalAccelMs2.toFixed(2)),
    rollRestoringMoment: Math.round(rollRestoringMoment),
  };
}
