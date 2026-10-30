/**
 * The demolition run's sound, synthesised in the browser with the Web Audio
 * API: no audio files, nothing to download, nothing licensed from anyone. Each
 * tool gets its own voice built from oscillators and filtered noise. One-shot
 * tools (hammer, gun, paint, stamp) fire a short sound per action; the
 * held tools (chain-saw, flame-thrower, phaser, washing) run a loop for as long
 * as the pointer is down.
 *
 * The context is created on the first press, because browsers only allow audio
 * after a gesture. Everything passes through one compressor so a burst of
 * gunfire never clips.
 */

export type SfxId =
  | "hammer"
  | "shot"
  | "splat"
  | "stamp"
  | "drop"
  | "crunch"
  | "squash"
  | "zap"
  | "select"
  | "levelup"
  | "streak"
  | "finish";

export type LoopId = "chainsaw" | "flamethrower" | "phaser" | "washing";

type Loop = { out: GainNode; stop: () => void; drive?: (amount: number) => void };

const VOLUME = 0.5;

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private loops = new Map<LoopId, Loop>();
  private lastCrunch = 0;
  muted: boolean;

  constructor(muted: boolean) {
    this.muted = muted;
  }

  /** Builds the context on the first gesture; returns null where audio is unavailable. */
  private ensure(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return this.ctx;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.12;
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : VOLUME;
    master.connect(compressor).connect(ctx.destination);
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.ctx = ctx;
    this.master = master;
    this.noise = noise;
    return ctx;
  }

  /** Called from the first press so the context exists before anything plays. */
  unlock() {
    this.ensure();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : VOLUME, this.ctx.currentTime, 0.02);
    }
  }

  dispose() {
    for (const id of Array.from(this.loops.keys())) this.stopLoop(id);
    void this.ctx?.close();
    this.ctx = null;
  }

  /* ------------------------------------------------------------ building blocks */

  private noiseSource(ctx: AudioContext, loop = false) {
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = loop;
    return source;
  }

  /** A gain that rises in `attack` seconds to `peak` and falls away over `decay`. */
  private envelope(ctx: AudioContext, at: number, peak: number, attack: number, decay: number) {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(peak, at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
    return gain;
  }

  /** A burst of filtered noise. */
  private burst(type: BiquadFilterType, freq: number, q: number, peak: number, decay: number, delay = 0, rate = 1) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const at = ctx.currentTime + delay;
    const source = this.noiseSource(ctx);
    source.playbackRate.value = rate;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = this.envelope(ctx, at, peak, 0.002, decay);
    source.connect(filter).connect(gain).connect(this.master);
    // A random offset into the noise, so two bursts in a row never sound alike.
    source.start(at, Math.random() * 0.8, attackPlus(decay));
  }

  /** A pitched blip that slides from `from` to `to` hertz. */
  private tone(type: OscillatorType, from: number, to: number, peak: number, decay: number, delay = 0, attack = 0.003) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const at = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), at + attack + decay);
    const gain = this.envelope(ctx, at, peak, attack, decay);
    osc.connect(gain).connect(this.master);
    osc.start(at);
    osc.stop(at + attackPlus(decay) + attack);
  }

  /* ------------------------------------------------------------ one-shots */

  play(id: SfxId) {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const vary = 0.9 + Math.random() * 0.2;
    switch (id) {
      case "hammer":
        // A body thump, the crack of the glass, and shards settling after it.
        this.tone("sine", 150 * vary, 42, 0.95, 0.22);
        this.burst("bandpass", 2400 * vary, 0.9, 0.55, 0.11);
        this.burst("highpass", 6500, 0.5, 0.18, 0.32, 0.03);
        break;
      case "shot":
        this.burst("bandpass", 1300 * vary, 0.8, 0.7, 0.06, 0, vary);
        this.tone("square", 190 * vary, 55, 0.22, 0.05);
        this.burst("highpass", 5000, 0.4, 0.08, 0.05, 0.05);
        break;
      case "splat":
        this.burst("lowpass", 900 * vary, 0.9, 0.55, 0.14);
        this.tone("sine", 320 * vary, 70, 0.35, 0.12);
        break;
      case "stamp":
        this.burst("highpass", 3200, 0.7, 0.3, 0.02);
        this.tone("sine", 95, 38, 0.9, 0.22, 0.01);
        this.burst("lowpass", 420, 0.8, 0.5, 0.12, 0.01);
        break;
      case "drop":
        for (let i = 0; i < 4; i++) this.burst("highpass", 2800 + i * 400, 1.2, 0.14, 0.025, i * 0.035);
        break;
      case "crunch": {
        const now = performance.now();
        if (now - this.lastCrunch < 110) return;
        this.lastCrunch = now;
        this.burst("highpass", 3000 * vary, 1, 0.09, 0.03);
        break;
      }
      case "squash":
        this.tone("sine", 620 * vary, 110, 0.4, 0.15);
        this.burst("lowpass", 1600, 1.2, 0.35, 0.1);
        break;
      case "zap":
        this.tone("sawtooth", 1900, 300, 0.18, 0.18);
        break;
      case "select":
        this.tone("sine", 1250, 1100, 0.08, 0.035);
        break;
      case "levelup":
        // A rising arpeggio, the last note held.
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          this.tone("triangle", f, f, i === 3 ? 0.3 : 0.24, i === 3 ? 0.45 : 0.09, i * 0.075, 0.005),
        );
        break;
      case "streak":
        this.tone("square", 440, 880, 0.14, 0.12);
        this.tone("square", 660, 1320, 0.12, 0.16, 0.08);
        this.burst("bandpass", 3000, 0.6, 0.12, 0.2, 0.02);
        break;
      case "finish":
        // The building comes down: a long low boom, then a chord.
        this.tone("sine", 70, 28, 1, 1.1);
        this.burst("lowpass", 320, 0.7, 0.9, 1.2);
        [261.63, 329.63, 392, 523.25].forEach((f) => this.tone("triangle", f, f, 0.12, 0.9, 0.35, 0.02));
        break;
    }
  }

  /* ------------------------------------------------------------ held tools */

  startLoop(id: LoopId) {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.loops.has(id)) return;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    out.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.06);
    out.connect(this.master);
    const nodes: AudioScheduledSourceNode[] = [];
    let drive: Loop["drive"];

    if (id === "chainsaw") {
      // A two-stroke engine: a sawtooth chopped by a fast square LFO, with a
      // rasp of noise. Cutting revs it: pitch and brightness rise.
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 82;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1300;
      const chop = ctx.createGain();
      chop.gain.value = 0.5;
      const lfo = ctx.createOscillator();
      lfo.type = "square";
      lfo.frequency.value = 26;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.22;
      lfo.connect(lfoDepth).connect(chop.gain);
      const body = ctx.createGain();
      body.gain.value = 0.32;
      osc.connect(filter).connect(chop).connect(body).connect(out);
      const rasp = this.noiseSource(ctx, true);
      const raspFilter = ctx.createBiquadFilter();
      raspFilter.type = "bandpass";
      raspFilter.frequency.value = 800;
      const raspGain = ctx.createGain();
      raspGain.gain.value = 0.12;
      rasp.connect(raspFilter).connect(raspGain).connect(out);
      nodes.push(osc, lfo, rasp);
      drive = (amount) => {
        const t = ctx.currentTime;
        osc.frequency.setTargetAtTime(82 + amount * 48, t, 0.05);
        filter.frequency.setTargetAtTime(1300 + amount * 1600, t, 0.05);
        raspGain.gain.setTargetAtTime(0.12 + amount * 0.2, t, 0.05);
      };
    } else if (id === "flamethrower") {
      // A roar of low noise whose filter breathes, over a thin hiss.
      const roar = this.noiseSource(ctx, true);
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.value = 480;
      const roarGain = ctx.createGain();
      roarGain.gain.value = 0.75;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.5;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 160;
      lfo.connect(lfoDepth).connect(low.frequency);
      roar.connect(low).connect(roarGain).connect(out);
      const hiss = this.noiseSource(ctx, true);
      const high = ctx.createBiquadFilter();
      high.type = "bandpass";
      high.frequency.value = 2200;
      const hissGain = ctx.createGain();
      hissGain.gain.value = 0.07;
      hiss.connect(high).connect(hissGain).connect(out);
      nodes.push(roar, hiss, lfo);
    } else if (id === "phaser") {
      // Two detuned tones with a fast vibrato: the sustained beam.
      const a = ctx.createOscillator();
      a.type = "sine";
      a.frequency.value = 640;
      const b = ctx.createOscillator();
      b.type = "sawtooth";
      b.frequency.value = 1286;
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 1400;
      band.Q.value = 2;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 9;
      const depth = ctx.createGain();
      depth.gain.value = 45;
      lfo.connect(depth);
      depth.connect(a.frequency);
      depth.connect(b.frequency);
      const gain = ctx.createGain();
      gain.gain.value = 0.16;
      a.connect(gain);
      b.connect(band).connect(gain);
      gain.connect(out);
      nodes.push(a, b, lfo);
    } else {
      // Washing: a spray of bright noise that wobbles like a nozzle.
      const spray = this.noiseSource(ctx, true);
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 3200;
      band.Q.value = 0.6;
      const gain = ctx.createGain();
      gain.gain.value = 0.32;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 4;
      const depth = ctx.createGain();
      depth.gain.value = 0.1;
      lfo.connect(depth).connect(gain.gain);
      spray.connect(band).connect(gain).connect(out);
      nodes.push(spray, lfo);
    }

    for (const node of nodes) node.start();
    this.loops.set(id, {
      out,
      drive,
      stop: () => {
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.linearRampToValueAtTime(0.0001, t + 0.08);
        for (const node of nodes) node.stop(t + 0.1);
      },
    });
  }

  /** How hard a held tool is working, 0 to 1 (the chain-saw revs as it cuts). */
  driveLoop(id: LoopId, amount: number) {
    this.loops.get(id)?.drive?.(Math.max(0, Math.min(1, amount)));
  }

  stopLoop(id: LoopId) {
    const loop = this.loops.get(id);
    if (!loop) return;
    loop.stop();
    this.loops.delete(id);
  }

  stopLoops() {
    for (const id of Array.from(this.loops.keys())) this.stopLoop(id);
  }
}

/** A sound's full length: its decay plus a little tail for the exponential ramp. */
function attackPlus(decay: number) {
  return decay + 0.05;
}
