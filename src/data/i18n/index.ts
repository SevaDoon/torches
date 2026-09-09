/*
 * Arabic layer over the curriculum.
 *
 * The English question data in `data/curriculum/` is never touched — the
 * student reads the question in English, but the teaching around it (the three
 * hints and the explanation) is in her own language. Translations are keyed by
 * question id, so a new language is one more folder like this one.
 */
import type { MiniLesson, Question } from '../../types';
import { getUnit } from '../curriculum';
import { unit01ar } from './unit01.ar';
import { unit02ar } from './unit02.ar';
import { unit03ar } from './unit03.ar';
import { unit04ar } from './unit04.ar';
import { unit05ar } from './unit05.ar';
import { unit06ar } from './unit06.ar';
import { unit07ar } from './unit07.ar';
import { unit08ar } from './unit08.ar';
import { unit09ar } from './unit09.ar';
import { unit10ar } from './unit10.ar';
import { unit11ar } from './unit11.ar';
import { unit12ar } from './unit12.ar';
import { picturesAr } from './pictures.ar';

export interface QuestionAr {
  /** Arabic explanation, shown after a wrong answer and as the last hint. */
  ex: string;
  /** Arabic Think / Remember / Example hints. English examples stay in English. */
  h: [string, string, string];
}

export interface UnitAr {
  /** Mini-lessons, in the same order as `unit.lessons`. */
  lessons: Array<{ t: string; r: string }>;
  q: Record<string, QuestionAr>;
}

const UNITS_AR: Record<string, UnitAr> = {
  'unit-1': unit01ar,
  'unit-2': unit02ar,
  'unit-3': unit03ar,
  'unit-4': unit04ar,
  'unit-5': unit05ar,
  'unit-6': unit06ar,
  'unit-7': unit07ar,
  'unit-8': unit08ar,
  'unit-9': unit09ar,
  'unit-10': unit10ar,
  'unit-11': unit11ar,
  'unit-12': unit12ar,
};

const entryFor = (q: Question): QuestionAr | undefined =>
  UNITS_AR[q.unitId]?.q[q.id] ?? picturesAr[q.id];

/** Arabic hints when they exist, English as the safety net. */
export function hintsOf(q: Question): [string, string, string] {
  return entryFor(q)?.h ?? q.hints;
}

export function explanationOf(q: Question): string {
  return entryFor(q)?.ex ?? q.explanation;
}

/** Arabic title and rule; the examples stay in English because they are the lesson. */
export function localizeLesson(unitId: string, lesson: MiniLesson): MiniLesson {
  const unit = getUnit(unitId);
  const index = unit ? unit.lessons.indexOf(lesson) : -1;
  const tr = index >= 0 ? UNITS_AR[unitId]?.lessons[index] : undefined;
  return tr ? { ...lesson, title: tr.t, rule: tr.r } : lesson;
}

/** How many questions still fall back to English — used by the dev self-check. */
export function untranslatedIds(): string[] {
  const missing: string[] = [];
  for (const [unitId, tr] of Object.entries(UNITS_AR)) {
    const unit = getUnit(unitId);
    if (!unit) continue;
    for (const q of unit.questions) {
      const e = entryFor(q);
      if (!e || !e.ex?.trim() || e.h.length !== 3 || e.h.some((h) => !h?.trim())) {
        missing.push(q.id);
      }
    }
    if (tr.lessons.length !== unit.lessons.length) missing.push(`${unitId}: lesson count`);
  }
  return missing;
}
