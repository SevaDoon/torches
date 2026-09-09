/*
 * Teacher powers.
 *
 * A teacher is a student account whose uid also has a /teachers/{uid} document.
 * That document can only be created from the Firebase console or the admin API,
 * so no student can promote herself — and the Firestore rules, not the UI, are
 * what actually enforce it.
 */
import type { Student } from '../types';
import { deleteDocument, getDocument, queryTop } from './firestoreRest';
import { weeklyXpOf } from './storage';

export interface ClassRow {
  id: string;
  name: string;
  code: string;
  avatar: string;
  xp: number;
  weeklyXp: number;
  totalAnswers: number;
  totalCorrect: number;
  streak: number;
  lastPlayedDay: string;
}

export async function isTeacher(uid: string): Promise<boolean> {
  try {
    return (await getDocument<{ name?: string }>('teachers', uid)) !== null;
  } catch {
    return false;
  }
}

/** The whole class, richest view — used only by the teacher screen. */
export async function loadClass(): Promise<ClassRow[]> {
  const rows = await queryTop<Student & { weeklyXp?: number }>('students', 'xp', 200);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code ?? '—',
    avatar: r.avatar,
    xp: r.xp ?? 0,
    weeklyXp: r.weeklyXp ?? weeklyXpOf(r),
    totalAnswers: r.totalAnswers ?? 0,
    totalCorrect: r.totalCorrect ?? 0,
    streak: r.streak ?? 0,
    lastPlayedDay: r.lastPlayedDay ?? '',
  }));
}

/**
 * Removes a student's record: her progress and her leaderboard row.
 *
 * ponytail: this deletes the Firestore document, not the Firebase Auth login —
 * deleting another user's account needs admin credentials that must never ship
 * in a browser. She can still sign in with the same name and PIN, and starts
 * from zero. Wiring true account deletion needs a Cloud Function (paid plan).
 */
export async function deleteStudent(id: string): Promise<void> {
  await deleteDocument('students', id);
}
