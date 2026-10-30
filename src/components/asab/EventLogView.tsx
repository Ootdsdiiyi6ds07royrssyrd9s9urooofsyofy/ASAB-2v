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
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#35D5E8]" />
            <span>{isArabic ? 'سجل أحداث النظام والتحذيرات' : 'SYSTEM & AUDIT EVENT LOG'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
            {isArabic
              ? 'تسجيل زمني دقيق لكافة تحولات الحالة، اتصالات الطائرات، والتحذيرات الأمنية.'
              : 'Chronological telemetry log recording node state transitions, mesh reconvergence, and operational alerts.'}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[#EDF4FA] transition-colors"
        >
          <Download className="w-4 h-4 text-[#35D5E8]" />
          <span>EXPORT CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64768B]" />
          <input
            type="text"
            placeholder="Search events by keyword, node ID, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0D1623] border border-[#172638] text-[#EDF4FA] placeholder-[#64768B] focus:outline-none focus:border-[#35D5E8]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#35D5E8] text-[#080D16] font-bold'
                  : 'bg-[#0D1623] text-[#92A4B8] hover:text-[#EDF4FA] border border-[#172638]'
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
          <div className="p-8 text-center text-[#64768B] bg-[#0D1623] rounded-xl border border-[#172638]">
            No matching events found.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-xl bg-[#0D1623] border border-[#172638] hover:border-[#35D5E8]/30 transition-colors flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {evt.severity === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#3DDC97]" />
                  ) : evt.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-[#F5B82E]" />
                  ) : evt.severity === 'critical' ? (
                    <AlertCircle className="w-4 h-4 text-[#FF5964]" />
                  ) : (
                    <Info className="w-4 h-4 text-[#35D5E8]" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#EDF4FA]">{evt.title}</span>
                    {evt.sourceNodeId && (
                      <span className="px-1.5 py-0.2 rounded bg-[#111E2D] text-[#35D5E8] text-[10px]">
                        {evt.sourceNodeId}
                      </span>
                    )}
                  </div>
                  <p className="text-[#92A4B8] text-[11px] font-sans">{evt.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[#64768B] text-[10px]">{evt.timestamp}</div>
                <div className="text-[10px] text-[#35D5E8] uppercase tracking-wider">{evt.category}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
