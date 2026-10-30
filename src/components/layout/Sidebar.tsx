/**
 * ASAB | AEROLAB 3D - Main Application Navigation Sidebar
 * Implements complete hierarchical navigation across ASAB, AEROLAB, and SYSTEM modules.
 */

import React, { useState } from 'react';
import {
  Compass,
  Radio,
  MapPin,
  Plane,
  Network,
  Activity,
  Cpu,
  Share2,
  ShieldAlert,
  FileText,
  Box,
  Layers,
  Wind,
  Navigation,
  Sliders,
  FolderGit2,
  Settings as SettingsIcon,
  Info,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart3,
  Crosshair,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const Sidebar: React.FC = () => {
  const { settings, navigateToModule, events, nodes } = useSimulation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const isArabic = settings.language === 'ar';

  const asabModules = [
    { id: 'overview', icon: Compass, label: 'Overview', labelAr: 'نظرة عامة' },
    { id: 'command-center', icon: Radio, label: 'ASAB Command Center', labelAr: 'مركز قيادة عَصَب' },
    { id: 'cop', icon: Crosshair, label: 'Common Operational Picture', labelAr: 'المشهد العملياتي الموحد (COP)' },
    { id: 'airborne-fleet', icon: Plane, label: 'Airborne Fleet', labelAr: 'الأسطول الجوي', badge: nodes.length },
    { id: 'mesh-network', icon: Network, label: 'Network Topology', labelAr: 'طوبولوجيا الشبكة' },
    { id: 'network-health', icon: Activity, label: 'Network Health', labelAr: 'صحة الشبكة' },
    { id: 'edge-intelligence', icon: Cpu, label: 'Edge Intelligence', labelAr: 'الذكاء الحافي والضغط' },
    { id: 'interoperability', icon: Share2, label: 'Interoperability Hub', labelAr: 'منصة التشغيل البيني' },
    { id: 'resilience', icon: ShieldAlert, label: 'Resilience Scenarios', labelAr: 'سيناريوهات الصمود' },
    { id: 'event-log', icon: FileText, label: 'System Event Log', labelAr: 'سجل أحداث النظام', badge: events.length },
  ];

  const aerolabModules = [
    { id: 'aircraft-studio', icon: Box, label: '3D Aircraft Studio', labelAr: 'استوديو الطائرات ثلاثي الأبعاد' },
    { id: 'components-library', icon: Layers, label: 'Aircraft Components', labelAr: 'مكتبة مكونات الطائرة' },
    { id: 'dynamics', icon: Wind, label: 'Dynamic Simulation', labelAr: 'محاكاة ديناميكا الطيران' },
    { id: 'flight-simulation', icon: Navigation, label: 'Flight Simulation', labelAr: 'محاكي الطيران التفاعلي' },
    { id: 'connection-simulation', icon: Zap, label: 'Connection Simulation', labelAr: 'محاكاة التوصيل والكهرباء' },
    { id: 'network-simulation', icon: Sliders, label: 'Network Simulation', labelAr: 'محاكاة حزم الشبكة' },
    { id: 'maneuver-simulation', icon: FolderGit2, label: 'Maneuver Simulation', labelAr: 'محاكاة المناورات وتفادي العوائق' },
    { id: 'reports', icon: BarChart3, label: 'Simulation Reports', labelAr: 'تقارير المحاكاة' },
  ];

  const systemModules = [
    { id: 'scenario-manager', icon: Database, label: 'Scenario Manager', labelAr: 'مدير السيناريوهات' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings', labelAr: 'إعدادات المنظومة' },
    { id: 'about-asab', icon: Info, label: 'About ASAB', labelAr: 'عن منظومة عَصَب' },
  ];

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] bg-[#0D1623] border-r border-[#172638] transition-all duration-200 flex flex-col justify-between shrink-0 select-none z-10 ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      {/* Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* ASAB COMMAND GROUP */}
        <div>
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider text-[#35D5E8] uppercase">
              {isArabic ? 'بيئة القيادة والتحكم' : 'ASAB COMMAND'}
            </div>
          )}
          <div className="space-y-0.5">
            {asabModules.map((item) => {
              const Icon = item.icon;
              const isActive = settings.activeModuleId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToModule(item.id, 'asab')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                    isActive
                      ? 'bg-[#172638] text-[#35D5E8] border border-[#35D5E8]/40 font-bold'
                      : 'text-[#92A4B8] hover:bg-[#111E2D] hover:text-[#EDF4FA]'
                  }`}
                  title={isArabic ? item.labelAr : item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#35D5E8]' : 'text-[#64768B]'}`} />
                  {!collapsed && (
                    <span className="truncate flex-1">
                      {isArabic ? item.labelAr : item.label}
                    </span>
                  )}
                  {!collapsed && item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#111E2D] text-[#35D5E8] border border-[#172638]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AEROLAB ENGINEERING GROUP */}
        <div>
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider text-[#5587FF] uppercase">
              {isArabic ? 'أيرولاب للهندسة والمحاكاة' : 'AEROLAB ENGINEERING'}
            </div>
          )}
          <div className="space-y-0.5">
            {aerolabModules.map((item) => {
              const Icon = item.icon;
              const isActive = settings.activeModuleId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToModule(item.id, 'aerolab')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                    isActive
                      ? 'bg-[#172638] text-[#5587FF] border border-[#5587FF]/40 font-bold'
                      : 'text-[#92A4B8] hover:bg-[#111E2D] hover:text-[#EDF4FA]'
                  }`}
                  title={isArabic ? item.labelAr : item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#5587FF]' : 'text-[#64768B]'}`} />
                  {!collapsed && (
                    <span className="truncate flex-1">
                      {isArabic ? item.labelAr : item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SYSTEM GROUP */}
        <div>
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider text-[#92A4B8] uppercase">
              {isArabic ? 'إدارة المنظومة' : 'SYSTEM'}
            </div>
          )}
          <div className="space-y-0.5">
            {systemModules.map((item) => {
              const Icon = item.icon;
              const isActive = settings.activeModuleId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToModule(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                    isActive
                      ? 'bg-[#172638] text-[#EDF4FA] border border-[#35D5E8]/40 font-bold'
                      : 'text-[#92A4B8] hover:bg-[#111E2D] hover:text-[#EDF4FA]'
                  }`}
                  title={isArabic ? item.labelAr : item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#35D5E8]' : 'text-[#64768B]'}`} />
                  {!collapsed && (
                    <span className="truncate flex-1">
                      {isArabic ? item.labelAr : item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Collapse/Expand Toggle Bar */}
      <div className="p-2 border-t border-[#172638] flex items-center justify-between">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded bg-[#111E2D] hover:bg-[#172638] text-[#92A4B8] hover:text-[#EDF4FA] text-xs font-mono transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>{isArabic ? 'طي القائمة' : 'COLLAPSE'}</span>}
        </button>
      </div>
    </aside>
  );
};
