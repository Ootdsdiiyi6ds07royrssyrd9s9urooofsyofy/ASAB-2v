/**
 * ASAB | AEROLAB 3D - Aircraft Components Catalog
 * Detailed technical specifications, mass properties, and system hierarchy.
 */

import React, { useState } from 'react';
import {
  Layers,
  Search,
  ExternalLink,
  Zap,
  Weight,
  Shield,
  Filter,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const AircraftComponentsView: React.FC = () => {
  const { components, selectComponent, navigateToModule, settings } = useSimulation();
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isArabic = settings.language === 'ar';

  const categories = [
    'all',
    'Airframe',
    'Propulsion',
    'Avionics',
    'Energy',
    'Payload & Sensors',
    'Flight Control',
  ];

  const filtered = components.filter((c) => {
    if (selectedCat !== 'all' && c.category !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    }
    return true;
  });

  const totalMass = components.reduce((acc, c) => acc + c.massKg, 0);
  const totalPower = components.reduce((acc, c) => acc + c.powerDrawWatts, 0);

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#5587FF]" />
            <span>{isArabic ? 'مكتبة مكونات ومنظومات الطائرة' : 'AIRCRAFT SUBSYSTEMS & COMPONENT CATALOG'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
            {isArabic
              ? 'المواصفات الفنية، توزيع الكتل، متطلبات الطاقة الكهربائية، وتوصيف أجزاء طائرة ASAB-V100 VTOL.'
              : 'Detailed engineering specifications, mass properties, power budget, and modular subsystem architecture.'}
          </p>
        </div>

        {/* Mass Budget & Power Summary Pills */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#0D1623] border border-[#172638] flex items-center gap-2">
            <Weight className="w-4 h-4 text-[#35D5E8]" />
            <div>
              <div className="text-[10px] text-[#64768B]">TOTAL MASS</div>
              <div className="text-sm font-bold text-[#EDF4FA]">{totalMass.toFixed(1)} kg</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0D1623] border border-[#172638] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F5B82E]" />
            <div>
              <div className="text-[10px] text-[#64768B]">PEAK POWER</div>
              <div className="text-sm font-bold text-[#EDF4FA]">{totalPower} W</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64768B]" />
          <input
            type="text"
            placeholder="Search subsystems by name, function, or spec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0D1623] border border-[#172638] text-[#EDF4FA] placeholder-[#64768B] focus:outline-none focus:border-[#35D5E8]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedCat === cat
                  ? 'bg-[#5587FF] text-[#EDF4FA] font-bold'
                  : 'bg-[#0D1623] text-[#92A4B8] hover:text-[#EDF4FA] border border-[#172638]'
              }`}
            >
              {cat === 'all' ? 'All Subsystems' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((comp) => (
          <div
            key={comp.id}
            className="p-4 rounded-xl bg-[#0D1623] border border-[#172638] hover:border-[#5587FF]/40 transition-colors space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] text-[#5587FF] font-bold uppercase">{comp.category}</div>
                  <h3 className="text-sm font-bold text-[#EDF4FA] font-sans">
                    {isArabic ? comp.nameAr : comp.name}
                  </h3>
                  <div className="text-[10px] text-[#64768B]">{comp.location}</div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DDC97]/20 text-[#3DDC97]">
                  {comp.status}
                </span>
              </div>

              <p className="text-[11px] text-[#92A4B8] font-sans leading-relaxed line-clamp-2">
                {comp.description}
              </p>

              {/* Specs Grid */}
              <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#92A4B8]">Mass:</span>
                  <span className="text-[#EDF4FA] font-bold">{comp.massKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#92A4B8]">Power Draw:</span>
                  <span className="text-[#F5B82E] font-bold">{comp.powerDrawWatts} W</span>
                </div>
                {Object.entries(comp.specs).slice(0, 2).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[#92A4B8]">{k}:</span>
                    <span className="text-[#35D5E8] truncate max-w-[140px]">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                selectComponent(comp.id);
                navigateToModule('aircraft-studio', 'aerolab');
              }}
              className="w-full py-1.5 rounded-lg bg-[#111E2D] hover:bg-[#5587FF] hover:text-[#EDF4FA] text-[#5587FF] border border-[#172638] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect in 3D Studio</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
