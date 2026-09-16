import React from 'react';
import { SpacecraftComponent } from '../types';
import { ShieldAlert, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface ShortCircuitAndLeakageMetersProps {
  components: SpacecraftComponent[];
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
}

export const ShortCircuitAndLeakageMeters: React.FC<ShortCircuitAndLeakageMetersProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
}) => {
  // Find highest leakage component
  const maxLeakageComp = [...components].sort((a, b) => b.leakageCurrent - a.leakageCurrent)[0];
  const maxLeakage = maxLeakageComp?.leakageCurrent || 0;

  // Find highest short circuit risk component
  const maxRiskComp = [...components].sort((a, b) => b.shortCircuitRisk - a.shortCircuitRisk)[0];
  const maxRisk = maxRiskComp?.shortCircuitRisk || 0;

  // Average risk
  const avgRisk = Math.round(
    components.reduce((acc, c) => acc + c.shortCircuitRisk, 0) / (components.length || 1)
  );

  return (
    <div
      id="short-circuit-leakage-meters"
      className="bg-[#131926] border border-[#232f42] rounded-xl p-4 shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#232f42]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-600/15 text-amber-400 rounded-lg border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                CURRENT LEAKAGE & SHORT-CIRCUIT HAZARD MONITOR
              </h3>
            </div>
          </div>
        </div>

        {/* Dual Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Gauge 1: Max Ground Leakage Current */}
          <div className="bg-[#0f141f] border border-[#1e2838] rounded-lg p-3 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                PEAK CHASSIS LEAKAGE
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  maxLeakage > 50
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                    : maxLeakage > 20
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                    : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                }`}
              >
                {maxLeakage > 50 ? 'GROUND FAULT' : maxLeakage > 20 ? 'ELEVATED' : 'SAFE'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {maxLeakage.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">mA Ground</span>
            </div>

            {/* Gauge Track */}
            <div className="w-full h-2 bg-[#1b2332] rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  maxLeakage > 50 ? 'bg-rose-500' : maxLeakage > 20 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, (maxLeakage / 120) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>0 mA</span>
              <span>20 mA Limit</span>
              <span>&gt;60 mA Danger</span>
            </div>

            <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
              Source: <span className="text-slate-200 font-semibold">{maxLeakageComp?.name}</span>
            </div>
          </div>

          {/* Gauge 2: Max Short Circuit Hazard Index */}
          <div className="bg-[#0f141f] border border-[#1e2838] rounded-lg p-3 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                SHORT CIRCUIT RISK
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  maxRisk > 60
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                    : maxRisk > 30
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                    : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                }`}
              >
                {maxRisk > 60 ? 'HIGH HAZARD' : maxRisk > 30 ? 'ELEVATED' : 'MINIMAL'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold font-mono text-rose-400">
                {maxRisk}%
              </span>
              <span className="text-xs font-mono text-slate-400">Peak Probability</span>
            </div>

            {/* Gauge Track */}
            <div className="w-full h-2 bg-[#1b2332] rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  maxRisk > 60 ? 'bg-rose-500' : maxRisk > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, maxRisk)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>0% Stable</span>
              <span>35% Threshold</span>
              <span>100% Imminent Arc</span>
            </div>

            <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
              Critical Node: <span className="text-rose-300 font-semibold">{maxRiskComp?.name}</span>
            </div>
          </div>
        </div>

        {/* Component Risk Breakdown Matrix */}
        <span className="block text-[11px] font-mono text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">
          All Component Risk Matrix:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {components.map((c) => {
            const isSelected = c.id === selectedComponentId;
            const isHigh = c.shortCircuitRisk > 50 || c.leakageCurrent > 30;

            return (
              <div
                key={c.id}
                id={`matrix-item-${c.id}`}
                onClick={() => onSelectComponent(c.id)}
                className={`p-2 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#1a2436] border-blue-500 shadow-sm'
                    : isHigh
                    ? 'bg-rose-950/30 border-rose-800/60 hover:bg-rose-900/40'
                    : 'bg-[#0f141f] border-[#1e2838] hover:border-[#2a374b]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-200 truncate">{c.name}</span>
                  <span
                    className={`${
                      c.shortCircuitRisk > 50
                        ? 'text-rose-400'
                        : c.shortCircuitRisk > 25
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {c.shortCircuitRisk}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Leak:</span>
                  <span className="text-slate-300">{c.leakageCurrent.toFixed(1)}mA</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#232f42] text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>System Avg Risk: <strong className="text-slate-200">{avgRisk}%</strong></span>
        <span className="text-emerald-400 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> GFCI Auto-Breakers Active
        </span>
      </div>
    </div>
  );
};
