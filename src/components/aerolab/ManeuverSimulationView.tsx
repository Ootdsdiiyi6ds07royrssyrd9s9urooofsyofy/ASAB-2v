/**
 * ASAB | AEROLAB 3D - Maneuver Simulation & Obstacle Avoidance
 * Interactive 3D trajectory tracking arena with virtual obstacle clearance and banking maneuvers.
 */

import React, { useState } from 'react';
import {
  FolderGit2,
  Compass,
  Navigation,
  Shield,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { ManeuverArena3DCanvas } from '../3d/ManeuverArena3DCanvas';
import { useSimulation } from '../../context/SimulationContext';

export const ManeuverSimulationView: React.FC = () => {
  const { settings } = useSimulation();
  const [selectedManeuver, setSelectedManeuver] = useState<string>('Obstacle Awareness');

  const isArabic = settings.language === 'ar';

  const maneuvers = [
    'Straight Flight',
    'Gradual Turns',
    'Banking',
    'Altitude Adjustment',
    'Obstacle Awareness',
    'Safe Route Navigation',
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#080D16] font-mono text-xs select-none overflow-hidden relative">
      {/* Top Controls Bar */}
      <div className="h-12 bg-[#0D1623] border-b border-[#172638] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#EDF4FA]">
            <FolderGit2 className="w-4 h-4 text-[#35D5E8]" />
            <span>{isArabic ? 'محاكاة المناورات وتفادي العوائق' : '3D FLIGHT MANEUVER & OBSTACLE ARENA'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
            <span className="text-[#92A4B8]">SELECT MANEUVER:</span>
            <select
              value={selectedManeuver}
              onChange={(e) => setSelectedManeuver(e.target.value)}
              className="p-1 rounded bg-[#111E2D] border border-[#172638] text-[#35D5E8] font-bold focus:outline-none"
            >
              {maneuvers.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main 3D Maneuver Arena Viewport */}
      <div className="flex-1 relative overflow-hidden">
        <ManeuverArena3DCanvas selectedManeuver={selectedManeuver} />
      </div>
    </div>
  );
};
