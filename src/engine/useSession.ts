/*
 * The play loop. Holds the queue, the hint ladder, the retry-after-a-mistake
 * flow, Learning Rescue and the adaptive difficulty. It knows nothing about how
 * a question is drawn on screen — each game component just reports right/wrong.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import type { Difficulty, MissionSpec, MiniLesson, Question, Skill, Student } from '../types';
import { buildPlan, pickQuestion, xpMultiplier } from './missions';
import { nextDifficulty, scoreAnswer } from '../services/progressService';
import type { AnswerRecord } from '../services/studentService';
import { answerTextOf } from '../games';
import { lessonFor } from '../data/curriculum';
import { explanationOf, hintsOf, localizeLesson } from '../data/i18n';
import { ar } from '../i18n/ar';
import { sfx } from '../utils/sound';

export type SessionStatus = 'question' | 'feedback' | 'rescue' | 'done';

export interface Feedback {
  correct: boolean;
  /** True when the student may try the same question once more. */
  retry: boolean;
  xp: number;
  breakdown: Array<{ label: string; xp: number }>;
  message: string;
  /** The right answer, spelled out. Only once the question is over. */
  answer?: string;
}

export interface SessionSummary {
  answered: number;
  correct: number;
  accuracy: number;
  xp: number;
  bestCombo: number;
}

const RESCUE_THRESHOLD = 3;

/*
 * Where a second try is a real second chance. The pairing games end only when
 * every pair has been found, so by then the board has already shown her the
 * answer — replaying one would be memory, not a second think.
 */
const RETRYABLE: ReadonlyArray<Question['type']> = [
  'mcq',
  'truefalse',
  'blank',
  'error',
  'order',
  'picture',
];

/** Hint ladder. The last rung explains the concept — it never states the answer. */
export const HINT_KEYS = ['think', 'remember', 'example', 'eliminate', 'explain'] as const;
export const HINT_LABELS = HINT_KEYS.map((k) => ar.play.hintLabels[k]);

export function maxHintLevel(q: Question): number {
  // Only multiple choice has spare options to eliminate; true/false does not.
  return q.type === 'mcq' ? 5 : 4;
}

/** Hints are read in Arabic; any English inside them is the example itself. */
export function hintText(q: Question, level: number): { label: string; text: string } | null {
  if (level < 1) return null;
  if (level <= 3) {
    // The third hint is authored as "مثال: …" but the label already says it.
    const text = hintsOf(q)[level - 1].replace(/^مثال:\s*/, '');
    return { label: HINT_LABELS[level - 1], text };
  }
  if (q.type === 'mcq' && level === 4) {
    return { label: ar.play.hintLabels.eliminate, text: ar.play.eliminateText };
  }
  return { label: ar.play.hintLabels.explain, text: explanationOf(q) };
}

