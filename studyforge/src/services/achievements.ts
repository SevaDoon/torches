/*
 * Achievements. University-age, not primary-school: each one marks something
 * that actually took learning, so none of them can be earned by tapping.
 */
import type { Learner, SessionRecord } from '../types';
import type { IconName } from '../components/Icon';
import type { Strings } from '../i18n/strings';

export interface Achievement {
  id: keyof Strings['achievements'];
  icon: IconName;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'firstCourse', icon: 'forge' },
  { id: 'hundred', icon: 'target' },
  { id: 'chapterMastered', icon: 'crown' },
  { id: 'week', icon: 'flame' },
  { id: 'flawless', icon: 'check' },
  { id: 'examReady', icon: 'clipboard' },
  { id: 'weaknessGone', icon: 'shield' },
  { id: 'survivor', icon: 'heart' },
];

export interface AchievementContext {
  /** The session that just finished, if this check follows one. */
  lastSession?: SessionRecord;
  /** A chapter crossed into full mastery during that session. */
  chapterMastered?: boolean;
  /** A concept that was weak is now mastered. */
  weaknessCleared?: boolean;
}

export function earned(learner: Learner, ctx: AchievementContext, id: Achievement['id']): boolean {
  const s = ctx.lastSession;
  switch (id) {
    case 'firstCourse':
      // Read from the learner's own record rather than from the course list,
      // which is loaded asynchronously and is still empty at the moment the
      // first course is created — which is exactly when this should fire.
      return Object.keys(learner.courses).length >= 1;
    case 'hundred':
      return learner.totalAnswers >= 100;
    case 'chapterMastered':
      return !!ctx.chapterMastered;
    case 'week':
      return learner.streak >= 7;
    case 'flawless':
      return !!s && s.answered >= 5 && s.correct === s.answered;
    case 'examReady':
      return !!s && s.mode === 'exam' && s.accuracy >= 0.85;
    case 'weaknessGone':
      return !!ctx.weaknessCleared;
    case 'survivor':
      return !!s && s.mode === 'survival' && s.answered >= 15;
  }
}

export function newlyEarned(learner: Learner, ctx: AchievementContext): Achievement['id'][] {
  return ACHIEVEMENTS.filter((a) => !learner.achievements.includes(a.id) && earned(learner, ctx, a.id)).map(
    (a) => a.id,
  );
}
