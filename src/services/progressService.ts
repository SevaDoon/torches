/* Pure progress maths: levels, XP, accuracy, recommendations. No storage, no React. */
import type { Difficulty, Skill, Student, UnitProgress } from '../types';
import { SKILL_ORDER, questionsFor, units } from '../data/curriculum';

/** Cumulative XP needed to reach a level: 0, 200, 500, 900, 1400, 2000 … */
export function xpForLevel(level: number): number {
  const n = Math.max(1, level) - 1;
  return 200 * n + 50 * n * (n - 1);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return {
    level,
    floor,
    ceil,
    into: xp - floor,
    needed: ceil - floor,
    percent: Math.min(100, Math.round(((xp - floor) / (ceil - floor)) * 100)),
  };
}

/** Torch tiers — the flame gets bigger as the student levels up. */
export const TORCH_TIERS = [
  { from: 1, key: 'spark' },
  { from: 3, key: 'ember' },
  { from: 5, key: 'flame' },
  { from: 8, key: 'torch' },
  { from: 12, key: 'beacon' },
  { from: 16, key: 'lighthouse' },
];

export function torchTier(level: number) {
  return [...TORCH_TIERS].reverse().find((t) => level >= t.from) ?? TORCH_TIERS[0];
}

export function skillAccuracy(student: Student, skill: Skill): number {
  const s = student.skills[skill];
  if (!s || s.attempts === 0) return 0;
  return s.correct / s.attempts;
}

export function overallAccuracy(student: Student): number {
  return student.totalAnswers === 0 ? 0 : student.totalCorrect / student.totalAnswers;
}

export const emptyUnitProgress = (): UnitProgress => ({ missions: {}, bossCleared: false });

export function unitProgress(student: Student, unitId: string): UnitProgress {
  return student.units[unitId] ?? emptyUnitProgress();
}

/** A mission counts as finished at 80% accuracy — perfection is not the bar. */
export const MISSION_PASS = 0.8;

export const missionCompletion = (bestAccuracy: number) =>
  Math.min(1, bestAccuracy / MISSION_PASS);

/** 0..1 — how much of a unit has been completed, boss included. */
export function unitCompletion(student: Student, unitId: string): number {
  const p = unitProgress(student, unitId);
  const parts = SKILL_ORDER.length + 1; // four skill missions + the boss
  const skills = SKILL_ORDER.reduce((sum, s) => sum + missionCompletion(p.missions[s] ?? 0), 0);
  return (skills + (p.bossCleared ? 1 : 0)) / parts;
}

/** A unit unlocks when the previous one is at least 60% done. */
export function unitUnlocked(student: Student, unitIndex: number): boolean {
  if (unitIndex === 0) return true;
  return unitCompletion(student, units[unitIndex - 1].id) >= 0.6;
}

export function currentUnitId(student: Student): string {
  for (let i = 0; i < units.length; i++) {
    if (!unitUnlocked(student, i)) return units[i - 1]?.id ?? units[0].id;
    if (unitCompletion(student, units[i].id) < 1) return units[i].id;
  }
  return units[units.length - 1].id;
}

/** The weakest skill that the student has actually practised, else grammar. */
export function weakestSkill(student: Student): Skill {
  const tried = SKILL_ORDER.filter((s) => student.skills[s].attempts >= 4);
  if (tried.length === 0) return 'grammar';
  return tried.reduce((worst, s) =>
    skillAccuracy(student, s) < skillAccuracy(student, worst) ? s : worst,
  );
}

/* ---------- scoring ---------- */

export interface ScoreInput {
  correct: boolean;
  difficulty: Difficulty;
  /** Seconds the student took. */
  seconds: number;
  /** Correct answers in a row, before this one. */
  streak: number;
  hintsUsed: number;
  /** Boss and mixed challenges are worth more. */
  multiplier: number;
}

export function scoreAnswer(input: ScoreInput) {
  const breakdown: Array<{ label: string; xp: number }> = [];
  if (!input.correct) return { xp: 0, breakdown };

  breakdown.push({ label: 'Correct', xp: 100 });
  if (input.difficulty > 1) {
    breakdown.push({ label: input.difficulty === 3 ? 'Hard question' : 'Medium question', xp: input.difficulty === 3 ? 50 : 25 });
  }
  // Speed is a small bonus, never a penalty — understanding matters more than speed.
  if (input.seconds <= 12) breakdown.push({ label: 'Quick thinking', xp: 20 });
  const streak = input.streak + 1;
  if (streak >= 3) breakdown.push({ label: `Combo x${streak}`, xp: Math.min(60, 10 * streak) });

  const gross = breakdown.reduce((s, b) => s + b.xp, 0);
  const penalty = Math.min(gross - 40, input.hintsUsed * 10);
  if (penalty > 0) breakdown.push({ label: `Hints used (${input.hintsUsed})`, xp: -penalty });

  const subtotal = breakdown.reduce((s, b) => s + b.xp, 0);
  const xp = Math.round(subtotal * input.multiplier);
  if (input.multiplier !== 1) {
    breakdown.push({ label: `Challenge bonus x${input.multiplier}`, xp: xp - subtotal });
  }
  return { xp, breakdown };
}

/* ---------- adaptive difficulty ---------- */

/**
 * Three right in a row moves the student up a level of difficulty; two wrong
 * moves them down. Keeps the ladder gentle on purpose.
 */
export function nextDifficulty(current: Difficulty, recent: boolean[]): Difficulty {
  const last3 = recent.slice(-3);
  const last2 = recent.slice(-2);
  if (last3.length === 3 && last3.every(Boolean)) return Math.min(3, current + 1) as Difficulty;
  if (last2.length === 2 && last2.every((r) => !r)) return Math.max(1, current - 1) as Difficulty;
  return current;
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Returns the new streak value given the last day played. */
export function nextStreak(student: Student): number {
  const today = todayKey();
  if (student.lastPlayedDay === today) return student.streak;
  const yesterday = todayKey(new Date(Date.now() - 864e5));
  return student.lastPlayedDay === yesterday ? student.streak + 1 : 1;
}

export function totalQuestionCount(): number {
  return units.reduce((sum, u) => sum + u.questions.length, 0);
}

export function questionCount(unitId: string, skill?: Skill): number {
  return questionsFor(unitId, skill).length;
}
