/**
 * ASAB | AEROLAB 3D - Resilience Scenario Laboratory
 * Executes repeatable resilience scenarios: node failure, partitions, self-healing rerouting, and report generation.
 */

import React from 'react';
import {
  ShieldAlert,
  Play,
  CheckCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  Activity,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const ResilienceScenarioView: React.FC = () => {
  const {
    scenarios,
    activeScenarioId,
    runScenario,
    scenarioRunning,
    scenarioProgressPercent,
    metrics,
    generateReport,
    navigateToModule,
    settings,
  } = useSimulation();

  const isArabic = settings.language === 'ar';
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId);

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#e8584a]" />
            <span>{isArabic ? 'مختبر سيناريوهات الصمود والتعافي الذاتي' : 'RESILIENCE SCENARIO LABORATORY'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'اختبار متقدم لقدرة الشبكة على الالتئام التلقائي عند سقوط العقد أو انشطار الطوبولوجيا في بيئات النزاع.'
              : 'Stress-test decentralized mesh recovery, dynamic rerouting, partition healing, and automated report auditing.'}
          </p>
        </div>

        {activeScenario && (
          <button
            onClick={() => {
              const rep = generateReport();
              navigateToModule('reports', 'aerolab');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>{isArabic ? 'توليد تقرير رسمي' : 'GENERATE REPORT'}</span>
          </button>
        )}
      </div>

      {/* Active Running Scenario Live Status Bar */}
      {activeScenario && (
        <div className="p-5 rounded-2xl bg-[#1a140e] border border-[#9a6a3a]/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-[#9a6a3a] font-bold">السيناريو النشط حاليًا</div>
              <div className="text-base font-bold text-[#f6ecdd]">{activeScenario.name}</div>
              <div className="text-[11px] text-[#b9a58c] font-sans">{activeScenario.description}</div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                scenarioRunning
                  ? 'bg-[#8fc46a]/20 text-[#8fc46a] border border-[#8fc46a]/40'
                  : 'bg-[#f5b82e]/20 text-[#f5b82e] border border-[#f5b82e]/40'
              }`}
            >
              {isArabic ? (scenarioRunning ? 'المحاكاة قيد التشغيل' : 'المحاكاة متوقفة') : (scenarioRunning ? 'SIMULATION IN PROGRESS' : 'SIMULATION HALTED')}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-[#b9a58c]">
              <span>{isArabic ? 'تقدم السيناريو' : 'Scenario Progress'}</span>
              <span className="text-[#9a6a3a] font-bold">{scenarioProgressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#231a12] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9a6a3a] to-[#8fc46a] transition-all duration-300"
                style={{ width: `${scenarioProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Live Outcome Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b]">
              <div className="text-[10px] text-[#b9a58c]">حدث التشغيل</div>
              <div className="text-[#f6ecdd] font-bold truncate">{activeScenario.triggerEvent}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b]">
              <div className="text-[10px] text-[#b9a58c]">العقد المتأثرة</div>
              <div className="text-[#e8584a] font-bold">
                {activeScenario.affectedNodeIds.length > 0 ? activeScenario.affectedNodeIds.join(', ') : (isArabic ? 'لا توجد (شبكة كاملة)' : 'None (Full Mesh)')}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b]">
              <div className="text-[10px] text-[#b9a58c]">صحة التقارب</div>
              <div className="text-[#8fc46a] font-bold">{metrics.networkHealthPercent}% ({metrics.overallHealthState})</div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of 8 Predefined Scenarios */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-[#f6ecdd] uppercase">{isArabic ? 'سيناريوهات الصمود الجاهزة (8 متاحة)' : 'PREDEFINED RESILIENCE SCENARIOS (8 AVAILABLE)'}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((scen) => {
            const isActive = activeScenarioId === scen.id;
            return (
              <div
                key={scen.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isActive
                    ? 'bg-[#32261b] border-[#9a6a3a] shadow-md shadow-[#9a6a3a]/10'
                    : 'bg-[#1a140e] border-[#32261b] hover:border-[#9a6a3a]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-[#f6ecdd]">
                    {isArabic ? scen.nameAr : scen.name}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scen.difficulty === 'Basic'
                        ? 'bg-[#8fc46a]/20 text-[#8fc46a]'
                        : scen.difficulty === 'Intermediate'
                        ? 'bg-[#b5793f]/20 text-[#b5793f]'
                        : scen.difficulty === 'Advanced'
                        ? 'bg-[#f5b82e]/20 text-[#f5b82e]'
                        : 'bg-[#e8584a]/20 text-[#e8584a]'
                    }`}
                  >
                    {scen.difficulty}
                  </span>
                </div>

                <p className="text-[11px] text-[#b9a58c] font-sans leading-relaxed">
                  {scen.description}
                </p>

                <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] text-[10px] space-y-1">
                  <div>
                    <span className="text-[#8c7860]">Expected Result: </span>
                    <span className="text-[#8fc46a]">{scen.expectedOutcome}</span>
                  </div>
                  <div>
                    <span className="text-[#8c7860]">Duration: </span>
                    <span className="text-[#f6ecdd]">{scen.durationSec}s</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => runScenario(scen.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold text-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isActive ? 'RE-RUN SCENARIO' : 'EXECUTE SCENARIO'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
