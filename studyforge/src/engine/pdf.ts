/*
 * PDF text extraction, with no library.
 *
 * The browser already ships the hard part: `DecompressionStream('deflate')`
 * inflates the Flate streams a PDF is made of. What is left is walking the page
 * tree, pulling each page's content stream and its fonts, and reading the
 * text-showing operators out of it. That is a few hundred lines here instead of
 * a megabyte of dependency, and it keeps the promise on the landing page — the
 * file never leaves the browser.
 *
 * The fonts are not optional. Anything exported from Word or printed from a
 * browser writes its text as glyph numbers, not characters, and ships a
 * ToUnicode map to turn them back. Read the bytes without it and "Chapter"
 * comes out as "&KDSWHU" — which, worse than failing, still looks enough like
 * words to pass for prose.
 *
 * What it deliberately does not do: scanned PDFs (images of pages carry no
 * text at all), text inside Form XObjects, and fonts with private encodings and
 * no ToUnicode map. Those come out empty rather than as garbage, `extract.ts`
 * notices there is too little text, and the student is told to paste instead.
 */
import type { DocPage } from '../types';
import { arabicScore, restoreLtrRuns } from './text';

const latin1 = new TextDecoder('latin1');
const utf8 = new TextDecoder('utf-8', { fatal: true });

interface RawObj {
  dict: string;
  stream?: { start: number; end: number };
}

/** How to turn the bytes of a string shown in one font back into text. */
interface Font {
  /** Bytes per character code: 2 for CID fonts, 1 for simple fonts. */
  codeLen: 1 | 2;
  /** code -> text, from the ToUnicode CMap. Null when the font has none. */
  map: Map<number, string> | null;
  /**
   * code -> advance width in thousandths of an em. Needed to tell whether two
   * runs placed side by side are one word or two: writers split a word across
   * runs freely, and the only evidence of a space is the distance between them.
   */
  widths: Map<number, number>;
  defaultWidth: number;
}

interface Pdf {
  bytes: Uint8Array;
  objs: Map<number, RawObj>;
  fonts: Map<number, Font>;
}

export async function extractPdf(buf: ArrayBuffer): Promise<{ text: string; pages: DocPage[] }> {
  const bytes = new Uint8Array(buf);
  // latin1 keeps one character per byte, so string offsets are byte offsets.
  const raw = latin1.decode(bytes);

  const objs = scanObjects(raw);
  await expandObjectStreams(bytes, objs);
  const pdf: Pdf = { bytes, objs, fonts: new Map() };

  const pageIds = orderedPageIds(raw, objs);

  const chunks: string[] = [];
  const pages: DocPage[] = [];
  let at = 0;

  for (let i = 0; i < pageIds.length; i++) {
    const page = objs.get(pageIds[i]);
    if (!page) continue;
    const fonts = await pageFonts(pdf, pageIds[i]);
    let text = '';
    for (const contentId of contentRefs(page.dict)) {
      const obj = objs.get(contentId);
      if (!obj?.stream) continue;
      const data = await inflate(bytes.subarray(obj.stream.start, obj.stream.end), obj.dict);
      if (data) text += readTextOperators(data, fonts) + '\n';
    }
    text = tidy(text);
    if (!text) continue;
    pages.push({ n: i + 1, start: at, end: at + text.length });
    chunks.push(text);
    at += text.length + 2; // the "\n\n" join below
  }

  if (chunks.length === 0) {
    // No page tree we could follow: fall back to every content-looking stream,
    // as one page. Better a course with no page numbers than no course.
    const all: string[] = [];
    for (const obj of objs.values()) {
      if (!obj.stream) continue;
      const data = await inflate(bytes.subarray(obj.stream.start, obj.stream.end), obj.dict);
      if (data && /\b(Tj|TJ)\b/.test(data)) all.push(readTextOperators(data, new Map()));
    }
    const text = tidy(all.join('\n'));
    return { text, pages: text ? [{ n: 1, start: 0, end: text.length }] : [] };
  }

  return { text: chunks.join('\n\n'), pages };
}

function tidy(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line
        .replace(/[ \t]+/g, ' ')
        .trim()
        // "1.إدراك": a list number glued to its item by a tab the font had no glyph for
        .replace(/^(\d{1,3}[.)])(?=\p{L})/u, '$1 ')
        // "متاحة ." — a gap the layout left before closing punctuation
        .replace(/(\p{L}) ([.,;:!?؟،؛])(?=\s|$)/gu, '$1$2')
        .replace(STRANDED_STOP, '$1$2 '),
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Presentation-form Arabic letters and "ﬁ"-style ligatures folded back to the
 * characters a student would type.
 *
 * Fonts shared with Persian and Urdu also map Arabic heh, yeh and kaf to their
 * Persian and Urdu forms, which look the same on the page and match nothing
 * when searched. Those are folded back too — unless the line uses letters only
 * Persian has, in which case the forms are real and must stay.
 */
