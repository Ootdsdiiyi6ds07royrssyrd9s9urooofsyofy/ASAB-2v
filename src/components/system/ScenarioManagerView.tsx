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
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none">
      {/* Title & Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-[#32261b]">
        <div>
          <h1 className="text-xl font-bold text-[#f6ecdd] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#9a6a3a]" />
            <span>{isArabic ? 'مدير السيناريوهات والتكوينات المخصصة' : 'UNIFIED SCENARIO MANAGER'}</span>
          </h1>
          <p className="text-[#b9a58c] text-[11px] font-sans">
            {isArabic
              ? 'إنشاء، تكرار، وحفظ سيناريوهات محاكاة الأسطول الجوي المخصصة محلياً.'
              : 'Create, duplicate, and persist customized multi-aircraft tactical scenarios.'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold transition-colors"
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
                  ? 'bg-[#32261b] border-[#9a6a3a] shadow-md shadow-[#9a6a3a]/10'
                  : 'bg-[#1a140e] border-[#32261b] hover:border-[#9a6a3a]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#f6ecdd] text-sm">
                      {isArabic ? (scen.nameAr || scen.name) : scen.name}
                    </h3>
                    <div className="text-[10px] text-[#9a6a3a]">
                      {isCustom
                        ? (isArabic ? 'سيناريو مخصص من المشغل' : 'Custom User Scenario')
                        : (isArabic ? 'حزمة سيناريوهات عَصَب القياسية' : 'Standard ASAB Suite')}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scen.difficulty === 'Basic'
                        ? 'bg-[#8fc46a]/20 text-[#8fc46a]'
                        : scen.difficulty === 'Intermediate'
                        ? 'bg-[#b5793f]/20 text-[#b5793f]'
                        : 'bg-[#f5b82e]/20 text-[#f5b82e]'
                    }`}
                  >
                    {isArabic
                      ? (scen.difficulty === 'Basic' ? 'مبتدئ' : scen.difficulty === 'Intermediate' ? 'متوسط' : 'متقدم')
                      : scen.difficulty}
                  </span>
                </div>

                <p className="text-[11px] text-[#b9a58c] font-sans leading-relaxed line-clamp-3">
                  {scen.description}
                </p>

                <div className="p-2.5 rounded-lg bg-[#231a12] border border-[#32261b] text-[10px] space-y-1">
                  <div>{isArabic ? 'المدة:' : 'Duration:'} <span className="text-[#f6ecdd] font-bold">{scen.durationSec} {isArabic ? 'ثانية' : 's'}</span></div>
                  <div>{isArabic ? 'المحفز العملياتي:' : 'Trigger:'} <span className="text-[#9a6a3a]">{scen.triggerEvent}</span></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#32261b]">
                {isCustom ? (
                  <button
                    onClick={() => handleDelete(scen.id)}
                    className="p-1.5 rounded bg-[#e8584a]/10 hover:bg-[#e8584a]/20 text-[#e8584a] border border-[#e8584a]/30"
                    title={isArabic ? 'حذف السيناريو المخصص' : 'Delete Custom Scenario'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-[10px] text-[#8c7860]">{isArabic ? 'للقراءة فقط' : 'READ-ONLY'}</div>
                )}

                <button
                  onClick={() => {
                    runScenario(scen);
                    navigateToModule('command-center', 'asab');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold text-xs transition-colors"
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
        <div className="fixed inset-0 z-50 bg-[#120e0a]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-5 rounded-xl bg-[#1a140e] border border-[#9a6a3a]/40 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#32261b]">
              <div className="text-sm font-bold text-[#9a6a3a]">
                {isArabic ? 'إنشاء سيناريو محاكاة مخصص' : 'CREATE CUSTOM SCENARIO'}
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#b9a58c] hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#b9a58c] mb-1">{isArabic ? 'اسم السيناريو' : 'SCENARIO NAME'}</label>
                <input
                  type="text"
                  placeholder={isArabic ? 'مثال: استطلاع إلكتروني على ارتفاعات شاهقة' : 'e.g. High-Altitude Electronic Reconnaissance'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded bg-[#231a12] border border-[#32261b] text-[#f6ecdd] focus:outline-none focus:border-[#9a6a3a]"
                />
              </div>

              <div>
                <label className="block text-[#b9a58c] mb-1">{isArabic ? 'الوصف والأهداف' : 'DESCRIPTION'}</label>
                <textarea
                  rows={3}
                  placeholder={isArabic ? 'صف ظروف الطيران والتهديدات والأهداف المرجوة...' : 'Describe flight conditions, threats, and objectives...'}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2 rounded bg-[#231a12] border border-[#32261b] text-[#f6ecdd] focus:outline-none focus:border-[#9a6a3a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#b9a58c] mb-1">{isArabic ? 'مستوى الصعوبة' : 'DIFFICULTY'}</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2 rounded bg-[#231a12] border border-[#32261b] text-[#f6ecdd]"
                  >
                    <option value="Basic">{isArabic ? 'مبتدئ' : 'Basic'}</option>
                    <option value="Intermediate">{isArabic ? 'متوسط' : 'Intermediate'}</option>
                    <option value="Advanced">{isArabic ? 'متقدم' : 'Advanced'}</option>
                    <option value="Stress Test">{isArabic ? 'اختبار ضغط' : 'Stress Test'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#b9a58c] mb-1">{isArabic ? 'المدة (بالثواني)' : 'DURATION (SEC)'}</label>
                  <input
                    type="number"
                    min="15"
                    max="600"
                    value={durationSec}
                    onChange={(e) => setDurationSec(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#231a12] border border-[#32261b] text-[#f6ecdd]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#32261b]">
              <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded bg-[#231a12] text-[#b9a58c]">
                {isArabic ? 'إلغاء' : 'CANCEL'}
              </button>
              <button onClick={handleCreate} className="px-4 py-1.5 rounded bg-[#9a6a3a] text-[#120e0a] font-bold hover:brightness-110">
                {isArabic ? 'حفظ السيناريو' : 'SAVE SCENARIO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
