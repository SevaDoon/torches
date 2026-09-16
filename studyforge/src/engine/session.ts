/*
 * One play-through: which questions, in what order, at what difficulty, and
 * what happens after each answer.
 *
 * The rules it implements, in the order they matter:
 *  - need first. A concept that is weak or due for review outranks a new one,
 *    which outranks one already mastered.
 *  - a different question for the same idea. If she has already passed the
 *    recall probe on a concept, the next one asks her to apply it or tell it
 *    apart, because answering "what is X" twice proves nothing new.
 *  - adapt. Three right in a row raises the difficulty, two wrong lowers it.
 *  - rescue. Three misses on one concept stops the round and teaches it.
 *  - come back to it. A concept missed here is re-asked later in this same
 *    session, before the day-scale schedule ever gets involved.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  AnswerRecord,
  Chapter,
  Concept,
  Course,
  CourseProgress,
  Difficulty,
  Mode,
  PlayPrefs,
  Probe,
  Question,
  ScoreBreakdown,
} from '../types';
import {
  conceptState,
  dueConcepts,
  multiplierOf,
  nextDifficulty,
  scoreAnswer,
  stateOf,
  weakConcepts,
} from '../services/progress';
import { findTerm, normalizeTerm, seededShuffle } from './text';

/* ---------- planning ---------- */

export interface SessionPlan {
  mode: Mode;
  course: Course;
  chapter?: Chapter;
  pool: Question[];
  length: number;
  /** questionId -> 0 most needed … 3 least. */
  need: Map<string, number>;
  /** Set when the student has turned the adaptive ladder off in settings. */
  fixedDifficulty: Difficulty | null;
  perQuestionSeconds: number;
  totalSeconds: number;
  /** Concepts the weakness hunter named on the way in, for the intro screen. */
  targets: Concept[];
}

export interface PlanInput {
  mode: Mode;
  course: Course;
  progress: CourseProgress;
  prefs: PlayPrefs;
  chapterId?: string;
  /** Exam only; falls back to the saved preference. */
  length?: number;
  minutes?: number;
}

const LENGTHS: Record<Mode, number> = {
  quick: 8,
  chapter: 10,
  weakness: 8,
  exam: 20,
  survival: 50,
  daily: 7,
};

export function planSession(input: PlanInput): SessionPlan | null {
  const { course, progress, prefs } = input;
  const byType = course.questions.filter((q) => prefs.types.includes(q.type));
  // Never leave a mode unplayable because of a settings toggle: if the filter
  // has emptied the course, fall back to everything rather than to nothing.
  const all = byType.length >= 4 ? byType : course.questions;

  const need = needRanking(course.concepts, progress);
  let pool = all;
  let chapter: Chapter | undefined;
  let targets: Concept[] = [];

  switch (input.mode) {
    case 'chapter': {
      chapter = course.chapters.find((c) => c.id === input.chapterId);
      if (!chapter) return null;
      pool = all.filter((q) => q.chapterId === chapter!.id);
      break;
    }
    case 'weakness': {
      targets = [...weakConcepts(course.concepts, progress), ...dueConcepts(course.concepts, progress)]
        .filter((c, i, list) => list.findIndex((x) => x.id === c.id) === i)
        .slice(0, 8);
      if (targets.length === 0) return null;
      const ids = new Set(targets.map((c) => c.id));
      pool = all.filter((q) => ids.has(q.conceptId));
      break;
    }
    case 'daily': {
      const due = dueConcepts(course.concepts, progress);
      const weak = weakConcepts(course.concepts, progress);
      const fresh = course.concepts
        .filter((c) => conceptState(progress, c.id).attempts === 0)
        .sort((a, b) => b.weight - a.weight);
      // Due work first, then weak spots, then something new — so a daily review
      // is never only revision and never only new material.
      targets = [...due, ...weak, ...fresh].filter((c, i, l) => l.findIndex((x) => x.id === c.id) === i);
      const ids = new Set(targets.slice(0, 14).map((c) => c.id));
      pool = all.filter((q) => ids.has(q.conceptId));
      break;
    }
    case 'exam':
      pool = examSpread(all, course.chapters, input.length ?? prefs.examLength);
      break;
    default:
      pool = all;
  }

  if (pool.length === 0) return null;

  const length =
    input.mode === 'exam'
      ? Math.min(input.length ?? prefs.examLength, pool.length)
      : input.mode === 'quick'
        ? Math.min(prefs.length, pool.length)
        : Math.min(LENGTHS[input.mode], pool.length);

  return {
    mode: input.mode,
    course,
    chapter,
    pool,
    length: Math.max(1, length),
    need,
    fixedDifficulty: prefs.fixedDifficulty,
    perQuestionSeconds: input.mode === 'exam' ? 0 : prefs.perQuestionSeconds,
    totalSeconds: input.mode === 'exam' ? (input.minutes ?? prefs.examMinutes) * 60 : 0,
    targets,
  };
}

