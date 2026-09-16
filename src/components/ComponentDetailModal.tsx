import React from 'react';
import { SpacecraftComponent } from '../types';
import {
  X,
  Zap,
  Thermometer,
  Unplug,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Cpu,
} from 'lucide-react';

interface ComponentDetailModalProps {
  component: SpacecraftComponent | null;
  onClose: () => void;
  onUpdateComponent: (id: string, partial: Partial<SpacecraftComponent>) => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  onClose,
  onUpdateComponent,
}) => {
  if (!component) return null;

  const isDisconnected = !component.cableConnected;
  const isOver = component.currentDraw > component.maxCurrent;
  const isHot = component.temperature >= component.tempMax;

  const handleToggleCable = () => {
    const nextConnected = !component.cableConnected;
    onUpdateComponent(component.id, {
      cableConnected: nextConnected,
      currentDraw: nextConnected ? component.nominalCurrent : 0.0,
      shortCircuitRisk: nextConnected ? 6 : 0,
      status: nextConnected ? 'NOMINAL' : 'OFFLINE',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="component-detail-modal"
        className="bg-[#131926] border border-[#232f42] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#232f42] bg-[#0f141f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/15 text-blue-400 rounded-lg border border-blue-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 tracking-tight">
                  {component.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#1b2332] text-slate-300 border border-[#2c384c]">
                  {component.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Subsystem: {component.specDetails.subsystemBus} • Cable Umbilical: {component.cableId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1b2332] text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 bg-[#0f141f]">
          {/* Status Alert Banner if Anomaly */}
          {isDisconnected && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/70 rounded-lg flex items-center justify-between text-xs font-mono text-rose-200">
              <div className="flex items-center gap-2">
                <Unplug className="w-4 h-4 text-rose-400 shrink-0" />
                <span>CABLE UNPLUGGED: Zero current flows to this unit (0.0A). Operational blackout.</span>
              </div>
              <button
                onClick={handleToggleCable}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium text-xs whitespace-nowrap ml-2"
              >
                Plug In
              </button>
            </div>
          )}

          {isOver && !isDisconnected && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/70 rounded-lg flex items-center gap-2 text-xs font-mono text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>OVERCURRENT OVERFLOW: Current draw ({component.currentDraw}A) exceeds rated max ({component.maxCurrent}A).</span>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: Current Draw */}
            <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">CURRENT DRAW</span>
              <div className="text-xl font-bold font-mono text-slate-100">
                {component.currentDraw.toFixed(1)} A
              </div>
              <span className="text-[10px] font-mono text-slate-500">Rated Max: {component.maxCurrent}A</span>
            </div>

            {/* Metric 2: Temperature */}
            <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">TEMPERATURE</span>
              <div
                className={`text-xl font-bold font-mono ${
                  component.temperature >= component.tempMax
                    ? 'text-rose-400'
                    : component.temperature > component.tempThreshold
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}
              >
                {component.temperature.toFixed(1)} °C
              </div>
              <span className="text-[10px] font-mono text-slate-500">Nominal: {component.tempNominal}°C</span>
            </div>

            {/* Metric 3: Chassis Leakage */}
            <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">GROUND LEAKAGE</span>
              <div
                className={`text-xl font-bold font-mono ${
                  component.leakageCurrent > 30 ? 'text-rose-400' : 'text-slate-100'
                }`}
              >
                {component.leakageCurrent.toFixed(1)} mA
              </div>
              <span className="text-[10px] font-mono text-slate-500">Limit: &lt;20.0 mA</span>
            </div>

            {/* Metric 4: Short Circuit Risk */}
            <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">SHORT CIRCUIT RISK</span>
              <div
                className={`text-xl font-bold font-mono ${
                  component.shortCircuitRisk > 50 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {component.shortCircuitRisk}%
              </div>
              <span className="text-[10px] font-mono text-slate-500">Arc Flash Hazard</span>
            </div>
          </div>

          {/* Description & Technical Specs */}
          <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3.5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-200">
              SUBSYSTEM SPECIFICATIONS
            </h4>
            <p className="text-slate-300 leading-relaxed font-sans">
              {component.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px] pt-2 border-t border-[#232f42]">
              <div>Operating Power: <span className="text-slate-200 font-semibold">{component.specDetails.operatingPowerKw} kW</span></div>
              <div>Operating Voltage: <span className="text-slate-200 font-semibold">{component.voltage} V DC</span></div>
              <div>Insulation Dielectric: <span className="text-slate-200 font-semibold">{component.specDetails.insulationRatingKv} kV</span></div>
              <div>Coolant Circuit: <span className="text-slate-200 font-semibold">{component.specDetails.coolantChannel}</span></div>
            </div>
          </div>

          {/* In-Modal Admin Controls */}
          <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-4 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              DIRECT OVERRIDES FOR THIS COMPONENT
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cable Toggle */}
              <button
                onClick={handleToggleCable}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 border transition-colors ${
                  component.cableConnected
                    ? 'bg-rose-950/70 hover:bg-rose-900 border-rose-700/60 text-rose-200'
                    : 'bg-emerald-950/70 hover:bg-emerald-900 border-emerald-700/60 text-emerald-200'
                }`}
              >
                <Unplug className="w-4 h-4" />
                {component.cableConnected ? 'Unplug Cable Umbilical' : 'Plug In Cable Umbilical'}
              </button>

              {/* Reset to Nominal */}
              <button
                onClick={() => {
                  onUpdateComponent(component.id, {
                    cableConnected: true,
                    currentDraw: component.nominalCurrent,
                    temperature: component.tempNominal,
                    leakageCurrent: 2.5,
                    shortCircuitRisk: 5,
                    status: 'NOMINAL',
                  });
                }}
                className="py-2 px-3 bg-[#1b2332] hover:bg-[#232e42] border border-[#2c384c] text-slate-200 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Restore to Nominal Values
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#232f42] bg-[#0f141f] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1b2332] hover:bg-[#232e42] border border-[#2c384c] text-slate-200 rounded-lg text-xs font-mono transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
