/*
 * Word and PowerPoint, with no library.
 *
 * Both formats are a ZIP of XML, and the browser can already inflate a raw
 * deflate stream, so reading one is a central-directory walk plus a tag strip.
 * The same reasoning as `pdf.ts`: no dependency, and the file never leaves the
 * device.
 */
import type { DocPage } from '../types';

const utf8 = new TextDecoder('utf-8');

interface ZipEntry {
  name: string;
  data: Uint8Array;
  method: number;
}

/** Every file in the archive, by name. Only the entries asked for are inflated. */
export async function readZip(buf: ArrayBuffer, wanted: (name: string) => boolean) {
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  const eocd = findEocd(bytes);
  if (eocd < 0) throw new Error('not a zip archive');

  const count = view.getUint16(eocd + 10, true);
  let at = view.getUint32(eocd + 16, true);

  const out = new Map<string, string>();
  for (let i = 0; i < count && at + 46 <= bytes.length; i++) {
    if (view.getUint32(at, true) !== 0x02014b50) break;
    const method = view.getUint16(at + 10, true);
    const compressedSize = view.getUint32(at + 20, true);
    const nameLen = view.getUint16(at + 28, true);
    const extraLen = view.getUint16(at + 30, true);
    const commentLen = view.getUint16(at + 32, true);
    const localAt = view.getUint32(at + 42, true);
    const name = utf8.decode(bytes.subarray(at + 46, at + 46 + nameLen));

    if (wanted(name)) {
      // The local header repeats the name and extra field with its own lengths.
      const localNameLen = view.getUint16(localAt + 26, true);
      const localExtraLen = view.getUint16(localAt + 28, true);
      const dataAt = localAt + 30 + localNameLen + localExtraLen;
      const entry: ZipEntry = {
        name,
        method,
        data: bytes.subarray(dataAt, dataAt + compressedSize),
      };
      out.set(name, await inflateEntry(entry));
    }
    at += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

function findEocd(bytes: Uint8Array): number {
  // The end-of-central-directory record sits in the last 64KB, after a comment.
  const from = Math.max(0, bytes.length - 66_000);
  for (let i = bytes.length - 22; i >= from; i--) {
    if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
      return i;
    }
  }
  return -1;
}

async function inflateEntry(entry: ZipEntry): Promise<string> {
  if (entry.method === 0) return utf8.decode(entry.data);
  const stream = new Blob([entry.data as unknown as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  return utf8.decode(await new Response(stream).arrayBuffer());
}

/* ---------- Word ---------- */

export async function extractDocx(buf: ArrayBuffer): Promise<{ text: string; pages: DocPage[] }> {
  const files = await readZip(buf, (n) => n === 'word/document.xml' || /^word\/(header|footer)\d*\.xml$/.test(n));
  const xml = files.get('word/document.xml');
  if (!xml) throw new Error('no document.xml');

  const paragraphs: string[] = [];
  for (const p of xml.split(/<\/w:p>/)) {
    // <w:t> holds the runs of visible text; <w:tab/> and breaks hold the layout.
    const text = [...p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
      .map((m) => unescapeXml(m[1]))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) paragraphs.push(text);
  }

  // Blank lines, not single ones: a Word paragraph is a real break, and a
  // single newline is what the cleanup downstream treats as a soft wrap to be
  // joined — which would glue every heading onto the paragraph below it.
  const text = paragraphs.join('\n\n');
  // A Word file has no page breaks we can trust — paginating is the renderer's
  // job, not the document's — so a citation from here names its section only.
  return { text, pages: [] };
}

/* ---------- PowerPoint ---------- */

export async function extractPptx(buf: ArrayBuffer): Promise<{ text: string; pages: DocPage[] }> {
  const files = await readZip(buf, (n) => /^ppt\/(slides\/slide|notesSlides\/notesSlide)\d+\.xml$/.test(n));

  const slides = [...files.entries()]
    .filter(([n]) => n.startsWith('ppt/slides/'))
    .map(([name, xml]) => ({ n: Number(/(\d+)\.xml$/.exec(name)?.[1] ?? 0), xml }))
    .sort((a, b) => a.n - b.n);

  const chunks: string[] = [];
  const pages: DocPage[] = [];
  let at = 0;

  for (const slide of slides) {
    const notes = files.get(`ppt/notesSlides/notesSlide${slide.n}.xml`);
    const lines = [...slideLines(slide.xml), ...(notes ? slideLines(notes) : [])];
    // Each bullet on its own paragraph for the same reason: bullets rarely end
    // in a full stop, so single newlines would run the whole slide together.
    const text = lines.join('\n\n').trim();
    if (!text) continue;
    pages.push({ n: slide.n, start: at, end: at + text.length });
    chunks.push(text);
    at += text.length + 2;
  }

  return { text: chunks.join('\n\n'), pages };
}

function slideLines(xml: string): string[] {
  const out: string[] = [];
  // Each <a:p> is a bullet or a title line; <a:t> runs hold its text.
  for (const p of xml.split(/<\/a:p>/)) {
    const text = [...p.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
      .map((m) => unescapeXml(m[1]))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) out.push(text);
  }
  return out;
}

function unescapeXml(s: string): string {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, '&');
}