function needRanking(concepts: Concept[], progress: CourseProgress): Map<string, number> {
  const now = Date.now();
  const byConcept = new Map<string, number>();
  for (const c of concepts) {
    const s = conceptState(progress, c.id);
    const state = stateOf(s);
    const due = s.attempts > 0 && s.nextReview <= now;
    byConcept.set(c.id, state === 'weak' || due ? 0 : state === 'new' ? 1 : state === 'learning' ? 2 : 3);
  }
  return byConcept;
}

/**
 * An exam has to look like the course. Chapters get a share of the paper in
 * proportion to how much of the reference they are, which is the closest thing
 * to "the way the material is weighted" that the document itself tells us.
 */
function examSpread(pool: Question[], chapters: Chapter[], length: number): Question[] {
  const sizes = chapters.map((c) => ({ id: c.id, size: Math.max(1, c.end - c.start) }));
  const total = sizes.reduce((s, c) => s + c.size, 0) || 1;
  const out: Question[] = [];

  for (const { id, size } of sizes) {
    const share = Math.max(1, Math.round((size / total) * length));
    const mine = seededShuffle(pool.filter((q) => q.chapterId === id), id + 'exam');
    out.push(...mine.slice(0, share));
  }
  // Top up from anywhere if rounding left the paper short.
  for (const q of pool) {
    if (out.length >= length * 1.5) break;
    if (!out.includes(q)) out.push(q);
  }
  return out;
}

export function examDistribution(plan: SessionPlan): Array<{ chapter: Chapter; count: number }> {
  return plan.course.chapters
    .map((chapter) => ({
      chapter,
      count: plan.pool.slice(0, plan.length).filter((q) => q.chapterId === chapter.id).length,
    }))
    .filter((r) => r.count > 0);
}

/* ---------- hints ---------- */

export const HINT_LEVELS = 4;

export interface Hint {
  key: 'think' | 'locate' | 'recall' | 'explain';
  /** Already masked: a hint never contains the answer it is a hint for. */
  text: string;
}

/** The answer, spelled out — only ever shown once the question is over. */
export function answerTextOf(q: Question): string {
  switch (q.type) {
    case 'mcq':
    case 'truefalse':
      return q.options[q.answer] ?? '';
    case 'blank':
      return q.accept[0] ?? '';
    case 'error':
      return q.correction;
    case 'order':
      return q.steps.join(' → ');
    case 'match':
      return q.pairs.map(([a, b]) => `${a} — ${b}`).join(' · ');
  }
}

/**
 * Take the answer out of a piece of text.
 *
 * A hint that contains its own answer is not a hint, and the ways that happens
 * here are not obvious: on "which term is this?" the answer *is* the concept's
 * term, and an option is often a clamped definition ending in an ellipsis, so
 * the exact option string never appears in the source. Both are handled by
 * masking every phrasing of the answer, not just the one on the button.
 */
function maskAll(text: string, hide: string[]): string {
  let out = text;
  for (const raw of hide) {
    const phrase = raw.replace(/…+\s*$/, '').trim();
    if (phrase.length < 4) continue;
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), '…');
  }
  return out;
}

/** How much real text a hint still carries once the answer is taken out. */
const residue = (text: string) => text.replace(/…/g, ' ').replace(/\s+/g, ' ').trim().length;

