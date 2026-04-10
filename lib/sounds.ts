"use client";

class SoundManager {
  private ctx: AudioContext | null = null;
  private initialized = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  async init() {
    if (this.initialized) return;
    const ctx = this.getCtx();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    this.initialized = true;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  playCheckin() {
    this.init();
    this.playTone(523, 0.15, "sine", 0.4);
    setTimeout(() => this.playTone(659, 0.15, "sine", 0.4), 100);
    setTimeout(() => this.playTone(784, 0.3, "sine", 0.5), 200);
  }

  playBlindboxOpen() {
    this.init();
    const ctx = this.getCtx();
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1)) * 0.3;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    source.connect(filter);
    filter.connect(ctx.destination);
    source.start();

    setTimeout(() => {
      this.playTone(392, 0.2, "triangle", 0.3);
      setTimeout(() => this.playTone(523, 0.2, "triangle", 0.35), 120);
      setTimeout(() => this.playTone(784, 0.4, "triangle", 0.4), 240);
    }, 300);
  }

  playMatchSuccess() {
    this.init();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, "sine", 0.3), i * 120);
    });
    setTimeout(() => {
      this.playTone(1047, 0.6, "sine", 0.5);
      this.playTone(1319, 0.6, "sine", 0.3);
    }, 500);
  }

  playCyberAmbient() {
    this.init();
    const ctx = this.getCtx();

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(80, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(120, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    return () => {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      setTimeout(() => {
        osc1.stop();
        osc2.stop();
      }, 1000);
    };
  }

  playScreenTransition() {
    this.init();
    this.playTone(200, 0.5, "sawtooth", 0.1);
    setTimeout(() => this.playTone(400, 0.3, "sine", 0.2), 200);
    setTimeout(() => this.playTone(600, 0.2, "sine", 0.15), 400);
  }

  playCountdownTick() {
    this.init();
    this.playTone(440, 0.15, "square", 0.25);
    this.playTone(880, 0.08, "sine", 0.15);
  }

  playCountdownFinal() {
    this.init();
    const ctx = this.getCtx();

    this.playTone(880, 0.1, "square", 0.35);
    this.playTone(1760, 0.08, "sine", 0.2);

    setTimeout(() => {
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        data[i] =
          Math.sin(2 * Math.PI * 150 * t) * 0.3 * Math.exp(-t * 2) +
          Math.sin(2 * Math.PI * 300 * t) * 0.15 * Math.exp(-t * 3) +
          (Math.random() * 2 - 1) * 0.1 * Math.exp(-t * 5);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    }, 100);

    setTimeout(() => {
      [523, 784, 1047, 1319].forEach((freq, j) => {
        setTimeout(() => this.playTone(freq, 0.25, "sine", 0.25), j * 80);
      });
    }, 400);
  }

  playDrumRoll() {
    this.init();
    const ctx = this.getCtx();
    for (let i = 0; i < 16; i++) {
      const time = ctx.currentTime + i * 0.06;
      const vol = 0.08 + (i / 16) * 0.2;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(200 + Math.random() * 100, time);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  }
}

export const soundManager = new SoundManager();
