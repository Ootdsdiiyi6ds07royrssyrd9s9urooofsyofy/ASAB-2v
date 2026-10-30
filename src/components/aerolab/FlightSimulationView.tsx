/**
 * ASAB | AEROLAB 3D - Interactive Flight Simulator Module
 * Integrates 3D cockpit, runway environment, flight scenarios, and HUD instrumentation.
 */

import React, { useState } from 'react';
import {
  Navigation,
  Compass,
  Play,
  RotateCcw,
  Sliders,
  Flag,
  HelpCircle,
} from 'lucide-react';
import { FlightSimulator3DCanvas } from '../3d/FlightSimulator3DCanvas';
import { useSimulation } from '../../context/SimulationContext';

export const FlightSimulationView: React.FC = () => {
  const { settings } = useSimulation();
  const [selectedScenario, setSelectedScenario] = useState<string>('Basic Takeoff');
  const [showHelp, setShowHelp] = useState<boolean>(false);

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
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#080D16] font-mono text-xs select-none overflow-hidden relative">
      {/* Flight Control Bar */}
      <div className="h-12 bg-[#0D1623] border-b border-[#172638] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#EDF4FA]">
            <Navigation className="w-4 h-4 text-[#35D5E8]" />
            <span>{isArabic ? 'محاكي الطيران التفاعلي ثلاثي الأبعاد' : '3D FLIGHT SIMULATION'}</span>
          </div>

          {/* Scenario Select */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
            <span className="text-[#92A4B8]">{isArabic ? 'مهمة التدريب:' : 'TRAINING MISSION:'}</span>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="p-1 rounded bg-[#111E2D] border border-[#172638] text-[#35D5E8] font-bold focus:outline-none"
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
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[#92A4B8] hover:text-[#EDF4FA] text-[11px] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#35D5E8]" />
            <span>{isArabic ? 'مفاتيح التحكم للطيار' : 'PILOT CONTROLS'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Flight Simulator Viewport */}
      <div className="flex-1 relative overflow-hidden">
        <FlightSimulator3DCanvas activeScenario={selectedScenario} />

        {/* Pilot Controls Modal Overlay */}
        {showHelp && (
          <div className="absolute inset-0 z-30 bg-[#080D16]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md p-5 rounded-2xl bg-[#0D1623] border border-[#35D5E8]/40 shadow-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#172638]">
                <div className="text-sm font-bold text-[#35D5E8]">
                  {isArabic ? 'مفاتيح التحكم ومساعد الطيران' : 'FLIGHT SIMULATOR PILOT CONTROLS'}
                </div>
                <button onClick={() => setShowHelp(false)} className="text-[#92A4B8] hover:text-white">✕</button>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] flex justify-between">
                  <span className="text-[#92A4B8]" dir="ltr">W / S</span>
                  <span className="text-[#EDF4FA] font-bold">
                    {isArabic ? 'انحدار لأسفل / رفع المقدمة (Pitch)' : 'Pitch Down / Pitch Up'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] flex justify-between">
                  <span className="text-[#92A4B8]" dir="ltr">A / D</span>
                  <span className="text-[#EDF4FA] font-bold">
                    {isArabic ? 'دوران يسار / يمين (Roll / Banking)' : 'Roll Left / Roll Right (Banking)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] flex justify-between">
                  <span className="text-[#92A4B8]" dir="ltr">Q / E</span>
                  <span className="text-[#EDF4FA] font-bold">
                    {isArabic ? 'انعراج يسار / يمين (Yaw)' : 'Yaw Left / Yaw Right'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] flex justify-between">
                  <span className="text-[#92A4B8]">{isArabic ? 'شريط الخانق على الشاشة' : 'On-Screen Slider / Shift-Ctrl'}</span>
                  <span className="text-[#35D5E8] font-bold">
                    {isArabic ? 'قوة الدفع 0% إلى 100%' : 'Throttle 0% to 100%'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] flex justify-between">
                  <span className="text-[#92A4B8]">{isArabic ? 'مسافة (Space Bar)' : 'Space Bar'}</span>
                  <span className="text-[#EDF4FA] font-bold">
                    {isArabic ? 'إيقاف مؤقت / استئناف' : 'Pause / Resume Simulation'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] flex justify-between">
                  <span className="text-[#92A4B8]" dir="ltr">R Key</span>
                  <span className="text-[#FF5964] font-bold">
                    {isArabic ? 'إعادة ضبط الطائرة إلى المدرج' : 'Reset Flight to Runway'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-[#92A4B8] p-2.5 rounded bg-[#111E2D]/50 border border-[#172638]">
                {isArabic
                  ? 'التحول الديناميكي VTOL: تحت سرعة 40 كم/س توفر المراوح العمودية الأربعة قوة الرفع الرأسية. عند زيادة السرعة، يتولى الجناح الثابت توليد الرفع تلقائياً.'
                  : 'VTOL Transition: Under 40 km/h, quad-rotors provide vertical lift. At higher speeds, aerodynamic wing lift takes over automatically.'}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-1.5 rounded bg-[#35D5E8] text-[#080D16] font-bold hover:brightness-110 transition"
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
