/*
 * Self-check. Runs in dev on every page load (see main.tsx) and prints to the
 * console. It exists because the risky parts of this product are invisible in
 * the UI: whether a generated question is really grounded in the reference,
 * whether the gate rejects what it should, whether mastery moves the way the
 * schedule assumes.
 *
 * It runs the whole pipeline over the bundled sample reference, so it exercises
 * the real extractor, the real generator and the real validator — the same code
 * an uploaded PDF goes through. Add a case here whenever you change any of it;
 * it is this project's whole test suite, and it costs nothing because it is
 * already running.
 */
import type { Course, McqQuestion } from '../types';
import { DEMO_NAME, DEMO_REFERENCE } from './demoReference';
import { fromPastedText, looksLikeProse } from '../engine/extract';
import { extractPdf } from '../engine/pdf';
import { buildCourse } from '../engine/build';
import { check, gate } from '../engine/validate';
import { answerFromSource, search } from '../engine/retrieval';
import { findTerm, normalizeTerm, seededShuffle, splitSentences } from '../engine/text';
import {
  HINT_LEVELS,
  answerTextOf,
  examDistribution,
  hintFor,
  planSession,
  recommend,
} from '../engine/session';
import {
  applyAttempt,
  blankConceptState,
  levelFromXp,
  nextDifficulty,
  scoreAnswer,
  stateOf,
  xpForLevel,
} from '../services/progress';
import { blankLearner, blankProgress } from '../services/learner';
import { demoProgress } from './demoCourse';

const problems: string[] = [];
const ok = (condition: unknown, message: string) => {
  if (!condition) problems.push(message);
};

/* ---------- text ---------- */

function checkText() {
  const sentences = splitSentences('Values vary, e.g. 3.5 and 4.2. The mean is 3.85. Done.');
  ok(sentences.length === 3, `sentence split: expected 3, got ${sentences.length}`);
  ok(
    sentences[0].text.includes('e.g. 3.5'),
    'sentence split: broke on an abbreviation or a decimal point',
  );

  const source = 'The standard deviation is the square root of the variance.';
  const at = findTerm(source, 'standard deviation');
  ok(at?.start === 4, 'findTerm: missed a plain term');
  ok(!findTerm(source, 'deviation is the square root of the variance and more'), 'findTerm: matched too much');
  ok(findTerm('يُعرَّف الوسيط بأنه القيمة الوسطى', 'وسيط'), 'findTerm: missed a term behind the Arabic article');
  ok(normalizeTerm('الانحرافُ المعياري') === normalizeTerm('انحراف معياري'), 'normalizeTerm: article or harakat leaked');

  const a = seededShuffle([1, 2, 3, 4, 5], 'q-1');
  const b = seededShuffle([1, 2, 3, 4, 5], 'q-1');
  ok(a.join() === b.join(), 'seededShuffle: not deterministic — options would move between renders');

  ok(!looksLikeProse('ÿØÿà JFIF ÿÛ C  %# , #&\')*) -0-(0%()('), 'looksLikeProse: accepted binary noise');
  ok(looksLikeProse(DEMO_REFERENCE), 'looksLikeProse: rejected real prose');
}

/* ---------- PDF ---------- */

/*
 * A PDF written the way real ones are: a composite font whose text is glyph
 * numbers with a ToUnicode map, a word split across runs, a heading in a
 * bigger size, and Arabic stored in visual order with a ligature — once marked
 * with /ReversedChars and /ActualText as Chrome does, once unmarked with the
 * ligature mapped backwards as some writers do.
 */
