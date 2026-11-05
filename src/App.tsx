/**
 * ASAB | AEROLAB — responsive application shell
 */
import React, { lazy, Suspense } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { AssetProvider } from './context/AssetContext';
import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { ViewErrorBoundary } from './components/layout/ErrorBoundary';
import { Activity, Box, Compass, Crosshair, Plane, RadioTower } from 'lucide-react';

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
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="status-dot status-dot-live" />
      <span>{isArabic ? 'جارٍ تجهيز مساحة العمل' : 'Preparing workspace'}</span>
    </div>
  );
};

const MainContentRouter: React.FC = () => {
  const { settings } = useSimulation();
  const pageTitles: Record<string, [string, string]> = {
    overview: ['نظرة عامة', 'Overview'], 'command-center': ['مركز القيادة', 'Command Center'], cop: ['ساحة التدريب', 'Training Arena'],
    'airborne-fleet': ['الأسطول الجوي', 'Airborne Fleet'], 'mesh-network': ['طوبولوجيا الشبكة', 'Network Topology'], 'network-health': ['صحة الشبكة', 'Network Health'],
    'edge-intelligence': ['الذكاء الطرفي', 'Edge Intelligence'], interoperability: ['التشغيل البيني', 'Interoperability'], resilience: ['الصمود التشغيلي', 'Resilience'], 'event-log': ['سجل الأحداث', 'Event Log'],
    'aircraft-studio': ['استوديو الطائرة', 'Aircraft Studio'], 'components-library': ['مكتبة المكونات', 'Components'], dynamics: ['الديناميكا الجوية', 'Aerodynamics'], 'flight-simulation': ['محاكي الطيران', 'Flight Simulation'],
    'live-flight-simulation': ['المحاكاة الحية', 'Live Simulation'], 'connection-simulation': ['محاكاة الاتصال', 'Connection Simulation'], 'network-simulation': ['محاكاة الشبكة', 'Network Simulation'], 'maneuver-simulation': ['المناورات', 'Maneuvers'], reports: ['التقارير', 'Reports'], 'scenario-manager': ['مدير السيناريوهات', 'Scenarios'], settings: ['الإعدادات', 'Settings'], 'about-asab': ['عن عَصَب', 'About ASAB'],
  };
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
  const [titleAr, titleEn] = pageTitles[settings.activeModuleId] ?? ['مساحة العمل', 'Workspace'];
  return <Suspense fallback={<PageLoading />}><ViewErrorBoundary><div className="page-route-shell"><header className="route-page-header"><div><span className="route-page-kicker">ASAB / AEROLAB · {settings.activeEnvironment === 'asab' ? 'ASAB' : 'AEROLAB'}</span><h1>{settings.language === 'ar' ? titleAr : titleEn}</h1></div><div className="route-page-meta"><span className="status-dot status-dot-live" />{settings.language === 'ar' ? 'تشغيل محلي' : 'Local run'}<b>UI 2.0</b></div></header><div className="route-data-badge" role="note"><span className="status-dot status-dot-live" /><span>{settings.language === 'ar' ? 'بيانات محاكاة محسوبة محليًا · ليست قياسات ميدانية' : 'Locally derived simulation data · not field measurements'}</span></div><div className="page-route-content">{page}</div></div></ViewErrorBoundary></Suspense>;
};

const MobileBottomNav: React.FC = () => {
  const { settings, navigateToModule } = useSimulation();
  const isArabic = settings.language === 'ar';
  const navItems = [
    { id: 'command-center', env: 'asab' as const, icon: Compass, label: isArabic ? 'القيادة' : 'Command' },
    { id: 'cop', env: 'asab' as const, icon: Crosshair, label: isArabic ? 'المشهد' : 'COP' },
    { id: 'airborne-fleet', env: 'asab' as const, icon: Plane, label: isArabic ? 'الأسطول' : 'Fleet' },
    { id: 'aircraft-studio', env: 'aerolab' as const, icon: Box, label: isArabic ? 'الاستوديو' : 'Studio' },
    { id: 'live-flight-simulation', env: 'aerolab' as const, icon: RadioTower, label: isArabic ? 'المحاكاة' : 'Live' },
  ];
  return (
    <nav aria-label={isArabic ? 'التنقل السريع للجوال' : 'Mobile quick navigation'} className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = settings.activeModuleId === item.id;
        return (
          <button key={item.id} type="button" onClick={() => navigateToModule(item.id, item.env)} className={`mobile-nav-item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default function App() {
  return (
    <AssetProvider>
      <SimulationProvider>
      <div className="app-shell">
        <a className="skip-link" href="#main-content">انتقل إلى المحتوى</a>
        <AppHeader />
        <div className="app-body">
          <Sidebar />
          <main id="main-content" className="app-main" tabIndex={-1}>
            <MainContentRouter />
          </main>
        </div>
        <MobileBottomNav />
        <div className="app-status-bar" aria-hidden="true"><Activity /> <span>ASAB // AEROLAB</span><span className="status-dot status-dot-live" /></div>
      </div>
      </SimulationProvider>
    </AssetProvider>
  );
}
