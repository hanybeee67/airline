// Tiny synthesized sound engine — no audio files, so it stays offline and
// adds zero bundle weight. Sounds are built from oscillators + envelopes on a
// lazily-created AudioContext (created on first user gesture, satisfying
// browser autoplay rules).

type SoundName = "click" | "whoosh" | "advance" | "cash" | "error";

let ctx: AudioContext | null = null;
let muted = readMuted();
const listeners = new Set<(m: boolean) => void>();

function readMuted(): boolean {
  try {
    return localStorage.getItem("sat-muted") === "1";
  } catch {
    return false;
  }
}

function ensureCtx(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  ac: AudioContext,
  opts: {
    type: OscillatorType;
    from: number;
    to?: number;
    start: number;
    dur: number;
    gain?: number;
  },
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.from, opts.start);
  if (opts.to !== undefined) osc.frequency.exponentialRampToValueAtTime(opts.to, opts.start + opts.dur);
  const peak = opts.gain ?? 0.14;
  g.gain.setValueAtTime(0.0001, opts.start);
  g.gain.exponentialRampToValueAtTime(peak, opts.start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.dur);
  osc.connect(g).connect(ac.destination);
  osc.start(opts.start);
  osc.stop(opts.start + opts.dur + 0.02);
}

export function playSound(name: SoundName) {
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime;
  switch (name) {
    case "click":
      tone(ac, { type: "triangle", from: 340, start: t, dur: 0.06, gain: 0.08 });
      break;
    case "whoosh":
      tone(ac, { type: "sine", from: 220, to: 880, start: t, dur: 0.35, gain: 0.1 });
      tone(ac, { type: "sine", from: 330, to: 1100, start: t + 0.04, dur: 0.3, gain: 0.05 });
      break;
    case "advance":
      tone(ac, { type: "sine", from: 523, start: t, dur: 0.16, gain: 0.12 });
      tone(ac, { type: "sine", from: 784, start: t + 0.12, dur: 0.22, gain: 0.12 });
      break;
    case "cash":
      tone(ac, { type: "triangle", from: 880, start: t, dur: 0.08, gain: 0.1 });
      tone(ac, { type: "triangle", from: 1320, start: t + 0.07, dur: 0.1, gain: 0.1 });
      break;
    case "error":
      tone(ac, { type: "sawtooth", from: 200, to: 120, start: t, dur: 0.28, gain: 0.09 });
      break;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem("sat-muted", next ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(next));
}

export function subscribeMuted(fn: (m: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
