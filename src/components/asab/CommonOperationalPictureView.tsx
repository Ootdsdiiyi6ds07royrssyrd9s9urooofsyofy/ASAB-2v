/**
 * ASAB | AEROLAB 3D - Common Operational Picture (COP) / Virtual Training Arena
 * Unified tactical view featuring armored units, command facilities, strategic roads, and interactive safe abstract military simulation events.
 */

import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  Layers,
  MapPin,
  Eye,
  EyeOff,
  Shield,
  Wifi,
  Navigation,
  ExternalLink,
  ShieldAlert,
  Truck,
  Radio,
  Play,
  Pause,
  RotateCcw,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { Airspace3DCanvas } from '../3d/Airspace3DCanvas';
import { useSimulation } from '../../context/SimulationContext';
import { useAssets } from '../../context/AssetContext';
import type { AircraftNode } from '../../types';

const trainingMapPoints = [
  { x: 18, y: 28 },
  { x: 34, y: 62 },
  { x: 52, y: 35 },
  { x: 66, y: 70 },
  { x: 82, y: 42 },
  { x: 74, y: 20 },
];

type ImportedRoute = { points: Array<{ x: number; y: number; label?: string }> };

function parseImportedRoutes(text: string): ImportedRoute | null {
  try {
    const parsed = JSON.parse(text);
    const features = parsed?.type === 'FeatureCollection' ? parsed.features : Array.isArray(parsed) ? parsed : [parsed];
    const points: ImportedRoute['points'] = [];
    features.forEach((feature: any) => {
      const geometry = feature?.geometry ?? feature;
      const coords = geometry?.type === 'LineString' ? geometry.coordinates : geometry?.type === 'Point' ? [geometry.coordinates] : feature?.points;
      if (!Array.isArray(coords)) return;
      coords.forEach((pair: any) => { if (Array.isArray(pair) && pair.length >= 2) points.push({ x: Number(pair[0]), y: Number(pair[1]), label: feature?.properties?.name }); });
    });
    return points.length ? { points } : null;
  } catch {
    const points = text.split(/\r?\n/).slice(1).map((line) => line.split(',')).map(([x, y, ...label]) => ({ x: Number(x), y: Number(y), label: label.join(',') })).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    return points.length ? { points } : null;
  }
}

