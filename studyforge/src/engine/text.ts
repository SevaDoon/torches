/*
 * Text plumbing shared by everything downstream: normalizing what came out of a
 * file, cutting it into sentences, and telling Arabic from English.
 *
 * Every function here preserves offsets into the original document text. That
 * is not a detail — "Show source" highlights the exact span a question was
 * built from, and it can only do that if nothing along the way silently
 * reflows the text it measured.
 */

export interface Span {
  text: string;
  start: number;
  end: number;
}

const ARABIC = /[\u0600-\u06FF\u0750-\u077F]/;
const ARABIC_G = /[\u0600-\u06FF\u0750-\u077F]/g;
const LATIN_G = /[A-Za-z]/g;

/** Arabic if Arabic letters outnumber Latin ones. Ties go to English. */
export function detectLang(text: string): 'ar' | 'en' {
  const ar = (text.match(ARABIC_G) ?? []).length;
  const en = (text.match(LATIN_G) ?? []).length;
  return ar > en ? 'ar' : 'en';
}

export const hasArabic = (text: string) => ARABIC.test(text);

/**
 * Clean up what a parser produced without changing its length in ways we
 * cannot account for. Replacements here are all one-character-for-one so the
 * offsets a caller already holds stay valid; the only length changes happen
 * before any offsets are taken, in `extract`.
 */
export function normalizeText(raw: string): string {
  return (
    raw
      // one-for-one: odd spaces and quotes that break matching later
      .replace(/\r\n?/g, '\n')
      .replace(/[\u00A0\u2007\u202F\uFEFF]/g, ' ')
      .replace(/[‘’′]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, '-')
      // a word broken across a line by a hyphen is one word
      .replace(/(\w)-\n(\w)/g, '$1$2 ')
      // a single newline inside a paragraph is a soft wrap, not a break
      .replace(/([^\n.!?:;؟।])\n(?![\n\s*\-•\d])/g, '$1 ')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/*
 * Abbreviations that end in a full stop without ending a sentence. Splitting
 * after "e.g." or "Fig." produces fragments, and a fragment makes a nonsense
 * question — so this list is worth more than its size suggests.
 */
const ABBREV = [
  'e.g',
  'i.e',
  'etc',
  'vs',
  'cf',
  'fig',
  'eq',
  'no',
  'pp',
  'ch',
  'sec',
  'dr',
  'prof',
  'mr',
  'mrs',
  'ms',
  'st',
  'al',
  'approx',
  'min',
  'max',
  'std',
  'var',
];

const SENTENCE_END = /([.!?؟।])(["')\]]*)(\s+|\n)/g;

/**
 * Cut text into sentences, keeping each one's offsets into `text`.
 *
 * A line break ends a sentence here even without punctuation. Headings, slide
 * bullets and numbered steps rarely end in a full stop, and without this the
 * heading above a paragraph is swallowed into the first sentence of it — which
 * silently ruins the first definition of every section in the document.
 */
export function splitSentences(text: string, base = 0): Span[] {
  return splitBlocks(text, 0).flatMap((line) => sentencesInLine(line.text, base + line.start));
}

function sentencesInLine(text: string, base: number): Span[] {
  const out: Span[] = [];
  let start = 0;
  SENTENCE_END.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = SENTENCE_END.exec(text))) {
    const end = m.index + m[1].length + m[2].length;
    const before = text.slice(Math.max(0, m.index - 12), m.index).toLowerCase();

    // "3.14" and "Section 2." — a digit on both sides is not a sentence end.
    if (m[1] === '.' && /\d$/.test(before) && /^\s*\d/.test(text.slice(end))) continue;
    // A known abbreviation, or a single initial like "J." — keep reading.
    const lastWord = before.split(/[\s(]/).pop() ?? '';
    if (m[1] === '.' && (ABBREV.includes(lastWord) || /^[a-z]$/.test(lastWord))) continue;

    push(out, text, start, end, base);
    start = end + m[3].length;
  }
  push(out, text, start, text.length, base);
  return out;
}

function push(out: Span[], text: string, start: number, end: number, base: number) {
  const raw = text.slice(start, end);
  const lead = raw.length - raw.trimStart().length;
  const trimmed = raw.trim();
  if (trimmed.length < 2) return;
  out.push({ text: trimmed, start: base + start + lead, end: base + start + lead + trimmed.length });
}

/** Paragraph-sized blocks, offsets preserved. Headings are found among these. */
export function splitBlocks(text: string, base = 0): Span[] {
  const out: Span[] = [];
  let at = 0;
  for (const part of text.split('\n')) {
    const trimmed = part.trim();
    if (trimmed) {
      const lead = part.length - part.trimStart().length;
      out.push({ text: trimmed, start: base + at + lead, end: base + at + lead + trimmed.length });
    }
    at += part.length + 1;
  }
  return out;
}

/* ---------- words ---------- */

/** Words, lowercased, with Arabic left intact. Used for matching, not display. */
export function words(text: string): string[] {
  return (
    text
      .toLowerCase()
      .match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) ?? []
  );
}

const STOP_EN = new Set(
  `a an the and or but if then else of in on at to for from by with without within into onto over under
   is are was were be been being am do does did done have has had having will would shall should can could
   may might must this that these those it its they them their there here which who whom whose what when
   where why how all any both each few more most other some such no nor not only own same so than too very
   also as we you your our us i he she his her him one two three first second next last e.g i.e etc than
   thus hence therefore however because while during after before between above below about again further
   used using use uses called known example examples shown given figure table chapter section page`
    .split(/\s+/)
    .filter(Boolean),
);

// Stored in comparison form, because that is the form every lookup uses —
// "الذي" is looked up as "ذي", so it has to be stored as "ذي" too.
const STOP_AR = new Set(
  `في من على إلى عن مع هذا هذه ذلك تلك التي الذي الذين اللاتي هو هي هم هن كان كانت يكون تكون قد لقد
   أن إن أنه إنه ما لا لم لن كل بعض غير بين حيث كما أو أم ثم حتى إذا إذ لكن بل عند عندما قبل بعد
   خلال أثناء مثل مثلا أي أيضا كذلك ذلكم هناك هنالك نحن أنت أنتم له لها لهم به بها فيه فيها
   يمكن يجب ينبغي تعتبر يعتبر تسمى يسمى شكل جدول فصل صفحة الوحدة المحاضرة`
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeTerm),
);

/**
 * The comparison form of a word or phrase: harakat and tatweel dropped, alef
 * and ya and ta-marbuta folded, and the definite article removed from every
 * word — "الانحراف المعياري" and "انحراف معياري" are the same term.
 *
 * Only the article is stripped, never a bare و / ف / ب, because those are also
 * the first letters of ordinary words: taking them off turns "وسيط" into
 * "سيط" and stops it matching "الوسيط", which is the exact case this is for.
 */
export function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '') // harakat and tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/^(?:و?ال|بال|كال|فال|لل)(?=\p{L}{2,})/u, ''))
    .filter(Boolean)
    .join(' ');
}

