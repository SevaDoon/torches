import type { Skill, Student } from '../types';
import { overallAccuracy, skillAccuracy, unitCompletion } from './progressService';
import { units } from '../data/curriculum';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  /** Several kinds of achievement on purpose, so a slower student can still win one. */
  earned: (s: Student) => boolean;
  progress?: (s: Student) => number; // 0..1
}

const skillMaster = (skill: Skill, id: string, icon: string, title: string): Achievement => ({
  id,
  icon,
  title,
  description: `Answer 25 ${skill === 'form' ? 'Form & Meaning' : skill} questions with 80% accuracy.`,
  earned: (s) => s.skills[skill].attempts >= 25 && skillAccuracy(s, skill) >= 0.8,
  progress: (s) => Math.min(1, s.skills[skill].attempts / 25),
});

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-torch',
    icon: '🔥',
    title: 'First Torch',
    description: 'Complete your first challenge.',
    earned: (s) => s.totalAnswers > 0,
  },
  {
    id: 'perfect-round',
    icon: '🎯',
    title: 'Perfect Round',
    description: 'Finish a mission with no mistakes.',
    earned: (s) => Object.values(s.units).some((u) => Object.values(u.missions).some((m) => m >= 1)),
  },
  {
    id: 'speed-runner',
    icon: '⚡',
    title: 'Speed Runner',
    description: 'Build a combo of 5 correct answers in a row.',
    earned: (s) => s.bestCombo >= 5,
    progress: (s) => Math.min(1, s.bestCombo / 5),
  },
  {
    id: 'on-fire',
    icon: '🚀',
    title: 'On Fire',
    description: 'Build a combo of 10 correct answers in a row.',
    earned: (s) => s.bestCombo >= 10,
    progress: (s) => Math.min(1, s.bestCombo / 10),
  },
  {
    id: 'consistent',
    icon: '📚',
    title: 'Most Consistent',
    description: 'Play on 3 different days in a row.',
    earned: (s) => s.streak >= 3,
    progress: (s) => Math.min(1, s.streak / 3),
  },
  {
    id: 'week-streak',
    icon: '🗓️',
    title: 'Seven Days of Fire',
    description: 'Keep a 7-day streak.',
    earned: (s) => s.streak >= 7,
    progress: (s) => Math.min(1, s.streak / 7),
  },
  {
    id: 'accuracy',
    icon: '🎖️',
    title: 'Highest Accuracy',
    description: 'Reach 85% accuracy over at least 50 answers.',
    earned: (s) => s.totalAnswers >= 50 && overallAccuracy(s) >= 0.85,
    progress: (s) => Math.min(1, s.totalAnswers / 50),
  },
  {
    id: 'knowledge-seeker',
    icon: '🧭',
    title: 'Knowledge Seeker',
    description: 'Answer 100 questions.',
    earned: (s) => s.totalAnswers >= 100,
    progress: (s) => Math.min(1, s.totalAnswers / 100),
  },
  skillMaster('grammar', 'grammar-master', '🧠', 'Grammar Master'),
  skillMaster('vocabulary', 'vocab-master', '🔤', 'Vocabulary Master'),
  skillMaster('reading', 'reading-master', '📖', 'Reading Master'),
  skillMaster('form', 'form-master', '🧩', 'Form & Meaning Master'),
  {
    id: 'boss-slayer',
    icon: '👑',
    title: 'Boss Slayer',
    description: 'Clear your first Boss Challenge.',
    earned: (s) => Object.values(s.units).some((u) => u.bossCleared),
  },
  {
    id: 'unit-complete',
    icon: '🏅',
    title: 'Unit Completed',
    description: 'Finish every mission and the boss in one unit.',
    earned: (s) => units.some((u) => unitCompletion(s, u.id) >= 1),
  },
  {
    id: 'half-course',
    icon: '🌟',
    title: 'Halfway Torch',
    description: 'Complete six units of the course.',
    earned: (s) => units.filter((u) => unitCompletion(s, u.id) >= 1).length >= 6,
    progress: (s) => Math.min(1, units.filter((u) => unitCompletion(s, u.id) >= 1).length / 6),
  },
  {
    id: 'comeback',
    icon: '🔁',
    title: 'Rising Torch',
    description: 'Fix 10 questions you once got wrong.',
    earned: (s) => s.mastered.length >= 10 && s.totalAnswers > s.mastered.length,
    progress: (s) => Math.min(1, s.mastered.length / 10),
  },
];

/** Returns the ids newly earned since the last check. */
export function newlyEarned(student: Student): string[] {
  const have = new Set(student.achievements);
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.earned(student)).map((a) => a.id);
}
