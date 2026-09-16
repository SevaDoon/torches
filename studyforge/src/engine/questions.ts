/*
 * Building questions out of the reference.
 *
 * THE RULE OF THIS FILE: a generator may only copy spans of the student's
 * document and place them into a fixed frame. It may never write a fact. The
 * only sentences here that are ours are the stems ("What does X mean?"), and
 * they are questions, not claims.
 *
 * Because of that rule, a question cannot be wrong in the way a generated
 * question usually is — it can only be *bad*: ambiguous, leaky, or trivially
 * guessable. Those are what `validate.ts` throws away afterwards.
 *
 * Note the stems below are in the language of the *reference*, not of the
 * interface. A student reading Arabic menus over an English textbook must not
 * be handed half-Arabic English questions.
 */
import type {
  Chapter,
  Citation,
  Concept,
  Difficulty,
  Lang,
  Question,
  SourceDoc,
} from '../types';
import { citationFor } from './concepts';
import { chapterAt, type Outline } from './structure';
import {
  clamp,
  contentWords,
  findTerm,
  normalizeTerm,
  seededShuffle,
  splitBlocks,
  splitSentences,
  type Span,
} from './text';

/* ---------- stems, in the reference's language ---------- */

const PHRASES = {
  en: {
    define: (t: string) => `What does "${t}" mean, according to your reference?`,
    whichTerm: (d: string) => `Which term does your reference describe as: "${d}"?`,
    trueFalse: 'According to your reference, is this statement true?',
    blank: 'Complete the sentence from your reference.',
    match: 'Pair each term with what your reference says about it.',
    order: 'Put these steps in the order your reference gives them.',
    error: 'One word here does not belong. Which one?',
    why: (clause: string) => `According to your reference, why ${clause}?`,
    value: (t: string) => `What value does your reference give for ${t}?`,
    true: 'True',
    false: 'False',
  },
  ar: {
    define: (t: string) => `ماذا يقصد بـ«${t}» وفق مرجعك؟`,
    whichTerm: (d: string) => `أي مصطلح يصفه مرجعك بأنه: «${d}»؟`,
    trueFalse: 'هل هذه العبارة صحيحة وفق مرجعك؟',
    blank: 'أكمل العبارة كما وردت في مرجعك.',
    match: 'اربط كل مصطلح بما يقوله عنه مرجعك.',
    order: 'رتّب هذه الخطوات كما وردت في مرجعك.',
    error: 'كلمة واحدة هنا لا تنتمي. أيها؟',
    why: (clause: string) => `وفق مرجعك، لماذا ${clause}؟`,
    value: (t: string) => `ما القيمة التي يذكرها مرجعك لـ${t}؟`,
    true: 'صحيحة',
    false: 'خاطئة',
  },
} as const;

/* ---------- entry point ---------- */

export interface GenInput {
  courseId: string;
  lang: Lang;
  docs: SourceDoc[];
  outline: Outline;
  concepts: Concept[];
}

export function generateQuestions(input: GenInput): Question[] {
  const out: Question[] = [];
  const byChapter = new Map<string, Concept[]>();
  for (const c of input.concepts) {
    const list = byChapter.get(c.chapterId) ?? [];
    list.push(c);
    byChapter.set(c.chapterId, list);
  }

  input.concepts.forEach((concept, i) => {
    const siblings = (byChapter.get(concept.chapterId) ?? []).filter((c) => c.id !== concept.id);
    const others = input.concepts.filter((c) => c.id !== concept.id);
    const pool = siblings.length >= 3 ? siblings : others;

    push(out, defineMcq(input, concept, pool));
    push(out, termMcq(input, concept, pool));
    // Alternate so a course does not become a wall of statements that are all
    // true, which teaches a student to answer "true" without reading.
    push(out, trueFalse(input, concept, pool, i % 2 === 0));
    push(out, blankFromSentence(input, concept));
    push(out, errorHunt(input, concept, pool));
    push(out, valueMcq(input, concept, pool));
  });

  for (const chapter of input.outline.chapters) {
    const mine = byChapter.get(chapter.id) ?? [];
    push(out, matchSet(input, chapter, mine));
    push(out, orderSteps(input, chapter, mine));
  }

  out.push(...whyQuestions(input));

  return out;
}

function push(out: Question[], q: Question | null) {
  if (q) out.push(q);
}

/* ---------- helpers ---------- */

