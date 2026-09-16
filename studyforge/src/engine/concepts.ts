/*
 * Turning a reference into concepts.
 *
 * THE RULE OF THIS FILE: a concept is a span of the student's own document.
 * The term is the author's word for it and the definition is the author's
 * sentence about it, copied, not paraphrased. Nothing here composes a new
 * claim, which is what makes every question downstream safe to show.
 *
 * Definitions are found by the shapes authors actually write them in — "X is
 * defined as Y", "X: Y", "يُعرَّف X بأنه Y" — and then filtered hard. A bad
 * concept is much worse than a missing one: it becomes a question that cannot
 * be answered, so every doubt here resolves towards dropping the candidate.
 */
import type { Chapter, Citation, Concept, ConceptKind, Difficulty, Lang, SourceDoc } from '../types';
import { chapterAt, sectionLabel, type Outline } from './structure';
import {
  clamp,
  contentWords,
  findTerm,
  normalizeTerm,
  splitSentences,
  words,
  type Span,
} from './text';

/* ---------- patterns ---------- */

// \p{M} as well as \p{L}: an Arabic term keeps its harakat when the source has them.
const TERM = "([\\p{L}][\\p{L}\\p{M}\\p{N}'’\\-]*(?:[ \\u00a0][\\p{L}\\p{M}\\p{N}'’\\-]+){0,4})";

/** Harakat and tatweel — present in some sources, absent in most. */
const MARK = /[\u064B-\u0652\u0640]/g;
const MARKS = `${MARK.source}*`;

/**
 * An Arabic keyword list that matches with or without diacritics, in any mark
 * order. "يُعرَّف" typed by hand, "يعرف" without marks, and the same word out of
 * a PDF with its shadda and fatha stored the other way round are one keyword.
 */
const loose = (list: string) =>
  list
    .split('|')
    .map((word) =>
      [...word.replace(MARK, '')].map((ch) => (ch === ' ' ? '\\s+' : `${ch}${MARKS}`)).join(''),
    )
    .join('|');

const EN_PATTERNS: Array<{ re: RegExp; kind: ConceptKind }> = [
  { re: new RegExp(`^(?:the |a |an )?${TERM}\\s+(?:is|are)\\s+(?:defined as|known as|called|referred to as)\\s+(.{20,400})$`, 'iu'), kind: 'definition' },
  { re: new RegExp(`^(?:the |a |an )?${TERM}\\s+refers to\\s+(.{20,400})$`, 'iu'), kind: 'definition' },
  { re: new RegExp(`^(?:the |a |an )?${TERM}\\s+means\\s+(.{20,400})$`, 'iu'), kind: 'definition' },
  { re: new RegExp(`^(?:the |a |an )?${TERM}\\s+(?:is|are)\\s+(.{25,400})$`, 'u'), kind: 'definition' },
  { re: new RegExp(`^(?:the |a |an )?${TERM}\\s+(?:describes|measures|represents|indicates)\\s+(.{20,400})$`, 'iu'), kind: 'definition' },
];

const AR_PATTERNS: Array<{ re: RegExp; kind: ConceptKind }> = [
  { re: new RegExp(`^(?:${loose('يعرف|تعرف')})\\s+${TERM}\\s+(?:${loose('بأنه|بأنها|على أنه|على أنها')})\\s+(.{15,400})$`, 'u'), kind: 'definition' },
  { re: new RegExp(`^(?:${loose('يقصد')})\\s+بـ?${TERM}\\s+(.{15,400})$`, 'u'), kind: 'definition' },
  { re: new RegExp(`^${TERM}\\s+(?:${loose('هو|هي|هما')})\\s+(.{15,400})$`, 'u'), kind: 'definition' },
  { re: new RegExp(`^${TERM}\\s+(?:${loose('تعني|يعني|عبارة عن|يمثل|تمثل')})\\s+(.{15,400})$`, 'u'), kind: 'definition' },
];

/** "Term: definition" — a glossary line, in either language. */
const GLOSSARY = new RegExp(`^${TERM}\\s*[:\\u2013\\u2014-]\\s+(.{25,400})$`, 'u');

const FORMULA = /(?:^|\s)([A-Za-z\u0600-\u06FF][\w\u0600-\u06FF()\s]{0,24}?)\s*=\s*([^=]{3,120})$/u;

/** Words that mean the sentence is talking about something said earlier. */
const DEICTIC = new Set(
  `this that these those it they there he she we you such here above below following هذا هذه ذلك تلك هؤلاء
   هنا هناك ذلكم وهو وهي فهو فهي كما بينما`
    .split(/\s+/)
    .filter(Boolean),
);

/* ---------- extraction ---------- */

interface Candidate {
  term: string;
  definition: string;
  kind: ConceptKind;
  docId: string;
  sentence: Span;
}

