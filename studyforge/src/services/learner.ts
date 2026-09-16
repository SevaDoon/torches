/* The learner record: how it starts, how it survives an update, and how an
   answer changes it. Every change to a learner goes through here. */
import type { AnswerRecord, CourseProgress, Learner, SessionRecord } from '../types';
import { applyAttempt, conceptState, nextStreak, todayKey } from './progress';

export const blankProgress = (): CourseProgress => ({
  conceptStates: {},
  sessions: [],
  daily: {},
  lastPlayed: 0,
  bestExam: 0,
});

export function blankLearner(name = ''): Learner {
  return {
    id: `l-${Math.random().toString(36).slice(2, 10)}`,
    name: name.trim(),
    uiLang: 'ar',
    createdAt: Date.now(),
    xp: 0,
    streak: 0,
    lastPlayedDay: '',
    dailyGoal: 20,
    soundOn: true,
    achievements: [],
    totalAnswers: 0,
    totalCorrect: 0,
    bestCombo: 0,
    courses: {},
    prefs: {
      length: 8,
      fixedDifficulty: null,
      perQuestionSeconds: 0,
      types: ['mcq', 'truefalse', 'blank', 'match', 'order', 'error'],
      examMinutes: 20,
      examLength: 20,
    },
  };
}

/**
 * Fill in whatever a newer version of the app expects and an older save does
 * not have. Extend this whenever a field is added, or old saves break on load.
 */
export function migrate(saved: Learner): Learner {
  const blank = blankLearner(saved?.name ?? '');
  const merged: Learner = {
    ...blank,
    ...saved,
    prefs: { ...blank.prefs, ...(saved?.prefs ?? {}) },
    achievements: saved?.achievements ?? [],
    courses: saved?.courses ?? {},
  };
  for (const [id, progress] of Object.entries(merged.courses)) {
    merged.courses[id] = { ...blankProgress(), ...progress };
  }
  // A saved preference list can be empty after an edit; an empty one would
  // leave the picker with nothing to draw from and no question to ask.
  if (merged.prefs.types.length === 0) merged.prefs.types = blank.prefs.types;
  return merged;
}

export function progressOf(learner: Learner, courseId: string): CourseProgress {
  return learner.courses[courseId] ?? blankProgress();
}

/** One answer, applied everywhere it counts. */
export function applyAnswer(learner: Learner, courseId: string, record: AnswerRecord): Learner {
  const progress = progressOf(learner, courseId);
  const today = todayKey();

  const state = applyAttempt(
    conceptState(progress, record.conceptId),
    record.correct,
    record.clean,
    record.probe,
  );

  const nextProgress: CourseProgress = {
    ...progress,
    conceptStates: { ...progress.conceptStates, [record.conceptId]: state },
    daily: { ...progress.daily, [today]: (progress.daily[today] ?? 0) + 1 },
    lastPlayed: Date.now(),
  };

  return {
    ...learner,
    xp: learner.xp + record.xp,
    streak: nextStreak(learner),
    lastPlayedDay: today,
    totalAnswers: learner.totalAnswers + 1,
    totalCorrect: learner.totalCorrect + (record.correct ? 1 : 0),
    courses: { ...learner.courses, [courseId]: nextProgress },
  };
}

export function applySession(learner: Learner, courseId: string, session: SessionRecord): Learner {
  const progress = progressOf(learner, courseId);
  return {
    ...learner,
    bestCombo: Math.max(learner.bestCombo, 0),
    courses: {
      ...learner.courses,
      [courseId]: {
        ...progress,
        // Twenty is plenty of history for the progress screen, and it keeps the
        // saved record from growing without bound over a semester.
        sessions: [session, ...progress.sessions].slice(0, 20),
        bestExam:
          session.mode === 'exam' ? Math.max(progress.bestExam, session.accuracy) : progress.bestExam,
      },
    },
  };
}

export function rememberCombo(learner: Learner, combo: number): Learner {
  return combo > learner.bestCombo ? { ...learner, bestCombo: combo } : learner;
}
