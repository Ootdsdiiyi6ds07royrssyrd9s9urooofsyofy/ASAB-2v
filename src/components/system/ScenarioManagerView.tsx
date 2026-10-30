/**
 * ASAB | AEROLAB 3D - Unified Scenario Manager
 * Create, clone, customize, and persist local simulation scenarios.
 */

import React, { useState } from 'react';
import {
  Database,
  Plus,
  Play,
  Copy,
  Trash2,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { ResilienceScenario } from '../../types';

export const ScenarioManagerView: React.FC = () => {
  const { scenarios, runScenario, activeScenarioId, navigateToModule, settings } = useSimulation();
  const [modalOpen, setModalOpen] = useState(false);
  const [customScenarios, setCustomScenarios] = useState<ResilienceScenario[]>(() => {
    const saved = localStorage.getItem('asab_custom_scenarios');
    return saved ? JSON.parse(saved) : [];
  });

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [difficulty, setDifficulty] = useState<ResilienceScenario['difficulty']>('Intermediate');
  const [durationSec, setDurationSec] = useState(60);

  const isArabic = settings.language === 'ar';
  const allScenarios = [...scenarios, ...customScenarios];

  const handleCreate = () => {
    if (!name.trim()) return;
    const newScen: ResilienceScenario = {
      id: `custom_${Date.now()}`,
      name,
      nameAr: name,
      description: desc || 'Custom operator mission scenario.',
      difficulty,
      durationSec,
      triggerEvent: 'Custom parameter initialization.',
      expectedOutcome: 'Fleet successfully adapts to operator test conditions.',
      affectedNodeIds: [],
    };
    const updated = [...customScenarios, newScen];
    setCustomScenarios(updated);
    localStorage.setItem('asab_custom_scenarios', JSON.stringify(updated));
    setName('');
    setDesc('');
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = customScenarios.filter((s) => s.id !== id);
    setCustomScenarios(updated);
    localStorage.setItem('asab_custom_scenarios', JSON.stringify(updated));
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none">
      {/* Title & Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-[#172638]">
        <div>
          <h1 className="text-xl font-bold text-[#EDF4FA] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#35D5E8]" />
            <span>{isArabic ? 'مدير السيناريوهات والتكوينات المخصصة' : 'UNIFIED SCENARIO MANAGER'}</span>
          </h1>
          <p className="text-[#92A4B8] text-[11px] font-sans">
            {isArabic
              ? 'إنشاء، تكرار، وحفظ سيناريوهات محاكاة الأسطول الجوي المخصصة محلياً.'
              : 'Create, duplicate, and persist customized multi-aircraft tactical scenarios.'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#35D5E8] hover:bg-[#28c5d8] text-[#080D16] font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'إنشاء سيناريو مخصص' : 'CREATE SCENARIO'}</span>
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {allScenarios.map((scen) => {
          const isActive = activeScenarioId === scen.id;
          const isCustom = scen.id.startsWith('custom_');
          return (
            <div
              key={scen.id}
              className={`p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between ${
                isActive
                  ? 'bg-[#172638] border-[#35D5E8] shadow-md shadow-[#35D5E8]/10'
                  : 'bg-[#0D1623] border-[#172638] hover:border-[#35D5E8]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#EDF4FA] text-sm">
                      {isArabic ? (scen.nameAr || scen.name) : scen.name}
                    </h3>
                    <div className="text-[10px] text-[#35D5E8]">
                      {isCustom
                        ? (isArabic ? 'سيناريو مخصص من المشغل' : 'Custom User Scenario')
                        : (isArabic ? 'حزمة سيناريوهات عَصَب القياسية' : 'Standard ASAB Suite')}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scen.difficulty === 'Basic'
                        ? 'bg-[#3DDC97]/20 text-[#3DDC97]'
                        : scen.difficulty === 'Intermediate'
                        ? 'bg-[#5587FF]/20 text-[#5587FF]'
                        : 'bg-[#F5B82E]/20 text-[#F5B82E]'
                    }`}
                  >
                    {isArabic
                      ? (scen.difficulty === 'Basic' ? 'مبتدئ' : scen.difficulty === 'Intermediate' ? 'متوسط' : 'متقدم')
                      : scen.difficulty}
                  </span>
                </div>

                <p className="text-[11px] text-[#92A4B8] font-sans leading-relaxed line-clamp-3">
                  {scen.description}
                </p>

                <div className="p-2.5 rounded-lg bg-[#111E2D] border border-[#172638] text-[10px] space-y-1">
                  <div>{isArabic ? 'المدة:' : 'Duration:'} <span className="text-[#EDF4FA] font-bold">{scen.durationSec} {isArabic ? 'ثانية' : 's'}</span></div>
                  <div>{isArabic ? 'المحفز العملياتي:' : 'Trigger:'} <span className="text-[#35D5E8]">{scen.triggerEvent}</span></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#172638]">
                {isCustom ? (
                  <button
                    onClick={() => handleDelete(scen.id)}
                    className="p-1.5 rounded bg-[#FF5964]/10 hover:bg-[#FF5964]/20 text-[#FF5964] border border-[#FF5964]/30"
                    title={isArabic ? 'حذف السيناريو المخصص' : 'Delete Custom Scenario'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-[10px] text-[#64768B]">{isArabic ? 'للقراءة فقط' : 'READ-ONLY'}</div>
                )}

                <button
                  onClick={() => {
                    runScenario(scen.id);
                    navigateToModule('command-center', 'asab');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#35D5E8] hover:bg-[#28c5d8] text-[#080D16] font-bold text-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'تحميل وتشغيل' : 'LOAD & RUN'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#080D16]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-5 rounded-xl bg-[#0D1623] border border-[#35D5E8]/40 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#172638]">
              <div className="text-sm font-bold text-[#35D5E8]">
                {isArabic ? 'إنشاء سيناريو محاكاة مخصص' : 'CREATE CUSTOM SCENARIO'}
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#92A4B8] hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#92A4B8] mb-1">{isArabic ? 'اسم السيناريو' : 'SCENARIO NAME'}</label>
                <input
                  type="text"
                  placeholder={isArabic ? 'مثال: استطلاع إلكتروني على ارتفاعات شاهقة' : 'e.g. High-Altitude Electronic Reconnaissance'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded bg-[#111E2D] border border-[#172638] text-[#EDF4FA] focus:outline-none focus:border-[#35D5E8]"
                />
              </div>

              <div>
                <label className="block text-[#92A4B8] mb-1">{isArabic ? 'الوصف والأهداف' : 'DESCRIPTION'}</label>
                <textarea
                  rows={3}
                  placeholder={isArabic ? 'صف ظروف الطيران والتهديدات والأهداف المرجوة...' : 'Describe flight conditions, threats, and objectives...'}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2 rounded bg-[#111E2D] border border-[#172638] text-[#EDF4FA] focus:outline-none focus:border-[#35D5E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#92A4B8] mb-1">{isArabic ? 'مستوى الصعوبة' : 'DIFFICULTY'}</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2 rounded bg-[#111E2D] border border-[#172638] text-[#EDF4FA]"
                  >
                    <option value="Basic">{isArabic ? 'مبتدئ' : 'Basic'}</option>
                    <option value="Intermediate">{isArabic ? 'متوسط' : 'Intermediate'}</option>
                    <option value="Advanced">{isArabic ? 'متقدم' : 'Advanced'}</option>
                    <option value="Stress Test">{isArabic ? 'اختبار ضغط' : 'Stress Test'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#92A4B8] mb-1">{isArabic ? 'المدة (بالثواني)' : 'DURATION (SEC)'}</label>
                  <input
                    type="number"
                    min="15"
                    max="600"
                    value={durationSec}
                    onChange={(e) => setDurationSec(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#111E2D] border border-[#172638] text-[#EDF4FA]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#172638]">
              <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded bg-[#111E2D] text-[#92A4B8]">
                {isArabic ? 'إلغاء' : 'CANCEL'}
              </button>
              <button onClick={handleCreate} className="px-4 py-1.5 rounded bg-[#35D5E8] text-[#080D16] font-bold hover:brightness-110">
                {isArabic ? 'حفظ السيناريو' : 'SAVE SCENARIO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