async function syntheticPdf(): Promise<ArrayBuffer> {
  const code = (ch: string) => (ch === ' ' ? 0x20 : ch.charCodeAt(0) - 96).toString(16).padStart(4, '0');
  const hex = (text: string) => `<${[...text].map(code).join('')}>`;
  // Arabic glyphs: 0101 lam, 0102 waw, 0103 lam-alef-hamza, 0104 alef, 0106 the same ligature mapped backwards.
  const content = [
    'BT /F1 20 Tf 1 0 0 1 10 700 Tm', `${hex('chapter one')} Tj`, 'ET',
    'BT /F1 10 Tf 1 0 0 1 10 670 Tm', `${hex('the mean is')} Tj`,
    `55 0 Td ${hex(' aver')} Tj`, // starts exactly where the last run ended
    `25 0 Td ${hex('age')} Tj`, // so does this: one word, "average"
    `40 0 Td ${hex('of')} Tj`, // a visible gap: a new word
    'ET',
    'BT /F1 10 Tf 1 0 0 1 10 655 Tm',
    '/ReversedChars BMC <01010102> Tj',
    '/Span << /ActualText <FEFF06440623> >> BDC <0103> Tj EMC',
    '<0104> Tj EMC ET',
    'BT /F1 10 Tf 1 0 0 1 10 640 Tm <0104010601020101> Tj ET',
  ].join('\n');

  const cmap = [
    'begincmap 1 begincodespacerange <0000> <FFFF> endcodespacerange',
    '2 beginbfchar <0020> <0020> <0101> <0644> endbfchar',
    '1 beginbfrange <0001> <001A> <0061> endbfrange',
    '4 beginbfchar <0102> <0648> <0103> <06440623> <0104> <0627> <0106> <06230644> endbfchar',
    'endcmap',
  ].join('\n');

  const latin = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));
  const deflated = new Uint8Array(
    await new Response(new Blob([content]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer(),
  );
  const parts: Uint8Array[] = [latin('%PDF-1.7\n')];
  const obj = (n: number, body: string) => parts.push(latin(`${n} 0 obj\n${body}\nendobj\n`));
  const stream = (n: number, dict: string, data: Uint8Array) =>
    parts.push(latin(`${n} 0 obj\n<< ${dict} /Length ${data.length} >>\nstream\n`), data, latin('\nendstream\nendobj\n'));

  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, '<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>');
  stream(4, '/Filter /FlateDecode', deflated);
  obj(5, '<< /Type /Font /Subtype /Type0 /Encoding /Identity-H /DescendantFonts [6 0 R] /ToUnicode 7 0 R >>');
  obj(6, '<< /Type /Font /Subtype /CIDFontType2 /DW 500 /W [257 [500 500] 259 262 500] >>');
  stream(7, '', latin(cmap));
  parts.push(latin('trailer\n<< /Root 1 0 R >>\n%%EOF\n'));

  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out.buffer;
}

async function checkPdf() {
  const { text, pages } = await extractPdf(await syntheticPdf());
  ok(pages.length === 1, `pdf: expected one page, got ${pages.length}`);
  const expected = 'chapter one\n\nthe mean is average of\nالأول\nالأول';
  ok(text === expected, `pdf: read ${JSON.stringify(text)}, expected ${JSON.stringify(expected)}`);

  // The failure that started this: glyph numbers read as letters. It has the
  // letters, word lengths and repetition of prose, and must still be refused.
  const space = String.fromCharCode(3);
  const cipher = DEMO_REFERENCE.replace(/[a-z]/gi, (c) => String.fromCharCode(c.charCodeAt(0) - 29)).replace(/ /g, space);
  ok(!looksLikeProse(cipher), 'looksLikeProse: accepted text shown in an undecoded font');
  const lettersOnly = DEMO_REFERENCE.replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 94) % 26) + 97));
  ok(!looksLikeProse(lettersOnly), 'looksLikeProse: accepted a letter-substitution cipher');
}

/* ---------- scoring & progress ---------- */

function checkScoring() {
  const base = { correct: true, difficulty: 1 as const, seconds: 30, combo: 0, hintsUsed: 0, multiplier: 1 };
  const first = scoreAnswer({ ...base, attempt: 0 }).xp;
  const second = scoreAnswer({ ...base, attempt: 1 }).xp;
  ok(first > second * 2, 'scoring: a second-try answer is worth too much');
  ok(scoreAnswer({ ...base, attempt: 0, hintsUsed: 3 }).xp < first, 'scoring: hints were free');
  ok(scoreAnswer({ ...base, attempt: 0, difficulty: 3 }).xp > first, 'scoring: difficulty paid nothing');
  ok(scoreAnswer({ ...base, correct: false, attempt: 0 }).xp === 0, 'scoring: a wrong answer scored');
  ok(
    scoreAnswer({ ...base, attempt: 0, multiplier: 2 }).xp === first * 2,
    'scoring: the mode multiplier did not apply',
  );

  ok(xpForLevel(1) === 0 && levelFromXp(0) === 1, 'levels: level 1 does not start at zero');
  ok(levelFromXp(xpForLevel(5)) === 5, 'levels: the curve and its inverse disagree');

  ok(nextDifficulty(1, [true, true, true]) === 2, 'ladder: three right did not move up');
  ok(nextDifficulty(2, [false, false]) === 1, 'ladder: two wrong did not move down');
  ok(nextDifficulty(2, [true, false, true]) === 2, 'ladder: moved on a mixed run');
  ok(nextDifficulty(3, [true, true, true]) === 3, 'ladder: went past the top');
}

