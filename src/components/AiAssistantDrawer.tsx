import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { SpacecraftComponent } from '../types';
import {
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Zap,
  Flame,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  RotateCcw,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  components: SpacecraftComponent[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  components,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '### 🛡️ AURA Telemetry & Diagnostic AI Online\nI am continuously monitoring real-time cable connections, current flow, thermal dissipation, chassis leakage, and short-circuit risk indices across all 8 spacecraft chambers (Chamber A through Chamber H).\n\nSelect an inquiry from the **Diagnostic Inquiries** below to diagnose spacecraft status.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isOptionsCollapsed, setIsOptionsCollapsed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: '### 🛡️ AURA Telemetry & Diagnostic AI Online\nI am continuously monitoring real-time cable connections, current flow, thermal dissipation, chassis leakage, and short-circuit risk indices across all 8 spacecraft chambers (Chamber A through Chamber H).\n\nSelect an inquiry from the **Diagnostic Inquiries** below to diagnose spacecraft status.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
  };

  const generateLocalDomainReply = (rawMsg: string, comps: SpacecraftComponent[]): string => {
    const msg = rawMsg.toLowerCase();

    // 1. Power / Consume -> 1st Data
    if (msg.includes('power') || msg.includes('consume') || msg.includes('consumption')) {
      const sorted = [...comps].sort(
        (a, b) => (b.cableConnected ? b.currentDraw || 0 : 0) - (a.cableConnected ? a.currentDraw || 0 : 0)
      );
      const top = sorted[0];
      const totalAmps = comps.reduce((sum, c) => sum + (c.cableConnected ? c.currentDraw || 0 : 0), 0);
      const totalKw = (totalAmps * 480) / 1000;
      const topKw = top && top.cableConnected ? (((top.currentDraw || 0) * 480) / 1000).toFixed(2) : '0.00';
      const share = totalAmps > 0 && top && top.cableConnected ? (((top.currentDraw || 0) / totalAmps) * 100).toFixed(1) : '0.0';

      return (
        `### ⚡ 1. Top Power Consumer & Grid Load Audit\n\n` +
        (top && top.cableConnected && top.currentDraw > 0
          ? `**Primary Power Consumer:** **${top.name} (${top.id})**\n` +
            `- **Current Draw:** **${top.currentDraw.toFixed(1)} A** (Nominal: ${top.nominalCurrent} A | Max: ${top.maxCurrent} A)\n` +
            `- **Power Consumption:** **${topKw} kW** (${share}% of aggregate 480V DC grid load)\n` +
            `- **Operational Status:** ${top.currentDraw > top.maxCurrent ? '🚨 OVERCURRENT HAZARD' : top.status}\n` +
            `- **Core Temperature:** ${top.temperature.toFixed(1)}°C\n\n`
          : `**Status:** All chambers are currently de-energized or disconnected from the 480V DC main bus.\n\n`) +
        `**Spacecraft Machinery Power Consumption Ranking:**\n` +
        sorted
          .map((c, i) => {
            const kw = c.cableConnected ? (((c.currentDraw || 0) * 480) / 1000).toFixed(2) : '0.00';
            const pct = totalAmps > 0 && c.cableConnected ? (((c.currentDraw || 0) / totalAmps) * 100).toFixed(1) : '0.0';
            const note = !c.cableConnected ? ' [DISCONNECTED / 0A]' : c.currentDraw > c.maxCurrent ? ' [OVERLOAD]' : '';
            return `${i + 1}. **${c.name}**: **${c.cableConnected ? c.currentDraw.toFixed(1) : '0.0'} A** (${kw} kW, ${pct}% load)${note}`;
          })
          .join('\n') +
        `\n\n**Aggregate Bus Telemetry:** **${totalAmps.toFixed(1)} A** across all nodes (**${totalKw.toFixed(2)} kW** total dissipation).`
      );
    }

    // 2. Current / Leakage / Leakge -> 2nd Data
    if (msg.includes('leakage') || msg.includes('leakge') || msg.includes('leak') || msg.includes('current')) {
      const leaking = comps.filter((c) => (c.leakageCurrent || 0) > 20);
      if (leaking.length > 0) {
        return (
          `### 🧲 2. Chassis Current Leakage & Ground Isolation Audit\n\n` +
          `🚨 **Active Chassis Ground Faults Detected (${leaking.length} Chamber${leaking.length > 1 ? 's' : ''}):**\n\n` +
          leaking
            .map(
              (c) =>
                `#### **${c.name} (${c.id})**\n` +
                `- **Leakage Current:** **${c.leakageCurrent.toFixed(1)} mA** to titanium chassis (Safety Limit: 20.0 mA)\n` +
                `- **Short Circuit Risk Index:** **${c.shortCircuitRisk || 0}%**\n` +
                `- **Hazard Level:** ${(c.leakageCurrent || 0) > 50 ? 'CRITICAL - High Arc Flash / Shock Hazard' : 'ELEVATED - Dielectric Breakdown'}\n` +
                `- **Underlying Cause:** Micro-fractures or moisture condensation bridging conductor insulation to titanium chassis frame.\n` +
                `- **Prescribed Engineering Solution:** Engage branch galvanic isolation relay, deploy aeroshell dielectric sealant to terminal blocks, and reset chassis ground fault detector.`
            )
            .join('\n\n') +
          `\n\n**Chassis Leakage Across All Spacecraft Chambers:**\n` +
          comps
            .map((c) => `- **${c.name}**: **${(c.leakageCurrent || 0).toFixed(1)} mA** ${(c.leakageCurrent || 0) > 20 ? '⚠️ [ELEVATED GROUND FAULT]' : '✓ (Insulation Intact)'}`)
            .join('\n')
        );
      }
      return (
        `### 🧲 2. Chassis Current Leakage & Ground Isolation Audit\n\n` +
        `✅ **No abnormal current leakage detected.**\n\n` +
        `All spacecraft component dielectric insulation barriers are intact and operating within aerospace safety parameters. Monitored chassis leakage across all 8 chambers remains below the 20.0 mA safety threshold (nominal baseline < 5.0 mA). No ground fault remediation is required.\n\n` +
        `**Monitored Chassis Leakage Across All Chambers:**\n` +
        comps
          .map((c) => `- **${c.name}**: **${(c.leakageCurrent || 0).toFixed(1)} mA** ✓ (Insulation Intact)`)
          .join('\n')
      );
    }

    // 3. High / Temperature -> 3rd Data
    if (msg.includes('high') || msg.includes('temperature') || msg.includes('temp') || msg.includes('thermal') || msg.includes('hot')) {
      const hot = comps.filter((c) => (c.temperature || 0) > (c.tempThreshold || 75) || c.status === 'CRITICAL' || c.status === 'WARNING');
      const sortedTemps = [...comps].sort((a, b) => (b.temperature || 0) - (a.temperature || 0));

      if (hot.length > 0) {
        return (
          `### 🌡️ 3. High Temperature & Thermal Dissipation Audit\n\n` +
          `🔥 **Chambers Operating Above Safe Thermal Thresholds (${hot.length} Chamber${hot.length > 1 ? 's' : ''}):**\n\n` +
          hot
            .map((c) => {
              const threshold = c.tempThreshold || 75;
              const delta = (c.temperature || 0) - threshold;
              return (
                `#### **${c.name} (${c.id})**\n` +
                `- **Current Core Temperature:** **${(c.temperature || 0).toFixed(1)}°C** (Rated Limit: ${threshold}°C | Delta: +${delta.toFixed(1)}°C)\n` +
                `- **Thermal Status:** ${(c.temperature || 0) >= (c.tempMax || 95) ? '🚨 CRITICAL (Max Temp Exceeded)' : '⚠️ WARNING (Thermal Throttle Required)'}\n` +
                `- **Active Current Load:** ${(c.currentDraw || 0).toFixed(1)} A\n` +
                `- **Underlying Cause:** Resistive Joule heating under sustained load or insufficient cryogenic heat-sink flow.\n` +
                `- **Prescribed Solution:** Throttle power duty cycle or cycle auxiliary Cryogenic Coolant Distribution Pump to restore nominal 45°C–65°C equilibrium.`
              );
            })
            .join('\n\n') +
          `\n\n**Chamber Thermal Readings (Highest to Lowest):**\n` +
          sortedTemps
            .map((c) => `- **${c.name}**: **${(c.temperature || 0).toFixed(1)}°C** / Limit ${c.tempThreshold || 75}°C ${(c.temperature || 0) > (c.tempThreshold || 75) ? '🔥 [OVERHEATING]' : '✓ [NOMINAL]'}`)
            .join('\n')
        );
      }
      return (
        `### 🌡️ 3. High Temperature & Thermal Dissipation Audit\n\n` +
        `✅ **All spacecraft chambers are operating in safe thermal equilibrium.**\n\n` +
        `No machinery node exceeds thermal threshold boundaries. All component core temperatures are operating normally between 40°C and 72°C. Cryogenic heat sinks and passive radiators are dissipating nominal thermal output.\n\n` +
        `**Chamber Thermal Readings:**\n` +
        sortedTemps
          .map((c) => `- **${c.name}**: **${(c.temperature || 0).toFixed(1)}°C** ✓ [NOMINAL]`)
          .join('\n')
      );
    }

    // 4. Risk / Faults / Fault / List -> 4th Data
    if (msg.includes('risk') || msg.includes('fault') || msg.includes('faults') || msg.includes('list')) {
      const faults: Array<{ chamber: string; id: string; type: string; severity: string; metrics: string; solution: string }> = [];

      comps.forEach((c) => {
        if (!c.cableConnected) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: 'Open Circuit / Cable Umbilical Disconnect',
            severity: 'CRITICAL',
            metrics: 'Current Flow: 0.0 A (Blackout)',
            solution: 'Re-engage umbilical quick-lock collar and verify pin engagement.',
          });
        }
        if (c.cableConnected && (c.currentDraw || 0) > (c.maxCurrent || 100)) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: 'Overcurrent Overflow Hazard',
            severity: 'CRITICAL',
            metrics: `Current: ${(c.currentDraw || 0).toFixed(1)} A (Max: ${c.maxCurrent || 100} A)`,
            solution: 'Step down branch power supply regulator and shed non-essential loads.',
          });
        }
        if ((c.temperature || 0) > (c.tempThreshold || 75)) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: 'Thermal Runaway / Overheating',
            severity: (c.temperature || 0) >= (c.tempMax || 95) ? 'CRITICAL' : 'HIGH',
            metrics: `Core Temp: ${(c.temperature || 0).toFixed(1)}°C (Limit: ${c.tempThreshold || 75}°C)`,
            solution: 'Cycle cryogenic coolant circulation pump and open radiative heat louvers.',
          });
        }
        if ((c.leakageCurrent || 0) > 20) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: 'Chassis Ground Fault Leakage',
            severity: (c.leakageCurrent || 0) > 50 ? 'CRITICAL' : 'HIGH',
            metrics: `Leakage: ${(c.leakageCurrent || 0).toFixed(1)} mA (Max Safe: 20.0 mA)`,
            solution: 'Isolate circuit branch, inspect umbilical insulation, and spray dielectric sealant.',
          });
        }
        if ((c.shortCircuitRisk || 0) >= 45) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: 'Short Circuit Arc Hazard',
            severity: (c.shortCircuitRisk || 0) >= 75 ? 'CRITICAL' : 'HIGH',
            metrics: `Arc Risk Index: ${c.shortCircuitRisk}%`,
            solution: 'De-energize high-voltage tap and replace degraded dielectric separation barrier.',
          });
        }
      });

      if (faults.length > 0) {
        return (
          `### 📋 4. Spacecraft Faults & Diagnostic Risks Manifest\n\n` +
          `⚠️ **Active Anomalies Detected Across Chambers (${faults.length} Fault Condition${faults.length > 1 ? 's' : ''}):**\n\n` +
          faults
            .map(
              (f, i) =>
                `**${i + 1}. ${f.chamber} (${f.id}) — [${f.severity}]**\n` +
                `- **Anomaly Category:** ${f.type}\n` +
                `- **Telemetry Reading:** ${f.metrics}\n` +
                `- **Engineering Action:** ${f.solution}`
            )
            .join('\n\n')
        );
      }
      return (
        `### 📋 4. Spacecraft Faults & Diagnostic Risks Manifest\n\n` +
        `### ✅ No faults detected in the system. All chambers are working good!\n\n` +
        `**Comprehensive Systems Nominal Verification:**\n` +
        `• **Cable Umbilicals:** All 8 chamber umbilical cables are securely locked and conducting nominal current.\n` +
        `• **Current Draw:** All machinery current flows are within rated operating envelopes.\n` +
        `• **Thermal Balance:** All chamber core temperatures are well below safety thresholds.\n` +
        `• **Dielectric Isolation:** Zero chassis leakage detected (<5.0 mA baseline across all nodes).\n` +
        `• **Short Circuit Risk:** Arc probability minimal (<10% nominal margin).`
      );
    }

    return (
      `### 🛡️ AURA Spacecraft Diagnostic Telemetry Engine\n\n` +
      `Please select or ask about any of the 4 diagnostic domains:\n` +
      `1. **Power / Consumption**: Inquire about which chamber consumes more power.\n` +
      `2. **Current / Leakage**: Inquire about chassis ground fault leakage.\n` +
      `3. **High / Temperature**: Inquire about thermal overheating chambers.\n` +
      `4. **Risk / Faults / List**: Inquire about the complete active faults and risks manifest.`
    );
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          systemState: {
            components: components.map((c) => ({
              id: c.id,
              name: c.name,
              currentDraw: c.currentDraw,
              nominalCurrent: c.nominalCurrent,
              maxCurrent: c.maxCurrent,
              temperature: c.temperature,
              cableConnected: c.cableConnected,
              leakageCurrent: c.leakageCurrent,
              shortCircuitRisk: c.shortCircuitRisk,
              status: c.status,
            })),
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || generateLocalDomainReply(query, components),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Fallback directly to the exact diagnostic rule engine matching the 4 domains
      const localReply = generateLocalDomainReply(query, components);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: localReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const recommendationOptions = [
    {
      id: 'opt-power',
      label: 'Top Power Consumer',
      query: 'Which component consumes more power in the spacecraft grid?',
      icon: Zap,
      desc: 'Rank machinery current draw',
      border: 'hover:border-cyan-500/70',
      badge: 'Current Load',
    },
    {
      id: 'opt-leakage',
      label: 'Current Leakage Check',
      query: 'Which component has current leakage escaping to the chassis ground?',
      icon: Radio,
      desc: 'Chassis ground faults & mA',
      border: 'hover:border-amber-500/70',
      badge: 'Ground Faults',
    },
    {
      id: 'opt-temp',
      label: 'High Temperature Monitor',
      query: 'Which component has high temperature or thermal runaway risk?',
      icon: Flame,
      desc: 'Overheat & coolant check',
      border: 'hover:border-orange-500/70',
      badge: 'Thermal Risk',
    },
    {
      id: 'opt-faults-list',
      label: 'Faults & Risks List',
      query: 'List of faults and risks in the spacecraft components',
      icon: ShieldAlert,
      desc: 'Full anomaly audit report',
      border: 'hover:border-rose-500/70',
      badge: 'Fault Manifest',
    },
  ];

  return (
    <div
      id="ai-assistant-drawer-container"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#131926] border-l border-[#232f42] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-sans"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-[#232f42] bg-[#0f141f] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/15 text-blue-400 rounded-lg border border-blue-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                FLIGHT ENGINEER ASSISTANT
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1a2336] text-slate-300 border border-[#2c384c]">
                ACTIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Telemetry engineering assistant & chamber fault analysis console
            </p>
          </div>
        </div>

        {/* Action Controls: Refresh / New Chat and Close */}
        <div className="flex items-center gap-1.5">
          {/* Refresh Option: Clears previous chat and starts fresh */}
          <button
            id="btn-refresh-ai-chat"
            onClick={handleResetChat}
            title="Start new chat (clears all previous messages)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#1b2332] hover:bg-[#232e42] text-slate-300 border border-[#2c384c] transition-colors shadow-sm group"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-400 group-hover:-rotate-90 transition-transform duration-200" />
            <span>New Chat</span>
          </button>

          {/* Close Drawer */}
          <button
            id="btn-close-ai-chat"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1b2332] rounded-lg transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Recommendations & Component Audit Section */}
      <div className="border-b border-[#232f42] bg-[#0f141f] shrink-0 transition-all">
        {/* Section Header with Small Arrow Toggle (<) */}
        <div className="px-3 py-2 flex items-center justify-between bg-[#0f141f]">
          <button
            id="btn-toggle-options-collapse"
            onClick={() => setIsOptionsCollapsed((prev) => !prev)}
            className="flex items-center gap-2 group text-left focus:outline-none"
            title={isOptionsCollapsed ? 'Expand diagnostic options' : 'Collapse diagnostic options'}
          >
            <div className="w-5 h-5 rounded flex items-center justify-center bg-[#161d2b] border border-[#232f42] text-blue-400 group-hover:border-blue-500 group-hover:bg-[#1b2332] transition-colors shadow-sm">
              <ChevronLeft
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isOptionsCollapsed ? '-rotate-90' : 'rotate-0'
                }`}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Diagnostic Inquiries
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {isOptionsCollapsed ? '(tap to expand)' : '(diagnostic inquiries)'}
              </span>
            </div>
          </button>

          <span className="text-[10px] font-mono text-slate-500">
            {isOptionsCollapsed ? 'Tap to expand' : 'Quick audit'}
          </span>
        </div>

        {/* Expandable / Collapsible Options Content */}
        {!isOptionsCollapsed && (
          <div className="p-3 pt-0">
            {/* 4 Core Inquiries */}
            <div className="grid grid-cols-2 gap-1.5">
              {recommendationOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    id={opt.id}
                    onClick={() => handleSend(opt.query)}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-[#161d2b] border border-[#232f42] hover:border-blue-500 text-left transition-colors group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="p-1 rounded bg-[#131926] text-blue-400 group-hover:text-blue-300 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-400">
                        {opt.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 leading-tight">
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0d121c] font-sans">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1b2332] border border-[#2c384c] text-blue-400'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-xl max-w-[88%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#161d2b] border border-[#232f42] text-slate-200 shadow-sm'
              }`}
            >
              {m.sender === 'user' ? (
                <p className="whitespace-pre-wrap font-medium">{m.text}</p>
              ) : (
                <div className="space-y-2 prose-invert text-slate-200 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-blue-300 [&_h3]:mb-1 [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_strong]:text-slate-100 [&_strong]:font-semibold [&_li]:text-slate-300">
                  <Markdown>{m.text}</Markdown>
                </div>
              )}
              <span className={`text-[9px] font-mono block text-right mt-1.5 pt-1 border-t ${
                m.sender === 'user' ? 'text-blue-200/80 border-blue-500/50' : 'text-slate-500 border-[#232f42]'
              }`}>
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 p-2.5 bg-[#161d2b] rounded-lg border border-[#232f42]">
            <Sparkles className="w-4 h-4 animate-spin text-blue-400" />
            <span>Flight Engineer evaluating chamber telemetry & physics models...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-[#232f42] bg-[#0f141f] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="input-engineer-chat"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about cables, leakage, temperatures, or chambers..."
            className="flex-1 bg-[#161d2b] border border-[#232f42] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
          />
          <button
            id="btn-send-engineer-chat"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

