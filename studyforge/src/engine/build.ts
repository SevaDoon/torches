/*
 * The pipeline: documents in, a playable course out.
 *
 * It is deliberately stage-by-stage and deliberately yields to the browser
 * between stages. Partly so the analysis screen can show real progress rather
 * than a fake bar, and partly because this all runs on the main thread of a
 * phone — a 200-page PDF would otherwise freeze the tab for several seconds
 * with nothing on screen to explain why.
 */
import type { Course, Goal, Lang, SourceDoc } from '../types';
import { buildOutline } from './structure';
import { buildConcepts } from './concepts';
import { generateQuestions } from './questions';
import { gate } from './validate';
import { detectLang } from './text';

export const STAGE_COUNT = 9;

/** Below this there is not enough to play, and we say so instead of shipping it. */
const MIN_QUESTIONS = 12;
const MIN_CONCEPTS = 6;

export class BuildFailed extends Error {}

export interface BuildInput {
  name: string;
  lang: Lang;
  goal: Goal;
  docs: SourceDoc[];
  isDemo?: boolean;
}

export async function buildCourse(
  input: BuildInput,
  onStage: (stage: number) => void,
): Promise<Course> {
  const courseId = `course-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  onStage(0); // reading the files — already done by the uploader, reported here
  await tick();

  onStage(1);
  const docs = input.docs.filter((d) => d.text.trim().length > 0);
  if (docs.length === 0) throw new BuildFailed('no text');
  await tick();

  onStage(2);
  const outline = buildOutline(courseId, docs, input.lang);
  await tick();

  onStage(3);
  const concepts = buildConcepts(courseId, docs, outline, input.lang);
  await tick();

  onStage(4); // the map is the related-concept links, already woven in
  await tick();

  onStage(5); // difficulty was rated per concept as it was built
  if (concepts.length < MIN_CONCEPTS) throw new BuildFailed('too few concepts');
  await tick();

  onStage(6);
  const generated = generateQuestions({ courseId, lang: input.lang, docs, outline, concepts });
  await tick();

  onStage(7);
  const { kept, rejected } = gate(generated, concepts);
  if (kept.length < MIN_QUESTIONS) throw new BuildFailed('too few questions');
  await tick();

  onStage(8);
  // Keep only the concepts something can actually be asked about: a concept
  // with no surviving question would sit on the map for ever as "not started".
  const asked = new Set(kept.map((q) => q.conceptId));
  const usedConcepts = concepts.filter((c) => asked.has(c.id));
  const usedChapters = outline.chapters.filter((ch) => usedConcepts.some((c) => c.chapterId === ch.id));
  await tick();

  return {
    id: courseId,
    name: input.name.trim(),
    lang: input.lang,
    goal: input.goal,
    createdAt: Date.now(),
    isDemo: !!input.isDemo,
    docs,
    chapters: usedChapters,
    concepts: usedConcepts,
    questions: kept.filter((q) => usedChapters.some((ch) => ch.id === q.chapterId)),
    rejected: rejected.length,
  };
}

/** Language of the reference, before the student confirms it on step 3. */
export function guessLang(docs: SourceDoc[]): Lang {
  return detectLang(docs.map((d) => d.text.slice(0, 20_000)).join(' '));
}

const tick = () => new Promise((r) => setTimeout(r, 16));