export function hintFor(q: Question, concept: Concept | undefined, level: number): Hint | null {
  if (level < 1) return null;
  /*
   * Everything that would give the answer away, in every form it takes. The
   * joined answer text is not enough on its own: an ordering question's answer
   * is its steps with arrows between them, a string that appears nowhere in the
   * document — so the source paragraph would sail through unmasked with all
   * five steps in order.
   */
  const hide = [
    answerTextOf(q),
    concept?.definition ?? '',
    ...(q.type === 'order' ? q.steps : []),
    ...(q.type === 'match' ? q.pairs.flat() : []),
  ];
  // The first segment of the heading path is the chapter: the safest thing we
  // can always say, since it locates the idea without describing it.
  const chapter = (q.citation.section || q.citation.docName).split(' › ')[0];

  if (level === 1) {
    const term = normalizeTerm(concept?.term ?? '');
    // Containment, not equality: "descriptive statistics" gives away an answer
    // of "statistics" just as surely as repeating it would.
    const overlaps = hide.some((raw) => {
      const other = normalizeTerm(raw.replace(/…+\s*$/, ''));
      return other.length > 3 && term.length > 3 && (other.includes(term) || term.includes(other));
    });
    const safe = term && !overlaps && !findTerm(q.prompt, concept!.term);
    // Even the fallback is masked: a chapter called "Introduction to
    // Statistics" hands over an answer of "statistics" for free.
    return { key: 'think', text: maskAll(safe ? concept!.term : chapter, hide) };
  }

  if (level === 2) {
    const where = [q.citation.section, q.citation.page ? `#${q.citation.page}` : '']
      .filter(Boolean)
      .join(' · ');
    return { key: 'locate', text: maskAll(where || q.citation.docName, hide) };
  }

  const key = level === 3 ? 'recall' : 'explain';
  const masked = maskAll(level === 3 ? concept?.definition ?? q.citation.text : q.citation.text, hide);
  // Once the answer is removed there is sometimes nothing left worth showing —
  // on "what does X mean?", the definition *is* the answer.
  return { key, text: residue(masked) >= 14 ? masked : maskAll(chapter, hide) };
}

/* ---------- the loop ---------- */

export type Status = 'question' | 'feedback' | 'rescue' | 'done';

export interface Feedback {
  correct: boolean;
  /** She may try this same question once more. */
  retry: boolean;
  xp: number;
  breakdown: ScoreBreakdown[];
  given?: string;
  /** Spelled out only once the question is truly over. */
  answer?: string;
  /** The reference's own sentence. Never our words. */
  source: string;
}

export interface Summary {
  answered: number;
  correct: number;
  accuracy: number;
  xp: number;
  seconds: number;
  bestCombo: number;
  /** Concept ids, for the results screen and the recommendation. */
  weak: string[];
  strong: string[];
  /** Survival only: how far she got. */
  survived: number;
}

/** Pairing games show the board as it is solved, so a replay would be memory. */
const RETRYABLE: ReadonlyArray<Question['type']> = ['mcq', 'truefalse', 'blank', 'error'];

const RESCUE_AT = 3;
/** How many questions later a missed concept comes back inside this session. */
const REASK_GAP = 4;

