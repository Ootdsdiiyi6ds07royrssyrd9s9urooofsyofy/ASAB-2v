/**
 * ASAB | AEROLAB 3D - Educational Aircraft Dynamics Simulation
 * Interactive 6-DoF aerodynamic forces visualizer, wind shear simulation, and lift/drag curves.
 */

import React, { useEffect, useState } from 'react';
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  TrendingUp,
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Info,
} from 'lucide-react';
import { calculateAeroDynamics } from '../../utils/rules';
import { useSimulation } from '../../context/SimulationContext';

export const DynamicSimulationView: React.FC = () => {
  const { settings } = useSimulation();
  const isArabic = settings.language === 'ar';

  const [airspeedKmh, setAirspeedKmh] = useState<number>(130);
  const [pitchDeg, setPitchDeg] = useState<number>(4);
  const [rollDeg, setRollDeg] = useState<number>(0);
  const [massKg, setMassKg] = useState<number>(28.5);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(15);
  const [windAngleDeg, setWindAngleDeg] = useState<number>(45);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [aero, setAero] = useState(() => calculateAeroDynamics(130, 4, 0, 28.5, 15, 45));

  useEffect(() => {
    const update = () => setAero(calculateAeroDynamics(airspeedKmh, pitchDeg, rollDeg, massKg, windSpeedKmh, windAngleDeg));
    update();
    if (!isSimRunning) return;
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [airspeedKmh, pitchDeg, rollDeg, massKg, windSpeedKmh, windAngleDeg, isSimRunning]);

  const handleReset = () => {
    setAirspeedKmh(130);
    setPitchDeg(4);
    setRollDeg(0);
    setMassKg(28.5);
    setWindSpeedKmh(15);
    setWindAngleDeg(45);
    setIsSimRunning(true);
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <Wind className="w-5 h-5 text-[#9a6a3a]" />
            <span>{isArabic ? 'محاكاة ديناميكا الطيران وقوى الرفع والسحب' : 'AERODYNAMIC DYNAMICS & FORCES SIMULATION'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'محاكاة تعليمية تفاعلية لحساب قوى الرفع، السحب، الضغط الديناميكي، وتأثير الرياح على طائرة ASAB-V100.'
              : 'Educational physics model calculating aerodynamic lift, drag, pitching moments, and dynamic stability envelopes.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimRunning(!isSimRunning)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              isSimRunning
                ? 'bg-[#f5b82e]/20 text-[#f5b82e] border border-[#f5b82e]/40'
                : 'bg-[#8fc46a]/20 text-[#8fc46a] border border-[#8fc46a]/40'
            }`}
          >
            {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimRunning ? (isArabic ? 'إيقاف مؤقت' : 'PAUSE') : (isArabic ? 'تشغيل' : 'RESUME')}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] text-[#f6ecdd] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إعادة ضبط' : 'RESET'}</span>
          </button>
        </div>
      </div>

      {/* Aerodynamic Force Indicators Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Lift Force */}
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-1">
          <div className="flex items-center justify-between text-[#b9a58c]">
            <span>{isArabic ? 'قوة الرفع (L)' : 'LIFT FORCE (L)'}</span>
            <ArrowUp className="w-4 h-4 text-[#8fc46a]" />
          </div>
          <div className="text-2xl font-bold text-[#8fc46a]">{aero.liftNewtons} <span className="text-xs font-normal">N</span></div>
          <div className="text-[10px] text-[#8c7860]">{isArabic ? 'مقابل الجاذبية' : 'Vs Gravity'}: {aero.gravityNewtons} N</div>
        </div>

        {/* Drag Force */}
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-1">
          <div className="flex items-center justify-between text-[#b9a58c]">
            <span>{isArabic ? 'قوة السحب (D)' : 'DRAG FORCE (D)'}</span>
            <ArrowRight className="w-4 h-4 text-[#e8584a]" />
          </div>
          <div className="text-2xl font-bold text-[#e8584a]">{aero.dragNewtons} <span className="text-xs font-normal">N</span></div>
          <div className="text-[10px] text-[#8c7860]">{isArabic ? 'سحب طفيلي + حثي' : 'Parasitic + Induced'}</div>
        </div>

        {/* Lift-to-Drag Ratio */}
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-1">
          <div className="flex items-center justify-between text-[#b9a58c]">
            <span>{isArabic ? 'نسبة الرفع / السحب (L/D)' : 'LIFT / DRAG (L/D)'}</span>
            <TrendingUp className="w-4 h-4 text-[#9a6a3a]" />
          </div>
          <div className="text-2xl font-bold text-[#9a6a3a]">{aero.liftToDragRatio}</div>
          <div className="text-[10px] text-[#8c7860]">{isArabic ? 'الكفاءة الأيروديناميكية' : 'Aerodynamic Efficiency'}</div>
        </div>

        {/* Dynamic Pressure */}
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-1">
          <div className="flex items-center justify-between text-[#b9a58c]">
            <span>{isArabic ? 'الضغط الديناميكي (q)' : 'DYNAMIC PRESSURE (q)'}</span>
            <Activity className="w-4 h-4 text-[#f5b82e]" />
          </div>
          <div className="text-2xl font-bold text-[#f5b82e]">{aero.dynamicPressurePa} <span className="text-xs font-normal">Pa</span></div>
          <div className="text-[10px] text-[#8c7860]">0.5 · ρ · V²</div>
        </div>
      </div>

      {/* Interactive Parameter Sliders & Force Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders Control Panel */}
        <div className="p-5 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-4">
          <div className="text-sm font-bold text-[#f6ecdd] flex items-center justify-between pb-2 border-b border-[#32261b]">
            <span>{isArabic ? 'معايير نظام الطيران' : 'FLIGHT REGIME PARAMETERS'}</span>
            <Sliders className="w-4 h-4 text-[#9a6a3a]" />
          </div>

          {/* Airspeed Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#b9a58c]">{isArabic ? 'السرعة الجوية (V):' : 'AIRالسرعة (V):'}</span>
              <span className="text-[#9a6a3a] font-bold">{airspeedKmh} كم/س ({(airspeedKmh / 3.6).toFixed(1)} م/ث)</span>
            </div>
            <input
              type="range"
              min="40"
              max="220"
              value={airspeedKmh}
              onChange={(e) => setAirspeedKmh(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#231a12] accent-[#9a6a3a] cursor-pointer"
            />
          </div>

          {/* Pitch / Angle of Attack Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#b9a58c]">{isArabic ? 'زاوية الانحدار / الهجوم (α):' : 'PITCH / ANGLE OF ATTACK (α):'}</span>
              <span className="text-[#9a6a3a] font-bold">{pitchDeg}°</span>
            </div>
            <input
              type="range"
              min="-10"
              max="25"
              value={pitchDeg}
              onChange={(e) => setPitchDeg(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#231a12] accent-[#9a6a3a] cursor-pointer"
            />
          </div>

          {/* Aircraft Mass Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#b9a58c]">{isArabic ? 'الكتلة الإجمالية (m):' : 'AIRCRAFT ALL-UP MASS (m):'}</span>
              <span className="text-[#9a6a3a] font-bold">{massKg} كغ</span>
            </div>
            <input
              type="range"
              min="18"
              max="38"
              step="0.5"
              value={massKg}
              onChange={(e) => setMassKg(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#231a12] accent-[#9a6a3a] cursor-pointer"
            />
          </div>

          {/* Wind Speed Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#b9a58c]">{isArabic ? 'شدة الرياح الجوية:' : 'ENVIRONMENTAL WIND INTENSITY:'}</span>
              <span className="text-[#f5b82e] font-bold">{windSpeedKmh} كم/س</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={windSpeedKmh}
              onChange={(e) => setWindSpeedKmh(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#231a12] accent-[#f5b82e] cursor-pointer"
            />
          </div>
        </div>

        {/* 2D Free-Body Force Equilibrium Diagram */}
        <div className="p-5 rounded-xl bg-[#1a140e] border border-[#32261b] flex flex-col justify-between space-y-4">
          <div className="text-sm font-bold text-[#f6ecdd] flex items-center justify-between pb-2 border-b border-[#32261b]">
            <span>{isArabic ? 'توازن القوى للجسم الحر' : 'FREE-BODY FORCE EQUILIBRIUM'}</span>
            <span className="text-[10px] text-[#8fc46a]">
              {aero.verticalAcceleration >= 0
                ? (isArabic ? `صعود (+${aero.verticalAcceleration} م/ث²)` : `Climbing (+${aero.verticalAcceleration} m/s²)`)
                : (isArabic ? `هبوط (${aero.verticalAcceleration} م/ث²)` : `Descending (${aero.verticalAcceleration} m/s²)`)}
            </span>
          </div>

          {/* Diagram Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 relative min-h-[200px]">
            {/* Aircraft silhouette in center */}
            <div className="w-32 h-10 border border-[#9a6a3a] rounded-full bg-[#231a12] flex items-center justify-center font-bold text-[#f6ecdd] relative shadow-lg">
              ASAB-V100
              {/* Lift vector up */}
              <div
                className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center text-[#8fc46a]"
                style={{ height: `${Math.min(90, Math.max(30, aero.liftNewtons / 8))}px` }}
              >
                <ArrowUp className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">L = {aero.liftNewtons}N</span>
              </div>

              {/* Gravity vector down */}
              <div
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center text-[#b9a58c]"
                style={{ height: `${Math.min(90, Math.max(30, aero.gravityNewtons / 8))}px` }}
              >
                <span className="text-[10px] font-bold">W = {aero.gravityNewtons}N</span>
                <ArrowDown className="w-5 h-5 shrink-0" />
              </div>

              {/* Drag vector right */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-20 flex items-center gap-1 text-[#e8584a]">
                <ArrowRight className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">D = {aero.dragNewtons}N</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] text-[10px] text-[#b9a58c]">
            <Info className="w-4 h-4 text-[#9a6a3a] shrink-0" />
            <span>
              {isArabic
                ? 'محاكاة تعليمية: تمثيل رياضي لديناميكا الطيران للأغراض التدريبية والبحثية، غير مخصص كبرمجية تحكم معتمدة.'
                : 'EDUCATIONAL SIMULATION: Mathematical representation for aerodynamic education, not certified for FAA/EASA avionics.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
