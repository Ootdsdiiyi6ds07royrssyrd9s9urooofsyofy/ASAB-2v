import React, { useState } from 'react';
import { Activity, BarChart3, Box, ChevronLeft, ChevronRight, Compass, Crosshair, Database, FileText, Info, Layers, Menu, Navigation, Network, Plane, Radio, RadioTower, Settings, Share2, ShieldAlert, SlidersHorizontal, Wind, X, Zap, Cpu } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

type Module = { id: string; icon: React.ElementType; label: string; labelAr: string; badge?: number };

export const Sidebar: React.FC = () => {
  const { settings, navigateToModule, events, nodes, mobileSidebarOpen, setMobileSidebarOpen } = useSimulation();
  const [collapsed, setCollapsed] = useState(false);
  const isArabic = settings.language === 'ar';
  const go = (id: string, env: 'asab' | 'aerolab') => { navigateToModule(id, env); setMobileSidebarOpen(false); };
  const groups: { title: string; titleAr: string; env: 'asab' | 'aerolab'; items: Module[] }[] = [
    { title: 'COMMAND', titleAr: 'القيادة', env: 'asab', items: [
      { id: 'command-center', icon: Radio, label: 'Command Center', labelAr: 'مركز القيادة' },
      { id: 'cop', icon: Crosshair, label: 'Training Arena', labelAr: 'ساحة التدريب والخريطة' },
      { id: 'overview', icon: Compass, label: 'Overview', labelAr: 'نظرة عامة' },
      { id: 'airborne-fleet', icon: Plane, label: 'Airborne Fleet', labelAr: 'الأسطول الجوي', badge: nodes.length },
      { id: 'resilience', icon: ShieldAlert, label: 'Resilience', labelAr: 'الصمود' },
      { id: 'mesh-network', icon: Network, label: 'Network Topology', labelAr: 'طوبولوجيا الشبكة' },
      { id: 'network-health', icon: Activity, label: 'Network Health', labelAr: 'صحة الشبكة' },
      { id: 'edge-intelligence', icon: Cpu, label: 'Edge Intelligence', labelAr: 'الذكاء الحافي' },
      { id: 'interoperability', icon: Share2, label: 'Interoperability', labelAr: 'التشغيل البيني' },
      { id: 'event-log', icon: FileText, label: 'Event Log', labelAr: 'سجل الأحداث', badge: events.length },
    ] },
    { title: 'AEROLAB', titleAr: 'أيرولاب', env: 'aerolab', items: [
      { id: 'flight-simulation', icon: Navigation, label: 'Flight Simulator', labelAr: 'محاكي الطيران' },
      { id: 'live-flight-simulation', icon: RadioTower, label: 'Live Simulation', labelAr: 'المحاكاة الحية' },
      { id: 'aircraft-studio', icon: Box, label: 'Aircraft Studio', labelAr: 'استوديو الطائرات' },
      { id: 'components-library', icon: Layers, label: 'Components', labelAr: 'المكونات' },
      { id: 'dynamics', icon: Wind, label: 'Flight Dynamics', labelAr: 'ديناميكا الطيران' },
      { id: 'maneuver-simulation', icon: Menu, label: 'Maneuvers', labelAr: 'المناورات' },
      { id: 'connection-simulation', icon: Zap, label: 'Connections', labelAr: 'الاتصالات' },
      { id: 'network-simulation', icon: SlidersHorizontal, label: 'Network Simulation', labelAr: 'محاكاة الشبكة' },
      { id: 'reports', icon: BarChart3, label: 'Reports', labelAr: 'التقارير' },
    ] },
    { title: 'SYSTEM', titleAr: 'النظام', env: 'asab', items: [
      { id: 'scenario-manager', icon: Database, label: 'Scenarios', labelAr: 'السيناريوهات' },
      { id: 'settings', icon: Settings, label: 'Settings', labelAr: 'الإعدادات' },
      { id: 'about-asab', icon: Info, label: 'About', labelAr: 'عن المنظومة' },
    ] },
  ];

  return <>
    {mobileSidebarOpen && <button aria-label={isArabic ? 'إغلاق القائمة' : 'Close menu'} onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" />}
    <aside className={`app-sidebar fixed inset-y-0 start-0 z-50 flex w-[84%] max-w-80 flex-col border-e border-[#32261b] bg-[#1a140e] text-[#f6ecdd] shadow-2xl transition-transform duration-300 md:relative md:inset-auto md:z-10 md:h-full md:w-72 md:translate-x-0 md:shadow-none ${mobileSidebarOpen ? 'translate-x-0 rtl:translate-x-0' : '-translate-x-full rtl:translate-x-full' } ${collapsed ? 'md:w-[76px]' : ''}`}>
      <div className="flex items-center justify-between border-b border-[#32261b] px-4 py-4">
        {!collapsed && <div><div className="text-[10px] font-bold tracking-[0.18em] text-[#8c7860]">{isArabic ? 'التنقل' : 'NAVIGATION'}</div><div className="mt-1 text-sm font-bold">{isArabic ? 'مساحة العمل' : 'Workspace'}</div></div>}
        <button onClick={() => setMobileSidebarOpen(false)} className="rounded-lg p-2 text-[#b9a58c] hover:bg-[#32261b] md:hidden"><X className="h-5 w-5" /></button>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-2 text-[#b9a58c] hover:bg-[#32261b] md:block" title={collapsed ? 'Expand' : 'Collapse'}>{collapsed ? <ChevronRight className="h-4 w-4 rtl:rotate-180" /> : <ChevronLeft className="h-4 w-4 rtl:rotate-180" />}</button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => <section key={group.title} className="mb-6">
          {!collapsed && <div className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-[#b5793f]">{isArabic ? group.titleAr : group.title}</div>}
          <div className="space-y-1">
            {group.items.map((item) => { const Icon = item.icon; const active = settings.activeModuleId === item.id; return <button key={item.id} onClick={() => go(item.id, group.env)} title={isArabic ? item.labelAr : item.label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-xs transition ${active ? 'bg-[#9a6a3a] font-bold text-[#120e0a] shadow-sm' : 'text-[#b9a58c] hover:bg-[#32261b] hover:text-[#f6ecdd]'}`}><Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#120e0a]' : 'text-[#b99772]'}`} />{!collapsed && <span className="min-w-0 flex-1 truncate">{isArabic ? item.labelAr : item.label}</span>}{!collapsed && item.badge !== undefined && <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${active ? 'bg-black/15 text-[#120e0a]' : 'bg-[#231a12] text-[#b5793f]'}`}>{item.badge}</span>}</button>; })}
          </div>
        </section>)}
      </div>
      {!collapsed && <div className="border-t border-[#32261b] px-4 py-3 text-[10px] text-[#8c7860]"><div className="flex items-center justify-between"><span>{isArabic ? 'منظومة عَصَب' : 'ASAB PLATFORM'}</span><span className="rounded-full bg-[#20331b] px-2 py-1 text-[#8fc46a]">{isArabic ? 'متصل' : 'ONLINE'}</span></div></div>}
    </aside>
  </>;
};
