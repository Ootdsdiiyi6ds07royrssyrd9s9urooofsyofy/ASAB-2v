/**
 * ASAB | AEROLAB 3D - Interactive Flight Simulator Module
 * Integrates 3D cockpit, runway environment, flight scenarios, and HUD instrumentation.
 */

import React, { useEffect, useState } from 'react';
import {
  Navigation,
  Compass,
  LocateFixed,
  Map as MapIcon,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Sliders,
  Flag,
  HelpCircle,
} from 'lucide-react';
import { FlightSimulator3DCanvas } from '../3d/FlightSimulator3DCanvas';
import { useSimulation } from '../../context/SimulationContext';

const FlightMap: React.FC<{ isArabic: boolean }> = ({ isArabic }) => {
  const [zoom, setZoom] = useState(1);
  const [phase, setPhase] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setPhase((value) => (value + 1) % 100), 700);
    return () => window.clearInterval(timer);
  }, []);

  const route = 'M 34 148 C 72 130, 88 92, 128 104 S 176 142, 210 104 S 268 54, 320 62';
  const aircraftX = 34 + (phase / 99) * 286;
  const aircraftY = 148 - Math.sin((phase / 99) * Math.PI * 2.6) * 42 - (phase / 99) * 62;
  return (
    <section className="w-full overflow-hidden rounded-xl border border-[#32261b] bg-[#211810]/95 shadow-[0_18px_40px_rgba(53,36,20,0.18)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[#32261b] px-3 py-2.5">
        <button onClick={() => setIsOpen((value) => !value)} className="flex items-center gap-2 text-[11px] font-bold text-[#f6ecdd]" aria-expanded={isOpen}><MapIcon className="h-4 w-4 text-[#b5793f]" />{isArabic ? 'خريطة الملاحة' : 'NAVIGATION MAP'}<span className="rounded-full bg-[#20331b] px-1.5 py-0.5 text-[8px] text-[#8fc46a]">{isOpen ? (isArabic ? 'مفتوحة' : 'OPEN') : (isArabic ? 'عرض' : 'VIEW')}</span></button>
        {isOpen && <div className="flex items-center gap-1"><button onClick={() => setZoom((value) => Math.min(1.7, value + 0.15))} className="rounded-md p-1 text-[#8d765e] hover:bg-[#231a12]" aria-label={isArabic ? 'تكبير الخريطة' : 'Zoom in'}><Plus className="h-3.5 w-3.5" /></button><button onClick={() => setZoom((value) => Math.max(.75, value - 0.15))} className="rounded-md p-1 text-[#8d765e] hover:bg-[#231a12]" aria-label={isArabic ? 'تصغير الخريطة' : 'Zoom out'}><Minus className="h-3.5 w-3.5" /></button><button onClick={() => setZoom(1)} className="rounded-md p-1 text-[#8d765e] hover:bg-[#231a12]" aria-label={isArabic ? 'إعادة ضبط الخريطة' : 'Reset map'}><LocateFixed className="h-3.5 w-3.5" /></button></div>}
      </div>
      {isOpen && <div className="relative h-44 overflow-hidden bg-[#15100c] sm:h-48">
        <svg viewBox="0 0 360 190" className="h-full w-full" style={{ transform: `scale(${zoom})`, transition: 'transform .25s ease' }}>
          <defs><pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#d8c6b1" strokeWidth=".7" opacity=".55" /></pattern></defs>
          <rect width="360" height="190" fill="#15100c" /><rect width="360" height="190" fill="url(#map-grid)" />
          <path d="M-10 36 C 70 18, 130 62, 195 28 S 300 15, 370 40" fill="none" stroke="#d1b28d" strokeWidth="7" opacity=".35" />
          <path d="M-10 36 C 70 18, 130 62, 195 28 S 300 15, 370 40" fill="none" stroke="#2b1d14" strokeWidth="3" opacity=".9" />
          <path d="M46 -8 C 70 52, 42 96, 76 198 M184 -8 C 160 46, 218 115, 190 198 M292 -8 C 278 68, 318 105, 286 198" fill="none" stroke="#decdb9" strokeWidth="2" />
          <path d={route} fill="none" stroke="#b5793f" strokeWidth="7" strokeLinecap="round" opacity=".14" />
          <path d={route} fill="none" stroke="#b5793f" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="34" cy="148" r="6" fill="#211810" stroke="#8fc46a" strokeWidth="3" /><circle cx="320" cy="62" r="6" fill="#211810" stroke="#e8584a" strokeWidth="3" />
          <text x="20" y="174" fill="#b9a58c" fontSize="9" fontFamily="monospace">GCS-01</text><text x="300" y="48" fill="#b9a58c" fontSize="9" fontFamily="monospace">WP-04</text>
          <g transform={`translate(${aircraftX} ${aircraftY}) rotate(-18)`}><path d="M 12 0 L -9 -5 L -4 0 L -9 5 Z" fill="#f6ecdd" stroke="#211810" strokeWidth="1.5" /></g>
        </svg>
        <div className="absolute bottom-2 end-2 rounded-md bg-[#211810]/85 px-2 py-1 text-[9px] text-[#b9a58c] shadow-sm">{isArabic ? 'مسار التدريب' : 'TRAINING ROUTE'} · {Math.round(zoom * 100)}%</div>
      </div>}
    </section>
  );
};

