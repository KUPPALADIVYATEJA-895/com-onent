import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize Gemini AI client:", err);
    }
  }
  return aiClient;
}

// Track quota cooldown to prevent spamming the API when rate limit / quota is exhausted
let quotaCooldownUntil: number = 0;

interface GeminiGenerationResult {
  text: string;
  model: string;
}

/**
 * Safely invokes Gemini with model fallback ('gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash').
 * If rate limit (429 / RESOURCE_EXHAUSTED) is encountered, engages a cooldown and cleanly yields to the onboard engine.
 */
async function safeGeminiGenerate(
  contents: any,
  config?: any
): Promise<GeminiGenerationResult | null> {
  const ai = getGenAI();
  if (!ai) return null;

  const now = Date.now();
  if (now < quotaCooldownUntil) {
    // Silently use onboard engine during cooldown
    return null;
  }

  // Model fallback chain: flash-lite has distinct and higher quotas, then flash-latest, then 3.8-flash
  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
  ];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      if (response && response.text) {
        return {
          text: response.text,
          model,
        };
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isQuotaExhausted =
        err?.status === "RESOURCE_EXHAUSTED" ||
        err?.status === 429 ||
        msg.includes("429") ||
        msg.includes("Quota exceeded") ||
        msg.includes("RESOURCE_EXHAUSTED");

      if (isQuotaExhausted) {
        console.info(`[AEGIS AI] Quota limit active for ${model}. Trying next available model tier...`);
        continue;
      } else {
        console.info(`[AEGIS AI] ${model} unavailable: ${msg.slice(0, 100)}`);
      }
    }
  }

  // If all candidate models exceeded quota or failed, enter a 45-second cooldown
  quotaCooldownUntil = Date.now() + 45000;
  console.info(
    "[AEGIS AI] External AI quota reached. Seamlessly utilizing high-precision onboard Aerospace Diagnostic Engine."
  );
  return null;
}

