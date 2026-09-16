// Web Audio API generator for aerospace mission control alarms and telemetry sounds
class AerospaceSoundEngine {
  private ctx: AudioContext | null = null;
  private isAlarmRunning: boolean = false;
  private alarmInterval: any = null;
  public soundEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Dual-frequency caution beep (aerospace warning tone)
  public playAlertBeep() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // First tone: 880 Hz (A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(720, now + 0.12);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.16);

      // Second tone: 980 Hz
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(980, now + 0.16);
      osc2.frequency.exponentialRampToValueAtTime(820, now + 0.28);
      gain2.gain.setValueAtTime(0.08, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.33);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Start recurring alarm until stopped
  public startAlarmLoop() {
    if (this.isAlarmRunning) return;
    this.isAlarmRunning = true;
    this.playAlertBeep();
    this.alarmInterval = setInterval(() => {
      if (this.isAlarmRunning && this.soundEnabled) {
        this.playAlertBeep();
      }
    }, 1600);
  }

  // Stop recurring alarm
  public stopAlarmLoop() {
    this.isAlarmRunning = false;
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  // Positive remediation success sound (ascending harmonic chirp)
  public playRemedySuccessSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.16);
      });
    } catch (e) {}
  }
}

export const soundEngine = new AerospaceSoundEngine();