export function useSession(
  plan: SessionPlan,
  progress: CourseProgress,
  commit: (record: AnswerRecord) => void,
  finish: (summary: Summary) => void,
) {
  const conceptsById = useMemo(
    () => new Map(plan.course.concepts.map((c) => [c.id, c])),
    [plan.course.concepts],
  );

  const used = useRef(new Set<string>());
  const stats = useRef({ answered: 0, correct: 0, xp: 0, bestCombo: 0, survived: 0 });
  const recent = useRef<boolean[]>([]);
  const wrongByConcept = useRef<Record<string, number>>({});
  const rescued = useRef(new Set<string>());
  const reask = useRef<Array<{ at: number; conceptId: string }>>([]);
  const forced = useRef<Question[]>([]);
  const results = useRef(new Map<string, boolean>());
  const startedAt = useRef(Date.now());
  const questionAt = useRef(Date.now());

  const [slot, setSlot] = useState(0);
  const [target, setTarget] = useState<Difficulty>(startingDifficulty(plan));
  const [question, setQuestion] = useState<Question | undefined>(() => {
    const first = pick(plan, progress, used.current, startingDifficulty(plan), null);
    if (first) used.current.add(first.id);
    return first;
  });
  const [status, setStatus] = useState<Status>(question ? 'question' : 'done');
  const [hintLevel, setHintLevel] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [rescueConcept, setRescueConcept] = useState<Concept | null>(null);
  const [tick, setTick] = useState(0);

  const total = plan.mode === 'survival' ? plan.length : Math.min(plan.length, plan.pool.length);

  const summary = useCallback((): Summary => {
    const weak: string[] = [];
    const strong: string[] = [];
    for (const [conceptId, ok] of results.current) (ok ? strong : weak).push(conceptId);
    return {
      answered: stats.current.answered,
      correct: stats.current.correct,
      accuracy: stats.current.answered === 0 ? 0 : stats.current.correct / stats.current.answered,
      xp: stats.current.xp,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      bestCombo: stats.current.bestCombo,
      weak,
      strong,
      survived: stats.current.survived,
    };
  }, []);

  const end = useCallback(() => {
    setStatus('done');
    finish(summary());
  }, [finish, summary]);

  const goNext = useCallback(
    (nextTarget: Difficulty) => {
      const nextSlot = slot + 1;
      setHintLevel(0);
      setAttempt(0);
      if (nextSlot >= total) return end();

      // Survival raises its own floor as it goes, whatever the ladder says.
      const wantedDifficulty =
        plan.mode === 'survival' ? survivalDifficulty(stats.current.answered) : nextTarget;
      const forcedNext = forced.current.shift();
      const wanted = reask.current.find((r) => r.at <= nextSlot);
      const next =
        forcedNext ??
        pick(plan, progress, used.current, wantedDifficulty, wanted?.conceptId ?? null);
      if (!next) return end();
      if (wanted && next.conceptId === wanted.conceptId) {
        reask.current = reask.current.filter((r) => r !== wanted);
      }

      used.current.add(next.id);
      setQuestion(next);
      setSlot(nextSlot);
      setStatus('question');
      questionAt.current = Date.now();
    },
    [slot, total, plan, progress, conceptsById, end],
  );

  const answer = useCallback(
    (isCorrect: boolean, given?: string) => {
      if (!question || status !== 'question') return;
      const seconds = (Date.now() - questionAt.current) / 1000;
      const concept = conceptsById.get(question.conceptId);

      if (isCorrect) {
        const scored = scoreAnswer({
          correct: true,
          difficulty: question.difficulty,
          seconds,
          combo,
          hintsUsed: hintLevel,
          multiplier: multiplierOf(plan.mode),
          attempt,
        });
        const nextCombo = combo + 1;
        stats.current.answered += 1;
        stats.current.correct += 1;
        stats.current.survived += 1;
        stats.current.xp += scored.xp;
        stats.current.bestCombo = Math.max(stats.current.bestCombo, nextCombo);
        setCombo(nextCombo);
        setTick((t) => t + 1);
        recent.current = [...recent.current, true].slice(-5);
        if (!plan.fixedDifficulty) setTarget((d) => nextDifficulty(d, recent.current));
        // A concept only counts as strong here if it was not already missed.
        if (!results.current.has(question.conceptId)) results.current.set(question.conceptId, true);

        commit(recordOf(question, true, attempt === 0 && hintLevel === 0, scored.xp, seconds, hintLevel));
        setFeedback({
          correct: true,
          retry: false,
          xp: scored.xp,
          breakdown: scored.breakdown,
          given,
          source: question.citation.text,
        });
        setStatus('feedback');
        return;
      }

      setCombo(0);

      // First miss: a nudge and one more try — except in survival, where a
      // miss is the end of the run, and that is the whole tension of the mode.
      if (attempt === 0 && plan.mode !== 'survival' && RETRYABLE.includes(question.type)) {
        setAttempt(1);
        setFeedback({
          correct: false,
          retry: true,
          xp: 0,
          breakdown: [],
          given,
          // Where to look, not what it says: on a second attempt the masked
          // definition is usually masked down to nothing anyway, because for
          // half the question types the definition *is* the answer.
          source: hintFor(question, concept, 2)?.text ?? question.citation.section,
        });
        setStatus('feedback');
        return;
      }

      recent.current = [...recent.current, false].slice(-5);
      if (!plan.fixedDifficulty) setTarget((d) => nextDifficulty(d, recent.current));
      stats.current.answered += 1;
      setTick((t) => t + 1);
      results.current.set(question.conceptId, false);
      wrongByConcept.current[question.conceptId] = (wrongByConcept.current[question.conceptId] ?? 0) + 1;
      // Bring this idea back before the session ends, not just tomorrow.
      if (!reask.current.some((r) => r.conceptId === question.conceptId)) {
        reask.current.push({ at: slot + REASK_GAP, conceptId: question.conceptId });
      }

      commit(recordOf(question, false, false, 0, seconds, hintLevel));
      setFeedback({
        correct: false,
        retry: false,
        xp: 0,
        breakdown: [],
        given,
        answer: answerTextOf(question),
        source: question.citation.text,
      });
      setStatus('feedback');
    },
    [question, status, combo, hintLevel, attempt, plan.mode, commit, conceptsById, slot],
  );

  /** After feedback: retry the same question, run a rescue, or move on. */
  const advance = useCallback(() => {
    if (!question) return;
    if (feedback?.retry) {
      setFeedback(null);
      setStatus('question');
      questionAt.current = Date.now();
      return;
    }

    const wasWrong = feedback?.correct === false;
    setFeedback(null);

    if (plan.mode === 'survival' && wasWrong) return end();

    const conceptId = question.conceptId;
    if ((wrongByConcept.current[conceptId] ?? 0) >= RESCUE_AT && !rescued.current.has(conceptId)) {
      rescued.current.add(conceptId);
      wrongByConcept.current[conceptId] = 0;
      const concept = conceptsById.get(conceptId);
      if (concept) {
        // The rescue ends with easy → medium → applied on the same concept.
        forced.current = plan.pool
          .filter((q) => q.conceptId === conceptId && !used.current.has(q.id))
          .sort((a, b) => a.difficulty - b.difficulty)
          .slice(0, 3);
        setRescueConcept(concept);
        setStatus('rescue');
        return;
      }
    }
    goNext(target);
  }, [question, feedback, plan, conceptsById, goNext, target, end]);

  const leaveRescue = useCallback(() => {
    setRescueConcept(null);
    // Come back gently: the forced questions start at the bottom of the ladder.
    setTarget(plan.fixedDifficulty ?? 1);
    goNext(1);
  }, [goNext]);

  const revealHint = useCallback(() => {
    setHintLevel((h) => Math.min(HINT_LEVELS, h + 1));
  }, []);

  /** "Test me on this again" — the same promise the engine keeps after a miss. */
  const requestReask = useCallback(
    (conceptId: string) => {
      if (!reask.current.some((r) => r.conceptId === conceptId)) {
        reask.current.push({ at: slot + REASK_GAP, conceptId });
      }
    },
    [slot],
  );

  /** Time ran out on this question: treated exactly as a wrong answer. */
  const timeOut = useCallback(() => {
    if (status === 'question') answer(false);
  }, [status, answer]);

  const concept = question ? conceptsById.get(question.conceptId) : undefined;

  return {
    plan,
    question,
    concept,
    slot,
    total,
    status,
    hintLevel,
    hint: question ? hintFor(question, concept, hintLevel) : null,
    /** MCQ only, at the last hint: one wrong option is struck out. */
    eliminated: eliminatedIndex(question, hintLevel),
    attempt,
    combo,
    stats: { ...stats.current, tick },
    feedback,
    rescueConcept,
    targetDifficulty: target,
    answer,
    advance,
    revealHint,
    requestReask,
    leaveRescue,
    timeOut,
    quit: () => finish(summary()),
  };
}

