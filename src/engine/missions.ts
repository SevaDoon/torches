/* Which challenges exist, and which questions each one draws from. */
import type { Difficulty, MissionSpec, Question, Skill, Student } from '../types';
import { SKILL_ORDER, getQuestion, getUnit, questionsFor } from '../data/curriculum';
import { unitProgress } from '../services/progressService';
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
    return { pool: missed, plan: missed.slice(0, spec.length).map((q) => q.skill) };
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

  return { pool, plan };
}

/** Closest question to the target difficulty in the wanted skill. */
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
  return search.reduce((best, q) =>
    Math.abs(q.difficulty - target) < Math.abs(best.difficulty - target) ? q : best,
  );
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
