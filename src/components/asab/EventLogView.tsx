/**
 * ASAB | AEROLAB 3D - System Event Log
 * Filterable and searchable event log capturing real-time state changes and security audit events.
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { EventCategory } from '../../types';

export const EventLogView: React.FC = () => {
  const { events, settings } = useSimulation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isArabic = settings.language === 'ar';

  const filteredEvents = events.filter((evt) => {
    if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.id.toLowerCase().includes(q) ||
        (evt.sourceNodeId && evt.sourceNodeId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = 'ID,Timestamp,Category,Severity,Title,Description,SourceNode\n';
    const rows = filteredEvents
      .map(
        (e) =>
          `"${e.id}","${e.timestamp}","${e.category}","${e.severity}","${e.title}","${e.description}","${e.sourceNodeId || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asab-events-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories: (EventCategory | 'all')[] = [
    'all',
    'Aircraft',
    'Network',
    'Ground Station',
    'Simulation',
    'Warnings',
    'System Events',
  ];

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#9a6a3a]" />
            <span>{isArabic ? 'سجل أحداث النظام والتحذيرات' : 'SYSTEM & AUDIT EVENT LOG'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'تسجيل زمني دقيق لكافة تحولات الحالة، اتصالات الطائرات، والتحذيرات الأمنية.'
              : 'Chronological telemetry log recording node state transitions, mesh reconvergence, and operational alerts.'}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] text-[#f6ecdd] transition-colors"
        >
          <Download className="w-4 h-4 text-[#9a6a3a]" />
          <span>تصدير CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7860]" />
          <input
            type="text"
            placeholder="Search events by keyword, node ID, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1a140e] border border-[#32261b] text-[#f6ecdd] placeholder-[#8c7860] focus:outline-none focus:border-[#9a6a3a]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#9a6a3a] text-[#120e0a] font-bold'
                  : 'bg-[#1a140e] text-[#b9a58c] hover:text-[#f6ecdd] border border-[#32261b]'
              }`}
            >
              {cat === 'all' ? 'All Events' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Event Stream List */}
      <div className="space-y-2">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-[#8c7860] bg-[#1a140e] rounded-xl border border-[#32261b]">
            No matching events found.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-xl bg-[#1a140e] border border-[#32261b] hover:border-[#9a6a3a]/30 transition-colors flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {evt.severity === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#8fc46a]" />
                  ) : evt.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-[#f5b82e]" />
                  ) : evt.severity === 'critical' ? (
                    <AlertCircle className="w-4 h-4 text-[#e8584a]" />
                  ) : (
                    <Info className="w-4 h-4 text-[#9a6a3a]" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#f6ecdd]">{evt.title}</span>
                    {evt.sourceNodeId && (
                      <span className="px-1.5 py-0.2 rounded bg-[#231a12] text-[#9a6a3a] text-[10px]">
                        {evt.sourceNodeId}
                      </span>
                    )}
                  </div>
                  <p className="text-[#b9a58c] text-[11px] font-sans">{evt.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[#8c7860] text-[10px]">{evt.timestamp}</div>
                <div className="text-[10px] text-[#9a6a3a] uppercase tracking-wider">{evt.category}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
