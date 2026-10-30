/**
 * ASAB | AEROLAB 3D - Edge Intelligence & Semantic Compression
 * Distributed computing node status and interactive semantic compression demonstration.
 */

import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Radio,
  FileCode,
  ArrowRight,
  TrendingDown,
  Layers,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { calculateSemanticCompression } from '../../utils/rules';

export const EdgeIntelligenceView: React.FC = () => {
  const { nodes, settings } = useSimulation();
  const [compressionLevel, setCompressionLevel] = useState<number>(3); // 1, 2, 3
  const [rawPayloadSize, setRawPayloadSize] = useState<number>(1024); // bytes

  const isArabic = settings.language === 'ar';
  const compressionMetrics = calculateSemanticCompression(rawPayloadSize, compressionLevel);

  // Sample raw synthetic telemetry JSON
  const sampleRawJson = `{
  "timestamp": "2026-10-30T10:14:22.402Z",
  "aircraft_id": "NODE-01",
  "position": { "lat": 24.7136, "lon": 46.6753, "alt_m": 1824.5 },
  "velocity": { "vx": 32.4, "vy": 0.2, "vz": 28.1 },
  "attitude": { "roll": -1.2, "pitch": 2.4, "yaw": 52.0 },
  "imu": { "ax": 0.02, "ay": -0.04, "az": 9.81, "p": 0.01, "q": 0.02, "r": -0.01 },
  "battery": { "voltage_v": 49.8, "current_a": 18.4, "soc_pct": 86.4, "temp_c": 37.1 },
  "sensors": { "radar_tracks": 4, "optics_target_locked": false, "jamming_detected": false },
  "crypto_sig": "3045022100e4b8...sovereign_ecc_signature"
}`;

  // Sample semantic compressed tokenized payload
  const sampleCompressed =
    compressionLevel === 1
      ? `[ASAB-DEDUP:ID01|T422|POS:24.71,46.67,1824|VEL:32,28|ATT:52,2|BAT:86|TRK:4]`
      : compressionLevel === 2
      ? `0xASAB7F:01:2E71:4B67:0720:201C:0034:56:04:E4B8`
      : `«SOV-SEMANTIC-TOKEN: ALPHA-01 | ENROUTE WAYPOINT 3 | NOMINAL | CLEAR CORRIDOR»`;

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#35D5E8]" />
            <span>{isArabic ? 'الذكاء الحافي والضغط الدلالي للبيانات' : 'EDGE INTELLIGENCE & SEMANTIC COMPRESSION'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
            {isArabic
              ? 'معالجة البيانات محلياً على متن الطائرات، وتحويل القياسات التكتيكية إلى رموز دلالية عالية الكفاءة لتجاوز بيئات التشويش ونقص النطاق الترددي.'
              : 'Decentralized onboard inference, edge telemetry reduction, and semantic tokenization for sovereign low-bandwidth links.'}
          </p>
        </div>
      </div>

      {/* Distributed Computing Node Fleet Grid */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-[#EDF4FA] uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#5587FF]" />
          <span>ONBOARD EDGE PROCESSING CORES ({nodes.length} AIRCRAFT)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="p-3.5 rounded-xl bg-[#0D1623] border border-[#172638] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#EDF4FA]">{node.id} • {node.callsign}</div>
                  <div className="text-[10px] text-[#35D5E8]">ARM Cortex + 32 TOPS NPU</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DDC97]/20 text-[#3DDC97]">
                  ONLINE
                </span>
              </div>

              {/* CPU Load Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#92A4B8]">
                  <span>CPU / NPU Workload</span>
                  <span className="text-[#EDF4FA] font-bold">{node.telemetry.cpuLoadPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#111E2D] overflow-hidden">
                  <div
                    className="h-full bg-[#35D5E8]"
                    style={{ width: `${node.telemetry.cpuLoadPercent}%` }}
                  />
                </div>
              </div>

              {/* Edge Tasks */}
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#172638] text-[#92A4B8]">
                <span>Active Tasks: <span className="text-[#EDF4FA]">Semantic Vectorization</span></span>
                <span>Temp: <span className="text-[#F5B82E]">{node.telemetry.temperatureC}°C</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Semantic Compression Demonstration */}
      <div className="p-6 rounded-2xl bg-[#0D1623] border border-[#35D5E8]/30 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#35D5E8]/20 text-[#35D5E8] text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>INTERACTIVE CONCEPTUAL DEMONSTRATION</span>
            </div>
            <h2 className="text-base font-bold text-[#EDF4FA] mt-1 font-sans">
              Autonomous Sovereign Semantic Compression Engine
            </h2>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080D16] border border-[#172638]">
            <button
              onClick={() => setCompressionLevel(1)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                compressionLevel === 1 ? 'bg-[#111E2D] text-[#35D5E8] font-bold border border-[#35D5E8]/40' : 'text-[#92A4B8]'
              }`}
            >
              Level 1: Deduplication
            </button>
            <button
              onClick={() => setCompressionLevel(2)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                compressionLevel === 2 ? 'bg-[#111E2D] text-[#35D5E8] font-bold border border-[#35D5E8]/40' : 'text-[#92A4B8]'
              }`}
            >
              Level 2: Vector Delta
            </button>
            <button
              onClick={() => setCompressionLevel(3)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                compressionLevel === 3 ? 'bg-[#35D5E8] text-[#080D16] font-bold' : 'text-[#92A4B8]'
              }`}
            >
              Level 3: Sovereign Tokenization
            </button>
          </div>
        </div>

        {/* Compression Statistics Comparison Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#111E2D] border border-[#172638]">
          <div>
            <div className="text-[10px] text-[#92A4B8]">ORIGINAL PAYLOAD</div>
            <div className="text-xl font-bold text-[#EDF4FA]">{compressionMetrics.rawPayloadSizeBytes} <span className="text-xs font-normal">Bytes</span></div>
          </div>
          <div>
            <div className="text-[10px] text-[#92A4B8]">COMPRESSED PAYLOAD</div>
            <div className="text-xl font-bold text-[#35D5E8]">{compressionMetrics.compressedSizeBytes} <span className="text-xs font-normal">Bytes</span></div>
          </div>
          <div>
            <div className="text-[10px] text-[#92A4B8]">DATA REDUCTION</div>
            <div className="text-xl font-bold text-[#3DDC97]">-{compressionMetrics.reductionPercent}%</div>
          </div>
          <div>
            <div className="text-[10px] text-[#92A4B8]">TX TIME SAVED (10Kbps)</div>
            <div className="text-xl font-bold text-[#F5B82E]">-{compressionMetrics.timeSavedPercent}%</div>
          </div>
        </div>

        {/* Side-by-Side Payload Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Raw JSON */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#92A4B8]">
              <span>RAW SENSOR TELEMETRY (UNCOMPRESSED)</span>
              <span>1,024 BYTES</span>
            </div>
            <pre dir="ltr" className="p-3.5 rounded-lg bg-[#080D16] border border-[#172638] text-[11px] text-[#EDF4FA] font-mono overflow-x-auto max-h-56 leading-relaxed text-left">
              {sampleRawJson}
            </pre>
          </div>

          {/* Compressed Tokenized Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#35D5E8]">
              <span>SEMANTICALLY ENCODED TRANSMISSION</span>
              <span className="font-bold">{compressionMetrics.compressedSizeBytes} BYTES</span>
            </div>
            <div dir="ltr" className="p-3.5 rounded-lg bg-[#080D16] border border-[#35D5E8]/40 text-[11px] text-[#35D5E8] font-mono overflow-x-auto min-h-[14rem] flex flex-col justify-between text-left">
              <div>{sampleCompressed}</div>
              <div className="pt-3 border-t border-[#172638] text-[10px] text-[#92A4B8] space-y-1">
                <div>Edge Processing Time: <span className="text-[#EDF4FA]">{compressionMetrics.processingTimeMs} ms</span></div>
                <div>Status: <span className="text-[#3DDC97]">Sovereign Semantic Grammar Verified</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
