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
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Hero Operational Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0D1623] via-[#111E2D] to-[#172638] border border-[#172638] relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#35D5E8]/10 text-[#35D5E8] border border-[#35D5E8]/30 text-[10px] font-bold">
            <Radio className="w-3 h-3" />
            <span>SOVEREIGN AIRBORNE NETWORK DIGITAL TWIN</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#EDF4FA] font-sans">
            {isArabic
              ? 'عَصَب | منظومة القيادة والتحكم الجوية السيادية'
              : 'ASAB | Sovereign Airborne Command & Simulation'}
          </h1>
          <p className="text-sm text-[#92A4B8] font-sans leading-relaxed">
            {isArabic
              ? 'بيئة متكاملة لمحاكاة الشبكات الجوية اللامركزية، وإدارة أسراب طائرات الإقلاع والهبوط العمودي (VTOL)، مع استوديو الهندسة ثلاثي الأبعاد AEROLAB 3D.'
              : 'Decentralized airborne mesh communications architecture with real-time digital twin flight telemetry, 3D VTOL aircraft engineering studio, and resilience testing.'}
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            <button
              onClick={() => navigateToModule('command-center', 'asab')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#35D5E8] hover:bg-[#28c5d8] text-[#080D16] font-bold transition-colors"
            >
              <span>{isArabic ? 'فتح مركز العمليات' : 'LAUNCH COMMAND CENTER'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToModule('aircraft-studio', 'aerolab')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111E2D] hover:bg-[#172638] text-[#EDF4FA] border border-[#172638] transition-colors"
            >
              <Box className="w-4 h-4 text-[#5587FF]" />
              <span>{isArabic ? 'استوديو الطائرات ثلاثي الأبعاد' : 'OPEN AEROLAB 3D'}</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid and watermark */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-[120px] font-bold text-[#35D5E8] pointer-events-none font-arabic">
          عَصَب
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex items-center justify-between text-[#92A4B8]">
            <span>TOTAL AIRBORNE NODES</span>
            <Radio className="w-4 h-4 text-[#35D5E8]" />
          </div>
          <div className="text-3xl font-bold text-[#EDF4FA]">{nodes.length}</div>
          <div className="text-[11px] text-[#3DDC97]">
            {activeCount} Active • {standbyCount} Standby • {disconnectedCount} Down
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex items-center justify-between text-[#92A4B8]">
            <span>ACTIVE MESH LINKS</span>
            <Wifi className="w-4 h-4 text-[#5587FF]" />
          </div>
          <div className="text-3xl font-bold text-[#35D5E8]">{metrics.activeLinksCount}</div>
          <div className="text-[11px] text-[#92A4B8]">
            Multi-hop topology active • Bandwidth: {metrics.totalThroughputMbps} Mbps
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex items-center justify-between text-[#92A4B8]">
            <span>NETWORK HEALTH INDEX</span>
            <Shield className="w-4 h-4 text-[#3DDC97]" />
          </div>
          <div className="text-3xl font-bold text-[#3DDC97]">{metrics.networkHealthPercent}%</div>
          <div className="text-[11px] text-[#EDF4FA]">
            State: <span className="font-bold text-[#3DDC97]">{metrics.overallHealthState}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex items-center justify-between text-[#92A4B8]">
            <span>PACKET DELIVERY RATIO</span>
            <Activity className="w-4 h-4 text-[#F5B82E]" />
          </div>
          <div className="text-3xl font-bold text-[#F5B82E]">{metrics.packetDeliveryRatio}%</div>
          <div className="text-[11px] text-[#92A4B8]">
            Avg Latency: {metrics.averageLatencyMs} ms
          </div>
        </div>
      </div>

      {/* Two-Column Core Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Readiness Roster */}
        <div className="p-5 rounded-xl bg-[#0D1623] border border-[#172638] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#172638]">
            <div className="text-sm font-bold text-[#EDF4FA] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#35D5E8]" />
              <span>ACTIVE FLEET DEPLOYMENT</span>
            </div>
            <button
              onClick={() => navigateToModule('airborne-fleet')}
              className="text-[#35D5E8] hover:underline text-xs flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {nodes.slice(0, 5).map((node) => (
              <div
                key={node.id}
                className="p-3 rounded-lg bg-[#111E2D] border border-[#172638] flex items-center justify-between hover:border-[#35D5E8]/40 transition-colors cursor-pointer"
                onClick={() => navigateToModule('command-center')}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      node.status === 'Active'
                        ? 'bg-[#3DDC97]'
                        : node.status === 'Standby'
                        ? 'bg-[#F5B82E]'
                        : 'bg-[#FF5964]'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-[#EDF4FA]">{node.id} • {node.callsign}</div>
                    <div className="text-[11px] text-[#64768B]">{node.type} • {node.role}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[#35D5E8] font-bold">{node.telemetry.altitude} m</div>
                  <div className="text-[10px] text-[#92A4B8]">Bat: {node.telemetry.batteryPercent}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engineering Studio & Simulation Highlights */}
        <div className="p-5 rounded-xl bg-[#0D1623] border border-[#172638] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#172638]">
            <div className="text-sm font-bold text-[#EDF4FA] flex items-center gap-2">
              <Box className="w-4 h-4 text-[#5587FF]" />
              <span>AEROLAB 3D ENGINEERING SUITE</span>
            </div>
            <button
              onClick={() => navigateToModule('aircraft-studio')}
              className="text-[#5587FF] hover:underline text-xs flex items-center gap-1"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => navigateToModule('aircraft-studio')}
              className="p-3.5 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="text-[#35D5E8] font-bold">3D Aircraft Inspection</div>
              <p className="text-[11px] text-[#92A4B8] font-sans">
                Full exploded CAD view with 14+ components, mass properties, and orbit cameras.
              </p>
            </div>

            <div
              onClick={() => navigateToModule('flight-simulation')}
              className="p-3.5 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="text-[#3DDC97] font-bold">6-DoF Flight Simulator</div>
              <p className="text-[11px] text-[#92A4B8] font-sans">
                Interactive keyboard and HUD flight dynamics with VTOL transition modes.
              </p>
            </div>

            <div
              onClick={() => navigateToModule('dynamics')}
              className="p-3.5 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="text-[#F5B82E] font-bold">Aerodynamic Forces</div>
              <p className="text-[11px] text-[#92A4B8] font-sans">
                Real-time lift, drag, pitch moment, and wind shear analysis.
              </p>
            </div>

            <div
              onClick={() => navigateToModule('edge-intelligence')}
              className="p-3.5 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] cursor-pointer transition-colors space-y-1.5"
            >
              <div className="text-[#5587FF] font-bold">Semantic Compression</div>
              <p className="text-[11px] text-[#92A4B8] font-sans">
                Interactive demonstration of edge tokenization saving up to 92% bandwidth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
