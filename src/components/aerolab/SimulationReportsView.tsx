/**
 * ASAB | AEROLAB 3D - Simulation Reports & Verification Archive
 * Comprehensive mission reports, network analytics, observations, and CSV export.
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Clock,
  Radio,
  Wifi,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const SimulationReportsView: React.FC = () => {
  const { reports, generateReport, settings } = useSimulation();
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');

  const isArabic = settings.language === 'ar';
  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleExportCsv = (rep: typeof selectedReport) => {
    if (!rep) return;
    const content = `Scenario,${rep.scenarioName}\nDate,${rep.date}\nDurationSec,${rep.durationSec}\nAircraftCount,${rep.aircraftCount}\nPacketDeliveryRatio,${rep.packetDeliveryRatio}%\nAverageLatencyMs,${rep.averageLatencyMs}ms\nThroughputMbps,${rep.throughputMbps}Mbps\nStatus,${rep.status}\n\nObservations:\n${rep.observations.map((o) => `"${o}"`).join('\n')}\n\nWarnings:\n${rep.warnings.map((w) => `"${w}"`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asab-report-${rep.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#35D5E8]" />
            <span>{isArabic ? 'سجل تقارير المحاكاة والتحقق العملياتي' : 'SIMULATION REPORTS & MISSION AUDIT ARCHIVE'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
            {isArabic
              ? 'تقارير فنية موثقة لكل سيناريو تم تشغيله، تتضمن إحصاءات الشبكة، زمن الوصول، وملاحظات الأداء.'
              : 'Post-simulation telemetry analysis, packet loss audits, and exported verification reports.'}
          </p>
        </div>

        <button
          onClick={() => {
            const newRep = generateReport();
            setSelectedReportId(newRep.id);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#35D5E8] hover:bg-[#28c5d8] text-[#080D16] font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>GENERATE NEW REPORT</span>
        </button>
      </div>

      {/* Reports Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Reports List */}
        <div className="p-4 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-3">
          <div className="text-xs font-bold text-[#EDF4FA] pb-2 border-b border-[#172638]">
            ARCHIVED REPORTS ({reports.length})
          </div>

          <div className="space-y-2">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#172638] border-[#35D5E8] shadow-md shadow-[#35D5E8]/10'
                      : 'bg-[#111E2D] border-[#172638] hover:border-[#35D5E8]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#EDF4FA] truncate max-w-[160px]">{rep.scenarioName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rep.status === 'Success'
                          ? 'bg-[#3DDC97]/20 text-[#3DDC97]'
                          : rep.status === 'Degraded Pass'
                          ? 'bg-[#F5B82E]/20 text-[#F5B82E]'
                          : 'bg-[#FF5964]/20 text-[#FF5964]'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#64768B] flex items-center justify-between">
                    <span>{rep.date}</span>
                    <span>{rep.aircraftCount} Aircraft</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Report Detail View (2 cols) */}
        {selectedReport ? (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-[#172638]">
              <div>
                <div className="text-[10px] text-[#35D5E8] font-bold uppercase">OFFICIAL SIMULATION AUDIT REPORT</div>
                <h2 className="text-lg font-bold text-[#EDF4FA] font-sans mt-0.5">{selectedReport.scenarioName}</h2>
                <div className="text-[11px] text-[#92A4B8]">Report ID: {selectedReport.id} • {selectedReport.date}</div>
              </div>

              <button
                onClick={() => handleExportCsv(selectedReport)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111E2D] hover:bg-[#172638] border border-[#172638] text-[#EDF4FA] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#35D5E8]" />
                <span>EXPORT CSV</span>
              </button>
            </div>

            {/* Metrics KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#111E2D] border border-[#172638]">
                <div className="text-[10px] text-[#92A4B8]">PACKET DELIVERY</div>
                <div className="text-xl font-bold text-[#35D5E8]">{selectedReport.packetDeliveryRatio}%</div>
              </div>
              <div className="p-3 rounded-xl bg-[#111E2D] border border-[#172638]">
                <div className="text-[10px] text-[#92A4B8]">AVG LATENCY</div>
                <div className="text-xl font-bold text-[#EDF4FA]">{selectedReport.averageLatencyMs} ms</div>
              </div>
              <div className="p-3 rounded-xl bg-[#111E2D] border border-[#172638]">
                <div className="text-[10px] text-[#92A4B8]">THROUGHPUT</div>
                <div className="text-xl font-bold text-[#5587FF]">{selectedReport.throughputMbps} Mbps</div>
              </div>
              <div className="p-3 rounded-xl bg-[#111E2D] border border-[#172638]">
                <div className="text-[10px] text-[#92A4B8]">FLEET SIZE</div>
                <div className="text-xl font-bold text-[#3DDC97]">{selectedReport.aircraftCount} Units</div>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#64768B] uppercase font-bold">OPERATIONAL OBSERVATIONS</div>
              <div className="space-y-1.5">
                {selectedReport.observations.map((obs, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] flex items-start gap-2 text-[11px] text-[#EDF4FA] font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3DDC97] mt-0.5 shrink-0" />
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {selectedReport.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] text-[#FF5964] uppercase font-bold">SYSTEM WARNINGS & ANOMALIES</div>
                <div className="space-y-1.5">
                  {selectedReport.warnings.map((warn, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#FF5964]/10 border border-[#FF5964]/30 flex items-start gap-2 text-[11px] text-[#FF5964] font-sans">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
