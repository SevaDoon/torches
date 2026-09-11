/*
 * Self-check. Runs in dev only (see main.tsx) and prints to the console.
 * It exists so a typo in a unit file — a missing hint, a bad answer index, a
 * passage id that points nowhere — is caught the moment the app loads, instead
 * of surfacing as a broken question in front of a student.
 */
import { getPassage, units } from './curriculum';
import { PICTURES } from './pictures';
import { untranslatedIds } from './i18n';
import { levelFromXp, scoreAnswer, xpForLevel, nextDifficulty } from '../services/progressService';
import { buildRows } from '../services/leaderboardService';
import { answerTextOf, speakableOf } from '../games';
import { buildPlan, missionsFor, nextMissionFor, pickQuestion } from '../engine/missions';
import { currentUnitId } from '../services/progressService';
import { blankStudent, guestStudent } from '../services/studentService';
import type { RosterEntry } from '../services/storage';

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
      // Every question must be one the student can ask to hear.
      if (!speakableOf(q).trim()) problems.push(`${at}: nothing for the reader to say`);
      // Wrong twice has to end with the answer, for every question that has one.
      if (q.type !== 'match' && q.type !== 'memory' && q.type !== 'picmatch' && !answerTextOf(q).trim()) {
        problems.push(`${at}: no answer to show after a second mistake`);
      }

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
        case 'picture':
          if (!PICTURES[q.pictureId]) problems.push(`${at}: no photo "${q.pictureId}"`);
          if (q.answer < 0 || q.answer >= q.options.length) problems.push(`${at}: answer out of range`);
          if (new Set(q.options).size !== q.options.length) problems.push(`${at}: duplicate options`);
          break;
        case 'picmatch':
          if (q.pairs.length < 3) problems.push(`${at}: too few pairs`);
          for (const [pic] of q.pairs) {
            if (!PICTURES[pic]) problems.push(`${at}: no photo "${pic}"`);
          }
          if (new Set(q.pairs.map((p) => p[1])).size !== q.pairs.length) {
            problems.push(`${at}: two pairs share a word — unmatchable`);
          }
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

  const base = {
    correct: true as const,
    difficulty: 1 as const,
    seconds: 60,
    streak: 0,
    hintsUsed: 0,
    multiplier: 1,
    attempt: 0,
  };
  is('plain correct answer', scoreAnswer(base).xp, 100);
  is('wrong answer earns nothing', scoreAnswer({ ...base, correct: false }).xp, 0);
  is('hard question', scoreAnswer({ ...base, difficulty: 3 }).xp, 150);
  is('fast answer', scoreAnswer({ ...base, seconds: 5 }).xp, 120);
  is('boss multiplier', scoreAnswer({ ...base, multiplier: 2.5 }).xp, 250);
  // Hints reduce the reward but never below 40.
  is('hint floor', scoreAnswer({ ...base, hintsUsed: 9 }).xp, 40);

  // Guessing must never pay: every bonus is first-try only.
  is('second try is worth less', scoreAnswer({ ...base, attempt: 1 }).xp, 40);
  is('no speed bonus on a second try', scoreAnswer({ ...base, attempt: 1, seconds: 2 }).xp, 40);
  is('no combo bonus on a second try', scoreAnswer({ ...base, attempt: 1, streak: 9 }).xp, 40);
  is(
    'no difficulty bonus on a second try',
    scoreAnswer({ ...base, attempt: 1, difficulty: 3 }).xp,
    40,
  );
  is('a boss still doubles it', scoreAnswer({ ...base, attempt: 1, multiplier: 2 }).xp, 80);

  is('three right moves up', nextDifficulty(1, [true, true, true]), 2);
  is('two wrong moves down', nextDifficulty(3, [false, false]), 2);
  is('mixed results hold', nextDifficulty(2, [true, false, true]), 2);
  is('difficulty is capped', nextDifficulty(3, [true, true, true]), 3);

  return problems;
}

/*
 * The board has two rules that are easy to break by accident and impossible to
 * notice in testing: a student must appear exactly once even though she is in
 * the roster AND passed in live, and a visitor must never appear at all.
 */
