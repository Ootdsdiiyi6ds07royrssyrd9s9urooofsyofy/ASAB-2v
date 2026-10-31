/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { ViewErrorBoundary } from './components/layout/ErrorBoundary';
import { Compass, Crosshair, Plane, Box, FolderGit2 } from 'lucide-react';

const OverviewView = lazy(() => import('./components/asab/OverviewView').then((module) => ({ default: module.OverviewView })));
const CommandCenterView = lazy(() => import('./components/asab/CommandCenterView').then((module) => ({ default: module.CommandCenterView })));
const CommonOperationalPictureView = lazy(() => import('./components/asab/CommonOperationalPictureView').then((module) => ({ default: module.CommonOperationalPictureView })));
const AirborneFleetView = lazy(() => import('./components/asab/AirborneFleetView').then((module) => ({ default: module.AirborneFleetView })));
const NetworkTopologyView = lazy(() => import('./components/asab/NetworkTopologyView').then((module) => ({ default: module.NetworkTopologyView })));
const NetworkHealthView = lazy(() => import('./components/asab/NetworkHealthView').then((module) => ({ default: module.NetworkHealthView })));
const EdgeIntelligenceView = lazy(() => import('./components/asab/EdgeIntelligenceView').then((module) => ({ default: module.EdgeIntelligenceView })));
const InteroperabilityHubView = lazy(() => import('./components/asab/InteroperabilityHubView').then((module) => ({ default: module.InteroperabilityHubView })));
const ResilienceScenarioView = lazy(() => import('./components/asab/ResilienceScenarioView').then((module) => ({ default: module.ResilienceScenarioView })));
const EventLogView = lazy(() => import('./components/asab/EventLogView').then((module) => ({ default: module.EventLogView })));
const AircraftStudioView = lazy(() => import('./components/aerolab/AircraftStudioView').then((module) => ({ default: module.AircraftStudioView })));
const AircraftComponentsView = lazy(() => import('./components/aerolab/AircraftComponentsView').then((module) => ({ default: module.AircraftComponentsView })));
const DynamicSimulationView = lazy(() => import('./components/aerolab/DynamicSimulationView').then((module) => ({ default: module.DynamicSimulationView })));
const FlightSimulationView = lazy(() => import('./components/aerolab/FlightSimulationView').then((module) => ({ default: module.FlightSimulationView })));
const LiveFlightSimulationView = lazy(() => import('./components/aerolab/LiveFlightSimulationView').then((module) => ({ default: module.LiveFlightSimulationView })));
const ConnectionSimulationView = lazy(() => import('./components/aerolab/ConnectionSimulationView').then((module) => ({ default: module.ConnectionSimulationView })));
const NetworkSimulationView = lazy(() => import('./components/aerolab/NetworkSimulationView').then((module) => ({ default: module.NetworkSimulationView })));
const ManeuverSimulationView = lazy(() => import('./components/aerolab/ManeuverSimulationView').then((module) => ({ default: module.ManeuverSimulationView })));
const SimulationReportsView = lazy(() => import('./components/aerolab/SimulationReportsView').then((module) => ({ default: module.SimulationReportsView })));
const ScenarioManagerView = lazy(() => import('./components/system/ScenarioManagerView').then((module) => ({ default: module.ScenarioManagerView })));
const SettingsView = lazy(() => import('./components/system/SettingsView').then((module) => ({ default: module.SettingsView })));
const AboutAsabView = lazy(() => import('./components/system/AboutAsabView').then((module) => ({ default: module.AboutAsabView })));

const PageLoading: React.FC = () => {
  const { settings } = useSimulation();
  const isArabic = settings.language === 'ar';
  return <div className="flex h-full items-center justify-center bg-[#120e0a] text-[#b9a58c]"><div className="flex items-center gap-3 rounded-2xl border border-[#32261b] bg-[#1a140e] px-5 py-4 text-sm shadow-xl"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#9a6a3a]" />{isArabic ? 'جارٍ تجهيز الصفحة…' : 'Loading page…'}</div></div>;
};

const MainContentRouter: React.FC = () => {
  const { settings } = useSimulation();
  const page = (() => {
    switch (settings.activeModuleId) {
      case 'overview': return <OverviewView />;
      case 'command-center': return <CommandCenterView />;
      case 'cop': return <CommonOperationalPictureView />;
      case 'airborne-fleet': return <AirborneFleetView />;
      case 'mesh-network': return <NetworkTopologyView />;
      case 'network-health': return <NetworkHealthView />;
      case 'edge-intelligence': return <EdgeIntelligenceView />;
      case 'interoperability': return <InteroperabilityHubView />;
      case 'resilience': return <ResilienceScenarioView />;
      case 'event-log': return <EventLogView />;
      case 'aircraft-studio': return <AircraftStudioView />;
      case 'components-library': return <AircraftComponentsView />;
      case 'dynamics': return <DynamicSimulationView />;
      case 'flight-simulation': return <FlightSimulationView />;
      case 'live-flight-simulation': return <LiveFlightSimulationView />;
      case 'connection-simulation': return <ConnectionSimulationView />;
      case 'network-simulation': return <NetworkSimulationView />;
      case 'maneuver-simulation': return <ManeuverSimulationView />;
      case 'reports': return <SimulationReportsView />;
      case 'scenario-manager': return <ScenarioManagerView />;
      case 'settings': return <SettingsView />;
      case 'about-asab': return <AboutAsabView />;
      default: return <CommandCenterView />;
    }
  })();
  return <Suspense fallback={<PageLoading />}><ViewErrorBoundary>{page}</ViewErrorBoundary></Suspense>;
};

const MobileBottomNav: React.FC = () => {
  const { settings, navigateToModule } = useSimulation();
  const isArabic = settings.language === 'ar';
  const navItems = [
    { id: 'command-center', env: 'asab' as const, icon: Compass, label: isArabic ? 'القيادة' : 'Command' },
    { id: 'cop', env: 'asab' as const, icon: Crosshair, label: isArabic ? 'المشهد' : 'COP' },
    { id: 'airborne-fleet', env: 'asab' as const, icon: Plane, label: isArabic ? 'الأسطول' : 'Fleet' },
    { id: 'aircraft-studio', env: 'aerolab' as const, icon: Box, label: isArabic ? 'الاستوديو' : 'Studio' },
    { id: 'maneuver-simulation', env: 'aerolab' as const, icon: FolderGit2, label: isArabic ? 'المناورات' : 'Maneuver' },
  ];
  return <nav aria-label={isArabic ? 'التنقل السريع للجوال' : 'Mobile Quick Navigation'} style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} className="flex min-h-14 shrink-0 items-center justify-around border-t border-[#32261b] bg-[#1a140e]/95 px-1 backdrop-blur-md md:hidden">{navItems.map((item) => { const Icon = item.icon; const isActive = settings.activeModuleId === item.id; return <button key={item.id} onClick={() => navigateToModule(item.id, item.env)} className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-1 py-1.5 transition-colors ${isActive ? 'font-bold text-[#9a6a3a]' : 'text-[#b9a58c] hover:text-[#f6ecdd]'}`}><Icon className="h-4 w-4" /><span className="mt-0.5 max-w-full truncate text-[10px]">{item.label}</span></button>; })}</nav>;
};

export default function App() {
  return <SimulationProvider><div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#120e0a] text-[#f6ecdd]"><AppHeader /><div className="relative flex flex-1 overflow-hidden"><Sidebar /><main className="relative min-h-0 min-w-0 flex-1 overflow-hidden"><MainContentRouter /></main></div><MobileBottomNav /></div></SimulationProvider>;
}
