"use client";

export type SoundscapeType = "silent" | "rain" | "space" | "whitenoise";

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentType: SoundscapeType = "silent";
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playSoundscape(type: SoundscapeType, volume = 0.3) {
    this.stopCurrent();
    this.currentType = type;
    if (type === "silent") return;

    this.initContext();
    if (!this.ctx) return;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === "space") {
      this.startDeepSpaceDrone(this.ctx, this.gainNode);
    } else if (type === "rain") {
      this.startPinkNoiseRain(this.ctx, this.gainNode);
    } else if (type === "whitenoise") {
      this.startWhiteNoise(this.ctx, this.gainNode);
    }
  }

  private startDeepSpaceDrone(ctx: AudioContext, destination: GainNode) {
    // 2 detuned warm sine waves + lowpass filter
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(98.0, ctx.currentTime); // G2

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(220, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(destination);

    osc1.start();
    osc2.start();

    this.activeNodes.push(osc1, osc2, filter);
  }

  private startPinkNoiseRain(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  private startWhiteNoise(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    noise.connect(filter);
    filter.connect(destination);
    noise.start();

    this.activeNodes.push(noise, filter);
  }

  public playChime() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  public stopCurrent() {
    this.activeNodes.forEach((node) => {
      try {
        if ("stop" in node && typeof node.stop === "function") node.stop();
        if ("disconnect" in node && typeof node.disconnect === "function") node.disconnect();
      } catch {
        // Ignore audio cleanup errors
      }
    });
    this.activeNodes = [];
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // Ignore
      }
      this.gainNode = null;
    }
    this.currentType = "silent";
  }
}

export const soundscapeEngine = new SoundscapeEngine();
