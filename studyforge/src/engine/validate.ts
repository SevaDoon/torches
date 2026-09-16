/*
 * The gate. Every generated question passes through here before a student can
 * ever see it, and anything that fails is dropped without ceremony.
 *
 * The checks are the ones from the brief, in the order they are cheap to make:
 * is the answer actually in the reference, is there exactly one right answer,
 * is the question ambiguous, does it lean on knowledge from outside the
 * reference, does it give itself away, is it at a sane level.
 *
 * Silence is the point. A rejected question is not shown, not explained and
 * not counted; the only trace is the number on the build screen. A student
 * should never be asked to answer something we are not sure of.
 */
import type { Concept, Question } from '../types';
import { clamp, contentWords, findTerm, normalizeTerm } from './text';

export type Rejection =
  | 'no-source'
  | 'answer-not-in-source'
  | 'duplicate-options'
  | 'ambiguous-options'
  | 'gives-itself-away'
  | 'length-tell'
  | 'needs-outside-knowledge'
  | 'malformed'
  | 'duplicate-question';

export interface GateResult {
  kept: Question[];
  rejected: Array<{ id: string; reason: Rejection }>;
}

/** Words that make a sentence depend on one we are not showing. */
const DANGLING =
  /^(this|that|these|those|it|they|he|she|such|the former|the latter|هذا|هذه|ذلك|تلك|هؤلاء|وهو|وهي|كما)\b/i;

export function gate(questions: Question[], concepts: Concept[]): GateResult {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const kept: Question[] = [];
  const rejected: GateResult['rejected'] = [];
  const seenPrompts = new Set<string>();

  for (const q of questions) {
    const reason = check(q, byId.get(q.conceptId));
    if (reason) {
      rejected.push({ id: q.id, reason });
      continue;
    }
    const key = normalizeTerm(q.prompt).slice(0, 120);
    if (seenPrompts.has(key)) {
      rejected.push({ id: q.id, reason: 'duplicate-question' });
      continue;
    }
    seenPrompts.add(key);
    kept.push(q);
  }

  return { kept, rejected };
}

export function check(q: Question, concept: Concept | undefined): Rejection | null {
  // 1. Is it tied to the reference at all?
  if (!q.citation?.text?.trim() || q.citation.end <= q.citation.start) return 'no-source';
  if (!q.prompt?.trim() || q.difficulty < 1 || q.difficulty > 3) return 'malformed';

  // 2. Does it lean on a sentence we are not showing?
  if (DANGLING.test(q.citation.text.trim())) return 'needs-outside-knowledge';
  if (contentWords(q.citation.text).length < 4) return 'needs-outside-knowledge';

  switch (q.type) {
    case 'mcq':
    case 'truefalse': {
      if (q.options.length < 2) return 'malformed';
      if (q.answer < 0 || q.answer >= q.options.length) return 'malformed';
      if (q.options.some((o) => !o.trim())) return 'malformed';

      const norm = q.options.map(normalizeTerm);
      // 3. Exactly one right answer: two options that say the same thing mean
      //    the student can be right and still be marked wrong.
      if (new Set(norm).size !== norm.length) return 'duplicate-options';

      if (q.type === 'mcq') {
        // 4. One option containing another is a hint, not a distractor.
        for (let i = 0; i < norm.length; i++) {
          for (let j = 0; j < norm.length; j++) {
            if (i !== j && norm[i].length > 8 && norm[j].includes(norm[i])) return 'ambiguous-options';
          }
        }

        // 5. Does the stem contain its own answer?
        const answerText = q.options[q.answer];
        const stem = q.prompt.replace('____', ' ');
        if (answerText.length > 12 && normalizeTerm(stem).includes(normalizeTerm(answerText))) {
          return 'gives-itself-away';
        }
        if (concept && q.probe !== 'value' && findTerm(answerText, concept.term) && q.probe !== 'discrimination') {
          return 'gives-itself-away';
        }

        // 6. "The long one is the answer" is a test-taking trick, not knowledge.
        const others = q.options.filter((_, i) => i !== q.answer).map((o) => o.length);
        const mean = others.reduce((a, b) => a + b, 0) / others.length;
        const ratio = answerText.length / Math.max(1, mean);
        if (mean > 20 && (ratio > 1.9 || ratio < 0.45)) return 'length-tell';

        if (contentWords(q.prompt).length < 3) return 'malformed';
      }
      return null;
    }

    case 'blank': {
      const blanks = q.prompt.split('____').length - 1;
      if (blanks !== 1) return 'malformed';
      const answer = q.accept[0]?.trim();
      if (!answer || answer.length < 2 || answer.length > 42) return 'malformed';
      // The sentence around the blank has to carry enough to answer from.
      if (contentWords(q.prompt).length < 4) return 'needs-outside-knowledge';
      // 7. The answer must be in the source sentence this was cut from.
      if (!findTerm(q.citation.text, answer)) return 'answer-not-in-source';
      return null;
    }

    case 'match': {
      if (q.pairs.length < 3) return 'malformed';
      const terms = q.pairs.map(([t]) => normalizeTerm(t));
      const defs = q.pairs.map(([, d]) => normalizeTerm(d));
      if (new Set(terms).size !== terms.length) return 'duplicate-options';
      if (new Set(defs).size !== defs.length) return 'duplicate-options';
      // A pair whose definition names its own term solves itself.
      if (q.pairs.some(([t, d]) => findTerm(d, t))) return 'gives-itself-away';
      return null;
    }

    case 'order': {
      if (q.steps.length < 3 || q.steps.length > 6) return 'malformed';
      const norm = q.steps.map(normalizeTerm);
      if (new Set(norm).size !== norm.length) return 'duplicate-options';
      if (q.steps.some((s) => contentWords(s).length < 2)) return 'malformed';
      return null;
    }

    case 'error': {
      if (q.answer < 0 || q.answer >= q.tokens.length) return 'malformed';
      if (q.tokens.length < 6) return 'malformed';
      if (!q.correction.trim()) return 'malformed';
      if (normalizeTerm(q.tokens[q.answer]) === normalizeTerm(q.correction)) return 'malformed';
      // The original sentence must actually contain the word we call correct.
      if (!findTerm(q.citation.text, q.correction.replace(/[^\p{L}\p{N}'’-]/gu, ''))) {
        return 'answer-not-in-source';
      }
      return null;
    }
  }
}

/** What the student is told when she gets it wrong: the reference's own words. */
export function explanationOf(q: Question): string {
  return clamp(q.explanation || q.citation.text, 600);
}