function checkMastery() {
  let state = blankConceptState();
  ok(stateOf(state) === 'new', 'mastery: an untouched concept is not "new"');

  for (let i = 0; i < 4; i++) state = applyAttempt(state, true, true, 'recall');
  ok(stateOf(state) === 'mastered', `mastery: four clean answers did not master it (${state.mastery})`);
  ok(state.nextReview > Date.now() + 2 * 86_400_000, 'schedule: a mastered concept comes back too soon');

  const after = applyAttempt(state, false, false, 'recall');
  ok(after.mastery < state.mastery * 0.6, 'mastery: a miss did not cost enough');
  ok(after.box <= state.box - 2 || after.box === 0, 'schedule: a miss did not shorten the interval');
  ok(after.nextReview <= Date.now() + 86_400_000, 'schedule: a missed concept is not due again soon');
  ok(after.probes.length === 0, 'mastery: a miss left the passed probes in place');

  // One clean answer is not mastery — the whole review schedule leans on this.
  const once = applyAttempt(blankConceptState(), true, true, 'recall');
  ok(stateOf(once) !== 'mastered', 'mastery: one right answer mastered a concept');
}

/* ---------- the pipeline ---------- */

async function checkPipeline(): Promise<Course | null> {
  const extracted = fromPastedText(`${DEMO_NAME}.txt`, DEMO_REFERENCE);
  if (!extracted.ok) {
    problems.push(`pipeline: the bundled sample reference did not extract (${extracted.reason})`);
    return null;
  }

  let course: Course;
  try {
    course = await buildCourse(
      { name: DEMO_NAME, lang: 'en', goal: 'exam', docs: [extracted.doc], isDemo: true },
      () => {},
    );
  } catch (error) {
    problems.push(`pipeline: the sample reference failed to build (${String(error)})`);
    return null;
  }

  ok(course.chapters.length >= 5, `pipeline: only ${course.chapters.length} chapters found`);
  ok(course.concepts.length >= 30, `pipeline: only ${course.concepts.length} concepts found`);
  ok(course.questions.length >= 60, `pipeline: only ${course.questions.length} questions survived`);

  // Every type should be represented, or a whole game surface is untested.
  for (const type of ['mcq', 'truefalse', 'blank', 'match', 'order', 'error'] as const) {
    ok(course.questions.some((q) => q.type === type), `pipeline: no ${type} questions were generated`);
  }
  for (const probe of ['recall', 'discrimination', 'application'] as const) {
    ok(course.questions.some((q) => q.probe === probe), `pipeline: no ${probe} questions were generated`);
  }

  // Chapters and concepts must line up, or the map and the modes disagree.
  const chapterIds = new Set(course.chapters.map((c) => c.id));
  ok(course.concepts.every((c) => chapterIds.has(c.chapterId)), 'pipeline: a concept points at no chapter');
  const conceptIds = new Set(course.concepts.map((c) => c.id));
  ok(course.questions.every((q) => conceptIds.has(q.conceptId)), 'pipeline: a question points at no concept');

  return course;
}

/* ---------- Arabic ---------- */

/*
 * A short Arabic reference, because the Arabic path is the one this is built
 * for and none of the checks above touch it: the definition patterns, the
 * "الفصل ن" headings, the article-insensitive matching and the Arabic question
 * stems are all separate code from their English counterparts.
 */
