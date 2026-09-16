/*
 * Finding the shape of the reference: its chapters, and the heading path that
 * every citation is labelled with.
 *
 * Nothing here invents a title. A chapter is named with the line the author
 * wrote; when a reference has no headings at all, the fallback sections are
 * named "Section 3" and are honest about being our division rather than his.
 */
import type { Chapter, Lang, SourceDoc } from '../types';
import { splitBlocks, type Span } from './text';

export interface Heading {
  docId: string;
  start: number;
  end: number;
  title: string;
  /** 1 = chapter-level, 2 = a heading inside one. */
  level: number;
}

export interface Outline {
  chapters: Chapter[];
  headings: Heading[];
}

/*
 * "\b" is defined on the Latin alphabet, so `الفصل\b` never matches: the gap
 * between a ل and a space is not a word boundary as far as the regex engine is
 * concerned. A lookahead for "not a letter or a digit" is the same idea and
 * works in both scripts.
 */
const CHAPTER_WORD =
  /^(chapter|unit|lecture|lesson|section|part|module|topic|الفصل|الوحدة|المحاضرة|الباب|الجزء|الدرس|الموضوع)(?![\p{L}\p{N}])/iu;

/** A numbered heading like "2.3 Conditional Probability" or "3-1 التوزيعات". */
const NUMBERED = /^([0-9\u0660-\u0669]+)([.\-][0-9\u0660-\u0669]+)*[\s.:–-]+\S/;

export function findHeadings(doc: SourceDoc): Heading[] {
  const blocks = splitBlocks(doc.text);
  const out: Heading[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const level = headingLevel(b, blocks[i - 1], blocks[i + 1]);
    if (!level) continue;
    out.push({ docId: doc.id, start: b.start, end: b.end, title: cleanTitle(b.text), level });
  }
  return out;
}

function headingLevel(block: Span, prev: Span | undefined, next: Span | undefined): 0 | 1 | 2 {
  const t = block.text.trim();
  if (t.length < 3 || t.length > 110) return 0;
  // A sentence that happens to be short is still a sentence.
  if (/[.!?؟]$/.test(t) && !CHAPTER_WORD.test(t)) return 0;
  if (/^(figure|table|source|شكل|جدول|المصدر)\b/i.test(t)) return 0;

  if (CHAPTER_WORD.test(t)) return 1;
  if (NUMBERED.test(t) && t.length < 90) {
    // A run of numbered lines is a list of steps, not a run of chapters —
    // and the steps of a procedure are what the ordering game is built from.
    const inList =
      (next && NUMBERED.test(next.text)) || (prev && NUMBERED.test(prev.text)) || false;
    if (inList) return 0;
    // "2 Probability" is a chapter; "2.3 Bayes" sits inside one.
    return /^[0-9\u0660-\u0669]+[.\-][0-9\u0660-\u0669]/.test(t) ? 2 : 1;
  }

  // An unnumbered line can still be a heading: short, unpunctuated, and
  // followed by a real paragraph rather than another short line.
  const looksLikeLabel = t.endsWith(':') || isTitleCase(t) || t === t.toUpperCase();
  if (looksLikeLabel && t.length < 70 && next && next.text.length > 120) return 2;
  return 0;
}

function isTitleCase(t: string): boolean {
  const words = t.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  if (words.length < 2 || words.length > 9) return false;
  const capped = words.filter((w) => /^[A-Z]/.test(w)).length;
  return capped / words.length >= 0.6;
}

