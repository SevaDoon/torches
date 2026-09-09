import type { Passage, Question, Skill, Unit } from '../../types';
import { unit01 } from './unit01';
import { unit02 } from './unit02';
import { unit03 } from './unit03';
import { unit04 } from './unit04';
import { unit05 } from './unit05';
import { unit06 } from './unit06';
import { unit07 } from './unit07';
import { unit08 } from './unit08';
import { unit09 } from './unit09';
import { unit10 } from './unit10';
import { unit11 } from './unit11';
import { unit12 } from './unit12';

export const COURSE = {
  title: 'MegaGoal 1',
  subtitle: 'Student Book — Saudi edition',
};

export const units: Unit[] = [
  unit01, unit02, unit03, unit04, unit05, unit06,
  unit07, unit08, unit09, unit10, unit11, unit12,
];

/** English name (the book's own term) and the ink each skill is printed in. */
export const SKILLS: Record<Skill, { label: string; color: string }> = {
  grammar: { label: 'Grammar', color: 'var(--flame)' },
  vocabulary: { label: 'Vocabulary', color: 'var(--violet)' },
  reading: { label: 'Reading', color: 'var(--teal)' },
  form: { label: 'Form & Meaning', color: 'var(--amber)' },
};

export const SKILL_ORDER: Skill[] = ['grammar', 'vocabulary', 'reading', 'form'];

const questionIndex = new Map<string, Question>();
const passageIndex = new Map<string, Passage>();
const unitIndex = new Map<string, Unit>();

for (const unit of units) {
  unitIndex.set(unit.id, unit);
  for (const q of unit.questions) questionIndex.set(q.id, q);
  for (const p of unit.passages) passageIndex.set(p.id, p);
}

export const allQuestions: Question[] = units.flatMap((u) => u.questions);

export const getUnit = (id: string) => unitIndex.get(id);
export const getQuestion = (id: string) => questionIndex.get(id);
export const getPassage = (id: string) => passageIndex.get(id);

export function questionsFor(unitId: string, skill?: Skill): Question[] {
  const unit = unitIndex.get(unitId);
  if (!unit) return [];
  return skill ? unit.questions.filter((q) => q.skill === skill) : unit.questions;
}

export function lessonFor(unitId: string, skill: Skill) {
  const unit = unitIndex.get(unitId);
  if (!unit) return undefined;
  return unit.lessons.find((l) => l.skill === skill) ?? unit.lessons[0];
}
