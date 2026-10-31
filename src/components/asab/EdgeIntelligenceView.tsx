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
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#9a6a3a]" />
            <span>{isArabic ? 'الذكاء الحافي والضغط الدلالي للبيانات' : 'EDGE INTELLIGENCE & SEMANTIC COMPRESSION'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'معالجة البيانات محلياً على متن الطائرات، وتحويل القياسات التكتيكية إلى رموز دلالية عالية الكفاءة لتجاوز بيئات التشويش ونقص النطاق الترددي.'
              : 'Decentralized onboard inference, edge telemetry reduction, and semantic tokenization for sovereign low-bandwidth links.'}
          </p>
        </div>
      </div>

      {/* Distributed Computing Node Fleet Grid */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-[#f6ecdd] uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#b5793f]" />
          <span>{isArabic ? `أنوية المعالجة الحافية (${nodes.length} طائرات)` : `ONBOARD EDGE PROCESSING CORES (${nodes.length} AIRCRAFT)`}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="p-3.5 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#f6ecdd]">{node.id} • {node.callsign}</div>
                  <div className="text-[10px] text-[#9a6a3a]">{isArabic ? 'معالج ARM + وحدة NPU بقوة 32 TOPS' : 'ARM Cortex + 32 TOPS NPU'}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8fc46a]/20 text-[#8fc46a]">
                  {isArabic ? 'متصل' : 'ONLINE'}
                </span>
              </div>

              {/* CPU Load Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#b9a58c]">
                  <span>{isArabic ? 'حمل المعالج' : 'CPU / NPU Workload'}</span>
                  <span className="text-[#f6ecdd] font-bold">{node.telemetry.cpuLoadPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#231a12] overflow-hidden">
                  <div
                    className="h-full bg-[#9a6a3a]"
                    style={{ width: `${node.telemetry.cpuLoadPercent}%` }}
                  />
                </div>
              </div>

              {/* Edge Tasks */}
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#32261b] text-[#b9a58c]">
                <span>{isArabic ? 'المهام النشطة' : 'Active Tasks'}: <span className="text-[#f6ecdd]">{isArabic ? 'تحويل دلالي' : 'Semantic Vectorization'}</span></span>
                <span>{isArabic ? 'الحرارة' : 'Temp'}: <span className="text-[#f5b82e]">{node.telemetry.temperatureC}°C</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Semantic Compression Demonstration */}
      <div className="p-6 rounded-2xl bg-[#1a140e] border border-[#9a6a3a]/30 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#9a6a3a]/20 text-[#9a6a3a] text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>عرض تفاعلي توضيحي</span>
            </div>
            <h2 className="text-base font-bold text-[#f6ecdd] mt-1 font-sans">
              {isArabic ? 'محرك الضغط الدلالي السيادي المستقل' : 'Autonomous Sovereign Semantic Compression Engine'}
            </h2>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#120e0a] border border-[#32261b]">
            <button
              onClick={() => setCompressionLevel(1)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                compressionLevel === 1 ? 'bg-[#231a12] text-[#9a6a3a] font-bold border border-[#9a6a3a]/40' : 'text-[#b9a58c]'
              }`}
            >
              {isArabic ? 'المستوى 1: إزالة التكرار' : 'Level 1: Deduplication'}
            </button>
            <button
              onClick={() => setCompressionLevel(2)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                compressionLevel === 2 ? 'bg-[#231a12] text-[#9a6a3a] font-bold border border-[#9a6a3a]/40' : 'text-[#b9a58c]'
              }`}
            >
              {isArabic ? 'المستوى 2: فرق المتجهات' : 'Level 2: Vector Delta'}
            </button>
            <button
              onClick={() => setCompressionLevel(3)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                compressionLevel === 3 ? 'bg-[#9a6a3a] text-[#120e0a] font-bold' : 'text-[#b9a58c]'
              }`}
            >
              {isArabic ? 'المستوى 3: ترميز سيادي' : 'Level 3: Sovereign Tokenization'}
            </button>
          </div>
        </div>

        {/* Compression Statistics Comparison Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#231a12] border border-[#32261b]">
          <div>
            <div className="text-[10px] text-[#b9a58c]">الحمولة الأصلية</div>
            <div className="text-xl font-bold text-[#f6ecdd]">{compressionMetrics.rawPayloadSizeBytes} <span className="text-xs font-normal">{isArabic ? 'بايت' : 'Bytes'}</span></div>
          </div>
          <div>
            <div className="text-[10px] text-[#b9a58c]">الحمولة المضغوطة</div>
            <div className="text-xl font-bold text-[#9a6a3a]">{compressionMetrics.compressedSizeBytes} <span className="text-xs font-normal">{isArabic ? 'بايت' : 'Bytes'}</span></div>
          </div>
          <div>
            <div className="text-[10px] text-[#b9a58c]">تقليص البيانات</div>
            <div className="text-xl font-bold text-[#8fc46a]">-{compressionMetrics.reductionPercent}%</div>
          </div>
          <div>
            <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'الوقت الموفر للإرسال' : 'TX TIME SAVED (10Kbps)'}</div>
            <div className="text-xl font-bold text-[#f5b82e]">-{compressionMetrics.timeSavedPercent}%</div>
          </div>
        </div>

        {/* Side-by-Side Payload Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Raw JSON */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#b9a58c]">
              <span>{isArabic ? 'القياسات الخام (غير مضغوطة)' : 'RAW SENSOR TELEMETRY (UNCOMPRESSED)'}</span>
              <span>1,024 BYTES</span>
            </div>
            <pre dir="ltr" className="p-3.5 rounded-lg bg-[#120e0a] border border-[#32261b] text-[11px] text-[#f6ecdd] font-mono overflow-x-auto max-h-56 leading-relaxed text-left">
              {sampleRawJson}
            </pre>
          </div>

          {/* Compressed Tokenized Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#9a6a3a]">
              <span>إرسال مشفّر دلاليًا</span>
              <span className="font-bold">{compressionMetrics.compressedSizeBytes} BYTES</span>
            </div>
            <div dir="ltr" className="p-3.5 rounded-lg bg-[#120e0a] border border-[#9a6a3a]/40 text-[11px] text-[#9a6a3a] font-mono overflow-x-auto min-h-[14rem] flex flex-col justify-between text-left">
              <div>{sampleCompressed}</div>
              <div className="pt-3 border-t border-[#32261b] text-[10px] text-[#b9a58c] space-y-1">
                <div>{isArabic ? 'زمن المعالجة الحافية' : 'Edge Processing Time'}: <span className="text-[#f6ecdd]">{compressionMetrics.processingTimeMs} ms</span></div>
                <div>{isArabic ? 'الحالة' : 'Status'}: <span className="text-[#8fc46a]">{isArabic ? 'تم التحقق من القواعد الدلالية السيادية' : 'Sovereign Semantic Grammar Verified'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
