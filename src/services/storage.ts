/*
 * Data layer. Every read and write in the app goes through this driver, so
 * swapping localStorage for Supabase / Firebase / a REST API means writing one
 * new object with the same four methods — no component changes.
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
  /** The id of the student using this device, or null on a first visit. */
  currentStudentId(): Promise<string | null>;
  setCurrentStudentId(id: string | null): Promise<void>;
  loadStudent(id: string): Promise<Student | null>;
  saveStudent(student: Student): Promise<void>;
  /** Everyone the leaderboard should show. */
  loadRoster(): Promise<RosterEntry[]>;
}

const K = {
  current: 'torches.currentId',
  student: (id: string) => `torches.student.${id}`,
  roster: 'torches.roster',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode, quota, or storage disabled — the session still works in memory */
  }
}

export const localDriver: TorchesDriver = {
  async currentStudentId() {
    return read<string | null>(K.current, null);
  },
  async setCurrentStudentId(id) {
    if (id === null) {
      try {
        localStorage.removeItem(K.current);
      } catch {
        /* ignore */
      }
    } else {
      write(K.current, id);
    }
  },
  async loadStudent(id) {
    return read<Student | null>(K.student(id), null);
  },
  async saveStudent(student) {
    write(K.student(student.id), student);
    const roster = read<RosterEntry[]>(K.roster, []);
    const entry: RosterEntry = {
      id: student.id,
      name: student.name,
      avatar: student.avatar,
      xp: student.xp,
      weeklyXp: weeklyXpOf(student),
    };
    const i = roster.findIndex((r) => r.id === student.id);
    if (i >= 0) roster[i] = entry;
    else roster.push(entry);
    write(K.roster, roster);
  },
  async loadRoster() {
    return read<RosterEntry[]>(K.roster, []);
  },
};

/** XP earned in the last 7 days, used for the "most improved" ranking. */
export function weeklyXpOf(student: Student): number {
  const now = Date.now();
  return Object.entries(student.history).reduce((sum, [day, xp]) => {
    const t = Date.parse(day);
    return Number.isNaN(t) || now - t > 7 * 864e5 ? sum : sum + xp;
  }, 0);
}

/**
 * Real, shared leaderboard: students and progress live in Firestore so every
 * device sees the same class. Which device is "signed in" stays local (no
 * login in this app), so that half reuses localDriver.
 */
export const firestoreDriver: TorchesDriver = {
  currentStudentId: localDriver.currentStudentId,
  setCurrentStudentId: localDriver.setCurrentStudentId,
  async loadStudent(id) {
    try {
      return await getDocument<Student>('students', id);
    } catch {
      return null; // offline or first load — the app treats this as "no save yet"
    }
  },
  async saveStudent(student) {
    try {
      await setDocument('students', student.id, {
        ...student,
        weeklyXp: weeklyXpOf(student), // denormalized so the leaderboard query needs no extra reads
      });
    } catch {
      /* offline — progress stays in memory for this session and saves next time */
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