function foldForms(text: string): string {
  const folded = text.normalize('NFKC').replace(/ھ/g, 'ه');
  return /[پچژگ]/.test(folded) ? folded : folded.replace(/ی/g, 'ي').replace(/ک/g, 'ك');
}

/* ---------- object table ---------- */

function scanObjects(raw: string): Map<number, RawObj> {
  const objs = new Map<number, RawObj>();
  const re = /(\d+)\s+\d+\s+obj\b/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(raw))) {
    const id = Number(m[1]);
    const bodyStart = m.index + m[0].length;
    const endObj = raw.indexOf('endobj', bodyStart);
    const streamAt = raw.indexOf('stream', bodyStart);
    const hasStream = streamAt >= 0 && (endObj < 0 || streamAt < endObj);

    if (!hasStream) {
      objs.set(id, { dict: raw.slice(bodyStart, endObj < 0 ? bodyStart + 4096 : endObj) });
      continue;
    }

    const dict = raw.slice(bodyStart, streamAt);
    // The stream data begins after the EOL that follows the keyword.
    let start = streamAt + 'stream'.length;
    if (raw[start] === '\r') start++;
    if (raw[start] === '\n') start++;

    let end = declaredLength(dict, objs, raw, start);
    if (end < 0) {
      end = raw.indexOf('endstream', start);
      if (end < 0) end = raw.length;
      // trim the EOL that belongs to the keyword, not to the data
      if (raw[end - 1] === '\n') end--;
      if (raw[end - 1] === '\r') end--;
    }
    objs.set(id, { dict, stream: { start, end } });
    re.lastIndex = Math.max(re.lastIndex, end);
  }
  return objs;
}

/** /Length may be a number or a reference to one written later in the file. */
function declaredLength(dict: string, objs: Map<number, RawObj>, raw: string, start: number): number {
  const direct = /\/Length\s+(\d+)(?!\s+\d+\s+R)/.exec(dict);
  if (direct) return start + Number(direct[1]);
  const ref = /\/Length\s+(\d+)\s+\d+\s+R/.exec(dict);
  if (ref) {
    const target = objs.get(Number(ref[1]));
    const n = target && /^\s*(\d+)/.exec(target.dict);
    if (n) return start + Number(n[1]);
    // The length object may not have been scanned yet; look it up directly.
    const found = new RegExp(`(?:^|[^0-9])${ref[1]}\\s+\\d+\\s+obj\\s*(\\d+)`).exec(raw);
    if (found) return start + Number(found[1]);
  }
  return -1;
}

/**
 * Anything produced in the last twenty years packs most object dictionaries
 * into compressed object streams, so the page tree is invisible to a plain byte
 * scan. Unpacking them is what makes this work on a modern PDF at all.
 */
async function expandObjectStreams(bytes: Uint8Array, objs: Map<number, RawObj>) {
  for (const obj of [...objs.values()]) {
    if (!obj.stream || !/\/Type\s*\/ObjStm/.test(obj.dict)) continue;
    const data = await inflate(bytes.subarray(obj.stream.start, obj.stream.end), obj.dict);
    if (!data) continue;
    const n = Number(/\/N\s+(\d+)/.exec(obj.dict)?.[1] ?? 0);
    const first = Number(/\/First\s+(\d+)/.exec(obj.dict)?.[1] ?? 0);
    const header = data.slice(0, first).trim().split(/\s+/).map(Number);
    for (let i = 0; i < n; i++) {
      const id = header[i * 2];
      const at = header[i * 2 + 1];
      if (!Number.isFinite(id) || !Number.isFinite(at)) continue;
      const nextAt = i + 1 < n ? header[i * 2 + 3] : data.length - first;
      if (!objs.has(id)) objs.set(id, { dict: data.slice(first + at, first + nextAt) });
    }
  }
}

/* ---------- dictionaries ---------- */

/** The `<< … >>` starting at `at`, nested dictionaries included. */
function balanced(text: string, at: number): string {
  let depth = 0;
  for (let i = at; i < text.length - 1; i++) {
    if (text[i] === '<' && text[i + 1] === '<') {
      depth++;
      i++;
    } else if (text[i] === '>' && text[i + 1] === '>') {
      depth--;
      i++;
      if (depth === 0) return text.slice(at, i + 1);
    }
  }
  return text.slice(at);
}

/**
 * The value of `/Key` in a dictionary, as dictionary text — whether it was
 * written inline or as a reference to another object. Keys are matched whole,
 * so `/Font` never finds `/FontDescriptor`.
 */
