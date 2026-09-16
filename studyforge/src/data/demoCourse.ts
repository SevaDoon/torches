/*
 * The sample course.
 *
 * Built from `demoReference.ts` through the real pipeline, kept under a fixed
 * id, and flagged `isDemo` so every screen can say plainly that this is a
 * sample rather than something the student uploaded. Deleting it is allowed,
 * and opening the sample again rebuilds it.
 *
 * It also arrives with a plausible history, because half of what the product
 * does — weak topics, the review schedule, the knowledge map — has nothing to
 * show on a course that has never been played. That history lives under the
 * demo course's own id and touches nothing else.
 */
import type { Course, CourseProgress, Learner, SourceDoc } from '../types';
import { buildCourse } from '../engine/build';
import { fromPastedText } from '../engine/extract';
import { blankProgress } from '../services/learner';
import { BOXES, DAY, blankConceptState } from '../services/progress';
import { loadCourse, saveCourse } from '../services/db';
import { DEMO_NAME, DEMO_REFERENCE } from './demoReference';

export const DEMO_ID = 'course-demo-applied-statistics';

export async function ensureDemoCourse(): Promise<Course> {
  const existing = await loadCourse(DEMO_ID);
  if (existing) return existing;

  const extracted = fromPastedText(`${DEMO_NAME}.txt`, DEMO_REFERENCE);
  if (!extracted.ok) throw new Error('the bundled sample reference did not parse');
  const doc: SourceDoc = { ...extracted.doc, id: 'demo-doc' };

  const built = await buildCourse(
    { name: DEMO_NAME, lang: 'en', goal: 'exam', docs: [doc], isDemo: true },
    () => {},
  );
  const course: Course = { ...built, id: DEMO_ID };
  // Ids inside the course carry the course id they were built with.
  const fixed: Course = {
    ...course,
    chapters: course.chapters.map((c) => ({ ...c, courseId: DEMO_ID })),
    concepts: course.concepts.map((c) => ({ ...c, courseId: DEMO_ID })),
    questions: course.questions.map((q) => ({ ...q, courseId: DEMO_ID })),
  };
  await saveCourse(fixed);
  return fixed;
}

/**
 * A history for the sample course: some chapters well learned, one clearly
 * weak, a few concepts overdue for review. Deterministic, so the dashboard
 * tells the same story to everyone who opens it.
 */
export function demoProgress(course: Course): CourseProgress {
  const progress: CourseProgress = { ...blankProgress(), lastPlayed: Date.now() - 2 * DAY };
  const now = Date.now();

  // The chapter that is meant to look like trouble, by position rather than by
  // title, so it still works if the sample reference is ever rewritten.
  const weakChapter = course.chapters[Math.min(5, course.chapters.length - 1)]?.id;

  course.concepts.forEach((concept, i) => {
    // Deterministic spread: about four concepts in five have been met.
    const seed = (i * 37) % 100;
    if (seed >= 82) return;

    const weak = concept.chapterId === weakChapter && seed % 3 !== 0;
    const strong = !weak && seed % 5 !== 0;
    const attempts = weak ? 3 + (seed % 3) : 2 + (seed % 4);
    const correct = weak ? Math.max(1, Math.floor(attempts * 0.35)) : Math.ceil(attempts * 0.85);
    const mastery = weak ? 0.18 + (seed % 12) / 100 : strong ? 0.82 + (seed % 14) / 100 : 0.55;
    const box = weak ? 0 : Math.min(BOXES.length - 1, 2 + (seed % 3));

    progress.conceptStates[concept.id] = {
      ...blankConceptState(),
      mastery: Math.min(0.97, mastery),
      attempts,
      correct,
      incorrect: attempts - correct,
      box,
      lastReview: now - (1 + (seed % 6)) * DAY,
      // Some of these land in the past, so "due for review" is not empty.
      nextReview: now - (1 + (seed % 6)) * DAY + BOXES[box] * DAY,
      runningCorrect: weak ? 0 : 2,
      probes: weak ? [] : ['recall'],
    };
  });

  progress.daily = { [new Date(now - DAY).toISOString().slice(0, 10)]: 18 };
  progress.sessions = [
    session('chapter', now - 2 * DAY, 10, 8),
    session('quick', now - 3 * DAY, 8, 5),
    session('exam', now - 6 * DAY, 20, 15),
  ];
  progress.bestExam = 0.75;
  return progress;
}

function session(mode: CourseProgress['sessions'][number]['mode'], at: number, answered: number, correct: number) {
  return {
    id: `demo-${at}`,
    mode,
    at,
    answered,
    correct,
    accuracy: correct / answered,
    // No XP. The sample history exists so the mastery features have something
    // to work on; handing out levels for rounds nobody played would make the
    // progress screen lie about what this student has actually done.
    xp: 0,
    seconds: answered * 22,
    weak: [],
    strong: [],
  };
}

/** Attach the sample history the first time the sample course is opened. */
export function withDemoProgress(learner: Learner, course: Course): Learner {
  if (learner.courses[DEMO_ID]) return learner;
  return { ...learner, courses: { ...learner.courses, [DEMO_ID]: demoProgress(course) } };
}
