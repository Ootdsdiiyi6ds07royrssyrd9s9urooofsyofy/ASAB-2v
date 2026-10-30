/**
 * ASAB | AEROLAB 3D - 3D Aircraft Studio & Engineering Disassembly
 * Complete 3D aircraft inspection, exploded CAD view, camera presets,
 * collapsible component tree, technical inspector, and unobstructed 3D viewport.
 */

import React, { useState } from 'react';
import {
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  Weight,
  Sparkles,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { AircraftStudio3DCanvas } from '../3d/AircraftStudio3DCanvas';
import { useSimulation } from '../../context/SimulationContext';

export const AircraftStudioView: React.FC = () => {
  const {
    components,
    selectedComponentId,
    selectComponent,
    settings,
  } = useSimulation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTreeOpen, setIsTreeOpen] = useState<boolean>(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);

  const isArabic = settings.language === 'ar';
  const selectedComponent = components.find((c) => c.id === selectedComponentId);

  const filteredComponents = components.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  });

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-[#080D16] font-mono text-xs select-none overflow-hidden relative" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* 1. Left Collapsible Component Tree Panel */}
      {isTreeOpen ? (
        <aside className="w-72 bg-[#0D1623] border-e border-[#172638] flex flex-col justify-between shrink-0 z-10 overflow-hidden transition-all duration-300">
          {/* Search & Header */}
          <div className="p-3 border-b border-[#172638] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#EDF4FA]">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#35D5E8]" />
                <span>{isArabic ? 'شجرة مكونات الطائرة' : 'COMPONENT HIERARCHY'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#35D5E8] px-1.5 py-0.5 rounded bg-[#111E2D]">
                  {components.length}
                </span>
                <button
                  onClick={() => setIsTreeOpen(false)}
                  className="p-1 rounded text-[#92A4B8] hover:text-[#EDF4FA] hover:bg-[#172638] transition-colors cursor-pointer"
                  title={isArabic ? 'طي القائمة' : 'Collapse tree'}
                >
                  {isArabic ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick button to view entire assembled aircraft */}
            <button
              onClick={() => selectComponent('')}
              className={`w-full py-1.5 px-2 rounded-md text-[11px] flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                !selectedComponentId
                  ? 'bg-[#35D5E8]/20 text-[#35D5E8] border-[#35D5E8]'
                  : 'bg-[#111E2D] text-[#92A4B8] border-[#172638] hover:border-[#35D5E8]/40 hover:text-[#EDF4FA]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#35D5E8]" />
              <span>{isArabic ? 'عرض الطائرة كاملة (تجميع)' : 'View Full Aircraft'}</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-[#64768B]" />
              <input
                type="text"
                placeholder={isArabic ? 'بحث في أجزاء الطائرة...' : 'Search components...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-8 pe-2.5 py-1.5 rounded bg-[#111E2D] border border-[#172638] text-[11px] text-[#EDF4FA] focus:outline-none focus:border-[#35D5E8]"
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
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-start transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#172638] text-[#35D5E8] border border-[#35D5E8]/40 font-bold'
                      : 'text-[#92A4B8] hover:bg-[#111E2D] hover:text-[#EDF4FA]'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate text-xs">{isArabic ? comp.nameAr : comp.name}</div>
                    <div className="text-[10px] text-[#64768B]">{comp.category} • {comp.massKg} kg</div>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#35D5E8]' : 'bg-[#172638]'}`} />
                </button>
              );
            })}
          </div>

          {/* Model info footer */}
          <div className="p-3 border-t border-[#172638] bg-[#0A101A] text-[10px] text-[#64768B] flex justify-between">
            <span>ASAB-V100 VTOL</span>
            <span>48.2 kg Gross MTOW</span>
          </div>
        </aside>
      ) : (
        <button
          onClick={() => setIsTreeOpen(true)}
          className="absolute top-4 start-4 z-30 p-2 rounded-md bg-[#0D1623]/90 border border-[#172638] text-[#92A4B8] hover:text-[#35D5E8] shadow-lg transition-colors cursor-pointer"
          title={isArabic ? 'فتح شجرة المكونات' : 'Open tree'}
        >
          <Layers className="w-4 h-4" />
        </button>
      )}

      {/* 2. Central 3D Aircraft Studio Viewport */}
      <main className="flex-1 relative h-full w-full overflow-hidden">
        <AircraftStudio3DCanvas />
      </main>

      {/* 3. Right Technical Component Inspector */}
      {selectedComponent && isInspectorOpen && (
        <aside className="w-80 bg-[#0D1623] border-s border-[#172638] p-4 flex flex-col justify-between overflow-y-auto shrink-0 z-10 space-y-4 transition-all duration-300">
          <div className="space-y-4">
            {/* Component Title & Close Button */}
            <div className="pb-3 border-b border-[#172638] flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] text-[#35D5E8] font-bold tracking-wider uppercase">
                  {selectedComponent.category}
                </div>
                <div className="text-base font-bold text-[#EDF4FA] font-sans">
                  {isArabic ? selectedComponent.nameAr : selectedComponent.name}
                </div>
                <div className="text-[10px] text-[#64768B]">{selectedComponent.id}</div>
              </div>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="p-1 rounded text-[#92A4B8] hover:text-[#EDF4FA] hover:bg-[#172638] transition-colors cursor-pointer"
                title={isArabic ? 'إخفاء لوحة المواصفات' : 'Hide Inspector'}
              >
                {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Description & Function */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-[#64768B] uppercase font-bold">
                {isArabic ? 'الوصف الهندسي' : 'DESCRIPTION'}
              </div>
              <p className="text-[11px] text-[#92A4B8] font-sans leading-relaxed">
                {selectedComponent.description}
              </p>
            </div>

            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
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

          {/* Quick Action: Deselect to view all */}
          <div className="pt-3 border-t border-[#172638]">
            <button
              onClick={() => selectComponent('')}
              className="w-full py-2 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[#35D5E8] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isArabic ? 'عرض الطائرة كاملة' : 'Show Full Aircraft'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* Floating button to restore inspector when collapsed */}
      {selectedComponent && !isInspectorOpen && (
        <button
          onClick={() => setIsInspectorOpen(true)}
          className="absolute top-4 end-4 z-30 p-2 rounded-md bg-[#0D1623]/90 border border-[#172638] text-[#92A4B8] hover:text-[#35D5E8] shadow-lg transition-colors cursor-pointer"
          title={isArabic ? 'فتح لوحة المواصفات' : 'Open Inspector'}
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
