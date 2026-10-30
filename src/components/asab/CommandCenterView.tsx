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
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col bg-[#080D16] overflow-hidden">
      {/* Top Operations Command Bar */}
      <div className="h-12 bg-[#0D1623]/90 border-b border-[#172638] px-4 flex items-center justify-between z-10 shrink-0">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {scenarioRunning ? (
            <button
              onClick={pauseSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5B82E]/20 text-[#F5B82E] hover:bg-[#F5B82E]/30 border border-[#F5B82E]/40 text-xs font-mono font-bold transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إيقاف مؤقت' : 'PAUSE SIMULATION'}</span>
            </button>
          ) : (
            <button
              onClick={resumeSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3DDC97]/20 text-[#3DDC97] hover:bg-[#3DDC97]/30 border border-[#3DDC97]/40 text-xs font-mono font-bold transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isArabic ? 'استئناف المحاكاة' : 'START SIMULATION'}</span>
            </button>
          )}

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111E2D] hover:bg-[#172638] text-[#92A4B8] hover:text-[#EDF4FA] border border-[#172638] text-xs font-mono transition-colors"
            title="Reset Airspace Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إعادة ضبط' : 'RESET'}</span>
          </button>

          <div className="w-px h-5 bg-[#172638] mx-1" />

          {/* Add Virtual Node button */}
          <button
            onClick={() => setAddNodeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#35D5E8]/20 hover:bg-[#35D5E8]/30 text-[#35D5E8] border border-[#35D5E8]/40 text-xs font-mono font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إضافة عقدة جوية' : 'ADD VIRTUAL NODE'}</span>
          </button>
        </div>

        {/* Viewport & Scenario Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateToModule('scenario-manager')}
            className="px-2.5 py-1.5 rounded-lg bg-[#111E2D] hover:bg-[#172638] text-xs font-mono text-[#92A4B8] hover:text-[#EDF4FA] border border-[#172638] transition-colors"
          >
            {isArabic ? 'مدير السيناريوهات' : 'SCENARIOS'}
          </button>
          <button
            onClick={() => navigateToModule('resilience')}
            className="px-2.5 py-1.5 rounded-lg bg-[#111E2D] hover:bg-[#172638] text-xs font-mono text-[#92A4B8] hover:text-[#EDF4FA] border border-[#172638] transition-colors"
          >
            {isArabic ? 'مختبر الصمود' : 'RESILIENCE LAB'}
          </button>
        </div>
      </div>

      {/* Main Workspace (3D Airspace + Contextual Inspector) */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Central 3D Tactical Airspace */}
        <div className="flex-1 h-full relative">
          <Airspace3DCanvas />

          {/* Floating Bottom Quick Fleet Roster */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-center">
            <div className="pointer-events-auto max-w-4xl w-full p-2 rounded-xl bg-[#0D1623]/90 border border-[#172638] backdrop-blur-sm shadow-2xl flex items-center gap-2 overflow-x-auto">
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => selectNode(node.id)}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all text-left ${
                      isSelected
                        ? 'bg-[#172638] border-[#35D5E8] text-[#35D5E8] shadow-md shadow-[#35D5E8]/10'
                        : 'bg-[#111E2D]/80 border-[#172638] text-[#92A4B8] hover:border-[#35D5E8]/40'
                    }`}
                  >
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
                      <div className="font-bold text-[#EDF4FA]">{node.id}</div>
                      <div className="text-[10px] text-[#64768B]">{node.role.replace(' Node', '')}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Contextual Aircraft Telemetry Inspector */}
        {selectedNode && (
          <aside className="w-80 h-full bg-[#0D1623] border-l border-[#172638] p-4 flex flex-col justify-between overflow-y-auto shrink-0 z-10 font-mono text-xs select-none">
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-[#172638]">
                <div>
                  <div className="text-[10px] text-[#92A4B8]">{isArabic ? 'العقدة المختارة' : 'SELECTED NODE'}</div>
                  <div className="text-base font-bold text-[#EDF4FA]">{selectedNode.id}</div>
                  <div className="text-[11px] text-[#35D5E8]">{selectedNode.name}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    selectedNode.status === 'Active'
                      ? 'bg-[#3DDC97]/20 text-[#3DDC97] border border-[#3DDC97]/30'
                      : selectedNode.status === 'Standby'
                      ? 'bg-[#F5B82E]/20 text-[#F5B82E] border border-[#F5B82E]/30'
                      : 'bg-[#FF5964]/20 text-[#FF5964] border border-[#FF5964]/30'
                  }`}
                >
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>

              {/* Primary Flight Telemetry Grid */}
              <div>
                <div className="text-[10px] text-[#64768B] mb-2 uppercase font-bold tracking-wider">
                  {isArabic ? 'القياسات الحية للمنصة' : 'PLATFORM TELEMETRY'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-[#111E2D] border border-[#172638]">
                    <div className="text-[10px] text-[#92A4B8]">ALTITUDE</div>
                    <div className="text-sm font-bold text-[#35D5E8]">{selectedNode.telemetry.altitude} m</div>
                  </div>
                  <div className="p-2 rounded bg-[#111E2D] border border-[#172638]">
                    <div className="text-[10px] text-[#92A4B8]">AIRSPEED</div>
                    <div className="text-sm font-bold text-[#35D5E8]">{selectedNode.telemetry.airspeed} km/h</div>
                  </div>
                  <div className="p-2 rounded bg-[#111E2D] border border-[#172638]">
                    <div className="text-[10px] text-[#92A4B8]">HEADING</div>
                    <div className="text-sm font-bold text-[#EDF4FA]">{selectedNode.telemetry.heading}°</div>
                  </div>
                  <div className="p-2 rounded bg-[#111E2D] border border-[#172638]">
                    <div className="text-[10px] text-[#92A4B8]">BATTERY</div>
                    <div className="text-sm font-bold text-[#3DDC97] flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5" />
                      <span>{selectedNode.telemetry.batteryPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RF & Sovereign Network Telemetry */}
              <div>
                <div className="text-[10px] text-[#64768B] mb-2 uppercase font-bold tracking-wider">
                  {isArabic ? 'بيانات الشبكة والاتصال' : 'MESH LINK PARAMETERS'}
                </div>
                <div className="space-y-1.5 p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Role:</span>
                    <span className="text-[#EDF4FA] font-bold">{selectedNode.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Signal (RSSI):</span>
                    <span className="text-[#35D5E8] font-bold">{selectedNode.telemetry.signalStrength} dBm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Mesh Latency:</span>
                    <span className="text-[#EDF4FA]">{selectedNode.telemetry.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Hop Count to GCS:</span>
                    <span className="text-[#EDF4FA]">{selectedNode.hopCountToGateway} Hops</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Crypto Suite:</span>
                    <span className="text-[#3DDC97]">{selectedNode.encryptionStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Onboard CPU:</span>
                    <span className="text-[#EDF4FA]">{selectedNode.telemetry.cpuLoadPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Active Links For This Node */}
              <div>
                <div className="text-[10px] text-[#64768B] mb-2 uppercase font-bold tracking-wider">
                  {isArabic ? 'الروابط المتصلة بها' : 'ASSOCIATED ACTIVE LINKS'}
                </div>
                <div className="space-y-1">
                  {nodeLinks.length === 0 ? (
                    <div className="p-2 rounded bg-[#111E2D] text-[#64768B] text-center">
                      No active RF links
                    </div>
                  ) : (
                    nodeLinks.map((link) => (
                      <div
                        key={link.id}
                        className="p-1.5 rounded bg-[#111E2D] border border-[#172638] flex items-center justify-between text-[11px]"
                      >
                        <span className="text-[#EDF4FA] truncate max-w-[120px]">{link.id}</span>
                        <span className="text-[#35D5E8]">{link.quality}% Q</span>
                        <span className="text-[#92A4B8]">{link.bandwidthMbps} Mbps</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Node Actions */}
            <div className="pt-4 border-t border-[#172638] space-y-2">
              <button
                onClick={() => navigateToModule('aircraft-studio', 'aerolab')}
                className="w-full py-2 rounded-lg bg-[#5587FF] hover:bg-[#4372e6] text-[#EDF4FA] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#5587FF]/20"
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
                  className="py-1.5 rounded bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[#EDF4FA] text-[11px] transition-colors"
                >
                  {selectedNode.status === 'Active' ? 'SET STANDBY' : 'SET ACTIVE'}
                </button>
                <button
                  onClick={() => removeNode(selectedNode.id)}
                  className="py-1.5 rounded bg-[#FF5964]/10 hover:bg-[#FF5964]/20 border border-[#FF5964]/30 text-[#FF5964] text-[11px] transition-colors"
                >
                  REMOVE NODE
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Add Virtual Node Modal */}
      {addNodeModalOpen && (
        <div className="absolute inset-0 z-50 bg-[#080D16]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-5 rounded-xl bg-[#0D1623] border border-[#35D5E8]/40 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#172638]">
              <div className="text-sm font-bold text-[#35D5E8]">DEPLOY VIRTUAL AIRBORNE NODE</div>
              <button onClick={() => setAddNodeModalOpen(false)} className="text-[#92A4B8] hover:text-[#EDF4FA]">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#92A4B8] mb-1">SELECT MISSION ROLE</label>
                <select
                  value={newNodeRole}
                  onChange={(e) => setNewNodeRole(e.target.value as any)}
                  className="w-full p-2 rounded bg-[#111E2D] border border-[#172638] text-[#EDF4FA] focus:outline-none focus:border-[#35D5E8]"
                >
                  <option value="VTOL Node">VTOL Node (Standard Multi-Mission)</option>
                  <option value="Relay Node">Relay Node (Backbone Range Extender)</option>
                  <option value="Gateway Node">Gateway Node (Ground & Satellite Bridge)</option>
                  <option value="Monitoring Node">Monitoring Node (Sensor & ISR Forward)</option>
                </select>
              </div>

              <div className="p-3 rounded bg-[#111E2D] border border-[#172638] text-[#92A4B8] text-[11px] space-y-1">
                <div>Model: <span className="text-[#EDF4FA]">ASAB-V100 VTOL Platform</span></div>
                <div>RF Mesh: <span className="text-[#35D5E8]">Native Sovereign Decentralized</span></div>
                <div>Encryption: <span className="text-[#3DDC97]">Hardware ECC Suite</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#172638]">
              <button
                onClick={() => setAddNodeModalOpen(false)}
                className="px-3 py-1.5 rounded bg-[#111E2D] hover:bg-[#172638] text-[#92A4B8]"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreateNode}
                className="px-4 py-1.5 rounded bg-[#35D5E8] hover:bg-[#25c4d6] text-[#080D16] font-bold"
              >
                DEPLOY NODE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
