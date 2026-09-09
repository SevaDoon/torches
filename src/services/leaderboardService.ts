/*
 * Leaderboard. Ranking is always by student id, never by name, so changing a
 * display name never moves or duplicates a row.
 *
 * ponytail: with the localStorage driver the board can only show students who
 * played on this device, so a small set of demo classmates is mixed in and
 * clearly labelled. Connect a backend driver in storage.ts and the demo rows
 * disappear on their own.
 */
import type { LeaderboardRow, Student } from '../types';
import { driver, weeklyXpOf } from './storage';
import { levelFromXp } from './progressService';

const DEMO_CLASSMATES = [
  { id: 'demo-1', name: 'Sara', avatar: '⭐', xp: 4820, weeklyXp: 640 },
  { id: 'demo-2', name: 'Norah', avatar: '🌙', xp: 4610, weeklyXp: 520 },
  { id: 'demo-3', name: 'Reem', avatar: '🌸', xp: 4420, weeklyXp: 300 },
  { id: 'demo-4', name: 'Hala', avatar: '🦋', xp: 4210, weeklyXp: 710 },
  { id: 'demo-5', name: 'Dana', avatar: '🍀', xp: 3980, weeklyXp: 260 },
  { id: 'demo-6', name: 'Lujain', avatar: '💎', xp: 3420, weeklyXp: 480 },
  { id: 'demo-7', name: 'Maha', avatar: '🎨', xp: 2870, weeklyXp: 190 },
  { id: 'demo-8', name: 'Jood', avatar: '📚', xp: 2240, weeklyXp: 350 },
  { id: 'demo-9', name: 'Aseel', avatar: '⚡', xp: 1580, weeklyXp: 120 },
  { id: 'demo-10', name: 'Ghala', avatar: '🚀', xp: 940, weeklyXp: 210 },
];

export async function loadLeaderboard(me: Student): Promise<LeaderboardRow[]> {
  const roster = await driver.loadRoster();
  const real = roster.map((r) => ({
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    xp: r.xp,
    weeklyXp: r.weeklyXp,
    demo: false,
  }));

  // Always trust the live record for the current student, not the saved snapshot.
  const withoutMe = real.filter((r) => r.id !== me.id);
  const rows = [
    ...withoutMe,
    { id: me.id, name: me.name, avatar: me.avatar, xp: me.xp, weeklyXp: weeklyXpOf(me), demo: false },
    ...DEMO_CLASSMATES.map((c) => ({ ...c, demo: true })),
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
