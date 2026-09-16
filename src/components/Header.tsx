import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  RotateCcw,
  Bot,
  AlertTriangle,
  Radio,
  ShieldCheck,
  Volume2,
  VolumeX,
  Gauge,
  Satellite,
} from 'lucide-react';
import { soundEngine } from '../utils/audioAlert';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  gridHealthScore: number;
  activeAlertsCount: number;
  totalCurrent: number;
  totalPowerKw: number;
  onOpenReportModal: () => void;
  onOpenChatDrawer: () => void;
  onRefreshDiagnosis: () => void;
  onResetAll: () => void;
  isLoadingDiagnosis: boolean;
  onOpenEmergencyAlert?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gridHealthScore,
  activeAlertsCount,
  totalCurrent,
  totalPowerKw,
  onOpenReportModal,
  onOpenChatDrawer,
  onRefreshDiagnosis,
  onResetAll,
  isLoadingDiagnosis,
  onOpenEmergencyAlert,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(51240); // Mission Elapsed Time
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMET = (totalSec: number) => {
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `+${d.toString().padStart(2, '0')}:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCritical = gridHealthScore < 60;
  const isWarning = gridHealthScore < 85;

  const toggleSound = () => {
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    soundEngine.soundEnabled = next;
    if (!next) {
      soundEngine.stopAlarmLoop();
    }
  };

  return (
    <header
      id="app-main-header"
      className="bg-[#0b101b]/95 backdrop-blur-md border-b border-[#1f2b3e] sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-xl"
    >
      {/* Top Aerospace Ticker Strip */}
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2 mb-2 border-b border-[#182333]">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
            <Satellite className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span>AEGIS-7 ORBITAL BUS</span>
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="text-slate-300">
            MET: <span className="text-emerald-400 font-bold">{formatMET(secondsElapsed)}</span>
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-300">
            ALT: <span className="text-slate-200 font-bold">418.6 KM LEO</span> (INC: 51.6°)
          </span>
          <span className="hidden lg:inline text-slate-500">•</span>
          <span className="hidden lg:inline text-slate-300">
            BUS: <span className="text-cyan-300 font-bold">480.0V DC REGULATED</span>
          </span>
        </div>

        {/* Master Caution Indicator, Theme Switcher & Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Top-of-page Change Theme Option */}
          <ThemeSwitcher />

          {activeAlertsCount > 0 ? (
            <button
              onClick={onOpenEmergencyAlert}
              title="Click to view emergency warning alert"
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-rose-500 text-rose-300 font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>MASTER CAUTION: {activeAlertsCount} FAULT{activeAlertsCount > 1 ? 'S' : ''}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>ALL SYSTEMS NOMINAL</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isAudioEnabled ? 'Mute sound alarms' : 'Enable sound alarms'}
            className="p-1 rounded bg-[#151f2e] hover:bg-[#1f2d42] border border-[#233247] text-slate-300 transition-colors ml-1"
          >
            {isAudioEnabled ? (
              <Volume2 className="w-3 h-3 text-cyan-400" />
            ) : (
              <VolumeX className="w-3 h-3 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Spacecraft Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-600/10 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Radio className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b101b] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-['Chakra_Petch',sans-serif]">
                AURA SPACECRAFT
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950/80 text-cyan-300 border border-blue-800/60 font-semibold">
                DIAGNOSTICS v4.2
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span>Primary Power Bus & Chamber Telemetry</span>
            </p>
          </div>
        </div>

        {/* Global Grid Status Telemetry Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Health Index */}
          <div className="bg-[#121a28] border border-[#212e42] rounded-xl px-3 py-1.5 hidden md:block shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider">GRID HEALTH</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={
                  isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                }
              >
                {gridHealthScore}%
              </span>
            </div>
          </div>

          {/* Anomaly Status */}
          <div className="bg-[#121a28] border border-[#212e42] rounded-xl px-3 py-1.5 hidden md:block shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider">ANOMALY STATUS</span>
            <span
              className={`text-sm font-mono font-bold ${
                activeAlertsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {activeAlertsCount} {activeAlertsCount === 1 ? 'FAULT' : 'FAULTS'}
            </span>
          </div>

          {/* Total Bus Load */}
          <div className="bg-[#121a28] border border-[#212e42] rounded-xl px-3 py-1.5 hidden sm:block shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider">TOTAL BUS LOAD</span>
            <span className="text-sm font-mono font-bold text-slate-100">
              {totalCurrent.toFixed(1)} A <span className="text-[10px] text-cyan-400 font-normal">({totalPowerKw.toFixed(1)} kW)</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-header-reanalyze"
              onClick={onRefreshDiagnosis}
              disabled={isLoadingDiagnosis}
              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoadingDiagnosis ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">AI Diagnosis</span>
            </button>

            <button
              id="btn-header-report"
              onClick={onOpenReportModal}
              className="px-3 py-2 bg-[#141d2b] hover:bg-[#1d293d] border border-[#24334a] text-slate-200 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
              title="Generate Official Spacecraft Diagnostic Report"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Report</span>
            </button>

            <button
              id="btn-header-chat"
              onClick={onOpenChatDrawer}
              className="px-3 py-2 bg-[#141d2b] hover:bg-[#1d293d] border border-[#24334a] text-slate-200 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
              title="Open Flight Diagnostics Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Assistant</span>
            </button>

            <button
              id="btn-header-reset"
              onClick={onResetAll}
              className="p-2 bg-[#141d2b] hover:bg-[#1d293d] border border-[#24334a] text-slate-300 hover:text-white rounded-xl transition-colors"
              title="Reset system state to 100% nominal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