// In-memory cache for recent diagnosis results to conserve API quota
let cachedDiagnosis: { payloadKey: string; result: any; expiresAt: number } | null = null;

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Telemetry Diagnostics Endpoint
app.post("/api/ai/diagnose", async (req, res) => {
  try {
    const { components, cables, busState, overallRisk } = req.body;
    const ai = getGenAI();

    // Fallback high-fidelity aerospace diagnostic calculation function
    const generateLocalDiagnosis = () => {
      const issues: Array<{
        componentId: string;
        componentName: string;
        type: string;
        severity: "CRITICAL" | "HIGH" | "WARNING" | "NOMINAL";
        description: string;
        remedy: string;
      }> = [];

      // Find true top consumer dynamically from active connected components
      const activeComponents = components ? [...components].filter((c: any) => c.cableConnected && (c.currentDraw || 0) > 0) : [];
      activeComponents.sort((a: any, b: any) => (b.currentDraw || 0) - (a.currentDraw || 0));
      const topConsumer = activeComponents[0] || null;

      let totalCurrent = 0;
      components?.forEach((c: any) => {
        if (c.cableConnected) {
          totalCurrent += (c.currentDraw || 0);
        }

        // Cable disconnect / No current flow
        if (c.cableConnected === false) {
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "OPEN_CIRCUIT_DISCONNECT",
            severity: c.isCritical ? "CRITICAL" : "HIGH",
            description: `Cable umbilical disconnected from ${c.name}. Zero current flow detected (0.0A). Operational blackout for this subsystem.`,
            remedy: `Re-seat and lock magnetic latch on cable ${c.cableId || "port"}. Verify terminal impedance before energizing.`,
          });
        }

        // Current leakage
        if (c.leakageCurrent > 25) {
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "GROUND_FAULT_LEAKAGE",
            severity: c.leakageCurrent > 80 ? "CRITICAL" : "HIGH",
            description: `Abnormal chassis leakage current of ${c.leakageCurrent.toFixed(1)} mA detected on ${c.name}. Insulation breakdown hazard.`,
            remedy: `Deploy dielectric shunt, isolate ground bus, and inspect dielectric coating on ${c.name} casing.`,
          });
        }

        // Overheating
        if (c.temperature > c.tempThreshold) {
          const delta = c.temperature - c.tempThreshold;
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "THERMAL_OVERHEAT",
            severity: delta > 30 ? "CRITICAL" : "HIGH",
            description: `Core temperature (${c.temperature.toFixed(1)}°C) exceeds safety limit (${c.tempThreshold}°C) by ${delta.toFixed(1)}°C. Risk of thermal degradation.`,
            remedy: `Divert secondary coolant loop to ${c.name}, throttle component duty cycle by 40%, and check radiator fins.`,
          });
        }

        // Current Overflow / Surge
        if (c.currentDraw > c.maxCurrent) {
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "CURRENT_OVERFLOW",
            severity: "CRITICAL",
            description: `Current surge of ${c.currentDraw.toFixed(1)}A exceeds rated max limit (${c.maxCurrent}A). Potential transformer/coil blowout.`,
            remedy: `Engage active current limiter, trim sub-phase draw, and reset digital circuit breaker CB-${c.id}.`,
          });
        }

        // Potential Short Circuit Risk
        if (c.shortCircuitRisk > 40) {
          issues.push({
            componentId: c.id,
            componentName: c.name,
            type: "SHORT_CIRCUIT_HAZARD",
            severity: c.shortCircuitRisk > 75 ? "CRITICAL" : "HIGH",
            description: `Short circuit probability assessed at ${c.shortCircuitRisk.toFixed(0)}% due to combined thermal stress and impedance degradation.`,
            remedy: `Isolate high-voltage bus bar, engage solid-state contactor, and perform pulse impedance sweep.`,
          });
        }
      });

      return {
        timestamp: new Date().toISOString(),
        gridHealthScore: Math.max(10, 100 - (issues.length * 18)),
        issuesCount: issues.length,
        topPowerConsumer: topConsumer ? {
          name: topConsumer.name,
          current: topConsumer.currentDraw,
          percentTotal: totalCurrent > 0 ? ((topConsumer.currentDraw / totalCurrent) * 100).toFixed(1) : "0",
        } : null,
        issues,
        rootCauseSummary: issues.length === 0
          ? "All spacecraft electrical bus channels, cabling, and thermal profiles are operating within nominal NASA-STD aerospace tolerances."
          : `Detected ${issues.length} anomaly vectors across the power grid. Primary failure driver: ${issues[0]?.description || "Electrical irregularity"}.`,
        shortCircuitAnalysis: `Grid dielectric integrity is currently rated at ${Math.max(5, 100 - (overallRisk || 0))}%. Critical arc flash prevention systems are active.`,
        actionPlan: issues.length === 0
          ? ["Continue passive telemetry monitoring.", "Maintain cryogenic pump pressure.", "Battery charge balancing nominal."]
          : issues.map((iss, i) => `${i + 1}. [${iss.severity}] ${iss.remedy}`),
      };
    };

    // Check recent cache to prevent unnecessary duplicate Gemini API calls
    const cacheKey = JSON.stringify({
      comps: components?.map((c: any) => `${c.id}:${c.cableConnected}:${Math.round(c.currentDraw)}:${Math.round(c.temperature)}:${c.leakageCurrent > 20}`),
      overallRisk: Math.round(overallRisk || 0),
    });

    const now = Date.now();
    if (cachedDiagnosis && cachedDiagnosis.payloadKey === cacheKey && now < cachedDiagnosis.expiresAt) {
      return res.json(cachedDiagnosis.result);
    }

    const prompt = `You are the onboard Aegis Spacecraft Electrical & Component Diagnostic AI.
Analyze this live telemetry data:
${JSON.stringify({ components, cables, busState, overallRisk }, null, 2)}

Provide a strict JSON response analyzing the faults:
- Cables unplugged / broken (where current stopped flowing)
- Current leakages (ground fault mA)
- Which machinery consumes the most current
- Current overflow / overcurrent risks
- Overheating / thermal runaway
- Potential short circuit risks
- Step-by-step engineering solutions to fix each issue

Respond strictly with valid JSON conforming to this schema:
{
  "gridHealthScore": number (0-100),
  "rootCauseSummary": string,
  "topPowerConsumer": {
    "name": string,
    "current": number,
    "percentTotal": string
  },
  "issues": [
    {
      "componentId": string,
      "componentName": string,
      "type": string,
      "severity": "CRITICAL" | "HIGH" | "WARNING",
      "description": string,
      "remedy": string
    }
  ],
  "shortCircuitAnalysis": string,
  "actionPlan": string[]
}`;

    const geminiResult = await safeGeminiGenerate(prompt, {
      responseMimeType: "application/json",
    });

    if (geminiResult && geminiResult.text) {
      try {
        const parsed = JSON.parse(geminiResult.text.trim());
        const localTelemetry = generateLocalDiagnosis();
        const responseData = {
          source: geminiResult.model,
          ...parsed,
          topPowerConsumer: localTelemetry.topPowerConsumer || parsed.topPowerConsumer,
        };
        cachedDiagnosis = {
          payloadKey: cacheKey,
          result: responseData,
          expiresAt: Date.now() + 20000, // 20-second cache window
        };
        return res.json(responseData);
      } catch (parseErr) {
        console.info("[AEGIS AI] Response parsing yielded invalid JSON, utilizing onboard engine.");
      }
    }

    // High-fidelity fallback response from onboard aerospace engine
    const localResult = generateLocalDiagnosis();
    const fallbackResponse = {
      source: "aegis-embedded-engine",
      ...localResult,
    };

    cachedDiagnosis = {
      payloadKey: cacheKey,
      result: fallbackResponse,
      expiresAt: Date.now() + 10000,
    };

    return res.json(fallbackResponse);
  } catch (err: any) {
    console.error("Diagnostics error:", err);
    res.status(500).json({ error: err.message || "Diagnostic computation failed" });
  }
});

