/**
 * ASAB | AEROLAB 3D - ASAB Command Center (Primary Operations Screen)
 * Integrates 3D tactical airspace with real-time fleet telemetry, controls, and contextual node inspector.
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  Eye,
  Radio,
  ExternalLink,
  Battery,
  Navigation,
  Activity,
  Cpu,
  Wifi,
  Shield,
  Plus,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { Airspace3DCanvas } from '../3d/Airspace3DCanvas';
import { useSimulation } from '../../context/SimulationContext';

export const CommandCenterView: React.FC = () => {
  const {
    nodes,
    links,
    selectedNodeId,
    selectNode,
    groundStation,
    scenarioRunning,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    updateNodeStatus,
    removeNode,
    addNode,
    navigateToModule,
    settings,
    updateSettings,
    metrics,
  } = useSimulation();

  const [addNodeModalOpen, setAddNodeModalOpen] = useState(false);
  const [newNodeRole, setNewNodeRole] = useState<'VTOL Node' | 'Relay Node' | 'Gateway Node' | 'Monitoring Node'>('VTOL Node');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const isArabic = settings.language === 'ar';

  // Links connected to selected node
  const nodeLinks = links.filter(
    (l) => l.sourceId === selectedNode?.id || l.targetId === selectedNode?.id
  );

  const handleCreateNode = () => {
    addNode({ role: newNodeRole });
    setAddNodeModalOpen(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#120e0a] overflow-hidden">
      {/* Top Operations Command Bar */}
      <div className="min-h-12 bg-[#1a140e]/90 border-b border-[#32261b] px-2 sm:px-4 py-1.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 z-10 shrink-0 overflow-x-auto">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {scenarioRunning ? (
            <button
              onClick={pauseSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5b82e]/20 text-[#f5b82e] hover:bg-[#f5b82e]/30 border border-[#f5b82e]/40 text-xs font-mono font-bold transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إيقاف مؤقت' : 'PAUSE SIMULATION'}</span>
            </button>
          ) : (
            <button
              onClick={resumeSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8fc46a]/20 text-[#8fc46a] hover:bg-[#8fc46a]/30 border border-[#8fc46a]/40 text-xs font-mono font-bold transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isArabic ? 'استئناف المحاكاة' : 'START SIMULATION'}</span>
            </button>
          )}

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#231a12] hover:bg-[#32261b] text-[#b9a58c] hover:text-[#f6ecdd] border border-[#32261b] text-xs font-mono transition-colors"
            title="إعادة ضبط محاكاة المجال الجوي"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إعادة ضبط' : 'RESET'}</span>
          </button>

          <div className="w-px h-5 bg-[#32261b] mx-1" />

          {/* Add Virtual Node button */}
          <button
            onClick={() => setAddNodeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9a6a3a]/20 hover:bg-[#9a6a3a]/30 text-[#9a6a3a] border border-[#9a6a3a]/40 text-xs font-mono font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إضافة عقدة جوية' : 'ADD VIRTUAL NODE'}</span>
          </button>
        </div>

        {/* Viewport & Scenario Shortcuts */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => navigateToModule('scenario-manager')}
            className="px-2.5 py-1.5 rounded-lg bg-[#231a12] hover:bg-[#32261b] text-xs font-mono text-[#b9a58c] hover:text-[#f6ecdd] border border-[#32261b] transition-colors"
          >
            {isArabic ? 'مدير السيناريوهات' : 'SCENARIOS'}
          </button>
          <button
            onClick={() => navigateToModule('resilience')}
            className="px-2.5 py-1.5 rounded-lg bg-[#231a12] hover:bg-[#32261b] text-xs font-mono text-[#b9a58c] hover:text-[#f6ecdd] border border-[#32261b] transition-colors"
          >
            {isArabic ? 'مختبر الصمود' : 'RESILIENCE LAB'}
          </button>
        </div>
      </div>

      {/* Main Workspace (3D Airspace + Contextual Inspector) */}
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Central 3D Tactical Airspace */}
        <div className="flex-1 min-h-[280px] md:min-h-0 md:h-full relative">
          <Airspace3DCanvas />

          {/* Floating Bottom Quick Fleet Roster */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-center">
            <div className="pointer-events-auto max-w-4xl w-full p-2 rounded-xl bg-[#1a140e]/90 border border-[#32261b] backdrop-blur-sm shadow-2xl flex items-center gap-2 overflow-x-auto">
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => selectNode(node.id)}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all text-left ${
                      isSelected
                        ? 'bg-[#32261b] border-[#9a6a3a] text-[#9a6a3a] shadow-md shadow-[#9a6a3a]/10'
                        : 'bg-[#231a12]/80 border-[#32261b] text-[#b9a58c] hover:border-[#9a6a3a]/40'
                    }`}
                  >
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
                      <div className="font-bold text-[#f6ecdd]">{node.id}</div>
                      <div className="text-[10px] text-[#8c7860]">{node.role.replace(' Node', '')}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Contextual Aircraft Telemetry Inspector */}
        {selectedNode && (
          <aside className="w-full md:w-80 max-h-[42%] md:max-h-none md:h-full bg-[#1a140e] border-t md:border-t-0 md:border-s border-[#32261b] p-3 md:p-4 flex flex-col justify-between overflow-y-auto shrink-0 z-10 font-mono text-xs select-none">
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-[#32261b]">
                <div>
                  <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'العقدة المختارة' : 'SELECTED NODE'}</div>
                  <div className="text-base font-bold text-[#f6ecdd]">{selectedNode.id}</div>
                  <div className="text-[11px] text-[#9a6a3a]">{selectedNode.name}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    selectedNode.status === 'Active'
                      ? 'bg-[#8fc46a]/20 text-[#8fc46a] border border-[#8fc46a]/30'
                      : selectedNode.status === 'Standby'
                      ? 'bg-[#f5b82e]/20 text-[#f5b82e] border border-[#f5b82e]/30'
                      : 'bg-[#e8584a]/20 text-[#e8584a] border border-[#e8584a]/30'
                  }`}
                >
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>

              {/* Primary Flight Telemetry Grid */}
              <div>
                <div className="text-[10px] text-[#8c7860] mb-2 uppercase font-bold tracking-wider">
                  {isArabic ? 'القياسات الحية للمنصة' : 'PLATFORM TELEMETRY'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-[#231a12] border border-[#32261b]">
                    <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'الارتفاع' : 'الارتفاع'}</div>
                    <div className="text-sm font-bold text-[#9a6a3a]">{selectedNode.telemetry.altitude} {isArabic ? 'م' : 'm'}</div>
                  </div>
                  <div className="p-2 rounded bg-[#231a12] border border-[#32261b]">
                    <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'السرعة الجوية' : 'AIRالسرعة'}</div>
                    <div className="text-sm font-bold text-[#9a6a3a]">{selectedNode.telemetry.airspeed} {isArabic ? 'كم/س' : 'km/h'}</div>
                  </div>
                  <div className="p-2 rounded bg-[#231a12] border border-[#32261b]">
                    <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'الاتجاه' : 'الاتجاه'}</div>
                    <div className="text-sm font-bold text-[#f6ecdd]">{selectedNode.telemetry.heading}°</div>
                  </div>
                  <div className="p-2 rounded bg-[#231a12] border border-[#32261b]">
                    <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'البطارية' : 'البطارية'}</div>
                    <div className="text-sm font-bold text-[#8fc46a] flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5" />
                      <span>{selectedNode.telemetry.batteryPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RF & Sovereign Network Telemetry */}
              <div>
                <div className="text-[10px] text-[#8c7860] mb-2 uppercase font-bold tracking-wider">
                  {isArabic ? 'بيانات الشبكة والاتصال' : 'MESH LINK PARAMETERS'}
                </div>
                <div className="space-y-1.5 p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'الدور التكتيكي:' : 'Role:'}</span>
                    <span className="text-[#f6ecdd] font-bold">{selectedNode.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'قوة الإشارة (RSSI):' : 'Signal (RSSI):'}</span>
                    <span className="text-[#9a6a3a] font-bold">{selectedNode.telemetry.signalStrength} dBm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'زمن استجابة الشبكة:' : 'Mesh Latency:'}</span>
                    <span className="text-[#f6ecdd]">{selectedNode.telemetry.latencyMs} {isArabic ? 'م.ث' : 'ms'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'عدد القفزات للمحطة:' : 'Hop Count to GCS:'}</span>
                    <span className="text-[#f6ecdd]">{selectedNode.hopCountToGateway} {isArabic ? 'قفزات' : 'Hops'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'منظومة التشفير:' : 'Crypto Suite:'}</span>
                    <span className="text-[#8fc46a]">{selectedNode.encryptionStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'حمل المعالج:' : 'Onboard CPU:'}</span>
                    <span className="text-[#f6ecdd]">{selectedNode.telemetry.cpuLoadPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Active Links For This Node */}
              <div>
                <div className="text-[10px] text-[#8c7860] mb-2 uppercase font-bold tracking-wider">
                  {isArabic ? 'الروابط المتصلة بها' : 'ASSOCIATED ACTIVE LINKS'}
                </div>
                <div className="space-y-1">
                  {nodeLinks.length === 0 ? (
                    <div className="p-2 rounded bg-[#231a12] text-[#8c7860] text-center">
                      {isArabic ? 'لا توجد روابط راديوية متصلة' : 'No active RF links'}
                    </div>
                  ) : (
                    nodeLinks.map((link) => (
                      <div
                        key={link.id}
                        className="p-1.5 rounded bg-[#231a12] border border-[#32261b] flex items-center justify-between text-[11px]"
                      >
                        <span className="text-[#f6ecdd] truncate max-w-[120px]">{link.id}</span>
                        <span className="text-[#9a6a3a]">{link.quality}% {isArabic ? 'جودة' : 'Q'}</span>
                        <span className="text-[#b9a58c]">{link.bandwidthMbps} Mbps</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Node Actions */}
            <div className="pt-4 border-t border-[#32261b] space-y-2">
              <button
                onClick={() => navigateToModule('aircraft-studio', 'aerolab')}
                className="w-full py-2 rounded-lg bg-[#b5793f] hover:bg-[#a06a36] text-[#f6ecdd] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#b5793f]/20"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{isArabic ? 'فحص في أيرولاب 3D' : 'INSPECT IN AEROLAB 3D'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    updateNodeStatus(
                      selectedNode.id,
                      selectedNode.status === 'Active' ? 'Standby' : 'Active'
                    )
                  }
                  className="py-1.5 rounded bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] text-[#f6ecdd] text-[11px] transition-colors"
                >
                  {selectedNode.status === 'Active'
                    ? isArabic ? 'تعيين كاستعداد' : 'SET STANDBY'
                    : isArabic ? 'تعيين كنشط' : 'SET ACTIVE'}
                </button>
                <button
                  onClick={() => removeNode(selectedNode.id)}
                  className="py-1.5 rounded bg-[#e8584a]/10 hover:bg-[#e8584a]/20 border border-[#e8584a]/30 text-[#e8584a] text-[11px] transition-colors"
                >
                  {isArabic ? 'إخراج العقدة' : 'REMOVE NODE'}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Add Virtual Node Modal */}
      {addNodeModalOpen && (
        <div className="absolute inset-0 z-50 bg-[#120e0a]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-5 rounded-xl bg-[#1a140e] border border-[#9a6a3a]/40 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#32261b]">
              <div className="text-sm font-bold text-[#9a6a3a]">
                {isArabic ? 'إطلاق ونشر عقدة جوية افتراضية' : 'DEPLOY VIRTUAL AIRBORNE NODE'}
              </div>
              <button onClick={() => setAddNodeModalOpen(false)} className="text-[#b9a58c] hover:text-[#f6ecdd]">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#b9a58c] mb-1">
                  {isArabic ? 'حدد دور المهمة التكتيكية' : 'SELECT MISSION الدور'}
                </label>
                <select
                  value={newNodeRole}
                  onChange={(e) => setNewNodeRole(e.target.value as any)}
                  className="w-full p-2 rounded bg-[#231a12] border border-[#32261b] text-[#f6ecdd] focus:outline-none focus:border-[#9a6a3a]"
                >
                  <option value="VTOL Node">{isArabic ? 'عقدة VTOL متعددة المهام' : 'VTOL Node (Standard Multi-Mission)'}</option>
                  <option value="Relay Node">{isArabic ? 'عقدة ترحيل وتوسيع مدى' : 'Relay Node (Backbone Range Extender)'}</option>
                  <option value="Gateway Node">{isArabic ? 'عقدة بوابة ربط أرضي وأقمار صناعية' : 'Gateway Node (Ground & Satellite Bridge)'}</option>
                  <option value="Monitoring Node">{isArabic ? 'عقدة رصد واستطلاع أمامي' : 'Monitoring Node (Sensor & ISR Forward)'}</option>
                </select>
              </div>

              <div className="p-3 rounded bg-[#231a12] border border-[#32261b] text-[#b9a58c] text-[11px] space-y-1">
                <div>{isArabic ? 'طراز المنصة:' : 'Model:'} <span className="text-[#f6ecdd]">طائرة ASAB-V100 VTOL</span></div>
                <div>{isArabic ? 'شبكة التردد:' : 'RF Mesh:'} <span className="text-[#9a6a3a]">{isArabic ? 'شبكة عَصَب اللامركزية السيادية' : 'Native Sovereign Decentralized'}</span></div>
                <div>{isArabic ? 'جناح التشفير:' : 'Encryption:'} <span className="text-[#8fc46a]">{isArabic ? 'جناح ECC السيادي للأجهزة' : 'Hardware ECC Suite'}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#32261b]">
              <button
                onClick={() => setAddNodeModalOpen(false)}
                className="px-3 py-1.5 rounded bg-[#231a12] hover:bg-[#32261b] text-[#b9a58c]"
              >
                {isArabic ? 'إلغاء' : 'CANCEL'}
              </button>
              <button
                onClick={handleCreateNode}
                className="px-4 py-1.5 rounded bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold"
              >
                {isArabic ? 'نشر العقدة الآن' : 'DEPLOY NODE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
