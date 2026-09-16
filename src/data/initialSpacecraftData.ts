import { SpacecraftComponent, CableConnection, FaultPreset } from '../types';

export const INITIAL_COMPONENTS: SpacecraftComponent[] = [
  {
    id: 'PWR-01',
    name: 'Chamber A',
    category: 'POWER',
    voltage: 480,
    nominalCurrent: 120,
    currentDraw: 122.4,
    maxCurrent: 180,
    temperature: 64.2,
    tempNominal: 60.0,
    tempThreshold: 85.0,
    tempMax: 110.0,
    cableId: 'CB-01',
    cableConnected: true,
    cableResistance: 4.2,
    leakageCurrent: 3.1,
    shortCircuitRisk: 8,
    status: 'NOMINAL',
    isCritical: true,
    gridX: 180,
    gridY: 300,
    description: 'Chamber A: Primary magnetic confinement fission reactor generating 480V DC main bus power.',
    specDetails: {
      operatingPowerKw: 58.7,
      insulationRatingKv: 5.0,
      coolantChannel: 'Loop Alpha',
      subsystemBus: 'Primary Bus-A',
    },
  },
  {
    id: 'ION-02',
    name: 'Chamber B',
    category: 'PROPULSION',
    voltage: 480,
    nominalCurrent: 145,
    currentDraw: 148.8,
    maxCurrent: 210,
    temperature: 82.5,
    tempNominal: 78.0,
    tempThreshold: 105.0,
    tempMax: 135.0,
    cableId: 'CB-02',
    cableConnected: true,
    cableResistance: 6.8,
    leakageCurrent: 7.4,
    shortCircuitRisk: 14,
    status: 'NOMINAL',
    isCritical: true,
    gridX: 420,
    gridY: 140,
    description: 'Chamber B: Xenon Hall-effect primary propulsion thruster array requiring sustained high-current feed.',
    specDetails: {
      operatingPowerKw: 71.4,
      insulationRatingKv: 3.2,
      coolantChannel: 'Loop Gamma',
      subsystemBus: 'Propulsion Feeder 1',
    },
  },
  {
    id: 'CRY-03',
    name: 'Chamber C',
    category: 'COOLING',
    voltage: 480,
    nominalCurrent: 45,
    currentDraw: 44.2,
    maxCurrent: 70,
    temperature: -18.4,
    tempNominal: -20.0,
    tempThreshold: 25.0,
    tempMax: 65.0,
    cableId: 'CB-03',
    cableConnected: true,
    cableResistance: 3.1,
    leakageCurrent: 1.8,
    shortCircuitRisk: 5,
    status: 'NOMINAL',
    isCritical: true,
    gridX: 420,
    gridY: 460,
    description: 'Chamber C: Cryogenic coolant distribution pump circulating liquid helium coolant through active loops.',
    specDetails: {
      operatingPowerKw: 21.2,
      insulationRatingKv: 2.5,
      coolantChannel: 'Direct Loop',
      subsystemBus: 'Aux Bus-C',
    },
  },
  {
    id: 'LSS-04',
    name: 'Chamber D',
    category: 'LIFE_SUPPORT',
    voltage: 240,
    nominalCurrent: 32,
    currentDraw: 31.8,
    maxCurrent: 55,
    temperature: 24.1,
    tempNominal: 22.0,
    tempThreshold: 45.0,
    tempMax: 70.0,
    cableId: 'CB-04',
    cableConnected: true,
    cableResistance: 2.4,
    leakageCurrent: 0.9,
    shortCircuitRisk: 3,
    status: 'NOMINAL',
    isCritical: true,
    gridX: 680,
    gridY: 150,
    description: 'Chamber D: ECLSS atmospheric scrubbers, electrolysis oxygen generators, and cabin pressurization.',
    specDetails: {
      operatingPowerKw: 7.6,
      insulationRatingKv: 1.8,
      coolantChannel: 'Environmental',
      subsystemBus: 'Life-Safety Bus',
    },
  },
  {
    id: 'NAV-05',
    name: 'Chamber E',
    category: 'AVIONICS',
    voltage: 28,
    nominalCurrent: 18,
    currentDraw: 17.5,
    maxCurrent: 30,
    temperature: 36.8,
    tempNominal: 35.0,
    tempThreshold: 55.0,
    tempMax: 80.0,
    cableId: 'CB-05',
    cableConnected: true,
    cableResistance: 1.2,
    leakageCurrent: 0.4,
    shortCircuitRisk: 4,
    status: 'NOMINAL',
    isCritical: true,
    gridX: 680,
    gridY: 300,
    description: 'Chamber E: Triple-redundant orbital avionics flight computer, star trackers, and guidance logic.',
    specDetails: {
      operatingPowerKw: 0.5,
      insulationRatingKv: 1.2,
      coolantChannel: 'Passive Radiator',
      subsystemBus: 'Clean Avionics DC',
    },
  },
  {
    id: 'SOL-06',
    name: 'Chamber F',
    category: 'POWER',
    voltage: 480,
    nominalCurrent: 50,
    currentDraw: 48.0,
    maxCurrent: 90,
    temperature: 29.5,
    tempNominal: 28.0,
    tempThreshold: 60.0,
    tempMax: 95.0,
    cableId: 'CB-06',
    cableConnected: true,
    cableResistance: 3.8,
    leakageCurrent: 2.2,
    shortCircuitRisk: 6,
    status: 'NOMINAL',
    isCritical: false,
    gridX: 180,
    gridY: 140,
    description: 'Chamber F: Photovoltaic solar array wings and dual solid-state energy storage bus.',
    specDetails: {
      operatingPowerKw: 23.0,
      insulationRatingKv: 4.0,
      coolantChannel: 'Phase Change Mat',
      subsystemBus: 'Storage Feed',
    },
  },
  {
    id: 'SHD-07',
    name: 'Chamber G',
    category: 'DEFENSE',
    voltage: 480,
    nominalCurrent: 85,
    currentDraw: 84.1,
    maxCurrent: 140,
    temperature: 52.4,
    tempNominal: 50.0,
    tempThreshold: 85.0,
    tempMax: 120.0,
    cableId: 'CB-07',
    cableConnected: true,
    cableResistance: 5.5,
    leakageCurrent: 4.6,
    shortCircuitRisk: 9,
    status: 'NOMINAL',
    isCritical: false,
    gridX: 420,
    gridY: 300,
    description: 'Chamber G: Deflector shield and high-frequency hull field coil protecting against radiation flares.',
    specDetails: {
      operatingPowerKw: 40.3,
      insulationRatingKv: 4.5,
      coolantChannel: 'Loop Beta',
      subsystemBus: 'Pulse Bus-D',
    },
  },
  {
    id: 'COM-08',
    name: 'Chamber H',
    category: 'COMM',
    voltage: 120,
    nominalCurrent: 22,
    currentDraw: 21.6,
    maxCurrent: 40,
    temperature: 41.2,
    tempNominal: 40.0,
    tempThreshold: 65.0,
    tempMax: 90.0,
    cableId: 'CB-08',
    cableConnected: true,
    cableResistance: 2.1,
    leakageCurrent: 1.1,
    shortCircuitRisk: 4,
    status: 'NOMINAL',
    isCritical: false,
    gridX: 680,
    gridY: 460,
    description: 'Chamber H: Deep space high-gain phased-array communications array and sub-space transceiver.',
    specDetails: {
      operatingPowerKw: 2.6,
      insulationRatingKv: 1.5,
      coolantChannel: 'Passive Radiator',
      subsystemBus: 'Comms Auxiliary',
    },
  },
];

