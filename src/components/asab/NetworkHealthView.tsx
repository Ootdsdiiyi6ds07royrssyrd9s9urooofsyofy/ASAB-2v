/**
 * ASAB | AEROLAB 3D - Network Health Center
 * Displays real-time health metrics, packet delivery ratio, latency history, and SNR matrix.
 */

import React from 'react';
import {
  Activity,
  Wifi,
  Shield,
  Clock,
  Radio,
  TrendingUp,
  BarChart2,
  AlertCircle,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const NetworkHealthView: React.FC = () => {
  const { nodes, links, metrics, events, settings } = useSimulation();
  const isArabic = settings.language === 'ar';

  const networkEvents = events.filter((e) => e.category === 'Network');

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#8fc46a]" />
            <span>{isArabic ? 'مركز صحة وجودة الشبكة الجوية' : 'NETWORK HEALTH & QOS CENTER'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'مراقبة حية لمعدل تسليم الحزم، زمن الاستجابة، ونسبة الإشارة إلى الضوضاء عبر الشبكة اللامركزية.'
              : 'Real-time telemetry on packet delivery ratio, latency, jitter, SNR, and multi-hop channel stability.'}
          </p>
        </div>

        {/* Global Health Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#231a12] border border-[#32261b]">
          <span className="text-[#b9a58c]">SYSTEM STATE:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              metrics.overallHealthState === 'Healthy'
                ? 'bg-[#8fc46a]/20 text-[#8fc46a] border border-[#8fc46a]/40'
                : metrics.overallHealthState === 'Degraded'
                ? 'bg-[#f5b82e]/20 text-[#f5b82e] border border-[#f5b82e]/40'
                : 'bg-[#e8584a]/20 text-[#e8584a] border border-[#e8584a]/40'
            }`}
          >
            {metrics.overallHealthState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 4 Health Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Availability */}
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex justify-between text-[#b9a58c]">
            <span>توفر الشبكة</span>
            <Shield className="w-4 h-4 text-[#8fc46a]" />
          </div>
          <div className="text-3xl font-bold text-[#8fc46a]">{metrics.networkHealthPercent}%</div>
          <div className="w-full h-2 rounded-full bg-[#231a12] overflow-hidden">
            <div
              className="h-full bg-[#8fc46a] transition-all duration-300"
              style={{ width: `${metrics.networkHealthPercent}%` }}
            />
          </div>
        </div>

        {/* Packet Delivery Ratio */}
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex justify-between text-[#b9a58c]">
            <span>نسبة تسليم الحزم</span>
            <Activity className="w-4 h-4 text-[#9a6a3a]" />
          </div>
          <div className="text-3xl font-bold text-[#9a6a3a]">{metrics.packetDeliveryRatio}%</div>
          <div className="w-full h-2 rounded-full bg-[#231a12] overflow-hidden">
            <div
              className="h-full bg-[#9a6a3a] transition-all duration-300"
              style={{ width: `${metrics.packetDeliveryRatio}%` }}
            />
          </div>
        </div>

        {/* Latency */}
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex justify-between text-[#b9a58c]">
            <span>متوسط زمن الاستجابة</span>
            <Clock className="w-4 h-4 text-[#f5b82e]" />
          </div>
          <div className="text-3xl font-bold text-[#f5b82e]">{metrics.averageLatencyMs} <span className="text-xs font-normal text-[#b9a58c]">MS</span></div>
          <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'متوسط زمن القفزات من طرف إلى طرف' : 'End-to-End Hop Average'}</div>
        </div>

        {/* Total Throughput */}
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex justify-between text-[#b9a58c]">
            <span>معدل نقل الشبكة</span>
            <TrendingUp className="w-4 h-4 text-[#b5793f]" />
          </div>
          <div className="text-3xl font-bold text-[#b5793f]">{metrics.totalThroughputMbps} <span className="text-xs font-normal text-[#b9a58c]">MBPS</span></div>
          <div className="text-[10px] text-[#b9a58c]">{isArabic ? `عبر ${metrics.activeLinksCount} روابط نشطة` : `Across ${metrics.activeLinksCount} active links`}</div>
        </div>
      </div>

      {/* Latency & Quality SVG Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Synthetic Quality Distribution Curve */}
        <div className="p-5 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-4">
          <div className="text-sm font-bold text-[#f6ecdd] flex items-center justify-between">
            <span>توزيع جودة الروابط</span>
            <span className="text-[#9a6a3a]">{links.length} {isArabic ? 'قنوات نشطة' : 'Active Channels'}</span>
          </div>

          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#f6ecdd]">{link.id}</span>
                  <span className="text-[#9a6a3a] font-bold">{link.quality}% ({link.bandwidthMbps} Mbps)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#231a12] overflow-hidden">
                  <div
                    className={`h-full ${
                      link.quality > 65
                        ? 'bg-[#8fc46a]'
                        : link.quality > 30
                        ? 'bg-[#f5b82e]'
                        : 'bg-[#e8584a]'
                    }`}
                    style={{ width: `${link.quality}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Event & Degradation History */}
        <div className="p-5 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-4">
          <div className="text-sm font-bold text-[#f6ecdd] flex items-center justify-between">
            <span>{isArabic ? 'أحداث الشبكة وسجل الاستقرار' : 'NETWORK EVENTS & STABILITY LOG'}</span>
            <span className="text-[10px] text-[#b9a58c]">بث مباشر</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {networkEvents.length === 0 ? (
              <div className="text-[#8c7860] p-4 text-center">{isArabic ? 'لا توجد أحداث تدهور مسجلة.' : 'No degradation events logged.'}</div>
            ) : (
              networkEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] space-y-1"
                >
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#9a6a3a] font-bold">{evt.title}</span>
                    <span className="text-[#8c7860]">{evt.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#b9a58c] font-sans">{evt.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
