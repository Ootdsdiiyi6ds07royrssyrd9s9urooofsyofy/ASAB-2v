/**
 * ASAB | AEROLAB 3D - Airborne Fleet Management
 * Inspect, configure, add, and manage virtual aircraft nodes and tactical fleet roles.
 */

import React, { useState } from 'react';
import {
  Plane,
  Plus,
  Trash2,
  ExternalLink,
  Battery,
  Shield,
  Activity,
  Sliders,
  Radio,
  Wifi,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { NodeRole, NodeStatus, AircraftNode } from '../../types';

export const AirborneFleetView: React.FC = () => {
  const {
    nodes,
    selectedNodeId,
    selectNode,
    addNode,
    removeNode,
    updateNodeStatus,
    navigateToModule,
    settings,
  } = useSimulation();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const isArabic = settings.language === 'ar';

  const filteredNodes = nodes.filter((n) => {
    if (roleFilter === 'all') return true;
    return n.role === roleFilter;
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <Plane className="w-5 h-5 text-[#35D5E8]" />
            <span>{isArabic ? 'إدارة الأسطول الجوي المستقل' : 'AIRBORNE FLEET MANAGEMENT'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
            {isArabic
              ? 'إدارة العقد الجوية الذكية، وتوزيع الأدوار، ومراقبة مستويات الطاقة وجودة الإشارات الراديوية.'
              : 'Autonomous decentralized node allocation, telemetry inspection, and operational state assignment.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter by role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 rounded-lg bg-[#111E2D] border border-[#172638] text-[#EDF4FA] focus:outline-none focus:border-[#35D5E8]"
          >
            <option value="all">All Fleet Roles ({nodes.length})</option>
            <option value="Command Node">Command Nodes</option>
            <option value="Relay Node">Relay Nodes</option>
            <option value="Gateway Node">Gateway Nodes</option>
            <option value="Monitoring Node">Monitoring Nodes</option>
            <option value="VTOL Node">VTOL Nodes</option>
          </select>

          {/* Add virtual aircraft */}
          <button
            onClick={() => addNode()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#35D5E8] hover:bg-[#28c5d8] text-[#080D16] font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إضافة طائرة' : 'ADD AIRCRAFT'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Aircraft Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <div
              key={node.id}
              onClick={() => selectNode(node.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-[#172638] border-[#35D5E8] shadow-lg shadow-[#35D5E8]/10'
                  : 'bg-[#0D1623] border-[#172638] hover:border-[#35D5E8]/40'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#EDF4FA]">{node.id}</div>
                  <div className="text-[11px] text-[#35D5E8]">{node.callsign} • {node.type}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      node.status === 'Active'
                        ? 'bg-[#3DDC97]/20 text-[#3DDC97]'
                        : node.status === 'Standby'
                        ? 'bg-[#F5B82E]/20 text-[#F5B82E]'
                        : 'bg-[#FF5964]/20 text-[#FF5964]'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] text-[11px]">
                <div>
                  <div className="text-[#64768B]">ALTITUDE</div>
                  <div className="font-bold text-[#EDF4FA]">{node.telemetry.altitude}m</div>
                </div>
                <div>
                  <div className="text-[#64768B]">SPEED</div>
                  <div className="font-bold text-[#EDF4FA]">{node.telemetry.airspeed} km/h</div>
                </div>
                <div>
                  <div className="text-[#64768B]">BATTERY</div>
                  <div className="font-bold text-[#3DDC97]">{node.telemetry.batteryPercent}%</div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#172638]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNodeStatus(node.id, node.status === 'Active' ? 'Standby' : 'Active');
                    }}
                    className="px-2 py-1 rounded bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[10px] text-[#EDF4FA]"
                  >
                    {node.status === 'Active' ? 'Set Standby' : 'Set Active'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(node.id);
                    }}
                    className="p-1 rounded bg-[#FF5964]/10 hover:bg-[#FF5964]/20 text-[#FF5964] border border-[#FF5964]/30"
                    title="Decommission Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectNode(node.id);
                    navigateToModule('aircraft-studio', 'aerolab');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#5587FF]/20 hover:bg-[#5587FF]/30 text-[#5587FF] border border-[#5587FF]/40 text-[10px] font-bold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Inspect in Studio</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