export const INITIAL_CABLES: CableConnection[] = [
  {
    id: 'CB-01',
    sourceId: 'PWR-01',
    targetId: 'MAIN_BUS',
    targetComponentId: 'PWR-01',
    connected: true,
    currentFlow: 122.4,
    leakage: 3.1,
    temperature: 58.0,
    resistance: 4.2,
    gauge: '4/0 AWG Superconducting',
    wireType: 'Cryo-clad YBCO Superconductor',
    lengthMeters: 14.5,
  },
  {
    id: 'CB-02',
    sourceId: 'MAIN_BUS',
    targetId: 'ION-02',
    targetComponentId: 'ION-02',
    connected: true,
    currentFlow: 148.8,
    leakage: 7.4,
    temperature: 74.0,
    resistance: 6.8,
    gauge: '2/0 AWG Shielded',
    wireType: 'Multi-strand Silver-plated Copper',
    lengthMeters: 28.2,
  },
  {
    id: 'CB-03',
    sourceId: 'MAIN_BUS',
    targetId: 'CRY-03',
    targetComponentId: 'CRY-03',
    connected: true,
    currentFlow: 44.2,
    leakage: 1.8,
    temperature: 12.0,
    resistance: 3.1,
    gauge: '4 AWG Armored',
    wireType: 'Teflon-jacketed Braided Nickel',
    lengthMeters: 18.0,
  },
  {
    id: 'CB-04',
    sourceId: 'MAIN_BUS',
    targetId: 'LSS-04',
    targetComponentId: 'LSS-04',
    connected: true,
    currentFlow: 31.8,
    leakage: 0.9,
    temperature: 26.0,
    resistance: 2.4,
    gauge: '6 AWG Dual-redundant',
    wireType: 'Polyimide Mil-Spec Aerospace',
    lengthMeters: 36.4,
  },
  {
    id: 'CB-05',
    sourceId: 'MAIN_BUS',
    targetId: 'NAV-05',
    targetComponentId: 'NAV-05',
    connected: true,
    currentFlow: 17.5,
    leakage: 0.4,
    temperature: 32.0,
    resistance: 1.2,
    gauge: '10 AWG Twisted Shielded',
    wireType: 'Gold-plated Terminals EMI Shielded',
    lengthMeters: 42.0,
  },
  {
    id: 'CB-06',
    sourceId: 'SOL-06',
    targetId: 'MAIN_BUS',
    targetComponentId: 'SOL-06',
    connected: true,
    currentFlow: 48.0,
    leakage: 2.2,
    temperature: 30.5,
    resistance: 3.8,
    gauge: '2 AWG Flexible',
    wireType: 'Silicone-jacketed Copper Alloy',
    lengthMeters: 22.5,
  },
  {
    id: 'CB-07',
    sourceId: 'MAIN_BUS',
    targetId: 'SHD-07',
    targetComponentId: 'SHD-07',
    connected: true,
    currentFlow: 84.1,
    leakage: 4.6,
    temperature: 54.0,
    resistance: 5.5,
    gauge: '1/0 AWG Coaxial Pulse',
    wireType: 'Fiber-reinforced Coaxial Conduit',
    lengthMeters: 19.8,
  },
  {
    id: 'CB-08',
    sourceId: 'MAIN_BUS',
    targetId: 'COM-08',
    targetComponentId: 'COM-08',
    connected: true,
    currentFlow: 21.6,
    leakage: 1.1,
    temperature: 38.0,
    resistance: 2.1,
    gauge: '8 AWG Hybrid DC/RF',
    wireType: 'Low-loss Dielectric Umbilical',
    lengthMeters: 31.0,
  },
];

