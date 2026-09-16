/*
 * The data layer. Everything the student has is here and nowhere else — the
 * reference she uploaded, the questions built from it, and her progress.
 *
 * IndexedDB rather than localStorage because a course carries the full text of
 * its reference: one 200-page PDF is already past what localStorage will hold,
 * and the failure mode there is a thrown quota error halfway through a save.
 *
 * Course summaries are kept in their own store so the course list does not
 * have to read several megabytes of document text to draw six cards.
 */
import type { Course, CourseSummary, Learner } from '../types';

const DB_NAME = 'studyforge';
const DB_VERSION = 1;
const COURSES = 'courses';
const SUMMARIES = 'summaries';
const META = 'meta';

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(COURSES)) db.createObjectStore(COURSES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(SUMMARIES)) db.createObjectStore(SUMMARIES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

/* ---------- courses ---------- */

export function summarize(course: Course): CourseSummary {
  return {
    id: course.id,
    name: course.name,
    lang: course.lang,
    goal: course.goal,
    createdAt: course.createdAt,
    isDemo: course.isDemo,
    chapters: course.chapters.length,
    concepts: course.concepts.length,
    questions: course.questions.length,
    docNames: course.docs.map((d) => d.name),
  };
}

export async function saveCourse(course: Course): Promise<void> {
  await run(COURSES, 'readwrite', (s) => s.put(course));
  await run(SUMMARIES, 'readwrite', (s) => s.put(summarize(course)));
}

export function loadCourse(id: string): Promise<Course | undefined> {
  return run<Course | undefined>(COURSES, 'readonly', (s) => s.get(id));
}

export function listCourses(): Promise<CourseSummary[]> {
  return run<CourseSummary[]>(SUMMARIES, 'readonly', (s) => s.getAll()).then((rows) =>
    rows.sort((a, b) => b.createdAt - a.createdAt),
  );
}

export async function deleteCourse(id: string): Promise<void> {
  await run(COURSES, 'readwrite', (s) => s.delete(id));
  await run(SUMMARIES, 'readwrite', (s) => s.delete(id));
}

/* ---------- the learner ---------- */

export function loadLearner(): Promise<Learner | undefined> {
  return run<Learner | undefined>(META, 'readonly', (s) => s.get('learner'));
}

export async function saveLearner(learner: Learner): Promise<void> {
  await run(META, 'readwrite', (s) => s.put(learner, 'learner'));
}

export async function clearAll(): Promise<void> {
  for (const store of [COURSES, SUMMARIES, META]) {
    await run(store, 'readwrite', (s) => s.clear());
  }
}

/* ---------- small settings ---------- */

/*
 * These are single values a screen needs synchronously on first paint — the
 * interface language before anything is rendered, the model key before the
 * first request. localStorage is the right size of tool for them, and keeping
 * them out of IndexedDB means no await between a reload and the right layout.
 */
export function getSetting(key: string): string | null {
  try {
    return localStorage.getItem(`sf.${key}`);
  } catch {
    return null;
  }
}

export function setSetting(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(`sf.${key}`);
    else localStorage.setItem(`sf.${key}`, value);
  } catch {
    /* private mode — the setting lasts for this session only */
  }
}
