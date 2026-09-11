/*
 * Leaderboard. Ranking is always by student id, never by name, so changing a
 * display name never moves or duplicates a row.
 */
import type { LeaderboardRow, Student } from '../types';
import { driver, weeklyXpOf, type RosterEntry } from './storage';
import { levelFromXp } from './progressService';
import { isGuest } from './studentService';

/**
 * The roster as a ranked board.
 *
 * Two rules live here. The live record wins over the saved snapshot for the
 * student looking at the board, so her own row is never a few answers stale.
 * And a visitor watches the class without joining it — she has no record to
 * rank, and putting her on the board would be putting a guest in the contest.
 */
export function buildRows(roster: RosterEntry[], me: Student): LeaderboardRow[] {
  const rows = isGuest(me)
    ? roster
    : [
        ...roster.filter((r) => r.id !== me.id),
        { id: me.id, name: me.name, avatar: me.avatar, xp: me.xp, weeklyXp: weeklyXpOf(me) },
      ];

  return [...rows]
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))
    .map((r) => ({
      ...r,
      level: levelFromXp(r.xp),
      isMe: r.id === me.id,
    }));
}

export async function loadLeaderboard(me: Student): Promise<LeaderboardRow[]> {
  return buildRows(await driver.loadRoster(), me);
}

export function rankOf(rows: LeaderboardRow[], id: string): number {
  return rows.findIndex((r) => r.id === id) + 1;
}

/** Where the student would sit if the board were ranked by XP earned this week. */
export function weeklyRankOf(rows: LeaderboardRow[], id: string): number {
  return [...rows].sort((a, b) => b.weeklyXp - a.weeklyXp).findIndex((r) => r.id === id) + 1;
}
