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
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <Plane className="w-5 h-5 text-[#9a6a3a]" />
            <span>{isArabic ? 'إدارة الأسطول الجوي المستقل' : 'AIRBORNE FLEET MANAGEMENT'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
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
            className="p-2 rounded-lg bg-[#231a12] border border-[#32261b] text-[#f6ecdd] focus:outline-none focus:border-[#9a6a3a]"
          >
            <option value="all">{isArabic ? `كل أدوار الأسطول (${nodes.length})` : `All Fleet Roles (${nodes.length})`}</option>
            <option value="Command Node">عقد القيادة</option>
            <option value="Relay Node">{isArabic ? 'عقد الترحيل' : 'Relay Nodes'}</option>
            <option value="Gateway Node">{isArabic ? 'عقد البوابة' : 'Gateway Nodes'}</option>
            <option value="Monitoring Node">{isArabic ? 'عقد المراقبة' : 'Monitoring Nodes'}</option>
            <option value="VTOL Node">{isArabic ? 'عقد الإقلاع العمودي' : 'VTOL Nodes'}</option>
          </select>

          {/* Add virtual aircraft */}
          <button
            onClick={() => addNode()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold transition-colors"
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
                  ? 'bg-[#32261b] border-[#9a6a3a] shadow-lg shadow-[#9a6a3a]/10'
                  : 'bg-[#1a140e] border-[#32261b] hover:border-[#9a6a3a]/40'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#f6ecdd]">{node.id}</div>
                  <div className="text-[11px] text-[#9a6a3a]">{node.callsign} • {node.type}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      node.status === 'Active'
                        ? 'bg-[#8fc46a]/20 text-[#8fc46a]'
                        : node.status === 'Standby'
                        ? 'bg-[#f5b82e]/20 text-[#f5b82e]'
                        : 'bg-[#e8584a]/20 text-[#e8584a]'
                    }`}
                  >
                    {isArabic ? ({ Active: 'نشطة', Standby: 'استعداد', Disconnected: 'منقطعة', Recovering: 'استعادة', Unavailable: 'غير متاحة' } as Record<string, string>)[node.status] : node.status}
                  </span>
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] text-[11px]">
                <div>
                  <div className="text-[#8c7860]">الارتفاع</div>
                  <div className="font-bold text-[#f6ecdd]">{node.telemetry.altitude}m</div>
                </div>
                <div>
                  <div className="text-[#8c7860]">السرعة</div>
                  <div className="font-bold text-[#f6ecdd]">{node.telemetry.airspeed} km/h</div>
                </div>
                <div>
                  <div className="text-[#8c7860]">البطارية</div>
                  <div className="font-bold text-[#8fc46a]">{node.telemetry.batteryPercent}%</div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#32261b]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNodeStatus(node.id, node.status === 'Active' ? 'Standby' : 'Active');
                    }}
                    className="px-2 py-1 rounded bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] text-[10px] text-[#f6ecdd]"
                  >
                    {isArabic ? (node.status === 'Active' ? 'وضع الاستعداد' : 'تفعيل العقدة') : (node.status === 'Active' ? 'Set Standby' : 'Set Active')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(node.id);
                    }}
                    className="p-1 rounded bg-[#e8584a]/10 hover:bg-[#e8584a]/20 text-[#e8584a] border border-[#e8584a]/30"
                    title="إخراج العقدة من الخدمة"
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
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#b5793f]/20 hover:bg-[#b5793f]/30 text-[#b5793f] border border-[#b5793f]/40 text-[10px] font-bold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{isArabic ? 'فتح في الاستوديو' : 'Inspect in Studio'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
