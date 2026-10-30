/**
 * ASAB | AEROLAB 3D - Shared Data Architecture & Types
 */

export type NodeRole = 'VTOL Node' | 'Relay Node' | 'Gateway Node' | 'Monitoring Node' | 'Command Node';

export type NodeStatus = 'Active' | 'Standby' | 'Disconnected' | 'Recovering' | 'Unavailable';

export interface AircraftTelemetry {
  altitude: number; // meters
  airspeed: number; // km/h
  groundSpeed: number; // km/h
  heading: number; // degrees 0-359
  pitch: number; // degrees
  roll: number; // degrees
  yaw: number; // degrees
  batteryPercent: number; // 0-100
  signalStrength: number; // -30 to -90 dBm
  packetLossPercent: number; // 0-100
  latencyMs: number; // ms
  cpuLoadPercent: number; // 0-100
  temperatureC: number; // celsius
}

export interface AircraftNode {
  id: string;
  name: string;
  callsign: string;
  type: 'ASAB-V100 VTOL' | 'ASAB-R200 Relay' | 'ASAB-GW50 Gateway' | 'ASAB-S300 Scout';
  role: NodeRole;
  status: NodeStatus;
  position: { x: number; y: number; z: number }; // virtual airspace coordinates (km)
  targetPosition?: { x: number; y: number; z: number };
  telemetry: AircraftTelemetry;
  activeChannels: string[];
  maxRangeKm: number;
  ipAddress: string;
  hopCountToGateway: number;
  encryptionStatus: 'AES-256-GCM' | 'SOVEREIGN-ECC' | 'UNENCRYPTED';
}

export interface GroundStation {
  id: string;
  name: string;
  callsign: string;
  position: { x: number; y: number; z: number };
  status: 'Online' | 'Standby' | 'Degraded';
  uplinkFrequencyGHz: number;
  downlinkFrequencyGHz: number;
  activeAntennaType: 'Phased Array Steerable' | 'Omnidirectional Dipole' | 'Satellite Interlink';
  connectedNodes: string[];
}

export interface NetworkLink {
  id: string;
  sourceId: string;
  targetId: string;
  quality: number; // 0 - 100%
  latencyMs: number;
  bandwidthMbps: number;
  snrDb: number;
  status: 'optimal' | 'stable' | 'degraded' | 'broken';
  protocol: 'ASAB-Mesh-v3' | 'STANAG-7085' | 'Link-16-Bridge';
}

export interface AircraftComponent {
  id: string;
  name: string;
  nameAr: string;
  category: 'Airframe' | 'Propulsion' | 'Avionics' | 'Energy' | 'Payload & Sensors' | 'Flight Control';
  description: string;
  functionDesc: string;
  location: string;
  massKg: number;
  powerDrawWatts: number;
  status: 'Operational' | 'Standby' | 'Warning' | 'Maintenance Required';
  meshOffset: [number, number, number]; // exploded view displacement vector
  associatedComponents: string[];
  specs: Record<string, string | number>;
}

export interface PlatformIntegration {
  id: string;
  name: string;
  platformType: 'VTOL UAV' | 'Fixed-Wing' | 'Multirotor' | 'Mobile GCS' | 'Tactical Vehicle' | 'Satellite Gateway';
  protocol: string;
  status: 'Connected' | 'Negotiating' | 'Standby' | 'Disconnected';
  compatibility: 'Full' | 'Bridged' | 'Degraded';
  latencyMs: number;
  dataRateKbps: number;
  lastHeartbeat: string;
}

export type EventCategory = 'Aircraft' | 'Network' | 'Ground Station' | 'Simulation' | 'Warnings' | 'System Events';

export interface SimulationEvent {
  id: string;
  timestamp: string;
  timeOffsetSec: number;
  category: EventCategory;
  severity: 'info' | 'success' | 'warning' | 'critical';
  title: string;
  description: string;
  sourceNodeId?: string;
}

export interface ResilienceScenario {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced' | 'Stress Test';
  durationSec: number;
  triggerEvent: string;
  expectedOutcome: string;
  affectedNodeIds: string[];
}

export interface SimulationReport {
  id: string;
  scenarioName: string;
  date: string;
  durationSec: number;
  aircraftCount: number;
  packetDeliveryRatio: number;
  averageLatencyMs: number;
  throughputMbps: number;
  disruptionsRecovered: number;
  observations: string[];
  warnings: string[];
  status: 'Success' | 'Degraded Pass' | 'Failed';
}

export interface SystemSettings {
  language: 'en' | 'ar';
  quality: 'low' | 'medium' | 'high';
  audioEnabled: boolean;
  simulationSpeed: number; // 0.5, 1, 2, 4
  units: 'metric' | 'nautical';
  showNetworkLayer: boolean;
  showCoverageLayer: boolean;
  showLabels: boolean;
  activeEnvironment: 'asab' | 'aerolab';
  activeModuleId: string;
}
