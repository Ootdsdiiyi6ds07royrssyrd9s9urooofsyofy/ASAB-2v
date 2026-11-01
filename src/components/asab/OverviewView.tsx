import React from 'react';
import { Activity, ArrowUpLeft, Box, CheckCircle2, ChevronLeft, ChevronRight, Compass, Gauge, Map, Network, Plane, Radio, ShieldCheck, Sparkles, Wifi, Zap } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const OverviewView: React.FC = () => {
  const { nodes, metrics, navigateToModule, settings } = useSimulation();
  const isArabic = settings.language === 'ar';
  const activeCount = nodes.filter((n) => n.status === 'Active').length;
  const standbyCount = nodes.filter((n) => n.status === 'Standby').length;
  const disconnectedCount = nodes.filter((n) => n.status === 'Disconnected').length;
  const Arrow = isArabic ? ChevronLeft : ChevronRight;

  const quickActions = [
    { id: 'command-center', env: 'asab' as const, icon: Compass, tone: 'gold', title: isArabic ? 'مركز القيادة' : 'Command center', description: isArabic ? 'المشهد التشغيلي والتحكم بالأسطول' : 'Operational picture and fleet control' },
    { id: 'cop', env: 'asab' as const, icon: Map, tone: 'green', title: isArabic ? 'ساحة التدريب' : 'Training arena', description: isArabic ? 'خريطة ثلاثية الأبعاد وقياسات حية' : '3D map and live measurements' },
    { id: 'aircraft-studio', env: 'aerolab' as const, icon: Box, tone: 'amber', title: isArabic ? 'استوديو الطائرات' : 'Aircraft studio', description: isArabic ? 'فحص الهيكل والمكونات الهندسية' : 'Inspect the airframe and components' },
    { id: 'live-flight-simulation', env: 'aerolab' as const, icon: Radio, tone: 'blue', title: isArabic ? 'المحاكاة الحية' : 'Live simulation', description: isArabic ? 'قيادة صوتية وبيانات طيران لحظية' : 'Voice control and live flight data' },
  ];

  return (
    <div className="overview-page h-full overflow-y-auto p-3 sm:p-5 lg:p-7" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex max-w-[1700px] flex-col gap-5 lg:gap-6">
        <section className="overview-hero relative overflow-hidden rounded-[22px] border border-[#d8b98a]/20 bg-[#1b1610] p-5 shadow-2xl sm:p-7 lg:p-9">
          <div className="absolute -end-16 -top-24 h-72 w-72 rounded-full border border-[#d8b98a]/10 opacity-70" /><div className="absolute -end-4 -top-12 h-48 w-48 rounded-full border border-[#d8b98a]/10" />
          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8b98a]/25 bg-[#d8b98a]/10 px-3 py-1.5 text-[10px] font-bold text-[#e2bd83]"><Sparkles className="h-3.5 w-3.5" />{isArabic ? 'لوحة التشغيل الموحدة · الحالة مستقرة' : 'Unified operations · system stable'}</div>
            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-[#f4eadb] sm:text-3xl lg:text-4xl">{isArabic ? 'رؤية واحدة للقيادة والمحاكاة الجوية' : 'One operational view for airborne command and simulation'}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#cbbba5] sm:text-base">{isArabic ? 'تابع جاهزية الأسطول، صحة الشبكة، ومسار المحاكاة من مساحة عمل واحدة مصممة لاتخاذ القرار بسرعة ووضوح.' : 'Monitor fleet readiness, network health, and simulation flow from one workspace designed for fast, clear decisions.'}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => navigateToModule('command-center', 'asab')} className="ui-btn ui-btn-primary inline-flex items-center gap-2 px-4 text-xs"><Radio className="h-4 w-4" />{isArabic ? 'فتح مركز العمليات' : 'Open command center'}<Arrow className="h-4 w-4" /></button>
              <button type="button" onClick={() => navigateToModule('live-flight-simulation', 'aerolab')} className="ui-btn ui-btn-secondary inline-flex items-center gap-2 px-4 text-xs"><Plane className="h-4 w-4 text-[#8fc46a]" />{isArabic ? 'بدء المحاكاة الحية' : 'Start live simulation'}</button>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-5 end-6 hidden text-end opacity-20 lg:block"><div className="font-mono text-[10px] tracking-[.28em] text-[#e2bd83]">ASAB / AEROLAB</div><div className="mt-1 text-7xl font-black text-[#e2bd83]">عَصَب</div></div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard icon={Plane} label={isArabic ? 'العقد الجوية' : 'Air nodes'} value={nodes.length} detail={isArabic ? `${activeCount} نشطة · ${standbyCount} استعداد` : `${activeCount} active · ${standbyCount} standby`} tone="gold" />
          <MetricCard icon={Network} label={isArabic ? 'روابط الشبكة' : 'Network links'} value={metrics.activeLinksCount} detail={isArabic ? `${metrics.totalThroughputMbps} ميجابت/ث نطاق` : `${metrics.totalThroughputMbps} Mbps throughput`} tone="blue" />
          <MetricCard icon={ShieldCheck} label={isArabic ? 'صحة الشبكة' : 'Network health'} value={`${metrics.networkHealthPercent}%`} detail={isArabic ? 'الحالة مستقرة' : 'System stable'} tone="green" />
          <MetricCard icon={Activity} label={isArabic ? 'تسليم الحزم' : 'Packet delivery'} value={`${metrics.packetDeliveryRatio}%`} detail={isArabic ? `${metrics.averageLatencyMs} مللي ثانية استجابة` : `${metrics.averageLatencyMs} ms latency`} tone="amber" />
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3"><div><span className="section-kicker">{isArabic ? 'نقاط الانطلاق' : 'QUICK LAUNCH'}</span><h2 className="mt-1 text-lg font-bold text-[#f4eadb]">{isArabic ? 'مساحات العمل الأساسية' : 'Core workspaces'}</h2></div><span className="hidden text-[11px] text-[#9d8d78] sm:block">{isArabic ? 'اختصارات تشغيلية للوصول السريع' : 'Operational shortcuts for fast access'}</span></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => { const Icon = action.icon; return <button type="button" key={action.id} onClick={() => navigateToModule(action.id, action.env)} className={`quick-launch tone-${action.tone}`}><span className="quick-launch-icon"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1 text-start"><strong>{action.title}</strong><small>{action.description}</small></span><Arrow className="quick-launch-arrow h-4 w-4" /></button>; })}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <section className="ui-panel overflow-hidden p-4 sm:p-5">
            <div className="panel-heading"><div className="flex items-center gap-2"><span className="panel-icon gold"><Radio className="h-4 w-4" /></span><div><span className="section-kicker">{isArabic ? 'الأسطول' : 'FLEET'}</span><h2>{isArabic ? 'جاهزية العقد الجوية' : 'Airborne readiness'}</h2></div></div><button type="button" onClick={() => navigateToModule('airborne-fleet', 'asab')} className="panel-link">{isArabic ? 'عرض الكل' : 'View all'}<Arrow className="h-3.5 w-3.5" /></button></div>
            <div className="mt-4 space-y-2">{nodes.slice(0, 5).map((node) => <button type="button" key={node.id} onClick={() => navigateToModule('command-center', 'asab')} className="fleet-row"><span className={`fleet-status ${node.status === 'Active' ? 'active' : node.status === 'Standby' ? 'standby' : 'offline'}`} /><span className="min-w-0 flex-1 text-start"><strong>{node.id} <em>·</em> {node.callsign}</strong><small>{node.type} · {node.role}</small></span><span className="fleet-reading"><b>{node.telemetry.altitude} m</b><small>{isArabic ? 'بطارية' : 'BAT'} {node.telemetry.batteryPercent}%</small></span></button>)}</div>
          </section>

          <section className="ui-panel p-4 sm:p-5">
            <div className="panel-heading"><div className="flex items-center gap-2"><span className="panel-icon green"><Gauge className="h-4 w-4" /></span><div><span className="section-kicker">{isArabic ? 'الجاهزية' : 'READINESS'}</span><h2>{isArabic ? 'مؤشرات التشغيل' : 'Operational health'}</h2></div></div><span className="health-label"><span className="status-dot status-dot-live" />{isArabic ? 'مستقر' : 'STABLE'}</span></div>
            <div className="health-stack mt-5"><HealthBar label={isArabic ? 'تغطية الشبكة' : 'Network coverage'} value={metrics.networkHealthPercent} tone="green" /><HealthBar label={isArabic ? 'تسليم البيانات' : 'Data delivery'} value={metrics.packetDeliveryRatio} tone="gold" /><HealthBar label={isArabic ? 'جاهزية الأسطول' : 'Fleet readiness'} value={Math.round((activeCount / Math.max(nodes.length, 1)) * 100)} tone="blue" /></div>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#d8c7b0]/10 pt-4 text-center"><MiniValue label={isArabic ? 'نشطة' : 'Active'} value={activeCount} tone="green" /><MiniValue label={isArabic ? 'استعداد' : 'Standby'} value={standbyCount} tone="amber" /><MiniValue label={isArabic ? 'منقطعة' : 'Offline'} value={disconnectedCount} tone="red" /></div>
          </section>
        </div>
      </div>
    </div>
  );
};

function MetricCard({ icon: Icon, label, value, detail, tone }: { icon: React.ElementType; label: string; value: string | number; detail: string; tone: string }) {
  return <article className={`overview-metric metric-${tone}`}><div className="flex items-center justify-between gap-2"><span>{label}</span><Icon className="h-4 w-4" /></div><strong>{value}</strong><small>{detail}</small></article>;
}
function HealthBar({ label, value, tone }: { label: string; value: number; tone: string }) { return <div className="health-row"><div className="mb-1.5 flex justify-between gap-2 text-[11px]"><span>{label}</span><b>{value}%</b></div><div className="health-track"><span className={`health-fill ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>; }
function MiniValue({ label, value, tone }: { label: string; value: number; tone: string }) { return <div className={`mini-value ${tone}`}><strong>{value}</strong><span>{label}</span></div>; }
