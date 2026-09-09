/*
 * Teacher powers.
 *
 * A teacher is a student account whose uid also has a /teachers/{uid} document.
 * That document can only be written by another teacher (or from the console),
 * so no student can promote herself — and the Firestore rules, not the UI, are
 * what actually enforce every power in this file.
 */
import type { Skill, Student } from '../types';
import { deleteDocument, getDocument, queryTop, setDocument } from './firestoreRest';
import { weeklyXpOf } from './storage';
import { SKILL_ORDER } from '../data/curriculum';

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
  skills: Student['skills'];
  /** The raw record, so a reset or rename can write it back intact. */
  raw: Student;
}

/** Fills the gaps a partially written record may have, so nothing downstream crashes. */
function normalize(r: Partial<Student>): Student {
  const blankSkills = Object.fromEntries(
    SKILL_ORDER.map((s) => [s, { attempts: 0, correct: 0 }]),
  ) as Student['skills'];
  return {
    id: r.id ?? '',
    code: r.code ?? '—',
    name: r.name ?? '—',
    createdAt: r.createdAt ?? 0,
    avatar: r.avatar ?? '🔥',
    xp: r.xp ?? 0,
    streak: r.streak ?? 0,
    lastPlayedDay: r.lastPlayedDay ?? '',
    bestCombo: r.bestCombo ?? 0,
    soundOn: r.soundOn ?? true,
    skills: { ...blankSkills, ...(r.skills ?? {}) },
    units: r.units ?? {},
    achievements: r.achievements ?? [],
    mistakes: r.mistakes ?? [],
    mastered: r.mastered ?? [],
    hintsUsed: r.hintsUsed ?? 0,
    totalAnswers: r.totalAnswers ?? 0,
    totalCorrect: r.totalCorrect ?? 0,
    history: r.history ?? {},
  };
}

export async function isTeacher(uid: string): Promise<boolean> {
  try {
    return (await getDocument<{ name?: string }>('teachers', uid)) !== null;
  } catch {
    return false;
  }
}

/** The whole class. Throws on a real network/permission failure so the UI can say so. */
export async function loadClass(): Promise<ClassRow[]> {
  const rows = await queryTop<Partial<Student> & { weeklyXp?: number }>('students', 'xp', 300);
  return rows.map((r) => {
    const s = normalize(r);
    return {
      id: s.id,
      name: s.name,
      code: s.code,
      avatar: s.avatar,
      xp: s.xp,
      weeklyXp: r.weeklyXp ?? weeklyXpOf(s),
      totalAnswers: s.totalAnswers,
      totalCorrect: s.totalCorrect,
      streak: s.streak,
      lastPlayedDay: s.lastPlayedDay,
      skills: s.skills,
      raw: s,
    };
  });
}

/**
 * Removes a student's record: her progress and her leaderboard row.
 *
 * ponytail: this deletes the Firestore document, not the Firebase Auth login —
 * deleting another user's account needs admin credentials that must never ship
 * in a browser. She can still sign in with the same name and PIN, and starts
 * from zero. True account deletion needs a Cloud Function (paid plan).
 */
export async function deleteStudent(id: string): Promise<void> {
  await deleteDocument('students', id);
}

/** Zeroes the progress but keeps the account, the name and the code. */
export async function resetStudent(row: ClassRow): Promise<void> {
  const cleared = normalize({
    id: row.raw.id,
    code: row.raw.code,
    name: row.raw.name,
    createdAt: row.raw.createdAt,
    avatar: row.raw.avatar,
    soundOn: row.raw.soundOn,
  });
  await setDocument('students', row.id, { ...cleared, weeklyXp: 0 });
}

/** Fixes a misspelled name without touching progress. */
export async function renameStudent(row: ClassRow, name: string): Promise<void> {
  const next = { ...row.raw, name: name.trim().slice(0, 24) || row.raw.name };
  await setDocument('students', row.id, { ...next, weeklyXp: weeklyXpOf(next) });
}

export async function addTeacher(uid: string, name: string): Promise<void> {
  // `uid` is stored in the body too, so the list query can report who is who.
  await setDocument('teachers', uid, { uid, name, grantedAt: Date.now() });
}

export async function removeTeacher(uid: string): Promise<void> {
  await deleteDocument('teachers', uid);
}

export async function listTeacherIds(): Promise<Set<string>> {
  try {
    const rows = await queryTop<{ uid?: string }>('teachers', 'grantedAt', 50);
    return new Set(rows.map((r) => r.uid).filter((u): u is string => !!u));
  } catch {
    return new Set();
  }
}

/* ---------- class-wide summary ---------- */

export interface ClassStats {
  students: number;
  active: number;
  totalAnswers: number;
  accuracy: number;
  /** The skill the class as a whole is weakest at, or null before anyone plays. */
  weakest: Skill | null;
  skillAccuracy: Record<Skill, { attempts: number; correct: number }>;
}

export function summarize(rows: ClassRow[]): ClassStats {
  const skillAccuracy = Object.fromEntries(
    SKILL_ORDER.map((s) => [s, { attempts: 0, correct: 0 }]),
  ) as ClassStats['skillAccuracy'];

  let totalAnswers = 0;
  let totalCorrect = 0;
  for (const r of rows) {
    totalAnswers += r.totalAnswers;
    totalCorrect += r.totalCorrect;
    for (const s of SKILL_ORDER) {
      skillAccuracy[s].attempts += r.skills[s]?.attempts ?? 0;
      skillAccuracy[s].correct += r.skills[s]?.correct ?? 0;
    }
  }

  const tried = SKILL_ORDER.filter((s) => skillAccuracy[s].attempts >= 5);
  const weakest = tried.length
    ? tried.reduce((worst, s) =>
        skillAccuracy[s].correct / skillAccuracy[s].attempts <
        skillAccuracy[worst].correct / skillAccuracy[worst].attempts
          ? s
          : worst,
      )
    : null;

  return {
    students: rows.length,
    active: rows.filter((r) => r.totalAnswers > 0).length,
    totalAnswers,
    accuracy: totalAnswers ? totalCorrect / totalAnswers : 0,
    weakest,
    skillAccuracy,
  };
}

/** A spreadsheet of the class, for record keeping. Excel-friendly (BOM + CRLF). */
export function toCsv(rows: ClassRow[]): string {
  const head = [
    'name',
    'code',
    'xp',
    'level_xp',
    'answers',
    'correct',
    'accuracy_percent',
    'streak_days',
    'weekly_xp',
    'last_played',
    ...SKILL_ORDER.map((s) => `${s}_accuracy_percent`),
  ];
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((r) =>
    [
      r.name,
      r.code,
      r.xp,
      r.xp,
      r.totalAnswers,
      r.totalCorrect,
      r.totalAnswers ? Math.round((r.totalCorrect / r.totalAnswers) * 100) : 0,
      r.streak,
      r.weeklyXp,
      r.lastPlayedDay || '',
      ...SKILL_ORDER.map((s) => {
        const st = r.skills[s];
        return st?.attempts ? Math.round((st.correct / st.attempts) * 100) : 0;
      }),
    ]
      .map(esc)
      .join(','),
  );
  return '﻿' + [head.join(','), ...body].join('\r\n');
}
