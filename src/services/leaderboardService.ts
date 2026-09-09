/*
 * Leaderboard. Ranking is always by student id, never by name, so changing a
 * display name never moves or duplicates a row.
 */
import type { LeaderboardRow, Student } from '../types';
import { driver, weeklyXpOf } from './storage';
import { levelFromXp } from './progressService';

export async function loadLeaderboard(me: Student): Promise<LeaderboardRow[]> {
  const roster = await driver.loadRoster();

  // Always trust the live record for the current student, not the saved snapshot.
  const withoutMe = roster.filter((r) => r.id !== me.id);
  const rows = [
    ...withoutMe,
    { id: me.id, name: me.name, avatar: me.avatar, xp: me.xp, weeklyXp: weeklyXpOf(me) },
  ];

  return rows
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))
    .map((r) => ({
      ...r,
      level: levelFromXp(r.xp),
      isMe: r.id === me.id,
    }));
}

export function rankOf(rows: LeaderboardRow[], id: string): number {
  return rows.findIndex((r) => r.id === id) + 1;
}

/** Where the student would sit if the board were ranked by XP earned this week. */
export function weeklyRankOf(rows: LeaderboardRow[], id: string): number {
  return [...rows].sort((a, b) => b.weeklyXp - a.weeklyXp).findIndex((r) => r.id === id) + 1;
}
