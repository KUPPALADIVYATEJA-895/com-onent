import React, { useState } from 'react';
import { SpacecraftComponent } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Zap,
  Thermometer,
  Unplug,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Cpu,
  Activity,
  Maximize2,
  Info,
} from 'lucide-react';

interface CircuitSchematicGraphProps {
  components: SpacecraftComponent[];
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  onToggleCable: (id: string) => void;
}

export const CircuitSchematicGraph: React.FC<CircuitSchematicGraphProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onToggleCable,
}) => {
  const { isIndustrial, isHazard } = useTheme();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Center bus node coordinates in SVG space (1000 x 560)
  const busCenter = { x: 500, y: 280 };

  // Calculate total grid current
  const totalBusCurrent = components.reduce((acc, c) => acc + (c.cableConnected ? c.currentDraw : 0), 0);
  const selectedComp = components.find(c => c.id === selectedComponentId);

  return (
    <div
      id="spacecraft-circuit-schematic-graph"
      className="bg-[#131926] border border-[#232f42] rounded-xl p-4 shadow-md relative flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#232f42]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600/15 text-blue-400 rounded-lg border border-blue-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">
              CHAMBER MONITORING SECTION & CABLE NETWORK
            </h3>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Nominal
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Warning
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Fault
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
            Disconnected
          </span>
        </div>
      </div>

      {/* SVG Canvas for Single-Line Electrical Schematic */}
      <div className="relative w-full aspect-[16/9] min-h-[420px] bg-[#110D09] rounded-lg border border-[#3A2617] overflow-hidden select-none">
        <svg
          viewBox="0 0 1000 560"
          className="relative w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Clean CAD Engineering Grid with warm bronze tone */}
            <pattern id="cad-grid-fine" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#2B1F17" strokeWidth="0.5" strokeOpacity="0.45" />
            </pattern>
            <pattern id="cad-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#483222" strokeWidth="0.8" strokeOpacity="0.5" />
            </pattern>

            {/* Bronze Metallic Gradients for Chamber Module Cards */}
            <linearGradient id="bronze-chamber-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#322215" />
              <stop offset="45%" stopColor="#24170E" />
              <stop offset="100%" stopColor="#180F08" />
            </linearGradient>

            <linearGradient id="bronze-chamber-selected-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A311D" />
              <stop offset="50%" stopColor="#332113" />
              <stop offset="100%" stopColor="#1F130A" />
            </linearGradient>

            <linearGradient id="bronze-chamber-hover-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3C2819" />
              <stop offset="50%" stopColor="#2A1B10" />
              <stop offset="100%" stopColor="#1B1009" />
            </linearGradient>

            {/* Tactical Hazard High-Contrast Pitch Black Gradients */}
            <linearGradient id="hazard-chamber-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#18181D" />
              <stop offset="50%" stopColor="#101014" />
              <stop offset="100%" stopColor="#0A0A0C" />
            </linearGradient>

            <linearGradient id="hazard-chamber-selected-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#242312" />
              <stop offset="50%" stopColor="#18180E" />
              <stop offset="100%" stopColor="#0F0F12" />
            </linearGradient>

            <linearGradient id="hazard-chamber-hover-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E1E26" />
              <stop offset="50%" stopColor="#15151B" />
              <stop offset="100%" stopColor="#0E0E12" />
            </linearGradient>

            <filter id="glow-bronze" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing Neon Filters for Power Lines */}
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* BACKGROUND: CAD Grid */}
          <rect width="1000" height="560" fill="url(#cad-grid-fine)" />
          <rect width="1000" height="560" fill="url(#cad-grid-major)" />

          {/* Clean Engineering Boundary Frame */}
          <rect
            x="20"
            y="20"
            width="960"
            height="520"
            fill="none"
            stroke={isHazard ? '#38381E' : '#3E2818'}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x="32"
            y="38"
            fill={isHazard ? '#FACC15' : '#8C684C'}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="600"
          >
            SCHEMATIC: DC DISTRIBUTION BUS // 480V SYSTEM
          </text>
          <text
            x="840"
            y="38"
            fill={isHazard ? '#FACC15' : '#8C684C'}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="600"
          >
            8-CHANNEL NETWORK
          </text>

          {/* CABLE CONNECTIONS (Central Bus to Chambers) */}
          {components.map((comp) => {
            const isSelected = comp.id === selectedComponentId;
            const isHovered = comp.id === hoveredNode;
            const isConnected = comp.cableConnected;
            const isCritical = comp.status === 'CRITICAL';
            const isOvercurrent = comp.currentDraw > comp.maxCurrent;

            // Wire color
            let wireStroke = isHazard ? '#FACC15' : isIndustrial ? '#E28743' : '#CD7F32';
            if (!isConnected) {
              wireStroke = isHazard ? '#2A2A35' : isIndustrial ? '#525B6C' : '#64748b';
            } else if (isCritical || isOvercurrent) {
              wireStroke = '#ef4444'; // Red for fault
            } else if (comp.status === 'WARNING') {
              wireStroke = '#f59e0b'; // Amber
            }

            // Path from central bus to component
            const pathD = `M ${busCenter.x} ${busCenter.y} Q ${(busCenter.x + comp.gridX) / 2} ${(busCenter.y + comp.gridY) / 2} ${comp.gridX} ${comp.gridY}`;

            const activeGlowFilter = isCritical
              ? 'url(#glow-red)'
              : isHazard
              ? 'url(#glow-yellow)'
              : isIndustrial
              ? 'url(#glow-orange)'
              : 'url(#glow-bronze)';

            const activePulseColor = isCritical
              ? '#ff6b6b'
              : comp.currentDraw > comp.maxCurrent
              ? '#ff8787'
              : isHazard
              ? '#FFFFFF'
              : isIndustrial
              ? '#EAD7C3'
              : '#F2C894';

            return (
              <g key={`cable-group-${comp.id}`}>
                {/* Highlight line on hover or selection */}
                {(isSelected || isHovered) && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={wireStroke}
                    strokeWidth={8}
                    strokeOpacity={0.25}
                    filter={activeGlowFilter}
                  />
                )}

                {/* Primary Conductor Cable */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={wireStroke}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeOpacity={isConnected ? 0.95 : 0.35}
                  strokeDasharray={isConnected ? 'none' : '6 5'}
                />

                {/* Animated Electric Power Flow pulses when connected and active */}
                {isConnected && comp.currentDraw > 0 && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={activePulseColor}
                    strokeWidth={2}
                    className={comp.currentDraw > comp.maxCurrent ? 'cable-flow-fast' : 'cable-flow-active'}
                    filter={activeGlowFilter}
                  />
                )}

                {/* Disconnected Open Switch Indicator */}
                {!isConnected && (
                  <g
                    transform={`translate(${(busCenter.x * 0.48 + comp.gridX * 0.52)}, ${(busCenter.y * 0.48 + comp.gridY * 0.52)})`}
                    className="animate-pulse"
                  >
                    <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#2a0d0d" stroke="#ef4444" strokeWidth="1.5" />
                    <line x1="-6" y1="-6" x2="6" y2="6" stroke="#ff8787" strokeWidth="2" />
                    <line x1="6" y1="-6" x2="-6" y2="6" stroke="#ff8787" strokeWidth="2" />
                  </g>
                )}

                {/* Cable Tag Label (Click to toggle) */}
                <g
                  transform={`translate(${(busCenter.x * 0.32 + comp.gridX * 0.68)}, ${(busCenter.y * 0.32 + comp.gridY * 0.68)})`}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => onToggleCable(comp.id)}
                >
                  <rect
                    x="-32"
                    y="-10"
                    width="64"
                    height="20"
                    rx="4"
                    fill={isHazard ? '#121216' : isIndustrial ? '#1E232B' : '#1C120A'}
                    stroke={
                      isConnected
                        ? isSelected
                          ? isHazard
                            ? '#FACC15'
                            : isIndustrial
                            ? '#E28743'
                            : '#CD7F32'
                          : isHazard
                          ? '#383844'
                          : isIndustrial
                          ? '#3E4654'
                          : '#6E4928'
                        : '#7f1d1d'
                    }
                    strokeWidth={isSelected || !isConnected ? 1.5 : 1}
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={
                      isConnected
                        ? isSelected
                          ? isHazard
                            ? '#FACC15'
                            : isIndustrial
                            ? '#E28743'
                            : '#E5A663'
                          : isHazard
                          ? '#FFFFFF'
                          : isIndustrial
                          ? '#EAD7C3'
                          : '#D7B594'
                        : '#f87171'
                    }
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {isConnected ? comp.cableId : 'UNPLUGGED'}
                  </text>
                </g>
              </g>
            );
          })}

          {/* CENTRAL POWER BUS NODE */}
          <g transform={`translate(${busCenter.x}, ${busCenter.y})`} className="cursor-pointer">
            {/* Bus Enclosure */}
            <rect
              x="-65"
              y="-40"
              width="130"
              height="80"
              rx="8"
              fill={isHazard ? '#0D0D10' : isIndustrial ? '#1E232B' : '#1C120B'}
              stroke={isHazard ? '#FACC15' : '#CD7F32'}
              strokeWidth="2"
            />
            {/* Bus Header */}
            <rect
              x="-65"
              y="-40"
              width="130"
              height="22"
              rx="8"
              fill={isHazard ? '#1A1A22' : isIndustrial ? '#2B303A' : '#3A2415'}
            />
            <rect
              x="-65"
              y="-26"
              width="130"
              height="8"
              fill={isHazard ? '#1A1A22' : isIndustrial ? '#2B303A' : '#3A2415'}
            />
            <text
              x="0"
              y="-26"
              textAnchor="middle"
              fill={isHazard ? '#FACC15' : '#EAD7C3'}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              480V DC MAIN BUS
            </text>

            {/* Digital Readout */}
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fill={isHazard ? '#FFFFFF' : isIndustrial ? '#F5EBE1' : '#ffffff'}
              fontSize="16"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {totalBusCurrent.toFixed(1)} A
            </text>
            <text
              x="0"
              y="24"
              textAnchor="middle"
              fill={isHazard ? '#E2E8F0' : isIndustrial ? '#C8B6A2' : '#B89073'}
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="600"
            >
              AGGREGATE LOAD
            </text>
          </g>

          {/* CHAMBER MODULE CARDS */}
          {components.map((comp) => {
            const isSelected = comp.id === selectedComponentId;
            const isHovered = comp.id === hoveredNode;
            const isDisconnected = !comp.cableConnected;
            const isCritical = comp.status === 'CRITICAL';
            const isWarning = comp.status === 'WARNING';
            const isOver = comp.currentDraw > comp.maxCurrent;

            // Status Colors
            let statusColor = '#10b981'; // emerald
            if (isDisconnected) {
              statusColor = '#64748b'; // slate
            } else if (isCritical || isOver) {
              statusColor = '#ef4444'; // red
            } else if (isWarning) {
              statusColor = '#f59e0b'; // amber
            }

            // Category tag abbreviations
            const getCategoryShort = (cat: string) => {
              switch (cat) {
                case 'POWER_GENERATION': return 'PWR';
                case 'PROPULSION': return 'PROP';
                case 'THERMAL_COOLING': return 'CRYO';
                case 'LIFE_SUPPORT': return 'ECLSS';
                case 'AVIONICS': return 'NAV';
                case 'DEFENSE_SHIELDING': return 'SHD';
                case 'COMMUNICATIONS': return 'COMM';
                default: return 'SYS';
              }
            };

            const loadPercent = Math.min(100, (comp.currentDraw / comp.maxCurrent) * 100);

            return (
              <g
                key={`comp-node-${comp.id}`}
                transform={`translate(${comp.gridX}, ${comp.gridY})`}
                className="cursor-pointer transition-transform duration-150"
                onClick={() => onSelectComponent(comp.id)}
                onMouseEnter={() => setHoveredNode(comp.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Box Body - Chamber Rect */}
                <rect
                  x="-80"
                  y="-36"
                  width="160"
                  height="72"
                  rx="6"
                  fill={
                    isHazard
                      ? isSelected
                        ? 'url(#hazard-chamber-selected-grad)'
                        : isHovered
                        ? 'url(#hazard-chamber-hover-grad)'
                        : 'url(#hazard-chamber-grad)'
                      : isSelected
                      ? 'url(#bronze-chamber-selected-grad)'
                      : isHovered
                      ? 'url(#bronze-chamber-hover-grad)'
                      : 'url(#bronze-chamber-grad)'
                  }
                  stroke={
                    isSelected
                      ? isHazard
                        ? '#FACC15'
                        : '#CD7F32'
                      : isHovered
                      ? isHazard
                        ? '#EAB308'
                        : '#B87333'
                      : isHazard
                      ? '#2A2A35'
                      : '#6E4928'
                  }
                  strokeWidth={isSelected ? 2 : 1.25}
                  filter={isSelected ? (isHazard ? 'url(#glow-yellow)' : 'url(#glow-bronze)') : undefined}
                />

                {/* Left Status Accent Bar */}
                <rect
                  x="-80"
                  y="-36"
                  width="4"
                  height="72"
                  rx="2"
                  fill={statusColor}
                />

                {/* Top Row: Chamber Name & Category Badge */}
                <text
                  x="-68"
                  y="-18"
                  fill={isHazard ? '#FFFFFF' : '#F5EBE1'}
                  fontSize="12"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {comp.name}
                </text>

                <rect
                  x="28"
                  y="-28"
                  width="44"
                  height="14"
                  rx="3"
                  fill={isHazard ? '#16161D' : '#1C120A'}
                  stroke={
                    isSelected
                      ? isHazard
                        ? '#FACC15'
                        : '#CD7F32'
                      : isHazard
                      ? '#383846'
                      : '#5A3A1F'
                  }
                  strokeWidth="1"
                />
                <text
                  x="50"
                  y="-18"
                  textAnchor="middle"
                  fill={isHazard ? '#FACC15' : '#D7B594'}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {getCategoryShort(comp.category)}
                </text>

                {/* Subtitle: Subsystem Bus */}
                <text
                  x="-68"
                  y="-4"
                  fill={isHazard ? '#94A3B8' : '#A88B74'}
                  fontSize="8.5"
                  fontFamily="sans-serif"
                >
                  {comp.specDetails.subsystemBus.length > 24
                    ? comp.specDetails.subsystemBus.slice(0, 23) + '..'
                    : comp.specDetails.subsystemBus}
                </text>

                {/* Mini Load Progress Bar Track */}
                <rect
                  x="-68"
                  y="7"
                  width="140"
                  height="3"
                  rx="1.5"
                  fill={isHazard ? '#1E1E28' : '#2A1B11'}
                />
                <rect
                  x="-68"
                  y="7"
                  width={isDisconnected ? 0 : Math.max(4, (140 * loadPercent) / 100)}
                  height="3"
                  rx="1.5"
                  fill={
                    isOver
                      ? '#ef4444'
                      : loadPercent > 75
                      ? '#f59e0b'
                      : isHazard
                      ? '#FACC15'
                      : '#CD7F32'
                  }
                />

                {/* Bottom Row: Current Flow & Temperature Readings */}
                <g transform="translate(-68, 15)">
                  {/* Current Draw */}
                  <text
                    x="0"
                    y="12"
                    fill={isDisconnected ? '#64748b' : isOver ? '#ef4444' : isHazard ? '#FFFFFF' : '#f1f5f9'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isDisconnected ? '0.0 A' : `${comp.currentDraw.toFixed(1)} A`}
                  </text>

                  {/* Temperature */}
                  <text
                    x="82"
                    y="12"
                    fill={comp.temperature >= comp.tempMax ? '#ef4444' : comp.temperature > comp.tempThreshold ? '#f59e0b' : '#10b981'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {comp.temperature.toFixed(0)}°C
                  </text>
                </g>

                {/* Disconnected Badge */}
                {isDisconnected && (
                  <g transform="translate(64, -24)">
                    <rect x="-14" y="-7" width="28" height="14" rx="3" fill="#3f1616" stroke="#ef4444" strokeWidth="0.8" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                      OFF
                    </text>
                  </g>
                )}

                {/* Fault Badge */}
                {isCritical && !isDisconnected && (
                  <g transform="translate(64, -24)">
                    <rect x="-14" y="-7" width="28" height="14" rx="3" fill="#450a0a" stroke="#ef4444" strokeWidth="0.8" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                      FAULT
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Bottom Quick Action Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#131926]/90 border border-[#232f42] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 flex items-center gap-3 shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Selected: <strong className="text-white font-medium">{selectedComp?.name || selectedComponentId}</strong>
          </span>
          <span className="text-[#324056]">|</span>
          <button
            onClick={() => onToggleCable(selectedComponentId)}
            className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-medium"
          >
            <Unplug className="w-3.5 h-3.5 text-slate-400" />
            Toggle Connection
          </button>
        </div>
      </div>
    </div>
  );
};
