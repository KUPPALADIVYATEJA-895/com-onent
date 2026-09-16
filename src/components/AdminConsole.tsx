import React from 'react';
import {
  SpacecraftComponent,
  FaultPreset,
} from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Sliders,
  Zap,
  Thermometer,
  Unplug,
  Flame,
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Gauge,
  Activity,
} from 'lucide-react';

interface AdminConsoleProps {
  components: SpacecraftComponent[];
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  onUpdateComponent: (id: string, partial: Partial<SpacecraftComponent>) => void;
  onApplyPreset: (preset: FaultPreset) => void;
  presets: FaultPreset[];
  onResetAll: () => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  onFaultTriggered?: (faultTitle: string) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onApplyPreset,
  presets,
  onResetAll,
  isSimulating,
  setIsSimulating,
  onFaultTriggered,
}) => {
  const { isIndustrial, isHazard } = useTheme();
  const [activeFaultBanner, setActiveFaultBanner] = React.useState<string | null>(null);

  const selectedComp =
    components.find((c) => c.id === selectedComponentId) || components[0];

  if (!selectedComp) return null;

  // Handle preset selection - guarantees alert/warning will be shown each time
  const handleSelectPreset = (preset: FaultPreset) => {
    onApplyPreset(preset);
    if (preset.id !== 'nominal-restore') {
      const faultMsg = `${preset.title} FAULT INJECTED`;
      setActiveFaultBanner(faultMsg);
      onFaultTriggered?.(preset.title);
    } else {
      setActiveFaultBanner(null);
    }
  };

  // Handle cable plug in/out
  const handleToggleCable = () => {
    const nextConnected = !selectedComp.cableConnected;
    onUpdateComponent(selectedComp.id, {
      cableConnected: nextConnected,
      // When unplugged, current drops to 0A immediately
      currentDraw: nextConnected ? selectedComp.nominalCurrent : 0.0,
      shortCircuitRisk: nextConnected ? 5 : 0,
      status: nextConnected ? 'NOMINAL' : 'OFFLINE',
    });

    if (!nextConnected) {
      const faultMsg = `Cable disconnected on ${selectedComp.name}`;
      setActiveFaultBanner(faultMsg);
      onFaultTriggered?.(faultMsg);
    } else {
      setActiveFaultBanner(null);
    }
  };

  // Handle temperature change
  const handleTempChange = (newTemp: number) => {
    onUpdateComponent(selectedComp.id, {
      temperature: Math.round(newTemp * 10) / 10,
    });
    if (newTemp > selectedComp.tempThreshold) {
      const faultMsg = `High temperature alert on ${selectedComp.name} (${newTemp.toFixed(1)}°C)`;
      setActiveFaultBanner(faultMsg);
      onFaultTriggered?.(faultMsg);
    }
  };

  // Handle current overflow change
  const handleCurrentChange = (newCurrent: number) => {
    onUpdateComponent(selectedComp.id, {
      currentDraw: Math.round(newCurrent * 10) / 10,
      cableConnected: true, // if admin adjusts current, cable is powered
    });
    if (newCurrent > selectedComp.maxCurrent) {
      const faultMsg = `Overcurrent overflow on ${selectedComp.name} (${newCurrent.toFixed(1)}A)`;
      setActiveFaultBanner(faultMsg);
      onFaultTriggered?.(faultMsg);
    }
  };

  // Handle ground leakage change
  const handleLeakageChange = (newLeakage: number) => {
    onUpdateComponent(selectedComp.id, {
      leakageCurrent: Math.round(newLeakage * 10) / 10,
    });
    if (newLeakage > 20) {
      const faultMsg = `Chassis ground fault on ${selectedComp.name} (${newLeakage.toFixed(1)} mA)`;
      setActiveFaultBanner(faultMsg);
      onFaultTriggered?.(faultMsg);
    }
  };

  // Handle power consume / wattage adjustment (updates current according to P = V * I)
  const handlePowerKwChange = (powerKw: number) => {
    const voltage = selectedComp.voltage || 28;
    const computedCurrent = (powerKw * 1000) / voltage;
    onUpdateComponent(selectedComp.id, {
      currentDraw: Math.round(computedCurrent * 10) / 10,
      cableConnected: true,
    });
    if (computedCurrent > selectedComp.maxCurrent) {
      const faultMsg = `Excessive power consumption overload on ${selectedComp.name}`;
      setActiveFaultBanner(faultMsg);
      onFaultTriggered?.(faultMsg);
    }
  };

  // Preset quick triggers
  const triggerThermalSpike = () => {
    onUpdateComponent(selectedComp.id, {
      temperature: selectedComp.tempMax + 15,
    });
    const faultMsg = `Thermal spike fault on ${selectedComp.name}`;
    setActiveFaultBanner(faultMsg);
    onFaultTriggered?.(faultMsg);
  };

  const triggerOvercurrentSurge = () => {
    onUpdateComponent(selectedComp.id, {
      currentDraw: Math.round(selectedComp.maxCurrent * 1.35),
      cableConnected: true,
    });
    const faultMsg = `Overcurrent surge fault on ${selectedComp.name}`;
    setActiveFaultBanner(faultMsg);
    onFaultTriggered?.(faultMsg);
  };

  const triggerSevereLeakage = () => {
    onUpdateComponent(selectedComp.id, {
      leakageCurrent: 88.5,
    });
    const faultMsg = `Severe chassis ground leakage on ${selectedComp.name}`;
    setActiveFaultBanner(faultMsg);
    onFaultTriggered?.(faultMsg);
  };

  const restoreComponent = () => {
    onUpdateComponent(selectedComp.id, {
      cableConnected: true,
      currentDraw: selectedComp.nominalCurrent,
      temperature: selectedComp.tempNominal,
      leakageCurrent: 2.1,
      shortCircuitRisk: 6,
      status: 'NOMINAL',
    });
    setActiveFaultBanner(null);
  };

  return (
    <div
      id="admin-fault-injection-console"
      className="bg-[#131926] border border-[#232f42] rounded-xl p-5 shadow-md relative overflow-hidden"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#232f42]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600/15 border border-blue-500/30 rounded-lg text-blue-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                FAULT INJECTION & SIMULATOR CONSOLE
              </h2>
              <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-[#1a2334] text-slate-300 border border-[#2c3b54]">
                HARDWARE CONTROLS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-live-simulation"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 border ${
              isSimulating
                ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-600/40 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400' : 'text-amber-400'}`} />
            {isSimulating ? 'TELEMETRY: RUNNING' : 'TELEMETRY: PAUSED'}
          </button>

          <button
            id="btn-admin-reset-all"
            onClick={onResetAll}
            className="px-3 py-1.5 bg-[#182030] hover:bg-[#202b40] border border-[#263348] text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            RESET TO NOMINAL
          </button>
        </div>
      </div>

      {/* Demonstrations: DISCONNECT CABLE, SHORT CIRCUIT, CURRENT OVERFLOW, POWER CUT, TEMPEARTURE, RESET */}
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {presets.map((preset) => {
            const isNominal = preset.id === 'nominal-restore';
            return (
              <button
                key={preset.id}
                id={`preset-${preset.id}`}
                onClick={() => handleSelectPreset(preset)}
                className={`text-center py-2.5 px-2 rounded-lg border font-mono font-bold text-xs tracking-wide transition-colors uppercase ${
                  isNominal
                    ? 'bg-emerald-950/50 border-emerald-600/60 hover:bg-emerald-900/60 text-emerald-300 shadow-sm'
                    : 'bg-[#182030] border-[#263348] hover:border-rose-500/60 hover:bg-rose-950/30 text-slate-200'
                }`}
              >
                {preset.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator Active Alert Banner: always shown each time user selects a fault */}
      {activeFaultBanner && (
        <div
          id="simulator-console-active-warning-banner"
          className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 flex flex-wrap items-center justify-between gap-2 shadow-lg animate-pulse"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-300">
                  SIMULATOR ALARM ACTIVE:
                </span>
                <span className="font-mono text-xs font-bold text-white bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700/60">
                  {activeFaultBanner}
                </span>
              </div>
              <p className="text-[11px] text-rose-200/90 mt-0.5">
                Critical telemetry anomaly injected. Emergency audio alarm and warning overlay active.
              </p>
            </div>
          </div>
          <button
            id="btn-trigger-view-alert"
            onClick={() => onFaultTriggered?.(activeFaultBanner)}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-md shadow transition-colors flex items-center gap-1.5 shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            SHOW EMERGENCY ALERT
          </button>
        </div>
      )}
      <div className="mb-4">
        <span className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
          Select Component To Manipulate:
        </span>
        <div className="flex flex-wrap gap-2">
          {components.map((c) => {
            const isSelected = c.id === selectedComp.id;
            const isDisconnected = !c.cableConnected;
            const isCrit = c.status === 'CRITICAL';
            const isWarn = c.status === 'WARNING';

            return (
              <button
                key={c.id}
                id={`admin-select-comp-${c.id}`}
                onClick={() => onSelectComponent(c.id)}
                className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors flex items-center gap-2 ${
                  isSelected
                    ? isHazard
                      ? 'bg-[#FACC15] border-[#FACC15] text-[#000000] font-bold shadow-[0_0_12px_rgba(250,204,21,0.4)]'
                      : isIndustrial
                      ? 'bg-[#E28743] border-[#E28743] text-[#1B1E26] font-bold shadow-[0_0_12px_rgba(226,135,67,0.35)]'
                      : 'bg-blue-600 border-blue-500 text-white font-semibold shadow-sm'
                    : isHazard
                    ? 'bg-[#141418] border-[#2A2A34] text-white hover:bg-[#1E1E26]'
                    : isIndustrial
                    ? 'bg-[#1E232B] border-[#384050] text-[#EAD7C3] hover:bg-[#28303C]'
                    : 'bg-[#182030] border-[#263348] text-slate-300 hover:bg-[#202b40]'
                }`}
              >
                {/* Status dot */}
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDisconnected
                      ? 'bg-slate-500'
                      : isCrit
                      ? 'bg-rose-500'
                      : isWarn
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>{c.name}</span>
                {isDisconnected && (
                  <span className={`px-1 text-[9px] rounded font-medium ${
                    isSelected ? 'bg-blue-800 text-blue-100' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    UNPLUGGED
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Control Panel for Selected Component */}
      <div className="bg-[#0f141f] border border-[#202b3d] rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* 1. Cable Connection Plug In / Out */}
        <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Unplug className="w-4 h-4 text-slate-400" />
                CABLE CONNECTION
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded ${
                  selectedComp.cableConnected
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                    : 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                }`}
              >
                {selectedComp.cableConnected ? 'PLUGGED IN' : 'UNPLUGGED'}
              </span>
            </div>
          </div>

          <button
            id={`btn-toggle-cable-${selectedComp.id}`}
            onClick={handleToggleCable}
            className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 border transition-colors ${
              selectedComp.cableConnected
                ? 'bg-rose-950/50 hover:bg-rose-900/60 border-rose-600/50 text-rose-200'
                : 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-600/50 text-emerald-200'
            }`}
          >
            <Unplug className="w-4 h-4" />
            {selectedComp.cableConnected ? 'DISCONNECT CABLE' : 'PLUG IN CABLE'}
          </button>
        </div>

        {/* 2. Temperature Monitoring & Control */}
        <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              TEMPERATURE
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                selectedComp.temperature >= selectedComp.tempMax
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : selectedComp.temperature > selectedComp.tempThreshold
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-[#1e2738] text-slate-300'
              }`}
            >
              {selectedComp.temperature.toFixed(1)} °C
            </span>
          </div>

          <div className="mb-3">
            <input
              id="slider-component-temp"
              type="range"
              min="-30"
              max="160"
              step="1"
              value={selectedComp.temperature}
              onChange={(e) => handleTempChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Nom: {selectedComp.tempNominal}°C</span>
              <span>Limit: {selectedComp.tempThreshold}°C</span>
              <span>Max: {selectedComp.tempMax}°C</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-quick-temp-spike"
              onClick={triggerThermalSpike}
              className="py-1 px-2 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-700/40 text-amber-200 rounded text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              Spike
            </button>
            <button
              id="btn-quick-temp-nominal"
              onClick={() => handleTempChange(selectedComp.tempNominal)}
              className="py-1 px-2 bg-[#1e2738] hover:bg-[#28344b] border border-[#2d3a52] text-slate-300 rounded text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* 3. Current Consumption & Overflow Control */}
        <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" />
              CURRENT FLOW
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                selectedComp.currentDraw > selectedComp.maxCurrent
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-[#1e2738] text-slate-300'
              }`}
            >
              {selectedComp.currentDraw.toFixed(1)} A
            </span>
          </div>

          <div className="mb-3">
            <input
              id="slider-component-current"
              type="range"
              min="0"
              max={Math.round(selectedComp.maxCurrent * 1.5)}
              step="1"
              value={selectedComp.currentDraw}
              disabled={!selectedComp.cableConnected}
              onChange={(e) => handleCurrentChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0A</span>
              <span>Nom: {selectedComp.nominalCurrent}A</span>
              <span>Max: {selectedComp.maxCurrent}A</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-quick-overcurrent-surge"
              onClick={triggerOvercurrentSurge}
              className="py-1 px-2 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-700/40 text-rose-200 rounded text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Surge
            </button>
            <button
              id="btn-quick-current-nominal"
              onClick={() => handleCurrentChange(selectedComp.nominalCurrent)}
              className="py-1 px-2 bg-[#1e2738] hover:bg-[#28344b] border border-[#2d3a52] text-slate-300 rounded text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
            >
              Nominal
            </button>
          </div>
        </div>

        {/* 4. Current Leakage & Short Circuit Hazard Injector */}
        <div className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              GROUND LEAKAGE
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                selectedComp.leakageCurrent > 50
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : selectedComp.leakageCurrent > 20
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-[#1e2738] text-slate-300'
              }`}
            >
              {selectedComp.leakageCurrent.toFixed(1)} mA
            </span>
          </div>

          <div className="mb-3">
            <input
              id="slider-component-leakage"
              type="range"
              min="0"
              max="150"
              step="1"
              value={selectedComp.leakageCurrent}
              onChange={(e) => handleLeakageChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>&lt;15mA Safe</span>
              <span>25mA Warn</span>
              <span>&gt;75mA Hazard</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-quick-ground-leakage"
              onClick={triggerSevereLeakage}
              className="py-1 px-2 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-700/40 text-amber-200 rounded text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              Leakage
            </button>
            <button
              id="btn-quick-reset-comp"
              onClick={restoreComponent}
              className="py-1 px-2 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-200 rounded text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Restore
            </button>
          </div>
        </div>

        {/* 5. Power Consumption & Wattage Control */}
        {(() => {
          const powerKw =
            selectedComp.cableConnected
              ? (selectedComp.voltage * selectedComp.currentDraw) / 1000
              : 0;
          const nominalPowerKw = (selectedComp.voltage * selectedComp.nominalCurrent) / 1000;
          const maxPowerKw = (selectedComp.voltage * selectedComp.maxCurrent) / 1000;
          const isOverloaded = selectedComp.currentDraw > selectedComp.maxCurrent;

          return (
            <div
              id="admin-power-consume-section"
              className="bg-[#161d2b] border border-[#232f42] rounded-lg p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    POWER DRAW
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      !selectedComp.cableConnected
                        ? 'bg-[#1e2738] text-slate-400'
                        : isOverloaded
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : powerKw > nominalPowerKw * 1.1
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {powerKw.toFixed(2)} kW
                  </span>
                </div>

                <div className="mb-3">
                  <input
                    id="slider-component-power-consume"
                    type="range"
                    min="0"
                    max={Math.round(maxPowerKw * 1.5 * 10) / 10 || 15}
                    step="0.1"
                    value={Math.round(powerKw * 10) / 10}
                    disabled={!selectedComp.cableConnected}
                    onChange={(e) => handlePowerKwChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>0 kW</span>
                    <span>Nom: {nominalPowerKw.toFixed(1)}kW</span>
                    <span>Max: {maxPowerKw.toFixed(1)}kW</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-quick-eco-power"
                  onClick={() => handlePowerKwChange(nominalPowerKw * 0.7)}
                  disabled={!selectedComp.cableConnected}
                  className="py-1 px-2 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-200 rounded text-[11px] font-mono flex items-center justify-center gap-1 disabled:opacity-40 transition-colors"
                >
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Eco (-30%)
                </button>
                <button
                  id="btn-quick-peak-power"
                  onClick={() => handlePowerKwChange(maxPowerKw * 1.25)}
                  disabled={!selectedComp.cableConnected}
                  className="py-1 px-2 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-700/40 text-rose-200 rounded text-[11px] font-mono flex items-center justify-center gap-1 disabled:opacity-40 transition-colors"
                >
                  <Flame className="w-3 h-3 text-rose-400" />
                  Peak (+125%)
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
