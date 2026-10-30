/**
 * ASAB | AEROLAB 3D - System Settings
 * Language (English / Arabic RTL), graphics quality, simulation speed, and layer preferences.
 */

import React from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Sliders,
  Volume2,
  VolumeX,
  Gauge,
  Layers,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetSimulation } = useSimulation();
  const isArabic = settings.language === 'ar';

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none max-w-4xl">
      {/* Title */}
      <div className="pb-4 border-b border-[#172638]">
        <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#35D5E8]" />
          <span>{isArabic ? 'إعدادات المنظومة وتفضيلات العرض' : 'SYSTEM CONFIGURATION & PREFERENCES'}</span>
        </h1>
        <p className="text-[#92A4B8] text-[11px] font-sans">
          {isArabic
            ? 'تخصيص لغة الواجهة، جودة التصيير ثلاثي الأبعاد، وسرعة محاكاة الوقت.'
            : 'Configure localization, WebGL visual fidelity, simulation clock multipliers, and default map layers.'}
        </p>
      </div>

      {/* Language / Localization */}
      <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#EDF4FA]">
          <Globe className="w-4 h-4 text-[#35D5E8]" />
          <span>{isArabic ? 'لغة الواجهة والاتجاه' : 'LANGUAGE & DIRECTION (RTL / LTR)'}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            onClick={() => updateSettings({ language: 'en' })}
            className={`p-3 rounded-xl border text-left transition-colors ${
              settings.language === 'en'
                ? 'bg-[#172638] border-[#35D5E8] text-[#35D5E8] font-bold'
                : 'bg-[#111E2D] border-[#172638] text-[#92A4B8]'
            }`}
          >
            <div className="font-bold text-sm">English</div>
            <div className="text-[10px] text-[#64768B]">Left-to-Right (LTR)</div>
          </button>

          <button
            onClick={() => updateSettings({ language: 'ar' })}
            className={`p-3 rounded-xl border text-right transition-colors ${
              settings.language === 'ar'
                ? 'bg-[#172638] border-[#35D5E8] text-[#35D5E8] font-bold'
                : 'bg-[#111E2D] border-[#172638] text-[#92A4B8]'
            }`}
          >
            <div className="font-bold text-sm font-arabic">العربية</div>
            <div className="text-[10px] text-[#64768B]">من اليمين إلى اليسار (RTL)</div>
          </button>
        </div>
      </div>

      {/* Graphics Quality */}
      <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#EDF4FA]">
          <Gauge className="w-4 h-4 text-[#5587FF]" />
          <span>3D RENDERING QUALITY PRESET</span>
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {(['low', 'medium', 'high'] as const).map((q) => (
            <button
              key={q}
              onClick={() => updateSettings({ quality: q })}
              className={`p-2.5 rounded-xl border capitalize transition-colors ${
                settings.quality === q
                  ? 'bg-[#172638] border-[#5587FF] text-[#5587FF] font-bold'
                  : 'bg-[#111E2D] border-[#172638] text-[#92A4B8]'
              }`}
            >
              {q} Quality
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#64768B] font-sans">
          Adjusts shadows, pixel ratio, and anisotropic filtering to optimize FPS across desktop and low-power devices.
        </p>
      </div>

      {/* Simulation Speed */}
      <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#EDF4FA]">
          <Sliders className="w-4 h-4 text-[#F5B82E]" />
          <span>SIMULATION CLOCK TIME MULTIPLIER</span>
        </div>
        <div className="flex items-center gap-2">
          {[0.5, 1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => updateSettings({ simulationSpeed: speed })}
              className={`px-4 py-2 rounded-xl border text-xs font-bold transition-colors ${
                settings.simulationSpeed === speed
                  ? 'bg-[#F5B82E] text-[#080D16]'
                  : 'bg-[#111E2D] border-[#172638] text-[#92A4B8] hover:text-[#EDF4FA]'
              }`}
            >
              {speed}x Realtime
            </button>
          ))}
        </div>
      </div>

      {/* Default Airspace Visual Layers */}
      <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#EDF4FA]">
          <Layers className="w-4 h-4 text-[#3DDC97]" />
          <span>DEFAULT AIRSPACE LAYERS</span>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showNetworkLayer}
              onChange={(e) => updateSettings({ showNetworkLayer: e.target.checked })}
              className="accent-[#35D5E8]"
            />
            <span>Show RF Mesh Link Visualizations by default</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showCoverageLayer}
              onChange={(e) => updateSettings({ showCoverageLayer: e.target.checked })}
              className="accent-[#35D5E8]"
            />
            <span>Show Hemispherical Node RF Coverage Bubbles</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showLabels}
              onChange={(e) => updateSettings({ showLabels: e.target.checked })}
              className="accent-[#35D5E8]"
            />
            <span>Show Aircraft Callsign & Identification Billboard Sprites</span>
          </label>
        </div>
      </div>

      {/* Global State Reset */}
      <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#FF5964]/30 space-y-3">
        <div className="text-sm font-bold text-[#FF5964] flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>FACTORY RESTORE LOCAL STATE</span>
        </div>
        <p className="text-[11px] text-[#92A4B8] font-sans">
          Resets all aircraft positions, custom scenarios, and event logs back to sovereign initialization defaults.
        </p>
        <button
          onClick={() => {
            resetSimulation();
            localStorage.removeItem('asab_custom_scenarios');
          }}
          className="px-4 py-2 rounded-xl bg-[#FF5964]/20 hover:bg-[#FF5964]/30 border border-[#FF5964]/40 text-[#FF5964] font-bold text-xs transition-colors"
        >
          RESTORE ALL DEFAULTS
        </button>
      </div>
    </div>
  );
};