const TrainingMap: React.FC<{
  nodes: AircraftNode[];
  selectedNodeId: string | null;
  selectNode: (id: string) => void;
  isArabic: boolean;
  trainingActive: boolean;
  convoyPatrolMode: boolean;
  defenseGridActive: boolean;
  importedRoutes?: ImportedRoute | null;
}> = ({ nodes, selectedNodeId, selectNode, isArabic, trainingActive, convoyPatrolMode, defenseGridActive, importedRoutes }) => (
  <div className="absolute inset-0 overflow-hidden bg-[#211d16]">
    <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label={isArabic ? 'خريطة ساحة التدريب الافتراضية' : 'Virtual training arena map'}>
      <defs>
        <pattern id="arena-grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M 42 0 L 0 0 0 42" fill="none" stroke="#8b785d" strokeOpacity=".13" strokeWidth="1" /></pattern>
        <linearGradient id="terrain" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2c3328" /><stop offset=".55" stopColor="#413a26" /><stop offset="1" stopColor="#251f18" /></linearGradient>
        <filter id="map-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="1000" height="620" fill="url(#terrain)" />
      {defenseGridActive && <rect width="1000" height="620" fill="url(#arena-grid)" />}
      <path d="M0 500 C180 420 270 500 390 430 S650 340 1000 450 L1000 620 L0 620Z" fill="#1b2a22" opacity=".6" />
      <path d="M0 120 C190 180 265 70 420 150 S700 235 1000 110" fill="none" stroke="#c5a26a" strokeOpacity=".12" strokeWidth="52" />
      <path d="M-20 520 C180 455 280 465 420 330 S700 150 1020 185" fill="none" stroke="#d4bd8b" strokeOpacity=".25" strokeWidth="7" />
      <path d="M-20 520 C180 455 280 465 420 330 S700 150 1020 185" fill="none" stroke="#473a28" strokeWidth="3" />
      <path d="M130 -20 C190 140 300 205 470 250 S720 430 860 650" fill="none" stroke="#d4bd8b" strokeOpacity=".2" strokeWidth="5" />
      <path d="M130 -20 C190 140 300 205 470 250 S720 430 860 650" fill="none" stroke="#473a28" strokeWidth="2" />
      <path d="M90 145 L260 75 L360 130 L290 220 Z" fill="#a87d40" fillOpacity=".12" stroke="#c5a26a" strokeOpacity=".35" strokeDasharray="8 6" />
      <path d="M630 330 L870 270 L945 430 L720 505 Z" fill="#739060" fillOpacity=".13" stroke="#9bb47f" strokeOpacity=".38" strokeDasharray="8 6" />
      <path d="M385 390 L550 320 L640 410 L500 505 Z" fill="#9b6949" fillOpacity=".12" stroke="#d0986e" strokeOpacity=".34" strokeDasharray="8 6" />
      <g fill="#e6cfa6" fillOpacity=".85"><circle cx="210" cy="175" r="5" /><circle cx="780" cy="375" r="5" /><circle cx="475" cy="415" r="5" /></g>
      <g fontFamily="Arial, sans-serif" fontSize="15" fill="#e6cfa6" opacity=".85"><text x="112" y="108">SECTOR A · التدريب الشمالي</text><text x="690" y="530">SECTOR C · ممر المناورة</text><text x="390" y="290">SECTOR B · المنطقة الآمنة</text></g>
      <g transform="translate(505 305)"><rect x="-45" y="-26" width="90" height="52" rx="8" fill="#1b1712" stroke="#e6cfa6" strokeWidth="2" /><path d="M-20 0 H20 M0 -14 V14" stroke="#e6cfa6" strokeWidth="3" /><text x="0" y="44" textAnchor="middle" fill="#f6ecdd" fontSize="13">قاعدة القيادة</text></g>
      {defenseGridActive && <g fill="none" stroke="#b5793f" strokeWidth="3" opacity=".7"><circle cx="505" cy="305" r="82" strokeDasharray="10 8" /><circle cx="505" cy="305" r="142" strokeDasharray="5 12" /></g>}
      {convoyPatrolMode && <g fill="none" stroke="#e0a653" strokeWidth="5" strokeDasharray="14 8" opacity=".85"><path d="M110 510 C250 450 310 455 420 350" /><path d="M870 500 C760 445 700 390 610 350" /><circle cx="210" cy="465" r="12" /><circle cx="790" cy="460" r="12" /></g>}
      {importedRoutes && <g fill="none" stroke="#8fc46a" strokeWidth="5" strokeDasharray="12 7" opacity=".9"><polyline points={importedRoutes.points.map((point) => `${point.x},${point.y}`).join(' ')} /></g>}
      {importedRoutes?.points.map((point, index) => <g key={`imported-${index}`} transform={`translate(${point.x} ${point.y})`}><circle r="8" fill="#e2c18f" stroke="#17130e" strokeWidth="3" /><text x="12" y="4" fill="#f6ecdd" fontSize="12">{point.label ?? `P-${index + 1}`}</text></g>)}
      {nodes.map((node, index) => {
        const point = trainingMapPoints[index % trainingMapPoints.length];
        const x = point.x * 10;
        const y = point.y * 6.2;
        const selected = node.id === selectedNodeId;
        return <g key={node.id} transform={`translate(${x} ${y})`} onClick={() => selectNode(node.id)} className="cursor-pointer">
          {selected && <circle r="25" fill="none" stroke="#e6cfa6" strokeWidth="2" opacity=".9" filter="url(#map-glow)" />}
          <circle r="11" fill={node.status === 'Active' ? '#8fc46a' : '#f5b82e'} stroke="#17130e" strokeWidth="4" className={trainingActive && node.status === 'Active' ? 'animate-pulse' : ''} />
          <path d="M0 -28 V-12 M-28 0 H-12 M12 0 H28 M0 12 V28" stroke="#e6cfa6" strokeOpacity=".55" />
          <rect x="16" y="-12" width="98" height="24" rx="5" fill="#17130e" fillOpacity=".9" stroke={selected ? '#e6cfa6' : '#60482c'} />
          <text x="24" y="4" fill="#f6ecdd" fontSize="12" fontWeight="700">{node.id}</text>
        </g>;
      })}
    </svg>
    <div className="absolute bottom-3 start-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#60482c] bg-[#17130e]/90 px-3 py-2 text-[10px] text-[#e6cfa6] backdrop-blur-md">
      <span className="font-bold text-[#f6ecdd]">{isArabic ? 'خريطة ميدان التدريب' : 'TRAINING ARENA MAP'}</span><span className={trainingActive ? 'text-[#8fc46a]' : 'text-[#f5b82e]'}>● {isArabic ? (trainingActive ? 'التدريب يعمل' : 'التدريب متوقف') : (trainingActive ? 'Training active' : 'Training paused')}</span><span className="text-[#f5b82e]">● {isArabic ? 'استعداد' : 'Standby'}</span>
    </div>
  </div>
);

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
  const { readTextAsset } = useAssets();

  const [viewPerspective, setViewPerspective] = useState<'3d' | 'topdown'>('topdown');
  const [trainingActive, setTrainingActive] = useState<boolean>(true);
  const [convoyPatrolMode, setConvoyPatrolMode] = useState<boolean>(true);
  const [defenseGridActive, setDefenseGridActive] = useState<boolean>(true);
  const [showTrainingMeasurements, setShowTrainingMeasurements] = useState<boolean>(true);
  const [importedRoutes, setImportedRoutes] = useState<ImportedRoute | null>(null);

  useEffect(() => {
    let cancelled = false;
    void readTextAsset('routes').then((text) => { if (!cancelled) setImportedRoutes(text ? parseImportedRoutes(text) : null); });
    return () => { cancelled = true; };
  }, [readTextAsset]);

  // Live simulation event log ticker
  const [tacticalEvents, setTacticalEvents] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'alert' | 'success' }>>([
    { id: '1', time: '12:00:10', text: 'تم بدء جلسة المحاكاة والتدريب الافتراضي للميدان العسكري بنجاح', type: 'success' },
    { id: '2', time: '12:00:45', text: 'تحرك رتل المدرعات على طول الطريق الاستراتيجي الشمالي (Sector A-1)', type: 'info' },
    { id: '3', time: '12:01:20', text: 'فحص محيط منشآت القيادة والسيطرة FOB-ALPHA: الحالة آمنة ومستقرة', type: 'success' },
    { id: '4', time: '12:02:00', text: 'تنبيه دفاعي تجريدي: رصد مناورة استطلاع طائرة مسيرة عبر الأجواء', type: 'alert' },
  ]);

  useEffect(() => {
    if (!trainingActive) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const sampleEvents = [
        { text: 'تحديث إحداثيات دورية المدرعات في قطاع التدريب الشمالي', type: 'info' as const },
        { text: 'فحص استجابة الرادار ومنشآت القيادة الثابتة: 100% متصل', type: 'success' as const },
        { text: 'محاكاة مناورة تفادي عوائق افتراضية لوحدة الاستطلاع الجوي', type: 'info' as const },
        { text: 'تنبيه دفاعي: اختبار مسار الاتصال المشفر للشبكة الحافية', type: 'alert' as const },
      ];
      const randomEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      setTacticalEvents((prev) => [
        { id: `evt_${Date.now()}`, time: timeStr, ...randomEvent },
        ...prev.slice(0, 15),
      ]);
    }, 6000);
    return () => clearInterval(interval);
  }, [trainingActive]);

  const isArabic = settings.language === 'ar';
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="h-full flex flex-col bg-[#120e0a] select-none font-mono text-xs overflow-hidden">
      {/* COP Filter & Virtual Training Arena Controls Bar */}
      <div className="min-h-14 bg-[#1a140e] border-b border-[#32261b] px-3 py-2 sm:px-4 sm:py-0 flex flex-wrap items-center justify-between shrink-0 z-10 gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#f6ecdd]">
            <Crosshair className="w-4 h-4 text-[#9a6a3a]" />
            <span className="truncate">{isArabic ? 'ساحة التدريب الافتراضية' : 'VIRTUAL TRAINING ARENA'}<span className="hidden sm:inline">{isArabic ? ' والمشهد العملياتي' : ' & COP'}</span></span>
          </div>

          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#120e0a] border border-[#32261b]">
            <button
              onClick={() => setViewPerspective('3d')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewPerspective === '3d'
                  ? 'bg-[#9a6a3a] text-[#120e0a] font-bold'
                  : 'text-[#b9a58c] hover:text-[#f6ecdd]'
              }`}
            >
              {isArabic ? 'منظور ثلاثي الأبعاد' : '3D PERSPECTIVE'}
            </button>
            <button
              onClick={() => setViewPerspective('topdown')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewPerspective === 'topdown'
                  ? 'bg-[#9a6a3a] text-[#120e0a] font-bold'
                  : 'text-[#b9a58c] hover:text-[#f6ecdd]'
              }`}
            >
              {isArabic ? 'خريطة علوية' : 'TOP-DOWN TACTICAL MAP'}
            </button>
          </div>
        </div>

        {/* Virtual Training Controls (Armored Vehicles, Facilities, Roads, Simulation) */}
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:gap-3">
          <button
            onClick={() => setTrainingActive(!trainingActive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              trainingActive
                ? 'bg-[#8fc46a]/20 text-[#8fc46a] border-[#8fc46a]/50'
                : 'bg-[#f5b82e]/20 text-[#f5b82e] border-[#f5b82e]/50'
            }`}
          >
            {trainingActive ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isArabic ? (trainingActive ? 'التدريب النشط' : 'متوقف مؤقتاً') : (trainingActive ? 'Training Active' : 'Paused')}</span>
          </button>

          <button
            onClick={() => setConvoyPatrolMode(!convoyPatrolMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              convoyPatrolMode ? 'bg-[#9a6a3a]/20 text-[#9a6a3a] border-[#9a6a3a]/50' : 'bg-[#231a12] text-[#b9a58c] border-[#32261b]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isArabic ? 'دوريات المدرعات' : 'Armored Convoy'}</span>
          </button>

          <button
            onClick={() => setDefenseGridActive(!defenseGridActive)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              defenseGridActive ? 'bg-[#b5793f]/20 text-[#b5793f] border-[#b5793f]/50' : 'bg-[#231a12] text-[#b9a58c] border-[#32261b]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isArabic ? 'منشآت القيادة والدفاع' : 'Command Facilities'}</span>
          </button>

          <button
            onClick={() => setShowTrainingMeasurements((value) => !value)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              showTrainingMeasurements ? 'bg-[#d8b98a]/15 text-[#d8b98a] border-[#d8b98a]/45' : 'bg-[#231a12] text-[#b9a58c] border-[#32261b]'
            }`}
            aria-pressed={showTrainingMeasurements}
          >
            {showTrainingMeasurements ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isArabic ? (showTrainingMeasurements ? 'إخفاء القياسات' : 'إظهار القياسات') : (showTrainingMeasurements ? 'Hide measurements' : 'Show measurements')}</span>
          </button>
        </div>

        {/* Tactical Layer Filters */}
        <div className="hidden xl:flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#b9a58c] hover:text-[#f6ecdd]">
            <input
              type="checkbox"
              checked={settings.showNetworkLayer}
              onChange={(e) => updateSettings({ showNetworkLayer: e.target.checked })}
              className="accent-[#9a6a3a] rounded"
            />
            <span>{isArabic ? 'روابط الشبكة' : 'Mesh Links'}</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#b9a58c] hover:text-[#f6ecdd]">
            <input
              type="checkbox"
              checked={settings.showCoverageLayer}
              onChange={(e) => updateSettings({ showCoverageLayer: e.target.checked })}
              className="accent-[#9a6a3a] rounded"
            />
            <span>{isArabic ? 'خلايا التغطية' : 'Coverage Cells'}</span>
          </label>
        </div>
      </div>

      {/* Main COP Area: 3D Airspace + Live Tactical Simulation Feed & Bottom Table */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Airspace Viewport */}
        <div className="flex-1 relative">
          {viewPerspective === '3d' ? (
            <Airspace3DCanvas
              viewMode={viewPerspective}
              trainingActive={trainingActive}
              convoyPatrolMode={convoyPatrolMode}
              defenseGridActive={defenseGridActive}
            />
          ) : <TrainingMap nodes={nodes} selectedNodeId={selectedNodeId} selectNode={selectNode} isArabic={isArabic} trainingActive={trainingActive} convoyPatrolMode={convoyPatrolMode} defenseGridActive={defenseGridActive} importedRoutes={importedRoutes} />}

          {/* Synchronized Selected Target HUD Box */}
          {selectedNode && showTrainingMeasurements && (
            <div className="absolute top-2 start-2 sm:top-4 sm:start-4 p-2.5 sm:p-3 rounded-xl bg-[#1a140e]/90 border border-[#9a6a3a]/30 backdrop-blur-md shadow-xl text-xs space-y-1.5 pointer-events-none max-w-[calc(100%-1rem)] sm:max-w-xs">
              <div className="text-[10px] text-[#9a6a3a] font-bold tracking-wider">قياسات وحدة التدريب الافتراضية</div>
              <div className="text-sm font-bold text-[#f6ecdd]">{selectedNode.id} ({selectedNode.callsign})</div>
              <div className="text-[11px] text-[#b9a58c]">{selectedNode.role} • {selectedNode.type}</div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#32261b] text-[11px]">
                <div>{isArabic ? 'الارتفاع' : 'Alt'}: <span className="text-[#9a6a3a] font-bold">{selectedNode.telemetry.altitude}m</span></div>
                <div>{isArabic ? 'السرعة' : 'Spd'}: <span className="text-[#9a6a3a] font-bold">{selectedNode.telemetry.airspeed} km/h</span></div>
                <div>{isArabic ? 'الاتجاه' : 'Hdg'}: <span className="text-[#f6ecdd]">{selectedNode.telemetry.heading}°</span></div>
                <div>{isArabic ? 'البطارية' : 'Bat'}: <span className="text-[#8fc46a]">{selectedNode.telemetry.batteryPercent}%</span></div>
              </div>
            </div>
          )}

          {/* Live Tactical Simulation Event Ticker Overlay (Top Right) */}
          <div className="hidden sm:block absolute top-4 end-4 w-80 max-w-[calc(100vw-1rem)] p-2.5 sm:p-3 rounded-xl bg-[#1a140e]/95 border border-[#9a6a3a]/40 backdrop-blur-md shadow-xl text-xs space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#32261b]">
              <div className="flex items-center gap-1.5 text-[#9a6a3a] font-bold">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{isArabic ? 'محاكاة الأحداث والإنذارات الدفاعية' : 'TACTICAL SIMULATION TICKER'}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#8fc46a] animate-ping" />
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {tacticalEvents.map((evt) => (
                <div key={evt.id} className="flex items-start gap-2 p-1.5 rounded bg-[#231a12] border border-[#32261b]">
                  <span className="text-[10px] text-[#8c7860] shrink-0">{evt.time}</span>
                  <span className={`flex-1 text-[11px] ${evt.type === 'alert' ? 'text-[#e8584a]' : evt.type === 'success' ? 'text-[#8fc46a]' : 'text-[#f6ecdd]'}`}>
                    {evt.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Tactical Grid Table */}
        <div className="h-48 bg-[#1a140e] border-t border-[#32261b] p-3 flex flex-col shrink-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 text-[11px] text-[#b9a58c]">
            <span className="font-bold text-[#f6ecdd]">{isArabic ? `أسطول التدريب والأصول (${nodes.length} وحدات + 12 رتلًا)` : `VIRTUAL TRAINING FLEET & ASSETS (${nodes.length} UNITS + 12 ARMORED CONVOYS)`}</span>
            <span>{isArabic ? 'قاعدة القيادة' : 'COMMAND BASE'}: {groundStation.callsign} ({groundStation.status})</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full min-w-[420px] text-start text-xs">
              <thead>
                <tr className="text-[#8c7860] border-b border-[#32261b] pb-1">
                  <th className="py-1">معرّف الوحدة</th>
                  <th>رمز النداء</th>
                  <th>الدور</th>
                  <th>الحالة</th>
                  <th>الارتفاع</th>
                  <th>السرعة</th>
                  <th>الاتجاه</th>
                  <th>الإشارة</th>
                  <th>البطارية</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#32261b]">
                {nodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <tr
                      key={node.id}
                      onClick={() => selectNode(node.id)}
                      className={`hover:bg-[#231a12] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#32261b] text-[#9a6a3a]' : 'text-[#f6ecdd]'
                      }`}
                    >
                      <td className="py-1.5 font-bold">{node.id}</td>
                      <td>{node.callsign}</td>
                      <td>{node.role}</td>
                      <td>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            node.status === 'Active'
                              ? 'bg-[#8fc46a]/20 text-[#8fc46a]'
                              : node.status === 'Standby'
                              ? 'bg-[#f5b82e]/20 text-[#f5b82e]'
                              : 'bg-[#e8584a]/20 text-[#e8584a]'
                          }`}
                        >
                          {node.status}
                        </span>
                      </td>
                      <td className="text-[#9a6a3a]">{node.telemetry.altitude} m</td>
                      <td>{node.telemetry.airspeed} km/h</td>
                      <td>{node.telemetry.heading}°</td>
                      <td>{node.telemetry.signalStrength} dBm</td>
                      <td className="text-[#8fc46a]">{node.telemetry.batteryPercent}%</td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectNode(node.id);
                            navigateToModule('aircraft-studio', 'aerolab');
                          }}
                          className="px-2 py-0.5 rounded bg-[#231a12] hover:bg-[#9a6a3a] hover:text-[#120e0a] border border-[#32261b] text-[10px] transition-colors"
                        >
                          {isArabic ? 'فحص' : 'Inspect'}
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
