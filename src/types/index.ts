/* Domain types for Torches. Pure data — no React, no storage. */

export type Skill = 'grammar' | 'vocabulary' | 'reading' | 'form';

/** 1 = easy, 2 = medium, 3 = hard */
export type Difficulty = 1 | 2 | 3;

export type QuestionType =
  | 'mcq' // choose one of 3-4 options
  | 'truefalse' // true / false statement
  | 'order' // build the sentence from shuffled chunks
  | 'match' // pair items from two columns
  | 'memory' // memory cards, built from the same pairs as `match`
  | 'blank' // type the missing word
  | 'error' // tap the wrong word in the sentence
  | 'picture' // see a drawing, choose the English word
  | 'picmatch'; // match drawings to their words

export interface BaseQuestion {
  id: string;
  unitId: string;
  skill: Skill;
  difficulty: Difficulty;
  /** Book section this came from, e.g. "3 Grammar" or "9 Reading". */
  lesson: string;
  /** Short concept explanation shown after a wrong answer (never the letter of the answer). */
  explanation: string;
  /** Hint ladder: [Think, Remember, Example]. "Eliminate" and "Explain" are added by the engine. */
  hints: [string, string, string];
  /** Reading passage id this question belongs to (reading skill only). */
  passageId?: string;
}

export interface McqQuestion extends BaseQuestion {
  type: 'mcq' | 'truefalse';
  prompt: string;
  options: string[];
  answer: number;
}

export interface OrderQuestion extends BaseQuestion {
  type: 'order';
  prompt: string;
  /** Correct order. The game shuffles a copy. */
  chunks: string[];
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match' | 'memory';
  prompt: string;
  pairs: Array<[string, string]>;
}

export interface BlankQuestion extends BaseQuestion {
  type: 'blank';
  /** Sentence containing "___" where the answer goes. */
  prompt: string;
  /** All accepted answers, lowercase. First one is the canonical form. */
  accept: string[];
}

export interface ErrorQuestion extends BaseQuestion {
  type: 'error';
  prompt: string;
  /** Sentence split into tappable tokens. */
  tokens: string[];
  /** Index of the incorrect token. */
  answer: number;
  /** What the token should have been. */
  correction: string;
}

export interface PictureQuestion extends BaseQuestion {
  type: 'picture';
  prompt: string;
  /** Key into PICTURES in data/pictures.tsx. */
  pictureId: string;
  options: string[];
  answer: number;
}

export interface PicMatchQuestion extends BaseQuestion {
  type: 'picmatch';
  prompt: string;
  /** [pictureId, English word] — the game shuffles both sides. */
  pairs: Array<[string, string]>;
}

export type Question =
  | McqQuestion
  | OrderQuestion
  | MatchQuestion
  | BlankQuestion
  | ErrorQuestion
  | PictureQuestion
  | PicMatchQuestion;

export interface Passage {
  id: string;
  unitId: string;
  title: string;
  source: string;
  paragraphs: string[];
}

export interface MiniLesson {
  skill: Skill;
  title: string;
  /** Rule statement, straight from the book's grammar box. */
  rule: string;
  examples: string[];
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  /** Book page range, for the teacher's reference. */
  pages: string;
  functions: string[];
  grammar: string[];
  passages: Passage[];
  lessons: MiniLesson[];
  questions: Question[];
}

/* ---------- student & progress ---------- */

export interface SkillStat {
  attempts: number;
  correct: number;
}

export interface UnitProgress {
  /** Mission key -> best accuracy 0..1 */
  missions: Record<string, number>;
  bossCleared: boolean;
}

export interface Student {
  /** Firebase Auth uid — the storage key and what the rules check. */
  id: string;
  /** TOR-A82F91, shown in the profile. Friendly, but never the key. */
  code: string;
  name: string;
  createdAt: number;
  avatar: string;
  xp: number;
  /** Consecutive days played. */
  streak: number;
  lastPlayedDay: string;
  bestCombo: number;
  soundOn: boolean;
  skills: Record<Skill, SkillStat>;
  units: Record<string, UnitProgress>;
  achievements: string[];
  /** Question ids answered wrong and not yet re-mastered. */
  mistakes: string[];
  /** Question ids answered right on the first try, ever. */
  mastered: string[];
  hintsUsed: number;
  totalAnswers: number;
  totalCorrect: number;
  /** XP earned per ISO day, for the "improved this week" ranking. */
  history: Record<string, number>;
}

export interface LeaderboardRow {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  weeklyXp: number;
  isMe: boolean;
}

/* ---------- play session ---------- */

export interface MissionSpec {
  /** Stable key stored in UnitProgress.missions */
  key: string;
  unitId: string;
  skills: Skill[];
  length: number;
  kind: 'skill' | 'mixed' | 'boss' | 'review';
}

export interface AnswerResult {
  correct: boolean;
  xp: number;
  breakdown: Array<{ label: string; xp: number }>;
}
