/*
 * Small synthesized blips. No audio files: a two-oscillator beep is a few lines
 * and costs nothing to download, and a study app that plays a sampled fanfare
 * gets muted within a minute anyway.
 */

let enabled = true;
let ctx: AudioContext | null = null;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function tone(freq: number, seconds: number, type: OscillatorType = 'sine', gain = 0.05, delay = 0) {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const at = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    vol.gain.setValueAtTime(0, at);
    vol.gain.linearRampToValueAtTime(gain, at + 0.012);
    vol.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    osc.connect(vol).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + seconds + 0.02);
  } catch {
    /* no audio device, or the browser has not allowed one yet */
  }
}

export const sfx = {
  correct: () => {
    tone(660, 0.1, 'triangle');
    tone(990, 0.14, 'triangle', 0.04, 0.07);
  },
  wrong: () => tone(180, 0.2, 'sawtooth', 0.035),
  combo: (n: number) => {
    tone(520 + Math.min(n, 8) * 60, 0.1, 'triangle');
    tone(780 + Math.min(n, 8) * 60, 0.13, 'triangle', 0.04, 0.06);
  },
  hint: () => tone(420, 0.09, 'sine', 0.03),
  levelUp: () => [0, 0.09, 0.18].forEach((d, i) => tone(523 + i * 130, 0.2, 'triangle', 0.05, d)),
  achievement: () => [0, 0.1].forEach((d, i) => tone(700 + i * 220, 0.22, 'triangle', 0.045, d)),
  complete: () => [0, 0.11, 0.22].forEach((d, i) => tone(440 + i * 110, 0.24, 'sine', 0.045, d)),
  tick: () => tone(880, 0.04, 'square', 0.02),
};
