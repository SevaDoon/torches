/* Tiny WebAudio blips. No audio files, no dependency, mutable from the profile. */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function tone(freq: number, start: number, duration: number, gain = 0.06, type: OscillatorType = 'sine') {
  if (!enabled) return;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(0, ctx.currentTime + start);
    vol.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
    vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
    osc.connect(vol).connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.02);
  } catch {
    /* audio unavailable — silence is fine */
  }
}

export const sfx = {
  correct: () => {
    tone(660, 0, 0.12);
    tone(880, 0.08, 0.16);
  },
  wrong: () => tone(180, 0, 0.22, 0.05, 'triangle'),
  hint: () => tone(520, 0, 0.09, 0.04, 'triangle'),
  combo: (n: number) => {
    tone(660 + n * 50, 0, 0.1);
    tone(990 + n * 50, 0.07, 0.14);
  },
  levelUp: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.2));
  },
  achievement: () => {
    [784, 988, 1319].forEach((f, i) => tone(f, i * 0.11, 0.26, 0.05));
  },
  complete: () => {
    [523, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.3, 0.05));
  },
  tap: () => tone(420, 0, 0.05, 0.03, 'square'),
};
