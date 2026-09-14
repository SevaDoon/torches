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
