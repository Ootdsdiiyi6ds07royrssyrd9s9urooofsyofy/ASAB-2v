import React, { useState } from 'react';
import { Activity, BarChart3, Box, ChevronLeft, ChevronRight, Compass, Cpu, Crosshair, Database, FileText, Info, Layers, Navigation, Network, Plane, Radio, RadioTower, Settings, Share2, ShieldAlert, SlidersHorizontal, Wind, X, Zap } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

type Module = { id: string; icon: React.ElementType; label: string; labelAr: string; badge?: number };

type Group = { title: string; titleAr: string; env: 'asab' | 'aerolab'; items: Module[] };

export const Sidebar: React.FC = () => {
  const { settings, navigateToModule, events, nodes, mobileSidebarOpen, setMobileSidebarOpen } = useSimulation();
  const [collapsed, setCollapsed] = useState(false);
  const isArabic = settings.language === 'ar';
  const go = (id: string, env: 'asab' | 'aerolab') => { navigateToModule(id, env); setMobileSidebarOpen(false); };
  const groups: Group[] = [
    { title: 'COMMAND', titleAr: 'القيادة والسيطرة', env: 'asab', items: [
      { id: 'command-center', icon: Radio, label: 'Command center', labelAr: 'مركز القيادة' },
      { id: 'cop', icon: Crosshair, label: 'Training arena', labelAr: 'ساحة التدريب والخريطة' },
      { id: 'overview', icon: Compass, label: 'Overview', labelAr: 'نظرة عامة', badge: nodes.length },
      { id: 'airborne-fleet', icon: Plane, label: 'Airborne fleet', labelAr: 'الأسطول الجوي', badge: nodes.length },
      { id: 'resilience', icon: ShieldAlert, label: 'Resilience', labelAr: 'الصمود' },
      { id: 'mesh-network', icon: Network, label: 'Network topology', labelAr: 'طوبولوجيا الشبكة' },
      { id: 'network-health', icon: Activity, label: 'Network health', labelAr: 'صحة الشبكة' },
      { id: 'edge-intelligence', icon: Cpu, label: 'Edge intelligence', labelAr: 'الذكاء الحافي' },
      { id: 'interoperability', icon: Share2, label: 'Interoperability', labelAr: 'التشغيل البيني' },
      { id: 'event-log', icon: FileText, label: 'Event log', labelAr: 'سجل الأحداث', badge: events.length },
    ] },
    { title: 'AEROLAB', titleAr: 'مختبر أيرولاب', env: 'aerolab', items: [
      { id: 'flight-simulation', icon: Navigation, label: 'Flight simulator', labelAr: 'محاكي الطيران' },
      { id: 'live-flight-simulation', icon: RadioTower, label: 'Live simulation', labelAr: 'المحاكاة الحية' },
      { id: 'aircraft-studio', icon: Box, label: 'Aircraft studio', labelAr: 'استوديو الطائرات' },
      { id: 'components-library', icon: Layers, label: 'Components', labelAr: 'المكونات' },
      { id: 'dynamics', icon: Wind, label: 'Flight dynamics', labelAr: 'ديناميكا الطيران' },
      { id: 'maneuver-simulation', icon: Compass, label: 'Maneuvers', labelAr: 'المناورات' },
      { id: 'connection-simulation', icon: Zap, label: 'Connections', labelAr: 'الاتصالات' },
      { id: 'network-simulation', icon: SlidersHorizontal, label: 'Network simulation', labelAr: 'محاكاة الشبكة' },
      { id: 'reports', icon: BarChart3, label: 'Reports', labelAr: 'التقارير' },
    ] },
    { title: 'SYSTEM', titleAr: 'النظام', env: 'asab', items: [
      { id: 'scenario-manager', icon: Database, label: 'Scenarios', labelAr: 'السيناريوهات' },
      { id: 'settings', icon: Settings, label: 'Settings', labelAr: 'الإعدادات' },
      { id: 'about-asab', icon: Info, label: 'About', labelAr: 'عن المنظومة' },
    ] },
  ];

  return (
    <>
      {mobileSidebarOpen && <button type="button" aria-label={isArabic ? 'إغلاق قائمة التنقل' : 'Close navigation'} onClick={() => setMobileSidebarOpen(false)} className="sidebar-scrim" />}
      <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileSidebarOpen ? 'is-open' : ''}`} aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}>
        <div className="sidebar-head">
          <div className="sidebar-heading"><span className="sidebar-kicker">{isArabic ? 'الملاحة' : 'NAVIGATION'}</span><strong>{isArabic ? 'مساحة العمل' : 'Workspace'}</strong></div>
          <button type="button" onClick={() => setMobileSidebarOpen(false)} className="icon-button sidebar-close mobile-only" aria-label={isArabic ? 'إغلاق القائمة' : 'Close menu'}><X aria-hidden="true" /></button>
          <button type="button" onClick={() => setCollapsed(!collapsed)} className="icon-button sidebar-collapse desktop-only" aria-label={collapsed ? (isArabic ? 'توسيع القائمة' : 'Expand navigation') : (isArabic ? 'طي القائمة' : 'Collapse navigation')} title={collapsed ? 'Expand' : 'Collapse'}>{collapsed ? <ChevronRight className="rtl-flip" aria-hidden="true" /> : <ChevronLeft className="rtl-flip" aria-hidden="true" />}</button>
        </div>
        <div className="sidebar-scroll">
          {groups.map((group) => <section key={group.title} className="nav-group">
            <div className="nav-group-label"><span>{isArabic ? group.titleAr : group.title}</span><i /></div>
            <div className="nav-items">
              {group.items.map((item) => { const Icon = item.icon; const active = settings.activeModuleId === item.id; return <button type="button" key={item.id} onClick={() => go(item.id, group.env)} title={isArabic ? item.labelAr : item.label} aria-current={active ? 'page' : undefined} className={`nav-item ${active ? 'is-active' : ''}`}><Icon aria-hidden="true" /><span className="nav-item-label">{isArabic ? item.labelAr : item.label}</span>{item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}</button>; })}
            </div>
          </section>)}
        </div>
        <div className="sidebar-footer"><div className="sidebar-footer-row"><span className="status-dot status-dot-live" /><span>{isArabic ? 'المنظومة متصلة' : 'System online'}</span><b>{isArabic ? 'مستقر' : 'STABLE'}</b></div><small>ASAB / 2V · {isArabic ? 'وضع التشغيل المحلي' : 'LOCAL OPERATIONS'}</small></div>
      </aside>
    </>
  );
};
