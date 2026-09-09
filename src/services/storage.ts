/*
 * Data layer. Every read and write in the app goes through this driver, so
 * swapping localStorage for Supabase / Firebase / a REST API means writing one
 * new object with the same four methods — no component changes.
 */
import type { Student } from '../types';

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

/** The single swap point. Replace with a remote driver when a backend exists. */
export const driver: TorchesDriver = localDriver;
