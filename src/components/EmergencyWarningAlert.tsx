import React, { useEffect, useState } from 'react';
import { DiagnosticIssue, SpacecraftComponent } from '../types';
import {
  X,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { soundEngine } from '../utils/audioAlert';

interface EmergencyWarningAlertProps {
  issues: DiagnosticIssue[];
  components: SpacecraftComponent[];
  onFixIssue: (issue: DiagnosticIssue) => void;
  onFixAll?: () => void;
  onSelectComponent?: (id: string) => void;
  isDismissed?: boolean;
  onClose?: () => void;
  alertTriggerKey?: number;
}

export const EmergencyWarningAlert: React.FC<EmergencyWarningAlertProps> = ({
  issues,
  components,
  onFixIssue,
  onFixAll,
  onSelectComponent,
  isDismissed: controlledDismissed,
  onClose,
  alertTriggerKey,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [internalDismissed, setInternalDismissed] = useState(false);
  const [lastIssuesCount, setLastIssuesCount] = useState(issues.length);

  const isAlertHidden = controlledDismissed !== undefined ? controlledDismissed : internalDismissed;

  // Whenever controlled dismissal is set to false, restore visibility
  useEffect(() => {
    if (controlledDismissed === false) {
      setInternalDismissed(false);
    }
  }, [controlledDismissed]);

  // Whenever a fault is selected in the simulator console (alertTriggerKey changes), force alert open
  useEffect(() => {
    if (alertTriggerKey && alertTriggerKey > 0) {
      setInternalDismissed(false);
      setCurrentIndex(0);
    }
  }, [alertTriggerKey]);

  // If new issues are detected after dismissal, re-open the alert
  useEffect(() => {
    if (issues.length > lastIssuesCount) {
      setInternalDismissed(false);
    }
    setLastIssuesCount(issues.length);
  }, [issues.length, lastIssuesCount]);

  // If all issues are cleared, reset dismissal for future alerts
  useEffect(() => {
    if (issues.length === 0) {
      setInternalDismissed(false);
    }
  }, [issues.length]);

  // Keep currentIndex in bounds
  useEffect(() => {
    if (currentIndex >= issues.length) {
      setCurrentIndex(Math.max(0, issues.length - 1));
    }
  }, [issues.length, currentIndex]);

  // Audio alarm loop
  useEffect(() => {
    if (issues.length > 0 && !isAlertHidden && !isAudioMuted) {
      soundEngine.soundEnabled = true;
      soundEngine.startAlarmLoop();
    } else {
      soundEngine.stopAlarmLoop();
    }

    return () => {
      soundEngine.stopAlarmLoop();
    };
  }, [issues.length, isAlertHidden, isAudioMuted]);

  if (issues.length === 0 || isAlertHidden) {
    return null;
  }

  const activeIssue = issues[currentIndex] || issues[0];
  if (!activeIssue) return null;

  const targetComp = components.find((c) => c.id === activeIssue.componentId);
  const chamberName = targetComp ? targetComp.name.toUpperCase() : activeIssue.componentName.toUpperCase();

  const getCleanFaultName = (issue: DiagnosticIssue) => {
    switch (issue.type) {
      case 'OPEN_CIRCUIT_DISCONNECT':
        return 'CABLE UMBILICAL DISCONNECTED (0.0A BLACKOUT)';
      case 'CURRENT_OVERFLOW':
        return `OVERCURRENT OVERFLOW (${targetComp?.currentDraw.toFixed(1) || ''}A > ${targetComp?.maxCurrent || ''}A MAX)`;
      case 'THERMAL_OVERHEAT':
        return `THERMAL RUNAWAY OVERHEAT (${targetComp?.temperature.toFixed(1) || ''}°C > ${targetComp?.tempThreshold || ''}°C)`;
      case 'SHORT_CIRCUIT_HAZARD':
        return `SHORT CIRCUIT ARC HAZARD (${targetComp?.shortCircuitRisk || ''}% RISK)`;
      case 'GROUND_FAULT_LEAKAGE':
        return `CHASSIS GROUND FAULT LEAKAGE (${targetComp?.leakageCurrent.toFixed(1) || ''} mA)`;
      default:
        return issue.type.replace(/_/g, ' ');
    }
  };

  const handleFixCurrent = () => {
    setIsFixing(true);
    soundEngine.stopAlarmLoop();
    soundEngine.playRemedySuccessSound();
    onFixIssue(activeIssue);
    setTimeout(() => {
      setIsFixing(false);
    }, 300);
  };

  const handleFixAll = () => {
    setIsFixing(true);
    soundEngine.stopAlarmLoop();
    soundEngine.playRemedySuccessSound();
    if (onFixAll) {
      onFixAll();
    } else {
      issues.forEach((iss) => onFixIssue(iss));
    }
    setTimeout(() => {
      setIsFixing(false);
    }, 300);
  };

  const handleDismiss = () => {
    setInternalDismissed(true);
    soundEngine.stopAlarmLoop();
    if (onClose) {
      onClose();
    }
  };

  const toggleSound = () => {
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    soundEngine.soundEnabled = !nextMute;
    if (nextMute) {
      soundEngine.stopAlarmLoop();
    } else if (issues.length > 0 && !isAlertHidden) {
      soundEngine.startAlarmLoop();
    }
  };

  return (
    <div
      id="emergency-warning-alert-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-all duration-300 pointer-events-auto"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
    >
      {/* Outer Shell Wrapper */}
      <div className="relative w-full max-w-2xl transform transition-all">
        {/* Glow Halo around card */}
        <div className="relative rounded-3xl p-0.5 bg-gradient-to-b from-red-500 via-rose-600 to-red-900 shadow-[0_0_80px_rgba(239,35,45,0.7)] animate-pulse">
          {/* Target Element matching user focus CSS selector */}
          <div className="bg-[#090204] border border-red-500/80 rounded-[23px] text-white overflow-hidden relative shadow-2xl">
            
            {/* BACKGROUND GRAPHICS: Angled Sci-Fi Hatching & Tech Grid replicating the uploaded image */}
            <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
              {/* Radial red glow centered behind the triangle */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/25 rounded-full blur-3xl" />
              
              {/* Diagonal tech slashes / hazard stripes */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="diagonal-hazard-stripes" width="28" height="28" patternTransform="rotate(35 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="28" stroke="#ef4444" strokeWidth="3" strokeOpacity="0.25" />
                  </pattern>
                  <pattern id="telemetry-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#ef4444" fillOpacity="0.18" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#telemetry-grid)" />
                <rect x="0" y="0" width="55%" height="45%" fill="url(#diagonal-hazard-stripes)" />
              </svg>

              {/* Segmented tech equalizer bars on left and right */}
              <div className="absolute top-16 left-6 flex flex-col gap-1.5 opacity-60">
                <span className="w-8 h-1 bg-red-500/80 rounded-sm animate-pulse" />
                <span className="w-6 h-1 bg-red-500/60 rounded-sm" />
                <span className="w-10 h-1 bg-red-500/70 rounded-sm animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-4 h-1 bg-red-500/40 rounded-sm" />
                <span className="w-7 h-1 bg-red-500/50 rounded-sm" />
              </div>

              <div className="absolute top-16 right-6 flex flex-col items-end gap-1.5 opacity-60">
                <span className="w-8 h-1 bg-red-500/80 rounded-sm animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="w-10 h-1 bg-red-500/70 rounded-sm" />
                <span className="w-5 h-1 bg-red-500/50 rounded-sm animate-pulse" style={{ animationDelay: '0.1s' }} />
                <span className="w-7 h-1 bg-red-500/60 rounded-sm" />
                <span className="w-4 h-1 bg-red-500/40 rounded-sm" />
              </div>
            </div>

            {/* TOP BAR: Hazard Indicator + Sound Toggle + "X" Close Button */}
            <div className="relative z-10 flex items-center justify-between px-5 sm:px-7 pt-4 sm:pt-5 pb-3 border-b border-red-950/80">
              {/* Left: Telemetry Status */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                </span>
                <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
                  CRITICAL SYSTEM ANOMALY
                </span>
                {issues.length > 1 && (
                  <span className="ml-1 text-[10px] font-mono text-red-200 bg-red-950/90 px-2 py-0.5 rounded border border-red-800/80">
                    {currentIndex + 1} / {issues.length}
                  </span>
                )}
              </div>

              {/* Right: Audio Toggle & "X" Close Option */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-alert-sound-toggle"
                  onClick={toggleSound}
                  title={isAudioMuted ? 'Unmute siren' : 'Mute siren'}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 hover:text-white transition-colors"
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />}
                </button>

                {/* THE "X" OPTION TO CLOSE IN THE TOP OF THE WARNING */}
                <button
                  id="btn-alert-close"
                  onClick={handleDismiss}
                  title="Close warning alert"
                  aria-label="Close warning alert"
                  className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-700/80 border border-red-700 text-red-300 hover:text-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                >
                  <X className="w-5 h-5 text-red-300 hover:text-white" />
                </button>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="relative z-10 px-5 sm:px-8 py-5 sm:py-6 flex flex-col items-center text-center">
              
              {/* THE EXACT GLOWING RED WARNING TRIANGLE FROM THE USER'S IMAGE */}
              <div className="relative my-2 sm:my-3 flex items-center justify-center">
                {/* Background Ambient Red Bloom */}
                <div className="absolute w-44 h-44 rounded-full bg-red-600/30 blur-2xl animate-pulse" />

                {/* High-Fidelity Custom Vector replicating the user's reference image */}
                <svg
                  className="w-36 h-36 sm:w-44 sm:h-44 filter drop-shadow-[0_0_24px_rgba(239,35,45,0.9)] transform transition-transform hover:scale-105"
                  viewBox="0 0 200 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Glowing Neon Red Filter */}
                    <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="5" result="blur1" />
                      <feGaussianBlur stdDeviation="10" result="blur2" />
                      <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Gradient for the Triangle Fill */}
                    <radialGradient id="inner-triangle-grad" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="#5c070d" />
                      <stop offset="60%" stopColor="#2e0407" />
                      <stop offset="100%" stopColor="#140103" />
                    </radialGradient>

                    {/* Bright Neon Red Gradient for Outlines */}
                    <linearGradient id="neon-red-line" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff4d4d" />
                      <stop offset="50%" stopColor="#ef232d" />
                      <stop offset="100%" stopColor="#ff2e3b" />
                    </linearGradient>
                  </defs>

                  {/* Outer Tech Brackets / Notched Edge Lug Shapes (as seen in the reference pic) */}
                  {/* Left notch */}
                  <path
                    d="M 38 135 L 24 142 L 32 120"
                    stroke="#ff3b3b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                  {/* Right notch */}
                  <path
                    d="M 162 135 L 176 142 L 168 120"
                    stroke="#ff3b3b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                  {/* Top apex notch */}
                  <path
                    d="M 90 28 L 100 12 L 110 28"
                    stroke="#ff3b3b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />

                  {/* Outer Glowing Neon Red Rounded Triangle */}
                  <path
                    d="M 100 22 
                       L 174 145 
                       A 10 10 0 0 1 165 158 
                       L 35 158 
                       A 10 10 0 0 1 26 145 
                       L 100 22 Z"
                    stroke="url(#neon-red-line)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neon-glow)"
                  />

                  {/* Inner Dark Red Triangle Fill */}
                  <path
                    d="M 100 32 
                       L 165 142 
                       A 7 7 0 0 1 158 151 
                       L 42 151 
                       A 7 7 0 0 1 35 142 
                       L 100 32 Z"
                    fill="url(#inner-triangle-grad)"
                    stroke="#a8111a"
                    strokeWidth="2.5"
                  />

                  {/* THE GLOWING SOLID RED EXCLAMATION MARK (!) matching the image */}
                  {/* Vertical rounded stem */}
                  <path
                    d="M 96.5 62 
                       C 96.5 59.5 98 58 100 58 
                       C 102 58 103.5 59.5 103.5 62 
                       L 102.5 108 
                       C 102.5 110 101.5 111.5 100 111.5 
                       C 98.5 111.5 97.5 110 97.5 108 
                       Z"
                    fill="#ff4d4d"
                    filter="url(#neon-glow)"
                  />
                  {/* Lower exclamation dot */}
                  <circle
                    cx="100"
                    cy="126"
                    r="5.5"
                    fill="#ff4d4d"
                    filter="url(#neon-glow)"
                  />
                </svg>
              </div>

              {/* USER'S EXACT REQUIRED SENTENCE */}
              <div className="mt-2 mb-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-['Chakra_Petch',sans-serif] tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-200 to-amber-300 drop-shadow-[0_0_20px_rgba(239,35,45,0.8)]">
                  THE SYSTEM GOT FAULT FIX IT IMMEDATELY
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="h-0.5 w-8 bg-red-600" />
                  <span className="text-[11px] font-mono tracking-widest text-red-400 font-semibold uppercase">
                    EMERGENCY OVERRIDE REQUIRED
                  </span>
                  <span className="h-0.5 w-8 bg-red-600" />
                </div>
              </div>

              {/* CHAMBER NAME & FAULT TELEMETRY DATA */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-left">
                {/* WHICH CHAMBER */}
                <div className="bg-[#150407]/90 border border-red-800/70 rounded-xl p-3 shadow-inner">
                  <span className="text-[10px] font-mono tracking-widest text-red-400/90 uppercase block font-semibold">
                    1. WHICH CHAMBER:
                  </span>
                  <div className="text-lg sm:text-xl font-bold font-['Chakra_Petch',sans-serif] text-white tracking-wide mt-0.5">
                    CHAMBER: <span className="text-amber-300 underline decoration-red-500 underline-offset-4">{chamberName}</span>
                  </div>
                </div>

                {/* WHAT FAULT */}
                <div className="bg-[#150407]/90 border border-red-800/70 rounded-xl p-3 shadow-inner">
                  <span className="text-[10px] font-mono tracking-widest text-red-400/90 uppercase block font-semibold">
                    2. WHAT FAULT:
                  </span>
                  <div className="text-xs sm:text-sm font-mono font-bold text-red-200 tracking-tight mt-1 truncate" title={getCleanFaultName(activeIssue)}>
                    {getCleanFaultName(activeIssue)}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: FIX IT */}
              <div className="w-full mt-4 pt-4 border-t border-red-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Pager if multiple faults */}
                {issues.length > 1 ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : issues.length - 1))}
                      title="Previous fault"
                      className="px-2.5 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>
                    <span className="text-xs font-mono text-red-300">
                      {currentIndex + 1} / {issues.length}
                    </span>
                    <button
                      onClick={() => setCurrentIndex((prev) => (prev < issues.length - 1 ? prev + 1 : 0))}
                      title="Next fault"
                      className="px-2.5 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-red-400/80 hidden sm:block">
                    Auto-remediation telemetry armed
                  </div>
                )}

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
                  {issues.length > 1 && (
                    <button
                      id="btn-alert-fix-all"
                      onClick={handleFixAll}
                      disabled={isFixing}
                      title="Fix all active faults"
                      className="px-3 py-2.5 rounded-xl bg-red-900/80 hover:bg-red-800 border border-red-600 text-red-100 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>FIX ALL ({issues.length})</span>
                    </button>
                  )}

                  {/* THE MAIN "FIX IT" BUTTON */}
                  <button
                    id="btn-alert-fix-it"
                    onClick={handleFixCurrent}
                    disabled={isFixing}
                    title="Repair chamber and resolve warning"
                    className="w-full sm:w-auto px-7 sm:px-9 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-black font-extrabold text-sm sm:text-base font-mono tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.85)] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Wrench className="w-4 h-4 text-black animate-spin" />
                    <span>FIX IT</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
