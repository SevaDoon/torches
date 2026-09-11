/*
 * Data layer. Every read and write goes through this driver, so swapping the
 * backend means writing one new object with the same three methods — no
 * component changes. Who is signed in is Firebase Auth's job, not this file's.
 */
import type { Student } from '../types';
import { getDocument, queryTop, setDocument } from './firestoreRest';

export interface RosterEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  weeklyXp: number;
}

export interface TorchesDriver {
  loadStudent(id: string): Promise<Student | null>;
  saveStudent(student: Student): Promise<void>;
  /** Everyone the leaderboard should show. */
  loadRoster(): Promise<RosterEntry[]>;
}

/**
 * XP earned in the last 7 days, used for the "most improved" ranking.
 *
 * Tolerates a record with no history at all: a partially written document must
 * never be able to take down the leaderboard or the class screen for everyone.
 */
export function weeklyXpOf(student: Pick<Student, 'history'>): number {
  const history = student?.history;
  if (!history || typeof history !== 'object') return 0;
  const now = Date.now();
  return Object.entries(history).reduce((sum, [day, xp]) => {
    const t = Date.parse(day);
    if (Number.isNaN(t) || now - t > 7 * 864e5) return sum;
    return sum + (typeof xp === 'number' ? xp : 0);
  }, 0);
}

/**
 * Real, shared class: every student's progress lives in Firestore, keyed by her
 * Firebase Auth uid. Rules let her write only her own row.
 */
export const firestoreDriver: TorchesDriver = {
  async loadStudent(id) {
    try {
      return await getDocument<Student>('students', id);
    } catch {
      return null; // offline — the app treats this as "no save yet"
    }
  },
  async saveStudent(student) {
    try {
      await setDocument('students', student.id, {
        ...student,
        weeklyXp: weeklyXpOf(student), // denormalized so the leaderboard needs no extra reads
      });
    } catch {
      /* offline — progress stays in memory this session and saves next time */
    }
  },
  async loadRoster() {
    try {
      const rows = await queryTop<Partial<Student> & { weeklyXp?: number }>(
        'students',
        'xp',
        60,
        ['id', 'name', 'avatar', 'xp', 'weeklyXp', 'totalAnswers'],
      );
      return (
        rows
          /*
           * Real players only. An account that has never answered a question is
           * a test account or an abandoned signup, and neither of those belongs
           * on a board meant to show the class competing. The teacher still
           * sees every account on her own screen.
           */
          .filter((r) => (r.totalAnswers ?? 0) > 0)
          .map((r) => ({
            id: r.id ?? '',
            name: r.name ?? '',
            avatar: r.avatar ?? '🔥',
            xp: r.xp ?? 0,
            weeklyXp: r.weeklyXp ?? 0,
          }))
      );
    } catch {
      return [];
    }
  },
};

/** The single swap point. */
export const driver: TorchesDriver = firestoreDriver;
