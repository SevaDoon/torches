/*
 * Pure progress maths: levels, scoring, mastery, and when a concept comes back.
 * No storage, no React — which is why the self-check can exercise all of it.
 */
import type {
  Chapter,
  Concept,
  ConceptState,
  CourseProgress,
  Difficulty,
  Learner,
  MasteryState,
  Mode,
  ScoreBreakdown,
} from '../types';

/* ---------- levels ---------- */

/** Cumulative XP to reach a level: 0, 250, 600, 1050, 1600 … */
export function xpForLevel(level: number): number {
  const n = Math.max(1, level) - 1;
  return 250 * n + 50 * n * (n - 1);
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
    into: xp - floor,
    needed: ceil - floor,
    percent: Math.min(100, Math.round(((xp - floor) / (ceil - floor)) * 100)),
  };
}

/* ---------- scoring ---------- */

/** Harder modes are worth more, but never so much that one exam outranks a week. */
export function multiplierOf(mode: Mode): number {
  return { quick: 1, chapter: 1.2, daily: 1.3, weakness: 1.5, survival: 1.8, exam: 2 }[mode];
}

export interface ScoreInput {
  correct: boolean;
  difficulty: Difficulty;
  seconds: number;
  /** Correct answers in a row before this one. */
  combo: number;
  hintsUsed: number;
  multiplier: number;
  /** 0 on the first try, 1 after a mistake on this question. */
  attempt: number;
}

export function scoreAnswer(input: ScoreInput): { xp: number; breakdown: ScoreBreakdown[] } {
  const breakdown: ScoreBreakdown[] = [];
  if (!input.correct) return { xp: 0, breakdown };

  /*
   * Right, but only after getting it wrong: worth something, never worth
   * guessing for. Every bonus below is first-try only, so tapping through a
   * round scores a fraction of thinking through one — which is the only reason
   * the XP number means anything.
   */
  if (input.attempt > 0) {
    breakdown.push({ label: 'second-try', xp: 40 });
    const xp = Math.round(40 * input.multiplier);
    if (input.multiplier !== 1) breakdown.push({ label: 'mode', xp: xp - 40 });
    return { xp, breakdown };
  }

  breakdown.push({ label: 'correct', xp: 100 });
  if (input.difficulty > 1) {
    breakdown.push({ label: input.difficulty === 3 ? 'hard' : 'medium', xp: input.difficulty === 3 ? 50 : 25 });
  }
  // Speed is a small bonus and never a penalty: understanding beats speed.
  if (input.seconds <= 12) breakdown.push({ label: 'quick', xp: 20 });
  const streak = input.combo + 1;
  if (streak >= 3) breakdown.push({ label: `combo-${streak}`, xp: Math.min(60, 10 * streak) });

  const gross = breakdown.reduce((s, b) => s + b.xp, 0);
  const penalty = Math.min(gross - 40, input.hintsUsed * 10);
  if (penalty > 0) breakdown.push({ label: 'hints', xp: -penalty });

  const subtotal = breakdown.reduce((s, b) => s + b.xp, 0);
  const xp = Math.round(subtotal * input.multiplier);
  if (input.multiplier !== 1) breakdown.push({ label: 'mode', xp: xp - subtotal });
  return { xp, breakdown };
}

/** Three right in a row moves up; two wrong moves down. A gentle ladder. */
export function nextDifficulty(current: Difficulty, recent: boolean[]): Difficulty {
  const last3 = recent.slice(-3);
  const last2 = recent.slice(-2);
  if (last3.length === 3 && last3.every(Boolean)) return Math.min(3, current + 1) as Difficulty;
  if (last2.length === 2 && last2.every((r) => !r)) return Math.max(1, current - 1) as Difficulty;
  return current;
}

/* ---------- mastery & spaced repetition ---------- */

export const DAY = 86_400_000;

/** Leitner intervals in days. Box 0 comes back the same session. */
export const BOXES = [0, 1, 2, 4, 8, 16];

export const blankConceptState = (): ConceptState => ({
  mastery: 0,
  attempts: 0,
  correct: 0,
  incorrect: 0,
  box: 0,
  lastReview: 0,
  nextReview: 0,
  runningCorrect: 0,
  probes: [],
});

/**
 * Mastery rises slowly and falls hard.
 *
 * That asymmetry is the whole point: a concept answered right once is not
 * learned, and a concept answered wrong after three rights is not learned
 * either. Getting there takes several clean answers across several sessions,
 * which is also exactly what the review schedule spaces out.
 */
