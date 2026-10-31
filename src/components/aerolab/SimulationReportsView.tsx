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
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#9a6a3a]" />
            <span>{isArabic ? 'سجل تقارير المحاكاة والتحقق العملياتي' : 'SIMULATION REPORTS & MISSION AUDIT ARCHIVE'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
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
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'إنشاء تقرير فني جديد' : 'GENERATE NEW REPORT'}</span>
        </button>
      </div>

      {/* Reports Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Reports List */}
        <div className="p-4 rounded-2xl bg-[#1a140e] border border-[#32261b] space-y-3">
          <div className="text-xs font-bold text-[#f6ecdd] pb-2 border-b border-[#32261b]">
            {isArabic ? `الأرشيف المعتمد (${reports.length} تقرير)` : `ARCHIVED REPORTS (${reports.length})`}
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
                      ? 'bg-[#32261b] border-[#9a6a3a] shadow-md shadow-[#9a6a3a]/10'
                      : 'bg-[#231a12] border-[#32261b] hover:border-[#9a6a3a]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#f6ecdd] truncate max-w-[160px]">{rep.scenarioName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rep.status === 'Success'
                          ? 'bg-[#8fc46a]/20 text-[#8fc46a]'
                          : rep.status === 'Degraded Pass'
                          ? 'bg-[#f5b82e]/20 text-[#f5b82e]'
                          : 'bg-[#e8584a]/20 text-[#e8584a]'
                      }`}
                    >
                      {isArabic ? (rep.status === 'Success' ? 'ناجح' : rep.status === 'Degraded Pass' ? 'مقبول مع انخفاض' : 'فشل') : rep.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8c7860] flex items-center justify-between">
                    <span>{rep.date}</span>
                    <span>{rep.aircraftCount} {isArabic ? 'طائرات' : 'Aircraft'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Report Detail View (2 cols) */}
        {selectedReport ? (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#1a140e] border border-[#32261b] space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-[#32261b]">
              <div>
                <div className="text-[10px] text-[#9a6a3a] font-bold uppercase">
                  {isArabic ? 'تقرير التحقق والتدقيق العملياتي الرسمي' : 'OFFICIAL SIMULATION AUDIT REPORT'}
                </div>
                <h2 className="text-lg font-bold text-[#f6ecdd] font-sans mt-0.5">{selectedReport.scenarioName}</h2>
                <div className="text-[11px] text-[#b9a58c]">
                  {isArabic ? 'معرف التقرير' : 'Report ID'}: {selectedReport.id} • {selectedReport.date}
                </div>
              </div>

              <button
                onClick={() => handleExportCsv(selectedReport)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#231a12] hover:bg-[#32261b] border border-[#32261b] text-[#f6ecdd] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#9a6a3a]" />
                <span>{isArabic ? 'تصدير CSV' : 'تصدير CSV'}</span>
              </button>
            </div>

            {/* Metrics KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#231a12] border border-[#32261b]">
                <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'تسليم الحزم' : 'PACKET DELIVERY'}</div>
                <div className="text-xl font-bold text-[#9a6a3a]">{selectedReport.packetDeliveryRatio}%</div>
              </div>
              <div className="p-3 rounded-xl bg-[#231a12] border border-[#32261b]">
                <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'متوسط الكمون' : 'AVG LATENCY'}</div>
                <div className="text-xl font-bold text-[#f6ecdd]">{selectedReport.averageLatencyMs} {isArabic ? 'مللي ثانية' : 'ms'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#231a12] border border-[#32261b]">
                <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'معدل النقل' : 'THROUGHPUT'}</div>
                <div className="text-xl font-bold text-[#b5793f]">{selectedReport.throughputMbps} {isArabic ? 'ميجابت/ث' : 'Mbps'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#231a12] border border-[#32261b]">
                <div className="text-[10px] text-[#b9a58c]">{isArabic ? 'حجم الأسطول' : 'FLEET SIZE'}</div>
                <div className="text-xl font-bold text-[#8fc46a]">{selectedReport.aircraftCount} {isArabic ? 'طائرات' : 'Units'}</div>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#8c7860] uppercase font-bold">
                {isArabic ? 'الملاحظات والنتائج الفنية والعملياتية' : 'OPERATIONAL OBSERVATIONS'}
              </div>
              <div className="space-y-1.5">
                {selectedReport.observations.map((obs, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] flex items-start gap-2 text-[11px] text-[#f6ecdd] font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8fc46a] mt-0.5 shrink-0" />
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {selectedReport.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] text-[#e8584a] uppercase font-bold">
                  {isArabic ? 'تحذيرات النظام وملاحظات الشذوذ' : 'SYSTEM WARNINGS & ANOMALIES'}
                </div>
                <div className="space-y-1.5">
                  {selectedReport.warnings.map((warn, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#e8584a]/10 border border-[#e8584a]/30 flex items-start gap-2 text-[11px] text-[#e8584a] font-sans">
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
