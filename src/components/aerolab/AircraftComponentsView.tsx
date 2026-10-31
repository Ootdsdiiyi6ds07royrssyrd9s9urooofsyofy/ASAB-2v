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
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#b5793f]" />
            <span>{isArabic ? 'مكتبة مكونات ومنظومات الطائرة' : 'AIRCRAFT SUBSYSTEMS & COMPONENT CATALOG'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'المواصفات الفنية، توزيع الكتل، متطلبات الطاقة الكهربائية، وتوصيف أجزاء طائرة ASAB-V100 VTOL.'
              : 'Detailed engineering specifications, mass properties, power budget, and modular subsystem architecture.'}
          </p>
        </div>

        {/* Mass Budget & Power Summary Pills */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#1a140e] border border-[#32261b] flex items-center gap-2">
            <Weight className="w-4 h-4 text-[#9a6a3a]" />
            <div>
              <div className="text-[10px] text-[#8c7860]">{isArabic ? 'الكتلة الإجمالية' : 'TOTAL MASS'}</div>
              <div className="text-sm font-bold text-[#f6ecdd]">{totalMass.toFixed(1)} {isArabic ? 'كغ' : 'kg'}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#1a140e] border border-[#32261b] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#f5b82e]" />
            <div>
              <div className="text-[10px] text-[#8c7860]">{isArabic ? 'استهلاك الطاقة الأقصى' : 'PEAK POWER'}</div>
              <div className="text-sm font-bold text-[#f6ecdd]">{totalPower} {isArabic ? 'واط' : 'W'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7860]" />
          <input
            type="text"
            placeholder={isArabic ? 'ابحث عن المكون بالاسم أو الوظيفة أو الموقع...' : 'Search subsystems by name, function, or spec...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1a140e] border border-[#32261b] text-[#f6ecdd] placeholder-[#8c7860] focus:outline-none focus:border-[#9a6a3a]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedCat === cat
                  ? 'bg-[#b5793f] text-[#f6ecdd] font-bold'
                  : 'bg-[#1a140e] text-[#b9a58c] hover:text-[#f6ecdd] border border-[#32261b]'
              }`}
            >
              {cat === 'all'
                ? (isArabic ? 'جميع الأنظمة' : 'All Subsystems')
                : isArabic
                ? (cat === 'Airframe' ? 'الهيكل الجوي' : cat === 'Propulsion' ? 'الدفع والمحركات' : cat === 'Avionics' ? 'إلكترونيات الطيران' : cat === 'Energy' ? 'الطاقة والبطاريات' : cat === 'Payload & Sensors' ? 'الحمولة والمستشعرات' : 'التحكم بالطيران')
                : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((comp) => (
          <div
            key={comp.id}
            className="p-4 rounded-xl bg-[#1a140e] border border-[#32261b] hover:border-[#b5793f]/40 transition-colors space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] text-[#b5793f] font-bold uppercase">{comp.category}</div>
                  <h3 className="text-sm font-bold text-[#f6ecdd] font-sans">
                    {isArabic ? comp.nameAr : comp.name}
                  </h3>
                  <div className="text-[10px] text-[#8c7860]">{comp.location}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comp.status === 'Operational'
                      ? 'bg-[#8fc46a]/20 text-[#8fc46a]'
                      : comp.status === 'Standby'
                      ? 'bg-[#b5793f]/20 text-[#b5793f]'
                      : comp.status === 'Warning'
                      ? 'bg-[#f5b82e]/20 text-[#f5b82e]'
                      : 'bg-[#e8584a]/20 text-[#e8584a]'
                  }`}
                >
                  {isArabic
                    ? (comp.status === 'Operational'
                        ? 'تشغيلي سليم'
                        : comp.status === 'Standby'
                        ? 'جاهزية احتياط'
                        : comp.status === 'Warning'
                        ? 'تنبيه مراقبة'
                        : 'صيانة مطلوبة')
                    : comp.status}
                </span>
              </div>

              <p className="text-[11px] text-[#b9a58c] font-sans leading-relaxed line-clamp-2">
                {comp.description}
              </p>

              {/* Specs Grid */}
              <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#b9a58c]">{isArabic ? 'الكتلة:' : 'Mass:'}</span>
                  <span className="text-[#f6ecdd] font-bold">{comp.massKg} {isArabic ? 'كغ' : 'kg'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9a58c]">{isArabic ? 'استهلاك الطاقة:' : 'Power Draw:'}</span>
                  <span className="text-[#f5b82e] font-bold">{comp.powerDrawWatts} {isArabic ? 'واط' : 'W'}</span>
                </div>
                {Object.entries(comp.specs).slice(0, 2).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[#b9a58c]">{k}:</span>
                    <span className="text-[#9a6a3a] truncate max-w-[140px]">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                selectComponent(comp.id);
                navigateToModule('aircraft-studio', 'aerolab');
              }}
              className="w-full py-1.5 rounded-lg bg-[#231a12] hover:bg-[#b5793f] hover:text-[#f6ecdd] text-[#b5793f] border border-[#32261b] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isArabic ? 'معاينة في الاستوديو ثلاثي الأبعاد' : 'Inspect in 3D Studio'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
