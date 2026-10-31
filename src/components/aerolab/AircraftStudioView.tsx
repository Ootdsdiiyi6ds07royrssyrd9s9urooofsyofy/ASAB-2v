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
    <div className="h-full flex bg-[#120e0a] font-mono text-xs select-none overflow-hidden relative" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* 1. Left Collapsible Component Tree Panel */}
      {isTreeOpen ? (
        <aside className="absolute md:static inset-y-0 start-0 w-[85%] max-w-72 md:w-72 bg-[#1a140e] border-e border-[#32261b] flex flex-col justify-between shrink-0 z-20 overflow-hidden transition-all duration-300">
          {/* Search & Header */}
          <div className="p-3 border-b border-[#32261b] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#f6ecdd]">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#9a6a3a]" />
                <span>{isArabic ? 'شجرة مكونات الطائرة' : 'COMPONENT HIERARCHY'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#9a6a3a] px-1.5 py-0.5 rounded bg-[#231a12]">
                  {components.length}
                </span>
                <button
                  onClick={() => setIsTreeOpen(false)}
                  className="p-1 rounded text-[#b9a58c] hover:text-[#f6ecdd] hover:bg-[#32261b] transition-colors cursor-pointer"
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
                  ? 'bg-[#9a6a3a]/20 text-[#9a6a3a] border-[#9a6a3a]'
                  : 'bg-[#231a12] text-[#b9a58c] border-[#32261b] hover:border-[#9a6a3a]/40 hover:text-[#f6ecdd]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#9a6a3a]" />
              <span>{isArabic ? 'عرض الطائرة كاملة (تجميع)' : 'View Full Aircraft'}</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-[#8c7860]" />
              <input
                type="text"
                placeholder={isArabic ? 'بحث في أجزاء الطائرة...' : 'Search components...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-8 pe-2.5 py-1.5 rounded bg-[#231a12] border border-[#32261b] text-[11px] text-[#f6ecdd] focus:outline-none focus:border-[#9a6a3a]"
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
                      ? 'bg-[#32261b] text-[#9a6a3a] border border-[#9a6a3a]/40 font-bold'
                      : 'text-[#b9a58c] hover:bg-[#231a12] hover:text-[#f6ecdd]'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate text-xs">{isArabic ? comp.nameAr : comp.name}</div>
                    <div className="text-[10px] text-[#8c7860]">{comp.category} • {comp.massKg} kg</div>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#9a6a3a]' : 'bg-[#32261b]'}`} />
                </button>
              );
            })}
          </div>

          {/* Model info footer */}
          <div className="p-3 border-t border-[#32261b] bg-[#16120e] text-[10px] text-[#8c7860] flex justify-between">
            <span>ASAB-V100 VTOL</span>
            <span>48.2 kg Gross MTOW</span>
          </div>
        </aside>
      ) : (
        <button
          onClick={() => setIsTreeOpen(true)}
          className="absolute top-4 start-4 z-30 p-2 rounded-md bg-[#1a140e]/90 border border-[#32261b] text-[#b9a58c] hover:text-[#9a6a3a] shadow-lg transition-colors cursor-pointer"
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
        <aside className="absolute md:static inset-y-0 end-0 w-[88%] max-w-80 md:w-80 bg-[#1a140e] border-s border-[#32261b] p-4 flex flex-col justify-between overflow-y-auto shrink-0 z-20 space-y-4 transition-all duration-300">
          <div className="space-y-4">
            {/* Component Title & Close Button */}
            <div className="pb-3 border-b border-[#32261b] flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] text-[#9a6a3a] font-bold tracking-wider uppercase">
                  {selectedComponent.category}
                </div>
                <div className="text-base font-bold text-[#f6ecdd] font-sans">
                  {isArabic ? selectedComponent.nameAr : selectedComponent.name}
                </div>
                <div className="text-[10px] text-[#8c7860]">{selectedComponent.id}</div>
              </div>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="p-1 rounded text-[#b9a58c] hover:text-[#f6ecdd] hover:bg-[#32261b] transition-colors cursor-pointer"
                title={isArabic ? 'إخفاء لوحة المواصفات' : 'Hide Inspector'}
              >
                {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Description & Function */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-[#8c7860] uppercase font-bold">
                {isArabic ? 'الوصف الهندسي' : 'DESCRIPTION'}
              </div>
              <p className="text-[11px] text-[#b9a58c] font-sans leading-relaxed">
                {selectedComponent.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] text-[#8c7860] uppercase font-bold">
                {isArabic ? 'الوظيفة الأساسية' : 'PRIMARY FUNCTION'}
              </div>
              <p className="text-[11px] text-[#f6ecdd] font-sans leading-relaxed p-2.5 rounded-lg bg-[#231a12] border border-[#32261b]">
                {selectedComponent.functionDesc}
              </p>
            </div>

            {/* Physical Specs & Energy Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] flex items-center gap-2">
                <Weight className="w-4 h-4 text-[#9a6a3a]" />
                <div>
                  <div className="text-[10px] text-[#8c7860]">{isArabic ? 'الكتلة' : 'MASS'}</div>
                  <div className="font-bold text-[#f6ecdd]">{selectedComponent.massKg} {isArabic ? 'كجم' : 'kg'}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#f5b82e]" />
                <div>
                  <div className="text-[10px] text-[#8c7860]">{isArabic ? 'استهلاك الطاقة' : 'POWER'}</div>
                  <div className="font-bold text-[#f6ecdd]">{selectedComponent.powerDrawWatts} {isArabic ? 'واط' : 'W'}</div>
                </div>
              </div>
            </div>

            {/* Technical Specifications Key-Values */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-[#8c7860] uppercase font-bold">
                {isArabic ? 'المواصفات الفنية' : 'ENGINEERING PARAMETERS'}
              </div>
              <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] space-y-1.5 text-[11px]">
                {Object.entries(selectedComponent.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[#b9a58c]">{k.replace('_', ' ')}:</span>
                    <span className="text-[#f6ecdd] font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action: Deselect to view all */}
          <div className="pt-3 border-t border-[#32261b]">
            <button
              onClick={() => selectComponent('')}
              className="w-full py-2 rounded-lg bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] text-[#9a6a3a] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
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
          className="absolute top-4 end-4 z-30 p-2 rounded-md bg-[#1a140e]/90 border border-[#32261b] text-[#b9a58c] hover:text-[#9a6a3a] shadow-lg transition-colors cursor-pointer"
          title={isArabic ? 'فتح لوحة المواصفات' : 'Open Inspector'}
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
