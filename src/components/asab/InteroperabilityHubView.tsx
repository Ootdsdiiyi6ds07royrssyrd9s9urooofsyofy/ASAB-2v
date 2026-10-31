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
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title & Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#9a6a3a]" />
            <span>{isArabic ? 'منصة التشغيل البيني والتكامل المشترك' : 'SOVEREIGN INTEROPERABILITY HUB'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'مواءمة بروتوكولات الاتصال المختلفة (STANAG، Link-16، MAVLink) مع بروتوكول عَصَب السيادي.'
              : 'Multi-platform tactical protocol adapters bridging fixed-wing, multirotor, ground vehicles, and orbital assets.'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold transition-colors"
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
            className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[#f6ecdd] text-sm">{plat.name}</div>
                <div className="text-[10px] text-[#9a6a3a]">{plat.platformType}</div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  plat.status === 'Connected'
                    ? 'bg-[#8fc46a]/20 text-[#8fc46a]'
                    : plat.status === 'Standby'
                    ? 'bg-[#f5b82e]/20 text-[#f5b82e]'
                    : 'bg-[#e8584a]/20 text-[#e8584a]'
                }`}
              >
                {plat.status}
              </span>
            </div>

            {/* Protocol & Adapter Details */}
            <div className="space-y-1.5 p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#b9a58c]">Protocol Adapter:</span>
                <span className="text-[#f6ecdd] font-bold truncate max-w-[150px]">{plat.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b9a58c]">Compatibility:</span>
                <span className="text-[#8fc46a]">{plat.compatibility} Interoperable</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b9a58c]">Adapter Latency:</span>
                <span className="text-[#f6ecdd]">{plat.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b9a58c]">Telemetry Rate:</span>
                <span className="text-[#9a6a3a]">{plat.dataRateKbps} Kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b9a58c]">Heartbeat:</span>
                <span className="text-[#8c7860]">{plat.lastHeartbeat}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-[#32261b]">
              <button
                onClick={() => togglePlatformStatus(plat.id)}
                className="px-2.5 py-1 rounded bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] text-[10px] text-[#f6ecdd]"
              >
                {plat.status === 'Connected' ? 'Disconnect' : 'Connect'}
              </button>
              <button
                onClick={() => removePlatform(plat.id)}
                className="p-1 rounded bg-[#e8584a]/10 hover:bg-[#e8584a]/20 text-[#e8584a] border border-[#e8584a]/30"
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
        <div className="fixed inset-0 z-50 bg-[#120e0a]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-5 rounded-xl bg-[#1a140e] border border-[#9a6a3a]/40 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#32261b]">
              <div className="text-sm font-bold text-[#9a6a3a]">دمج موائم المنصة</div>
              <button onClick={() => setModalOpen(false)} className="text-[#b9a58c]">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#b9a58c] mb-1">اسم المنصة</label>
                <input
                  type="text"
                  placeholder="e.g. Tactical Escort Drone 4"
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  className="w-full p-2 rounded bg-[#231a12] border border-[#32261b] text-[#f6ecdd] focus:outline-none focus:border-[#9a6a3a]"
                />
              </div>

              <div>
                <label className="block text-[#b9a58c] mb-1">فئة المنصة</label>
                <select
                  value={newPlatformType}
                  onChange={(e) => setNewPlatformType(e.target.value as any)}
                  className="w-full p-2 rounded bg-[#231a12] border border-[#32261b] text-[#f6ecdd]"
                >
                  <option value="Fixed-Wing">Fixed-Wing Strategic Drone</option>
                  <option value="VTOL UAV">طائرة VTOL ذاتية القيادة</option>
                  <option value="Multirotor">Multirotor Tactical Quad</option>
                  <option value="Mobile GCS">Mobile Ground Control Unit</option>
                  <option value="Tactical Vehicle">Armored Tactical Vehicle</option>
                  <option value="Satellite Gateway">LEO Orbital Cross-Link</option>
                </select>
              </div>

              <div>
                <label className="block text-[#b9a58c] mb-1">موائم البروتوكول</label>
                <select
                  value={newProtocol}
                  onChange={(e) => setNewProtocol(e.target.value)}
                  className="w-full p-2 rounded bg-[#231a12] border border-[#32261b] text-[#f6ecdd]"
                >
                  <option value="STANAG-7085 CDL Bridge">STANAG-7085 CDL Bridge</option>
                  <option value="شبكة البيانات التكتيكية Link-16">شبكة البيانات التكتيكية Link-16</option>
                  <option value="MAVLink v2 / Sovereign Encapsulation">MAVLink v2 / Sovereign Encapsulation</option>
                  <option value="ASAB-Mesh-v3 (Native Sovereign)">ASAB-Mesh-v3 (Native Sovereign)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#32261b]">
              <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded bg-[#231a12] text-[#b9a58c]">
                CANCEL
              </button>
              <button onClick={handleAdd} className="px-4 py-1.5 rounded bg-[#9a6a3a] text-[#120e0a] font-bold">
                CONNECT PLATFORM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
