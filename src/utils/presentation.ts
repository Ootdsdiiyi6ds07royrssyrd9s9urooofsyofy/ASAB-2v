import type { AircraftNode, NodeStatus } from '../types';

export const STATUS_LABELS = {
  ar: { Active: 'نشطة', Standby: 'استعداد', Disconnected: 'منقطعة', Recovering: 'استعادة', Unavailable: 'غير متاحة' },
  en: { Active: 'Active', Standby: 'Standby', Disconnected: 'Disconnected', Recovering: 'Recovering', Unavailable: 'Unavailable' },
} as const;

export function labelStatus(status: NodeStatus, language: 'ar' | 'en') {
  return STATUS_LABELS[language][status];
}

export function formatNumber(value: number, language: 'ar' | 'en' = 'ar', maximumFractionDigits = 1) {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { maximumFractionDigits }).format(value);
}

export function formatMetric(value: number, unit: string, language: 'ar' | 'en' = 'ar', maximumFractionDigits = 1) {
  return `${formatNumber(value, language, maximumFractionDigits)} ${unit}`;
}

export function operationalReadiness(nodes: AircraftNode[]) {
  if (!nodes.length) return 0;
  const score = nodes.reduce((total, node) => {
    const telemetry = node.telemetry;
    const connection = Math.max(0, Math.min(1, 1 - telemetry.packetLossPercent / 100));
    const battery = Math.max(0, Math.min(1, telemetry.batteryPercent / 100));
    const stateWeight = node.status === 'Active' ? 1 : node.status === 'Standby' ? 0.65 : node.status === 'Recovering' ? 0.4 : 0;
    return total + stateWeight * (connection * 0.6 + battery * 0.4);
  }, 0);
  return Math.round((score / nodes.length) * 100);
}

export function countStatuses(nodes: AircraftNode[]) {
  return nodes.reduce<Record<NodeStatus, number>>((counts, node) => {
    counts[node.status] += 1;
    return counts;
  }, { Active: 0, Standby: 0, Disconnected: 0, Recovering: 0, Unavailable: 0 });
}

export function formatRelativeAge(timestamp: number, language: 'ar' | 'en' = 'ar', now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (language === 'ar') return seconds < 60 ? `منذ ${formatNumber(seconds, 'ar', 0)} ث` : `منذ ${formatNumber(Math.round(seconds / 60), 'ar', 0)} د`;
  return seconds < 60 ? `${seconds}s ago` : `${Math.round(seconds / 60)}m ago`;
}
