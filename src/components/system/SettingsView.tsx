import React from 'react';
import { Gauge, Globe, Layers, RotateCcw, Settings as SettingsIcon, Sliders, Volume2, Upload, Trash2, HardDrive } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { useAssets } from '../../context/AssetContext';
import type { AssetKind } from '../../types/assets';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetSimulation } = useSimulation();
  const { assets, ready, saveAsset, removeAsset } = useAssets();
  const isArabic = settings.language === 'ar';
  const qualityNames = isArabic ? { low: 'اقتصادي', medium: 'متوازن', high: 'فائق' } : { low: 'Low', medium: 'Medium', high: 'High' };
  const speedNames = isArabic ? { 0.5: 'نصف السرعة', 1: 'طبيعي', 2: 'ضعف السرعة', 4: 'أربع مرات' } : { 0.5: '0.5x Realtime', 1: '1x Realtime', 2: '2x Realtime', 4: '4x Realtime' };
  const assetLabels: Record<AssetKind, [string, string, string]> = {
    aircraft: ['نموذج الطائرة 3D', 'Aircraft 3D model', '.glb,.gltf,.bin'],
    map3d: ['خريطة المحاكاة 3D', 'Simulation 3D map', '.glb,.gltf,.bin'],
    routes: ['المسارات والنقاط', 'Routes and points', '.geojson,.json,.csv'],
    mass: ['الوزنية والكتلة', 'Mass properties', '.json,.csv'],
    mechanics: ['الميكانيكل والمعادلات', 'Mechanics and equations', '.json,.csv,.txt,.ts'],
  };
  const handleAsset = async (kind: AssetKind, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await saveAsset(kind, file);
    event.target.value = '';
  };

  return (
    <div className="h-full max-w-4xl space-y-4 overflow-y-auto bg-[#120e0a] p-3 text-xs text-[#f6ecdd] sm:space-y-6 sm:p-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="border-b border-[#32261b] pb-5">
        <h1 className="flex items-center gap-2 text-xl font-bold"><SettingsIcon className="h-5 w-5 text-[#9a6a3a]" />{isArabic ? 'إعدادات المنظومة' : 'System settings'}</h1>
        <p className="mt-2 font-sans text-[11px] leading-7 text-[#b9a58c]">{isArabic ? 'تحكم في اللغة، جودة الرسوم، سرعة المحاكاة، وطبقات المجال الجوي من مكان واحد.' : 'Manage language, visual quality, simulation speed, and airspace layers from one place.'}</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-[#32261b] bg-[#1a140e] p-5">
        <div className="flex items-center gap-2 text-sm font-bold"><Globe className="h-4 w-4 text-[#9a6a3a]" />{isArabic ? 'لغة الواجهة واتجاهها' : 'Interface language and direction'}</div>
        <div className="grid max-w-md grid-cols-2 gap-3">
          <button onClick={() => updateSettings({ language: 'en' })} className={`rounded-xl border p-3 text-start transition ${settings.language === 'en' ? 'border-[#9a6a3a] bg-[#32261b] text-[#e2c18f]' : 'border-[#32261b] bg-[#231a12] text-[#b9a58c]'}`}><div className="font-bold">English</div><div className="mt-1 text-[10px] text-[#8c7860]">Left to right</div></button>
          <button onClick={() => updateSettings({ language: 'ar' })} className={`rounded-xl border p-3 text-end transition ${settings.language === 'ar' ? 'border-[#9a6a3a] bg-[#32261b] text-[#e2c18f]' : 'border-[#32261b] bg-[#231a12] text-[#b9a58c]'}`}><div className="font-arabic font-bold">العربية</div><div className="mt-1 text-[10px] text-[#8c7860]">من اليمين إلى اليسار</div></button>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#32261b] bg-[#1a140e] p-5">
        <div className="flex items-center gap-2 text-sm font-bold"><Gauge className="h-4 w-4 text-[#b5793f]" />{isArabic ? 'جودة الرسوم ثلاثية الأبعاد' : '3D rendering quality'}</div>
        <div className="grid max-w-md grid-cols-3 gap-3">{(['low', 'medium', 'high'] as const).map((quality) => <button key={quality} onClick={() => updateSettings({ quality })} className={`rounded-xl border p-3 font-bold transition ${settings.quality === quality ? 'border-[#b5793f] bg-[#32261b] text-[#e2c18f]' : 'border-[#32261b] bg-[#231a12] text-[#b9a58c]'}`}>{qualityNames[quality]}</button>)}</div>
        <p className="font-sans text-[10px] leading-6 text-[#8c7860]">{isArabic ? 'تؤثر الجودة على الظلال ودقة العرض وأداء المحاكاة على الأجهزة المختلفة.' : 'Controls shadows, pixel ratio, and performance across devices.'}</p>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#32261b] bg-[#1a140e] p-5">
        <div className="flex items-center gap-2 text-sm font-bold"><Sliders className="h-4 w-4 text-[#f5b82e]" />{isArabic ? 'سرعة المحاكاة' : 'Simulation speed'}</div>
        <div className="flex flex-wrap gap-2">{([0.5, 1, 2, 4] as const).map((speed) => <button key={speed} onClick={() => updateSettings({ simulationSpeed: speed })} className={`rounded-xl border px-4 py-2 font-bold transition ${settings.simulationSpeed === speed ? 'border-[#f5b82e] bg-[#f5b82e] text-[#120e0a]' : 'border-[#32261b] bg-[#231a12] text-[#b9a58c] hover:text-[#f6ecdd]'}`}>{speedNames[speed]}</button>)}</div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#32261b] bg-[#1a140e] p-5">
        <div className="flex items-center gap-2 text-sm font-bold"><Volume2 className="h-4 w-4 text-[#9a6a3a]" />{isArabic ? 'الصوت والردود الصوتية' : 'Audio and voice replies'}</div>
        <button onClick={() => updateSettings({ audioEnabled: !settings.audioEnabled })} className={`flex w-full items-center justify-between rounded-xl border p-3 text-start font-bold transition ${settings.audioEnabled ? 'border-[#3ddc97]/40 bg-[#3ddc97]/10 text-[#3ddc97]' : 'border-[#32261b] bg-[#231a12] text-[#b9a58c]'}`}>
          <span>{isArabic ? (settings.audioEnabled ? 'الصوت مفعل' : 'الصوت مكتوم') : (settings.audioEnabled ? 'Audio enabled' : 'Audio muted')}</span>
          <span className="text-[10px]">{settings.audioEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#32261b] bg-[#1a140e] p-5">
        <div className="flex items-center gap-2 text-sm font-bold"><Layers className="h-4 w-4 text-[#8fc46a]" />{isArabic ? 'طبقات المجال الجوي' : 'Airspace layers'}</div>
        <div className="space-y-3 text-[11px] text-[#b9a58c]">
          <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={settings.showNetworkLayer} onChange={(event) => updateSettings({ showNetworkLayer: event.target.checked })} className="accent-[#9a6a3a]" /><span>{isArabic ? 'إظهار روابط الشبكة الجوية' : 'Show airborne network links'}</span></label>
          <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={settings.showCoverageLayer} onChange={(event) => updateSettings({ showCoverageLayer: event.target.checked })} className="accent-[#9a6a3a]" /><span>{isArabic ? 'إظهار مناطق تغطية العقد' : 'Show node coverage areas'}</span></label>
          <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={settings.showLabels} onChange={(event) => updateSettings({ showLabels: event.target.checked })} className="accent-[#9a6a3a]" /><span>{isArabic ? 'إظهار رموز نداء الطائرات' : 'Show aircraft callsigns'}</span></label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#9a6a3a]/40 bg-[#1a140e] p-5">
        <div className="flex items-center gap-2 text-sm font-bold"><HardDrive className="h-4 w-4 text-[#e2c18f]" />{isArabic ? 'مكتبة الأصول الدائمة' : 'Persistent asset library'}</div>
        <p className="font-sans text-[11px] leading-6 text-[#b9a58c]">{isArabic ? 'ترفع الملفات مرة واحدة وتبقى محفوظة على هذا الجهاز حتى تستبدلها أو تحذفها يدويًا.' : 'Files are retained on this device until you replace or explicitly remove them.'}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {(Object.keys(assetLabels) as AssetKind[]).map((kind) => {
            const [ar, en, accept] = assetLabels[kind];
            const saved = assets[kind];
            return <div key={kind} className="rounded-xl border border-[#32261b] bg-[#231a12] p-3">
              <div className="flex items-start justify-between gap-2"><div><div className="font-bold text-[#f6ecdd]">{isArabic ? ar : en}</div><div className="mt-1 truncate text-[10px] text-[#8c7860]">{saved ? saved.fileName : (isArabic ? 'لم يتم رفع ملف' : 'No file uploaded')}</div></div>{saved && <button type="button" onClick={() => void removeAsset(kind)} className="rounded-lg p-1.5 text-[#e8584a] hover:bg-[#e8584a]/10" title={isArabic ? 'حذف الملف' : 'Remove file'}><Trash2 className="h-3.5 w-3.5" /></button>}</div>
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#9a6a3a]/50 px-3 py-2 text-[11px] font-bold text-[#e2c18f] hover:bg-[#32261b]"><Upload className="h-3.5 w-3.5" />{isArabic ? 'رفع / استبدال' : 'Upload / replace'}<input type="file" accept={accept} className="hidden" onChange={(event) => void handleAsset(kind, event)} /></label>
            </div>;
          })}
        </div>
        <div className="text-[10px] text-[#8c7860]">{ready ? (isArabic ? 'التخزين الدائم جاهز · IndexedDB' : 'Persistent storage ready · IndexedDB') : (isArabic ? 'جارٍ تجهيز التخزين...' : 'Preparing storage...')}</div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#e8584a]/30 bg-[#1a140e] p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-[#e8584a]"><RotateCcw className="h-4 w-4" />{isArabic ? 'إعادة ضبط المنظومة' : 'Restore system defaults'}</div>
        <p className="font-sans text-[11px] leading-6 text-[#b9a58c]">{isArabic ? 'يعيد هذا الإجراء مواقع الطائرات والسيناريوهات وسجل الأحداث إلى الحالة الأصلية.' : 'Reset aircraft positions, scenarios, and event logs to their original state.'}</p>
        <button onClick={() => { resetSimulation(); localStorage.removeItem('asab_custom_scenarios'); }} className="rounded-xl border border-[#e8584a]/40 bg-[#e8584a]/15 px-4 py-2 font-bold text-[#e8584a] transition hover:bg-[#e8584a]/25">{isArabic ? 'استعادة الإعدادات الأصلية' : 'Restore all defaults'}</button>
      </section>
    </div>
  );
};
