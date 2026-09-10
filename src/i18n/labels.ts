/* Turns domain objects into the words the student reads. */
import type { MissionSpec, Skill } from '../types';
import { SKILLS, getUnit } from '../data/curriculum';
import { ar } from './ar';

/** The book's own term for the skill — Grammar, Vocabulary, Reading, Form & Meaning. */
export const skillEn = (skill: Skill) => SKILLS[skill].label;
export const skillColor = (skill: Skill) => SKILLS[skill].color;

export function missionTitle(spec: MissionSpec): string {
  if (spec.kind === 'boss') return ar.missions.boss;
  if (spec.kind === 'mixed') return ar.missions.mixed;
  if (spec.kind === 'review') return ar.missions.review;
  return skillEn(spec.skills[0]);
}

export function missionSubtitle(spec: MissionSpec): string {
  if (spec.kind === 'boss') return ar.missions.bossSub;
  if (spec.kind === 'mixed') return ar.missions.mixedSub;
  if (spec.kind === 'review') return ar.missions.reviewSub;
  const unit = getUnit(spec.unitId);
  return ar.missions.skillSub(unit?.number ?? 0, skillEn(spec.skills[0]));
}
