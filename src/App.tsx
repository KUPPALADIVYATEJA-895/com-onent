import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SpacecraftComponent,
  DiagnosticIssue,
  AiDiagnosisResult,
  FaultPreset,
} from './types';
import {
  INITIAL_COMPONENTS,
  FAULT_PRESETS,
  evaluateComponent,
} from './data/initialSpacecraftData';
import { Header } from './components/Header';
import { AdminConsole } from './components/AdminConsole';
import { CircuitSchematicGraph } from './components/CircuitSchematicGraph';
import { CurrentConsumptionChart } from './components/CurrentConsumptionChart';
import { ShortCircuitAndLeakageMeters } from './components/ShortCircuitAndLeakageMeters';
import { RealTimeAlertsFeed } from './components/RealTimeAlertsFeed';
import { AiDiagnosticsPanel } from './components/AiDiagnosticsPanel';
import { AiIncidentReportModal } from './components/AiIncidentReportModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { ComponentDetailModal } from './components/ComponentDetailModal';
import { EmergencyWarningAlert } from './components/EmergencyWarningAlert';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme, isIndustrial, isHazard } = useTheme();

  // 1. Core State
  const [components, setComponents] = useState<SpacecraftComponent[]>(() =>
    INITIAL_COMPONENTS.map(evaluateComponent)
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string>('PWR-01');
  const [inspectingComponentId, setInspectingComponentId] = useState<string | null>(null);

  // 2. Telemetry Simulation Clock
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // 3. AI Diagnostics & Reports State
  const [aiDiagnosis, setAiDiagnosis] = useState<AiDiagnosisResult | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportContent, setReportContent] = useState<string>('');
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);
  const [alertTriggerKey, setAlertTriggerKey] = useState<number>(0);
  const [prevIssuesCount, setPrevIssuesCount] = useState<number>(0);

  // Derive active issues from components
  const deriveIssues = useCallback((comps: SpacecraftComponent[]): DiagnosticIssue[] => {
    const list: DiagnosticIssue[] = [];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    comps.forEach((c) => {
      // 1. Cable Disconnect / Open Circuit / No current flow
      if (!c.cableConnected) {
        list.push({
          id: `issue-unplug-${c.id}`,
          componentId: c.id,
          componentName: c.name,
          type: 'OPEN_CIRCUIT_DISCONNECT',
          severity: c.isCritical ? 'CRITICAL' : 'HIGH',
          description: `Cable umbilical ${c.cableId} disconnected from ${c.name}. Zero current flow (0.0A). Operational blackout.`,
          remedy: `Re-seat and lock magnetic latch on cable ${c.cableId}. Perform terminal continuity check.`,
          timestamp: now,
        });
      }

      // 2. Current Overflow
      if (c.currentDraw > c.maxCurrent) {
        const excess = c.currentDraw - c.maxCurrent;
        list.push({
          id: `issue-overflow-${c.id}`,
          componentId: c.id,
          componentName: c.name,
          type: 'CURRENT_OVERFLOW',
          severity: 'CRITICAL',
          description: `Current draw of ${c.currentDraw.toFixed(1)}A exceeds rated safety limit (${c.maxCurrent}A) by ${excess.toFixed(1)}A.`,
          remedy: `Trigger solid-state current limiter on ${c.id}, reduce subsystem load duty cycle, and rebalance primary bus.`,
          timestamp: now,
        });
      }

      // 3. Ground Fault Leakage
      if (c.leakageCurrent > 25) {
        list.push({
          id: `issue-leakage-${c.id}`,
          componentId: c.id,
          componentName: c.name,
          type: 'GROUND_FAULT_LEAKAGE',
          severity: c.leakageCurrent > 60 ? 'CRITICAL' : 'HIGH',
          description: `Chassis ground fault of ${c.leakageCurrent.toFixed(1)} mA detected on ${c.name}. Dielectric insulation degradation.`,
          remedy: `Engage galvanic isolation relay, deploy dielectric sealant to terminal block, and reset ground fault detector.`,
          timestamp: now,
        });
      }

      // 4. Overheating
      if (c.temperature > c.tempThreshold) {
        const delta = c.temperature - c.tempThreshold;
        list.push({
          id: `issue-temp-${c.id}`,
          componentId: c.id,
          componentName: c.name,
          type: 'THERMAL_OVERHEAT',
          severity: delta > 25 ? 'CRITICAL' : 'HIGH',
          description: `Core temperature (${c.temperature.toFixed(1)}°C) exceeds rated threshold (${c.tempThreshold}°C) by ${delta.toFixed(1)}°C.`,
          remedy: `Throttle component duty cycle, activate secondary cryogenic cooling loop, and align radiative heat sink panels.`,
          timestamp: now,
        });
      }

      // 5. Short Circuit Hazard
      if (c.shortCircuitRisk > 45) {
        list.push({
          id: `issue-short-${c.id}`,
          componentId: c.id,
          componentName: c.name,
          type: 'SHORT_CIRCUIT_HAZARD',
          severity: c.shortCircuitRisk > 75 ? 'CRITICAL' : 'HIGH',
          description: `Short circuit arc risk assessed at ${c.shortCircuitRisk}% due to elevated thermal stress and impedance breakdown.`,
          remedy: `De-energize high-voltage tap, inspect connector contact pins for arc pitting, and verify dielectric clearance.`,
          timestamp: now,
        });
      }
    });

    return list;
  }, []);

  const issues = deriveIssues(components);

  // Aggregate Metrics
  const totalCurrent = components.reduce(
    (acc, c) => acc + (c.cableConnected ? c.currentDraw : 0),
    0
  );
  const totalPowerKw = (totalCurrent * 480) / 1000;
  const maxRisk = Math.max(...components.map((c) => c.shortCircuitRisk), 0);
  const gridHealthScore = Math.max(10, Math.round(100 - issues.length * 16));

  // 4. Autonomous Telemetry Simulation Tick
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setComponents((prev) => {
        // Check if Cryo Pump is offline
        const cryoPump = prev.find((c) => c.id === 'CRY-03');
        const isCryoOffline = !cryoPump || !cryoPump.cableConnected;

        return prev.map((c) => {
          let updatedTemp = c.temperature;
          let updatedDraw = c.currentDraw;
          let updatedLeakage = c.leakageCurrent;

          if (c.cableConnected) {
            // Slight jitter for realism
            const jitter = (Math.random() - 0.5) * 0.4;
            updatedDraw = Math.max(1, Math.round((c.currentDraw + jitter) * 10) / 10);

            // Thermal physics: if cryo pump is offline, high-heat components heat up
            if (isCryoOffline && (c.id === 'PWR-01' || c.id === 'ION-02')) {
              updatedTemp = Math.min(150, Math.round((c.temperature + 0.6) * 10) / 10);
            } else if (!isCryoOffline && c.temperature > c.tempNominal + 2) {
              // gradual cooling towards nominal
              updatedTemp = Math.max(c.tempNominal, Math.round((c.temperature - 0.3) * 10) / 10);
            }
          } else {
            updatedDraw = 0.0;
          }

          return evaluateComponent({
            ...c,
            currentDraw: updatedDraw,
            temperature: updatedTemp,
            leakageCurrent: updatedLeakage,
          });
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // 5. Fetch AI Diagnostics from backend with throttling & telemetry ref
  const latestTelemetryRef = useRef({ components, totalCurrent, totalPowerKw, maxRisk });
  latestTelemetryRef.current = { components, totalCurrent, totalPowerKw, maxRisk };

  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  const fetchAiDiagnosis = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    if (!force && (isFetchingRef.current || now - lastFetchTimeRef.current < 6000)) {
      return;
    }
    lastFetchTimeRef.current = now;
    isFetchingRef.current = true;
    setIsLoadingDiagnosis(true);
    try {
      const {
        components: currentComps,
        totalCurrent: currentAmps,
        totalPowerKw: currentKw,
        maxRisk: currentRisk,
      } = latestTelemetryRef.current;

      const payload = {
        components: currentComps.map((c) => ({
          id: c.id,
          name: c.name,
          currentDraw: c.currentDraw,
          maxCurrent: c.maxCurrent,
          temperature: c.temperature,
          tempNominal: c.tempNominal,
          tempThreshold: c.tempThreshold,
          cableConnected: c.cableConnected,
          cableId: c.cableId,
          leakageCurrent: c.leakageCurrent,
          shortCircuitRisk: c.shortCircuitRisk,
          status: c.status,
          isCritical: c.isCritical,
        })),
        busState: {
          voltage: 480,
          totalCurrent: currentAmps,
          totalPowerKw: currentKw,
        },
        overallRisk: currentRisk,
      };

      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: AiDiagnosisResult = await res.json();
        setAiDiagnosis(data);
      }
    } catch (err) {
      console.warn('Failed to fetch AI diagnosis, using local fallback:', err);
    } finally {
      setIsLoadingDiagnosis(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial and reactive AI diagnostic fetch
  const lastAnalyzedIssuesRef = useRef<number>(-1);
  useEffect(() => {
    // Only auto-fetch when issues count changes or on mount to avoid infinite loops
    if (issues.length !== lastAnalyzedIssuesRef.current) {
      lastAnalyzedIssuesRef.current = issues.length;
      fetchAiDiagnosis();
    }
  }, [issues.length, fetchAiDiagnosis]);

  // 6. Generate Official Incident Report
  const fetchIncidentReport = async () => {
    setIsLoadingReport(true);
    setIsReportModalOpen(true);
    try {
      const res = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemState: {
            components,
            issues,
            totalCurrent,
            totalPowerKw,
            gridHealthScore,
            overallRisk: maxRisk,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReportContent(data.report || 'Report generation complete.');
      }
    } catch (err) {
      console.warn('Report fetch failed:', err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // 7. Component Manipulation Handlers
  const handleUpdateComponent = (id: string, partial: Partial<SpacecraftComponent>) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const merged = { ...c, ...partial };
          return evaluateComponent(merged);
        }
        return c;
      })
    );
  };

  const handleToggleCable = (id: string) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextConnected = !c.cableConnected;
          return evaluateComponent({
            ...c,
            cableConnected: nextConnected,
            currentDraw: nextConnected ? c.nominalCurrent : 0.0,
            shortCircuitRisk: nextConnected ? 6 : 0,
            status: nextConnected ? 'NOMINAL' : 'OFFLINE',
          });
        }
        return c;
      })
    );
  };

  const handleFaultTriggered = (_faultTitle?: string) => {
    setIsAlertDismissed(false);
    setAlertTriggerKey(Date.now());
  };

  const handleApplyPreset = (preset: FaultPreset) => {
    setComponents((prev) => preset.apply(prev).map(evaluateComponent));
    if (preset.id !== 'nominal-restore') {
      setIsAlertDismissed(false);
      setAlertTriggerKey(Date.now());
    }
  };

  const handleResetAll = () => {
    setComponents(INITIAL_COMPONENTS.map(evaluateComponent));
    setIsAlertDismissed(false);
  };

  // 8. One-Click AI Remediation Handlers
  const handleAutoFixIssue = (issue: DiagnosticIssue) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === issue.componentId) {
          return evaluateComponent({
            ...c,
            cableConnected: true,
            currentDraw: c.nominalCurrent,
            temperature: c.tempNominal,
            leakageCurrent: 2.2,
            shortCircuitRisk: 5,
            status: 'NOMINAL',
          });
        }
        return c;
      })
    );
  };

  const handleExecuteFullMitigation = () => {
    // Autonomous remediation: plug all cables, normalize temperatures, reset currents & leakages
    setComponents((prev) =>
      prev.map((c) =>
        evaluateComponent({
          ...c,
          cableConnected: true,
          currentDraw: c.nominalCurrent,
          temperature: c.tempNominal,
          leakageCurrent: 2.1,
          shortCircuitRisk: 5,
          status: 'NOMINAL',
        })
      )
    );
  };

  const inspectingComponent =
    components.find((c) => c.id === inspectingComponentId) || null;

  return (
    <div
      id="app-root-canvas"
      data-theme={theme}
      className={`min-h-screen flex flex-col font-sans telemetry-bg-grid relative transition-colors duration-300 ${
        isHazard
          ? 'bg-[#0A0A0B] text-white selection:bg-[#FACC15]/40 selection:text-black'
          : isIndustrial
          ? 'bg-[#2B303A] text-[#EAD7C3] selection:bg-[#E28743]/40 selection:text-[#1B1E26]'
          : 'bg-[#070b12] text-slate-100 selection:bg-blue-600/30 selection:text-blue-200'
      }`}
    >
      {/* Real-time Emergency Warning Alert (Automatically displays on screen when fault occurs with red color and blinks until Fix It is clicked) */}
      <EmergencyWarningAlert
        issues={issues}
        components={components}
        onFixIssue={handleAutoFixIssue}
        onFixAll={handleExecuteFullMitigation}
        onSelectComponent={setSelectedComponentId}
        isDismissed={isAlertDismissed}
        onClose={() => setIsAlertDismissed(true)}
        alertTriggerKey={alertTriggerKey}
      />

      {/* Top Navigation Header */}
      <Header
        gridHealthScore={gridHealthScore}
        activeAlertsCount={issues.length}
        totalCurrent={totalCurrent}
        totalPowerKw={totalPowerKw}
        onOpenReportModal={fetchIncidentReport}
        onOpenChatDrawer={() => setIsChatDrawerOpen(true)}
        onRefreshDiagnosis={fetchAiDiagnosis}
        onResetAll={handleResetAll}
        isLoadingDiagnosis={isLoadingDiagnosis}
        onOpenEmergencyAlert={() => setIsAlertDismissed(false)}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* 1. Admin Simulation Console (Prompt requested first priority for admin fault injection) */}
        <AdminConsole
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={setSelectedComponentId}
          onUpdateComponent={handleUpdateComponent}
          onApplyPreset={handleApplyPreset}
          presets={FAULT_PRESETS}
          onResetAll={handleResetAll}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
          onFaultTriggered={handleFaultTriggered}
        />

        {/* 2. Interactive Circuit Topology & Cable Network Graph */}
        <CircuitSchematicGraph
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={(id) => {
            setSelectedComponentId(id);
            setInspectingComponentId(id);
          }}
          onToggleCable={handleToggleCable}
        />

        {/* 3. Bento Grid: Ranked Machinery Consumption + Short Circuit & Leakage Meters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Which Machinery Consumes More Current (Ranked Bar Chart) */}
          <CurrentConsumptionChart
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
            onUpdateComponent={handleUpdateComponent}
            onInspectComponent={setInspectingComponentId}
          />

          {/* Current Leakages & Short Circuit Risk Radar */}
          <ShortCircuitAndLeakageMeters
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={(id) => {
              setSelectedComponentId(id);
              setInspectingComponentId(id);
            }}
          />
        </div>

        {/* 4. Real-Time Telemetry Alerts Feed with 1-Click Remedies */}
        <RealTimeAlertsFeed
          issues={issues}
          onSelectComponent={(id) => {
            setSelectedComponentId(id);
            setInspectingComponentId(id);
          }}
          onAutoFixIssue={handleAutoFixIssue}
          onExecuteFullMitigation={handleExecuteFullMitigation}
        />

        {/* 5. AI Diagnostics & Solutions Panel */}
        <AiDiagnosticsPanel
          diagnosis={aiDiagnosis}
          isLoading={isLoadingDiagnosis}
          onRefreshDiagnosis={fetchAiDiagnosis}
          onOpenReportModal={fetchIncidentReport}
          onExecuteFullMitigation={handleExecuteFullMitigation}
          onOpenChatDrawer={() => setIsChatDrawerOpen(true)}
        />
      </main>

      {/* Modals & Slide-out Drawers */}
      <AiIncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportText={reportContent}
        isLoading={isLoadingReport}
        onRegenerateReport={fetchIncidentReport}
      />

      <AiAssistantDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        components={components}
      />

      <ComponentDetailModal
        component={inspectingComponent}
        onClose={() => setInspectingComponentId(null)}
        onUpdateComponent={handleUpdateComponent}
      />
    </div>
  );
}
