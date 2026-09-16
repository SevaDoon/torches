/*
 * One file in, one `SourceDoc` out — or an honest refusal.
 *
 * The refusal matters as much as the extraction. A scanned PDF and a PDF whose
 * fonts use private encodings both "succeed" at the byte level and produce
 * nonsense, and nonsense would flow straight through to questions the student
 * cannot answer. `looksLikeProse` is the gate that stops it, and the create
 * screen turns a refusal into "paste the text instead".
 */
import type { DocKind, SourceDoc } from '../types';
import { extractPdf } from './pdf';
import { extractDocx, extractPptx } from './office';
import { isFunctionWord, normalizeText, words } from './text';

export type ExtractResult =
  | { ok: true; doc: SourceDoc }
  | { ok: false; reason: 'unreadable' | 'too-little' | 'unsupported' };

const MIN_CHARS = 400;

export function kindOf(name: string): DocKind | null {
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  if (ext === 'pptx') return 'pptx';
  if (ext === 'txt' || ext === 'md' || ext === 'csv') return 'txt';
  return null;
}

export async function extractFile(file: File): Promise<ExtractResult> {
  const kind = kindOf(file.name);
  if (!kind) return { ok: false, reason: 'unsupported' };

  let raw: { text: string; pages: SourceDoc['pages'] };
  try {
    const buf = await file.arrayBuffer();
    if (kind === 'pdf') raw = await extractPdf(buf);
    else if (kind === 'docx') raw = await extractDocx(buf);
    else if (kind === 'pptx') raw = await extractPptx(buf);
    else raw = { text: await file.text(), pages: [] };
  } catch {
    return { ok: false, reason: 'unreadable' };
  }

  return finish(file.name, kind, raw.text, raw.pages);
}

/** Text the student pasted. Always usable — she typed it, so it is prose. */
export function fromPastedText(name: string, text: string): ExtractResult {
  return finish(name, 'paste', text, []);
}

function finish(
  name: string,
  kind: DocKind,
  rawText: string,
  rawPages: SourceDoc['pages'],
): ExtractResult {
  /*
   * Normalizing changes the length, so page offsets taken before it would
   * point at the wrong place. Each page is therefore normalized on its own and
   * the document is rebuilt from the results, which keeps every offset true.
   */
  let text: string;
  let pages: SourceDoc['pages'];

  if (rawPages.length) {
    const parts: string[] = [];
    pages = [];
    let at = 0;
    for (const page of rawPages) {
      const clean = normalizeText(rawText.slice(page.start, page.end));
      if (!clean) continue;
      pages.push({ n: page.n, start: at, end: at + clean.length });
      parts.push(clean);
      at += clean.length + 2;
    }
    text = parts.join('\n\n');
  } else {
    text = normalizeText(rawText);
    pages = [];
  }

  if (text.length < MIN_CHARS || !looksLikeProse(text)) {
    return { ok: false, reason: 'too-little' };
  }

  return {
    ok: true,
    doc: {
      id: `doc-${Math.random().toString(36).slice(2, 9)}`,
      name,
      kind,
      text,
      pages,
      chars: text.length,
    },
  };
}

/**
 * Does this read like language, or like the wreckage of a font we could not
 * decode? Cheap signals, all of which nonsense fails and any real page of a
 * textbook passes.
 *
 * The last one carries the weight. Glyph numbers read as letters come out as a
 * letter-substitution cipher — "Chapter" as "&KDSWHU" — which has letters, word
 * lengths and repetition exactly like prose. What it never has is "the", "of",
 * "في" and "من": grammatical words make up a third of any real sentence and
 * none of a cipher.
 */
export function looksLikeProse(text: string): boolean {
  const sample = text.slice(0, 20_000);
  const letters = (sample.match(/\p{L}/gu) ?? []).length;
  if (letters / sample.length < 0.55) return false;

  // Control characters are where a cipher's spaces went.
  const control = (sample.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) ?? []).length;
  if (control / sample.length > 0.002) return false;

  const tokens = words(sample);
  if (tokens.length < 60) return false;

  const avg = tokens.reduce((s, w) => s + w.length, 0) / tokens.length;
  if (avg < 2.2 || avg > 13) return false;

  // Real prose repeats its common words; mojibake almost never does.
  const counts = new Map<string, number>();
  for (const w of tokens) counts.set(w, (counts.get(w) ?? 0) + 1);
  const repeated = [...counts.values()].filter((n) => n > 2).length;
  if (repeated / counts.size <= 0.03) return false;

  return tokens.filter(isFunctionWord).length / tokens.length >= 0.06;
}
