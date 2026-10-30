/**
 * ASAB | AEROLAB 3D - Architectural Whitepaper & About ASAB
 * Conceptual sovereign airborne command & control principles and educational disclaimer.
 */

import React from 'react';
import {
  Info,
  Shield,
  Radio,
  Cpu,
  Layers,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const AboutAsabView: React.FC = () => {
  const { settings } = useSimulation();
  const isArabic = settings.language === 'ar';

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6 bg-[#080D16] font-mono text-xs select-none max-w-4xl">
      {/* Title */}
      <div className="pb-4 border-b border-[#172638]">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#35D5E8]/10 text-[#35D5E8] border border-[#35D5E8]/30 text-[10px] font-bold mb-2">
          <span>{isArabic ? 'ورقة المفاهيم الهندسية المعمارية' : 'ARCHITECTURAL WHITEPAPER'}</span>
        </div>
        <h1 className="text-2xl font-bold text-[#EDF4FA] font-sans flex items-center gap-2">
          <span>{isArabic ? 'عَصَب | منظومة القيادة والتحكم الجوي السيادية' : 'عَصَب | ASAB AEROSPACE ARCHITECTURE'}</span>
        </h1>
        <p className="text-[#92A4B8] text-xs font-sans mt-1">
          {isArabic
            ? 'المنصة المتقدمة للقيادة والتحكم التكتيكي، والتوأم الرقمي، والمختبر الهندسي التفاعلي ثلاثي الأبعاد.'
            : 'Advanced Sovereign Airborne Command, Control & Engineering Simulation Platform.'}
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#35D5E8]">
            <Radio className="w-4 h-4" />
            <span>{isArabic ? 'شبكة متداخلة لامركزية جوية (Airborne Mesh)' : 'Decentralized Airborne Mesh'}</span>
          </div>
          <p className="text-[11px] text-[#92A4B8] font-sans leading-relaxed">
            {isArabic
              ? 'تلغي الاعتماد على نقطة فشل مركزية مثل محطات الأقمار الصناعية أو المحطات الأرضية المعرضة للاستهداف؛ كل طائرة VTOL تعمل كعقدة توجيه ذاتية التكوين والتعافي.'
              : 'Eliminates reliance on vulnerable single-point satellite downlinks or ground relays. Every VTOL aircraft acts as an autonomous routing node with self-healing topology.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3DDC97]">
            <Shield className="w-4 h-4" />
            <span>{isArabic ? 'تشفير سيادي متقدم (ECC-521)' : 'Sovereign Cryptography'}</span>
          </div>
          <p className="text-[11px] text-[#92A4B8] font-sans leading-relaxed">
            {isArabic
              ? 'تشفير من جذور العتاد الصلب يعتمد المنحنيات الإهليلجية دون ارتباط بهيئات مصادقة خارجية لضمان السيادة الرقمية الكاملة ومصادقة الطائرات بينياً.'
              : 'Hardware-rooted Elliptic Curve Cryptography (ECC-521) with zero external certificate authority dependence ensures sovereign air-to-air authentication.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#F5B82E]">
            <Cpu className="w-4 h-4" />
            <span>{isArabic ? 'ضغط دلالي حوسبي في الحافة (Edge NPU)' : 'Edge Semantic Compression'}</span>
          </div>
          <p className="text-[11px] text-[#92A4B8] font-sans leading-relaxed">
            {isArabic
              ? 'معالجات ذكاء اصطناعي مدمجة في كل طائرة تضغط تدفقات المستشعرات إلى رموز دلالية عالية الكثافة، محققة وفراً في عرض النطاق بنسبة تفوق 90% أثناء التشويش.'
              : 'Onboard neural processors compress raw sensor feeds and tactical streams into high-density semantic tokens, achieving up to 92% bandwidth reduction in contested RF environments.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#5587FF]">
            <Layers className="w-4 h-4" />
            <span>{isArabic ? 'التوأم الرقمي AEROLAB 3D' : 'AEROLAB 3D Digital Twin'}</span>
          </div>
          <p className="text-[11px] text-[#92A4B8] font-sans leading-relaxed">
            {isArabic
              ? 'نموذج هندسي تفاعلي إجرائي لطائرة ASAB-V100 يشمل 18 جزءاً قابلاً للتفكيك، ومحاكي طيران سداسي درجات الحرية (6-DoF)، ومحلل مسارات الدوائر الإلكترونية.'
              : 'High-fidelity procedural 3D model of the ASAB-V100 aircraft with 14+ inspectable subsystems, exploded CAD views, 6-DoF aerodynamic flight simulator, and avionics bus analyzers.'}
          </p>
        </div>
      </div>

      {/* Product Vision & Hierarchy Details */}
      <div className="p-5 rounded-2xl bg-[#0D1623] border border-[#172638] space-y-3 font-sans text-xs text-[#92A4B8] leading-relaxed">
        <h2 className="text-sm font-bold text-[#EDF4FA] font-mono">
          {isArabic ? 'الهيكلية التكاملية للمنظومة' : 'TECHNICAL INTEGRATION HIERARCHY'}
        </h2>
        <p>
          {isArabic
            ? 'تجمع المنظومة بين قادة العمليات في بيئة قيادة عَصَب (ASAB Command Environment) والمهندسين في مختبر إيرولاب (AEROLAB 3D). تشترك البيئتان في محرك حالة محاكاة موحد لحظي، حيث ينعكس أي تغيير في موقع أو صحة الطائرة فورياً على الفضاء ثلاثي الأبعاد، الصورة العملياتية الموحدة، ومخطط الشبكة.'
            : 'The platform bridges operational decision-makers in the ASAB Command Environment with aerospace systems engineers in AEROLAB 3D. Both environments run on a single synchronized state engine where any node addition, removal, or degradation immediately updates the 3D Airspace, the Common Operational Picture, the Mesh Topology graph, and network health metrics.'}
        </p>
      </div>

      {/* Simulation & Education Safety Boundary */}
      <div className="p-5 rounded-2xl bg-[#111E2D] border border-[#F5B82E]/40 space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-[#F5B82E]">
          <AlertTriangle className="w-4 h-4" />
          <span>{isArabic ? 'إشعار النزاهة التعليمية والمحاكاة التجريبية' : 'SIMULATION & EDUCATIONAL INTEGRITY NOTICE'}</span>
        </div>
        <p className="text-[11px] text-[#EDF4FA] font-sans leading-relaxed">
          {isArabic
            ? 'هذه المنظومة هي محاكاة تعليمية هندسية ونموذج رقمي تفاعلي للدراسة والتدريب التقني. جميع نماذج الطائرات، ديناميكا الطيران، الشبكات التكتيكية، وبيانات القياس تولد محلياً وافتراضياً. التطبيق لا يتصل بطائرات حقيقية، ولا يبث إشارات لاسلكية فعلية، ولا يرسل أوامر تشغيلية لمعدات ميدانية.'
            : 'This software is an interactive educational simulation and conceptual engineering demonstration. All aircraft models, flight dynamics, network topologies, RF links, and mission telemetry are synthetically generated locally. The application does not connect to real physical aircraft, transmit real-world RF emissions, or control operational hardware.'}
        </p>
      </div>
    </div>
  );
};
