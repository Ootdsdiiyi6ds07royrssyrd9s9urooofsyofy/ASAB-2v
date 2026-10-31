/**
 * ASAB | AEROLAB 3D - Architectural Whitepaper & Automated System Verification
 * Conceptual sovereign airborne command & control principles and live automated test runner.
 */

import React, { useState } from 'react';
import {
  Info,
  Shield,
  Radio,
  Cpu,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { runSystemVerification, VerificationResult } from '../../utils/systemVerification';

export const AboutAsabView: React.FC = () => {
  const { settings } = useSimulation();
  const isArabic = settings.language === 'ar';

  const [testResults, setTestResults] = useState<VerificationResult[] | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  const handleRunVerification = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const results = runSystemVerification();
      setTestResults(results);
      setIsRunningTests(false);
    }, 400);
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#120e0a] font-mono text-xs select-none max-w-4xl">
      {/* Title */}
      <div className="pb-4 border-b border-[#32261b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#9a6a3a]/10 text-[#9a6a3a] border border-[#9a6a3a]/30 text-[10px] font-bold mb-2">
            <span>{isArabic ? 'ورقة المفاهيم الهندسية والاختبارات الآلية' : 'ARCHITECTURAL WHITEPAPER & VERIFICATION'}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#f6ecdd] font-sans flex items-center gap-2">
            <span>{isArabic ? 'عَصَب | منظومة القيادة والتحكم الجوي السيادية' : 'عَصَب | ASAB AEROSPACE ARCHITECTURE'}</span>
          </h1>
          <p className="text-[#b9a58c] text-xs font-sans mt-1">
            {isArabic
              ? 'المنصة المتقدمة للقيادة والتحكم التكتيكي، والتوأم الرقمي، والمختبر الهندسي التفاعلي ثلاثي الأبعاد.'
              : 'Advanced Sovereign Airborne Command, Control & Engineering Simulation Platform.'}
          </p>
        </div>

        {/* Run System Verification Button */}
        <button
          onClick={handleRunVerification}
          disabled={isRunningTests}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9a6a3a] hover:bg-[#c9a774] text-[#120e0a] font-bold font-mono transition-colors shadow-lg cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isRunningTests ? (isArabic ? 'جاري الفحص...' : 'Running Tests...') : (isArabic ? 'تشغيل فحص النظام والوحدات' : 'Run System Verification')}</span>
        </button>
      </div>

      {/* Test Results Panel */}
      {testResults && (
        <div className="p-5 rounded-2xl bg-[#1a140e] border border-[#9a6a3a]/40 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#9a6a3a] text-sm">
              {isArabic ? 'نتائج الفحص والتحقق الآلي للنظام:' : 'AUTOMATED VERIFICATION TEST RESULTS:'}
            </span>
            <span className="text-[10px] text-[#8fc46a] bg-[#8fc46a]/10 px-2 py-0.5 rounded border border-[#8fc46a]/30">
              {testResults.filter((r) => r.passed).length} / {testResults.length} {isArabic ? 'نجاح تام' : 'Passed'}
            </span>
          </div>
          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#231a12] border border-[#32261b]">
                <div className="flex items-center gap-2">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#8fc46a] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#e8584a] shrink-0" />
                  )}
                  <span className="font-bold text-[#f6ecdd]">{t.testName}</span>
                </div>
                <span className="text-[11px] text-[#b9a58c] max-w-md text-right">{t.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#9a6a3a]">
            <Radio className="w-4 h-4" />
            <span>{isArabic ? 'شبكة متداخلة لامركزية جوية (Airborne Mesh)' : 'Decentralized Airborne Mesh'}</span>
          </div>
          <p className="text-[11px] text-[#b9a58c] font-sans leading-relaxed">
            {isArabic
              ? 'تلغي الاعتماد على نقطة فشل مركزية مثل محطات الأقمار الصناعية أو المحطات الأرضية المعرضة للاستهداف؛ كل طائرة VTOL تعمل كعقدة توجيه ذاتية التكوين والتعافي.'
              : 'Eliminates reliance on vulnerable single-point satellite downlinks or ground relays. Every VTOL aircraft acts as an autonomous routing node with self-healing topology.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#8fc46a]">
            <Shield className="w-4 h-4" />
            <span>{isArabic ? 'تشفير سيادي متقدم (ECC-521)' : 'Sovereign Cryptography'}</span>
          </div>
          <p className="text-[11px] text-[#b9a58c] font-sans leading-relaxed">
            {isArabic
              ? 'تشفير من جذور العتاد الصلب يعتمد المنحنيات الإهليلجية دون ارتباط بهيئات مصادقة خارجية لضمان السيادة الرقمية الكاملة ومصادقة الطائرات بينياً.'
              : 'Hardware-rooted Elliptic Curve Cryptography (ECC-521) with zero external certificate authority dependence ensures sovereign air-to-air authentication.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#f5b82e]">
            <Cpu className="w-4 h-4" />
            <span>{isArabic ? 'ضغط دلالي حوسبي في الحافة (Edge NPU)' : 'Edge Semantic Compression'}</span>
          </div>
          <p className="text-[11px] text-[#b9a58c] font-sans leading-relaxed">
            {isArabic
              ? 'معالجات ذكاء اصطناعي مدمجة في كل طائرة تضغط تدفقات المستشعرات إلى رموز دلالية عالية الكثافة، محققة وفراً في عرض النطاق بنسبة تفوق 90% أثناء التشويش.'
              : 'Onboard neural processors compress raw sensor feeds and tactical streams into high-density semantic tokens, achieving up to 92% bandwidth reduction in contested RF environments.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a140e] border border-[#32261b] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#b5793f]">
            <Layers className="w-4 h-4" />
            <span>{isArabic ? 'التوأم الرقمي AEROLAB 3D' : 'AEROLAB 3D Digital Twin'}</span>
          </div>
          <p className="text-[11px] text-[#b9a58c] font-sans leading-relaxed">
            {isArabic
              ? 'نموذج هندسي تفاعلي إجرائي لطائرة ASAB-V100 يشمل 18 جزءاً قابلاً للتفكيك، ومحاكي طيران سداسي درجات الحرية (6-DoF)، ومحلل مسارات الدوائر الإلكترونية.'
              : 'High-fidelity procedural 3D model of the ASAB-V100 aircraft with 14+ inspectable subsystems, exploded CAD views, 6-DoF aerodynamic flight simulator, and avionics bus analyzers.'}
          </p>
        </div>
      </div>

      {/* Simulation & Education Safety Boundary */}
      <div className="p-5 rounded-2xl bg-[#231a12] border border-[#f5b82e]/40 space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-[#f5b82e]">
          <AlertTriangle className="w-4 h-4" />
          <span>{isArabic ? 'إشعار النزاهة التعليمية والمحاكاة التجريبية' : 'SIMULATION & EDUCATIONAL INTEGRITY NOTICE'}</span>
        </div>
        <p className="text-[11px] text-[#f6ecdd] font-sans leading-relaxed">
          {isArabic
            ? 'هذه المنظومة هي محاكاة تعليمية هندسية ونموذج رقمي تفاعلي للدراسة والتدريب التقني. جميع نماذج الطائرات، ديناميكا الطيران، الشبكات التكتيكية، وبيانات القياس تولد محلياً وافتراضياً. التطبيق لا يتصل بطائرات حقيقية، ولا يبث إشارات لاسلكية فعلية، ولا يرسل أوامر تشغيلية لمعدات ميدانية.'
            : 'This software is an interactive educational simulation and conceptual engineering demonstration. All aircraft models, flight dynamics, network topologies, RF links, and mission telemetry are synthetically generated locally. The application does not connect to real physical aircraft, transmit real-world RF emissions, or control operational hardware.'}
        </p>
      </div>
    </div>
  );
};
