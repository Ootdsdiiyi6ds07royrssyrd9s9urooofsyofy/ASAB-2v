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
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#080D16] font-mono text-xs select-none overflow-hidden">
      {/* Top Topology Summary Bar */}
      <div className="h-12 bg-[#0D1623] border-b border-[#172638] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold text-[#EDF4FA]">
          <Network className="w-4 h-4 text-[#35D5E8]" />
          <span>{isArabic ? 'طوبولوجيا الشبكة الجوية اللامركزية' : 'DECENTRALIZED MESH TOPOLOGY'}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div>
            <span className="text-[#92A4B8]">ROUTING PROTOCOL: </span>
            <span className="text-[#35D5E8] font-bold">ASAB-Mesh-v3 (AODV/OLSR Hybrid)</span>
          </div>
          <div>
            <span className="text-[#92A4B8]">ENCRYPTION: </span>
            <span className="text-[#3DDC97] font-bold">SOVEREIGN-ECC-521</span>
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Interactive 2D Graph Canvas (SVG) */}
        <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-[#080D16]">
          {/* Subtle background radar circles */}
          <svg className="w-full h-full max-w-[800px] max-h-[520px]" viewBox={`0 0 ${graphWidth} ${graphHeight}`}>
            {/* Range Rings */}
            <circle cx={centerX} cy={centerY} r={80} fill="none" stroke="#172638" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={centerX} cy={centerY} r={160} fill="none" stroke="#172638" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={centerX} cy={centerY} r={210} fill="none" stroke="#172638" strokeWidth="1" strokeDasharray="4 4" />

            {/* Links */}
            {links.map((link) => {
              const src = nodeCoordinates.get(link.sourceId);
              const tgt = nodeCoordinates.get(link.targetId);
              if (!src || !tgt) return null;

              const isConnectedToSelected =
                selectedNode && (link.sourceId === selectedNode.id || link.targetId === selectedNode.id);
              const isSelectedLink = selectedLinkId === link.id;

              const strokeColor =
                link.status === 'optimal' ? '#35D5E8' : link.status === 'stable' ? '#5587FF' : '#F5B82E';

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
                      fill="#EDF4FA"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="bg-[#0D1623] px-1"
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
              <circle r={22} fill="#111E2D" stroke="#35D5E8" strokeWidth="2" />
              <rect x="-8" y="-8" width="16" height="16" fill="#35D5E8" rx="2" />
              <text y="32" fill="#35D5E8" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {groundStation.callsign}
              </text>
              <text y="42" fill="#92A4B8" fontSize="8" fontFamily="monospace" textAnchor="middle">
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
                  ? '#3DDC97'
                  : node.status === 'Standby'
                  ? '#F5B82E'
                  : '#FF5964';

              return (
                <g
                  key={node.id}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  className="cursor-pointer"
                  onClick={() => selectNode(node.id)}
                >
                  {/* Selection pulse ring */}
                  {isSelected && (
                    <circle r={24} fill="none" stroke="#35D5E8" strokeWidth="1.5" strokeDasharray="3 3" />
                  )}

                  <circle r={16} fill="#0D1623" stroke={color} strokeWidth="2" />
                  <circle r={5} fill={color} />

                  <text y="24" fill="#EDF4FA" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    {node.id}
                  </text>
                  <text y="34" fill="#64768B" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    {node.role.replace(' Node', '')}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Topology Diagnostics Panel */}
        <div className="w-80 bg-[#0D1623] border-l border-[#172638] p-4 flex flex-col justify-between overflow-y-auto shrink-0 space-y-4">
          <div className="space-y-4">
            <div className="text-xs font-bold text-[#EDF4FA] pb-2 border-b border-[#172638] flex items-center justify-between">
              <span>TOPOLOGY METRICS</span>
              <span className="text-[#35D5E8]">{links.length} Active Channels</span>
            </div>

            {/* Selected Node Details or Selected Link Details */}
            {selectedLink ? (
              <div className="p-3 rounded-lg bg-[#111E2D] border border-[#35D5E8]/40 space-y-2">
                <div className="text-[10px] text-[#35D5E8] font-bold">LINK INSPECTOR</div>
                <div className="text-sm font-bold text-[#EDF4FA]">{selectedLink.id}</div>
                <div className="space-y-1 text-[11px] pt-1 border-t border-[#172638]">
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Source / Target:</span>
                    <span className="text-[#EDF4FA]">{selectedLink.sourceId} ↔ {selectedLink.targetId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">RF Link Quality:</span>
                    <span className="text-[#3DDC97] font-bold">{selectedLink.quality}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Hop Latency:</span>
                    <span className="text-[#EDF4FA]">{selectedLink.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">SNR:</span>
                    <span className="text-[#35D5E8]">{selectedLink.snrDb} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Throughput:</span>
                    <span className="text-[#EDF4FA]">{selectedLink.bandwidthMbps} Mbps</span>
                  </div>
                </div>
              </div>
            ) : selectedNode ? (
              <div className="p-3 rounded-lg bg-[#111E2D] border border-[#172638] space-y-2">
                <div className="text-[10px] text-[#35D5E8] font-bold">INSPECTED NODE ROUTING</div>
                <div className="text-sm font-bold text-[#EDF4FA]">{selectedNode.id} ({selectedNode.callsign})</div>
                <div className="space-y-1 text-[11px] pt-1 border-t border-[#172638]">
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">IP Address:</span>
                    <span className="text-[#35D5E8]">{selectedNode.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Hops to Gateway:</span>
                    <span className="text-[#EDF4FA]">{selectedNode.hopCountToGateway} Hops</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#92A4B8]">Max RF Range:</span>
                    <span className="text-[#EDF4FA]">{selectedNode.maxRangeKm} km</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Routing Table Snapshot */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#64768B] uppercase font-bold">ACTIVE MESH ROUTING TABLE</div>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {links.map((link) => (
                  <div
                    key={link.id}
                    onClick={() => setSelectedLinkId(link.id)}
                    className="p-2 rounded bg-[#111E2D] hover:bg-[#172638] border border-[#172638] flex items-center justify-between text-[11px] cursor-pointer"
                  >
                    <span className="text-[#EDF4FA] font-bold">{link.sourceId} ↔ {link.targetId}</span>
                    <span className="text-[#35D5E8]">{link.quality}%</span>
                    <span className="text-[#92A4B8]">{link.latencyMs}ms</span>
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