function recordOf(
  q: Question,
  correct: boolean,
  clean: boolean,
  xp: number,
  seconds: number,
  hintsUsed: number,
): AnswerRecord {
  return {
    questionId: q.id,
    conceptId: q.conceptId,
    chapterId: q.chapterId,
    probe: q.probe,
    correct,
    clean,
    xp,
    seconds,
    hintsUsed,
  };
}

function startingDifficulty(plan: SessionPlan): Difficulty {
  // A fixed difficulty is a deliberate choice in settings; the ladder is off.
  if (plan.fixedDifficulty) return plan.fixedDifficulty;
  if (plan.mode === 'exam') return 2;
  if (plan.mode === 'survival') return 1;
  return plan.course.goal === 'exam' ? 2 : 1;
}

function eliminatedIndex(q: Question | undefined, hintLevel: number): number | null {
  if (!q || q.type !== 'mcq' || hintLevel < HINT_LEVELS) return null;
  const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer);
  return wrong.length ? wrong[0] : null;
}

/**
 * The next question: the one she most needs, asked a way she has not passed
 * yet, at the difficulty she is ready for — in that order of priority.
 *
 * Need has to come first and difficulty may only break ties inside it.
 * Choosing on difficulty first quietly ignores the ranking, which is how a
 * replayed round ends up serving the same questions she already answered.
 */
