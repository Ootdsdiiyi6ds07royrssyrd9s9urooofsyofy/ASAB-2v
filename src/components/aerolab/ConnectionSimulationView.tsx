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
    {
      id: 'battery',
      name: isArabic ? 'حزمة بطاريات الحالة الصلبة' : 'Solid-State Battery Pack',
      type: 'Power',
      voltage: '50.4 V',
      current: '18.4 A',
      status: 'Nominal',
      x: 80,
      y: 160,
    },
    {
      id: 'pdb',
      name: isArabic ? 'وحدة توزيع الطاقة المركزية' : 'Power Distribution Unit',
      type: 'Power',
      voltage: '50.4 V / 24 V / 12 V',
      current: '18.4 A',
      status: 'Nominal',
      x: 260,
      y: 160,
    },
    {
      id: 'fc',
      name: isArabic ? 'حاسوب الطيران وموجّه الشبكة' : 'ASAB Flight Controller & Mesh Router',
      type: 'Logic',
      voltage: '12.0 V',
      current: '2.5 A',
      status: 'Nominal',
      x: 440,
      y: 160,
    },
    {
      id: 'imu_sensors',
      name: isArabic ? 'مستشعرات القصور الذاتي المزدوجة' : 'Triple Redundant IMU & Sensors',
      type: 'Sensor',
      voltage: '5.0 V',
      current: '0.4 A',
      status: 'Nominal',
      x: 440,
      y: 40,
    },
    {
      id: 'rf_mesh',
      name: isArabic ? 'هوائيات الربط اللاسلكي السيادية' : 'Sovereign RF Transceiver Array',
      type: 'RF',
      voltage: '12.0 V',
      current: '3.2 A',
      status: 'Nominal',
      x: 620,
      y: 80,
    },
    {
      id: 'gimbal',
      name: isArabic ? 'كاميرا الرصد الكهروضوئية EO/IR' : 'EO/IR 3-Axis Gimbal Pod',
      type: 'Sensor',
      voltage: '24.0 V',
      current: '1.4 A',
      status: 'Nominal',
      x: 620,
      y: 240,
    },
    {
      id: 'vtol_esc_1',
      name: isArabic ? 'متحكم ومحرك الإقلاع العمودي 1' : 'VTOL ESC & Motor 1 (Fwd Port)',
      type: 'Actuator',
      voltage: '50.4 V',
      current: '14.2 A',
      status: 'Nominal',
      x: 260,
      y: 320,
    },
    {
      id: 'pusher_esc',
      name: isArabic ? 'محرك الدفع الأفقي Cruise Pusher' : 'Cruise Pusher ESC & Motor',
      type: 'Actuator',
      voltage: '50.4 V',
      current: '8.5 A',
      status: 'Nominal',
      x: 440,
      y: 320,
    },
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
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#f5b82e]" />
            <span>{isArabic ? 'محاكاة الدوائر الكهربائية والأنظمة الفرعية' : 'AVIONICS SUBSYSTEMS & POWER BUS LAB'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'مخطط تفاعلي لتدفق الطاقة وإشارات التحكم الرقمية، مع إمكانية حقن الأعطال لمراقبة استجابة الأجهزة.'
              : 'Interactive electronic schematic tracing regulated DC rails, CAN bus telemetry, and hardware fault injection.'}
          </p>
        </div>

        {injectedFaultId && (
          <button
            onClick={() => setInjectedFaultId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8584a]/20 hover:bg-[#e8584a]/30 text-[#e8584a] border border-[#e8584a]/40 font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إلغاء حَقْن العطل' : 'CLEAR HARDWARE FAULT'}</span>
          </button>
        )}
      </div>

      {/* Main Schematic + Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schematic SVG Diagram (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#1a140e] border border-[#32261b] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#32261b]">
            <span className="font-bold text-[#f6ecdd]">
              {isArabic ? 'مخطط مسارات الطاقة وحافلة البيانات CAN' : 'INTERACTIVE AVIONICS BUS SCHEMATIC'}
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-[#f5b82e] inline-block" /> {isArabic ? 'خط الطاقة (DC)' : 'Power Bus'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-[#9a6a3a] inline-block" /> {isArabic ? 'حافلة البيانات (CAN)' : 'CAN / Data Bus'}
              </span>
            </div>
          </div>

          <div className="relative w-full h-[400px] bg-[#120e0a] rounded-xl border border-[#32261b] overflow-hidden flex items-center justify-center p-2">
            <svg className="w-full h-full max-w-[700px] max-h-[380px]" viewBox="0 0 740 380">
              {/* Power lines */}
              <line x1="150" y1="180" x2="260" y2="180" stroke="#f5b82e" strokeWidth="3" />
              <line x1="330" y1="180" x2="440" y2="180" stroke="#f5b82e" strokeWidth="2.5" />
              <line x1="300" y1="210" x2="300" y2="320" stroke="#f5b82e" strokeWidth="3" />
              <line x1="370" y1="200" x2="480" y2="320" stroke="#f5b82e" strokeWidth="2.5" />
              <line x1="510" y1="180" x2="620" y2="240" stroke="#f5b82e" strokeWidth="2" />

              {/* Data / CAN lines */}
              <line x1="470" y1="140" x2="470" y2="70" stroke="#9a6a3a" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="510" y1="160" x2="620" y2="100" stroke="#9a6a3a" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="470" y1="210" x2="470" y2="320" stroke="#9a6a3a" strokeWidth="2" strokeDasharray="4 2" />

              {/* Subsystem Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedSubsystemId === node.id;
                const isFault = node.status === 'Fault';
                const isOffline = node.status === 'Offline';

                const borderCol = isFault ? '#e8584a' : isOffline ? '#8c7860' : isSelected ? '#9a6a3a' : '#32261b';
                const fillCol = isFault ? '#2a1115' : isSelected ? '#32261b' : '#1a140e';

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
                      fill={isFault ? '#e8584a' : isOffline ? '#8c7860' : '#f6ecdd'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="IBM Plex Sans Arabic, monospace"
                      textAnchor="middle"
                    >
                      {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
                    </text>
                    <text
                      y="14"
                      fill={isFault ? '#e8584a' : '#9a6a3a'}
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.voltage} • {isArabic ? (node.status === 'Nominal' ? 'سليم' : node.status === 'Fault' ? 'عطل' : 'متوقف') : node.status}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Subsystem Inspector & Fault Injector */}
        <div className="p-5 rounded-2xl bg-[#1a140e] border border-[#32261b] flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#32261b]">
              <div className="text-[10px] text-[#9a6a3a] font-bold">
                {isArabic ? 'الوحدة الإلكترونية المحددة' : 'SELECTED AVIONICS UNIT'}
              </div>
              <div className="text-base font-bold text-[#f6ecdd] font-sans">{selectedNode.name}</div>
              <div className="text-[10px] text-[#8c7860]">ID: {selectedNode.id}</div>
            </div>

            {/* Electrical Parameters */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#8c7860] uppercase font-bold">
                {isArabic ? 'المواصفات التشغيلية الحالية' : 'OPERATING SPECIFICATIONS'}
              </div>
              <div className="p-3 rounded-lg bg-[#231a12] border border-[#32261b] space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#b9a58c]">{isArabic ? 'فئة النظام الفرعي:' : 'Subsystem Class:'}</span>
                  <span className="text-[#f6ecdd] font-bold">{selectedNode.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9a58c]">{isArabic ? 'جهد التشغيل:' : 'Bus Voltage:'}</span>
                  <span className="text-[#9a6a3a] font-bold">{selectedNode.voltage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9a58c]">{isArabic ? 'الحمل الحالي:' : 'Current Load:'}</span>
                  <span className="text-[#f5b82e] font-bold">{selectedNode.current}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9a58c]">{isArabic ? 'الحالة التشغيلية:' : 'Operating State:'}</span>
                  <span
                    className={`font-bold ${
                      selectedNode.status === 'Nominal'
                        ? 'text-[#8fc46a]'
                        : selectedNode.status === 'Fault'
                        ? 'text-[#e8584a]'
                        : 'text-[#8c7860]'
                    }`}
                  >
                    {isArabic
                      ? (selectedNode.status === 'Nominal' ? 'سليم (اسمِي)' : selectedNode.status === 'Fault' ? 'عَطَل نشط' : 'غير متصل')
                      : selectedNode.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Fault Injection Button */}
            <div className="p-3 rounded-lg bg-[#231a12] border border-[#32261b] space-y-2">
              <div className="text-[10px] text-[#e8584a] font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isArabic ? 'محاكي حقن الأعطال التجريبي' : 'FAULT INJECTION SIMULATOR'}</span>
              </div>
              <p className="text-[10px] text-[#b9a58c] font-sans">
                {isArabic
                  ? 'محاكاة انهيار فجائي أو دارة قصر على هذا الخط لتقييم حماية العزل التدريجي للشبكة الكهربائية.'
                  : 'Simulate sudden component failure or short circuit on this rail to evaluate cascade protection.'}
              </p>
              <button
                onClick={() => handleToggleFault(selectedNode.id)}
                className={`w-full py-1.5 rounded text-xs font-bold transition-colors ${
                  injectedFaultId === selectedNode.id
                    ? 'bg-[#8fc46a] text-[#120e0a]'
                    : 'bg-[#e8584a]/20 hover:bg-[#e8584a]/30 text-[#e8584a] border border-[#e8584a]/40'
                }`}
              >
                {injectedFaultId === selectedNode.id
                  ? (isArabic ? 'استعادة الوحدة وتصفير العطل' : 'RESTORE COMPONENT')
                  : (isArabic ? 'حقن عطل كهربائي في الوحدة' : 'INJECT BUS FAULT')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
