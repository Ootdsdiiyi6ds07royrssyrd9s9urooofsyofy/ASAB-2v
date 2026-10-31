/**
 * ASAB | AEROLAB 3D - Decentralized Mesh Network Topology
 * Features 2D interactive topological graph, multi-hop routing visualization, and link metrics.
 */

import React, { useState } from 'react';
import {
  Network,
  Radio,
  Wifi,
  Activity,
  Layers,
  Shield,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const NetworkTopologyView: React.FC = () => {
  const { nodes, links, groundStation, selectedNodeId, selectNode, metrics, settings } = useSimulation();
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  const isArabic = settings.language === 'ar';
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedLink = links.find((l) => l.id === selectedLinkId);

  // Layout node coordinates in a circular/star graph layout around ground station at center
  const graphWidth = 720;
  const graphHeight = 460;
  const centerX = graphWidth / 2;
  const centerY = graphHeight / 2;

  const nodeCoordinates = new Map<string, { x: number; y: number }>();
  // Ground station at center
  nodeCoordinates.set(groundStation.id, { x: centerX, y: centerY });

  // Distribute airborne nodes in an elliptical ring with slight noise based on their actual 3D positions
  nodes.forEach((node, idx) => {
    const angle = (idx / nodes.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 170 + (idx % 2 === 0 ? 30 : -20);
    nodeCoordinates.set(node.id, {
      x: Math.round(centerX + Math.cos(angle) * radius),
      y: Math.round(centerY + Math.sin(angle) * radius),
    });
  });

  return (
    <div className="h-full flex flex-col bg-[#120e0a] font-mono text-xs select-none overflow-hidden">
      {/* Top Topology Summary Bar */}
      <div className="min-h-12 bg-[#1a140e] border-b border-[#32261b] px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 shrink-0 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm font-bold text-[#f6ecdd]">
          <Network className="w-4 h-4 text-[#9a6a3a]" />
          <span>{isArabic ? 'طوبولوجيا الشبكة الجوية اللامركزية' : 'DECENTRALIZED MESH TOPOLOGY'}</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px]">
          <div>
            <span className="text-[#b9a58c]">ROUTING PROTOCOL: </span>
            <span className="text-[#9a6a3a] font-bold">ASAB-Mesh-v3 (AODV/OLSR Hybrid)</span>
          </div>
          <div>
            <span className="text-[#b9a58c]">ENCRYPTION: </span>
            <span className="text-[#8fc46a] font-bold">SOVEREIGN-ECC-521</span>
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Interactive 2D Graph Canvas (SVG) */}
        <div className="flex-1 min-h-0 relative flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-[#120e0a]">
          {/* Subtle background radar circles */}
          <svg className="w-full h-full max-w-[800px] max-h-[520px]" viewBox={`0 0 ${graphWidth} ${graphHeight}`}>
            {/* Range Rings */}
            <circle cx={centerX} cy={centerY} r={80} fill="none" stroke="#32261b" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={centerX} cy={centerY} r={160} fill="none" stroke="#32261b" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={centerX} cy={centerY} r={210} fill="none" stroke="#32261b" strokeWidth="1" strokeDasharray="4 4" />

            {/* Links */}
            {links.map((link) => {
              const src = nodeCoordinates.get(link.sourceId);
              const tgt = nodeCoordinates.get(link.targetId);
              if (!src || !tgt) return null;

              const isConnectedToSelected =
                selectedNode && (link.sourceId === selectedNode.id || link.targetId === selectedNode.id);
              const isSelectedLink = selectedLinkId === link.id;

              const strokeColor =
                link.status === 'optimal' ? '#9a6a3a' : link.status === 'stable' ? '#b5793f' : '#f5b82e';

              return (
                <g key={link.id} onClick={() => setSelectedLinkId(link.id)} className="cursor-pointer">
                  {/* Link Line */}
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={strokeColor}
                    strokeWidth={isSelectedLink ? 3.5 : isConnectedToSelected ? 2.5 : 1.5}
                    strokeOpacity={isConnectedToSelected || isSelectedLink ? 0.9 : 0.4}
                  />

                  {/* Midpoint Bandwidth Tag on hover/selected */}
                  {(isSelectedLink || isConnectedToSelected) && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 4}
                      fill="#f6ecdd"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="bg-[#1a140e] px-1"
                    >
                      {link.bandwidthMbps} Mbps ({link.latencyMs}ms)
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {/* Ground Station Node at Center */}
            <g
              transform={`translate(${centerX}, ${centerY})`}
              className="cursor-pointer"
              onClick={() => setSelectedLinkId(null)}
            >
              <circle r={22} fill="#231a12" stroke="#9a6a3a" strokeWidth="2" />
              <rect x="-8" y="-8" width="16" height="16" fill="#9a6a3a" rx="2" />
              <text y="32" fill="#9a6a3a" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {groundStation.callsign}
              </text>
              <text y="42" fill="#b9a58c" fontSize="8" fontFamily="monospace" textAnchor="middle">
                BASE STATION
              </text>
            </g>

            {/* Airborne Nodes */}
            {nodes.map((node) => {
              const coords = nodeCoordinates.get(node.id);
              if (!coords) return null;
              const isSelected = selectedNode?.id === node.id;
              const color =
                node.status === 'Active'
                  ? '#8fc46a'
                  : node.status === 'Standby'
                  ? '#f5b82e'
                  : '#e8584a';

              return (
                <g
                  key={node.id}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  className="cursor-pointer"
                  onClick={() => selectNode(node.id)}
                >
                  {/* Selection pulse ring */}
                  {isSelected && (
                    <circle r={24} fill="none" stroke="#9a6a3a" strokeWidth="1.5" strokeDasharray="3 3" />
                  )}

                  <circle r={16} fill="#1a140e" stroke={color} strokeWidth="2" />
                  <circle r={5} fill={color} />

                  <text y="24" fill="#f6ecdd" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    {node.id}
                  </text>
                  <text y="34" fill="#8c7860" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    {node.role.replace(' Node', '')}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Topology Diagnostics Panel */}
        <div className="w-full md:w-80 max-h-[40%] md:max-h-none bg-[#1a140e] border-t md:border-t-0 md:border-s border-[#32261b] p-3 md:p-4 flex flex-col justify-between overflow-y-auto shrink-0 space-y-4">
          <div className="space-y-4">
            <div className="text-xs font-bold text-[#f6ecdd] pb-2 border-b border-[#32261b] flex items-center justify-between">
              <span>مؤشرات الطوبولوجيا</span>
              <span className="text-[#9a6a3a]">{links.length} {isArabic ? 'قنوات نشطة' : 'Active Channels'}</span>
            </div>

            {/* Selected Node Details or Selected Link Details */}
            {selectedLink ? (
              <div className="p-3 rounded-lg bg-[#231a12] border border-[#9a6a3a]/40 space-y-2">
                <div className="text-[10px] text-[#9a6a3a] font-bold">فاحص الروابط</div>
                <div className="text-sm font-bold text-[#f6ecdd]">{selectedLink.id}</div>
                <div className="space-y-1 text-[11px] pt-1 border-t border-[#32261b]">
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'المصدر / الهدف' : 'Source / Target'}:</span>
                    <span className="text-[#f6ecdd]">{selectedLink.sourceId} ↔ {selectedLink.targetId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'جودة الرابط اللاسلكي' : 'RF Link Quality'}:</span>
                    <span className="text-[#8fc46a] font-bold">{selectedLink.quality}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'زمن قفزة الاتصال' : 'Hop Latency'}:</span>
                    <span className="text-[#f6ecdd]">{selectedLink.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">SNR:</span>
                    <span className="text-[#9a6a3a]">{selectedLink.snrDb} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'معدل النقل' : 'Throughput'}:</span>
                    <span className="text-[#f6ecdd]">{selectedLink.bandwidthMbps} Mbps</span>
                  </div>
                </div>
              </div>
            ) : selectedNode ? (
              <div className="p-3 rounded-lg bg-[#231a12] border border-[#32261b] space-y-2">
                <div className="text-[10px] text-[#9a6a3a] font-bold">توجيه العقدة المفحوصة</div>
                <div className="text-sm font-bold text-[#f6ecdd]">{selectedNode.id} ({selectedNode.callsign})</div>
                <div className="space-y-1 text-[11px] pt-1 border-t border-[#32261b]">
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'عنوان IP' : 'IP Address'}:</span>
                    <span className="text-[#9a6a3a]">{selectedNode.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'القفزات إلى البوابة' : 'Hops to Gateway'}:</span>
                    <span className="text-[#f6ecdd]">{selectedNode.hopCountToGateway} {isArabic ? 'قفزات' : 'Hops'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b9a58c]">{isArabic ? 'أقصى مدى لاسلكي' : 'Max RF Range'}:</span>
                    <span className="text-[#f6ecdd]">{selectedNode.maxRangeKm} km</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Routing Table Snapshot */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#8c7860] uppercase font-bold">جدول توجيه الشبكة النشط</div>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {links.map((link) => (
                  <div
                    key={link.id}
                    onClick={() => setSelectedLinkId(link.id)}
                    className="p-2 rounded bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] flex items-center justify-between text-[11px] cursor-pointer"
                  >
                    <span className="text-[#f6ecdd] font-bold">{link.sourceId} ↔ {link.targetId}</span>
                    <span className="text-[#9a6a3a]">{link.quality}%</span>
                    <span className="text-[#b9a58c]">{link.latencyMs}ms</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
