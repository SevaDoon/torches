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

/** XP earned in the last 7 days, used for the "most improved" ranking. */
export function weeklyXpOf(student: Student): number {
  const now = Date.now();
  return Object.entries(student.history).reduce((sum, [day, xp]) => {
    const t = Date.parse(day);
    return Number.isNaN(t) || now - t > 7 * 864e5 ? sum : sum + xp;
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
      const rows = await queryTop<Student & { weeklyXp: number }>('students', 'xp', 50);
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        avatar: r.avatar,
        xp: r.xp,
        weeklyXp: r.weeklyXp ?? 0,
      }));
    } catch {
      return [];
    }
  },
};

/** The single swap point. */
export const driver: TorchesDriver = firestoreDriver;
