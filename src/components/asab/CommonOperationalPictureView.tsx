/**
 * ASAB | AEROLAB 3D - Common Operational Picture (COP)
 * Unified tactical view with top-down / 3D airspace toggle, layered overlays, and live synchronized telemetry.
 */

import React, { useState } from 'react';
import {
  Crosshair,
  Layers,
  MapPin,
  Eye,
  Shield,
  Wifi,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { Airspace3DCanvas } from '../3d/Airspace3DCanvas';
import { useSimulation } from '../../context/SimulationContext';

export const CommonOperationalPictureView: React.FC = () => {
  const {
    nodes,
    links,
    selectedNodeId,
    selectNode,
    groundStation,
    settings,
    updateSettings,
    navigateToModule,
  } = useSimulation();

  const [viewPerspective, setViewPerspective] = useState<'3d' | 'topdown'>('3d');
  const isArabic = settings.language === 'ar';
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#080D16] select-none font-mono text-xs overflow-hidden">
      {/* COP Filter & Tactical Controls Bar */}
      <div className="h-12 bg-[#0D1623] border-b border-[#172638] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#EDF4FA]">
            <Crosshair className="w-4 h-4 text-[#35D5E8]" />
            <span>{isArabic ? 'المشهد العملياتي المشترك (COP)' : 'COMMON OPERATIONAL PICTURE'}</span>
          </div>

          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#080D16] border border-[#172638]">
            <button
              onClick={() => setViewPerspective('3d')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewPerspective === '3d'
                  ? 'bg-[#35D5E8] text-[#080D16] font-bold'
                  : 'text-[#92A4B8] hover:text-[#EDF4FA]'
              }`}
            >
              3D PERSPECTIVE
            </button>
            <button
              onClick={() => setViewPerspective('topdown')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewPerspective === 'topdown'
                  ? 'bg-[#35D5E8] text-[#080D16] font-bold'
                  : 'text-[#92A4B8] hover:text-[#EDF4FA]'
              }`}
            >
              TOP-DOWN TACTICAL MAP
            </button>
          </div>
        </div>

        {/* Tactical Layer Filters */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#92A4B8] hover:text-[#EDF4FA]">
            <input
              type="checkbox"
              checked={settings.showNetworkLayer}
              onChange={(e) => updateSettings({ showNetworkLayer: e.target.checked })}
              className="accent-[#35D5E8] rounded"
            />
            <span>Mesh Links</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#92A4B8] hover:text-[#EDF4FA]">
            <input
              type="checkbox"
              checked={settings.showCoverageLayer}
              onChange={(e) => updateSettings({ showCoverageLayer: e.target.checked })}
              className="accent-[#35D5E8] rounded"
            />
            <span>Coverage Cells</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#92A4B8] hover:text-[#EDF4FA]">
            <input
              type="checkbox"
              checked={settings.showLabels}
              onChange={(e) => updateSettings({ showLabels: e.target.checked })}
              className="accent-[#35D5E8] rounded"
            />
            <span>ID Labels</span>
          </label>
        </div>
      </div>

      {/* Main COP Area: 3D Airspace + Bottom Tactical Table */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Airspace Viewport */}
        <div className="flex-1 relative">
          <Airspace3DCanvas viewMode={viewPerspective} />

          {/* Synchronized Selected Target HUD Box */}
          {selectedNode && (
            <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#0D1623]/90 border border-[#35D5E8]/30 backdrop-blur-md shadow-xl text-xs space-y-1.5 pointer-events-none max-w-xs">
              <div className="text-[10px] text-[#35D5E8] font-bold tracking-wider">LOCKED TARGET TELEMETRY</div>
              <div className="text-sm font-bold text-[#EDF4FA]">{selectedNode.id} ({selectedNode.callsign})</div>
              <div className="text-[11px] text-[#92A4B8]">{selectedNode.role} • {selectedNode.type}</div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#172638] text-[11px]">
                <div>Alt: <span className="text-[#35D5E8] font-bold">{selectedNode.telemetry.altitude}m</span></div>
                <div>Spd: <span className="text-[#35D5E8] font-bold">{selectedNode.telemetry.airspeed} km/h</span></div>
                <div>Hdg: <span className="text-[#EDF4FA]">{selectedNode.telemetry.heading}°</span></div>
                <div>Bat: <span className="text-[#3DDC97]">{selectedNode.telemetry.batteryPercent}%</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Tactical Grid Table */}
        <div className="h-48 bg-[#0D1623] border-t border-[#172638] p-3 flex flex-col shrink-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 text-[11px] text-[#92A4B8]">
            <span className="font-bold text-[#EDF4FA]">SYNCHRONIZED AIRSPACE FLEET MATRIX ({nodes.length} UNITS)</span>
            <span>GCS BASE: {groundStation.callsign} ({groundStation.status})</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#64768B] border-b border-[#172638] pb-1">
                  <th className="py-1">NODE ID</th>
                  <th>CALLSIGN</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>ALTITUDE</th>
                  <th>SPEED</th>
                  <th>HEADING</th>
                  <th>SIGNAL</th>
                  <th>BATTERY</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172638]">
                {nodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <tr
                      key={node.id}
                      onClick={() => selectNode(node.id)}
                      className={`hover:bg-[#111E2D] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#172638] text-[#35D5E8]' : 'text-[#EDF4FA]'
                      }`}
                    >
                      <td className="py-1.5 font-bold">{node.id}</td>
                      <td>{node.callsign}</td>
                      <td>{node.role}</td>
                      <td>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            node.status === 'Active'
                              ? 'bg-[#3DDC97]/20 text-[#3DDC97]'
                              : node.status === 'Standby'
                              ? 'bg-[#F5B82E]/20 text-[#F5B82E]'
                              : 'bg-[#FF5964]/20 text-[#FF5964]'
                          }`}
                        >
                          {node.status}
                        </span>
                      </td>
                      <td className="text-[#35D5E8]">{node.telemetry.altitude} m</td>
                      <td>{node.telemetry.airspeed} km/h</td>
                      <td>{node.telemetry.heading}°</td>
                      <td>{node.telemetry.signalStrength} dBm</td>
                      <td className="text-[#3DDC97]">{node.telemetry.batteryPercent}%</td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectNode(node.id);
                            navigateToModule('aircraft-studio', 'aerolab');
                          }}
                          className="px-2 py-0.5 rounded bg-[#111E2D] hover:bg-[#35D5E8] hover:text-[#080D16] border border-[#172638] text-[10px] transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
