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
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FF5964]" />
            <span>{isArabic ? 'مختبر سيناريوهات الصمود والتعافي الذاتي' : 'RESILIENCE SCENARIO LABORATORY'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#35D5E8] hover:bg-[#28c5d8] text-[#080D16] font-bold transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>{isArabic ? 'توليد تقرير رسمي' : 'GENERATE REPORT'}</span>
          </button>
        )}
      </div>

      {/* Active Running Scenario Live Status Bar */}
      {activeScenario && (
        <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#35D5E8]/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-[#35D5E8] font-bold">CURRENT ACTIVE SCENARIO</div>
              <div className="text-base font-bold text-[#EDF4FA]">{activeScenario.name}</div>
              <div className="text-[11px] text-[#92A4B8] font-sans">{activeScenario.description}</div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                scenarioRunning
                  ? 'bg-[#3DDC97]/20 text-[#3DDC97] border border-[#3DDC97]/40'
                  : 'bg-[#F5B82E]/20 text-[#F5B82E] border border-[#F5B82E]/40'
              }`}
            >
              {scenarioRunning ? 'SIMULATION IN PROGRESS' : 'SIMULATION HALTED'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-[#92A4B8]">
              <span>Scenario Progress</span>
              <span className="text-[#35D5E8] font-bold">{scenarioProgressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#111E2D] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#35D5E8] to-[#3DDC97] transition-all duration-300"
                style={{ width: `${scenarioProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Live Outcome Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638]">
              <div className="text-[10px] text-[#92A4B8]">TRIGGER EVENT</div>
              <div className="text-[#EDF4FA] font-bold truncate">{activeScenario.triggerEvent}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638]">
              <div className="text-[10px] text-[#92A4B8]">AFFECTED NODES</div>
              <div className="text-[#FF5964] font-bold">
                {activeScenario.affectedNodeIds.length > 0 ? activeScenario.affectedNodeIds.join(', ') : 'None (Full Mesh)'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638]">
              <div className="text-[10px] text-[#92A4B8]">CONVERGENCE HEALTH</div>
              <div className="text-[#3DDC97] font-bold">{metrics.networkHealthPercent}% ({metrics.overallHealthState})</div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of 8 Predefined Scenarios */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-[#EDF4FA] uppercase">PREDEFINED RESILIENCE SCENARIOS (8 AVAILABLE)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((scen) => {
            const isActive = activeScenarioId === scen.id;
            return (
              <div
                key={scen.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isActive
                    ? 'bg-[#172638] border-[#35D5E8] shadow-md shadow-[#35D5E8]/10'
                    : 'bg-[#0D1623] border-[#172638] hover:border-[#35D5E8]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-[#EDF4FA]">
                    {isArabic ? scen.nameAr : scen.name}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scen.difficulty === 'Basic'
                        ? 'bg-[#3DDC97]/20 text-[#3DDC97]'
                        : scen.difficulty === 'Intermediate'
                        ? 'bg-[#5587FF]/20 text-[#5587FF]'
                        : scen.difficulty === 'Advanced'
                        ? 'bg-[#F5B82E]/20 text-[#F5B82E]'
                        : 'bg-[#FF5964]/20 text-[#FF5964]'
                    }`}
                  >
                    {scen.difficulty}
                  </span>
                </div>

                <p className="text-[11px] text-[#92A4B8] font-sans leading-relaxed">
                  {scen.description}
                </p>

                <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] text-[10px] space-y-1">
                  <div>
                    <span className="text-[#64768B]">Expected Result: </span>
                    <span className="text-[#3DDC97]">{scen.expectedOutcome}</span>
                  </div>
                  <div>
                    <span className="text-[#64768B]">Duration: </span>
                    <span className="text-[#EDF4FA]">{scen.durationSec}s</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => runScenario(scen.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#35D5E8] hover:bg-[#28c5d8] text-[#080D16] font-bold text-xs transition-colors"
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