export function checkBoard(): string[] {
  const problems: string[] = [];
  const is = (label: string, actual: unknown, expected: unknown) => {
    if (actual !== expected) problems.push(`${label}: got ${actual}, expected ${expected}`);
  };

  const roster: RosterEntry[] = [
    { id: 'a', name: 'Aisha', avatar: 'A', xp: 900, weeklyXp: 100 },
    { id: 'b', name: 'Basma', avatar: 'B', xp: 400, weeklyXp: 400 },
  ];

  const me = { ...blankStudent('Basma', 'b'), xp: 1200 };
  const mine = buildRows(roster, me);
  is('every player is listed once', mine.length, 2);
  is('the live record wins over the snapshot', mine[0].xp, 1200);
  is('the top row is the leader', mine[0].id, 'b');
  is('her own row is marked', mine.filter((r) => r.isMe).length, 1);

  const seen = buildRows(roster, guestStudent());
  is('a visitor is not ranked', seen.length, 2);
  is('a visitor is nobody on the board', seen.some((r) => r.isMe), false);
  is('a visitor changes nothing', seen[0].id, 'a');

  return problems;
}

/*
 * Where "Continue" sends her. Her bookmark wins while that unit still has work
 * in it, because a unit unlocks the next at 60% and she is allowed to move on.
 */
export function checkResume(): string[] {
  const problems: string[] = [];
  const is = (label: string, actual: unknown, expected: unknown) => {
    if (actual !== expected) problems.push(`${label}: got ${actual}, expected ${expected}`);
  };

  const first = units[0].id;
  const third = units[2].id;
  const blank = blankStudent('Test', 't');

  is('a new student starts at the first unit', currentUnitId(blank), first);
  is(
    'her bookmark wins over an unfinished earlier unit',
    currentUnitId({ ...blank, lastUnitId: third }),
    third,
  );
  is(
    'a bookmark for a unit that no longer exists is ignored',
    currentUnitId({ ...blank, lastUnitId: 'unit-gone' }),
    first,
  );

  return problems;
}

/*
 * What she is served next. Both of these were real complaints: a challenge she
 * replayed handed back the questions she had already got right, and the home
 * button opened a stage she had already passed.
 */
export function checkPicking(): string[] {
  const problems: string[] = [];
  const is = (label: string, actual: unknown, expected: unknown) => {
    if (actual !== expected) problems.push(`${label}: got ${actual}, expected ${expected}`);
  };

  const unit = units[0];
  const stages = missionsFor(unit.id);
  const skill = stages[0].skills[0];
  const inSkill = unit.questions.filter((q) => q.skill === skill);
  const spare = inSkill[inSkill.length - 1];

  // She has mastered everything in this skill except one question.
  const almostDone = {
    ...blankStudent('Test', 't'),
    mastered: inSkill.filter((q) => q.id !== spare.id).map((q) => q.id),
  };
  const plan = buildPlan(stages[0], almostDone);
  is(
    'the question she has not mastered comes first',
    pickQuestion(plan, new Set(), 0, 1)?.id,
    spare.id,
  );

  // A question she got wrong outranks even a fresh one.
  const withMiss = { ...blankStudent('Test', 't'), mistakes: [spare.id] };
  is(
    'a question she missed comes first of all',
    pickQuestion(buildPlan(stages[0], withMiss), new Set(), 0, 1)?.id,
    spare.id,
  );

  const passedFirst = {
    ...blankStudent('Test', 't'),
    units: { [unit.id]: { missions: { [stages[0].key]: 1 }, bossCleared: false } },
  };
  is(
    'a stage she passed is not what Continue opens',
    nextMissionFor(passedFirst).mission.key,
    stages[1].key,
  );

  return problems;
}

export function runSelfCheck() {
  const missing = untranslatedIds();
  const problems = [
    ...validateCurriculum(),
    ...checkScoring(),
    ...checkBoard(),
    ...checkResume(),
    ...checkPicking(),
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