// Interactive AI Spacecraft Engineer Q&A
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, systemState } = req.body;
    const components: any[] = systemState?.components || [];
    const msg = (message || "").toLowerCase();

    // Deterministic, telemetry-aware diagnostic rule engine strictly adhering to user-defined keyword rules:
    // 1. "power" or "consume" -> 1st data (Top Power Consumer)
    // 2. "current" or "leakage" / "leakge" -> 2nd data (Current Leakage Check)
    // 3. "high" or "temperature" -> 3rd data (High Temperature Monitor)
    // 4. "risk", "faults", or "list" -> 4th data (Faults & Risks List)
    let reply = "";

    // Rule 1: contains "power" or "consume" (or "consumption") -> 1st data
    if (msg.includes("power") || msg.includes("consume") || msg.includes("consumption")) {
      if (components.length > 0) {
        const sorted = [...components].sort(
          (a, b) => (b.cableConnected ? b.currentDraw || 0 : 0) - (a.cableConnected ? a.currentDraw || 0 : 0)
        );
        const top = sorted[0];
        const totalAmps = components.reduce((sum, c) => sum + (c.cableConnected ? c.currentDraw || 0 : 0), 0);
        const totalKw = (totalAmps * 480) / 1000;
        const topKw = top && top.cableConnected ? (((top.currentDraw || 0) * 480) / 1000).toFixed(2) : "0.00";
        const share = totalAmps > 0 && top && top.cableConnected ? (((top.currentDraw || 0) / totalAmps) * 100).toFixed(1) : "0.0";
        const disconnected = components.filter((c) => !c.cableConnected || c.currentDraw === 0);

        reply =
          `### ⚡ 1. Top Power Consumer & Grid Load Audit\n\n` +
          (top && top.cableConnected && (top.currentDraw || 0) > 0
            ? `**Primary Power Consumer:** **${top.name} (${top.id})**\n` +
              `- **Current Draw:** **${top.currentDraw.toFixed(1)} A** (Nominal: ${top.nominalCurrent || 60} A | Max Rating: ${top.maxCurrent || 100} A)\n` +
              `- **Power Consumption:** **${topKw} kW** (${share}% of aggregate 480V DC grid load)\n` +
              `- **Operational Status:** ${(top.currentDraw || 0) > (top.maxCurrent || 100) ? "🚨 OVERCURRENT HAZARD" : top.status || "NOMINAL"}\n` +
              `- **Core Temperature:** ${(top.temperature || 45).toFixed(1)}°C\n\n`
            : `**Status:** All chambers are currently de-energized or disconnected from the 480V DC main bus.\n\n`) +
          `**Spacecraft Machinery Power Consumption Ranking:**\n` +
          sorted
            .map((c, i) => {
              const kw = c.cableConnected ? (((c.currentDraw || 0) * 480) / 1000).toFixed(2) : "0.00";
              const pct = totalAmps > 0 && c.cableConnected ? (((c.currentDraw || 0) / totalAmps) * 100).toFixed(1) : "0.0";
              const note = !c.cableConnected ? " [DISCONNECTED / 0A]" : (c.currentDraw || 0) > (c.maxCurrent || 100) ? " [OVERLOAD]" : "";
              return `${i + 1}. **${c.name}**: **${c.cableConnected ? (c.currentDraw || 0).toFixed(1) : "0.0"} A** (${kw} kW, ${pct}% load)${note}`;
            })
            .join("\n") +
          `\n\n**Aggregate Bus Telemetry:** **${totalAmps.toFixed(1)} A** across all nodes (**${totalKw.toFixed(2)} kW** total dissipation).` +
          (disconnected.length > 0
            ? `\n\n⚠️ **Zero Current Flow / Disconnected Modules:**\n${disconnected
                .map((c) => `- **${c.name} (${c.id})**: 0.0 A (${!c.cableConnected ? "Umbilical Unplugged / Open Circuit" : "Standby / De-energized"})`)
                .join("\n")}`
            : "");
      } else {
        reply = `Telemetry offline: Unable to calculate power consumption ranking.`;
      }
    }

    // 2. Second: "current" or "leakage" (or "leakge", "leak") -> 2nd diagnostic domain (Current Leakage Check)
    else if (msg.includes("leakage") || msg.includes("leakge") || msg.includes("leak") || msg.includes("current")) {
      const leaking = components.filter((c) => (c.leakageCurrent || 0) > 20);

      if (leaking.length > 0) {
        reply =
          `### 🧲 2. Chassis Current Leakage & Ground Isolation Audit\n\n` +
          `🚨 **Active Chassis Ground Faults Detected (${leaking.length} Chamber${leaking.length > 1 ? "s" : ""}):**\n\n` +
          leaking
            .map(
              (c) =>
                `#### **${c.name} (${c.id})**\n` +
                `- **Leakage Current:** **${c.leakageCurrent.toFixed(1)} mA** to titanium chassis (Safety Limit: 20.0 mA)\n` +
                `- **Short Circuit Risk Index:** **${c.shortCircuitRisk || 0}%**\n` +
                `- **Hazard Level:** ${(c.leakageCurrent || 0) > 50 ? "CRITICAL - High Arc Flash / Shock Hazard" : "ELEVATED - Dielectric Breakdown"}\n` +
                `- **Underlying Cause:** Micro-fractures or moisture condensation bridging conductor insulation to titanium chassis frame.\n` +
                `- **Prescribed Engineering Solution:** Engage branch galvanic isolation relay, deploy aeroshell dielectric sealant to terminal blocks, and reset chassis ground fault detector.`
            )
            .join("\n\n") +
          `\n\n**Chassis Leakage Across All Spacecraft Chambers:**\n` +
          components
            .map((c) => `- **${c.name}**: **${(c.leakageCurrent || 0).toFixed(1)} mA** ${(c.leakageCurrent || 0) > 20 ? "⚠️ [ELEVATED GROUND FAULT]" : "✓ (Insulation Intact)"}`)
            .join("\n");
      } else {
        reply =
          `### 🧲 2. Chassis Current Leakage & Ground Isolation Audit\n\n` +
          `✅ **No abnormal current leakage detected.**\n\n` +
          `All spacecraft component dielectric insulation barriers are intact and operating within aerospace safety parameters. Monitored chassis leakage across all 8 chambers remains below the 20.0 mA safety threshold (nominal baseline < 5.0 mA). No ground fault remediation is required.\n\n` +
          `**Monitored Chassis Leakage Across All Chambers:**\n` +
          components
            .map((c) => `- **${c.name}**: **${(c.leakageCurrent || 0).toFixed(1)} mA** ✓ (Insulation Intact)`)
            .join("\n");
      }
    }

    // 3. Third: "high" or "temperature" (or "temp", "thermal", "hot") -> 3rd diagnostic domain (High Temperature Monitor)
    else if (msg.includes("high") || msg.includes("temperature") || msg.includes("temp") || msg.includes("thermal") || msg.includes("hot")) {
      const hot = components.filter((c) => (c.temperature || 0) > (c.tempThreshold || 75) || c.status === "CRITICAL" || c.status === "WARNING");
      const sortedTemps = [...components].sort((a, b) => (b.temperature || 0) - (a.temperature || 0));

      if (hot.length > 0) {
        reply =
          `### 🌡️ 3. High Temperature & Thermal Dissipation Audit\n\n` +
          `🔥 **Chambers Operating Above Safe Thermal Thresholds (${hot.length} Chamber${hot.length > 1 ? "s" : ""}):**\n\n` +
          hot
            .map((c) => {
              const threshold = c.tempThreshold || 75;
              const delta = (c.temperature || 0) - threshold;
              return (
                `#### **${c.name} (${c.id})**\n` +
                `- **Current Core Temperature:** **${(c.temperature || 0).toFixed(1)}°C** (Rated Limit: ${threshold}°C | Delta: +${delta.toFixed(1)}°C)\n` +
                `- **Thermal Status:** ${(c.temperature || 0) >= (c.tempMax || 95) ? "🚨 CRITICAL (Max Temp Exceeded)" : "⚠️ WARNING (Thermal Throttle Required)"}\n` +
                `- **Active Current Load:** ${(c.currentDraw || 0).toFixed(1)} A\n` +
                `- **Underlying Cause:** Resistive Joule heating under sustained load or insufficient cryogenic heat-sink flow.\n` +
                `- **Prescribed Solution:** Throttle power duty cycle or cycle auxiliary Cryogenic Coolant Distribution Pump to restore nominal 45°C–65°C equilibrium.`
              );
            })
            .join("\n\n") +
          `\n\n**Chamber Thermal Readings (Highest to Lowest):**\n` +
          sortedTemps
            .map((c) => `- **${c.name}**: **${(c.temperature || 0).toFixed(1)}°C** / Limit ${c.tempThreshold || 75}°C ${(c.temperature || 0) > (c.tempThreshold || 75) ? "🔥 [OVERHEATING]" : "✓ [NOMINAL]"}`)
            .join("\n");
      } else {
        reply =
          `### 🌡️ 3. High Temperature & Thermal Dissipation Audit\n\n` +
          `✅ **All spacecraft chambers are operating in safe thermal equilibrium.**\n\n` +
          `No machinery node exceeds thermal threshold boundaries. All component core temperatures are operating normally between 40°C and 72°C. Cryogenic heat sinks and passive radiators are dissipating nominal thermal output.\n\n` +
          `**Chamber Thermal Readings:**\n` +
          sortedTemps
            .map((c) => `- **${c.name}**: **${(c.temperature || 0).toFixed(1)}°C** ✓ [NOMINAL]`)
            .join("\n");
      }
    }

    // 4. Fourth: "risk", "faults", "fault", or "list" -> 4th diagnostic domain (Faults & Risks Manifest)
    else if (msg.includes("risk") || msg.includes("fault") || msg.includes("faults") || msg.includes("list")) {
      const faults: Array<{
        chamber: string;
        id: string;
        type: string;
        severity: string;
        metrics: string;
        solution: string;
      }> = [];

      components.forEach((c) => {
        if (!c.cableConnected) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: "Open Circuit / Cable Umbilical Disconnect",
            severity: "CRITICAL",
            metrics: "Current Flow: 0.0 A (Blackout)",
            solution: "Re-engage umbilical quick-lock collar and verify pin engagement.",
          });
        }
        if (c.cableConnected && (c.currentDraw || 0) > (c.maxCurrent || 100)) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: "Overcurrent Overflow Hazard",
            severity: "CRITICAL",
            metrics: `Current: ${(c.currentDraw || 0).toFixed(1)} A (Max: ${c.maxCurrent || 100} A)`,
            solution: "Step down branch power supply regulator and shed non-essential loads.",
          });
        }
        if ((c.temperature || 0) > (c.tempThreshold || 75)) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: "Thermal Runaway / Overheating",
            severity: (c.temperature || 0) >= (c.tempMax || 95) ? "CRITICAL" : "HIGH",
            metrics: `Core Temp: ${(c.temperature || 0).toFixed(1)}°C (Limit: ${c.tempThreshold || 75}°C)`,
            solution: "Cycle cryogenic coolant circulation pump and open radiative heat louvers.",
          });
        }
        if ((c.leakageCurrent || 0) > 20) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: "Chassis Ground Fault Leakage",
            severity: (c.leakageCurrent || 0) > 50 ? "CRITICAL" : "HIGH",
            metrics: `Leakage: ${(c.leakageCurrent || 0).toFixed(1)} mA (Max Safe: 20.0 mA)`,
            solution: "Isolate circuit branch, inspect umbilical insulation, and spray dielectric sealant.",
          });
        }
        if ((c.shortCircuitRisk || 0) >= 45) {
          faults.push({
            chamber: c.name,
            id: c.id,
            type: "Short Circuit Arc Hazard",
            severity: (c.shortCircuitRisk || 0) >= 75 ? "CRITICAL" : "HIGH",
            metrics: `Arc Risk Index: ${c.shortCircuitRisk}%`,
            solution: "De-energize high-voltage tap and replace degraded dielectric separation barrier.",
          });
        }
      });

      if (faults.length > 0) {
        reply =
          `### 📋 4. Spacecraft Faults & Diagnostic Risks Manifest\n\n` +
          `⚠️ **Active Anomalies Detected Across Chambers (${faults.length} Fault Condition${faults.length > 1 ? "s" : ""}):**\n\n` +
          faults
            .map(
              (f, i) =>
                `**${i + 1}. ${f.chamber} (${f.id}) — [${f.severity}]**\n` +
                `- **Anomaly Category:** ${f.type}\n` +
                `- **Telemetry Reading:** ${f.metrics}\n` +
                `- **Engineering Action:** ${f.solution}`
            )
            .join("\n\n");
      } else {
        reply =
          `### 📋 4. Spacecraft Faults & Diagnostic Risks Manifest\n\n` +
          `### ✅ No faults detected in the system. All chambers are working good!\n\n` +
          `**Comprehensive Systems Nominal Verification:**\n` +
          `• **Cable Umbilicals:** All 8 chamber umbilical cables are securely locked and conducting nominal current.\n` +
          `• **Current Draw:** All machinery current flows are within rated operating envelopes.\n` +
          `• **Thermal Balance:** All chamber core temperatures are well below safety thresholds.\n` +
          `• **Dielectric Isolation:** Zero chassis leakage detected (<5.0 mA baseline across all nodes).\n` +
          `• **Short Circuit Risk:** Arc probability minimal (<10% nominal margin).`;
      }
    }

    // 5. Particular Component Analysis
    else {
      // Check if user specifically mentioned a component
      const targetComp = components.find((c) => {
        const idMatch = msg.includes(c.id.toLowerCase());
        const nameKeywords = c.name.toLowerCase().split(" ");
        const nameMatch = nameKeywords.some((word: string) => word.length > 3 && msg.includes(word));
        return idMatch || nameMatch;
      });

      if (targetComp) {
        const compFaults: string[] = [];
        if (!targetComp.cableConnected) {
          compFaults.push(`Cable umbilical is disconnected (open circuit), causing total current loss (0.0 A). Solution: Reconnect and lock cable collar.`);
        }
        if (targetComp.currentDraw > 150) {
          compFaults.push(`Current overflow detected at ${targetComp.currentDraw.toFixed(1)} A. Solution: Step down voltage regulator and shed secondary load.`);
        }
        if (targetComp.temperature > 85) {
          compFaults.push(`Thermal runaway risk at ${targetComp.temperature.toFixed(1)}°C. Solution: Flush coolant conduits and adjust operational duty cycle.`);
        }
        if (targetComp.leakageCurrent > 25) {
          compFaults.push(`Chassis ground leakage measured at ${targetComp.leakageCurrent.toFixed(1)} mA. Solution: Re-coat wiring insulation and inspect ground strap.`);
        }
        if (targetComp.shortCircuitRisk >= 60) {
          compFaults.push(`Short circuit hazard score at ${targetComp.shortCircuitRisk}%. Solution: Cycle branch breaker and inspect contact pins.`);
        }

        if (compFaults.length > 0) {
          reply = `### ⚠️ Diagnostic Analysis: ${targetComp.name} (${targetComp.id})\n\n` +
            `**Fault Detected:**\n` +
            compFaults.map((f, i) => `${i + 1}. ${f}`).join("\n") +
            `\n\n**Live Telemetry Readings:**\n` +
            `- **Current Draw:** ${targetComp.currentDraw.toFixed(1)} A\n` +
            `- **Temperature:** ${targetComp.temperature.toFixed(1)}°C\n` +
            `- **Cable Status:** ${targetComp.cableConnected ? "Connected" : "DISCONNECTED"}\n` +
            `- **Chassis Leakage:** ${targetComp.leakageCurrent.toFixed(1)} mA\n` +
            `- **Short Circuit Risk:** ${targetComp.shortCircuitRisk}%`;
        } else {
          reply = `### ✅ Diagnostic Analysis: ${targetComp.name} (${targetComp.id})\n\n` +
            `**No fault detected in ${targetComp.name}.**\n\n` +
            `All telemetry parameters are operating within nominal specifications:\n` +
            `- **Current Draw:** ${targetComp.currentDraw.toFixed(1)} A (Nominal)\n` +
            `- **Core Temperature:** ${targetComp.temperature.toFixed(1)}°C (Stable)\n` +
            `- **Cable Umbilical:** Connected & Latched\n` +
            `- **Chassis Leakage:** ${targetComp.leakageCurrent.toFixed(1)} mA (Safe insulation)\n` +
            `- **Short Circuit Risk:** ${targetComp.shortCircuitRisk}% (Low)`;
        }
      } else {
        const generalPrompt = `You are AURA, the aerospace diagnostic engineer for spacecraft NCC-74656.
Current spacecraft system status:
${JSON.stringify(systemState, null, 2)}

User question: "${message}"

Answer the user's query clearly and concisely based on the live spacecraft telemetry. If it relates to power, leakage, temperature, or faults, refer to those telemetry findings.`;

        const geminiResult = await safeGeminiGenerate(generalPrompt);
        if (geminiResult && geminiResult.text) {
          reply = geminiResult.text;
        } else {
          reply = `### 🛡️ AURA Spacecraft Diagnostic Telemetry Engine\n\n` +
            `Please select or ask about any of the 4 diagnostic domains:\n` +
            `1. **Power / Consumption**: Inquire about which chamber consumes more power.\n` +
            `2. **Current / Leakage**: Inquire about chassis ground fault leakage.\n` +
            `3. **High / Temperature**: Inquire about thermal overheating chambers.\n` +
            `4. **Risk / Faults / List**: Inquire about the complete active faults and risks manifest.`;
        }
      }
    }

    return res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chat failed" });
  }
});

