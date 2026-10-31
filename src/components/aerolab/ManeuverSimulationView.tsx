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
    <div className="h-full flex flex-col bg-[#120e0a] font-mono text-xs select-none overflow-hidden relative">
      {/* Top Controls Bar */}
      <div className="h-14 bg-[#1a140e] border-b border-[#32261b] px-4 flex flex-wrap items-center justify-between shrink-0 z-10 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#f6ecdd]">
            <FolderGit2 className="w-4 h-4 text-[#9a6a3a]" />
            <span>{isArabic ? 'محاكاة المناورات وتفادي العوائق المتقدمة' : 'ADVANCED 3D FLIGHT MANEUVER & TACTICAL ARENA'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[#b9a58c] hidden sm:inline">{isArabic ? 'نوع المناورة:' : 'MANEUVER:'}</span>
            <select
              value={selectedManeuver}
              onChange={(e) => setSelectedManeuver(e.target.value)}
              className="p-1 rounded bg-[#231a12] border border-[#32261b] text-[#9a6a3a] font-bold focus:outline-none"
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
                ? 'bg-[#8fc46a]/20 text-[#8fc46a] border-[#8fc46a]/50 hover:bg-[#8fc46a]/30'
                : 'bg-[#f5b82e]/20 text-[#f5b82e] border-[#f5b82e]/50 hover:bg-[#f5b82e]/30'
            }`}
            title={isPaused ? 'استئناف المحاكاة' : 'إيقاف مؤقت'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isPaused ? (isArabic ? 'استئناف' : 'Resume') : (isArabic ? 'إيقاف مؤقت' : 'Pause')}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#231a12] px-2 py-1 rounded border border-[#32261b]">
            <Zap className="w-3.5 h-3.5 text-[#9a6a3a]" />
            <span className="text-[#b9a58c] hidden sm:inline">سرعة:</span>
            {[0.5, 1.0, 2.0, 4.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  speed === s ? 'bg-[#9a6a3a] text-[#120e0a]' : 'text-[#b9a58c] hover:text-[#f6ecdd]'
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
                ? 'bg-[#e8584a] text-white border-[#e8584a] animate-pulse'
                : 'bg-[#e8584a]/10 text-[#e8584a] border-[#e8584a]/40 hover:bg-[#e8584a]/20'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مناورة طارئة' : 'Emergency Evasion'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded bg-[#231a12] border border-[#32261b] text-[#b9a58c] hover:text-[#f6ecdd] hover:border-[#9a6a3a]/40 transition-colors"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-toolbar for Sliders (Altitude, Agility, Weather & Jammers) */}
      <div className="bg-[#18130e] border-b border-[#32261b] px-4 py-2 flex flex-wrap items-center gap-6 shrink-0 text-[11px] text-[#b9a58c]">
        <div className="flex items-center gap-2">
          <span>{isArabic ? 'الارتفاع:' : 'Altitude:'}</span>
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            value={altitudeOffset}
            onChange={(e) => setAltitudeOffset(Number(e.target.value))}
            className="w-24 accent-[#9a6a3a] cursor-pointer"
          />
          <span className="text-[#9a6a3a] font-bold w-6">{altitudeOffset}M</span>
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
            className="w-24 accent-[#9a6a3a] cursor-pointer"
          />
          <span className="text-[#9a6a3a] font-bold w-6">{agility}x</span>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-[#9a6a3a]" />
          <span>{isArabic ? 'سرعة الرياح:' : 'Wind:'}</span>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={windSpeed}
            onChange={(e) => setWindSpeed(Number(e.target.value))}
            className="w-24 accent-[#9a6a3a] cursor-pointer"
          />
          <span className="text-[#9a6a3a] font-bold w-8">{windSpeed}Kn</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setJammerActive(!jammerActive)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              jammerActive ? 'bg-[#f5b82e] text-[#120e0a] border-[#f5b82e]' : 'bg-[#231a12] text-[#f5b82e] border-[#f5b82e]/40 hover:bg-[#f5b82e]/20'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{isArabic ? 'التشويش الإلكتروني' : 'Jammer Active'}</span>
          </button>

          <button
            onClick={() => setSandstormMode(!sandstormMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              sandstormMode ? 'bg-[#e07a5f] text-white border-[#e07a5f]' : 'bg-[#231a12] text-[#e07a5f] border-[#e07a5f]/40 hover:bg-[#e07a5f]/20'
            }`}
          >
            <CloudFog className="w-3 h-3" />
            <span>{isArabic ? 'عاصفة رملية' : 'Sandstorm'}</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] text-[#8fc46a] bg-[#8fc46a]/10 px-2 py-1 rounded border border-[#8fc46a]/30">
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