function cleanTitle(t: string): string {
  const clean = t
    .replace(/^[\s•\-–—*]+/, '')
    .replace(/[:\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > 80 ? clean.slice(0, 78).trimEnd() + '…' : clean;
}

/* ---------- chapters ---------- */

/** A chapter the author declared, as opposed to one we cut for him. */
type RawChapter = Omit<Chapter, 'id' | 'order'> & { explicit: boolean };

export function buildOutline(courseId: string, docs: SourceDoc[], lang: Lang): Outline {
  const headings: Heading[] = [];
  const raw: RawChapter[] = [];

  for (const doc of docs) {
    const found = findHeadings(doc);
    headings.push(...found);

    const tops = found.filter((h) => h.level === 1);
    // A reference with one chapter heading is a reference with none: fall
    // through to its subheadings rather than calling the whole file "Chapter 1".
    const explicit = tops.length >= 2;
    const cuts = explicit ? tops : found.filter((h) => h.level <= 2);

    if (cuts.length >= 2) {
      if (cuts[0].start > 900) {
        raw.push({ courseId, docId: doc.id, title: introTitle(lang), start: 0, end: cuts[0].start, explicit: false });
      }
      cuts.forEach((h, i) => {
        raw.push({
          courseId,
          docId: doc.id,
          title: h.title,
          start: h.start,
          end: i + 1 < cuts.length ? cuts[i + 1].start : doc.text.length,
          explicit,
        });
      });
    } else {
      raw.push(...sliceEvenly(courseId, doc, lang));
    }
  }

  return { chapters: mergeSmall(raw), headings };
}

const introTitle = (lang: Lang) => (lang === 'ar' ? 'مقدمة' : 'Introduction');
const sectionTitle = (lang: Lang, n: number) => (lang === 'ar' ? `القسم ${n}` : `Section ${n}`);

/**
 * No headings anywhere. Cut along page boundaries when the format had them —
 * a slide deck divides itself honestly — and into even blocks otherwise.
 */
function sliceEvenly(courseId: string, doc: SourceDoc, lang: Lang): RawChapter[] {
  const target = Math.max(2500, Math.ceil(doc.text.length / 12));
  const out: RawChapter[] = [];
  let start = 0;
  let n = 1;

  if (doc.pages.length > 1) {
    let from = 0;
    for (let i = 0; i < doc.pages.length; i++) {
      const to = doc.pages[i].end;
      if (to - doc.pages[from].start >= target || i === doc.pages.length - 1) {
        out.push({
          courseId,
          docId: doc.id,
          title: sectionTitle(lang, n++),
          start: doc.pages[from].start,
          end: to,
          explicit: false,
        });
        from = i + 1;
      }
    }
    if (out.length) return out;
  }

  while (start < doc.text.length) {
    let end = Math.min(doc.text.length, start + target);
    // Cut on a paragraph break so a section never opens mid-sentence.
    const brk = doc.text.lastIndexOf('\n', end);
    if (brk > start + target * 0.5) end = brk;
    out.push({ courseId, docId: doc.id, title: sectionTitle(lang, n++), start, end, explicit: false });
    start = end;
  }
  return out;
}

/**
 * A slide deck gives every slide a heading, which would otherwise mean forty
 * "chapters" of two sentences each. Fold the short ones forward until each
 * chapter is big enough to be worth a round of questions.
 *
 * A chapter the author actually declared is never folded away, however short
 * it is. A short lecture with three "الفصل الأول / الثاني / الثالث" headings
 * has three chapters, and quietly turning them into one would throw away the
 * only structure the reference gave us.
 */
function mergeSmall(raw: RawChapter[]): Chapter[] {
  const total = raw.reduce((s, c) => s + (c.end - c.start), 0);
  const floor = Math.max(900, Math.floor(total / 18));
  const merged: RawChapter[] = [];

  for (const c of raw) {
    const last = merged[merged.length - 1];
    const foldable = last && !last.explicit && !c.explicit && last.docId === c.docId;
    if (foldable && last.end - last.start < floor) {
      last.end = c.end;
    } else {
      merged.push({ ...c });
    }
  }
  // The tail can end up under the floor with nothing after it to absorb it.
  if (merged.length > 1) {
    const last = merged[merged.length - 1];
    const prev = merged[merged.length - 2];
    if (!last.explicit && !prev.explicit && last.end - last.start < floor / 2 && prev.docId === last.docId) {
      prev.end = last.end;
      merged.pop();
    }
  }

  return merged.map(({ explicit: _explicit, ...c }, i) => ({ ...c, id: `ch-${i + 1}`, order: i + 1 }));
}

/* ---------- citation labels ---------- */

/**
 * "Chapter 2 › 2.3 Bayes' Theorem" — the heading path above an offset, which
 * is what a student would write down if she were citing the page herself.
 */
export function sectionLabel(outline: Outline, docId: string, offset: number): string {
  const before = outline.headings.filter((h) => h.docId === docId && h.start <= offset);
  const top = [...before].reverse().find((h) => h.level === 1);
  const sub = before[before.length - 1];

  const parts: string[] = [];
  if (top) parts.push(top.title);
  if (sub && sub !== top) parts.push(sub.title);
  if (parts.length) return parts.join(' › ');

  const chapter = outline.chapters.find((c) => c.docId === docId && offset >= c.start && offset < c.end);
  return chapter?.title ?? '';
}

export function chapterAt(outline: Outline, docId: string, offset: number): Chapter | undefined {
  return outline.chapters.find((c) => c.docId === docId && offset >= c.start && offset < c.end);
}