const ARABIC_FIXTURE = `الفصل الأول مفاهيم أساسية

التسويق هو مجموعة الأنشطة التي تهدف إلى تحديد حاجات العملاء وتلبيتها بما يحقق قيمة للطرفين. السوق هو مجموعة المشترين الحاليين والمحتملين لمنتج معين. الحصة السوقية هي نسبة مبيعات الشركة إلى إجمالي مبيعات السوق خلال فترة محددة. العلامة التجارية هي الاسم والرمز والتصميم الذي يميز منتجات الشركة عن منتجات المنافسين. يُعرَّف تجزئة السوق بأنه تقسيم السوق إلى مجموعات متجانسة من العملاء تتشابه في الحاجات أو السلوك الشرائي.

الفصل الثاني المزيج التسويقي

المزيج التسويقي هو مجموعة الأدوات التي تستخدمها الشركة للتأثير في الطلب على منتجاتها. المنتج هو كل ما يمكن تقديمه للسوق لإشباع حاجة أو رغبة لدى العميل. التسعير هو تحديد المبلغ النقدي الذي يدفعه العميل مقابل الحصول على المنتج. التوزيع هو مجموعة الأنشطة التي توصل المنتج من المصنع إلى المستهلك النهائي. الترويج هو الاتصال بالعملاء بهدف إعلامهم وإقناعهم بالمنتج. ترتفع تكلفة التوزيع بسبب زيادة عدد الوسطاء بين المصنع والمستهلك النهائي.

الفصل الثالث سلوك المستهلك

سلوك المستهلك هو دراسة الطريقة التي يختار بها الأفراد المنتجات ويشترونها ويستخدمونها. الحاجة هي شعور بالنقص يدفع الفرد إلى البحث عن وسيلة لإشباعه. الدافع هو الحاجة التي بلغت شدة كافية لتوجيه السلوك نحو الإشباع. الإدراك هو العملية التي يفسر بها الفرد المعلومات التي يستقبلها عن المنتج.

تمر عملية الشراء بخطوات محددة.
1. إدراك الحاجة وتحديد المشكلة التي يريد العميل حلها.
2. البحث عن المعلومات من مصادر شخصية أو تجارية متاحة.
3. تقييم البدائل المتاحة وفق معايير يضعها العميل نفسه.
4. اتخاذ قرار الشراء واختيار المنتج الأنسب من البدائل.
5. تقييم ما بعد الشراء ومقارنة الأداء الفعلي بالتوقعات.
`;

async function checkArabic() {
  const extracted = fromPastedText('مبادئ التسويق.txt', ARABIC_FIXTURE);
  if (!extracted.ok) {
    problems.push(`arabic: the fixture did not extract (${extracted.reason})`);
    return;
  }
  ok(extracted.doc.text.includes('التسويق هو'), 'arabic: normalizing damaged the text');

  let course: Course;
  try {
    course = await buildCourse(
      { name: 'مبادئ التسويق', lang: 'ar', goal: 'understand', docs: [extracted.doc] },
      () => {},
    );
  } catch (error) {
    problems.push(`arabic: the fixture failed to build (${String(error)})`);
    return;
  }

  // Three declared chapters must survive; folding them away would throw out
  // the only structure the author gave us.
  ok(course.chapters.length === 3, `arabic: expected 3 chapters, got ${course.chapters.length}`);
  ok(course.concepts.length >= 10, `arabic: only ${course.concepts.length} concepts found`);
  ok(
    course.concepts.some((c) => normalizeTerm(c.term) === normalizeTerm('المزيج التسويقي')),
    'arabic: a plain "X هو Y" definition was not picked up',
  );
  ok(
    course.concepts.some((c) => normalizeTerm(c.term) === normalizeTerm('تجزئة السوق')),
    'arabic: the "يُعرَّف X بأنه Y" pattern was not picked up',
  );
  ok(course.questions.some((q) => q.type === 'order'), 'arabic: the numbered steps produced no ordering question');
  ok(
    course.questions.every((q) => q.lang === 'ar'),
    'arabic: a question was written in the wrong language',
  );
  ok(
    course.questions.some((q) => q.prompt.includes('مرجعك')),
    'arabic: question stems were not written in Arabic',
  );

  const doc = course.docs[0];
  ok(
    course.questions.every((q) => doc.text.slice(q.citation.start, q.citation.end) === q.citation.text),
    'arabic: a citation does not match the document at its own offsets',
  );
}

/* ---------- the promise the whole product rests on ---------- */