function dictValue(dict: string, key: string, objs: Map<number, RawObj>): string | null {
  const m = new RegExp(`/${key}(?![A-Za-z0-9])\\s*`).exec(dict);
  if (!m) return null;
  const at = m.index + m[0].length;
  if (dict.startsWith('<<', at)) return balanced(dict, at);
  const ref = /^(\d+)\s+\d+\s+R/.exec(dict.slice(at));
  if (!ref) return null;
  const target = objs.get(Number(ref[1]))?.dict;
  if (!target) return null;
  const open = target.indexOf('<<');
  return open >= 0 ? balanced(target, open) : null;
}

const refOf = (dict: string, key: string): number | null => {
  const m = new RegExp(`/${key}(?![A-Za-z0-9])\\s*(\\d+)\\s+\\d+\\s+R`).exec(dict);
  return m ? Number(m[1]) : null;
};

/* ---------- the page tree ---------- */

function orderedPageIds(raw: string, objs: Map<number, RawObj>): number[] {
  const rootId = lastMatch(raw, /\/Root\s+(\d+)\s+\d+\s*R/g);
  const out: number[] = [];
  const seen = new Set<number>();

  const walk = (id: number, depth: number) => {
    if (depth > 60 || seen.has(id)) return;
    seen.add(id);
    const dict = objs.get(id)?.dict;
    if (!dict) return;
    if (/\/Type\s*\/Page(?![A-Za-z])/.test(dict)) {
      out.push(id);
      return;
    }
    const kids = /\/Kids\s*\[([^\]]*)\]/.exec(dict);
    if (!kids) return;
    for (const m of kids[1].matchAll(/(\d+)\s+\d+\s*R/g)) walk(Number(m[1]), depth + 1);
  };

  if (rootId !== null) {
    const catalog = objs.get(rootId)?.dict ?? '';
    const pagesId = refOf(catalog, 'Pages');
    if (pagesId !== null) walk(pagesId, 0);
  }

  if (out.length) return out;

  // No usable catalog: take every page object in the order it was written.
  for (const [id, obj] of objs) {
    if (/\/Type\s*\/Page(?![A-Za-z])/.test(obj.dict)) out.push(id);
  }
  return out;
}

function lastMatch(raw: string, re: RegExp): number | null {
  let found: number | null = null;
  for (const m of raw.matchAll(re)) found = Number(m[1]);
  return found;
}

function contentRefs(dict: string): number[] {
  const single = /\/Contents\s+(\d+)\s+\d+\s*R/.exec(dict);
  if (single) return [Number(single[1])];
  const array = /\/Contents\s*\[([^\]]*)\]/.exec(dict);
  if (!array) return [];
  return [...array[1].matchAll(/(\d+)\s+\d+\s*R/g)].map((m) => Number(m[1]));
}

/* ---------- fonts ---------- */

/** The page's fonts by resource name. Resources may be inherited from a parent. */
async function pageFonts(pdf: Pdf, pageId: number): Promise<Map<string, Font>> {
  let resources: string | null = null;
  let id: number | null = pageId;
  for (let depth = 0; id !== null && depth < 20 && !resources; depth++) {
    const dict: string = pdf.objs.get(id)?.dict ?? '';
    resources = dictValue(dict, 'Resources', pdf.objs);
    id = refOf(dict, 'Parent');
  }

  const out = new Map<string, Font>();
  const fontDict = resources && dictValue(resources, 'Font', pdf.objs);
  if (!fontDict) return out;

  for (const m of fontDict.matchAll(/\/([^\s/<>[\]()]+)\s+(\d+)\s+\d+\s+R/g)) {
    out.set(m[1], await fontOf(pdf, Number(m[2])));
  }
  return out;
}