export function buildConcepts(
  courseId: string,
  docs: SourceDoc[],
  outline: Outline,
  lang: Lang,
): Concept[] {
  const candidates: Candidate[] = [];

  for (const doc of docs) {
    for (const sentence of splitSentences(doc.text)) {
      const found = matchSentence(sentence.text, lang);
      if (found) candidates.push({ ...found, docId: doc.id, sentence });
    }
  }

  const counts = countPhrases(docs);
  const best = dedupe(candidates);

  let concepts = best
    .map((c) => toConcept(courseId, c, docs, outline, counts))
    .filter((c): c is Concept => !!c);

  /*
   * A reference written as narrative rather than as a glossary yields very few
   * "X is Y" sentences. Rather than hand back a course with six questions,
   * fall back to the phrases the author keeps returning to, defined by the
   * sentence that says the most about them — still entirely his words.
   */
  if (concepts.length < 12) {
    concepts = concepts.concat(
      keyphraseConcepts(courseId, docs, outline, counts, new Set(concepts.map((c) => normalizeTerm(c.term)))),
    );
  }

  concepts = spreadOverChapters(concepts, outline.chapters);
  linkRelated(concepts);
  return concepts;
}

function matchSentence(text: string, lang: Lang): Omit<Candidate, 'docId' | 'sentence'> | null {
  const patterns = lang === 'ar' ? [...AR_PATTERNS, ...EN_PATTERNS] : [...EN_PATTERNS, ...AR_PATTERNS];

  for (const { re, kind } of patterns) {
    const m = re.exec(text);
    if (m) return { term: m[1], definition: m[2], kind };
  }

  const formula = FORMULA.exec(text);
  if (formula && /[\p{L}]/u.test(formula[1])) {
    return { term: formula[1].trim(), definition: text, kind: 'formula' };
  }

  // A glossary line has no verb; only trust it when it is short enough to be one.
  if (text.length < 260) {
    const g = GLOSSARY.exec(text);
    if (g && !/\s(is|are|was|were|هو|هي)\s/.test(g[1])) {
      return { term: g[1], definition: g[2], kind: 'definition' };
    }
  }
  return null;
}

/* ---------- filtering ---------- */

function cleanTerm(raw: string): string | null {
  const term = raw
    .replace(/^\s*(the|a|an)\s+/i, '')
    .replace(/[\s,;:.]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = term.split(' ');
  if (term.length < 3 || term.length > 52 || parts.length > 5) return null;
  if (!/\p{L}/u.test(term)) return null;
  if (/^\d/.test(term)) return null;
  if (DEICTIC.has(term.toLowerCase()) || DEICTIC.has(parts[0].toLowerCase())) return null;
  if (normalizeTerm(term).length < 3) return null;
  // "One important property" — a term has to be mostly content words.
  if (contentWords(term).length === 0) return null;
  return term;
}

function cleanDefinition(raw: string, term: string): string | null {
  const def = raw
    .replace(/^\s*(?:a|an|the)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:]$/, '');

  if (def.length < 22 || def.length > 400) return null;
  if (contentWords(def).length < 3) return null;
  // A definition that just repeats the term explains nothing.
  if (normalizeTerm(def) === normalizeTerm(term)) return null;
  if (/^(see|as (shown|described)|انظر|كما)/i.test(def)) return null;
  return def;
}

function dedupe(candidates: Candidate[]): Candidate[] {
  const byTerm = new Map<string, Candidate>();
  for (const c of candidates) {
    const term = cleanTerm(c.term);
    if (!term) continue;
    const definition = cleanDefinition(c.definition, term);
    if (!definition) continue;

    const key = normalizeTerm(term);
    const kept = byTerm.get(key);
    // Prefer an explicit definition over a formula, then the fuller wording.
    if (
      !kept ||
      (kept.kind === 'formula' && c.kind === 'definition') ||
      (kept.kind === c.kind && definition.length > kept.definition.length && definition.length < 280)
    ) {
      byTerm.set(key, { ...c, term, definition });
    }
  }
  return [...byTerm.values()];
}

/* ---------- weighting ---------- */

/** How often each 1-3 word phrase appears; the measure of what matters here. */
function countPhrases(docs: SourceDoc[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const doc of docs) {
    const tokens = words(doc.text.slice(0, 400_000));
    for (let i = 0; i < tokens.length; i++) {
      for (let n = 1; n <= 3 && i + n <= tokens.length; n++) {
        const phrase = normalizeTerm(tokens.slice(i, i + n).join(' '));
        if (phrase.length < 3) continue;
        counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
      }
    }
  }
  return counts;
}

function toConcept(
  courseId: string,
  c: Candidate,
  docs: SourceDoc[],
  outline: Outline,
  counts: Map<string, number>,
): Concept | null {
  const doc = docs.find((d) => d.id === c.docId);
  if (!doc) return null;
  const chapter = chapterAt(outline, c.docId, c.sentence.start);
  if (!chapter) return null;

  const mentions = counts.get(normalizeTerm(c.term)) ?? 1;
  const weight = Math.min(1, Math.log2(mentions + 1) / 6);

  return {
    id: `c-${normalizeTerm(c.term).replace(/\s+/g, '-').slice(0, 40)}-${c.sentence.start}`,
    courseId,
    chapterId: chapter.id,
    term: c.term,
    definition: c.definition,
    kind: c.kind,
    difficulty: rateDifficulty(c.definition, mentions),
    weight,
    citation: citationFor(doc, outline, c.sentence),
    related: [],
  };
}