export function isStopword(w: string): boolean {
  return STOP_EN.has(w) || STOP_AR.has(normalizeTerm(w)) || w.length < 3;
}

/** A grammatical word of either language — the glue every real sentence has. */
export function isFunctionWord(w: string): boolean {
  return STOP_EN.has(w.toLowerCase()) || STOP_AR.has(normalizeTerm(w));
}

/*
 * Many PDF writers lay Arabic out in *visual* order: the glyphs of a line are
 * stored left to right as they appear on the page, so the text comes out
 * reversed, letters and words alike. When the file does not say so, the
 * language does — Arabic words begin with the article "ال" constantly and end
 * with "لا" rarely, and function words like "في" read as "يف" backwards. The
 * PDF reader compares a line with its reverse using this score.
 */
export function arabicScore(line: string): number {
  const words = line.split(/\s+/);
  let score = words.reduce(
    (sum, w) => sum + (/^(?:[وفبكل]?ال)\p{L}/u.test(w) ? 1 : 0) + (isFunctionWord(w) ? 1 : 0),
    0,
  );
  // A sentence ends at the end of a line in reading order, and at the start
  // of one that has been stored backwards.
  if (/[.؟!،؛:]$/.test(line)) score++;
  if (/^[.؟!،؛:]/.test(line)) score--;
  return score;
}

/**
 * After a visually ordered line has been turned round, put back the runs that
 * were already in reading order: digits and Latin words sit inside a visual
 * line left to right, and turning them with everything else makes 2024 into
 * 4202.
 */
export function restoreLtrRuns(line: string): string {
  return line.replace(/[A-Za-z0-9][A-Za-z0-9.,:%/+\-_']*[A-Za-z0-9]/g, (run) => [...run].reverse().join(''));
}

/** Content words only — what a term or a search query really carries. */
export function contentWords(text: string): string[] {
  return words(text).filter((w) => !isStopword(w));
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find a term inside a sentence on a word boundary, tolerating the Arabic
 * definite article and simple English plurals. Returns -1 when it is not there.
 *
 * Arabic has no case and no reliable word boundary in a regex sense once the
 * article is glued on, so this matches on the normalized form and maps back.
 */
export function findTerm(sentence: string, term: string): { start: number; end: number } | null {
  const direct = sentence.toLowerCase().indexOf(term.toLowerCase());
  if (direct >= 0 && isBoundary(sentence, direct, direct + term.length)) {
    return { start: direct, end: direct + term.length };
  }
  const nTerm = normalizeTerm(term);
  if (!nTerm) return null;
  // Scan word windows of the same word-count and compare normalized forms.
  const tokens = [...sentence.matchAll(/\S+/g)];
  const size = nTerm.split(' ').length;
  for (let i = 0; i + size <= tokens.length; i++) {
    const start = tokens[i].index!;
    const last = tokens[i + size - 1];
    const end = last.index! + last[0].length;
    if (normalizeTerm(sentence.slice(start, end)) === nTerm) return { start, end };
  }
  return null;
}

function isBoundary(s: string, start: number, end: number): boolean {
  const before = start === 0 ? ' ' : s[start - 1];
  const after = end >= s.length ? ' ' : s[end];
  return !/[\p{L}\p{N}]/u.test(before) && !/[\p{L}\p{N}]/u.test(after);
}

/** Cut a long definition down for use as an option, on a word boundary. */
export function clamp(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd() + '…';
}

/** Deterministic shuffle: the same question shuffles the same way every time. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = (Math.imul(h, 48271) + 11) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
