/**
 * ASAB | AEROLAB 3D - Maneuver Simulation & Obstacle Avoidance
 * Interactive 3D trajectory tracking arena with virtual obstacle clearance, advanced weather controls, and defensive maneuver response.
 */

import React, { useState } from 'react';
import {
  FolderGit2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldAlert,
  Compass,
  Zap,
  Wind,
  CloudFog,
  Radio,
  MapPin,
} from 'lucide-react';
import { ManeuverArena3DCanvas } from '../3d/ManeuverArena3DCanvas';
import { useSimulation } from '../../context/SimulationContext';

export const ManeuverSimulationView: React.FC = () => {
  const { settings } = useSimulation();
  const [selectedManeuver, setSelectedManeuver] = useState<string>('Obstacle Awareness');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [altitudeOffset, setAltitudeOffset] = useState<number>(6);
  const [agility, setAgility] = useState<number>(1.0);
  const [evasionActive, setEvasionActive] = useState<boolean>(false);

  // Advanced Weather & Tactical Controls
  const [windSpeed, setWindSpeed] = useState<number>(15);
  const [jammerActive, setJammerActive] = useState<boolean>(false);
  const [sandstormMode, setSandstormMode] = useState<boolean>(false);
  const [waypointsCount, setWaypointsCount] = useState<number>(4);

  const isArabic = settings.language === 'ar';

  const maneuvers = isArabic
    ? [
        { id: 'Straight Flight', name: 'طيران خطي مباشر' },
        { id: 'Gradual Turns', name: 'انعطافات تدريجية ناعمة' },
        { id: 'Banking', name: 'ميلان جانبي حاد (Banking)' },
        { id: 'Altitude Adjustment', name: 'مناورة التدرج بالارتفاع' },
        { id: 'Obstacle Awareness', name: 'تفادي العوائق والتضاريس' },
        { id: 'Safe Route Navigation', name: 'ملاحة المسار الآمن المشفر' },
      ]
    : [
        { id: 'Straight Flight', name: 'Straight Flight' },
        { id: 'Gradual Turns', name: 'Gradual Turns' },
        { id: 'Banking', name: 'Banking' },
        { id: 'Altitude Adjustment', name: 'Altitude Adjustment' },
        { id: 'Obstacle Awareness', name: 'Obstacle Awareness' },
        { id: 'Safe Route Navigation', name: 'Safe Route Navigation' },
      ];

  const handleReset = () => {
    setIsPaused(false);
    setSpeed(1.0);
    setAltitudeOffset(6);
    setAgility(1.0);
    setEvasionActive(false);
    setWindSpeed(15);
    setJammerActive(false);
    setSandstormMode(false);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#080D16] font-mono text-xs select-none overflow-hidden relative">
      {/* Top Controls Bar */}
      <div className="h-14 bg-[#0D1623] border-b border-[#172638] px-4 flex flex-wrap items-center justify-between shrink-0 z-10 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#EDF4FA]">
            <FolderGit2 className="w-4 h-4 text-[#35D5E8]" />
            <span>{isArabic ? 'محاكاة المناورات وتفادي العوائق المتقدمة' : 'ADVANCED 3D FLIGHT MANEUVER & TACTICAL ARENA'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[#92A4B8] hidden sm:inline">{isArabic ? 'نوع المناورة:' : 'MANEUVER:'}</span>
            <select
              value={selectedManeuver}
              onChange={(e) => setSelectedManeuver(e.target.value)}
              className="p-1 rounded bg-[#111E2D] border border-[#172638] text-[#35D5E8] font-bold focus:outline-none"
            >
              {maneuvers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Simulation Controls */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              isPaused
                ? 'bg-[#3DDC97]/20 text-[#3DDC97] border-[#3DDC97]/50 hover:bg-[#3DDC97]/30'
                : 'bg-[#F5B82E]/20 text-[#F5B82E] border-[#F5B82E]/50 hover:bg-[#F5B82E]/30'
            }`}
            title={isPaused ? 'استئناف المحاكاة' : 'إيقاف مؤقت'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isPaused ? (isArabic ? 'استئناف' : 'Resume') : (isArabic ? 'إيقاف مؤقت' : 'Pause')}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#111E2D] px-2 py-1 rounded border border-[#172638]">
            <Zap className="w-3.5 h-3.5 text-[#35D5E8]" />
            <span className="text-[#92A4B8] hidden sm:inline">سرعة:</span>
            {[0.5, 1.0, 2.0, 4.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  speed === s ? 'bg-[#35D5E8] text-[#080D16]' : 'text-[#92A4B8] hover:text-[#EDF4FA]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Emergency Evasion Toggle */}
          <button
            onClick={() => setEvasionActive(!evasionActive)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              evasionActive
                ? 'bg-[#FF5964] text-white border-[#FF5964] animate-pulse'
                : 'bg-[#FF5964]/10 text-[#FF5964] border-[#FF5964]/40 hover:bg-[#FF5964]/20'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مناورة طارئة' : 'Emergency Evasion'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded bg-[#111E2D] border border-[#172638] text-[#92A4B8] hover:text-[#EDF4FA] hover:border-[#35D5E8]/40 transition-colors"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-toolbar for Sliders (Altitude, Agility, Weather & Jammers) */}
      <div className="bg-[#0A101C] border-b border-[#172638] px-4 py-2 flex flex-wrap items-center gap-6 shrink-0 text-[11px] text-[#92A4B8]">
        <div className="flex items-center gap-2">
          <span>{isArabic ? 'الارتفاع:' : 'Altitude:'}</span>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={altitudeOffset}
            onChange={(e) => setAltitudeOffset(Number(e.target.value))}
            className="w-24 accent-[#35D5E8] cursor-pointer"
          />
          <span className="text-[#35D5E8] font-bold w-6">{altitudeOffset}M</span>
        </div>

        <div className="flex items-center gap-2">
          <span>{isArabic ? 'الرشاقة:' : 'Agility:'}</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.25"
            value={agility}
            onChange={(e) => setAgility(Number(e.target.value))}
            className="w-24 accent-[#35D5E8] cursor-pointer"
          />
          <span className="text-[#35D5E8] font-bold w-6">{agility}x</span>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-[#35D5E8]" />
          <span>{isArabic ? 'سرعة الرياح:' : 'Wind:'}</span>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={windSpeed}
            onChange={(e) => setWindSpeed(Number(e.target.value))}
            className="w-24 accent-[#35D5E8] cursor-pointer"
          />
          <span className="text-[#35D5E8] font-bold w-8">{windSpeed}Kn</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setJammerActive(!jammerActive)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              jammerActive ? 'bg-[#F5B82E] text-[#080D16] border-[#F5B82E]' : 'bg-[#111E2D] text-[#F5B82E] border-[#F5B82E]/40 hover:bg-[#F5B82E]/20'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{isArabic ? 'التشويش الإلكتروني' : 'Jammer Active'}</span>
          </button>

          <button
            onClick={() => setSandstormMode(!sandstormMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              sandstormMode ? 'bg-[#E07A5F] text-white border-[#E07A5F]' : 'bg-[#111E2D] text-[#E07A5F] border-[#E07A5F]/40 hover:bg-[#E07A5F]/20'
            }`}
          >
            <CloudFog className="w-3 h-3" />
            <span>{isArabic ? 'عاصفة رملية' : 'Sandstorm'}</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] text-[#3DDC97] bg-[#3DDC97]/10 px-2 py-1 rounded border border-[#3DDC97]/30">
            <MapPin className="w-3 h-3" />
            <span>{isArabic ? `نقاط المسار: ${waypointsCount}` : `Waypoints: ${waypointsCount}`}</span>
          </div>
        </div>
      </div>

      {/* Main 3D Maneuver Arena Viewport */}
      <div className="flex-1 relative overflow-hidden">
        <ManeuverArena3DCanvas
          selectedManeuver={selectedManeuver}
          speed={speed}
          altitudeOffset={altitudeOffset}
          agility={agility}
          isPaused={isPaused}
          evasionActive={evasionActive}
          windSpeed={windSpeed}
          jammerActive={jammerActive}
          sandstormMode={sandstormMode}
        />
      </div>
    </div>
  );
};
