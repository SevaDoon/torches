/* Creating, loading and updating the student record. Identity lives here. */
import type { Skill, Student } from '../types';
import { driver } from './storage';
import { nextStreak, todayKey } from './progressService';
import * as auth from './authRest';
import { setAuthToken } from './firestoreRest';

const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1 — easier to read aloud

/*
 * The class code. A student needs it once, to create her account: the teacher
 * reads it out in class, so the leaderboard stays the real class and not
 * whoever happens to find the link.
 *
 * ponytail: checked in the browser, so it stops casual and accidental signups,
 * not a determined one. Enforcing it in the Firestore rules would mean storing
 * the code inside every student record - worth doing only if someone actually
 * bothers to bypass this.
 */
export const CLASS_CODE = 'TORCH25';

/** The visitor's record: in memory only, never saved, never ranked. */
export const GUEST_ID = 'guest';

export const isGuest = (student: Student) => student.id === GUEST_ID;

export const AVATARS = ['🔥', '⭐', '🌙', '🚀', '🦋', '🌸', '🐬', '🍀', '💎', '🎨', '📚', '⚡'];

/** TOR-A82F91 — the friendly code shown in the profile. Not the storage key. */
export function generateCode(): string {
  let body = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) body += ID_ALPHABET[b % ID_ALPHABET.length];
  return `TOR-${body}`;
}

export function blankStudent(name: string, id: string): Student {
  return {
    id,
    code: generateCode(),
    name: name.trim() || 'Student',
    createdAt: Date.now(),
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    xp: 0,
    streak: 0,
    lastPlayedDay: '',
    lastUnitId: '',
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
  const blank = blankStudent(s.name, s.id);
  return {
    ...blank,
    ...s,
    code: s.code ?? blank.code,
    skills: { ...blank.skills, ...s.skills },
    units: s.units ?? {},
    achievements: s.achievements ?? [],
    mistakes: s.mistakes ?? [],
    mastered: s.mastered ?? [],
    history: s.history ?? {},
  };
}

export function guestStudent(): Student {
  return { ...blankStudent('Visitor', GUEST_ID), code: 'VISITOR', avatar: '👁' };
}

/** Signs in as the visitor and hands back a record nothing will ever write. */
export async function startGuest(): Promise<Student> {
  const session = await auth.signInVisitor();
  setAuthToken(session.idToken);
  return guestStudent();
}

/**
 * Called once on boot. Turns a saved refresh token back into a live session, so
 * a student who played yesterday lands straight on her own dashboard.
 */
export async function loadCurrentStudent(): Promise<Student | null> {
  const session = await auth.restoreSession();
  if (!session) return null;
  setAuthToken(session.idToken);
  if (auth.isVisitorSession()) return guestStudent();
  const student = await driver.loadStudent(session.uid);
  return student ? migrate(student) : null;
}

/** First time: creates the account. Throws AuthError('EMAIL_EXISTS') if taken. */
export async function registerStudent(
  name: string,
  pin: string,
  classCode: string,
): Promise<Student> {
  if (classCode.trim().toUpperCase() !== CLASS_CODE) throw new Error('BAD_CLASS_CODE');
  const session = await auth.signUp(name, pin);
  setAuthToken(session.idToken);
  const student = blankStudent(name, session.uid);
  await driver.saveStudent(student);
  return student;
}

/** Returning: name + PIN on any device gets the same progress back. */
export async function loginStudent(name: string, pin: string): Promise<Student> {
  const session = await auth.signIn(name, pin);
  setAuthToken(session.idToken);
  const existing = await driver.loadStudent(session.uid);
  if (existing) return migrate(existing);

  // Account exists but the record was never written (interrupted first signup).
  const student = blankStudent(name, session.uid);
  await driver.saveStudent(student);
  return student;
}

export async function persist(student: Student): Promise<void> {
  if (isGuest(student)) return; // a visit leaves nothing behind
  await driver.saveStudent(student);
}

export async function signOut(): Promise<void> {
  auth.forgetSession();
  setAuthToken(null);
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
