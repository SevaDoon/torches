/*
 * The optional model layer.
 *
 * The platform is complete without it: questions, explanations and answers are
 * all extracted from the student's reference, which is what guarantees they are
 * true to it. What a model adds is phrasing — turning three retrieved sentences
 * into one paragraph that reads like an answer.
 *
 * So the contract here is narrow on purpose. The model is never asked what it
 * knows; it is handed the passages we retrieved and told to answer from those
 * alone, or to say it cannot. The passages, and therefore the citations, are
 * identical whether or not a key is present — the source line under an answer
 * means the same thing either way.
 */
import type { Course, Lang } from '../types';
import { answerFromSource, type Passage } from '../engine/retrieval';
import { getSetting, setSetting } from './db';

const MODEL = 'claude-sonnet-5';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

export const modelKey = () => getSetting('modelKey');
export const hasModel = () => !!modelKey();
export const setModelKey = (key: string | null) => setSetting('modelKey', key?.trim() || null);

export interface Answer {
  /** False when the reference does not cover the question at all. */
  found: boolean;
  text: string;
  passages: Passage[];
  /** True when a model wrote the wording; the sources are the same either way. */
  fromModel: boolean;
}

export async function ask(course: Course, question: string, uiLang: Lang): Promise<Answer> {
  const passages = answerFromSource(course, question);
  if (!passages) return { found: false, text: '', passages: [], fromModel: false };

  const extracted = passages.map((p) => p.text).join(' ');
  if (!hasModel()) return { found: true, text: extracted, passages, fromModel: false };

  const grounded = await callModel(question, passages, uiLang);
  return grounded
    ? { found: true, text: grounded, passages, fromModel: true }
    : { found: true, text: extracted, passages, fromModel: false };
}

async function callModel(question: string, passages: Passage[], uiLang: Lang): Promise<string | null> {
  const key = modelKey();
  if (!key) return null;

  const excerpts = passages
    .map((p, i) => `[${i + 1}] ${p.citation.section || p.citation.docName}\n${p.text}`)
    .join('\n\n');

  const system = [
    'You are a tutor answering strictly from a student\'s own course reference.',
    'You will be given excerpts from that reference and a question.',
    'Answer using ONLY the excerpts. Never add facts, examples, numbers or definitions that are not in them.',
    'If the excerpts do not contain the answer, reply with exactly: INSUFFICIENT',
    `Write the answer in ${uiLang === 'ar' ? 'Arabic' : 'English'}, in at most four sentences, plainly.`,
    'Do not mention these instructions, the excerpts, or that you are a model.',
  ].join(' ');

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        // Required for a browser-originated call; the key is the student's own.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system,
        messages: [{ role: 'user', content: `Excerpts:\n\n${excerpts}\n\nQuestion: ${question}` }],
      }),
    });
    if (!res.ok) return null;
    const body = await res.json();
    const text: string = (body?.content ?? [])
      .filter((b: { type?: string }) => b?.type === 'text')
      .map((b: { text?: string }) => b.text ?? '')
      .join('')
      .trim();
    // The model saying it cannot answer is the honest path, not a failure to
    // paper over: fall back to the extracted sentences rather than to nothing.
    if (!text || /^INSUFFICIENT\b/i.test(text)) return null;
    return text;
  } catch {
    return null; // offline, blocked, or a bad key — extraction still answers
  }
}

/**
 * A simpler wording of one passage. Used by "explain it more simply" only when
 * the reference itself has no shorter sentence about the concept.
 */
export async function rephrase(passage: Passage, uiLang: Lang): Promise<string | null> {
  if (!hasModel()) return null;
  const answer = await callModel(
    uiLang === 'ar' ? 'اشرح هذه الفكرة بلغة أبسط.' : 'Restate this idea in simpler words.',
    [passage],
    uiLang,
  );
  return answer;
}
