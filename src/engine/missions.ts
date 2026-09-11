/* Which challenges exist, and which questions each one draws from. */
import type { Difficulty, MissionSpec, Question, Skill, Student } from '../types';
import { SKILL_ORDER, getQuestion, getUnit, questionsFor, units } from '../data/curriculum';
import {
  currentUnitId,
  missionPassed,
  unitProgress,
  unitUnlocked,
} from '../services/progressService';
import { shuffle } from '../utils/random';

export function missionsFor(unitId: string): MissionSpec[] {
  const unit = getUnit(unitId);
  if (!unit) return [];

  const skillMissions: MissionSpec[] = SKILL_ORDER.filter(
    (s) => questionsFor(unitId, s).length > 0,
  ).map((skill) => ({
    key: skill,
    unitId,
    skills: [skill],
    length: Math.min(8, questionsFor(unitId, skill).length),
    kind: 'skill',
  }));

  return [
    ...skillMissions,
    { key: 'mixed', unitId, skills: [...SKILL_ORDER], length: 8, kind: 'mixed' },
    { key: 'boss', unitId, skills: [...SKILL_ORDER], length: 10, kind: 'boss' },
  ];
}

export function missionUnlocked(student: Student, spec: MissionSpec): boolean {
  const p = unitProgress(student, spec.unitId);
  const done = SKILL_ORDER.filter((s) => (p.missions[s] ?? 0) > 0).length;
  if (spec.kind === 'mixed') return done >= 2;
  if (spec.kind === 'boss') return done >= 3;
  return true;
}

export function xpMultiplier(kind: MissionSpec['kind']): number {
  return kind === 'boss' ? 2.5 : kind === 'mixed' ? 2 : 1;
}

export interface MissionPlan {
  /** Every question the mission may draw from. */
  pool: Question[];
  /** Which skill each slot of the mission uses. */
  plan: Skill[];
  /** question id -> 0 she got it wrong, 1 she has not mastered it, 2 she has. */
  rank: Record<string, number>;
}

/**
 * Wrong answers come back first, mastered questions last, so a repeat play of
 * the same mission is not the same eight questions in the same order.
 */
function priority(q: Question, student: Student): number {
  if (student.mistakes.includes(q.id)) return 0;
  if (student.mastered.includes(q.id)) return 2;
  return 1;
}

export function buildPlan(spec: MissionSpec, student: Student): MissionPlan {
  if (spec.kind === 'review') {
    const missed = shuffle(student.mistakes.map(getQuestion).filter((q): q is Question => !!q));
    return {
      pool: missed,
      plan: missed.slice(0, spec.length).map((q) => q.skill),
      rank: Object.fromEntries(missed.map((q) => [q.id, 0])),
    };
  }

  const pool = shuffle(spec.skills.flatMap((s) => questionsFor(spec.unitId, s))).sort(
    (a, b) => priority(a, student) - priority(b, student),
  );

  const available = new Set(pool.map((q) => q.skill));
  const rotation = (['vocabulary', 'grammar', 'reading', 'form'] as Skill[]).filter((s) =>
    available.has(s),
  );

  let plan: Skill[];
  if (spec.kind === 'skill') {
    plan = Array.from({ length: spec.length }, () => spec.skills[0]);
  } else if (spec.kind === 'boss') {
    // Stage 1 vocabulary, stage 2 grammar, stage 3 reading, stage 4 form, then mixed.
    const stages = rotation.flatMap((s) => [s, s]);
    plan = [...stages];
    let i = 0;
    while (plan.length < spec.length && rotation.length) plan.push(rotation[i++ % rotation.length]);
    plan = plan.slice(0, spec.length);
  } else {
    plan = Array.from({ length: spec.length }, (_, i) => rotation[i % Math.max(1, rotation.length)]);
  }

  return { pool, plan, rank: Object.fromEntries(pool.map((q) => [q.id, priority(q, student)])) };
}

/**
 * The next question: the one she most needs, at the difficulty she is ready for.
 *
 * Need comes first and difficulty only breaks the tie inside it. Sorting the
 * pool by need was not enough on its own — scanning the whole pool for the
 * closest difficulty quietly ignored that order, which is how a challenge she
 * replayed kept serving the same questions she had already got right.
 */
export function pickQuestion(
  plan: MissionPlan,
  used: Set<string>,
  slot: number,
  target: Difficulty,
): Question | undefined {
  const wanted = plan.plan[slot];
  const candidates = plan.pool.filter((q) => !used.has(q.id));
  if (candidates.length === 0) return undefined;
  const inSkill = candidates.filter((q) => q.skill === wanted);
  const search = inSkill.length ? inSkill : candidates;

  const rankOf = (q: Question) => plan.rank[q.id] ?? 1;
  const mostNeeded = Math.min(...search.map(rankOf));
  const tier = search.filter((q) => rankOf(q) === mostNeeded);

  return tier.reduce((best, q) =>
    Math.abs(q.difficulty - target) < Math.abs(best.difficulty - target) ? q : best,
  );
}

/**
 * How far through a unit she is, counted in the stages the journey actually
 * lists. `unitCompletion` answers a different question — whether she has done
 * enough to unlock what comes next — and it is deliberately left alone: it
 * decides what is open to her, and moving that bar would close units that are
 * already open.
 */
export function unitStages(student: Student, unitId: string): { done: number; total: number } {
  const all = missionsFor(unitId);
  return { done: all.filter((m) => missionPassed(student, unitId, m)).length, total: all.length };
}

/**
 * What the Continue button should open: the first challenge she has not passed
 * yet, searched forward from the unit she is working in. Without this the
 * button fell back to the first challenge of the unit — one she had already
 * finished — as soon as there was nothing left unpassed in it.
 */
export function nextMissionFor(student: Student): { unitId: string; mission: MissionSpec } {
  const from = Math.max(0, units.findIndex((u) => u.id === currentUnitId(student)));

  for (let i = from; i < units.length; i++) {
    if (!unitUnlocked(student, i)) break;
    const unitId = units[i].id;
    const open = missionsFor(unitId).find(
      (m) => missionUnlocked(student, m) && !missionPassed(student, unitId, m),
    );
    if (open) return { unitId, mission: open };
  }

  // Everything open to her is passed: the boss of the unit she is in, to replay.
  const unitId = currentUnitId(student);
  const all = missionsFor(unitId);
  return { unitId, mission: all[all.length - 1] ?? all[0] };
}

export function reviewMission(student: Student): MissionSpec {
  return {
    key: 'review',
    unitId: 'review',
    skills: [...SKILL_ORDER],
    length: Math.min(8, Math.max(1, student.mistakes.length)),
    kind: 'review',
  };
}