/**
 * A definition that contains its own term gives the answer away the moment it
 * is put next to three that do not. Every generator that shows definitions as
 * options checks this first.
 */
const leaks = (concept: Concept) => !!findTerm(concept.definition, concept.term);

function distractors(pool: Concept[], concept: Concept, n: number, seed: string): Concept[] {
  const usable = pool.filter(
    (c) =>
      normalizeTerm(c.term) !== normalizeTerm(concept.term) &&
      normalizeTerm(c.definition) !== normalizeTerm(concept.definition) &&
      !leaks(c),
  );
  // Same chapter first: a distractor from a different topic is not a distractor.
  const near = usable.filter((c) => c.chapterId === concept.chapterId);
  const far = usable.filter((c) => c.chapterId !== concept.chapterId);
  return [...seededShuffle(near, seed), ...seededShuffle(far, seed)].slice(0, n);
}

/** Place the correct answer at a position fixed by the question's own id. */
function arrange(correct: string, wrong: string[], seed: string) {
  const options = seededShuffle([correct, ...wrong], seed);
  return { options, answer: options.indexOf(correct) };
}

const harder = (d: Difficulty): Difficulty => Math.min(3, d + 1) as Difficulty;
const easier = (d: Difficulty): Difficulty => Math.max(1, d - 1) as Difficulty;

/** A definition as it appears on an answer button. */
export const definitionOption = (concept: Concept) => clamp(concept.definition, 150);

/* ---------- 1. what does X mean ---------- */

function defineMcq(input: GenInput, concept: Concept, pool: Concept[]): Question | null {
  if (concept.kind === 'fact' || leaks(concept)) return null;
  const wrong = distractors(pool, concept, 3, concept.id + 'd');
  if (wrong.length < 3) return null;

  const id = `q-def-${concept.id}`;
  const { options, answer } = arrange(
    definitionOption(concept),
    wrong.map(definitionOption),
    id,
  );

  return {
    id,
    courseId: input.courseId,
    chapterId: concept.chapterId,
    conceptId: concept.id,
    type: 'mcq',
    probe: 'recall',
    difficulty: concept.difficulty,
    prompt: PHRASES[input.lang].define(concept.term),
    options,
    answer,
    explanation: concept.citation.text,
    citation: concept.citation,
    lang: input.lang,
  };
}

/* ---------- 2. which term is this ---------- */

function termMcq(input: GenInput, concept: Concept, pool: Concept[]): Question | null {
  if (concept.kind === 'fact' || leaks(concept)) return null;
  const wrong = distractors(pool, concept, 3, concept.id + 't');
  if (wrong.length < 3) return null;

  const id = `q-term-${concept.id}`;
  const { options, answer } = arrange(concept.term, wrong.map((c) => c.term), id);

  return {
    id,
    courseId: input.courseId,
    chapterId: concept.chapterId,
    conceptId: concept.id,
    type: 'mcq',
    // Telling four neighbouring terms apart is the discrimination probe: it is
    // the question a student who memorised one definition cannot answer.
    probe: 'discrimination',
    difficulty: harder(concept.difficulty),
    prompt: PHRASES[input.lang].whichTerm(clamp(concept.definition, 190)),
    options,
    answer,
    explanation: concept.citation.text,
    citation: concept.citation,
    lang: input.lang,
  };
}

/* ---------- 3. true / false ---------- */

const POLARITY: Array<[string, string]> = [
  ['increases', 'decreases'],
  ['increase', 'decrease'],
  ['higher', 'lower'],
  ['more', 'less'],
  ['positive', 'negative'],
  ['always', 'never'],
  ['all', 'none'],
  ['greater', 'smaller'],
  ['maximum', 'minimum'],
  ['يزيد', 'ينقص'],
  ['يزداد', 'ينخفض'],
  ['أكبر', 'أصغر'],
  ['موجب', 'سالب'],
  ['دائما', 'أبدا'],
  ['أعلى', 'أدنى'],
];