export function applyAttempt(
  prev: ConceptState,
  correct: boolean,
  clean: boolean,
  probe: ConceptState['probes'][number],
  now = Date.now(),
): ConceptState {
  const next: ConceptState = { ...prev, probes: [...prev.probes] };
  next.attempts += 1;
  next.lastReview = now;

  if (correct) {
    next.correct += 1;
    next.runningCorrect += 1;
    next.mastery = prev.mastery + (1 - prev.mastery) * (clean ? 0.4 : 0.2);
    next.box = Math.min(BOXES.length - 1, prev.box + 1);
    if (clean && !next.probes.includes(probe)) next.probes.push(probe);
  } else {
    next.incorrect += 1;
    next.runningCorrect = 0;
    next.mastery = prev.mastery * 0.55;
    // All the way back, not one step: a miss means the last interval was too
    // long, and the concept has to be seen again before the day is out.
    next.box = 0;
    next.probes = [];
  }

  // Box 0 is "again in this session"; every other box is a number of days.
  next.nextReview = next.box === 0 ? now + 10 * 60_000 : now + BOXES[next.box] * DAY;
  return next;
}

export function stateOf(s: ConceptState | undefined): MasteryState {
  if (!s || s.attempts === 0) return 'new';
  if (s.mastery >= 0.8 && s.correct >= 2) return 'mastered';
  if (s.mastery < 0.4) return 'weak';
  return 'learning';
}

export function conceptState(progress: CourseProgress | undefined, conceptId: string): ConceptState {
  return progress?.conceptStates[conceptId] ?? blankConceptState();
}

/* ---------- aggregates ---------- */

export function courseMastery(concepts: Concept[], progress?: CourseProgress): number {
  if (concepts.length === 0) return 0;
  const sum = concepts.reduce((s, c) => s + conceptState(progress, c.id).mastery, 0);
  return sum / concepts.length;
}

export function chapterMastery(
  concepts: Concept[],
  chapterId: string,
  progress?: CourseProgress,
): number {
  const mine = concepts.filter((c) => c.chapterId === chapterId);
  return courseMastery(mine, progress);
}

/** Chapters ranked by mastery, weakest first. Only ones she has actually met. */
export function rankChapters(
  chapters: Chapter[],
  concepts: Concept[],
  progress?: CourseProgress,
): Array<{ chapter: Chapter; mastery: number; attempts: number }> {
  return chapters
    .map((chapter) => {
      const mine = concepts.filter((c) => c.chapterId === chapter.id);
      const attempts = mine.reduce((s, c) => s + conceptState(progress, c.id).attempts, 0);
      return { chapter, mastery: chapterMastery(concepts, chapter.id, progress), attempts };
    })
    .sort((a, b) => a.mastery - b.mastery);
}

/** Concepts whose review has come due, most overdue first. */
export function dueConcepts(concepts: Concept[], progress?: CourseProgress, now = Date.now()): Concept[] {
  return concepts
    .filter((c) => {
      const s = progress?.conceptStates[c.id];
      return !!s && s.attempts > 0 && s.nextReview <= now && s.mastery < 0.95;
    })
    .sort((a, b) => conceptState(progress, a.id).nextReview - conceptState(progress, b.id).nextReview);
}

export function weakConcepts(concepts: Concept[], progress?: CourseProgress): Concept[] {
  return concepts
    .filter((c) => stateOf(progress?.conceptStates[c.id]) === 'weak')
    .sort((a, b) => conceptState(progress, a.id).mastery - conceptState(progress, b.id).mastery);
}

/* ---------- days ---------- */

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** The streak value after playing today. */
export function nextStreak(learner: Learner): number {
  const today = todayKey();
  if (learner.lastPlayedDay === today) return learner.streak;
  const yesterday = todayKey(new Date(Date.now() - DAY));
  return learner.lastPlayedDay === yesterday ? learner.streak + 1 : 1;
}

export function answeredToday(progress: Record<string, CourseProgress>): number {
  const today = todayKey();
  return Object.values(progress).reduce((sum, p) => sum + (p.daily?.[today] ?? 0), 0);
}

export function weeklyXp(learner: Learner): number {
  // XP is not stored per day; sessions are, and they carry what they earned.
  const from = Date.now() - 7 * DAY;
  return Object.values(learner.courses).reduce(
    (sum, p) => sum + p.sessions.filter((s) => s.at >= from).reduce((x, s) => x + s.xp, 0),
    0,
  );
}
