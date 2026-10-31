import React from 'react';
import { useSimulation } from '../../context/SimulationContext';

interface Props { children: React.ReactNode; isArabic: boolean; resetKey: string; }
interface State { hasError: boolean; message: string; }

class Boundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };
  static getDerivedStateFromError(e: unknown): State {
    return { hasError: true, message: e instanceof Error ? e.message : String(e) };
  }
  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) this.setState({ hasError: false, message: '' });
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    const ar = this.props.isArabic;
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-3 p-5 rounded-xl border border-[#e8584a]/40 bg-[#1a140e]">
          <div className="text-base font-bold text-[#f6ecdd]">{ar ? 'تعذّر عرض هذه الصفحة' : 'This view failed to render'}</div>
          <div className="text-xs text-[#b9a58c] font-mono break-words">{this.state.message}</div>
          <div className="text-xs text-[#b9a58c]">
            {ar ? 'قد يكون السبب عدم دعم WebGL في جهازك. جرّب صفحة أخرى أو أعد التحميل.' : 'This may be caused by missing WebGL support. Try another view or reload.'}
          </div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-[#9a6a3a] text-[#120e0a] text-xs font-bold">
            {ar ? 'إعادة التحميل' : 'Reload'}
          </button>
        </div>
      </div>
    );
  }
}

export const ViewErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSimulation();
  return <Boundary isArabic={settings.language === 'ar'} resetKey={settings.activeModuleId}>{children}</Boundary>;
};
