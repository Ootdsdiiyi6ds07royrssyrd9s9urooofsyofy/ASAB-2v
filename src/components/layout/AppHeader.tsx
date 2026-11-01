import React from 'react';
import { Activity, Check, ChevronDown, Compass, Cpu, Globe2, Maximize2, Menu, Radio, ShieldCheck, Wifi } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const AppHeader: React.FC = () => {
  const { nodes, metrics, settings, updateSettings, navigateToModule, mobileSidebarOpen, setMobileSidebarOpen } = useSimulation();
  const isArabic = settings.language === 'ar';
  const activeNodes = nodes.filter((node) => node.status === 'Active').length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => undefined);
    else document.exitFullscreen?.().catch(() => undefined);
  };

  return (
    <header className="app-header" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="app-header-inner">
        <div className="header-brand-cluster">
          <button type="button" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="icon-button mobile-menu-button" aria-label={isArabic ? 'فتح قائمة التنقل' : 'Open navigation'} aria-expanded={mobileSidebarOpen}>
            <Menu aria-hidden="true" />
          </button>
          <button type="button" onClick={() => navigateToModule('command-center', 'asab')} className="brand-lockup" aria-label={isArabic ? 'العودة إلى مركز القيادة' : 'Return to command center'}>
            <span className="brand-mark">ع</span>
            <span className="brand-copy"><strong>عَصَب</strong><small>{isArabic ? 'القيادة الجوية السيادية' : 'SOVEREIGN AIR SYSTEMS'}</small></span>
          </button>
        </div>

        <div className="workspace-switcher" role="tablist" aria-label={isArabic ? 'بيئة العمل' : 'Workspace'}>
          <button type="button" role="tab" aria-selected={settings.activeEnvironment === 'asab'} onClick={() => navigateToModule('command-center', 'asab')} className={settings.activeEnvironment === 'asab' ? 'is-selected' : ''}><Compass aria-hidden="true" /><span>{isArabic ? 'عَصَب' : 'COMMAND'}</span></button>
          <button type="button" role="tab" aria-selected={settings.activeEnvironment === 'aerolab'} onClick={() => navigateToModule('aircraft-studio', 'aerolab')} className={settings.activeEnvironment === 'aerolab' ? 'is-selected aerolab' : ''}><Cpu aria-hidden="true" /><span>{isArabic ? 'أيرولاب' : 'AEROLAB'}</span></button>
        </div>

        <div className="header-actions">
          <div className="header-status-rail" aria-label={isArabic ? 'حالة المنظومة' : 'System status'}>
            <span className="header-status"><Radio aria-hidden="true" /><span>{isArabic ? 'الأسطول' : 'Fleet'}</span><b>{activeNodes}/{nodes.length}</b></span>
            <span className="header-status network"><Wifi aria-hidden="true" /><span>{isArabic ? 'الشبكة' : 'Network'}</span><b>{metrics.networkHealthPercent}%</b></span>
            <span className="header-status secure"><ShieldCheck aria-hidden="true" /><span>{isArabic ? 'محمية' : 'Secure'}</span><Check aria-hidden="true" /></span>
          </div>
          <button type="button" onClick={() => updateSettings({ language: isArabic ? 'en' : 'ar' })} className="icon-button" title={isArabic ? 'English' : 'العربية'} aria-label={isArabic ? 'التبديل إلى الإنجليزية' : 'التبديل إلى العربية'}><Globe2 aria-hidden="true" /></button>
          <button type="button" onClick={toggleFullscreen} className="icon-button desktop-only" aria-label={isArabic ? 'ملء الشاشة' : 'Fullscreen'}><Maximize2 aria-hidden="true" /></button>
          <div className="header-live-pill"><span className="status-dot status-dot-live" /> <span>{isArabic ? 'مباشر' : 'LIVE'}</span><ChevronDown aria-hidden="true" /></div>
        </div>
      </div>
      <div className="header-subline"><span>{isArabic ? 'منظومة المحاكاة والقيادة الجوية' : 'Airborne command and simulation system'}</span><span className="subline-clock"><Activity aria-hidden="true" /> {isArabic ? 'المزامنة مستقرة' : 'Sync stable'}</span></div>
    </header>
  );
};
