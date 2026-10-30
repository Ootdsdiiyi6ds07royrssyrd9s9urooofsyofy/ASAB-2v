/**
 * ASAB | AEROLAB 3D - 3D Aircraft Studio & Engineering Disassembly
 * Complete 3D aircraft inspection, exploded CAD view, camera presets, synchronized component tree, and technical inspector.
 */

import React, { useState } from 'react';
import {
  Box,
  Layers,
  Search,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Compass,
  Ruler,
  Grid,
  Zap,
  Weight,
} from 'lucide-react';
import { AircraftStudio3DCanvas } from '../3d/AircraftStudio3DCanvas';
import { useSimulation } from '../../context/SimulationContext';

export const AircraftStudioView: React.FC = () => {
  const {
    components,
    selectedComponentId,
    selectComponent,
    explodeFactor,
    setExplodeFactor,
    cameraPreset,
    setCameraPreset,
    settings,
  } = useSimulation();

  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [isolatedMode, setIsolatedMode] = useState<boolean>(false);
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isArabic = settings.language === 'ar';
  const selectedComponent = components.find((c) => c.id === selectedComponentId) || components[0];

  const filteredComponents = components.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  });

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-[#080D16] font-mono text-xs select-none overflow-hidden relative">
      {/* Left Synchronized Component Tree Panel */}
      <aside className="w-72 bg-[#0D1623] border-r border-[#172638] flex flex-col justify-between shrink-0 z-10 overflow-hidden">
        {/* Search & Header */}
        <div className="p-3 border-b border-[#172638] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#EDF4FA]">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#35D5E8]" />
              <span>{isArabic ? 'شجرة مكونات الطائرة' : 'COMPONENT HIERARCHY'}</span>
            </div>
            <span className="text-[10px] text-[#35D5E8] px-1.5 py-0.2 rounded bg-[#111E2D]">
              {components.length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64768B]" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded bg-[#111E2D] border border-[#172638] text-[11px] text-[#EDF4FA] focus:outline-none focus:border-[#35D5E8]"
            />
          </div>
        </div>

        {/* Scrollable Component List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredComponents.map((comp) => {
            const isSelected = selectedComponent?.id === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => selectComponent(comp.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-[#172638] text-[#35D5E8] border border-[#35D5E8]/40 font-bold'
                    : 'text-[#92A4B8] hover:bg-[#111E2D] hover:text-[#EDF4FA]'
                }`}
              >
                <div className="truncate">
                  <div className="truncate text-xs">{isArabic ? comp.nameAr : comp.name}</div>
                  <div className="text-[10px] text-[#64768B]">{comp.category} • {comp.massKg} kg</div>
                </div>

                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    comp.status === 'Operational' ? 'bg-[#3DDC97]' : 'bg-[#F5B82E]'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Total Airframe Specs Summary */}
        <div className="p-3 border-t border-[#172638] bg-[#0D1623] text-[10px] space-y-1 text-[#92A4B8]">
          <div className="flex justify-between">
            <span>Airframe Model:</span>
            <span className="text-[#35D5E8] font-bold">ASAB-V100 VTOL</span>
          </div>
          <div className="flex justify-between">
            <span>Total Dry Mass:</span>
            <span className="text-[#EDF4FA]">
              {components.reduce((acc, c) => acc + c.massKg, 0).toFixed(1)} kg
            </span>
          </div>
        </div>
      </aside>

      {/* Main 3D Viewport with Bottom Dock */}
      <main className="flex-1 relative h-full overflow-hidden">
        <AircraftStudio3DCanvas
          showGrid={showGrid}
          showWireframe={showWireframe}
          isolatedMode={isolatedMode}
          measurementMode={measurementMode}
        />

        {/* Unified Bottom Ergonomic Control Dock (Three.js skill directive) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl select-none">
          {/* Collapse/Expand Toggle Tab */}
          <div className="flex justify-center -mb-px">
            <button
              onClick={() => setDockCollapsed(!dockCollapsed)}
              className="px-4 py-1 rounded-t-lg bg-[#0D1623]/95 border-t border-x border-[#172638] text-[10px] font-mono text-[#92A4B8] hover:text-[#35D5E8] flex items-center gap-1 shadow-lg"
            >
              {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>
                {dockCollapsed
                  ? isArabic ? 'فتح لوحة التحكم ثلاثية الأبعاد (H)' : 'EXPAND STUDIO CONTROLS (H)'
                  : isArabic ? 'طي لوحة التحكم' : 'COLLAPSE DOCK'}
              </span>
            </button>
          </div>

          {!dockCollapsed && (
            <div className="p-3.5 rounded-xl bg-[#0D1623]/95 border border-[#172638] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Exploded View Slider and Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                <span className="text-[10px] text-[#35D5E8] font-bold tracking-wider shrink-0 uppercase">
                  {isArabic ? 'تفكيك الأجزاء' : 'EXPLODED VIEW'}
                </span>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodeFactor}
                  onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                  className="w-full appearance-none h-1.5 rounded-full bg-[#111E2D] accent-[#35D5E8] cursor-pointer"
                  aria-label="Exploded View Separation Factor"
                />

                <span className="text-xs font-bold text-[#EDF4FA] shrink-0 w-10 text-right">
                  {Math.round(explodeFactor * 100)}%
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setExplodeFactor(0)}
                    className="px-2.5 py-1 rounded bg-[#111E2D] hover:bg-[#172638] text-[10px] text-[#92A4B8] hover:text-[#EDF4FA] border border-[#172638] transition-colors"
                  >
                    {isArabic ? 'تجميع' : 'Assemble'}
                  </button>
                  <button
                    onClick={() => setExplodeFactor(1)}
                    className="px-2.5 py-1 rounded bg-[#111E2D] hover:bg-[#172638] text-[10px] text-[#35D5E8] border border-[#172638] font-bold transition-colors"
                  >
                    {isArabic ? 'تفكيك' : 'Explode'}
                  </button>
                </div>
              </div>

              {/* Camera Presets */}
              <div className="flex items-center gap-1 shrink-0 border-t md:border-t-0 md:border-l border-[#172638] pt-2 md:pt-0 md:pl-3">
                <span className="text-[10px] text-[#64768B] mr-1 hidden xl:inline">
                  {isArabic ? 'الكاميرا:' : 'CAMERA:'}
                </span>
                {[
                  { id: 'iso', label: 'ISO', labelAr: 'منظور' },
                  { id: 'front', label: 'FRONT', labelAr: 'أمامي' },
                  { id: 'side', label: 'SIDE', labelAr: 'جانبي' },
                  { id: 'top', label: 'TOP', labelAr: 'علوي' },
                  { id: 'bottom', label: 'BOTTOM', labelAr: 'سفلي' },
                  { id: 'reset', label: 'RESET', labelAr: 'إعادة' },
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setCameraPreset(view.id as any)}
                    className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors ${
                      cameraPreset === view.id
                        ? 'bg-[#35D5E8] text-[#080D16] font-bold'
                        : 'bg-[#111E2D] text-[#92A4B8] hover:text-[#EDF4FA] border border-[#172638]'
                    }`}
                  >
                    {isArabic ? view.labelAr : view.label}
                  </button>
                ))}
              </div>

              {/* Viewport Display Toggles */}
              <div className="flex items-center gap-1 shrink-0 border-t md:border-t-0 md:border-l border-[#172638] pt-2 md:pt-0 md:pl-3">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded transition-colors ${
                    showGrid ? 'bg-[#35D5E8]/20 text-[#35D5E8]' : 'text-[#64768B]'
                  }`}
                  title={isArabic ? 'تبديل الشبكة الأرضية' : 'Toggle Grid Floor'}
                  aria-label={isArabic ? 'تبديل الشبكة الأرضية' : 'Toggle Grid Floor'}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMeasurementMode(!measurementMode)}
                  className={`p-1.5 rounded transition-colors ${
                    measurementMode ? 'bg-[#35D5E8]/20 text-[#35D5E8]' : 'text-[#64768B]'
                  }`}
                  title={isArabic ? 'تبديل أبعاد القياس' : 'Toggle Dimensions & Measurement Mode'}
                  aria-label={isArabic ? 'تبديل أبعاد القياس' : 'Toggle Dimensions & Measurement Mode'}
                >
                  <Ruler className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowWireframe(!showWireframe)}
                  className={`p-1.5 rounded transition-colors ${
                    showWireframe ? 'bg-[#35D5E8]/20 text-[#35D5E8]' : 'text-[#64768B]'
                  }`}
                  title={isArabic ? 'تبديل العرض السلكي CAD' : 'Toggle Wireframe CAD Mode'}
                  aria-label={isArabic ? 'تبديل العرض السلكي CAD' : 'Toggle Wireframe CAD Mode'}
                >
                  <Box className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsolatedMode(!isolatedMode)}
                  className={`px-2 py-1 rounded text-[10px] transition-colors ${
                    isolatedMode ? 'bg-[#35D5E8] text-[#080D16] font-bold' : 'text-[#92A4B8] border border-[#172638]'
                  }`}
                  title={isArabic ? 'عزل المكون المختار' : 'Isolate Selected Component'}
                >
                  {isolatedMode
                    ? isArabic ? 'معزول' : 'ISOLATED'
                    : isArabic ? 'عزل' : 'ISOLATE'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Technical Component Inspector */}
      {selectedComponent && (
        <aside className="w-80 bg-[#0D1623] border-l border-[#172638] p-4 flex flex-col justify-between overflow-y-auto shrink-0 z-10 space-y-4">
          <div className="space-y-4">
            {/* Component Title */}
            <div className="pb-3 border-b border-[#172638]">
              <div className="text-[10px] text-[#35D5E8] font-bold tracking-wider uppercase">
                {selectedComponent.category}
              </div>
              <div className="text-base font-bold text-[#EDF4FA] font-sans">
                {isArabic ? selectedComponent.nameAr : selectedComponent.name}
              </div>
              <div className="text-[10px] text-[#64768B]">{selectedComponent.id}</div>
            </div>

            {/* Description & Function */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#64768B] uppercase font-bold">
                {isArabic ? 'الوصف الهندسي' : 'DESCRIPTION'}
              </div>
              <p className="text-[11px] text-[#92A4B8] font-sans leading-relaxed">
                {selectedComponent.description}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-[#64768B] uppercase font-bold">
                {isArabic ? 'الوظيفة الأساسية' : 'PRIMARY FUNCTION'}
              </div>
              <p className="text-[11px] text-[#EDF4FA] font-sans leading-relaxed p-2.5 rounded-lg bg-[#111E2D] border border-[#172638]">
                {selectedComponent.functionDesc}
              </p>
            </div>

            {/* Physical Specs & Energy Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] flex items-center gap-2">
                <Weight className="w-4 h-4 text-[#35D5E8]" />
                <div>
                  <div className="text-[10px] text-[#64768B]">{isArabic ? 'الكتلة' : 'MASS'}</div>
                  <div className="font-bold text-[#EDF4FA]">{selectedComponent.massKg} {isArabic ? 'كجم' : 'kg'}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F5B82E]" />
                <div>
                  <div className="text-[10px] text-[#64768B]">{isArabic ? 'استهلاك الطاقة' : 'POWER'}</div>
                  <div className="font-bold text-[#EDF4FA]">{selectedComponent.powerDrawWatts} {isArabic ? 'واط' : 'W'}</div>
                </div>
              </div>
            </div>

            {/* Technical Specifications Key-Values */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#64768B] uppercase font-bold">
                {isArabic ? 'المواصفات الفنية' : 'ENGINEERING PARAMETERS'}
              </div>
              <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] space-y-1.5 text-[11px]">
                {Object.entries(selectedComponent.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[#92A4B8]">{k.replace('_', ' ')}:</span>
                    <span className="text-[#EDF4FA] font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-3 border-t border-[#172638] space-y-2">
            <button
              onClick={() => setIsolatedMode(!isolatedMode)}
              className="w-full py-2 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[#EDF4FA] text-xs font-bold transition-colors"
            >
              {isolatedMode
                ? isArabic ? 'عرض كافة المكونات' : 'SHOW ALL COMPONENTS'
                : isArabic ? 'عزل هذا المكون فقط' : 'ISOLATE THIS COMPONENT'}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
