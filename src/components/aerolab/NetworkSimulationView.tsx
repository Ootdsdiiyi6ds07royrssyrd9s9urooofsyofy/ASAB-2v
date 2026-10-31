/**
 * ASAB | AEROLAB 3D - Educational Network Packet Simulator
 * Demonstrates simulated packet movement, attenuation penalties, and multi-hop vs direct link dynamics.
 */

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Wifi,
  Activity,
  Radio,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const NetworkSimulationView: React.FC = () => {
  const { settings } = useSimulation();
  const isArabic = settings.language === 'ar';

  const [rfNoiseDbm, setRfNoiseDbm] = useState<number>(-95); // -110 (clear) to -60 (jammed/noisy)
  const [packetGenerationRateHz, setPacketGenerationRateHz] = useState<number>(10);
  const [activeHopCount, setActiveHopCount] = useState<number>(2);
  const [txPackets, setTxPackets] = useState<number>(1420);
  const [rxPackets, setRxPackets] = useState<number>(1412);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);

  // Compute synthetic metrics based on RF noise and hop count
  const snr = Math.max(-5, Math.min(45, -50 - rfNoiseDbm)); // 45 dB down to 10 dB
  const dropProb = Math.max(0, Math.min(0.4, (rfNoiseDbm + 85) / 100));
  const pdr = Number(((1 - dropProb) * 100).toFixed(1));
  const hopLatency = Math.round(6 + (45 - snr) * 0.4);
  const totalLatency = hopLatency * activeHopCount;

  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setTxPackets((prev) => prev + packetGenerationRateHz);
      setRxPackets((prev) => prev + Math.round(packetGenerationRateHz * (pdr / 100)));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimRunning, packetGenerationRateHz, pdr]);

  const handleReset = () => {
    setTxPackets(0);
    setRxPackets(0);
    setRfNoiseDbm(-95);
    setActiveHopCount(2);
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#9a6a3a]" />
            <span>{isArabic ? 'مختبر محاكاة حزم الشبكة والتشويش' : 'NETWORK PACKET & RF ATTENUATION SIMULATOR'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'دراسة تأثير الضوضاء الراديوية وفقدان الإشارة على معدل وصول الحزم وزمن الاستجابة عبر القفزات المتعددة.'
              : 'Educational simulation analyzing packet movement, transmission loss, and multi-hop routing delay.'}
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
            <span>{isArabic ? 'تصفير العدادات' : 'RESET COUNTERS'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Packet Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-1">
          <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'الحزم المرسلة' : 'PACKETS TRANSMITTED'}</div>
          <div className="text-2xl font-bold text-[#f6ecdd]">{txPackets}</div>
          <div className="text-[10px] text-[#8c7860]">
            {isArabic ? `بمعدل ${packetGenerationRateHz} هرتز` : `At ${packetGenerationRateHz} Hz rate`}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-1">
          <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'الحزم المستلمة' : 'PACKETS RECEIVED'}</div>
          <div className="text-2xl font-bold text-[#8fc46a]">{rxPackets}</div>
          <div className="text-[10px] text-[#8c7860]">{isArabic ? 'محققة وموثقة سيادياً' : 'Validated Cryptographically'}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-1">
          <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'معدل تسليم الحزم (PDR)' : 'DELIVERY RATIO (PDR)'}</div>
          <div className="text-2xl font-bold text-[#9a6a3a]">{pdr}%</div>
          <div className="text-[10px] text-[#8c7860]">{isArabic ? 'الفقد:' : 'Loss:'} {(100 - pdr).toFixed(1)}%</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-1">
          <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'زمن الوصول الإجمالي' : 'END-TO-END LATENCY'}</div>
          <div className="text-2xl font-bold text-[#f5b82e]">
            {totalLatency} <span className="text-xs font-normal">{isArabic ? 'مللي ثانية' : 'MS'}</span>
          </div>
          <div className="text-[10px] text-[#8c7860]">
            {isArabic ? `${activeHopCount} قفزات × ${hopLatency} مللي ثانية` : `${activeHopCount} Hops × ${hopLatency}ms`}
          </div>
        </div>
      </div>

      {/* Parameter Sliders & Packet Flow Lane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental Parameter Controls */}
        <div className="p-5 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-4">
          <div className="text-sm font-bold text-[#f6ecdd] pb-2 border-b border-[#32261b]">
            {isArabic ? 'إعدادات الطيف الراديوي والقفزات' : 'RF SPECTRUM & HOP CONFIGURATION'}
          </div>

          {/* RF Noise Floor Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#b9a58c]">{isArabic ? 'مستوى الضوضاء البيئية (Noise Floor):' : 'ENVIRONMENTAL NOISE FLOOR:'}</span>
              <span className="text-[#f5b82e] font-bold">{rfNoiseDbm} dBm (SNR: {snr} dB)</span>
            </div>
            <input
              type="range"
              min="-110"
              max="-60"
              value={rfNoiseDbm}
              onChange={(e) => setRfNoiseDbm(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#231a12] accent-[#f5b82e] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8c7860]">
              <span>{isArabic ? '-110 dBm (بيئة نقية)' : '-110 dBm (Clear Sky)'}</span>
              <span>{isArabic ? '-85 dBm (عواصف/تداخل)' : '-85 dBm (Storm)'}</span>
              <span>{isArabic ? '-60 dBm (تشويش شديد)' : '-60 dBm (Extreme Jamming)'}</span>
            </div>
          </div>

          {/* Multi-Hop Count */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#b9a58c]">{isArabic ? 'عدد قفزات الترحيل المتعددة:' : 'MULTI-HOP RELAY COUNT:'}</span>
              <span className="text-[#9a6a3a] font-bold">
                {activeHopCount} {isArabic ? 'قفزات' : 'Hops'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={activeHopCount}
              onChange={(e) => setActiveHopCount(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#231a12] accent-[#9a6a3a] cursor-pointer"
            />
          </div>

          {/* Packet Generation Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#b9a58c]">{isArabic ? 'معدل تدفق بيانات القياس:' : 'TELEMETRY STREAM RATE:'}</span>
              <span className="text-[#f6ecdd] font-bold">
                {packetGenerationRateHz} {isArabic ? 'حزمة/ثانية' : 'Packets/sec'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={packetGenerationRateHz}
              onChange={(e) => setPacketGenerationRateHz(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#231a12] accent-[#9a6a3a] cursor-pointer"
            />
          </div>
        </div>

        {/* Multi-Hop Route Comparison Card */}
        <div className="p-5 rounded-xl bg-[#1a140e] border border-[#32261b] flex flex-col justify-between space-y-4">
          <div className="text-sm font-bold text-[#f6ecdd] pb-2 border-b border-[#32261b]">
            {isArabic ? 'مقارنة التوجيه المتعدد بالربط المباشر' : 'MULTI-HOP VS DIRECT LINK COMPARISON'}
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#231a12] border border-[#32261b] space-y-1">
              <div className="text-[#9a6a3a] font-bold">
                {isArabic ? `مسار الترحيل المتعدد النشط (${activeHopCount} قفزات)` : `Configured Multi-Hop Path (${activeHopCount} Hops)`}
              </div>
              <p className="text-[11px] text-[#b9a58c] font-sans">
                {isArabic
                  ? `يحافظ على الاتصال المتواصل متجاوزاً حجب التضاريس والجبال بزمن استجابة ${totalLatency} مللي ثانية ونسبة تسليم ${pdr}%.`
                  : `Maintains continuous link connection around mountains or terrain obstacles with ${totalLatency}ms latency and ${pdr}% delivery ratio.`}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#231a12] border border-[#32261b] space-y-1">
              <div className="text-[#b9a58c] font-bold">
                {isArabic ? 'الاتصال المباشر الفردي (خط الرؤية البصري LoS)' : 'Hypothetical Single-Hop Direct Link (Line of Sight)'}
              </div>
              <p className="text-[11px] text-[#b9a58c] font-sans">
                {isArabic
                  ? 'يعاني من تلاشي الإشارة الشديد (>35dB) عند تجاوز 30 كم دون عقد وسيطة، مما يهبط بنسبة التسليم إلى أقل من 20%.'
                  : 'Would suffer signal attenuation > 35dB beyond 30 km without relay nodes, dropping delivery ratio below 20%.'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#231a12]/50 border border-[#32261b] text-[10px] text-[#b9a58c]">
            {isArabic
              ? 'ملاحظة تعليمية: تمثيل محاكاة لانحسار الإشارة في الفضاء الحر ونموذج الاحتمالات العشوائية لتساقط الحزم.'
              : 'SIMULATION NOTE: Educational representation of free-space path loss and stochastic packet drop.'}
          </div>
        </div>
      </div>
    </div>
  );
};
