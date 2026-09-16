import React, { useState } from 'react';
import { DiagnosticIssue, SpacecraftComponent } from '../types';
import {
  AlertTriangle,
  Flame,
  Unplug,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Filter,
  Wrench,
  ArrowRight,
} from 'lucide-react';

interface RealTimeAlertsFeedProps {
  issues: DiagnosticIssue[];
  onSelectComponent: (id: string) => void;
  onAutoFixIssue: (issue: DiagnosticIssue) => void;
  onExecuteFullMitigation: () => void;
}

export const RealTimeAlertsFeed: React.FC<RealTimeAlertsFeedProps> = ({
  issues,
  onSelectComponent,
  onAutoFixIssue,
  onExecuteFullMitigation,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'WARNING'>('ALL');

  const filteredIssues = issues.filter((iss) => {
    if (filterSeverity === 'ALL') return true;
    return iss.severity === filterSeverity;
  });

  const getIssueIcon = (type: DiagnosticIssue['type']) => {
    switch (type) {
      case 'OPEN_CIRCUIT_DISCONNECT':
        return <Unplug className="w-4 h-4 text-rose-400" />;
      case 'GROUND_FAULT_LEAKAGE':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'THERMAL_OVERHEAT':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'CURRENT_OVERFLOW':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'SHORT_CIRCUIT_HAZARD':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div
      id="realtime-alerts-feed"
      className="bg-[#131926] border border-[#232f42] rounded-xl p-4 shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#232f42] gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-600/15 text-rose-400 rounded-lg border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                  REAL-TIME TELEMETRY ALERTS
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    issues.length > 0
                      ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                      : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  {issues.length} {issues.length === 1 ? 'ALERT' : 'ALERTS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live anomaly stream with immediate remediation triggers.
              </p>
            </div>
          </div>

          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {(['ALL', 'CRITICAL', 'HIGH', 'WARNING'] as const).map((sev) => (
              <button
                key={sev}
                id={`filter-alert-${sev}`}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                  filterSeverity === sev
                    ? 'bg-blue-600 border-blue-500 text-white font-medium'
                    : 'bg-[#0f141f] border-[#1e2838] text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        {issues.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center bg-[#0f141f] rounded-lg border border-[#1e2838]">
            <div className="w-10 h-10 rounded-full bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">
              ALL SYSTEMS RUNNING NOMINALLY
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Zero open circuits, thermal deviations, or ground leakage faults detected across spacecraft circuits.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {filteredIssues.map((issue) => {
              const isCrit = issue.severity === 'CRITICAL';
              const isHigh = issue.severity === 'HIGH';

              return (
                <div
                  key={issue.id}
                  id={`alert-card-${issue.id}`}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    isCrit
                      ? 'bg-rose-950/25 border-rose-800/60'
                      : isHigh
                      ? 'bg-amber-950/20 border-amber-800/60'
                      : 'bg-[#0f141f] border-[#1e2838]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-[#161d2b] border border-[#232f42]">
                        {getIssueIcon(issue.type)}
                      </div>
                      <button
                        onClick={() => onSelectComponent(issue.componentId)}
                        className="font-mono font-bold text-slate-100 hover:text-blue-400 transition-colors underline decoration-dotted"
                      >
                        {issue.componentName}
                      </button>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isCrit
                          ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                          : isHigh
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                          : 'bg-[#1b2332] text-slate-300 border border-[#2c384c]'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs mb-2">
                    {issue.description}
                  </p>

                  <div className="bg-[#0f141f] border border-[#1e2838] rounded p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-300">
                      <span className="font-mono text-blue-400 font-semibold mr-1">Recommended Solution:</span>
                      {issue.remedy}
                    </div>

                    <button
                      id={`btn-fix-alert-${issue.id}`}
                      onClick={() => onAutoFixIssue(issue)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-mono font-medium whitespace-nowrap flex items-center gap-1 transition-colors self-end sm:self-auto shadow-sm"
                    >
                      <Wrench className="w-3 h-3" />
                      Remediate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global AI Action Bar */}
      {issues.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#232f42] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {issues.length} active fault vectors logged
          </span>

          <button
            id="btn-resolve-all-faults"
            onClick={onExecuteFullMitigation}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            EXECUTE FULL MITIGATION PROTOCOL
          </button>
        </div>
      )}
    </div>
  );
};