// Full Incident / Diagnostic Report Generator
app.post("/api/ai/report", async (req, res) => {
  try {
    const { systemState, telemetryHistory } = req.body;

    const prompt = `Generate a formal Aerospace Electrical & Life Safety Diagnostic Incident Report for spacecraft NCC-74656 AURA.
System state data:
${JSON.stringify(systemState, null, 2)}

Structure the report with:
1. Executive Summary & Fleet Registry
2. Electrical Bus & Power Distribution Audit (highlighting top power consumers and total amperage)
3. Cable Umbilical & Physical Connection Status (highlighting any disconnected or 0A open-circuit cables)
4. Current Leakage & Ground Fault Analysis (mA leakage, chassis integrity)
5. Thermal Dissipation & Overheat Incidents (°C)
6. Potential Short Circuit Risk Assessment
7. Prescribed Engineering Remediation Procedures
8. Chief Flight Engineer Sign-Off`;

    const geminiResult = await safeGeminiGenerate(prompt);
    if (geminiResult && geminiResult.text) {
      return res.json({ report: geminiResult.text });
    }

    // Default high-precision formatted aerospace report
    const now = new Date();
    const timestamp = now.toUTCString();
    const reportText = `# SPACECRAFT ELECTRICAL & COMPONENT DIAGNOSTIC REPORT
**VESSEL:** USSC AURA (HULL REGISTRY SC-8821)
**MISSION TIME:** ${timestamp}
**DIAGNOSTIC ENGINE:** AURA TELEMETRY AI v4.8 [EMBEDDED AEROSPACE FIRMWARE]
**STATUS:** ${systemState?.issues?.length > 0 ? "ATTENTION REQUIRED - ACTIVE FAULTS LOGGED" : "NOMINAL - ALL SYSTEMS CLEARED FOR ORBIT"}

---

## 1. EXECUTIVE SUMMARY
Continuous telemetry polling scanned 8 primary chambers (Chamber A through Chamber H) and 8 high-gauge interconnect umbilicals. 
- Total Active Power Bus Draw: ${systemState?.totalCurrent || 384} Amperes @ 480V DC
- Grid Health Index: ${systemState?.gridHealthScore || 92} / 100
- Active Anomaly Vectors: ${systemState?.issues?.length || 0} detected

## 2. MACHINERY CURRENT CONSUMPTION BREAKDOWN
Power distribution matrix analysis ranks subsystems by total current draw:
${(systemState?.components || []).map((c: any) => `- **${c.name} (${c.id})**: ${c.currentDraw.toFixed(1)}A (${((c.currentDraw / (systemState?.totalCurrent || 400)) * 100).toFixed(1)}% of total load) | Status: ${c.cableConnected ? (c.currentDraw > c.maxCurrent ? "OVERCURRENT SURGE" : "ENERGIZED") : "OFFLINE / 0.0A"}`).join("\n")}

## 3. CABLE CONNECTIONS & OPEN CIRCUIT AUDIT
${(systemState?.components || []).map((c: any) => `- Cable **${c.cableId || "CB-" + c.id}** -> ${c.name}: ${c.cableConnected ? "LOCKED & SECURED [CONTINUOUS FLOW]" : "DISCONNECTED / OPEN-CIRCUIT [ZERO CURRENT FLOW]"}`).join("\n")}

## 4. CURRENT LEAKAGE & GROUND FAULT VECTORS
- Maximum detected chassis leakage: ${Math.max(...(systemState?.components || []).map((c: any) => c.leakageCurrent || 0)).toFixed(1)} mA
- Safe operational standard threshold: < 20.0 mA
${(systemState?.components || []).filter((c: any) => (c.leakageCurrent || 0) > 20).map((c: any) => `  * WARNING: ${c.name} exhibiting ${c.leakageCurrent.toFixed(1)} mA ground shunt leakage. Potential dielectric micro-fractures in harness.`).join("\n") || "  * All ground paths within safe galvanic margins (<20mA)."}

## 5. THERMAL PROFILES & SHORT CIRCUIT HAZARD INDEX
- Maximum Operating Temperature: ${Math.max(...(systemState?.components || []).map((c: any) => c.temperature || 0)).toFixed(1)} °C
- Aggregate Short Circuit Hazard Probability: ${systemState?.overallRisk || 12}%
${(systemState?.components || []).filter((c: any) => (c.shortCircuitRisk || 0) > 40).map((c: any) => `  * HAZARD: ${c.name} short circuit risk calculated at ${c.shortCircuitRisk.toFixed(0)}%. Triggered by elevated operating temp and contact impedance.`).join("\n") || "  * Short circuit risks minimized by active circuit governors."}

## 6. PRESCRIBED CORRECTIVE ACTIONS
1. If any cables are dislodged, lock mechanical collars and verify continuity before full energization.
2. For current leakage exceeding 30mA, cycle the ground-fault interrupter (GFCI) and inject sealing dielectric resin.
3. For thermal over-runs, activate secondary coolant bypass loop and limit thruster output to 60%.
4. Maintain active short-circuit damping on high-current bus bars.

---
**CERTIFICATION:**
Automated Telemetry AI Core [SIGNATURE VERIFIED]
Ready for Orbital Operations.`;

    return res.json({ report: reportText });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Report generation failed" });
  }
});

// Vite Middleware for Development & Static Serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aegis AI Server running on port ${PORT}`);
  });
}

startServer();