function rateDifficulty(definition: string, mentions: number): Difficulty {
  const long = definition.length > 150;
  const dense = contentWords(definition).length > 16;
  const rare = mentions <= 2;
  const score = (long ? 1 : 0) + (dense ? 1 : 0) + (rare ? 1 : 0);
  return score >= 2 ? 3 : score === 1 ? 2 : 1;
}

export function citationFor(doc: SourceDoc, outline: Outline, span: Span): Citation {
  const page = doc.pages.find((p) => span.start >= p.start && span.start < p.end);
  return {
    docId: doc.id,
    docName: doc.name,
    page: page?.n,
    section: sectionLabel(outline, doc.id, span.start),
    text: span.text,
    start: span.start,
    end: span.end,
  };
}

/* ---------- fallback: what the author keeps coming back to ---------- */

function keyphraseConcepts(
  courseId: string,
  docs: SourceDoc[],
  outline: Outline,
  counts: Map<string, number>,
  taken: Set<string>,
): Concept[] {
  const ranked = [...counts.entries()]
    .filter(([phrase, n]) => n >= 4 && !taken.has(phrase) && contentWords(phrase).length >= 1 && phrase.length >= 5)
    // Prefer two-word phrases: single words are usually too general to define.
    .sort((a, b) => b[1] * (b[0].includes(' ') ? 1.6 : 1) - a[1] * (a[0].includes(' ') ? 1.6 : 1))
    .slice(0, 120);

  const out: Concept[] = [];
  const used = new Set(taken);

  for (const [phrase] of ranked) {
    if (out.length >= 40) break;
    if (used.has(phrase)) continue;

    const found = bestSentenceFor(phrase, docs);
    if (!found) continue;
    const { doc, sentence, surface } = found;

    const term = cleanTerm(surface);
    if (!term) continue;
    const chapter = chapterAt(outline, doc.id, sentence.start);
    if (!chapter) continue;

    used.add(phrase);
    out.push({
      id: `k-${phrase.replace(/\s+/g, '-').slice(0, 40)}-${sentence.start}`,
      courseId,
      chapterId: chapter.id,
      term,
      // The sentence itself is the definition here: it is what the reference
      // says about the phrase, and it is shown as such — never as "X is Y".
      definition: clamp(sentence.text, 320),
      kind: 'fact',
      difficulty: 2,
      weight: Math.min(1, (counts.get(phrase) ?? 4) / 30),
      citation: citationFor(doc, outline, sentence),
      related: [],
    });
  }
  return out;
}

/**
 * The sentence that says the most about a phrase: the one where it appears
 * alongside the most other content, and which reads as a statement about it.
 */
function bestSentenceFor(phrase: string, docs: SourceDoc[]) {
  let best: { doc: SourceDoc; sentence: Span; surface: string; score: number } | null = null;

  for (const doc of docs) {
    for (const sentence of splitSentences(doc.text.slice(0, 400_000))) {
      if (sentence.text.length < 60 || sentence.text.length > 300) continue;
      const at = findTerm(sentence.text, phrase);
      if (!at) continue;
      const surface = sentence.text.slice(at.start, at.end);
      // Earlier in the sentence means the sentence is about it.
      const score = contentWords(sentence.text).length - at.start / 20;
      if (!best || score > best.score) best = { doc, sentence, surface, score };
    }
  }
  return best;
}

/* ---------- shaping ---------- */

/**
 * Cap how many concepts any one chapter contributes, so a chapter that happens
 * to be written as a glossary cannot swamp the course and leave the rest of it
 * with nothing to ask about.
 */
function spreadOverChapters(concepts: Concept[], chapters: Chapter[]): Concept[] {
  const perChapter = Math.max(8, Math.ceil(260 / Math.max(1, chapters.length)));
  const out: Concept[] = [];
  for (const chapter of chapters) {
    const mine = concepts
      .filter((c) => c.chapterId === chapter.id)
      .sort((a, b) => b.weight - a.weight || a.citation.start - b.citation.start);
    out.push(...mine.slice(0, perChapter));
  }
  return out.sort((a, b) => a.citation.start - b.citation.start);
}

/**
 * Concepts whose definition names another concept — the edges of the map.
 * Same-chapter neighbours are considered first, because they are the ones the
 * author taught side by side, and the cap keeps the map readable not complete.
 */
function linkRelated(concepts: Concept[]) {
  for (const c of concepts) {
    const near = concepts.filter((o) => o.chapterId === c.chapterId);
    const far = concepts.filter((o) => o.chapterId !== c.chapterId);
    for (const other of [...near, ...far]) {
      if (c.related.length >= 4) break;
      if (other.id === c.id) continue;
      if (findTerm(c.definition, other.term)) c.related.push(other.id);
    }
  }
}
