/* Creating, loading and updating the student record. Identity lives here. */
import type { Skill, Student } from '../types';
import { driver } from './storage';
import { nextStreak, todayKey } from './progressService';

const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1 — easier to read aloud

export const AVATARS = ['🔥', '⭐', '🌙', '🚀', '🦋', '🌸', '🐬', '🍀', '💎', '🎨', '📚', '⚡'];

/** TOR-A82F91 — the permanent identity. The display name is never the key. */
export function generateId(): string {
  let body = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) body += ID_ALPHABET[b % ID_ALPHABET.length];
  return `TOR-${body}`;
}

export function blankStudent(name: string): Student {
  return {
    id: generateId(),
    name: name.trim() || 'Student',
    createdAt: Date.now(),
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    xp: 0,
    streak: 0,
    lastPlayedDay: '',
    bestCombo: 0,
    soundOn: true,
    skills: {
      grammar: { attempts: 0, correct: 0 },
      vocabulary: { attempts: 0, correct: 0 },
      reading: { attempts: 0, correct: 0 },
      form: { attempts: 0, correct: 0 },
    },
    units: {},
    achievements: [],
    mistakes: [],
    mastered: [],
    hintsUsed: 0,
    totalAnswers: 0,
    totalCorrect: 0,
    history: {},
  };
}

/** Fills in anything missing after an app update, so old saves keep working. */
function migrate(s: Student): Student {
  const blank = blankStudent(s.name);
  return {
    ...blank,
    ...s,
    skills: { ...blank.skills, ...s.skills },
    units: s.units ?? {},
    achievements: s.achievements ?? [],
    mistakes: s.mistakes ?? [],
    mastered: s.mastered ?? [],
    history: s.history ?? {},
  };
}

export async function loadCurrentStudent(): Promise<Student | null> {
  const id = await driver.currentStudentId();
  if (!id) return null;
  const student = await driver.loadStudent(id);
  return student ? migrate(student) : null;
}

export async function startStudent(name: string): Promise<Student> {
  const student = blankStudent(name);
  await driver.saveStudent(student);
  await driver.setCurrentStudentId(student.id);
  return student;
}

/** Everyone who has ever played on this device — used by the "continue as" list. */
export async function listPlayers() {
  return driver.loadRoster();
}

export async function resumeStudent(id: string): Promise<Student | null> {
  const student = await driver.loadStudent(id);
  if (!student) return null;
  await driver.setCurrentStudentId(id);
  return migrate(student);
}

export async function persist(student: Student): Promise<void> {
  await driver.saveStudent(student);
}

export async function signOut(): Promise<void> {
  await driver.setCurrentStudentId(null);
}

/* ---------- record an answer ---------- */

export interface AnswerRecord {
  questionId: string;
  skill: Skill;
  unitId: string;
  correct: boolean;
  /** True only when it was right with no hints and no retry. */
  cleanFirstTry: boolean;
  xp: number;
  hintsUsed: number;
  combo: number;
}

export function applyAnswer(student: Student, r: AnswerRecord): Student {
  const day = todayKey();
  const skills = {
    ...student.skills,
    [r.skill]: {
      attempts: student.skills[r.skill].attempts + 1,
      correct: student.skills[r.skill].correct + (r.correct ? 1 : 0),
    },
  };

  const mistakes = new Set(student.mistakes);
  const mastered = new Set(student.mastered);
  if (r.correct) {
    mistakes.delete(r.questionId);
    if (r.cleanFirstTry) mastered.add(r.questionId);
  } else {
    mistakes.add(r.questionId);
    mastered.delete(r.questionId);
  }

  return {
    ...student,
    xp: student.xp + r.xp,
    skills,
    mistakes: [...mistakes].slice(-120),
    mastered: [...mastered],
    hintsUsed: student.hintsUsed + r.hintsUsed,
    totalAnswers: student.totalAnswers + 1,
    totalCorrect: student.totalCorrect + (r.correct ? 1 : 0),
    bestCombo: Math.max(student.bestCombo, r.combo),
    streak: nextStreak(student),
    lastPlayedDay: day,
    history: { ...student.history, [day]: (student.history[day] ?? 0) + r.xp },
  };
}

/** Store the best accuracy reached on a mission, and clear the boss if passed. */
export function applyMissionResult(
  student: Student,
  unitId: string,
  missionKey: string,
  accuracy: number,
  isBoss: boolean,
): Student {
  const prev = student.units[unitId] ?? { missions: {}, bossCleared: false };
  return {
    ...student,
    units: {
      ...student.units,
      [unitId]: {
        missions: { ...prev.missions, [missionKey]: Math.max(prev.missions[missionKey] ?? 0, accuracy) },
        bossCleared: prev.bossCleared || (isBoss && accuracy >= 0.7),
      },
    },
  };
}

export function rename(student: Student, name: string): Student {
  // The id never changes — only the label the class sees.
  return { ...student, name: name.trim().slice(0, 24) || student.name };
}
