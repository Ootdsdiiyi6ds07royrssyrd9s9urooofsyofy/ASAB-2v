/**
 * ASAB | AEROLAB 3D - Operational Overview
 * High-level executive summary of sovereign fleet readiness, network mesh integrity, and quick launches.
 */

import React from 'react';
import {
  Compass,
  Radio,
  Wifi,
  Shield,
  Activity,
  Box,
  Cpu,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const OverviewView: React.FC = () => {
  const { nodes, links, metrics, navigateToModule, settings } = useSimulation();
  const isArabic = settings.language === 'ar';

  const activeCount = nodes.filter((n) => n.status === 'Active').length;
  const standbyCount = nodes.filter((n) => n.status === 'Standby').length;
  const disconnectedCount = nodes.filter((n) => n.status === 'Disconnected').length;

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Hero Operational Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1a140e] via-[#231a12] to-[#32261b] border border-[#32261b] relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#9a6a3a]/10 text-[#9a6a3a] border border-[#9a6a3a]/30 text-[10px] font-bold">
            <Radio className="w-3 h-3" />
            <span>التوأم الرقمي للشبكة الجوية السيادية</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#f6ecdd] font-sans">
            {isArabic
              ? 'عَصَب | منظومة القيادة والتحكم الجوية السيادية'
              : 'ASAB | Sovereign Airborne Command & Simulation'}
          </h1>
          <p className="text-sm text-[#b9a58c] font-sans leading-relaxed">
            {isArabic
              ? 'بيئة متكاملة لمحاكاة الشبكات الجوية اللامركزية، وإدارة أسراب طائرات الإقلاع والهبوط العمودي (VTOL)، مع استوديو الهندسة ثلاثي الأبعاد AEROLAB 3D.'
              : 'Decentralized airborne mesh communications architecture with real-time digital twin flight telemetry, 3D VTOL aircraft engineering studio, and resilience testing.'}
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            <button
              onClick={() => navigateToModule('command-center', 'asab')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold transition-colors"
            >
              <span>{isArabic ? 'فتح مركز العمليات' : 'LAUNCH COMMAND CENTER'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToModule('aircraft-studio', 'aerolab')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#231a12] hover:bg-[#32261b] text-[#f6ecdd] border border-[#32261b] transition-colors"
            >
              <Box className="w-4 h-4 text-[#b5793f]" />
              <span>{isArabic ? 'استوديو الطائرات ثلاثي الأبعاد' : 'OPEN AEROLAB 3D'}</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid and watermark */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-[120px] font-bold text-[#9a6a3a] pointer-events-none font-arabic">
          عَصَب
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex items-center justify-between text-[#b9a58c]">
            <span>إجمالي العقد الجوية</span>
            <Radio className="w-4 h-4 text-[#9a6a3a]" />
          </div>
          <div className="text-3xl font-bold text-[#f6ecdd]">{nodes.length}</div>
          <div className="text-[11px] text-[#8fc46a]">
            {isArabic ? `${activeCount} نشطة • ${standbyCount} استعداد • ${disconnectedCount} منقطعة` : `${activeCount} Active • ${standbyCount} Standby • ${disconnectedCount} Down`}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex items-center justify-between text-[#b9a58c]">
            <span>روابط الشبكة النشطة</span>
            <Wifi className="w-4 h-4 text-[#b5793f]" />
          </div>
          <div className="text-3xl font-bold text-[#9a6a3a]">{metrics.activeLinksCount}</div>
          <div className="text-[11px] text-[#b9a58c]">
            {isArabic ? `طوبولوجيا متعددة القفزات • النطاق: ${metrics.totalThroughputMbps} ميجابت/ث` : `Multi-hop topology active • Bandwidth: ${metrics.totalThroughputMbps} Mbps`}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex items-center justify-between text-[#b9a58c]">
            <span>مؤشر صحة الشبكة</span>
            <Shield className="w-4 h-4 text-[#8fc46a]" />
          </div>
          <div className="text-3xl font-bold text-[#8fc46a]">{metrics.networkHealthPercent}%</div>
          <div className="text-[11px] text-[#f6ecdd]">
            {isArabic ? 'الحالة' : 'State'}: <span className="font-bold text-[#8fc46a]">{isArabic ? 'مستقرة' : metrics.overallHealthState}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex items-center justify-between text-[#b9a58c]">
            <span>نسبة تسليم الحزم</span>
            <Activity className="w-4 h-4 text-[#f5b82e]" />
          </div>
          <div className="text-3xl font-bold text-[#f5b82e]">{metrics.packetDeliveryRatio}%</div>
          <div className="text-[11px] text-[#b9a58c]">
            {isArabic ? 'متوسط الاستجابة' : 'Avg Latency'}: {metrics.averageLatencyMs} ms
          </div>
        </div>
      </div>

      {/* Two-Column Core Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Readiness Roster */}
        <div className="p-5 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#32261b]">
            <div className="text-sm font-bold text-[#f6ecdd] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#9a6a3a]" />
              <span>انتشار الأسطول النشط</span>
            </div>
            <button
              onClick={() => navigateToModule('airborne-fleet')}
              className="text-[#9a6a3a] hover:underline text-xs flex items-center gap-1"
            >
              <span>{isArabic ? 'عرض الأسطول' : 'View Roster'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {nodes.slice(0, 5).map((node) => (
              <div
                key={node.id}
                className="p-3 rounded-lg bg-[#231a12] border border-[#32261b] flex items-center justify-between hover:border-[#9a6a3a]/40 transition-colors cursor-pointer"
                onClick={() => navigateToModule('command-center')}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      node.status === 'Active'
                        ? 'bg-[#8fc46a]'
                        : node.status === 'Standby'
                        ? 'bg-[#f5b82e]'
                        : 'bg-[#e8584a]'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-[#f6ecdd]">{node.id} • {node.callsign}</div>
                    <div className="text-[11px] text-[#8c7860]">{node.type} • {node.role}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[#9a6a3a] font-bold">{node.telemetry.altitude} m</div>
                  <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'بطارية' : 'Bat'}: {node.telemetry.batteryPercent}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engineering Studio & Simulation Highlights */}
        <div className="p-5 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#32261b]">
            <div className="text-sm font-bold text-[#f6ecdd] flex items-center gap-2">
              <Box className="w-4 h-4 text-[#b5793f]" />
              <span>{isArabic ? 'منظومة أيرولاب الهندسية ثلاثية الأبعاد' : 'AEROLAB 3D ENGINEERING SUITE'}</span>
            </div>
            <button
              onClick={() => navigateToModule('aircraft-studio')}
              className="text-[#b5793f] hover:underline text-xs flex items-center gap-1"
            >
              <span>{isArabic ? 'فتح الاستوديو' : 'Open Studio'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => navigateToModule('aircraft-studio')}
              className="p-3.5 rounded-lg bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="text-[#9a6a3a] font-bold">فحص الطائرة ثلاثي الأبعاد</div>
              <p className="text-[11px] text-[#b9a58c] font-sans">
                Full exploded CAD view with 14+ components, mass properties, and orbit cameras.
              </p>
            </div>

            <div
              onClick={() => navigateToModule('flight-simulation')}
              className="p-3.5 rounded-lg bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="text-[#8fc46a] font-bold">محاكي الطيران بست درجات حرية</div>
              <p className="text-[11px] text-[#b9a58c] font-sans">
                Interactive keyboard and HUD flight dynamics with VTOL transition modes.
              </p>
            </div>

            <div
              onClick={() => navigateToModule('dynamics')}
              className="p-3.5 rounded-lg bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="text-[#f5b82e] font-bold">Aerodynamic Forces</div>
              <p className="text-[11px] text-[#b9a58c] font-sans">
                Real-time lift, drag, pitch moment, and wind shear analysis.
              </p>
            </div>

            <div
              onClick={() => navigateToModule('edge-intelligence')}
              className="p-3.5 rounded-lg bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="text-[#b5793f] font-bold">Semantic Compression</div>
              <p className="text-[11px] text-[#b9a58c] font-sans">
                Interactive demonstration of edge tokenization saving up to 92% bandwidth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