function checkGrounding(course: Course) {
  const doc = course.docs[0];

  for (const question of course.questions) {
    const citation = question.citation;
    const slice = doc.text.slice(citation.start, citation.end);
    if (slice !== citation.text) {
      problems.push(`grounding: ${question.id} cites a span that is not what the document says there`);
      break;
    }
  }

  for (const concept of course.concepts) {
    // A definition has to be text from the document, not a composition of it.
    if (!doc.text.includes(concept.definition.slice(0, Math.min(40, concept.definition.length)))) {
      problems.push(`grounding: the definition of "${concept.term}" is not in the reference`);
      break;
    }
  }

  // No question may contain its own answer in the stem.
  for (const question of course.questions) {
    if (question.type !== 'mcq') continue;
    const answer = question.options[question.answer];
    if (answer.length > 12 && normalizeTerm(question.prompt).includes(normalizeTerm(answer))) {
      problems.push(`grounding: ${question.id} gives its answer away in the prompt`);
      break;
    }
  }

  // A fill-in-the-blank answer must be in the sentence it was cut from.
  for (const question of course.questions) {
    if (question.type !== 'blank') continue;
    if (!findTerm(question.citation.text, question.accept[0])) {
      problems.push(`grounding: ${question.id} accepts a word that is not in its source`);
      break;
    }
  }
}

/**
 * A hint that contains its own answer is worse than no hint: it turns the
 * ladder into a reveal button. The leaks here were not obvious — on "which
 * term is this?" the answer is the concept's own term, and an option is often
 * a clamped definition that never appears verbatim in the source.
 */
function checkHints(course: Course) {
  const byConcept = new Map(course.concepts.map((c) => [c.id, c]));

  for (const question of course.questions) {
    const answer = answerTextOf(question);
    // "True" and "False" are ordinary words; only long answers can leak.
    if (question.type === 'truefalse' || answer.length < 8) continue;
    const bare = normalizeTerm(answer.replace(/…+\s*$/, ''));
    if (bare.length < 8) continue;

    for (let level = 1; level <= HINT_LEVELS; level++) {
      const hint = hintFor(question, byConcept.get(question.conceptId), level);
      if (hint && normalizeTerm(hint.text).includes(bare)) {
        problems.push(`hints: ${question.id} hint ${level} contains its own answer`);
        return;
      }
    }
  }
}

function checkGate(course: Course) {
  const sample = course.questions.find((q): q is McqQuestion => q.type === 'mcq');
  if (!sample) return;

  ok(check(sample, course.concepts.find((c) => c.id === sample.conceptId)) === null, 'gate: rejected a good question');

  const duplicated = { ...sample, options: [sample.options[0], sample.options[0], sample.options[1], sample.options[2]] };
  ok(check(duplicated, undefined) === 'duplicate-options', 'gate: let two identical options through');

  const noSource = { ...sample, citation: { ...sample.citation, text: '' } };
  ok(check(noSource, undefined) === 'no-source', 'gate: let an uncited question through');

  const dangling = { ...sample, citation: { ...sample.citation, text: 'This is therefore the case.' } };
  ok(check(dangling, undefined) === 'needs-outside-knowledge', 'gate: let a dangling reference through');

  const leaky = { ...sample, prompt: `${sample.prompt} ${sample.options[sample.answer]}` };
  ok(check(leaky, undefined) === 'gives-itself-away', 'gate: let a question keep its own answer in the stem');

  const blank = course.questions.find((q) => q.type === 'blank');
  if (blank && blank.type === 'blank') {
    const wrong = { ...blank, accept: ['somethingnotinthesource'] };
    ok(check(wrong, undefined) === 'answer-not-in-source', 'gate: let an ungrounded blank through');
  }

  // Two questions with the same prompt must not both survive.
  const twice = gate([sample, { ...sample, id: `${sample.id}-copy` }], course.concepts);
  ok(twice.kept.length === 1, 'gate: kept a duplicate question');
}

/* ---------- retrieval ---------- */

function checkRetrieval(course: Course) {
  const hits = search(course, 'what is the standard deviation', 3);
  ok(hits.length > 0, 'retrieval: found nothing for a question the reference answers');
  ok(
    hits[0]?.citation.text.toLowerCase().includes('standard deviation'),
    'retrieval: the best match is not about the thing asked',
  );

  // "Explain X" must rank sentences about X, not sentences containing the word
  // "explain" — which is exactly what it did before the query was cleaned.
  const explained = search(course, 'explain population', 3);
  ok(
    explained[0]?.citation.text.startsWith('A population is'),
    `retrieval: an instruction word outranked the topic ("${explained[0]?.citation.text.slice(0, 40)}…")`,
  );

  // The refusal is the feature: nothing in this reference is about this.
  ok(
    answerFromSource(course, 'ما هي طريقة طهي الكبسة بالدجاج') === null,
    'retrieval: answered a question the reference says nothing about',
  );
  ok(answerFromSource(course, 'define the null hypothesis') !== null, 'retrieval: refused a question it can answer');
}

