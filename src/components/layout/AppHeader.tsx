import React from 'react';
import { Activity, Compass, Cpu, Globe, Maximize2, Menu, Radio, Shield, Wifi } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const AppHeader: React.FC = () => {
  const { nodes, metrics, settings, updateSettings, navigateToModule, mobileSidebarOpen, setMobileSidebarOpen } = useSimulation();
  const isArabic = settings.language === 'ar';
  const activeNodes = nodes.filter((node) => node.status === 'Active').length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  };

  return (
    <header style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }} className="app-header min-h-16 shrink-0 border-b border-[#32261b] bg-[#1a140e]/95 px-3 text-[#f6ecdd] shadow-[0_3px_20px_rgba(76,51,28,0.06)] backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="rounded-xl border border-[#32261b] bg-[#231a12] p-2 text-[#e2c18f] shadow-sm md:hidden" aria-label={isArabic ? 'فتح القائمة' : 'Open menu'}>
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => navigateToModule('command-center', 'asab')} className="flex items-center gap-3 text-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#9a6a3a] text-lg font-bold text-[#120e0a] shadow-md">ع</span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold tracking-wide text-[#f6ecdd]">{isArabic ? 'عَصَب' : 'ASAB'}</span>
              <span className="block text-[9px] tracking-[0.2em] text-[#8c7860]">{isArabic ? 'الأنظمة الجوية' : 'AIRBORNE SYSTEMS'}</span>
            </span>
          </button>
        </div>

        <nav className="hidden items-center gap-1 rounded-2xl border border-[#32261b] bg-[#231a12] p-1 shadow-sm lg:flex" aria-label={isArabic ? 'البيئات' : 'Environments'}>
          <button onClick={() => navigateToModule('command-center', 'asab')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${settings.activeEnvironment === 'asab' ? 'bg-[#9a6a3a] text-[#120e0a] shadow-sm' : 'text-[#b9a58c] hover:bg-[#32261b]'}`}>
            <Compass className="h-4 w-4" /> {isArabic ? 'القيادة' : 'Command'}
          </button>
          <button onClick={() => navigateToModule('aircraft-studio', 'aerolab')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${settings.activeEnvironment === 'aerolab' ? 'bg-[#b5793f] text-white shadow-sm' : 'text-[#b9a58c] hover:bg-[#32261b]'}`}>
            <Cpu className="h-4 w-4" /> {isArabic ? 'أيرولاب' : 'AeroLab'}
          </button>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-[#32261b] bg-[#231a12] px-3 py-2 text-[10px] shadow-sm md:flex"><Radio className="h-3.5 w-3.5 text-[#8fc46a]" /><span className="text-[#8c7860]">{isArabic ? 'الأسطول' : 'Fleet'}</span><b className="text-[#f6ecdd]">{activeNodes}/{nodes.length}</b></div>
          <div className="hidden items-center gap-2 rounded-xl border border-[#32261b] bg-[#231a12] px-3 py-2 text-[10px] shadow-sm xl:flex"><Wifi className="h-3.5 w-3.5 text-[#b5793f]" /><span className="text-[#8c7860]">{isArabic ? 'الشبكة' : 'Network'}</span><b className="text-[#8fc46a]">{metrics.networkHealthPercent}%</b></div>
          <div className="hidden items-center gap-2 rounded-xl border border-[#32261b] bg-[#231a12] px-3 py-2 text-[10px] shadow-sm xl:flex"><Shield className="h-3.5 w-3.5 text-[#8fc46a]" /><span className="text-[#8c7860]">{isArabic ? 'آمن' : 'Secure'}</span></div>
          <button onClick={() => updateSettings({ language: isArabic ? 'en' : 'ar' })} className="rounded-xl border border-[#32261b] bg-[#231a12] p-2 text-[#e2c18f] shadow-sm transition hover:border-[#9a6a3a]" title={isArabic ? 'English' : 'العربية'}><Globe className="h-4 w-4" /></button>
          <button onClick={toggleFullscreen} className="hidden rounded-xl border border-[#32261b] bg-[#231a12] p-2 text-[#b9a58c] shadow-sm transition hover:border-[#9a6a3a] sm:block" aria-label={isArabic ? 'ملء الشاشة' : 'Fullscreen'}><Maximize2 className="h-4 w-4" /></button>
        </div>
      </div>
    </header>
  );
};
