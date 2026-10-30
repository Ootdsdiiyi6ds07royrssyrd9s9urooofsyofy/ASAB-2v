/**
 * ASAB | AEROLAB 3D - Connection & Avionics Subsystems Laboratory
 * Interactive wiring diagram showing power flow, telemetry buses, and fault injection.
 */

import React, { useState } from 'react';
import {
  Zap,
  Cpu,
  Radio,
  Battery,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

interface AvionicsNode {
  id: string;
  name: string;
  type: 'Power' | 'Logic' | 'Actuator' | 'Sensor' | 'RF';
  voltage: string;
  current: string;
  status: 'Nominal' | 'Fault' | 'Offline';
  x: number;
  y: number;
}

export const ConnectionSimulationView: React.FC = () => {
  const { settings } = useSimulation();
  const isArabic = settings.language === 'ar';

  const [selectedSubsystemId, setSelectedSubsystemId] = useState<string>('battery');
  const [injectedFaultId, setInjectedFaultId] = useState<string | null>(null);

  const initialNodes: AvionicsNode[] = [
    { id: 'battery', name: 'Solid-State Battery Pack', type: 'Power', voltage: '50.4 V', current: '18.4 A', status: 'Nominal', x: 80, y: 160 },
    { id: 'pdb', name: 'Power Distribution Unit', type: 'Power', voltage: '50.4 V / 24 V / 12 V', current: '18.4 A', status: 'Nominal', x: 260, y: 160 },
    { id: 'fc', name: 'ASAB Flight Controller & Mesh Router', type: 'Logic', voltage: '12.0 V', current: '2.5 A', status: 'Nominal', x: 440, y: 160 },
    { id: 'imu_sensors', name: 'Triple Redundant IMU & Sensors', type: 'Sensor', voltage: '5.0 V', current: '0.4 A', status: 'Nominal', x: 440, y: 40 },
    { id: 'rf_mesh', name: 'Sovereign RF Transceiver Array', type: 'RF', voltage: '12.0 V', current: '3.2 A', status: 'Nominal', x: 620, y: 80 },
    { id: 'gimbal', name: 'EO/IR 3-Axis Gimbal Pod', type: 'Sensor', voltage: '24.0 V', current: '1.4 A', status: 'Nominal', x: 620, y: 240 },
    { id: 'vtol_esc_1', name: 'VTOL ESC & Motor 1 (Fwd Port)', type: 'Actuator', voltage: '50.4 V', current: '14.2 A', status: 'Nominal', x: 260, y: 320 },
    { id: 'pusher_esc', name: 'Cruise Pusher ESC & Motor', type: 'Actuator', voltage: '50.4 V', current: '8.5 A', status: 'Nominal', x: 440, y: 320 },
  ];

  const nodes = initialNodes.map((n) => {
    if (injectedFaultId === n.id) {
      return { ...n, status: 'Fault' as const };
    }
    if (injectedFaultId === 'battery' && n.id !== 'battery') {
      return { ...n, status: 'Offline' as const };
    }
    if (injectedFaultId === 'pdb' && n.id !== 'battery' && n.id !== 'pdb') {
      return { ...n, status: 'Offline' as const };
    }
    return n;
  });

  const selectedNode = nodes.find((n) => n.id === selectedSubsystemId) || nodes[0];

  const handleToggleFault = (id: string) => {
    if (injectedFaultId === id) setInjectedFaultId(null);
    else setInjectedFaultId(id);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F5B82E]" />
            <span>{isArabic ? 'محاكاة الدوائر الكهربائية والأنظمة الفرعية' : 'AVIONICS SUBSYSTEMS & POWER BUS LAB'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
            {isArabic
              ? 'مخطط تفاعلي لتدفق الطاقة وإشارات التحكم الرقمية، مع إمكانية حقن الأعطال لمراقبة استجابة الأجهزة.'
              : 'Interactive electronic schematic tracing regulated DC rails, CAN bus telemetry, and hardware fault injection.'}
          </p>
        </div>

        {injectedFaultId && (
          <button
            onClick={() => setInjectedFaultId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5964]/20 hover:bg-[#FF5964]/30 text-[#FF5964] border border-[#FF5964]/40 font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>CLEAR HARDWARE FAULT</span>
          </button>
        )}
      </div>

      {/* Main Schematic + Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schematic SVG Diagram (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#172638]">
            <span className="font-bold text-[#EDF4FA]">INTERACTIVE AVIONICS BUS SCHEMATIC</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#F5B82E] inline-block" /> Power Bus</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#35D5E8] inline-block" /> CAN / Data Bus</span>
            </div>
          </div>

          <div className="relative w-full h-[400px] bg-[#080D16] rounded-xl border border-[#172638] overflow-hidden flex items-center justify-center p-2">
            <svg className="w-full h-full max-w-[700px] max-h-[380px]" viewBox="0 0 740 380">
              {/* Power lines */}
              <line x1="150" y1="180" x2="260" y2="180" stroke="#F5B82E" strokeWidth="3" />
              <line x1="330" y1="180" x2="440" y2="180" stroke="#F5B82E" strokeWidth="2.5" />
              <line x1="300" y1="210" x2="300" y2="320" stroke="#F5B82E" strokeWidth="3" />
              <line x1="370" y1="200" x2="480" y2="320" stroke="#F5B82E" strokeWidth="2.5" />
              <line x1="510" y1="180" x2="620" y2="240" stroke="#F5B82E" strokeWidth="2" />

              {/* Data / CAN lines */}
              <line x1="470" y1="140" x2="470" y2="70" stroke="#35D5E8" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="510" y1="160" x2="620" y2="100" stroke="#35D5E8" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="470" y1="210" x2="470" y2="320" stroke="#35D5E8" strokeWidth="2" strokeDasharray="4 2" />

              {/* Subsystem Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedSubsystemId === node.id;
                const isFault = node.status === 'Fault';
                const isOffline = node.status === 'Offline';

                const borderCol = isFault ? '#FF5964' : isOffline ? '#64768B' : isSelected ? '#35D5E8' : '#172638';
                const fillCol = isFault ? '#2a1115' : isSelected ? '#172638' : '#0D1623';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedSubsystemId(node.id)}
                    className="cursor-pointer"
                  >
                    <rect
                      x="-65"
                      y="-25"
                      width="130"
                      height="50"
                      rx="8"
                      fill={fillCol}
                      stroke={borderCol}
                      strokeWidth={isSelected || isFault ? '2' : '1'}
                    />
                    <text
                      y="-5"
                      fill={isFault ? '#FF5964' : isOffline ? '#64768B' : '#EDF4FA'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
                    </text>
                    <text
                      y="14"
                      fill={isFault ? '#FF5964' : '#35D5E8'}
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.voltage} • {node.status}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Subsystem Inspector & Fault Injector */}
        <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#172638]">
              <div className="text-[10px] text-[#35D5E8] font-bold">SELECTED AVIONICS UNIT</div>
              <div className="text-base font-bold text-[#EDF4FA] font-sans">{selectedNode.name}</div>
              <div className="text-[10px] text-[#64768B]">ID: {selectedNode.id}</div>
            </div>

            {/* Electrical Parameters */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#64768B] uppercase font-bold">OPERATING SPECIFICATIONS</div>
              <div className="p-3 rounded-lg bg-[#111E2D] border border-[#172638] space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#92A4B8]">Subsystem Class:</span>
                  <span className="text-[#EDF4FA] font-bold">{selectedNode.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#92A4B8]">Bus Voltage:</span>
                  <span className="text-[#35D5E8] font-bold">{selectedNode.voltage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#92A4B8]">Current Load:</span>
                  <span className="text-[#F5B82E] font-bold">{selectedNode.current}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#92A4B8]">Operating State:</span>
                  <span
                    className={`font-bold ${
                      selectedNode.status === 'Nominal'
                        ? 'text-[#3DDC97]'
                        : selectedNode.status === 'Fault'
                        ? 'text-[#FF5964]'
                        : 'text-[#64768B]'
                    }`}
                  >
                    {selectedNode.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Fault Injection Button */}
            <div className="p-3 rounded-lg bg-[#111E2D] border border-[#172638] space-y-2">
              <div className="text-[10px] text-[#FF5964] font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>FAULT INJECTION SIMULATOR</span>
              </div>
              <p className="text-[10px] text-[#92A4B8] font-sans">
                Simulate sudden component failure or short circuit on this rail to evaluate cascade protection.
              </p>
              <button
                onClick={() => handleToggleFault(selectedNode.id)}
                className={`w-full py-1.5 rounded text-xs font-bold transition-colors ${
                  injectedFaultId === selectedNode.id
                    ? 'bg-[#3DDC97] text-[#080D16]'
                    : 'bg-[#FF5964]/20 hover:bg-[#FF5964]/30 text-[#FF5964] border border-[#FF5964]/40'
                }`}
              >
                {injectedFaultId === selectedNode.id ? 'RESTORE COMPONENT' : 'INJECT BUS FAULT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