async function fontOf(pdf: Pdf, id: number): Promise<Font> {
  const cached = pdf.fonts.get(id);
  if (cached) return cached;

  const dict = pdf.objs.get(id)?.dict ?? '';
  // A composite font reads two bytes per character unless its CMap says otherwise.
  const composite = /\/Subtype\s*\/Type0/.test(dict) || /\/Encoding\s*\/Identity-[HV]/.test(dict);
  const font: Font = { codeLen: composite ? 2 : 1, map: null, widths: new Map(), defaultWidth: 500 };

  const cmapId = refOf(dict, 'ToUnicode');
  const cmapObj = cmapId !== null ? pdf.objs.get(cmapId) : undefined;
  if (cmapObj?.stream) {
    const text = await inflate(pdf.bytes.subarray(cmapObj.stream.start, cmapObj.stream.end), cmapObj.dict);
    if (text) Object.assign(font, parseCMap(text, font.codeLen));
  }

  if (composite) {
    // Widths of a composite font live on its one descendant, as a /W array.
    const descendant = /\/DescendantFonts\s*\[\s*(\d+)\s+\d+\s+R/.exec(dict);
    const inner = descendant ? pdf.objs.get(Number(descendant[1]))?.dict ?? '' : '';
    font.defaultWidth = Number(/\/DW\s+([\d.]+)/.exec(inner)?.[1] ?? 1000);
    readCidWidths(arrayValue(inner, 'W', pdf.objs), font.widths);
  } else {
    const first = Number(/\/FirstChar\s+(\d+)/.exec(dict)?.[1] ?? 0);
    arrayValue(dict, 'Widths', pdf.objs)
      .match(/-?\d*\.?\d+/g)
      ?.forEach((w, k) => font.widths.set(first + k, Number(w)));
  }

  pdf.fonts.set(id, font);
  return font;
}

/** The `[ … ]` of `/Key`, inline or behind a reference, or "" when absent. */
function arrayValue(dict: string, key: string, objs: Map<number, RawObj>): string {
  const m = new RegExp(`/${key}(?![A-Za-z0-9])\\s*`).exec(dict);
  if (!m) return '';
  let text = dict;
  let at = m.index + m[0].length;
  const ref = /^(\d+)\s+\d+\s+R/.exec(dict.slice(at));
  if (ref) {
    text = objs.get(Number(ref[1]))?.dict ?? '';
    at = text.indexOf('[');
  }
  if (at < 0 || text[at] !== '[') return '';
  let depth = 0;
  for (let i = at; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']' && --depth === 0) return text.slice(at + 1, i);
  }
  return text.slice(at + 1);
}

/** A CID font's /W: `c [w1 w2 …]` lists and `first last w` ranges, mixed. */
function readCidWidths(array: string, into: Map<number, number>) {
  const tokens = array.match(/\[|\]|-?\d*\.?\d+/g) ?? [];
  let i = 0;
  while (i < tokens.length) {
    const start = Number(tokens[i++]);
    if (tokens[i] === '[') {
      i++;
      let code = start;
      while (i < tokens.length && tokens[i] !== ']') into.set(code++, Number(tokens[i++]));
      i++;
    } else if (i + 1 < tokens.length) {
      const last = Math.min(Number(tokens[i++]), start + 0x10000);
      const width = Number(tokens[i++]);
      for (let code = start; code <= last; code++) into.set(code, width);
    } else {
      break;
    }
  }
}

/** A ToUnicode CMap: `bfchar` pairs and `bfrange` runs, codes to UTF-16BE text. */
export function parseCMap(text: string, fallbackLen: 1 | 2): Pick<Font, 'codeLen' | 'map'> {
  const space = /begincodespacerange\s*<([0-9A-Fa-f]+)>/.exec(text);
  const codeLen: 1 | 2 = space ? (space[1].length <= 2 ? 1 : 2) : fallbackLen;
  const map = new Map<number, string>();

  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const m of block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/g)) {
      map.set(parseInt(m[1], 16), utf16(m[2]));
    }
  }

  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    const re = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(?:<([0-9A-Fa-f]*)>|\[([^\]]*)\])/g;
    for (const m of block[1].matchAll(re)) {
      const lo = parseInt(m[1], 16);
      // A malformed range must not turn into a sixty-thousand-step loop.
      const hi = Math.min(parseInt(m[2], 16), lo + 0x2000);
      if (m[4] !== undefined) {
        const list = [...m[4].matchAll(/<([0-9A-Fa-f]*)>/g)];
        list.forEach((d, k) => lo + k <= hi && map.set(lo + k, utf16(d[1])));
      } else {
        // An incrementing range: the last UTF-16 unit counts up with the code.
        const base = m[3] ?? '';
        const head = base.slice(0, -4);
        const tail = parseInt(base.slice(-4) || '0', 16);
        for (let code = lo; code <= hi; code++) {
          map.set(code, utf16(head + (tail + code - lo).toString(16).padStart(4, '0')));
        }
      }
    }
  }

  return { codeLen, map };
}

function utf16(hex: string): string {
  let out = '';
  for (let i = 0; i + 3 < hex.length; i += 4) out += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
  // A two-digit destination is a single byte, which some writers use for ASCII.
  if (!out && hex.length === 2) out = String.fromCharCode(parseInt(hex, 16));
  // The lam-alef ligature is one glyph for "لا", and some writers map it back
  // as "ال" — turning "الأول" into "األول". No ligature exists for alef then
  // lam (alef never joins forward), so that order is always the mistake.
  if (/^[اأإآ]ل$/.test(out)) out = out[1] + out[0];
  return out;
}