export const FlightSimulationView: React.FC = () => {
  const { settings } = useSimulation();
  const [selectedScenario, setSelectedScenario] = useState<string>('Basic Takeoff');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showNavigationMap, setShowNavigationMap] = useState<boolean>(true);

  const isArabic = settings.language === 'ar';

  const scenarios = isArabic
    ? [
        { id: 'Basic Takeoff', name: 'إقلاع أولي من المدرج' },
        { id: 'Level Flight', name: 'طيران مستوٍ وتثبيت الارتفاع' },
        { id: 'Controlled Turns', name: 'مناورات دوران محكومة' },
        { id: 'Altitude Adjustment', name: 'تعديل الارتفاع والضغط' },
        { id: 'Wind Disturbance', name: 'مقاومة اضطرابات الرياح' },
        { id: 'Landing Approach', name: 'مسار الاقتراب والهبوط' },
      ]
    : [
        { id: 'Basic Takeoff', name: 'Basic Takeoff' },
        { id: 'Level Flight', name: 'Level Flight' },
        { id: 'Controlled Turns', name: 'Controlled Turns' },
        { id: 'Altitude Adjustment', name: 'Altitude Adjustment' },
        { id: 'Wind Disturbance', name: 'Wind Disturbance' },
        { id: 'Landing Approach', name: 'Landing Approach' },
      ];

  return (
    <div className="h-full flex flex-col bg-[#120e0a] font-mono text-xs select-none overflow-hidden relative">
      {/* Flight Control Bar */}
      <div className="h-12 bg-[#1a140e] border-b border-[#32261b] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#f6ecdd]">
            <Navigation className="w-4 h-4 text-[#9a6a3a]" />
            <span>{isArabic ? 'محاكي الطيران التفاعلي ثلاثي الأبعاد' : '3D FLIGHT SIMULATION'}</span>
          </div>

          {/* Scenario Select */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
            <span className="text-[#b9a58c]">{isArabic ? 'مهمة التدريب:' : 'TRAINING MISSION:'}</span>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="p-1 rounded bg-[#231a12] border border-[#32261b] text-[#9a6a3a] font-bold focus:outline-none"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Flight Controls Help Modal Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNavigationMap((value) => !value)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] text-[#b9a58c] hover:text-[#f6ecdd] text-[11px] transition-colors"
            aria-pressed={showNavigationMap}
          >
            <MapIcon className="w-3.5 h-3.5 text-[#b5793f]" />
            <span>{isArabic ? (showNavigationMap ? 'إخفاء الخريطة' : 'إظهار الخريطة') : (showNavigationMap ? 'HIDE MAP' : 'SHOW MAP')}</span>
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] text-[#b9a58c] hover:text-[#f6ecdd] text-[11px] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#9a6a3a]" />
            <span>{isArabic ? 'مفاتيح التحكم للطيار' : 'PILOT CONTROLS'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Flight Simulator Viewport */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="relative order-2 min-h-[360px] flex-1 overflow-hidden lg:order-1 lg:min-h-0">
          <FlightSimulator3DCanvas activeScenario={selectedScenario} />
        </div>
        {showNavigationMap && <aside className="order-1 max-h-[250px] w-full shrink-0 overflow-y-auto border-b border-[#32261b] bg-[#1a140e] p-2 lg:order-2 lg:max-h-none lg:w-[380px] lg:border-b-0 lg:border-s lg:p-3">
          <FlightMap isArabic={isArabic} />
        </aside>}

        {/* Pilot Controls Modal Overlay */}
        {showHelp && (
          <div className="absolute inset-0 z-30 bg-[#120e0a]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md p-5 rounded-2xl bg-[#1a140e] border border-[#9a6a3a]/40 shadow-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#32261b]">
                <div className="text-sm font-bold text-[#9a6a3a]">
                  {isArabic ? 'مفاتيح التحكم ومساعد الطيران' : 'FLIGHT SIMULATOR PILOT CONTROLS'}
                </div>
                <button onClick={() => setShowHelp(false)} className="text-[#b9a58c] hover:text-white">✕</button>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] flex justify-between">
                  <span className="text-[#b9a58c]" dir="ltr">W / S</span>
                  <span className="text-[#f6ecdd] font-bold">
                    {isArabic ? 'انحدار لأسفل / رفع المقدمة (Pitch)' : 'Pitch Down / Pitch Up'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] flex justify-between">
                  <span className="text-[#b9a58c]" dir="ltr">A / D</span>
                  <span className="text-[#f6ecdd] font-bold">
                    {isArabic ? 'دوران يسار / يمين (Roll / Banking)' : 'Roll Left / Roll Right (Banking)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] flex justify-between">
                  <span className="text-[#b9a58c]" dir="ltr">Q / E</span>
                  <span className="text-[#f6ecdd] font-bold">
                    {isArabic ? 'انعراج يسار / يمين (Yaw)' : 'Yaw Left / Yaw Right'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] flex justify-between">
                  <span className="text-[#b9a58c]">{isArabic ? 'شريط الخانق على الشاشة' : 'On-Screen Slider / Shift-Ctrl'}</span>
                  <span className="text-[#9a6a3a] font-bold">
                    {isArabic ? 'قوة الدفع 0% إلى 100%' : 'Throttle 0% to 100%'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] flex justify-between">
                  <span className="text-[#b9a58c]">{isArabic ? 'مسافة (Space Bar)' : 'Space Bar'}</span>
                  <span className="text-[#f6ecdd] font-bold">
                    {isArabic ? 'إيقاف مؤقت / استئناف' : 'Pause / Resume Simulation'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] flex justify-between">
                  <span className="text-[#b9a58c]" dir="ltr">R Key</span>
                  <span className="text-[#e8584a] font-bold">
                    {isArabic ? 'إعادة ضبط الطائرة إلى المدرج' : 'Reset Flight to Runway'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-[#b9a58c] p-2.5 rounded bg-[#231a12]/50 border border-[#32261b]">
                {isArabic
                  ? 'التحول الديناميكي VTOL: تحت سرعة 40 كم/س توفر المراوح العمودية الأربعة قوة الرفع الرأسية. عند زيادة السرعة، يتولى الجناح الثابت توليد الرفع تلقائياً.'
                  : 'VTOL Transition: Under 40 km/h, quad-rotors provide vertical lift. At higher speeds, aerodynamic wing lift takes over automatically.'}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-1.5 rounded bg-[#9a6a3a] text-[#120e0a] font-bold hover:brightness-110 transition"
                >
                  {isArabic ? 'العودة إلى الطيران' : 'RESUME FLIGHT'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
