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
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3DDC97]" />
            <span>{isArabic ? 'مركز صحة وجودة الشبكة الجوية' : 'NETWORK HEALTH & QOS CENTER'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
            {isArabic
              ? 'مراقبة حية لمعدل تسليم الحزم، زمن الاستجابة، ونسبة الإشارة إلى الضوضاء عبر الشبكة اللامركزية.'
              : 'Real-time telemetry on packet delivery ratio, latency, jitter, SNR, and multi-hop channel stability.'}
          </p>
        </div>

        {/* Global Health Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111E2D] border border-[#172638]">
          <span className="text-[#92A4B8]">SYSTEM STATE:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              metrics.overallHealthState === 'Healthy'
                ? 'bg-[#3DDC97]/20 text-[#3DDC97] border border-[#3DDC97]/40'
                : metrics.overallHealthState === 'Degraded'
                ? 'bg-[#F5B82E]/20 text-[#F5B82E] border border-[#F5B82E]/40'
                : 'bg-[#FF5964]/20 text-[#FF5964] border border-[#FF5964]/40'
            }`}
          >
            {metrics.overallHealthState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 4 Health Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Availability */}
        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex justify-between text-[#92A4B8]">
            <span>NETWORK AVAILABILITY</span>
            <Shield className="w-4 h-4 text-[#3DDC97]" />
          </div>
          <div className="text-3xl font-bold text-[#3DDC97]">{metrics.networkHealthPercent}%</div>
          <div className="w-full h-2 rounded-full bg-[#111E2D] overflow-hidden">
            <div
              className="h-full bg-[#3DDC97] transition-all duration-300"
              style={{ width: `${metrics.networkHealthPercent}%` }}
            />
          </div>
        </div>

        {/* Packet Delivery Ratio */}
        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex justify-between text-[#92A4B8]">
            <span>PACKET DELIVERY RATIO</span>
            <Activity className="w-4 h-4 text-[#35D5E8]" />
          </div>
          <div className="text-3xl font-bold text-[#35D5E8]">{metrics.packetDeliveryRatio}%</div>
          <div className="w-full h-2 rounded-full bg-[#111E2D] overflow-hidden">
            <div
              className="h-full bg-[#35D5E8] transition-all duration-300"
              style={{ width: `${metrics.packetDeliveryRatio}%` }}
            />
          </div>
        </div>

        {/* Latency */}
        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex justify-between text-[#92A4B8]">
            <span>AVERAGE LATENCY</span>
            <Clock className="w-4 h-4 text-[#F5B82E]" />
          </div>
          <div className="text-3xl font-bold text-[#F5B82E]">{metrics.averageLatencyMs} <span className="text-xs font-normal text-[#92A4B8]">MS</span></div>
          <div className="text-[10px] text-[#92A4B8]">End-to-End Hop Average</div>
        </div>

        {/* Total Throughput */}
        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex justify-between text-[#92A4B8]">
            <span>MESH THROUGHPUT</span>
            <TrendingUp className="w-4 h-4 text-[#5587FF]" />
          </div>
          <div className="text-3xl font-bold text-[#5587FF]">{metrics.totalThroughputMbps} <span className="text-xs font-normal text-[#92A4B8]">MBPS</span></div>
          <div className="text-[10px] text-[#92A4B8]">Across {metrics.activeLinksCount} active links</div>
        </div>
      </div>

      {/* Latency & Quality SVG Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Synthetic Quality Distribution Curve */}
        <div className="p-5 rounded-xl bg-[#0D1623] border border-[#172638] space-y-4">
          <div className="text-sm font-bold text-[#EDF4FA] flex items-center justify-between">
            <span>LINK QUALITY DISTRIBUTION</span>
            <span className="text-[#35D5E8]">{links.length} Active Channels</span>
          </div>

          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#EDF4FA]">{link.id}</span>
                  <span className="text-[#35D5E8] font-bold">{link.quality}% ({link.bandwidthMbps} Mbps)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#111E2D] overflow-hidden">
                  <div
                    className={`h-full ${
                      link.quality > 65
                        ? 'bg-[#3DDC97]'
                        : link.quality > 30
                        ? 'bg-[#F5B82E]'
                        : 'bg-[#FF5964]'
                    }`}
                    style={{ width: `${link.quality}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Event & Degradation History */}
        <div className="p-5 rounded-xl bg-[#0D1623] border border-[#172638] space-y-4">
          <div className="text-sm font-bold text-[#EDF4FA] flex items-center justify-between">
            <span>NETWORK EVENTS & STABILITY LOG</span>
            <span className="text-[10px] text-[#92A4B8]">LIVE STREAM</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {networkEvents.length === 0 ? (
              <div className="text-[#64768B] p-4 text-center">No degradation events logged.</div>
            ) : (
              networkEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] space-y-1"
                >
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#35D5E8] font-bold">{evt.title}</span>
                    <span className="text-[#64768B]">{evt.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#92A4B8] font-sans">{evt.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
