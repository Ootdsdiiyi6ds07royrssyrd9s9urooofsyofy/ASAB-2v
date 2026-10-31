/**
 * ASAB | AEROLAB 3D - Central Simulation State Store
 * Synchronizes fleet nodes, 3D airspace, mesh links, event logging, and scenario execution.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AircraftNode,
  AircraftComponent,
  GroundStation,
  NetworkLink,
  PlatformIntegration,
  ResilienceScenario,
  SimulationEvent,
  SimulationReport,
  SystemSettings,
  NodeStatus,
} from '../types';
import {
  INITIAL_FLEET_NODES,
  INITIAL_GROUND_STATION,
  AIRCRAFT_COMPONENTS_DATA,
  RESILIENCE_SCENARIOS,
  INITIAL_PLATFORM_INTEGRATIONS,
  INITIAL_EVENTS,
  INITIAL_REPORTS,
} from '../data/initialData';
import {
  generateMeshLinks,
  computeNetworkHealthMetrics,
} from '../utils/rules';

interface SimulationContextType {
  nodes: AircraftNode[];
  groundStation: GroundStation;
  links: NetworkLink[];
  components: AircraftComponent[];
  scenarios: ResilienceScenario[];
  platforms: PlatformIntegration[];
  events: SimulationEvent[];
  reports: SimulationReport[];
  settings: SystemSettings;
  selectedNodeId: string | null;
  selectedComponentId: string | null;
  explodeFactor: number;
  cameraPreset: 'front' | 'side' | 'top' | 'bottom' | 'iso' | 'reset' | 'hero' | 'rear' | 'detail';
  activeScenarioId: string | null;
  scenarioRunning: boolean;
  scenarioProgressPercent: number;
  simulationClockSeconds: number;
  metrics: ReturnType<typeof computeNetworkHealthMetrics>;
  mobileSidebarOpen: boolean;

  // Actions
  selectNode: (id: string | null) => void;
  selectComponent: (id: string | null) => void;
  setExplodeFactor: (factor: number) => void;
  setCameraPreset: (preset: 'front' | 'side' | 'top' | 'bottom' | 'iso' | 'reset' | 'hero' | 'rear' | 'detail') => void;
  addNode: (nodeData?: Partial<AircraftNode>) => void;
  removeNode: (id: string) => void;
  updateNodeStatus: (id: string, status: NodeStatus) => void;
  updateNodePosition: (id: string, pos: { x: number; y: number; z: number }) => void;
  runScenario: (scenario: string | ResilienceScenario) => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  addEvent: (category: SimulationEvent['category'], severity: SimulationEvent['severity'], title: string, description: string, sourceNodeId?: string) => void;
  generateReport: (scenarioName?: string) => SimulationReport;
  updateSettings: (partial: Partial<SystemSettings>) => void;
  addPlatform: (p: PlatformIntegration) => void;
  removePlatform: (id: string) => void;
  togglePlatformStatus: (id: string) => void;
  navigateToModule: (moduleId: string, env?: 'asab' | 'aerolab') => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Shared state
  const [nodes, setNodes] = useState<AircraftNode[]>(INITIAL_FLEET_NODES);
  const [groundStation] = useState<GroundStation>(INITIAL_GROUND_STATION);
  const [components] = useState<AircraftComponent[]>(AIRCRAFT_COMPONENTS_DATA);
  const [scenarios] = useState<ResilienceScenario[]>(RESILIENCE_SCENARIOS);
  const [platforms, setPlatforms] = useState<PlatformIntegration[]>(INITIAL_PLATFORM_INTEGRATIONS);
  const [events, setEvents] = useState<SimulationEvent[]>(INITIAL_EVENTS);
  const [reports, setReports] = useState<SimulationReport[]>(INITIAL_REPORTS);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('NODE-01');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('comp_fuselage_main');
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<'front' | 'side' | 'top' | 'bottom' | 'iso' | 'reset' | 'hero' | 'rear' | 'detail'>('iso');

  // Scenario execution state
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>('scen_01');
  const [scenarioRunning, setScenarioRunning] = useState<boolean>(true);
  const [scenarioProgressPercent, setScenarioProgressPercent] = useState<number>(15);
  const [simulationClockSeconds, setSimulationClockSeconds] = useState<number>(120);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Settings
  const isPhone = typeof window !== 'undefined' && window.innerWidth < 768;
  const DEFAULT_SETTINGS: SystemSettings = {
    language: 'ar',
    quality: isPhone ? 'medium' : 'high',
    audioEnabled: true,
    simulationSpeed: 1,
    units: 'metric',
    showNetworkLayer: true,
    showCoverageLayer: true,
    showLabels: true,
    activeEnvironment: 'asab',
    activeModuleId: 'command-center',
  };
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('asab_settings');
      if (saved) {
        // Merge with defaults so newly added fields never end up undefined; keep the user's saved language.
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      // storage unavailable or corrupt: fall back to defaults
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings on update
  useEffect(() => {
    try {
      localStorage.setItem('asab_settings', JSON.stringify(settings));
    } catch (e) {
      // ignore (private mode / quota)
    }
    if (settings.language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [settings]);

  // Derived mesh links and metrics
  const links = useMemo(() => {
    return generateMeshLinks(nodes, groundStation, 36);
  }, [nodes, groundStation]);

  const metrics = useMemo(() => {
    return computeNetworkHealthMetrics(nodes, links);
  }, [nodes, links]);

  // Event logger helper
  const addEvent = useCallback(
    (
      category: SimulationEvent['category'],
      severity: SimulationEvent['severity'],
      title: string,
      description: string,
      sourceNodeId?: string
    ) => {
      const now = new Date();
      const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;
      const newEvt: SimulationEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        timeOffsetSec: simulationClockSeconds,
        category,
        severity,
        title,
        description,
        sourceNodeId,
      };
      setEvents((prev) => [newEvt, ...prev].slice(0, 80));
    },
    [simulationClockSeconds]
  );

  // Fleet management actions
  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, []);

  const addNode = useCallback(
    (nodeData?: Partial<AircraftNode>) => {
      const nextNum = nodes.length + 1;
      const id = `NODE-0${nextNum}`;
      const newNode: AircraftNode = {
        id,
        name: `ASAB Tactical Node ${nextNum}`,
        callsign: `EAGLE-0${nextNum}`,
        type: 'ASAB-V100 VTOL',
        role: 'VTOL Node',
        status: 'Active',
        position: {
          x: Number(((Math.random() - 0.5) * 24).toFixed(1)),
          y: Number((1.2 + Math.random() * 1.6).toFixed(1)),
          z: Number(((Math.random() - 0.5) * 24).toFixed(1)),
        },
        telemetry: {
          altitude: Math.round(1200 + Math.random() * 1200),
          airspeed: Math.round(110 + Math.random() * 40),
          groundSpeed: Math.round(105 + Math.random() * 40),
          heading: Math.round(Math.random() * 360),
          pitch: Number(((Math.random() - 0.5) * 4).toFixed(1)),
          roll: Number(((Math.random() - 0.5) * 4).toFixed(1)),
          yaw: Math.round(Math.random() * 360),
          batteryPercent: 95,
          signalStrength: -50,
          packetLossPercent: 0.1,
          latencyMs: 14,
          cpuLoadPercent: 30,
          temperatureC: 32,
        },
        activeChannels: ['SOV-CH1'],
        maxRangeKm: 35,
        ipAddress: `10.240.1.${100 + nextNum}`,
        hopCountToGateway: 2,
        encryptionStatus: 'SOVEREIGN-ECC',
        ...nodeData,
      };

      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(id);
      addEvent('Aircraft', 'success', `Virtual Node Deployed: ${id}`, `Added ${newNode.name} to sovereign airspace.`, id);
    },
    [nodes.length, addEvent]
  );

  const removeNode = useCallback(
    (id: string) => {
      const nodeToRemove = nodes.find((n) => n.id === id);
      setNodes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
      }
      addEvent(
        'Aircraft',
        'warning',
        `Node Decommissioned: ${id}`,
        `Removed ${nodeToRemove ? nodeToRemove.name : id} from active fleet topology.`
      );
    },
    [nodes, selectedNodeId, addEvent]
  );

  const updateNodeStatus = useCallback(
    (id: string, status: NodeStatus) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status } : n))
      );
      addEvent(
        'Aircraft',
        status === 'Active' ? 'success' : status === 'Disconnected' ? 'critical' : 'warning',
        `Node ${id} Status Changed`,
        `Operating status updated to ${status}.`,
        id
      );
    },
    [addEvent]
  );

  const updateNodePosition = useCallback((id: string, pos: { x: number; y: number; z: number }) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, position: pos } : n))
    );
  }, []);

  // Scenario execution engine
  const runScenario = useCallback(
    (scenario: string | ResilienceScenario) => {
      const scen = typeof scenario === 'string' ? scenarios.find((s) => s.id === scenario) : scenario;
      if (!scen) return;
      const scenarioId = scen.id;

      setActiveScenarioId(scenarioId);
      setScenarioRunning(true);
      setScenarioProgressPercent(0);

      addEvent('Simulation', 'info', `Scenario Started: ${scen.name}`, scen.triggerEvent);

      // Apply initial scenario conditions
      if (scenarioId === 'scen_01') {
        // Normal
        setNodes((prev) => prev.map((n) => ({ ...n, status: 'Active' })));
      } else if (scenarioId === 'scen_02') {
        // Single node down
        setNodes((prev) =>
          prev.map((n) => (n.id === 'NODE-02' ? { ...n, status: 'Disconnected' } : { ...n, status: 'Active' }))
        );
      } else if (scenarioId === 'scen_03') {
        // Multiple interruptions
        setNodes((prev) =>
          prev.map((n) =>
            n.id === 'NODE-03' || n.id === 'NODE-05' ? { ...n, status: 'Disconnected' } : { ...n, status: 'Active' }
          )
        );
      } else if (scenarioId === 'scen_04') {
        // Network partition
        setNodes((prev) =>
          prev.map((n) =>
            n.id === 'NODE-04'
              ? { ...n, position: { x: 38, y: 3.2, z: 28 }, status: 'Active' }
              : n
          )
        );
      } else if (scenarioId === 'scen_05') {
        // Recovery
        setNodes((prev) =>
          prev.map((n) => (n.id === 'NODE-02' ? { ...n, status: 'Recovering' } : n))
        );
        setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) => (n.id === 'NODE-02' ? { ...n, status: 'Active' } : n))
          );
          addEvent('Simulation', 'success', 'NODE-02 Fully Recovered', 'Mesh route convergence complete.');
        }, 3000);
      } else if (scenarioId === 'scen_06') {
        // Dynamic fleet reconfiguration
        setNodes((prev) =>
          prev.map((n) =>
            n.id === 'NODE-06'
              ? { ...n, status: 'Active', position: { x: 2.5, y: 2.2, z: 2.0 } }
              : n
          )
        );
      } else if (scenarioId === 'scen_07') {
        // Degraded RF
        setNodes((prev) =>
          prev.map((n) => ({
            ...n,
            telemetry: {
              ...n.telemetry,
              signalStrength: -82,
              latencyMs: 38,
              packetLossPercent: 4.8,
            },
          }))
        );
      } else if (scenarioId === 'scen_08') {
        // System restoration
        setNodes((prev) =>
          prev.map((n) => ({
            ...n,
            status: 'Active',
            telemetry: {
              ...n.telemetry,
              signalStrength: -45,
              latencyMs: 12,
              packetLossPercent: 0.05,
            },
          }))
        );
      }
    },
    [scenarios, addEvent]
  );

  const pauseSimulation = useCallback(() => {
    setScenarioRunning(false);
    addEvent('Simulation', 'info', 'Simulation Paused', 'Clock halted by operator.');
  }, [addEvent]);

  const resumeSimulation = useCallback(() => {
    setScenarioRunning(true);
    addEvent('Simulation', 'info', 'Simulation Resumed', 'Live computation active.');
  }, [addEvent]);

  const resetSimulation = useCallback(() => {
    setNodes(INITIAL_FLEET_NODES);
    setSelectedNodeId('NODE-01');
    setScenarioRunning(true);
    setScenarioProgressPercent(0);
    setActiveScenarioId('scen_01');
    setExplodeFactor(0);
    addEvent('System Events', 'info', 'System Simulation Reset', 'All nodes restored to sovereign default states.');
  }, [addEvent]);

  // Report generator
  const generateReport = useCallback(
    (customScenarioName?: string): SimulationReport => {
      const activeScen = scenarios.find((s) => s.id === activeScenarioId);
      const name = customScenarioName || (activeScen ? activeScen.name : 'Airspace Operational Run');
      const now = new Date();
      const dateStr = `${now.toISOString().replace('T', ' ').substring(0, 16)} UTC`;

      const newReport: SimulationReport = {
        id: `rep_${Date.now()}`,
        scenarioName: name,
        date: dateStr,
        durationSec: Math.round(activeScen ? activeScen.durationSec : 60),
        aircraftCount: nodes.length,
        packetDeliveryRatio: metrics.packetDeliveryRatio,
        averageLatencyMs: metrics.averageLatencyMs,
        throughputMbps: metrics.totalThroughputMbps,
        disruptionsRecovered: activeScen?.affectedNodeIds.length || 0,
        observations: [
          `Fleet of ${nodes.length} sovereign aircraft evaluated across 3D airspace.`,
          `Network availability maintained at ${metrics.networkHealthPercent}% overall.`,
          `Active links count: ${metrics.activeLinksCount} operational sovereign mesh channels.`,
          `Edge telemetry processing handled without relying on external cloud nodes.`,
        ],
        warnings:
          metrics.networkHealthPercent < 60
            ? ['Network health fell below optimal threshold during simulation.']
            : [],
        status: metrics.networkHealthPercent > 75 ? 'Success' : metrics.networkHealthPercent > 40 ? 'Degraded Pass' : 'Failed',
      };

      setReports((prev) => [newReport, ...prev]);
      addEvent('Simulation', 'success', `Report Generated: ${name}`, `Logged to Simulation Reports archive.`);
      return newReport;
    },
    [scenarios, activeScenarioId, nodes.length, metrics, addEvent]
  );

  // Settings update
  const updateSettings = useCallback((partial: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const navigateToModule = useCallback((moduleId: string, env?: 'asab' | 'aerolab') => {
    setSettings((prev) => {
      let targetEnv = env || prev.activeEnvironment;
      if (!env) {
        const aerolabModules = [
          'aircraft-studio',
          'components-library',
          'dynamics',
          'flight-simulation',
          'connection-simulation',
          'network-simulation',
          'maneuver-simulation',
          'reports',
        ];
        if (aerolabModules.includes(moduleId)) {
          targetEnv = 'aerolab';
        } else if (
          [
            'overview',
            'command-center',
            'cop',
            'airborne-fleet',
            'mesh-network',
            'network-health',
            'edge-intelligence',
            'interoperability',
            'resilience',
            'event-log',
            'scenario-manager',
            'settings',
            'about-asab',
          ].includes(moduleId)
        ) {
          targetEnv = 'asab';
        }
      }
      return {
        ...prev,
        activeEnvironment: targetEnv,
        activeModuleId: moduleId,
      };
    });
  }, []);

  // Platform integrations
  const addPlatform = useCallback((p: PlatformIntegration) => {
    setPlatforms((prev) => [...prev, p]);
  }, []);

  const removePlatform = useCallback((id: string) => {
    setPlatforms((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePlatformStatus = useCallback((id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextStatus = p.status === 'Connected' ? 'Disconnected' : 'Connected';
        return { ...p, status: nextStatus };
      })
    );
  }, []);

  // Simulation tick loop for live telemetry updates
  useEffect(() => {
    if (!scenarioRunning) return;

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return; // save battery when tab is hidden
      setSimulationClockSeconds((prev) => prev + 1);

      // Advance scenario progress
      setScenarioProgressPercent((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });

      // Subtle simulated orbital/patrol drift for active aircraft
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.status !== 'Active') return node;

          const speedKmh = node.telemetry.airspeed;
          const headingRad = (node.telemetry.heading * Math.PI) / 180;
          // Small distance delta in km
          const dtKm = (speedKmh / 3600) * 0.05;
          const nextX = node.position.x + Math.sin(headingRad) * dtKm;
          const nextZ = node.position.z + Math.cos(headingRad) * dtKm;

          // Turn slightly if too far from base (boundary patrol box)
          let nextHeading = node.telemetry.heading;
          if (Math.abs(nextX) > 24 || Math.abs(nextZ) > 24) {
            nextHeading = (((nextHeading + 180 + (Math.random() - 0.5) * 30) % 360) + 360) % 360;
          } else if (Math.random() > 0.8) {
            nextHeading = (((nextHeading + (Math.random() - 0.5) * 4) % 360) + 360) % 360;
          }

          // Subtle battery consumption
          const nextBattery = Math.max(10, node.telemetry.batteryPercent - 0.005);

          return {
            ...node,
            position: {
              x: Number(nextX.toFixed(4)),
              y: node.position.y,
              z: Number(nextZ.toFixed(4)),
            },
            telemetry: {
              ...node.telemetry,
              heading: Math.round(nextHeading),
              yaw: Math.round(nextHeading),
              batteryPercent: Number(nextBattery.toFixed(1)),
              pitch: Number((1.5 + (Math.random() - 0.5) * 0.4).toFixed(1)),
              roll: Number(((Math.random() - 0.5) * 1.2).toFixed(1)),
            },
          };
        })
      );
    }, 1000 / settings.simulationSpeed);

    return () => clearInterval(interval);
  }, [scenarioRunning, settings.simulationSpeed]);

  return (
    <SimulationContext.Provider
      value={{
        nodes,
        groundStation,
        links,
        components,
        scenarios,
        platforms,
        events,
        reports,
        settings,
        selectedNodeId,
        selectedComponentId,
        explodeFactor,
        cameraPreset,
        activeScenarioId,
        scenarioRunning,
        scenarioProgressPercent,
        simulationClockSeconds,
        metrics,
        mobileSidebarOpen,

        selectNode,
        selectComponent,
        setExplodeFactor,
        setCameraPreset,
        addNode,
        removeNode,
        updateNodeStatus,
        updateNodePosition,
        runScenario,
        pauseSimulation,
        resumeSimulation,
        resetSimulation,
        addEvent,
        generateReport,
        updateSettings,
        addPlatform,
        removePlatform,
        togglePlatformStatus,
        navigateToModule,
        setMobileSidebarOpen,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within a SimulationProvider');
  return ctx;
};