/* ---------- sessions ---------- */

function checkSessions(course: Course) {
  const learner = blankLearner('check');
  const fresh = blankProgress();

  const quick = planSession({ mode: 'quick', course, progress: fresh, prefs: learner.prefs });
  ok(!!quick && quick.length > 0, 'session: a fresh course cannot start a quick round');

  ok(
    planSession({ mode: 'weakness', course, progress: fresh, prefs: learner.prefs }) === null,
    'session: weakness hunter offered a round with no weak concepts',
  );

  const chapter = planSession({
    mode: 'chapter',
    course,
    progress: fresh,
    prefs: learner.prefs,
    chapterId: course.chapters[0].id,
  });
  ok(
    !!chapter && chapter.pool.every((q) => q.chapterId === course.chapters[0].id),
    'session: a chapter battle drew from other chapters',
  );

  const exam = planSession({ mode: 'exam', course, progress: fresh, prefs: learner.prefs, length: 20, minutes: 20 });
  ok(!!exam && exam.totalSeconds === 1200, 'session: the exam is not timed');
  if (exam) {
    const spread = examDistribution(exam);
    ok(spread.length >= 3, 'session: the exam paper came from too few chapters');
    ok(
      spread.reduce((sum, row) => sum + row.count, 0) === Math.min(exam.length, exam.pool.length),
      'session: the exam distribution does not add up to the paper',
    );
  }

  // Need has to beat difficulty: a weak concept outranks everything.
  const played = demoProgress(course);
  const weakFirst = planSession({ mode: 'weakness', course, progress: played, prefs: learner.prefs });
  ok(!!weakFirst, 'session: a played course found no weak concepts to hunt');
  if (weakFirst) {
    const targetIds = new Set(weakFirst.targets.map((c) => c.id));
    ok(
      weakFirst.pool.every((q) => targetIds.has(q.conceptId)),
      'session: the weakness hunter included concepts it had not named',
    );
  }

  // A fixed difficulty in settings must actually reach the round.
  const fixed = planSession({
    mode: 'quick',
    course,
    progress: fresh,
    prefs: { ...learner.prefs, fixedDifficulty: 3 },
  });
  ok(fixed?.fixedDifficulty === 3, 'session: the difficulty setting never reached the plan');

  // A type filter must be respected while it still leaves a playable round.
  const onlyMcq = planSession({
    mode: 'quick',
    course,
    progress: fresh,
    prefs: { ...learner.prefs, types: ['mcq'] },
  });
  ok(onlyMcq?.pool.every((q) => q.type === 'mcq'), 'session: the question-type setting was ignored');

  ok(recommend(course, fresh).mode === 'chapter', 'recommend: a brand-new course was not sent to a chapter');
  ok(recommend(course, played).mode !== 'chapter', 'recommend: a played course was sent back to the start');
}

/* ---------- run ---------- */

export async function runSelfCheck() {
  problems.length = 0;
  const started = performance.now();

  checkText();
  checkScoring();
  checkMastery();

  await checkPdf();
  await checkArabic();

  const course = await checkPipeline();
  if (course) {
    checkGrounding(course);
    checkHints(course);
    checkGate(course);
    checkRetrieval(course);
    checkSessions(course);
  }

  const ms = Math.round(performance.now() - started);
  if (problems.length === 0) {
    console.info(
      `%c⚒ StudyForge self-check passed%c  ${course?.concepts.length ?? 0} concepts · ` +
        `${course?.questions.length ?? 0} questions kept · ${course?.rejected ?? 0} rejected · ${ms}ms`,
      'color:#1f4b8f;font-weight:700',
      'color:inherit',
    );
  } else {
    console.warn(`⚒ StudyForge self-check found ${problems.length} problem(s) in ${ms}ms`);
    for (const problem of problems) console.warn('  · ' + problem);
  }
  return problems;
}
