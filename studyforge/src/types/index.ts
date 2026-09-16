/*
 * Domain types for StudyForge. Pure data — no React, no storage.
 *
 * The whole product hangs off one idea: nothing the student is shown may be
 * invented. Every concept, every question and every explanation carries a
 * `Citation` back to the exact span of the file she uploaded, and the code that
 * builds them is only ever allowed to copy — never to compose. If you add a
 * field here that holds teaching content, it needs a citation next to it.
 */

export type Lang = 'ar' | 'en';

/** 1 = recall, 2 = applied, 3 = hard. */
export type Difficulty = 1 | 2 | 3;

/** What a question is actually testing — the ladder in section 9 of the brief. */
export type Probe = 'recall' | 'application' | 'discrimination' | 'sequence' | 'value';

export type MasteryState = 'mastered' | 'learning' | 'weak' | 'new';

/* ---------- the reference ---------- */

export type DocKind = 'pdf' | 'docx' | 'pptx' | 'txt' | 'paste';

/** A page of a PDF, a slide of a deck, or one block of a long text file. */
export interface DocPage {
  /** 1-based, as a human would cite it. */
  n: number;
  start: number;
  end: number;
}

export interface SourceDoc {
  id: string;
  name: string;
  kind: DocKind;
  /** The whole extracted text, normalized. Offsets everywhere point into this. */
  text: string;
  pages: DocPage[];
  /** Characters of usable text pulled out — shown in the upload summary. */
  chars: number;
}

/**
 * Where something came from. This is the object that makes the product
 * trustworthy, so it carries enough to both *name* the place and *show* it.
 */
export interface Citation {
  docId: string;
  docName: string;
  /** Page or slide number, when the format has them. */
  page?: number;
  /** Heading path, e.g. "Chapter 2 › Bayes' Theorem". */
  section: string;
  /** The exact sentence(s) the claim rests on — copied, never rewritten. */
  text: string;
  /** Offsets into SourceDoc.text, so "Show source" can highlight in context. */
  start: number;
  end: number;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  /** Position in the reference — the order the student meets them in. */
  order: number;
  docId: string;
  start: number;
  end: number;
}

export type ConceptKind = 'definition' | 'formula' | 'process' | 'fact';

export interface Concept {
  id: string;
  courseId: string;
  chapterId: string;
  /** The term itself, exactly as the reference spells it. */
  term: string;
  /** What the reference says it is — a span of the reference, verbatim. */
  definition: string;
  kind: ConceptKind;
  difficulty: Difficulty;
  /** How central it is to the reference: mentions, normalized 0..1. */
  weight: number;
  citation: Citation;
  /** Other concepts named in this one's own definition. Drives the map. */
  related: string[];
}

/* ---------- questions ---------- */

export type QuestionType = 'mcq' | 'truefalse' | 'blank' | 'match' | 'order' | 'error';

export interface BaseQuestion {
  id: string;
  courseId: string;
  chapterId: string;
  /** The concept this question is evidence about. Mastery is tracked per concept. */
  conceptId: string;
  type: QuestionType;
  probe: Probe;
  difficulty: Difficulty;
  prompt: string;
  /** Why the answer is the answer — assembled out of the reference's own words. */
  explanation: string;
  citation: Citation;
  /** Language of the content (not of the interface). */
  lang: Lang;
}

export interface McqQuestion extends BaseQuestion {
  type: 'mcq' | 'truefalse';
  options: string[];
  answer: number;
}

export interface BlankQuestion extends BaseQuestion {
  type: 'blank';
  /** The prompt contains "____" where the answer goes. */
  accept: string[];
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match';
  pairs: Array<[string, string]>;
}

export interface OrderQuestion extends BaseQuestion {
  type: 'order';
  /** Correct order; the game shuffles a copy. */
  steps: string[];
}

export interface ErrorQuestion extends BaseQuestion {
  type: 'error';
  tokens: string[];
  /** Index of the token that does not belong. */
  answer: number;
  correction: string;
}

export type Question =
  | McqQuestion
  | BlankQuestion
  | MatchQuestion
  | OrderQuestion
  | ErrorQuestion;

/* ---------- the course ---------- */

export type Goal = 'understand' | 'review' | 'exam' | 'mastery';

export interface Course {
  id: string;
  name: string;
  /** Language of the reference material, detected then confirmed by the student. */
  lang: Lang;
  goal: Goal;
  createdAt: number;
  /**
   * True for the shipped sample course. Kept on the record itself, not inferred
   * from the id, so every screen can say plainly that this content is a sample
   * and not something the student uploaded.
   */
  isDemo: boolean;
  docs: SourceDoc[];
  chapters: Chapter[];
  concepts: Concept[];
  questions: Question[];
  /** Questions the validator rejected, kept only as a build statistic. */
  rejected: number;
}

/** Everything but the heavy arrays — what the course list needs. */
export interface CourseSummary {
  id: string;
  name: string;
  lang: Lang;
  goal: Goal;
  createdAt: number;
  isDemo: boolean;
  chapters: number;
  concepts: number;
  questions: number;
  docNames: string[];
}

/* ---------- the learner ---------- */

/** What the app knows about one concept for one student. */
export interface ConceptState {
  /** 0..1. Not an average — it moves up on success and down hard on failure. */
  mastery: number;
  attempts: number;
  correct: number;
  incorrect: number;
  /** Leitner box 0..5; the interval between reviews grows with it. */
  box: number;
  lastReview: number;
  nextReview: number;
  /** Consecutive correct answers — what promotes a box. */
  runningCorrect: number;
  /** Probes already passed, so the same concept is re-asked a different way. */
  probes: Probe[];
}

export interface SessionRecord {
  id: string;
  mode: Mode;
  at: number;
  answered: number;
  correct: number;
  accuracy: number;
  xp: number;
  seconds: number;
  /** Concepts touched, for the "review these" list on the results screen. */
  weak: string[];
  strong: string[];
  chapterId?: string;
}

export interface CourseProgress {
  conceptStates: Record<string, ConceptState>;
  sessions: SessionRecord[];
  /** ISO day -> questions answered, for the daily goal and the streak. */
  daily: Record<string, number>;
  lastPlayed: number;
  bestExam: number;
}

export type Mode = 'quick' | 'chapter' | 'weakness' | 'exam' | 'survival' | 'daily';

export interface Learner {
  id: string;
  name: string;
  /** Interface language. The course keeps its own, from its reference. */
  uiLang: Lang;
  createdAt: number;
  xp: number;
  streak: number;
  lastPlayedDay: string;
  /** Questions per day the student set for herself. */
  dailyGoal: number;
  soundOn: boolean;
  achievements: string[];
  totalAnswers: number;
  totalCorrect: number;
  bestCombo: number;
  courses: Record<string, CourseProgress>;
  /** Per-session play settings the student changed, remembered between rounds. */
  prefs: PlayPrefs;
}

export interface PlayPrefs {
  /** Questions in a quick round. */
  length: number;
  /** null = adaptive, which is the default and the point of the product. */
  fixedDifficulty: Difficulty | null;
  /** Seconds per question, 0 = untimed. */
  perQuestionSeconds: number;
  types: QuestionType[];
  examMinutes: number;
  examLength: number;
}

/* ---------- play ---------- */

export interface ScoreBreakdown {
  label: string;
  xp: number;
}

export interface AnswerRecord {
  questionId: string;
  conceptId: string;
  chapterId: string;
  probe: Probe;
  correct: boolean;
  /** True only when it was right first time with no hint — what mastery needs. */
  clean: boolean;
  xp: number;
  seconds: number;
  hintsUsed: number;
}