/** Width of one shown string, in thousandths of an em. */
function widthOf(bytes: string, font: Font | undefined): number {
  if (!font) return bytes.length * 500;
  let total = 0;
  for (let i = 0; i + font.codeLen <= bytes.length; i += font.codeLen) {
    const code =
      font.codeLen === 2 ? (bytes.charCodeAt(i) << 8) | bytes.charCodeAt(i + 1) : bytes.charCodeAt(i);
    total += font.widths.get(code) ?? font.defaultWidth;
  }
  return total;
}

/** The bytes of one shown string, as text, in the font it was shown in. */
function decode(bytes: string, font: Font | undefined): string {
  if (font?.map) {
    let out = '';
    for (let i = 0; i + font.codeLen <= bytes.length; i += font.codeLen) {
      const code =
        font.codeLen === 2 ? (bytes.charCodeAt(i) << 8) | bytes.charCodeAt(i + 1) : bytes.charCodeAt(i);
      out += font.map.get(code) ?? '';
    }
    return out;
  }
  // Glyph numbers with no map back to characters cannot be read at all. Saying
  // nothing is what lets the upload screen report it honestly.
  if (font?.codeLen === 2) return '';
  return plainString(bytes);
}

/**
 * A string in a simple font or outside any font: PDFDocEncoding (near enough to
 * latin-1), or UTF-16BE behind a byte-order mark, or raw UTF-8 that a writer
 * emitted as bytes.
 */
function plainString(s: string): string {
  if (s.length >= 2 && s.charCodeAt(0) === 0xfe && s.charCodeAt(1) === 0xff) {
    let out = '';
    for (let i = 2; i + 1 < s.length; i += 2) {
      out += String.fromCharCode((s.charCodeAt(i) << 8) | s.charCodeAt(i + 1));
    }
    return out;
  }
  if (/[-ÿ]/.test(s)) {
    try {
      return utf8.decode(Uint8Array.from(s, (ch) => ch.charCodeAt(0) & 0xff));
    } catch {
      /* not UTF-8 — keep the latin-1 reading */
    }
  }
  return s;
}

/* ---------- inflate ---------- */

async function inflate(data: Uint8Array, dict: string): Promise<string | null> {
  if (!/\/FlateDecode/.test(dict)) {
    // An uncompressed stream is legal and trivially readable.
    return /\/Filter/.test(dict) ? null : latin1.decode(data);
  }
  // A predictor means the bytes are row-filtered; that is only ever used for
  // cross-reference streams, which carry no text worth chasing.
  if (/\/Predictor\s+(\d+)/.test(dict)) return null;
  for (const format of ['deflate', 'deflate-raw'] as const) {
    try {
      // Some writers emit raw deflate with no zlib header, hence the second try.
      const stream = new Blob([data as unknown as BlobPart]).stream().pipeThrough(new DecompressionStream(format));
      return latin1.decode(await new Response(stream).arrayBuffer());
    } catch {
      /* try the next format */
    }
  }
  return null;
}

/* ---------- content stream -> text ---------- */

type Operand =
  /** `key` is the dictionary key the string was the value of, inside `<< >>`. */
  | { kind: 'str'; bytes: string; key?: string }
  | { kind: 'arr'; parts: Array<string | number> };

/** An affine matrix [a b c d e f], PDF's row-vector convention. */
type Matrix = [number, number, number, number, number, number];
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

/** m1 × m2 — apply m1 first, then m2. */
function times(m1: Matrix, m2: Matrix): Matrix {
  const [a, b, c, d, e, f] = m1;
  const [A, B, C, D, E, F] = m2;
  return [a * A + b * C, a * B + b * D, c * A + d * C, c * B + d * D, e * A + f * C + E, e * B + f * D + F];
}

const origin = (m: Matrix) => ({ x: m[4], y: m[5] });
const scaleOf = (m: Matrix) => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;

/** One piece of text as placed on the page, in device space. */
interface Run {
  /**
   * The text, as pieces. A piece is the smallest unit whose own order is
   * already right — one glyph, or one ActualText span such as a ligature — so
   * that a run stored in visual order can be reversed piece by piece without
   * turning "لأ" into "أل".
   */
  pieces: string[];
  start: number;
  end: number;
  y: number;
  size: number;
  /** Set when the run sits inside a /ReversedChars section, with its id. */
  reversed: number | null;
}

/** Marked content, which is where a writer says what the glyphs really mean. */
interface Marked {
  actual: string | null;
  /** The run the ActualText was attached to; later glyphs only widen it. */
  run: Run | null;
  reversed: number | null;
}