function pick(
  plan: SessionPlan,
  progress: CourseProgress,
  used: Set<string>,
  target: Difficulty,
  wantConcept: string | null,
): Question | undefined {
  let candidates = plan.pool.filter((q) => !used.has(q.id));
  if (candidates.length === 0) {
    // Survival outlives its own pool; let it come round again rather than stop.
    if (plan.mode !== 'survival') return undefined;
    used.clear();
    candidates = [...plan.pool];
  }

  if (wantConcept) {
    const again = candidates.filter((q) => q.conceptId === wantConcept);
    if (again.length) candidates = again;
  }

  const rank = (q: Question) => plan.need.get(q.conceptId) ?? 1;
  const mostNeeded = Math.min(...candidates.map(rank));
  let tier = candidates.filter((q) => rank(q) === mostNeeded);

  // Prefer a probe this concept has not been passed on: the same idea asked a
  // different way is the difference between understanding and memorising.
  const fresh = tier.filter((q) => {
    const state = progress.conceptStates[q.conceptId];
    return !state || !state.probes.includes(q.probe as Probe);
  });
  if (fresh.length) tier = fresh;

  return tier.reduce((best, q) =>
    Math.abs(q.difficulty - target) < Math.abs(best.difficulty - target) ? q : best,
  );
}

/** Survival raises the floor every few questions, regardless of accuracy. */
export function survivalDifficulty(answered: number): Difficulty {
  return Math.min(3, 1 + Math.floor(answered / 5)) as Difficulty;
}

/**
 * What "Challenge me" should open.
 *
 * The order is the order a tutor would use: clear the debt first (concepts due
 * for review, then weak ones), then teach what has not been met, and only when
 * there is nothing owed does it hand her the exam.
 */
export function recommend(
  course: Course,
  progress: CourseProgress,
): { mode: Mode; chapterId?: string; reason: 'weak' | 'due' | 'new' | 'ready' } {
  const due = dueConcepts(course.concepts, progress);
  const weak = weakConcepts(course.concepts, progress);

  if (weak.length >= 3) return { mode: 'weakness', reason: 'weak' };
  if (due.length >= 3) return { mode: 'daily', reason: 'due' };

  const untouched = course.chapters.find((chapter) =>
    course.concepts
      .filter((c) => c.chapterId === chapter.id)
      .every((c) => conceptState(progress, c.id).attempts === 0),
  );
  if (untouched) return { mode: 'chapter', chapterId: untouched.id, reason: 'new' };

  if (weak.length > 0) return { mode: 'weakness', reason: 'weak' };
  if (due.length > 0) return { mode: 'daily', reason: 'due' };
  return { mode: 'exam', reason: 'ready' };
}
