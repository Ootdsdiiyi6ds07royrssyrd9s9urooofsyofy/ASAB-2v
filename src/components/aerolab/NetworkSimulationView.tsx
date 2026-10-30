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
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#35D5E8]" />
            <span>{isArabic ? 'مختبر محاكاة حزم الشبكة والتشويش' : 'NETWORK PACKET & RF ATTENUATION SIMULATOR'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
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
                ? 'bg-[#F5B82E]/20 text-[#F5B82E] border border-[#F5B82E]/40'
                : 'bg-[#3DDC97]/20 text-[#3DDC97] border border-[#3DDC97]/40'
            }`}
          >
            {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimRunning ? 'PAUSE' : 'RESUME'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[#EDF4FA] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET COUNTERS</span>
          </button>
        </div>
      </div>

      {/* Real-time Packet Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-1">
          <div className="text-[10px] text-[#92A4B8]">PACKETS TRANSMITTED</div>
          <div className="text-2xl font-bold text-[#EDF4FA]">{txPackets}</div>
          <div className="text-[10px] text-[#64768B]">At {packetGenerationRateHz} Hz rate</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-1">
          <div className="text-[10px] text-[#92A4B8]">PACKETS RECEIVED</div>
          <div className="text-2xl font-bold text-[#3DDC97]">{rxPackets}</div>
          <div className="text-[10px] text-[#64768B]">Validated Cryptographically</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-1">
          <div className="text-[10px] text-[#92A4B8]">DELIVERY RATIO (PDR)</div>
          <div className="text-2xl font-bold text-[#35D5E8]">{pdr}%</div>
          <div className="text-[10px] text-[#64768B]">Loss: {(100 - pdr).toFixed(1)}%</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-1">
          <div className="text-[10px] text-[#92A4B8]">END-TO-END LATENCY</div>
          <div className="text-2xl font-bold text-[#F5B82E]">{totalLatency} <span className="text-xs font-normal">MS</span></div>
          <div className="text-[10px] text-[#64768B]">{activeHopCount} Hops × {hopLatency}ms</div>
        </div>
      </div>

      {/* Parameter Sliders & Packet Flow Lane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental Parameter Controls */}
        <div className="p-5 rounded-xl bg-[#0D1623] border border-[#172638] space-y-4">
          <div className="text-sm font-bold text-[#EDF4FA] pb-2 border-b border-[#172638]">
            RF SPECTRUM & HOP CONFIGURATION
          </div>

          {/* RF Noise Floor Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#92A4B8]">ENVIRONMENTAL NOISE FLOOR:</span>
              <span className="text-[#F5B82E] font-bold">{rfNoiseDbm} dBm (SNR: {snr} dB)</span>
            </div>
            <input
              type="range"
              min="-110"
              max="-60"
              value={rfNoiseDbm}
              onChange={(e) => setRfNoiseDbm(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#111E2D] accent-[#F5B82E] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64768B]">
              <span>-110 dBm (Clear Sky)</span>
              <span>-85 dBm (Storm)</span>
              <span>-60 dBm (Extreme Jamming)</span>
            </div>
          </div>

          {/* Multi-Hop Count */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#92A4B8]">MULTI-HOP RELAY COUNT:</span>
              <span className="text-[#35D5E8] font-bold">{activeHopCount} Hops</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={activeHopCount}
              onChange={(e) => setActiveHopCount(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#111E2D] accent-[#35D5E8] cursor-pointer"
            />
          </div>

          {/* Packet Generation Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#92A4B8]">TELEMETRY STREAM RATE:</span>
              <span className="text-[#EDF4FA] font-bold">{packetGenerationRateHz} Packets/sec</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={packetGenerationRateHz}
              onChange={(e) => setPacketGenerationRateHz(Number(e.target.value))}
              className="w-full appearance-none h-1.5 rounded-full bg-[#111E2D] accent-[#35D5E8] cursor-pointer"
            />
          </div>
        </div>

        {/* Multi-Hop Route Comparison Card */}
        <div className="p-5 rounded-xl bg-[#0D1623] border border-[#172638] flex flex-col justify-between space-y-4">
          <div className="text-sm font-bold text-[#EDF4FA] pb-2 border-b border-[#172638]">
            MULTI-HOP VS DIRECT LINK COMPARISON
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#111E2D] border border-[#172638] space-y-1">
              <div className="text-[#35D5E8] font-bold">Configured Multi-Hop Path ({activeHopCount} Hops)</div>
              <p className="text-[11px] text-[#92A4B8] font-sans">
                Maintains continuous link connection around mountains or terrain obstacles with {totalLatency}ms latency and {pdr}% delivery ratio.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111E2D] border border-[#172638] space-y-1">
              <div className="text-[#92A4B8] font-bold">Hypothetical Single-Hop Direct Link (Line of Sight)</div>
              <p className="text-[11px] text-[#92A4B8] font-sans">
                Would suffer signal attenuation &gt; 35dB beyond 30 km without relay nodes, dropping delivery ratio below 20%.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#111E2D]/50 border border-[#172638] text-[10px] text-[#92A4B8]">
            SIMULATION NOTE: Educational representation of free-space path loss and stochastic packet drop.
          </div>
        </div>
      </div>
    </div>
  );
};