/**
 * Read the text-showing operators out of one content stream.
 *
 * This is a scanner, not a parser: it walks the stream collecting operands
 * until it reaches an operator it cares about. `Tf` selects the font every
 * later string is decoded with.
 *
 * Where each string lands decides what separates it from the next. Writers
 * split lines into runs wherever they like — Chrome cuts "Introduction" after
 * "Intr" — so a space goes in only where there is a visible gap, measured with
 * the font's glyph widths. A change of height is a new line; a bigger change,
 * or a change of type size, is a new paragraph, which is how a heading ends up
 * on a line of its own for the chapter finder.
 *
 * Right-to-left text is the other half. Writers mark glyphs stored in visual
 * order with /ReversedChars and give each glyph its real characters with
 * /ActualText; both are honoured. For writers that mark nothing, a line whose
 * reverse reads clearly more like Arabic is taken to be stored backwards.
 */
export function readTextOperators(content: string, fonts: Map<string, Font>): string {
  let out = '';
  let i = 0;
  let font: Font | undefined;
  let size = 12;
  let leading = 0;
  let ctm: Matrix = IDENTITY;
  const stack: Matrix[] = [];
  let tm: Matrix = IDENTITY; // where the next glyph goes
  let tlm: Matrix = IDENTITY; // the start of the current line
  const marked: Marked[] = [];
  let reversedSections = 0;

  let line: Run[] = [];
  let lastLine: { y: number; size: number } | null = null;

  let operands: Operand[] = [];
  let names: string[] = [];
  let nums: number[] = [];

  const moveLine = (tx: number, ty: number) => {
    tlm = times([1, 0, 0, 1, tx, ty], tlm);
    tm = tlm;
  };

  const flush = () => {
    if (line.length === 0) return;
    const text = joinLine(line);
    const first = line[0];
    if (text) {
      if (lastLine) {
        const dy = Math.abs(first.y - lastLine.y);
        const big = Math.max(first.size, lastLine.size);
        const newSize = big - Math.min(first.size, lastLine.size) > 0.15 * big;
        out += newSize || dy > 1.75 * big ? '\n\n' : '\n';
      }
      out += text;
      lastLine = { y: first.y, size: first.size };
    }
    line = [];
  };

  const show = (op: Operand | undefined) => {
    if (!op) return;
    const inActual = [...marked].reverse().find((m) => m.actual !== null);
    const reversed = [...marked].reverse().find((m) => m.reversed !== null)?.reversed ?? null;

    const pieces: string[] = [];
    let advance = 0; // in text space
    for (const part of op.kind === 'str' ? [op.bytes] : op.parts) {
      if (typeof part === 'number') {
        // A kerning number, in thousandths of an em; a wide negative one is
        // the gap between two words in writers that never emit a space.
        if (part < -180) pieces.push(' ');
        advance -= (part / 1000) * size;
        continue;
      }
      advance += (widthOf(part, font) / 1000) * size;
      if (inActual) continue;
      // Every glyph is its own piece, so a run stored in visual order — marked
      // or not — can be turned round without scrambling anything inside a glyph.
      const step = font?.codeLen ?? 1;
      for (let k = 0; k + step <= part.length; k += step) {
        const piece = decode(part.slice(k, k + step), font);
        if (piece) pieces.push(piece);
      }
    }

    const render = times(tm, ctm);
    const from = origin(render);
    tm = times([1, 0, 0, 1, advance, 0], tm);
    const to = origin(times(tm, ctm));
    const fontSize = size * scaleOf(render);
    const start = Math.min(from.x, to.x);
    const end = Math.max(from.x, to.x);

    if (inActual) {
      // The whole span means its ActualText, once, however many glyphs it has.
      if (inActual.run) {
        inActual.run.start = Math.min(inActual.run.start, start);
        inActual.run.end = Math.max(inActual.run.end, end);
        return;
      }
      pieces.push(inActual.actual!);
    }
    if (!pieces.join('')) return;

    const current = line[0];
    if (current && Math.abs(from.y - current.y) > 0.5 * Math.min(fontSize, current.size)) flush();
    const run: Run = { pieces, start, end, y: from.y, size: fontSize, reversed };
    line.push(run);
    if (inActual) inActual.run = run;
  };

  while (i < content.length) {
    const c = content[i];

    if (c === '(') {
      const { value, next } = readLiteral(content, i);
      operands.push({ kind: 'str', bytes: value, key: names[names.length - 1] });
      i = next;
      continue;
    }
    if (c === '<' && content[i + 1] !== '<') {
      const close = content.indexOf('>', i);
      if (close < 0) break;
      operands.push({ kind: 'str', bytes: hexBytes(content.slice(i + 1, close)), key: names[names.length - 1] });
      i = close + 1;
      continue;
    }
    if (c === '<' || c === '>') {
      i += 2; // the edge of an inline dictionary; its contents are read as they come
      continue;
    }
    if (c === '[') {
      const parts: Array<string | number> = [];
      let j = i + 1;
      while (j < content.length && content[j] !== ']') {
        const ch = content[j];
        if (ch === '(') {
          const { value, next } = readLiteral(content, j);
          parts.push(value);
          j = next;
        } else if (ch === '<') {
          const close = content.indexOf('>', j);
          if (close < 0) break;
          parts.push(hexBytes(content.slice(j + 1, close)));
          j = close + 1;
        } else {
          const num = /^[-+]?\d*\.?\d+/.exec(content.slice(j, j + 24));
          if (num) parts.push(Number(num[0]));
          j += num ? num[0].length : 1;
        }
      }
      operands.push({ kind: 'arr', parts });
      i = j + 1;
      continue;
    }
    if (c === '/') {
      const name = /^\/([^\s/<>[\]()]*)/.exec(content.slice(i, i + 128));
      names.push(name?.[1] ?? '');
      i += (name?.[0].length ?? 1) || 1;
      continue;
    }
    if (c === '%') {
      const eol = content.indexOf('\n', i);
      i = eol < 0 ? content.length : eol + 1;
      continue;
    }
    if (c === '-' || c === '.' || c === '+' || (c >= '0' && c <= '9')) {
      const num = /^[-+]?\d*\.?\d+/.exec(content.slice(i, i + 24));
      if (num) {
        nums.push(Number(num[0]));
        i += num[0].length;
        continue;
      }
    }

    const op = /^[A-Za-z'"*]+/.exec(content.slice(i, i + 8));
    if (!op) {
      i++;
      continue;
    }
    const name = op[0];
    i += name.length;
    const n = (k: number) => nums[nums.length - k] ?? 0;

    switch (name) {
      case 'q':
        stack.push(ctm);
        break;
      case 'Q':
        ctm = stack.pop() ?? IDENTITY;
        break;
      case 'cm':
        if (nums.length >= 6) ctm = times([n(6), n(5), n(4), n(3), n(2), n(1)], ctm);
        break;
      case 'BT':
        tm = tlm = IDENTITY;
        break;
      case 'Tf':
        font = fonts.get(names[names.length - 1] ?? '');
        size = n(1) || size;
        break;
      case 'TL':
        leading = n(1);
        break;
      case 'Tm':
        if (nums.length >= 6) tm = tlm = [n(6), n(5), n(4), n(3), n(2), n(1)];
        break;
      case 'Td':
        moveLine(n(2), n(1));
        break;
      case 'TD':
        leading = -n(1);
        moveLine(n(2), n(1));
        break;
      case 'T*':
        moveLine(0, -(leading || size * 1.2));
        break;
      case 'Tj':
      case 'TJ':
        show(operands[operands.length - 1]);
        break;
      case "'":
      case '"':
        moveLine(0, -(leading || size * 1.2));
        show(operands[operands.length - 1]);
        break;
      case 'BMC':
      case 'BDC': {
        const actual = operands.find((o) => o.kind === 'str' && o.key === 'ActualText');
        const isReversed = names[0] === 'ReversedChars';
        marked.push({
          actual: actual?.kind === 'str' ? plainString(actual.bytes) : null,
          run: null,
          reversed: isReversed ? ++reversedSections : null,
        });
        break;
      }
      case 'EMC':
        marked.pop();
        break;
      case 'ID': {
        // Inline image data is binary and would otherwise be scanned as text.
        const end = content.indexOf('EI', i);
        i = end < 0 ? content.length : end + 2;
        break;
      }
      default:
        break;
    }
    operands = [];
    names = [];
    nums = [];
  }
  flush();
  return out;
}

/** One line of runs, in reading order, with spaces where the page has gaps. */
function joinLine(runs: Run[]): string {
  // A reversed section is stored in visual order: turn it round as a whole.
  const merged: Run[] = [];
  for (const run of runs) {
    const prev = merged[merged.length - 1];
    if (prev && run.reversed !== null && prev.reversed === run.reversed) {
      prev.pieces.push(...run.pieces);
      prev.start = Math.min(prev.start, run.start);
      prev.end = Math.max(prev.end, run.end);
    } else {
      merged.push({ ...run, pieces: [...run.pieces] });
    }
  }
  const inOrder = merged.map((run) =>
    run.reversed !== null ? { ...run, pieces: glue(run.pieces, true).reverse() } : { ...run, pieces: glue(run.pieces, false) },
  );

  const all = inOrder.map((r) => r.pieces.join('')).join(' ');
  const rtl = (all.match(ARABIC) ?? []).length > (all.match(/[A-Za-z]/g) ?? []).length;

  const logical = foldForms(spaced(inOrder, rtl));
  if (!rtl || merged.some((r) => r.reversed !== null)) return logical;

  // Nothing was marked. Try the other reading, and keep it only if it reads
  // clearly more like Arabic — the fallback for writers that store visual
  // order without saying so. Word does exactly this, one word per run.
  // Reversing glyph by glyph rather than letter by letter is what keeps a
  // lam-alef ligature and a diacritic in one piece.
  // Only runs with Arabic in them are stored backwards; a run of digits, such
  // as a list number, is left to right already and must stay that way.
  const turned = merged.map((run) =>
    ARABIC_ONE.test(run.pieces.join(''))
      ? { ...run, pieces: [restoreLtrRuns(glue(run.pieces, true).reverse().join(''))] }
      : run,
  );
  const visual = foldForms(spaced(turned, true));
  const needed = Math.min(2, Math.ceil(logical.split(' ').length / 6));
  return arabicScore(visual) - arabicScore(logical) >= needed ? visual : logical;
}

/**
 * Attach each diacritic to its letter so the two travel together.
 *
 * In reading order a mark follows its letter. In visual order \u2014 what a
 * reversed run holds \u2014 the whole cluster is turned round, so the mark comes
 * first and belongs to the glyph after it. Either way the glued piece is
 * letter-then-mark, which is the order text is written in.
 */
function glue(pieces: string[], visual: boolean): string[] {
  const out: string[] = [];
  const isMark = (p: string | undefined) => !!p && /^\p{M}+$/u.test(p);
  for (let k = 0; k < pieces.length; k++) {
    const piece = pieces[k];
    if (!isMark(piece)) {
      out.push(piece);
      continue;
    }
    if (visual) {
      // Collect the run of marks and give them to the next real glyph.
      let marks = piece;
      while (isMark(pieces[k + 1])) marks += pieces[++k];
      const base = pieces[k + 1];
      if (base !== undefined && base !== ' ') {
        out.push(base + marks);
        k++;
      } else {
        out.push(marks);
      }
    } else if (out.length && out[out.length - 1] !== ' ') {
      out[out.length - 1] += piece;
    } else {
      out.push(piece);
    }
  }
  return out;
}

const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const ARABIC_ONE = new RegExp(ARABIC.source);

/**
 * "للطرفين .السوق" — Word places a full stop on the far side of the space
 * between two Arabic words. Real prose never has that shape, and left alone it
 * hides the sentence boundary and every definition that starts after it.
 */
const STRANDED_STOP = new RegExp(`(${ARABIC.source}) ([.،؛؟!:])(?=${ARABIC.source})`, 'gu');

/**
 * Runs ordered along the line — right to left for Arabic — and joined with a
 * space wherever the gap between neighbours is wider than a fifth of an em.
 */
function spaced(runs: Run[], rtl: boolean): string {
  const ordered = [...runs].sort((a, b) => (rtl ? b.start - a.start : a.start - b.start));
  let out = '';
  ordered.forEach((run, k) => {
    const text = run.pieces.join('');
    const prev = ordered[k - 1];
    if (prev) {
      const gap = rtl ? prev.start - run.end : run.start - prev.end;
      if (gap > 0.18 * run.size && !/\s$/.test(out) && !/^\s/.test(text)) out += ' ';
    }
    out += text;
  });
  return out;
}

function readLiteral(content: string, at: number): { value: string; next: number } {
  let i = at + 1;
  let depth = 1;
  let out = '';
  while (i < content.length) {
    const c = content[i];
    if (c === '\\') {
      const n = content[i + 1];
      const octal = /^[0-7]{1,3}/.exec(content.slice(i + 1, i + 4));
      if (octal) {
        out += String.fromCharCode(parseInt(octal[0], 8) & 0xff);
        i += 1 + octal[0].length;
        continue;
      }
      if (n === '\r' || n === '\n') {
        // A backslash at the end of a line continues the string.
        i += n === '\r' && content[i + 2] === '\n' ? 3 : 2;
        continue;
      }
      out += ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' } as Record<string, string>)[n] ?? n ?? '';
      i += 2;
      continue;
    }
    if (c === '(') depth++;
    if (c === ')' && --depth === 0) return { value: out, next: i + 1 };
    out += c;
    i++;
  }
  return { value: out, next: i };
}

function hexBytes(hex: string): string {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  const padded = clean.length % 2 ? clean + '0' : clean;
  let out = '';
  for (let i = 0; i < padded.length; i += 2) out += String.fromCharCode(parseInt(padded.slice(i, i + 2), 16));
  return out;
}
