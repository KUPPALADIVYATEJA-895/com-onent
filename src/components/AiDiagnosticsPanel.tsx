import React from 'react';
import { AiDiagnosisResult } from '../types';
import {
  CheckCircle2,
  AlertOctagon,
  FileText,
  RefreshCw,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AiDiagnosticsPanelProps {
  diagnosis: AiDiagnosisResult | null;
  isLoading: boolean;
  onRefreshDiagnosis: () => void;
  onOpenReportModal: () => void;
  onExecuteFullMitigation?: () => void;
  onOpenChatDrawer: () => void;
}

export const AiDiagnosticsPanel: React.FC<AiDiagnosticsPanelProps> = ({
  diagnosis,
  isLoading,
  onRefreshDiagnosis,
  onOpenReportModal,
  onExecuteFullMitigation,
  onOpenChatDrawer,
}) => {
  if (!diagnosis) return null;

  const isCritical = (diagnosis.gridHealthScore || 100) < 60;
  const isDegraded = (diagnosis.gridHealthScore || 100) < 85;

  return (
    <div
      id="ai-diagnostics-solutions-panel"
      className="bg-[#131926] border border-[#232f42] rounded-xl p-5 shadow-md relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-[#232f42] gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                ELECTRICAL DIAGNOSTIC & TELEMETRY ENGINE
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-[#1a2336] text-slate-300 border border-[#2c384c]">
                {diagnosis.source === 'gemini-3.8-flash' ? 'GEMINI 3.8-FLASH LIVE' : 'AEROSPACE DIAGNOSTIC CORE'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous telemetry reasoning, failure root cause attribution, and resolution roadmap.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-reanalyze-telemetry"
            onClick={onRefreshDiagnosis}
            disabled={isLoading}
            className="px-3 py-1.5 bg-[#1b2332] hover:bg-[#232e42] border border-[#2c384c] text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'ANALYZING...' : 'RE-EVALUATE'}
          </button>

          <button
            id="btn-open-incident-report"
            onClick={onOpenReportModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            INCIDENT REPORT
          </button>

          <button
            id="btn-open-engineer-chat"
            onClick={onOpenChatDrawer}
            className="px-3 py-1.5 bg-[#1b2332] hover:bg-[#232e42] border border-[#2c384c] text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            FLIGHT ENGINEER ASSISTANT
          </button>
        </div>
      </div>

      {/* Grid Health Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* Metric 1: Grid Health Score */}
        <div className="bg-[#0f141f] border border-[#1e2838] rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-0.5">
              POWER BUS HEALTH INDEX
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold font-mono ${
                  isCritical ? 'text-rose-400' : isDegraded ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {diagnosis.gridHealthScore}%
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isCritical ? 'CRITICAL HAZARD' : isDegraded ? 'DEGRADED BUS' : 'STABLE'}
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border ${
              isCritical
                ? 'bg-rose-950/70 border-rose-800/80 text-rose-400'
                : isDegraded
                ? 'bg-amber-950/70 border-amber-800/80 text-amber-400'
                : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Highest Load Machinery */}
        <div className="bg-[#0f141f] border border-[#1e2838] rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-0.5">
              PRIMARY CURRENT CONSUMER
            </span>
            <div className="text-sm font-semibold text-slate-100 truncate max-w-[180px]">
              {diagnosis.topPowerConsumer?.name || 'Balanced Load'}
            </div>
            <span className="text-[11px] font-mono text-slate-300">
              {diagnosis.topPowerConsumer?.current?.toFixed(1)} A ({diagnosis.topPowerConsumer?.percentTotal}% load)
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-950/40 border border-blue-800/50 flex items-center justify-center text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Active Failure Vectors */}
        <div className="bg-[#0f141f] border border-[#1e2838] rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-0.5">
              ACTIVE FAULT VECTORS
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold font-mono ${
                  diagnosis.issues.length > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {diagnosis.issues.length}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {diagnosis.issues.length === 0 ? 'CLEARED' : 'NEED MITIGATION'}
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border ${
              diagnosis.issues.length > 0
                ? 'bg-rose-950/70 border-rose-800/80 text-rose-400'
                : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-400'
            }`}
          >
            {diagnosis.issues.length > 0 ? (
              <AlertOctagon className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis Cards */}
      <div className="mb-4">
        {/* Root Cause Summary & Short Circuit Analysis */}
        <div className="bg-[#0f141f] border border-[#1e2838] rounded-lg p-4 space-y-3">
          <div>
            <span className="text-xs font-mono text-blue-400 font-semibold block mb-1 uppercase tracking-wider">
              1. Root Cause Attribution
            </span>
            <p className="text-xs text-slate-200 leading-relaxed bg-[#161d2b] p-3 rounded border border-[#232f42] font-sans">
              {diagnosis.rootCauseSummary}
            </p>
          </div>

          <div>
            <span className="text-xs font-mono text-slate-300 font-semibold block mb-1 uppercase tracking-wider">
              2. Dielectric & Short Circuit Risk Evaluation
            </span>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#161d2b] p-3 rounded border border-[#232f42] font-sans">
              {diagnosis.shortCircuitAnalysis}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
