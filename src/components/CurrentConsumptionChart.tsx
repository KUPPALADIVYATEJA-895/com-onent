import React from 'react';
import { SpacecraftComponent } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Zap,
  AlertTriangle,
  AlertCircle,
  Info,
  Flame,
} from 'lucide-react';

interface CurrentConsumptionChartProps {
  components: SpacecraftComponent[];
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  onUpdateComponent?: (id: string, partial: Partial<SpacecraftComponent>) => void;
  onInspectComponent?: (id: string) => void;
}

export const CurrentConsumptionChart: React.FC<CurrentConsumptionChartProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onInspectComponent,
}) => {
  const { isIndustrial, isHazard } = useTheme();
  // Sort components by current draw descending dynamically
  const sorted = [...components].sort((a, b) => {
    return b.currentDraw - a.currentDraw;
  });

  const maxScaleAmps = Math.max(
    ...components.map((c) => Math.max(c.currentDraw, c.maxCurrent, 120))
  );

  const totalCurrent = components.reduce((acc, c) => acc + (c.cableConnected ? c.currentDraw : 0), 0);
  const highestConsumer = sorted[0];
  const selectedComp =
    components.find((c) => c.id === selectedComponentId) || components[0];

  const handleRowStepCurrent = (
    e: React.MouseEvent,
    comp: SpacecraftComponent,
    delta: number
  ) => {
    e.stopPropagation();
    if (!onUpdateComponent) return;
    const nextCurrent = Math.max(0, Math.round((comp.currentDraw + delta) * 10) / 10);
    onUpdateComponent(comp.id, {
      currentDraw: nextCurrent,
      cableConnected: nextCurrent > 0 ? true : comp.cableConnected,
    });
  };

  return (
    <div
      id="machinery-current-consumption-chart"
      className="bg-[#131926] border border-[#232f42] rounded-xl p-4 sm:p-5 shadow-md flex flex-col justify-between space-y-4 transition-all"
    >
      <div>
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-[#232f42]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/15 text-blue-400 rounded-lg border border-blue-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-tight font-sans">
                  MACHINERY CURRENT CONSUMPTION (A)
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1b2332] text-blue-300 border border-[#2c384c]">
                  REAL-TIME
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live bus distribution across spacecraft chambers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Highest Consumer</span>
              <span className="text-xs font-bold text-blue-300">
                {highestConsumer?.currentDraw > 0 ? highestConsumer.name : 'None (Offline)'} ({highestConsumer?.currentDraw.toFixed(1)}A)
              </span>
            </div>
            <div className="pl-3 border-l border-[#232f42]">
              <span className="text-[10px] text-slate-400 block uppercase">Total Bus Load</span>
              <span className="text-sm font-bold text-slate-100">
                {totalCurrent.toFixed(1)} A
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Ranked Bar Chart List */}
        <div className="space-y-2">
          {sorted.map((comp, idx) => {
            const isSelected = comp.id === selectedComp.id;
            const isZero = comp.currentDraw === 0 || !comp.cableConnected;
            const isOver = comp.currentDraw > comp.maxCurrent;
            const isTop = idx === 0 && comp.currentDraw > 0;
            const percentageOfMax = Math.min(100, (comp.currentDraw / maxScaleAmps) * 100);
            const percentageOfTotal =
              totalCurrent > 0 ? ((comp.currentDraw / totalCurrent) * 100).toFixed(1) : '0';

            let barColor = isHazard ? 'bg-[#FACC15]' : isIndustrial ? 'bg-[#E28743]' : 'bg-blue-500';
            if (isZero) {
              barColor = isHazard ? 'bg-[#25252C]' : isIndustrial ? 'bg-[#3D4554]' : 'bg-slate-700';
            } else if (isOver) {
              barColor = 'bg-rose-500';
            } else if (comp.currentDraw > comp.nominalCurrent * 1.1) {
              barColor = 'bg-amber-500';
            }

            return (
              <div
                key={comp.id}
                id={`bar-current-${comp.id}`}
                onClick={() => onSelectComponent(comp.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors border ${
                  isSelected
                    ? isHazard
                      ? 'bg-[#18181D] border-[#FACC15] ring-1 ring-[#FACC15]/50 shadow-sm'
                      : isIndustrial
                      ? 'bg-[#2B303A] border-[#E28743] ring-1 ring-[#E28743]/50 shadow-sm'
                      : 'bg-[#192436] border-blue-500 ring-1 ring-blue-500/40 shadow-sm'
                    : isHazard
                    ? 'bg-[#101014] border-[#222228] hover:bg-[#181820] hover:border-[#383844]'
                    : isIndustrial
                    ? 'bg-[#1A1E26] border-[#333A47] hover:bg-[#252B35] hover:border-[#475060]'
                    : 'bg-[#0f141f] border-[#1e2838] hover:bg-[#161f2e] hover:border-[#2a374b]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isTop
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-[#182030] text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {comp.name}
                    </span>

                    {/* Dynamic Status Badges */}
                    {isSelected && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-blue-600/20 text-blue-300 border border-blue-500/50 rounded font-medium">
                        ADMIN TARGET
                      </span>
                    )}

                    {isTop && !isZero && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-amber-950/70 text-amber-300 border border-amber-800/60 rounded font-medium flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 text-amber-400" /> TOP CONSUMER
                      </span>
                    )}

                    {isZero && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-rose-950/70 text-rose-300 border border-rose-800/60 rounded font-medium flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" /> DISCONNECTED
                      </span>
                    )}

                    {isOver && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-rose-950/70 text-rose-300 border border-rose-800/60 rounded font-medium flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> OVERFLOW ({comp.currentDraw.toFixed(0)}A &gt; {comp.maxCurrent}A)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Inline Quick Adjustment on hover/active */}
                    <div className="flex items-center gap-1 opacity-90">
                      <button
                        id={`btn-row-minus-${comp.id}`}
                        onClick={(e) => handleRowStepCurrent(e, comp, -5)}
                        title={`Decrease ${comp.name} current by 5A`}
                        className="w-5 h-5 rounded bg-[#1b2332] hover:bg-[#253247] text-slate-300 flex items-center justify-center border border-[#2c384c] text-[10px]"
                      >
                        -
                      </button>
                      <button
                        id={`btn-row-plus-${comp.id}`}
                        onClick={(e) => handleRowStepCurrent(e, comp, 5)}
                        title={`Increase ${comp.name} current by 5A`}
                        className="w-5 h-5 rounded bg-[#1b2332] hover:bg-[#253247] text-slate-300 flex items-center justify-center border border-[#2c384c] text-[10px]"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {percentageOfTotal}% bus
                    </span>

                    <span
                      className={`font-bold font-mono min-w-[54px] text-right ${
                        isZero
                          ? 'text-slate-500'
                          : isOver
                          ? 'text-rose-400'
                          : isTop
                          ? 'text-blue-300'
                          : 'text-slate-100'
                      }`}
                    >
                      {comp.currentDraw.toFixed(1)} A
                    </span>

                    {onInspectComponent && (
                      <button
                        id={`btn-inspect-row-${comp.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectComponent(comp.id);
                        }}
                        title={`Inspect deep specifications for ${comp.name}`}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-[#1b2332] rounded transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-2 bg-[#1b2332] rounded-full overflow-hidden">
                  {/* Rated limit tick indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                    style={{ left: `${(comp.maxCurrent / maxScaleAmps) * 100}%` }}
                    title={`Max rating limit: ${comp.maxCurrent}A`}
                  />
                  {/* Active Bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.max(isZero ? 0 : 2, percentageOfMax)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

