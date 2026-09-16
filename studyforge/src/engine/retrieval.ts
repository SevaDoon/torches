/*
 * Searching inside the student's own reference.
 *
 * This is what "Ask" answers from, what "give me an example" pulls from, and
 * what keeps the whole product honest: if a query finds nothing above the
 * threshold, the answer is "that is not in your reference", not a guess.
 *
 * A course is indexed once and cached; a class-sized document does not need
 * anything cleverer than a sentence-level term index.
 */
import type { Citation, Concept, Course } from '../types';
import { citationFor } from './concepts';
import { buildOutline, type Outline } from './structure';
import { contentWords, findTerm, normalizeTerm, splitSentences, type Span } from './text';

interface Entry {
  docId: string;
  span: Span;
  terms: Map<string, number>;
  length: number;
}

interface Index {
  entries: Entry[];
  /** How many sentences each term appears in — the rarity half of the score. */
  df: Map<string, number>;
  outline: Outline;
}

const cache = new Map<string, Index>();

function indexOf(course: Course): Index {
  const hit = cache.get(course.id);
  if (hit) return hit;

  const entries: Entry[] = [];
  const df = new Map<string, number>();

  for (const doc of course.docs) {
    for (const span of splitSentences(doc.text)) {
      if (span.text.length < 30) continue;
      const terms = new Map<string, number>();
      for (const w of contentWords(span.text)) {
        const t = normalizeTerm(w);
        if (t) terms.set(t, (terms.get(t) ?? 0) + 1);
      }
      if (terms.size === 0) continue;
      for (const t of terms.keys()) df.set(t, (df.get(t) ?? 0) + 1);
      entries.push({ docId: doc.id, span, terms, length: span.text.length });
    }
  }

  // The outline is rebuilt rather than stored: chapters are persisted with the
  // course, but the finer heading path a citation is labelled with is cheap to
  // recompute and not worth doubling the saved size for.
  const index: Index = { entries, df, outline: buildOutline(course.id, course.docs, course.lang) };
  cache.set(course.id, index);
  return index;
}

export function forgetIndex(courseId: string) {
  cache.delete(courseId);
}

export interface Passage {
  text: string;
  score: number;
  citation: Citation;
}

/*
 * Words that say what kind of answer is wanted rather than what it is about.
 * They are stripped from the query only, never from the index: "explain the
 * population" must not rank a sentence highest because that sentence happens
 * to contain the word "explain".
 */
const QUERY_NOISE = new Set(
  `explain define definition describe meaning means tell show give list state outline summarize
   summarise compare difference between question answer please
   اشرح اشرحي وضح وضحي عرف عرّف تعريف معنى اذكر اذكري هات قارن الفرق سؤال جواب`
    .split(/\s+/)
    .filter(Boolean),
);

/** The sentences in the reference that best answer a question, best first. */
export function search(course: Course, query: string, limit = 4): Passage[] {
  const index = indexOf(course);
  const asked = contentWords(query).filter((w) => !QUERY_NOISE.has(normalizeTerm(w)));
  // If the question was nothing but instruction words, fall back to all of them
  // rather than answering an empty query.
  const source = asked.length ? asked : contentWords(query);
  const wanted = [...new Set(source.map(normalizeTerm))].filter(Boolean);
  if (wanted.length === 0) return [];

  const total = index.entries.length || 1;
  const scored: Passage[] = [];

  for (const entry of index.entries) {
    let score = 0;
    let matched = 0;
    for (const term of wanted) {
      const tf = entry.terms.get(term);
      if (!tf) continue;
      matched++;
      const idf = Math.log(1 + total / (1 + (index.df.get(term) ?? 1)));
      // Saturating tf, so one sentence repeating a word cannot dominate.
      score += idf * (tf / (tf + 1.2));
    }
    if (matched === 0) continue;
    // Covering more of the question matters more than matching one word hard.
    score *= matched / wanted.length;
    // A very long sentence matches everything; normalise it down a little.
    score *= 1 / (1 + entry.length / 600);
    // A sentence that opens with what was asked about is usually the sentence
    // that defines it — which is what someone asking "what is X" wants.
    const topic = asked.join(' ');
    const at = topic.length > 3 ? findTerm(entry.span.text, topic) : null;
    if (at) score *= at.start < 24 ? 2.4 : 1.5;

    const doc = course.docs.find((d) => d.id === entry.docId)!;
    scored.push({ text: entry.span.text, score, citation: citationFor(doc, index.outline, entry.span) });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Below this a "best match" is just the most common words in the document, and
 * answering from it would be exactly the invented-content failure this product
 * exists to avoid.
 */
export const ANSWER_THRESHOLD = 0.55;

export function answerFromSource(course: Course, query: string): Passage[] | null {
  const hits = search(course, query, 3);
  if (hits.length === 0 || hits[0].score < ANSWER_THRESHOLD) return null;
  // Keep only the hits that are in the same league as the best one.
  return hits.filter((h) => h.score >= hits[0].score * 0.45);
}

/* ---------- what the feedback sheet offers ---------- */

const EXAMPLE_MARKER =
  /\b(for example|for instance|such as|e\.g\.|consider|suppose|imagine)\b|مثلا|على سبيل المثال|مثال|افترض/i;

/** An example of a concept, in the reference's words — or nothing. */
export function exampleFor(course: Course, concept: Concept): Passage | null {
  const index = indexOf(course);
  const candidates = index.entries.filter(
    (e) =>
      e.span.start !== concept.citation.start &&
      EXAMPLE_MARKER.test(e.span.text) &&
      findTerm(e.span.text, concept.term),
  );
  if (candidates.length === 0) return null;
  const best = candidates.reduce((a, b) => (a.length <= b.length ? a : b));
  const doc = course.docs.find((d) => d.id === best.docId)!;
  return { text: best.span.text, score: 1, citation: citationFor(doc, index.outline, best.span) };
}

/**
 * "Explain it more simply" — the shortest other sentence in the reference that
 * talks about the same concept. We cannot write a simpler explanation without
 * inventing one, but the author often already did, somewhere else.
 */
export function simplerFor(course: Course, concept: Concept): Passage | null {
  const index = indexOf(course);
  const candidates = index.entries.filter(
    (e) =>
      e.span.start !== concept.citation.start &&
      e.span.text.length < concept.citation.text.length * 0.9 &&
      e.span.text.length > 40 &&
      findTerm(e.span.text, concept.term),
  );
  if (candidates.length === 0) return null;
  const best = candidates.reduce((a, b) => (a.length <= b.length ? a : b));
  const doc = course.docs.find((d) => d.id === best.docId)!;
  return { text: best.span.text, score: 1, citation: citationFor(doc, index.outline, best.span) };
}

/** The paragraph a citation sits in, for "Show source". */
export function contextOf(course: Course, citation: Citation): { text: string; from: number } | null {
  const doc = course.docs.find((d) => d.id === citation.docId);
  if (!doc) return null;
  const from = Math.max(0, doc.text.lastIndexOf('\n', Math.max(0, citation.start - 320)) + 1);
  const to = Math.min(doc.text.length, doc.text.indexOf('\n', citation.end + 320) + 1 || citation.end + 320);
  return { text: doc.text.slice(from, to), from };
}