function trueFalse(input: GenInput, concept: Concept, pool: Concept[], wantTrue: boolean): Question | null {
  const source = clamp(concept.citation.text, 240);
  if (contentWords(source).length < 5) return null;

  const id = `q-tf-${concept.id}`;
  let statement = source;
  let isTrue = true;

  if (!wantTrue) {
    const altered = falsify(source, concept, pool);
    if (!altered) return null;
    statement = altered;
    isTrue = false;
  }

  const t = PHRASES[input.lang];
  return {
    id,
    courseId: input.courseId,
    chapterId: concept.chapterId,
    conceptId: concept.id,
    type: 'truefalse',
    probe: 'recall',
    difficulty: easier(concept.difficulty),
    prompt: statement,
    options: [t.true, t.false],
    answer: isTrue ? 0 : 1,
    explanation: concept.citation.text,
    citation: concept.citation,
    lang: input.lang,
  };
}

/**
 * Make a false statement out of a true one by changing exactly one thing: a
 * term swapped for a neighbouring term, or a word swapped for its opposite.
 * The explanation always shows the untouched original, so the student sees
 * precisely what moved.
 */
function falsify(sentence: string, concept: Concept, pool: Concept[]): string | null {
  for (const [a, b] of POLARITY) {
    for (const [from, to] of [[a, b], [b, a]] as const) {
      const at = findTerm(sentence, from);
      if (at) return spliceTerm(sentence, at, to);
    }
  }

  const swap = pool.find(
    (c) =>
      normalizeTerm(c.term) !== normalizeTerm(concept.term) &&
      !findTerm(sentence, c.term) &&
      Math.abs(c.term.length - concept.term.length) < 16,
  );
  const at = swap && findTerm(sentence, concept.term);
  if (swap && at) return spliceTerm(sentence, at, swap.term);

  return null;
}

/**
 * Put a different term into a sentence, and fix the article in front of it.
 *
 * "A type I error" becoming "A alternative hypothesis" is a giveaway that has
 * nothing to do with knowing the material: a student learns to spot the false
 * statement by its grammar, and the question stops measuring anything. Only the
 * article immediately before the swap is touched, so no other "a" in the
 * sentence can be broken by the fix.
 */
function spliceTerm(sentence: string, at: { start: number; end: number }, replacement: string): string {
  const vowel = /^[aeiou]/i.test(replacement);
  const head = sentence
    .slice(0, at.start)
    .replace(/\b(a|an|A|An)(\s+)$/, (_, article: string, space: string) => {
      const capital = article[0] === 'A';
      return (vowel ? (capital ? 'An' : 'an') : capital ? 'A' : 'a') + space;
    });
  return head + replacement + sentence.slice(at.end);
}

/* ---------- 4. fill in the blank ---------- */

function blankFromSentence(input: GenInput, concept: Concept): Question | null {
  const sentence = clamp(concept.citation.text, 220);
  const at = findTerm(sentence, concept.term);
  if (!at) return null;
  // Two mentions means two blanks' worth of ambiguity about which one we mean.
  const rest = sentence.slice(at.end);
  if (findTerm(rest, concept.term)) return null;
  if (concept.term.split(/\s+/).length > 3) return null;

  const surface = sentence.slice(at.start, at.end);
  const id = `q-blank-${concept.id}`;

  return {
    id,
    courseId: input.courseId,
    chapterId: concept.chapterId,
    conceptId: concept.id,
    type: 'blank',
    probe: 'recall',
    difficulty: harder(concept.difficulty),
    prompt: sentence.slice(0, at.start) + '____' + sentence.slice(at.end),
    accept: [surface, concept.term, normalizeTerm(surface)],
    explanation: concept.citation.text,
    citation: concept.citation,
    lang: input.lang,
  };
}

/* ---------- 5. matching ---------- */

function matchSet(input: GenInput, chapter: Chapter, concepts: Concept[]): Question | null {
  const usable = concepts.filter((c) => !leaks(c) && c.kind !== 'fact' && c.definition.length > 30);
  if (usable.length < 4) return null;

  const picked = seededShuffle(usable, chapter.id + 'm').slice(0, 4);
  const id = `q-match-${chapter.id}`;

  return {
    id,
    courseId: input.courseId,
    chapterId: chapter.id,
    // Mastery is per concept, and a matching set spans four of them; it is
    // credited to the heaviest one, which is the chapter's anchor idea.
    conceptId: picked.reduce((a, b) => (a.weight >= b.weight ? a : b)).id,
    type: 'match',
    probe: 'recall',
    difficulty: 2,
    prompt: PHRASES[input.lang].match,
    pairs: picked.map((c) => [c.term, clamp(c.definition, 92)] as [string, string]),
    explanation: picked.map((c) => `${c.term}: ${clamp(c.definition, 110)}`).join('\n'),
    citation: picked[0].citation,
    lang: input.lang,
  };
}

