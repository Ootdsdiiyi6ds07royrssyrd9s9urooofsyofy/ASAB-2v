import React from 'react';
import { Activity, ArrowUpLeft, CheckCircle2, Clock3, Layers3, Map, Plane, Play, Radio, ShieldCheck, Target, Wifi } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { countStatuses, formatMetric, formatRelativeAge, labelStatus, operationalReadiness } from '../../utils/presentation';

export const OverviewView: React.FC = () => {
  const { nodes, links, metrics, settings, navigateToModule } = useSimulation();
  const ar = settings.language === 'ar';
  const statusCounts = countStatuses(nodes);
  const active = statusCounts.Active;
  const standby = statusCounts.Standby;
  const offline = statusCounts.Disconnected + statusCounts.Unavailable;
  const readiness = operationalReadiness(nodes);
  const time = new Intl.DateTimeFormat(ar ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  const updatedAt = Date.now();

  const actions = [
    { id: 'command-center', env: 'asab' as const, icon: Radio, title: ar ? 'مركز القيادة' : 'Command center', text: ar ? 'إدارة العقد والقرارات التشغيلية' : 'Manage nodes and operational decisions', color: 'gold' },
    { id: 'cop', env: 'asab' as const, icon: Map, title: ar ? 'المشهد التشغيلي' : 'Operational picture', text: ar ? 'خريطة الميدان وساحة التدريب' : 'Field map and training arena', color: 'blue' },
    { id: 'live-flight-simulation', env: 'aerolab' as const, icon: Play, title: ar ? 'محاكاة حية' : 'Live simulation', text: ar ? 'قيادة صوتية وبيانات لحظية' : 'Voice control and live telemetry', color: 'green' },
  ];

  return (
    <div className="command-deck-page h-full overflow-y-auto" dir={ar ? 'rtl' : 'ltr'}>
      <div className="command-deck-wrap">
        <div className="deck-topline"><span className="deck-eyebrow"><span className="status-dot status-dot-live" />{ar ? 'غرفة العمليات · محاكاة محلية' : 'OPERATIONS ROOM · LOCAL SIMULATION'}</span><span className="deck-time"><Clock3 /> {time} · {ar ? 'وقت الجهاز' : 'device time'}</span></div>
        <div className="data-integrity-note"><Activity aria-hidden="true" /><span><strong>{ar ? 'مصدر البيانات:' : 'Data source:'}</strong> {ar ? 'المؤشرات محسوبة من حالة المحاكاة الحالية وليست قياسات ميدانية أو بثًا حقيقيًا.' : 'Metrics are derived from the current simulation state, not field measurements or a live feed.'}</span></div>
        <section className="deck-hero">
          <div className="deck-hero-copy"><div className="deck-breadcrumb">{ar ? 'الرؤية التشغيلية / الرئيسية' : 'OPERATIONAL VIEW / HOME'}</div><h1>{ar ? 'قرارك الجوي يبدأ هنا.' : 'Your airborne decision starts here.'}</h1><p>{ar ? 'لوحة قيادة موحدة تعرض جاهزية الأسطول، سلامة الشبكة، والانتقال إلى المحاكاة من دون ضوضاء.' : 'A unified command surface for fleet readiness, network integrity, and immediate simulation access.'}</p><div className="deck-hero-actions"><button type="button" className="deck-primary" onClick={() => navigateToModule('command-center', 'asab')}><Radio />{ar ? 'دخول غرفة القيادة' : 'Enter command room'}<ArrowUpLeft /></button><button type="button" className="deck-secondary" onClick={() => navigateToModule('aircraft-studio', 'aerolab')}><Layers3 />{ar ? 'فحص المنصة الجوية' : 'Inspect airframe'}</button></div><div className="deck-trust"><CheckCircle2 /><span>{ar ? 'الأنظمة الأساسية تعمل ضمن الحدود الاسمية' : 'Core systems operating within nominal limits'}</span></div></div>
          <div className="deck-orbit" aria-label={ar ? 'مخطط بصري للشبكة الجوية' : 'Air network visual'}><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-ring ring-three" /><div className="orbit-core"><span>عَصَب</span><small>ASAB / 2V</small></div>{nodes.slice(0, 6).map((node, index) => <span key={node.id} className={`orbit-node orbit-node-${index + 1}`} title={node.id}><i className={node.status === 'Active' ? 'online' : node.status === 'Standby' ? 'standby' : 'offline'} /><b>{String(index + 1).padStart(2, '0')}</b></span>)}<div className="orbit-caption"><Wifi /> {metrics.networkHealthPercent}% <span>{ar ? 'صحة الشبكة' : 'NETWORK HEALTH'}</span></div></div>
        </section>
        <section className="deck-stat-grid"><DeckStat icon={Plane} label={ar ? 'العقد الجوية' : 'AIR NODES'} value={nodes.length} note={`${active} ${ar ? 'نشطة' : 'active'}`} tone="gold" /><DeckStat icon={Wifi} label={ar ? 'الروابط الفعالة' : 'ACTIVE LINKS'} value={metrics.activeLinksCount} note={formatMetric(metrics.totalThroughputMbps, 'Mbps', ar ? 'ar' : 'en')} tone="blue" /><DeckStat icon={ShieldCheck} label={ar ? 'صحة الشبكة' : 'NETWORK HEALTH'} value={`${metrics.networkHealthPercent}%`} note={ar ? 'محسوبة من الروابط المتاحة' : 'calculated from available links'} tone="green" /><DeckStat icon={Activity} label={ar ? 'تسليم تقديري' : 'ESTIMATED DELIVERY'} value={`${metrics.packetDeliveryRatio}%`} note={formatMetric(metrics.averageLatencyMs, 'ms', ar ? 'ar' : 'en')} tone="amber" /></section>
        <div className="deck-content-grid"><section className="deck-panel deck-actions-panel"><div className="deck-panel-head"><div><span className="deck-section-label">{ar ? 'الوصول السريع' : 'QUICK ACCESS'}</span><h2>{ar ? 'ماذا تريد أن تفعل؟' : 'What do you want to do?'}</h2></div><Target /></div><div className="deck-action-list">{actions.map((action) => { const Icon = action.icon; return <button type="button" className={`deck-action ${action.color}`} key={action.id} onClick={() => navigateToModule(action.id, action.env)}><span className="deck-action-icon"><Icon /></span><span><b>{action.title}</b><small>{action.text}</small></span><ArrowUpLeft className="deck-action-arrow" /></button>; })}</div></section><section className="deck-panel"><div className="deck-panel-head"><div><span className="deck-section-label">{ar ? 'قراءة الجاهزية' : 'READINESS READOUT'}</span><h2>{ar ? 'حالة القوة الجوية' : 'Air power status'}</h2></div><ShieldCheck /></div><div className="readout-main"><div className="readout-gauge"><span>{readiness}<small>%</small></span></div><div><b>{ar ? 'الجاهزية التشغيلية المحسوبة' : 'Calculated operational readiness'}</b><p>{ar ? 'مؤشر مشتق من الحالة والبطارية وفقد الحزم، وليس اعتمادًا ميدانيًا.' : 'Derived from status, battery and packet loss; not field certification.'}</p></div></div><div className="readout-rows"><Readout label={labelStatus('Active', ar ? 'ar' : 'en')} value={active} tone="green" /><Readout label={labelStatus('Standby', ar ? 'ar' : 'en')} value={standby} tone="amber" /><Readout label={ar ? 'خارج الخدمة' : 'Out of service'} value={offline} tone="red" /></div></section></div>
        <section className="deck-panel deck-roster"><div className="deck-panel-head"><div><span className="deck-section-label">{ar ? 'آخر وضع تشغيلي' : 'LATEST OPERATIONAL STATE'}</span><h2>{ar ? 'العقد الجوية المراقبة' : 'Monitored air nodes'}</h2></div><button type="button" className="deck-text-button" onClick={() => navigateToModule('airborne-fleet', 'asab')}>{ar ? 'فتح الأسطول' : 'Open fleet'}<ArrowUpLeft /></button></div><div className="roster-grid">{nodes.slice(0, 6).map((node) => <button type="button" className="roster-card" key={node.id} onClick={() => navigateToModule('command-center', 'asab')}><span className={`roster-dot ${node.status === 'Active' ? 'online' : node.status === 'Standby' ? 'standby' : 'offline'}`} /><span className="roster-id">{node.id}</span><b>{node.callsign}</b><small>{node.telemetry.altitude} m · {node.telemetry.batteryPercent}%</small></button>)}</div></section>
        <div className="deck-footer-line"><span><Clock3 /> {ar ? `آخر قراءة ${formatRelativeAge(updatedAt, 'ar', Date.now())}` : `Reading ${formatRelativeAge(updatedAt, 'en', Date.now())}`}</span><span><Activity /> {links.length} {ar ? 'روابط محسوبة من الحالة الحالية' : 'links derived from current state'}</span></div>
      </div>
    </div>
  );
};

function DeckStat({ icon: Icon, label, value, note, tone }: { icon: React.ElementType; label: string; value: string | number; note: string; tone: string }) { return <article className={`deck-stat ${tone}`}><span className="deck-stat-icon"><Icon /></span><span><small>{label}</small><strong>{value}</strong><em>{note}</em></span></article>; }
function Readout({ label, value, tone }: { label: string; value: number; tone: string }) { return <div className="readout-row"><span><i className={tone} />{label}</span><b>{value}</b></div>; }