// Helper to evaluate live electrical status, short circuit risk & alerts
export function evaluateComponent(c: SpacecraftComponent): SpacecraftComponent {
  // 1. If cable is disconnected:
  if (!c.cableConnected) {
    return {
      ...c,
      currentDraw: 0.0, // NO CURRENT FLOW
      shortCircuitRisk: 0,
      status: 'OFFLINE',
    };
  }

  // 2. Compute dynamic short circuit risk (0-100%)
  // Risk factors:
  // - High current ratio (currentDraw / maxCurrent)
  // - Elevated temperature above threshold
  // - Chassis ground leakage current (mA)
  const currentStress = Math.max(0, (c.currentDraw / c.maxCurrent - 0.7) * 90);
  const tempStress = c.temperature > c.tempThreshold 
    ? Math.min(60, ((c.temperature - c.tempThreshold) / (c.tempMax - c.tempThreshold || 1)) * 60)
    : 0;
  const leakageStress = Math.min(50, (c.leakageCurrent / 80) * 50);

  const rawRisk = Math.round(Math.min(100, currentStress + tempStress + leakageStress));
  const shortCircuitRisk = Math.max(0, rawRisk);

  // 3. Determine status
  let status: SpacecraftComponent['status'] = 'NOMINAL';
  const isOvercurrent = c.currentDraw > c.maxCurrent;
  const isOverheating = c.temperature >= c.tempMax;
  const isSevereLeakage = c.leakageCurrent >= 75;
  const isHighRisk = shortCircuitRisk >= 70;

  if (isOvercurrent || isOverheating || isSevereLeakage || isHighRisk) {
    status = 'CRITICAL';
  } else if (
    c.temperature > c.tempThreshold ||
    c.currentDraw > c.maxCurrent * 0.85 ||
    c.leakageCurrent > 25 ||
    shortCircuitRisk > 35
  ) {
    status = 'WARNING';
  }

  return {
    ...c,
    shortCircuitRisk,
    status,
  };
}

