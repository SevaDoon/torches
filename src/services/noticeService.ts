/*
 * The teacher's card above the leaderboard.
 *
 * One shared document, /board/notice, written only by a teacher and read by the
 * whole class (see firestore.rules). It carries who the teacher is, so students
 * see her at the top of the board without her being in the race, and whatever
 * she wants to say to them that day.
 */
import { getDocument, setDocument } from './firestoreRest';

export interface BoardNotice {
  name: string;
  avatar: string;
  text: string;
  updatedAt: number;
}

const DOC = 'notice';

export async function loadNotice(): Promise<BoardNotice | null> {
  try {
    const n = await getDocument<Partial<BoardNotice>>('board', DOC);
    if (!n) return null;
    return {
      name: n.name ?? '',
      avatar: n.avatar ?? '👩‍🏫',
      text: n.text ?? '',
      updatedAt: n.updatedAt ?? 0,
    };
  } catch {
    return null; // offline, or rules not deployed yet — the board still works
  }
}

export async function saveNotice(n: Omit<BoardNotice, 'updatedAt'>): Promise<void> {
  await setDocument('board', DOC, { ...n, text: n.text.slice(0, 280), updatedAt: Date.now() });
}

/* ---------- the class gate ---------- */

/*
 * How far the class is allowed to go, as a unit number. 0 means no ceiling.
 *
 * It lives in its own document rather than alongside the notice because the two
 * are written from different screens, and a REST PATCH replaces the whole
 * document — sharing one would mean the gate quietly wiping her message.
 */
export async function loadGate(): Promise<number> {
  try {
    const g = await getDocument<{ maxUnit?: number }>('board', 'gate');
    return typeof g?.maxUnit === 'number' ? g.maxUnit : 0;
  } catch {
    return 0; // offline: never lock a student out because of a failed read
  }
}

export async function saveGate(maxUnit: number): Promise<void> {
  await setDocument('board', 'gate', { maxUnit, updatedAt: Date.now() });
}
