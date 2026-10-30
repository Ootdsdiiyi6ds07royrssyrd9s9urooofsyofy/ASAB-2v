/**
 * ASAB | AEROLAB 3D - Sovereign Interoperability Hub
 * Protocol translation adapters, multi-platform integrations, and gateway bridges.
 */

import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { PlatformIntegration } from '../../types';

export const InteroperabilityHubView: React.FC = () => {
  const { platforms, addPlatform, removePlatform, togglePlatformStatus, settings } = useSimulation();
  const [modalOpen, setModalOpen] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformType, setNewPlatformType] = useState<PlatformIntegration['platformType']>('Fixed-Wing');
  const [newProtocol, setNewProtocol] = useState('STANAG-7085 CDL Bridge');

  const isArabic = settings.language === 'ar';

  const handleAdd = () => {
    if (!newPlatformName.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;

    addPlatform({
      id: `plat_${Date.now()}`,
      name: newPlatformName,
      platformType: newPlatformType,
      protocol: newProtocol,
      status: 'Connected',
      compatibility: 'Full',
      latencyMs: 18,
      dataRateKbps: 2400,
      lastHeartbeat: timeStr,
    });
    setNewPlatformName('');
    setModalOpen(false);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title & Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#35D5E8]" />
            <span>{isArabic ? 'منصة التشغيل البيني والتكامل المشترك' : 'SOVEREIGN INTEROPERABILITY HUB'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
            {isArabic
              ? 'مواءمة بروتوكولات الاتصال المختلفة (STANAG، Link-16، MAVLink) مع بروتوكول عَصَب السيادي.'
              : 'Multi-platform tactical protocol adapters bridging fixed-wing, multirotor, ground vehicles, and orbital assets.'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#35D5E8] hover:bg-[#28c5d8] text-[#080D16] font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'ربط منصة جديدة' : 'INTEGRATE PLATFORM'}</span>
        </button>
      </div>

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {platforms.map((plat) => (
          <div
            key={plat.id}
            className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#EDF4FA] text-sm">{plat.name}</div>
                <div className="text-[10px] text-[#35D5E8]">{plat.platformType}</div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  plat.status === 'Connected'
                    ? 'bg-[#3DDC97]/20 text-[#3DDC97]'
                    : plat.status === 'Standby'
                    ? 'bg-[#F5B82E]/20 text-[#F5B82E]'
                    : 'bg-[#FF5964]/20 text-[#FF5964]'
                }`}
              >
                {plat.status}
              </span>
            </div>

            {/* Protocol & Adapter Details */}
            <div className="space-y-1.5 p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#92A4B8]">Protocol Adapter:</span>
                <span className="text-[#EDF4FA] font-bold truncate max-w-[150px]">{plat.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#92A4B8]">Compatibility:</span>
                <span className="text-[#3DDC97]">{plat.compatibility} Interoperable</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#92A4B8]">Adapter Latency:</span>
                <span className="text-[#EDF4FA]">{plat.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#92A4B8]">Telemetry Rate:</span>
                <span className="text-[#35D5E8]">{plat.dataRateKbps} Kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#92A4B8]">Heartbeat:</span>
                <span className="text-[#64768B]">{plat.lastHeartbeat}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-[#172638]">
              <button
                onClick={() => togglePlatformStatus(plat.id)}
                className="px-2.5 py-1 rounded bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[10px] text-[#EDF4FA]"
              >
                {plat.status === 'Connected' ? 'Disconnect' : 'Connect'}
              </button>
              <button
                onClick={() => removePlatform(plat.id)}
                className="p-1 rounded bg-[#FF5964]/10 hover:bg-[#FF5964]/20 text-[#FF5964] border border-[#FF5964]/30"
                title="Remove Integration"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Integrate Platform Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#080D16]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-5 rounded-xl bg-[#0D1623] border border-[#35D5E8]/40 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#172638]">
              <div className="text-sm font-bold text-[#35D5E8]">INTEGRATE PLATFORM ADAPTER</div>
              <button onClick={() => setModalOpen(false)} className="text-[#92A4B8]">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#92A4B8] mb-1">PLATFORM NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Tactical Escort Drone 4"
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  className="w-full p-2 rounded bg-[#111E2D] border border-[#172638] text-[#EDF4FA] focus:outline-none focus:border-[#35D5E8]"
                />
              </div>

              <div>
                <label className="block text-[#92A4B8] mb-1">PLATFORM CATEGORY</label>
                <select
                  value={newPlatformType}
                  onChange={(e) => setNewPlatformType(e.target.value as any)}
                  className="w-full p-2 rounded bg-[#111E2D] border border-[#172638] text-[#EDF4FA]"
                >
                  <option value="Fixed-Wing">Fixed-Wing Strategic Drone</option>
                  <option value="VTOL UAV">VTOL Autonomous Aircraft</option>
                  <option value="Multirotor">Multirotor Tactical Quad</option>
                  <option value="Mobile GCS">Mobile Ground Control Unit</option>
                  <option value="Tactical Vehicle">Armored Tactical Vehicle</option>
                  <option value="Satellite Gateway">LEO Orbital Cross-Link</option>
                </select>
              </div>

              <div>
                <label className="block text-[#92A4B8] mb-1">PROTOCOL ADAPTER</label>
                <select
                  value={newProtocol}
                  onChange={(e) => setNewProtocol(e.target.value)}
                  className="w-full p-2 rounded bg-[#111E2D] border border-[#172638] text-[#EDF4FA]"
                >
                  <option value="STANAG-7085 CDL Bridge">STANAG-7085 CDL Bridge</option>
                  <option value="Link-16 Tactical Data Network">Link-16 Tactical Data Network</option>
                  <option value="MAVLink v2 / Sovereign Encapsulation">MAVLink v2 / Sovereign Encapsulation</option>
                  <option value="ASAB-Mesh-v3 (Native Sovereign)">ASAB-Mesh-v3 (Native Sovereign)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#172638]">
              <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded bg-[#111E2D] text-[#92A4B8]">
                CANCEL
              </button>
              <button onClick={handleAdd} className="px-4 py-1.5 rounded bg-[#35D5E8] text-[#080D16] font-bold">
                CONNECT PLATFORM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
