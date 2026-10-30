/**
 * ASAB | AEROLAB 3D - Top System Indicators & Environment Switcher
 */

import React from 'react';
import {
  Activity,
  Radio,
  Wifi,
  Clock,
  Shield,
  Layers,
  Globe,
  Maximize2,
  Compass,
  Cpu,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const AppHeader: React.FC = () => {
  const {
    nodes,
    links,
    metrics,
    activeScenarioId,
    scenarios,
    settings,
    updateSettings,
    navigateToModule,
  } = useSimulation();

  const activeNodesCount = nodes.filter((n) => n.status === 'Active').length;
  const standbyNodesCount = nodes.filter((n) => n.status === 'Standby').length;
  const offlineNodesCount = nodes.filter((n) => n.status === 'Disconnected' || n.status === 'Unavailable').length;

  const currentScenario = scenarios.find((s) => s.id === activeScenarioId);

  const toggleLanguage = () => {
    updateSettings({ language: settings.language === 'en' ? 'ar' : 'en' });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isArabic = settings.language === 'ar';

  return (
    <header className="h-14 bg-[#0D1623] border-b border-[#172638] px-4 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Brand & Environment Mode Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#35D5E8] to-[#172638] flex items-center justify-center font-bold text-[#080D16] text-sm tracking-tighter">
            ع
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-sm text-[#EDF4FA]">
                {isArabic ? 'عَصَب | ASAB' : 'ASAB | عَصَب'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#172638] text-[#35D5E8] border border-[#35D5E8]/30">
                SOVEREIGN AIRBORNE C2
              </span>
            </div>
          </div>
        </div>

        {/* Environment Switcher Tabs */}
        <div className="hidden lg:flex items-center p-1 rounded-lg bg-[#080D16] border border-[#172638]">
          <button
            onClick={() => navigateToModule('command-center', 'asab')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
              settings.activeEnvironment === 'asab'
                ? 'bg-[#35D5E8] text-[#080D16] font-bold shadow-sm'
                : 'text-[#92A4B8] hover:text-[#EDF4FA]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isArabic ? 'بيئة القيادة السيادية (ASAB)' : 'ASAB COMMAND'}</span>
          </button>
          <button
            onClick={() => navigateToModule('aircraft-studio', 'aerolab')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
              settings.activeEnvironment === 'aerolab'
                ? 'bg-[#5587FF] text-[#EDF4FA] font-bold shadow-sm'
                : 'text-[#92A4B8] hover:text-[#EDF4FA]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isArabic ? 'أيرولاب الهندسي (AEROLAB 3D)' : 'AEROLAB 3D'}</span>
          </button>
        </div>
      </div>

      {/* Real-time System Indicators derived from actual state */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono">
        {/* Total & Active Nodes */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111E2D] border border-[#172638]">
          <Radio className="w-3.5 h-3.5 text-[#35D5E8]" />
          <span className="text-[#92A4B8]">{isArabic ? 'العقد الجوية:' : 'NODES:'}</span>
          <span className="text-[#3DDC97] font-bold">{activeNodesCount}</span>
          <span className="text-[#64768B]">/</span>
          <span className="text-[#EDF4FA]">{nodes.length}</span>
          {offlineNodesCount > 0 && (
            <span className="text-[#FF5964] font-bold text-[10px]">
              {isArabic ? `(${offlineNodesCount} منفصلة)` : `(${offlineNodesCount} DOWN)`}
            </span>
          )}
        </div>

        {/* Active Mesh Links */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111E2D] border border-[#172638]">
          <Wifi className="w-3.5 h-3.5 text-[#5587FF]" />
          <span className="text-[#92A4B8]">{isArabic ? 'الروابط النشطة:' : 'LINKS:'}</span>
          <span className="text-[#35D5E8] font-bold">{metrics.activeLinksCount}</span>
        </div>

        {/* Network Health */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111E2D] border border-[#172638]">
          <Shield className="w-3.5 h-3.5 text-[#3DDC97]" />
          <span className="text-[#92A4B8]">{isArabic ? 'صحة الشبكة:' : 'HEALTH:'}</span>
          <span
            className={`font-bold ${
              metrics.overallHealthState === 'Healthy'
                ? 'text-[#3DDC97]'
                : metrics.overallHealthState === 'Degraded'
                ? 'text-[#F5B82E]'
                : 'text-[#FF5964]'
            }`}
          >
            {metrics.networkHealthPercent}%
          </span>
        </div>

        {/* Average Latency */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111E2D] border border-[#172638]">
          <Clock className="w-3.5 h-3.5 text-[#F5B82E]" />
          <span className="text-[#92A4B8]">{isArabic ? 'متوسط الاستجابة:' : 'AVG LATENCY:'}</span>
          <span className="text-[#EDF4FA] font-bold">{metrics.averageLatencyMs} {isArabic ? 'م.ث' : 'ms'}</span>
        </div>

        {/* Active Scenario */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111E2D] border border-[#172638]">
          <Activity className="w-3.5 h-3.5 text-[#35D5E8]" />
          <span className="text-[#92A4B8]">{isArabic ? 'السيناريو النشط:' : 'SCENARIO:'}</span>
          <span className="text-[#35D5E8] truncate max-w-[160px]">
            {isArabic ? currentScenario?.nameAr || currentScenario?.name : currentScenario?.name}
          </span>
        </div>
      </div>

      {/* Right Controls: Layer toggles, Lang, Fullscreen */}
      <div className="flex items-center gap-2">
        {/* Layer Toggles */}
        <div className="hidden sm:flex items-center gap-1 p-0.5 rounded bg-[#111E2D] border border-[#172638]">
          <button
            onClick={() => updateSettings({ showNetworkLayer: !settings.showNetworkLayer })}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              settings.showNetworkLayer ? 'bg-[#35D5E8]/20 text-[#35D5E8] font-bold' : 'text-[#64768B]'
            }`}
            title={isArabic ? 'تبديل طبقة روابط الشبكة' : 'Toggle Network Links Layer'}
          >
            {isArabic ? 'الروابط' : 'NET'}
          </button>
          <button
            onClick={() => updateSettings({ showCoverageLayer: !settings.showCoverageLayer })}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              settings.showCoverageLayer ? 'bg-[#35D5E8]/20 text-[#35D5E8] font-bold' : 'text-[#64768B]'
            }`}
            title={isArabic ? 'تبديل طبقة خلايا التغطية' : 'Toggle Coverage Bubbles Layer'}
          >
            {isArabic ? 'التغطية' : 'COV'}
          </button>
          <button
            onClick={() => updateSettings({ showLabels: !settings.showLabels })}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              settings.showLabels ? 'bg-[#35D5E8]/20 text-[#35D5E8] font-bold' : 'text-[#64768B]'
            }`}
            title={isArabic ? 'تبديل مسميات الطائرات' : 'Toggle Aircraft Labels'}
          >
            {isArabic ? 'المسميات' : 'LBL'}
          </button>
        </div>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-xs font-mono text-[#EDF4FA] transition-colors"
          title="Switch Language / تبديل اللغة"
        >
          <Globe className="w-3.5 h-3.5 text-[#35D5E8]" />
          <span>{settings.language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[#92A4B8] hover:text-[#EDF4FA] transition-colors"
          title={isArabic ? 'ملء الشاشة' : 'Toggle Fullscreen'}
          aria-label={isArabic ? 'ملء الشاشة' : 'Toggle Fullscreen'}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
