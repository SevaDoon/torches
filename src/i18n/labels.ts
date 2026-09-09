/* Turns domain objects into the words the student reads. */
import type { MissionSpec, Skill } from '../types';
import { SKILLS, getUnit } from '../data/curriculum';
import { ar } from './ar';

export const skillAr = (skill: Skill) => ar.skills[skill];
export const skillEn = (skill: Skill) => SKILLS[skill].label;
export const skillColor = (skill: Skill) => SKILLS[skill].color;

export function missionTitle(spec: MissionSpec): string {
  if (spec.kind === 'boss') return ar.missions.boss;
  if (spec.kind === 'mixed') return ar.missions.mixed;
  if (spec.kind === 'review') return ar.missions.review;
  return skillAr(spec.skills[0]);
}

/** The English name of the section, kept beside the Arabic one. */
export function missionTitleEn(spec: MissionSpec): string {
  if (spec.kind === 'boss') return 'Boss Challenge';
  if (spec.kind === 'mixed') return 'Mixed Challenge';
  if (spec.kind === 'review') return 'Smart Review';
  return skillEn(spec.skills[0]);
}

export function missionSubtitle(spec: MissionSpec): string {
  if (spec.kind === 'boss') return ar.missions.bossSub;
  if (spec.kind === 'mixed') return ar.missions.mixedSub;
  if (spec.kind === 'review') return ar.missions.reviewSub;
  const unit = getUnit(spec.unitId);
  return ar.missions.skillSub(unit?.number ?? 0, skillAr(spec.skills[0]));
}