export function useSession(
  spec: MissionSpec,
  student: Student,
  commit: (record: AnswerRecord) => void,
  finish: (summary: SessionSummary) => void,
) {
  // Built once per mission: rebuilding on every student update would reshuffle mid-play.
  const plan = useMemo(() => buildPlan(spec, student), [spec]); // eslint-disable-line react-hooks/exhaustive-deps
  const multiplier = xpMultiplier(spec.kind);
  const total = Math.min(spec.length, plan.pool.length);

  const used = useRef(new Set<string>());
  const stats = useRef({ answered: 0, correct: 0, xp: 0, bestCombo: 0 });
  const recent = useRef<boolean[]>([]);
  const wrongBySkill = useRef<Record<string, number>>({});
  const rescuedSkills = useRef(new Set<Skill>());
  const started = useRef(Date.now());

  const [slot, setSlot] = useState(0);
  const [target, setTarget] = useState<Difficulty>(1);
  const [question, setQuestion] = useState<Question | undefined>(() => {
    const first = pickQuestion(plan, used.current, 0, 1);
    if (first) used.current.add(first.id);
    return first;
  });
  const [status, setStatus] = useState<SessionStatus>(total === 0 ? 'done' : 'question');
  const [hintLevel, setHintLevel] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [combo, setCombo] = useState(0);
  const [tick, setTick] = useState(0); // forces a re-read of the stats ref for display

  const summary = useCallback(
    (): SessionSummary => ({
      answered: stats.current.answered,
      correct: stats.current.correct,
      accuracy: total === 0 ? 0 : stats.current.correct / total,
      xp: stats.current.xp,
      bestCombo: stats.current.bestCombo,
    }),
    [total],
  );

  const goNext = useCallback(
    (nextTarget: Difficulty) => {
      const nextSlot = slot + 1;
      setHintLevel(0);
      setAttempt(0);
      if (nextSlot >= total) {
        setStatus('done');
        sfx.complete();
        finish(summary());
        return;
      }
      const next = pickQuestion(plan, used.current, nextSlot, nextTarget);
      if (!next) {
        setStatus('done');
        sfx.complete();
        finish(summary());
        return;
      }
      used.current.add(next.id);
      setQuestion(next);
      setSlot(nextSlot);
      setStatus('question');
      started.current = Date.now();
    },
    [slot, total, plan, finish, summary],
  );

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [rescueLesson, setRescueLesson] = useState<MiniLesson | null>(null);

  /** Called by a game component once it knows whether the attempt was right. */
  const answer = useCallback(
    (isCorrect: boolean) => {
      if (!question || status !== 'question') return;
      const seconds = (Date.now() - started.current) / 1000;

      if (isCorrect) {
        const result = scoreAnswer({
          correct: true,
          difficulty: question.difficulty,
          seconds,
          streak: combo,
          hintsUsed: hintLevel,
          multiplier,
          attempt,
        });
        const nextCombo = combo + 1;
        stats.current.answered += 1;
        stats.current.correct += 1;
        stats.current.xp += result.xp;
        stats.current.bestCombo = Math.max(stats.current.bestCombo, nextCombo);
        setCombo(nextCombo);
        setTick((t) => t + 1);
        recent.current = [...recent.current, true].slice(-5);
        setTarget((d) => nextDifficulty(d, recent.current));
        nextCombo >= 3 ? sfx.combo(nextCombo) : sfx.correct();
        commit({
          questionId: question.id,
          skill: question.skill,
          unitId: question.unitId,
          correct: true,
          cleanFirstTry: attempt === 0 && hintLevel === 0,
          xp: result.xp,
          hintsUsed: hintLevel,
          combo: nextCombo,
        });
        setFeedback({
          correct: true,
          retry: false,
          xp: result.xp,
          breakdown: result.breakdown,
          message: explanationOf(question),
        });
        setStatus('feedback');
        return;
      }

      sfx.wrong();
      setCombo(0);

      // First mistake: a nudge, not the answer, and one more try.
      if (attempt === 0 && RETRYABLE.includes(question.type)) {
        setAttempt(1);
        setFeedback({
          correct: false,
          retry: true,
          xp: 0,
          breakdown: [],
          message: hintsOf(question)[1],
        });
        setStatus('feedback');
        return;
      }

      // Second mistake: explain the concept, remember the miss, move on.
      recent.current = [...recent.current, false].slice(-5);
      setTarget((d) => nextDifficulty(d, recent.current));
      stats.current.answered += 1;
      setTick((t) => t + 1);
      wrongBySkill.current[question.skill] = (wrongBySkill.current[question.skill] ?? 0) + 1;
      commit({
        questionId: question.id,
        skill: question.skill,
        unitId: question.unitId,
        correct: false,
        cleanFirstTry: false,
        xp: 0,
        hintsUsed: hintLevel,
        combo: 0,
      });
      setFeedback({
        correct: false,
        retry: false,
        xp: 0,
        breakdown: [],
        // She just got it wrong twice — this is the moment Arabic matters most,
        // and the moment she has earned the answer itself.
        message: explanationOf(question),
        answer: answerTextOf(question),
      });
      setStatus('feedback');
    },
    [question, status, combo, hintLevel, attempt, multiplier, commit],
  );

  /** After feedback: retry the same question, run a rescue, or continue. */
  const advance = useCallback(() => {
    if (!question) return;
    if (feedback?.retry) {
      setFeedback(null);
      setStatus('question');
      started.current = Date.now();
      return;
    }
    setFeedback(null);
    const skill = question.skill;
    if ((wrongBySkill.current[skill] ?? 0) >= RESCUE_THRESHOLD && !rescuedSkills.current.has(skill)) {
      rescuedSkills.current.add(skill);
      wrongBySkill.current[skill] = 0;
      const lesson = lessonFor(question.unitId, skill);
      setRescueLesson(lesson ? localizeLesson(question.unitId, lesson) : null);
      setStatus('rescue');
      return;
    }
    goNext(target);
  }, [question, feedback, goNext, target]);

  const leaveRescue = useCallback(() => {
    setRescueLesson(null);
    // Come back gently after a rescue.
    setTarget(1);
    goNext(1);
  }, [goNext]);

  const revealHint = useCallback(() => {
    if (!question) return;
    setHintLevel((h) => Math.min(maxHintLevel(question), h + 1));
    sfx.hint();
  }, [question]);

  return {
    spec,
    question,
    slot,
    total,
    status,
    hintLevel,
    attempt,
    combo,
    multiplier,
    // `tick` keeps these fresh without duplicating the counters into state.
    stats: { ...stats.current, tick },
    feedback,
    rescueLesson,
    targetDifficulty: target,
    answer,
    advance,
    revealHint,
    leaveRescue,
    quitEarly: () => finish(summary()),
  };
}