// Preset injection scenarios for the admin console
export const FAULT_PRESETS: FaultPreset[] = [
  {
    id: 'cryo-disconnect',
    title: 'DISCONNECT CABLE',
    category: 'FAULT',
    summary: 'DISCONNECT CABLE',
    severity: 'CRITICAL',
    apply: (components) =>
      components.map((c) => {
        if (c.id === 'CRY-03') {
          return { ...c, cableConnected: false, currentDraw: 0.0, status: 'OFFLINE' };
        }
        if (c.id === 'PWR-01') {
          return { ...c, temperature: 98.4, status: 'WARNING' };
        }
        return c;
      }),
  },
  {
    id: 'ion-leakage-short',
    title: 'SHORT CIRCUIT',
    category: 'FAULT',
    summary: 'SHORT CIRCUIT',
    severity: 'CRITICAL',
    apply: (components) =>
      components.map((c) => {
        if (c.id === 'ION-02') {
          return {
            ...c,
            leakageCurrent: 115.2,
            currentDraw: 198.5,
            temperature: 118.0,
            shortCircuitRisk: 86,
            status: 'CRITICAL',
          };
        }
        return c;
      }),
  },
  {
    id: 'reactor-overcurrent-surge',
    title: 'CURRENT OVERFLOW',
    category: 'FAULT',
    summary: 'CURRENT OVERFLOW',
    severity: 'CRITICAL',
    apply: (components) =>
      components.map((c) => {
        if (c.id === 'PWR-01') {
          return {
            ...c,
            currentDraw: 235.0,
            temperature: 112.5,
            shortCircuitRisk: 92,
            status: 'CRITICAL',
          };
        }
        return c;
      }),
  },
  {
    id: 'eclss-power-loss',
    title: 'POWER CUT',
    category: 'FAULT',
    summary: 'POWER CUT',
    severity: 'CRITICAL',
    apply: (components) =>
      components.map((c) => {
        if (c.id === 'LSS-04') {
          return {
            ...c,
            cableConnected: false,
            currentDraw: 0.0,
            status: 'OFFLINE',
          };
        }
        return c;
      }),
  },
  {
    id: 'shield-thermal-overload',
    title: 'TEMPEARTURE',
    category: 'FAULT',
    summary: 'TEMPEARTURE',
    severity: 'WARNING',
    apply: (components) =>
      components.map((c) => {
        if (c.id === 'SHD-07') {
          return {
            ...c,
            temperature: 115.0,
            currentDraw: 132.0,
            leakageCurrent: 48.2,
            status: 'CRITICAL',
          };
        }
        return c;
      }),
  },
  {
    id: 'nominal-restore',
    title: 'RESET',
    category: 'NORMAL',
    summary: 'RESET',
    severity: 'NOMINAL',
    apply: () => INITIAL_COMPONENTS.map((c) => ({ ...c })),
  },
];