/* ---------- 6. order the steps ---------- */

const STEP_MARKERS =
  /^(first|second|third|next|then|after that|finally|lastly|step\s*\d|[1-9][.)\-]|أولا|ثانيا|ثالثا|رابعا|ثم|بعد ذلك|أخيرا|الخطوة\s*\d)/i;

function orderSteps(input: GenInput, chapter: Chapter, concepts: Concept[]): Question | null {
  const doc = input.docs.find((d) => d.id === chapter.docId);
  if (!doc || concepts.length === 0) return null;

  const region = doc.text.slice(chapter.start, chapter.end);
  const blocks = splitBlocks(region, chapter.start);

  // A run of consecutive lines that all open with a step marker is a procedure.
  let run: Span[] = [];
  let best: Span[] = [];
  for (const b of blocks) {
    if (STEP_MARKERS.test(b.text) && b.text.length > 18 && b.text.length < 220) {
      run.push(b);
      if (run.length > best.length) best = [...run];
    } else if (!STEP_MARKERS.test(b.text)) {
      run = [];
    }
  }
  if (best.length < 3) return null;

  const steps = best.slice(0, 5);
  const anchor =
    concepts.find((c) => steps.some((s) => findTerm(s.text, c.term))) ??
    concepts.reduce((a, b) => (a.weight >= b.weight ? a : b));

  // The citation has to be the document's own span, not the steps rejoined:
  // a citation whose text differs from what sits at those offsets would make
  // "Show source" highlight the wrong thing.
  const span: Span = {
    text: doc.text.slice(steps[0].start, steps[steps.length - 1].end),
    start: steps[0].start,
    end: steps[steps.length - 1].end,
  };

  return {
    id: `q-order-${chapter.id}`,
    courseId: input.courseId,
    chapterId: chapter.id,
    conceptId: anchor.id,
    type: 'order',
    probe: 'sequence',
    difficulty: 3,
    prompt: PHRASES[input.lang].order,
    steps: steps.map((s) => clamp(s.text, 120)),
    explanation: span.text,
    citation: citationFor(doc, input.outline, span),
    lang: input.lang,
  };
}

/* ---------- 7. find the word that does not belong ---------- */

