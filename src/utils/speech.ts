/*
 * Pronunciation, spoken by the device itself. Every browser we target ships the
 * Web Speech API, so this needs no audio files, no network and no dependency.
 *
 * The one thing worth guarding: a phone with no English voice installed would
 * read English in an Arabic voice, which teaches the wrong sound. When that
 * happens the app says nothing and the speaker buttons never appear.
 */
import { useSyncExternalStore } from 'react';

const synth: SpeechSynthesis | undefined =
  typeof window !== 'undefined' ? window.speechSynthesis : undefined;

let voice: SpeechSynthesisVoice | null = null;
const listeners = new Set<() => void>();

const lang = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase();

function pickVoice() {
  const english = synth?.getVoices().filter((v) => lang(v).startsWith('en')) ?? [];
  // MegaGoal is taught in these two accents; any other English is still fine.
  voice = english.find((v) => lang(v) === 'en-gb' || lang(v) === 'en-us') ?? english[0] ?? null;
  for (const notify of listeners) notify();
}

if (synth) {
  pickVoice();
  // Chrome and Safari fill the voice list after the first paint.
  synth.addEventListener('voiceschanged', pickVoice);
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** True once this device has an English voice. Re-renders when one arrives. */
export function useCanSpeak(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => voice !== null,
    () => false,
  );
}

/** Says one line. A single word is said slower — that is the pronunciation lesson. */
export function speak(text: string, slow = false) {
  if (!synth || !voice || !text.trim()) return;
  // A fill-in-the-blank sentence is written "___"; read it as the word "blank"
  // rather than letting the voice spell out the underscores.
  const utterance = new SpeechSynthesisUtterance(text.replace(/_{2,}/g, ' blank '));
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = slow ? 0.7 : 0.9; // a learner's pace, not a commuter's
  synth.cancel(); // the newest tap wins — queued sentences would talk over each other
  // Chrome drops an utterance spoken in the same tick as cancel().
  setTimeout(() => synth.speak(utterance), 0);
}
