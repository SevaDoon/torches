/*
 * Self-check. Runs in dev only (see main.tsx) and prints to the console.
 * It exists so a typo in a unit file — a missing hint, a bad answer index, a
 * passage id that points nowhere — is caught the moment the app loads, instead
 * of surfacing as a broken question in front of a student.
 */
import { getPassage, units } from './curriculum';
import { untranslatedIds } from './i18n';
import { levelFromXp, scoreAnswer, xpForLevel, nextDifficulty } from '../services/progressService';

export function validateCurriculum(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const unit of units) {
    if (unit.questions.length < 20) {
      problems.push(`${unit.id}: only ${unit.questions.length} questions`);
    }
    for (const skill of ['grammar', 'vocabulary', 'reading', 'form'] as const) {
      if (!unit.questions.some((q) => q.skill === skill)) {
        problems.push(`${unit.id}: no ${skill} questions`);
      }
    }

    for (const q of unit.questions) {
      const at = `${q.id}`;
      if (seen.has(q.id)) problems.push(`${at}: duplicate id`);
      seen.add(q.id);
      if (!q.explanation?.trim()) problems.push(`${at}: missing explanation`);
      if (q.hints.length !== 3 || q.hints.some((h) => !h?.trim())) {
        problems.push(`${at}: needs three real hints`);
      }
      if (q.passageId && !getPassage(q.passageId)) problems.push(`${at}: unknown passage`);

      switch (q.type) {
        case 'mcq':
        case 'truefalse':
          if (q.options.length < 2) problems.push(`${at}: needs at least two options`);
          if (q.answer < 0 || q.answer >= q.options.length) problems.push(`${at}: answer out of range`);
          if (new Set(q.options).size !== q.options.length) problems.push(`${at}: duplicate options`);
          break;
        case 'order':
          if (q.chunks.length < 3) problems.push(`${at}: too few chunks to shuffle`);
          break;
        case 'match':
        case 'memory':
          if (q.pairs.length < 3) problems.push(`${at}: too few pairs`);
          if (new Set(q.pairs.map((p) => p[1])).size !== q.pairs.length) {
            problems.push(`${at}: two pairs share an answer — unmatchable`);
          }
          break;
        case 'blank':
          if (!q.prompt.includes('___')) problems.push(`${at}: prompt has no ___ gap`);
          if (!q.accept.length) problems.push(`${at}: no accepted answers`);
          break;
        case 'error':
          if (q.answer < 0 || q.answer >= q.tokens.length) problems.push(`${at}: bad token index`);
          if (!q.correction?.trim()) problems.push(`${at}: no correction given`);
          break;
      }
    }
  }
  return problems;
}

/** A handful of asserts over the maths that decides XP, levels and difficulty. */
export function checkScoring(): string[] {
  const problems: string[] = [];
  const is = (label: string, actual: unknown, expected: unknown) => {
    if (actual !== expected) problems.push(`${label}: got ${actual}, expected ${expected}`);
  };

  is('xpForLevel(1)', xpForLevel(1), 0);
  is('xpForLevel(2)', xpForLevel(2), 200);
  is('xpForLevel(3)', xpForLevel(3), 500);
  is('xpForLevel(4)', xpForLevel(4), 900);
  is('levelFromXp(0)', levelFromXp(0), 1);
  is('levelFromXp(199)', levelFromXp(199), 1);
  is('levelFromXp(200)', levelFromXp(200), 2);
  is('levelFromXp(899)', levelFromXp(899), 3);

  const base = { correct: true as const, difficulty: 1 as const, seconds: 60, streak: 0, hintsUsed: 0, multiplier: 1 };
  is('plain correct answer', scoreAnswer(base).xp, 100);
  is('wrong answer earns nothing', scoreAnswer({ ...base, correct: false }).xp, 0);
  is('hard question', scoreAnswer({ ...base, difficulty: 3 }).xp, 150);
  is('fast answer', scoreAnswer({ ...base, seconds: 5 }).xp, 120);
  is('boss multiplier', scoreAnswer({ ...base, multiplier: 2.5 }).xp, 250);
  // Hints reduce the reward but never below 40.
  is('hint floor', scoreAnswer({ ...base, hintsUsed: 9 }).xp, 40);

  is('three right moves up', nextDifficulty(1, [true, true, true]), 2);
  is('two wrong moves down', nextDifficulty(3, [false, false]), 2);
  is('mixed results hold', nextDifficulty(2, [true, false, true]), 2);
  is('difficulty is capped', nextDifficulty(3, [true, true, true]), 3);

  return problems;
}

export function runSelfCheck() {
  const missing = untranslatedIds();
  const problems = [
    ...validateCurriculum(),
    ...checkScoring(),
    ...missing.map((id) => `${id}: no Arabic hints/explanation`),
  ];
  if (problems.length) {
    console.error(`🔥 Torches self-check found ${problems.length} problem(s):`);
    for (const p of problems) console.error('  ·', p);
  } else {
    const total = units.reduce((n, u) => n + u.questions.length, 0);
    console.info(`🔥 Torches self-check passed — ${units.length} units, ${total} questions.`);
  }
  return problems;
}