function errorHunt(input: GenInput, concept: Concept, pool: Concept[]): Question | null {
  const sentence = clamp(concept.citation.text, 180);
  const tokens = sentence.split(/\s+/);
  if (tokens.length < 6 || tokens.length > 28) return null;

  // Swap a neighbouring one-word term in, where a different one-word term
  // stands. The student has to know which of the two belongs in this sentence.
  const swapIn = pool.find((c) => !c.term.includes(' ') && c.term.length > 3 && !findTerm(sentence, c.term));
  if (!swapIn) return null;

  const index = tokens.findIndex((tok, i) => {
    if (i === 0) return false;
    const bare = tok.replace(/[^\p{L}\p{N}]/gu, '');
    return bare.length > 3 && contentWords(bare).length === 1 && normalizeTerm(bare) !== normalizeTerm(swapIn.term);
  });
  if (index < 0) return null;

  const original = tokens[index];
  const punctuation = original.replace(/^[\p{L}\p{N}'’-]+/u, '');
  const broken = [...tokens];
  broken[index] = swapIn.term + punctuation;
  // Same reason as `spliceTerm`: a mismatched article marks the odd word out
  // for a student who is reading the grammar rather than the statistics.
  if (index > 0 && /^(a|an|A|An)$/.test(broken[index - 1])) {
    const capital = broken[index - 1][0] === 'A';
    const vowel = /^[aeiou]/i.test(swapIn.term);
    broken[index - 1] = vowel ? (capital ? 'An' : 'an') : capital ? 'A' : 'a';
  }

  return {
    id: `q-err-${concept.id}`,
    courseId: input.courseId,
    chapterId: concept.chapterId,
    conceptId: concept.id,
    type: 'error',
    probe: 'discrimination',
    difficulty: 3,
    prompt: PHRASES[input.lang].error,
    tokens: broken,
    answer: index,
    correction: original,
    explanation: concept.citation.text,
    citation: concept.citation,
    lang: input.lang,
  };
}

/* ---------- 8. values and formulas ---------- */

const NUMBER = /(?<![\p{L}\d.])(\d+(?:\.\d+)?%?)(?![\p{L}\d])/u;

function valueMcq(input: GenInput, concept: Concept, pool: Concept[]): Question | null {
  if (concept.kind !== 'formula' && !NUMBER.test(concept.citation.text)) return null;
  const m = NUMBER.exec(concept.citation.text);
  if (!m) return null;

  const correct = m[1];
  const value = parseFloat(correct);
  if (!Number.isFinite(value) || value === 0) return null;

  const suffix = correct.endsWith('%') ? '%' : '';
  const format = (n: number) => {
    const rounded = Number.isInteger(value) ? Math.round(n) : Number(n.toFixed(2));
    return `${rounded}${suffix}`;
  };
  const wrong = [format(value * 2), format(value / 2), format(value * 1.5 + 1)].filter(
    (v, i, all) => v !== correct && all.indexOf(v) === i,
  );
  if (wrong.length < 3) return null;

  const id = `q-val-${concept.id}`;
  const { options, answer } = arrange(correct, wrong.slice(0, 3), id);
  void pool;

  return {
    id,
    courseId: input.courseId,
    chapterId: concept.chapterId,
    conceptId: concept.id,
    type: 'mcq',
    probe: 'value',
    difficulty: harder(concept.difficulty),
    // The sentence is shown with the value blanked, so the question is about
    // the value and not about recognising the sentence.
    prompt: `${PHRASES[input.lang].value(concept.term)}\n\n${clamp(
      concept.citation.text.replace(correct, '____'),
      200,
    )}`,
    options,
    answer,
    explanation: concept.citation.text,
    citation: concept.citation,
    lang: input.lang,
  };
}

/* ---------- 9. why ---------- */

const BECAUSE = /\b(because|since|due to the fact that|so that|as a result of)\b|(?:\s)(لأن|بسبب|نظرا لأن|حتى)\s/u;

/**
 * The application probe. A sentence of the form "A because B" already contains
 * a question and its answer; asking it back tests whether the student followed
 * the reasoning rather than memorised the sentence.
 */
function whyQuestions(input: GenInput): Question[] {
  const out: Question[] = [];
  const clauses: Array<{ cause: string; question: Question }> = [];

  for (const doc of input.docs) {
    for (const sentence of splitSentences(doc.text.slice(0, 400_000))) {
      if (sentence.text.length < 60 || sentence.text.length > 260) continue;
      const m = BECAUSE.exec(sentence.text);
      if (!m || m.index < 25) continue;

      const effect = sentence.text.slice(0, m.index).trim().replace(/[,،]$/, '');
      const cause = sentence.text.slice(m.index + m[0].length).trim().replace(/[.،,]$/, '');
      if (contentWords(effect).length < 4 || contentWords(cause).length < 4) continue;
      if (cause.length < 25 || cause.length > 180) continue;

      const chapter = chapterAt(input.outline, doc.id, sentence.start);
      if (!chapter) continue;
      const concept =
        input.concepts.find((c) => c.chapterId === chapter.id && findTerm(sentence.text, c.term)) ??
        input.concepts.find((c) => c.chapterId === chapter.id);
      if (!concept) continue;

      const citation: Citation = citationFor(doc, input.outline, sentence);
      clauses.push({
        cause,
        question: {
          id: `q-why-${doc.id}-${sentence.start}`,
          courseId: input.courseId,
          chapterId: chapter.id,
          conceptId: concept.id,
          type: 'mcq',
          probe: 'application',
          difficulty: 3,
          prompt: PHRASES[input.lang].why(lowerFirst(clamp(effect, 150))),
          options: [],
          answer: 0,
          explanation: sentence.text,
          citation,
          lang: input.lang,
        },
      });
    }
  }

  // Each why-question is answered against the other causes in the same course,
  // which is what makes the options plausible instead of obviously off-topic.
  for (const { cause, question } of clauses) {
    if (question.type !== 'mcq') continue;
    const wrong = seededShuffle(
      clauses.filter((c) => c.cause !== cause && normalizeTerm(c.cause) !== normalizeTerm(cause)),
      question.id,
    )
      .slice(0, 3)
      .map((c) => clamp(c.cause, 140));
    if (wrong.length < 3) continue;

    const { options, answer } = arrange(clamp(cause, 140), wrong, question.id);
    out.push({ ...question, options, answer });
  }

  return out.slice(0, 60);
}

function lowerFirst(s: string): string {
  return /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;
}
