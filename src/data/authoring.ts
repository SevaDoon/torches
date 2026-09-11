/*
 * Compact authoring helpers for the curriculum data files.
 *
 * The point: a question in `unitNN.ts` should read like a question, not like a
 * 12-line object literal. Everything here is pure — it just expands short input
 * into the full `Question` shape the engine consumes.
 */
import type {
  BlankQuestion,
  Difficulty,
  ErrorQuestion,
  MatchQuestion,
  McqQuestion,
  OrderQuestion,
  PicMatchQuestion,
  PictureQuestion,
  Question,
  Skill,
} from '../types';

type Hints = [string, string, string];

interface Common {
  d?: Difficulty;
  ex: string;
  h: Hints;
  s?: Skill;
  l?: string;
  p?: string; // passage id
}

/**
 * `idPrefix` lets a second file add questions to a unit without colliding with
 * the ids already generated in that unit's own file.
 */
export function builder(unitId: string, idPrefix = unitId) {
  let seq = 0;
  let skill: Skill = 'grammar';
  let lesson = '3 Grammar';
  let passageId: string | undefined;
  const out: Question[] = [];

  const base = (c: Common) => ({
    id: `${idPrefix}-q${String(++seq).padStart(3, '0')}`,
    unitId,
    skill: c.s ?? skill,
    difficulty: (c.d ?? 2) as Difficulty,
    lesson: c.l ?? lesson,
    explanation: c.ex,
    hints: c.h,
    passageId: c.p ?? passageId,
  });

  const api = {
    /** Set defaults for every question authored after this call. */
    section(s: Skill, l: string, p?: string) {
      skill = s;
      lesson = l;
      passageId = p;
      return api;
    },

    /** Multiple choice. `a` is the index of the correct option. */
    mc(q: { q: string; o: string[]; a: number } & Common) {
      out.push({ ...base(q), type: 'mcq', prompt: q.q, options: q.o, answer: q.a } as McqQuestion);
      return api;
    },

    /** True / False. `a` is true when the statement is true. */
    tf(q: { q: string; a: boolean } & Common) {
      out.push({
        ...base(q),
        type: 'truefalse',
        prompt: q.q,
        options: ['True', 'False'],
        answer: q.a ? 0 : 1,
      } as McqQuestion);
      return api;
    },

    /** Sentence builder. `c` is the chunk list in the correct order. */
    ord(q: { q: string; c: string[] } & Common) {
      out.push({ ...base(q), type: 'order', prompt: q.q, chunks: q.c } as OrderQuestion);
      return api;
    },

    /** Match two columns. */
    mat(q: { q: string; pairs: Array<[string, string]> } & Common) {
      out.push({ ...base(q), type: 'match', prompt: q.q, pairs: q.pairs } as MatchQuestion);
      return api;
    },

    /** Memory cards — same data shape as `mat`, different game. */
    mem(q: { q: string; pairs: Array<[string, string]> } & Common) {
      out.push({ ...base(q), type: 'memory', prompt: q.q, pairs: q.pairs } as MatchQuestion);
      return api;
    },

    /** Name the photo. `pic` is a key from data/pictures.tsx. */
    pic(q: { pic: string; o: string[]; a: number } & Common) {
      out.push({
        ...base(q),
        type: 'picture',
        prompt: 'What is this?',
        pictureId: q.pic,
        options: q.o,
        answer: q.a,
      } as PictureQuestion);
      return api;
    },

    /** Match photos to words. Each pair is [pictureId, word]. */
    picmat(q: { pairs: Array<[string, string]> } & Common) {
      out.push({
        ...base(q),
        type: 'picmatch',
        prompt: 'Match each picture with its word.',
        pairs: q.pairs,
      } as PicMatchQuestion);
      return api;
    },

    /** Type the missing word. Use "___" in the prompt. */
    blk(q: { q: string; a: string[] } & Common) {
      out.push({
        ...base(q),
        type: 'blank',
        prompt: q.q,
        accept: q.a.map((x) => x.toLowerCase()),
      } as BlankQuestion);
      return api;
    },

    /** Tap the wrong word. `t` is the token list, `a` the bad token index. */
    err(q: { t: string[]; a: number; fix: string } & Common) {
      out.push({
        ...base(q),
        type: 'error',
        prompt: 'Tap the word that is wrong.',
        tokens: q.t,
        answer: q.a,
        correction: q.fix,
      } as ErrorQuestion);
      return api;
    },

    done: () => out,
  };

  return api;
}
