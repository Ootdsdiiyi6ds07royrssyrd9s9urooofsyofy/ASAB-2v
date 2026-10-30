/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';

// ASAB Modules
import { OverviewView } from './components/asab/OverviewView';
import { CommandCenterView } from './components/asab/CommandCenterView';
import { CommonOperationalPictureView } from './components/asab/CommonOperationalPictureView';
import { AirborneFleetView } from './components/asab/AirborneFleetView';
import { NetworkTopologyView } from './components/asab/NetworkTopologyView';
import { NetworkHealthView } from './components/asab/NetworkHealthView';
import { EdgeIntelligenceView } from './components/asab/EdgeIntelligenceView';
import { InteroperabilityHubView } from './components/asab/InteroperabilityHubView';
import { ResilienceScenarioView } from './components/asab/ResilienceScenarioView';
import { EventLogView } from './components/asab/EventLogView';

// AEROLAB Modules
import { AircraftStudioView } from './components/aerolab/AircraftStudioView';
import { AircraftComponentsView } from './components/aerolab/AircraftComponentsView';
import { DynamicSimulationView } from './components/aerolab/DynamicSimulationView';
import { FlightSimulationView } from './components/aerolab/FlightSimulationView';
import { ConnectionSimulationView } from './components/aerolab/ConnectionSimulationView';
import { NetworkSimulationView } from './components/aerolab/NetworkSimulationView';
import { ManeuverSimulationView } from './components/aerolab/ManeuverSimulationView';
import { SimulationReportsView } from './components/aerolab/SimulationReportsView';

// SYSTEM Modules
import { ScenarioManagerView } from './components/system/ScenarioManagerView';
import { SettingsView } from './components/system/SettingsView';
import { AboutAsabView } from './components/system/AboutAsabView';

const MainContentRouter: React.FC = () => {
  const { settings } = useSimulation();

  switch (settings.activeModuleId) {
    // ASAB COMMAND
    case 'overview':
      return <OverviewView />;
    case 'command-center':
      return <CommandCenterView />;
    case 'cop':
      return <CommonOperationalPictureView />;
    case 'airborne-fleet':
      return <AirborneFleetView />;
    case 'mesh-network':
      return <NetworkTopologyView />;
    case 'network-health':
      return <NetworkHealthView />;
    case 'edge-intelligence':
      return <EdgeIntelligenceView />;
    case 'interoperability':
      return <InteroperabilityHubView />;
    case 'resilience':
      return <ResilienceScenarioView />;
    case 'event-log':
      return <EventLogView />;

    // AEROLAB ENGINEERING
    case 'aircraft-studio':
      return <AircraftStudioView />;
    case 'components-library':
      return <AircraftComponentsView />;
    case 'dynamics':
      return <DynamicSimulationView />;
    case 'flight-simulation':
      return <FlightSimulationView />;
    case 'connection-simulation':
      return <ConnectionSimulationView />;
    case 'network-simulation':
      return <NetworkSimulationView />;
    case 'maneuver-simulation':
      return <ManeuverSimulationView />;
    case 'reports':
      return <SimulationReportsView />;

    // SYSTEM
    case 'scenario-manager':
      return <ScenarioManagerView />;
    case 'settings':
      return <SettingsView />;
    case 'about-asab':
      return <AboutAsabView />;

    default:
      return <CommandCenterView />;
  }
};

export default function App() {
  return (
    <SimulationProvider>
      <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#080D16] text-[#EDF4FA]">
        <AppHeader />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden relative">
            <MainContentRouter />
          </main>
        </div>
      </div>
    </SimulationProvider>
  );
}
