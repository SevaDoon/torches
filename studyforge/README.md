# StudyForge · صُنّاع المعرفة

Upload a university course reference; get back an adaptive, source-grounded
learning game built from it.

The product's one rule: **nothing the student is shown is invented.** Every
concept, question, explanation and answer is a span of the file she uploaded,
carrying a citation back to the exact offsets it came from. When the reference
does not contain an answer, the app says so instead of producing one.

It runs entirely in the browser. Files never leave the device.

---

## Run it

Depends on nothing of its own — it uses the React/Vite/TypeScript install in the
parent directory, so there is no second `npm install`.

```bash
npm --prefix studyforge run dev
```

Then open `http://localhost:5190`. `npm --prefix studyforge run build` produces
`studyforge/dist/`, which is a static site: `base: './'` plus a HashRouter, so it
works from any host and any subfolder with no server rewrite rules.

**The test suite** is `src/data/selfcheck.ts`. It runs on every dev page load
and prints `⚒ StudyForge self-check passed` to the console, and the same suite
runs headless — it exits non-zero on any failure, so it can gate a build:

```bash
npm --prefix studyforge run check
```

## What it can read

Everything is parsed in the browser, with no library:

| Format | How | Citations carry |
|---|---|---|
| PDF | page tree, object streams, Flate; fonts decoded through their ToUnicode CMap; `/ActualText` and `/ReversedChars` honoured | page number |
| Word `.docx` | ZIP + `word/document.xml` | section |
| PowerPoint `.pptx` | ZIP + slides and speaker notes | slide number |
| Text / pasted | as is | section |

Verified against files produced by Word, PowerPoint and Chrome/Edge, in English
and Arabic: the same content builds the same course from every format.

Arabic in PDFs needs the most care. Writers store it in visual order (Chrome
says so with `/ReversedChars`; Word does not), draw lam-alef as one ligature
glyph, and map letters to their Persian forms. The reader reverses by glyph
rather than by character, keeps diacritics with their letters, and folds the
forms back — see the header of `engine/pdf.ts`.

Refused, with a message telling the student to paste the text instead: scanned
PDFs (no text at all), fonts with no ToUnicode map, and anything whose output
does not read as language. That last gate matters: glyph numbers read as
letters look like a substitution cipher — letters, word lengths, repetition —
and only the absence of words like "the" and "في" gives them away.

---

## The two rules everything else serves

1. **Source-grounded.** A generator may copy spans of the student's document
   into a fixed frame. It may never write a fact. Because of that, a question
   here cannot be *wrong* in the way a generated question usually is — it can
   only be *bad* (ambiguous, leaky, guessable), and `engine/validate.ts` throws
   those away before anyone sees them.
2. **Two languages, kept apart.** The interface is Arabic or English and flips
   direction with the choice. The course content stays in the language of the
   reference, always — including the question stems, which are written in the
   reference's language, not the interface's.

---

## Map

```
src/
  engine/
    extract.ts      File -> SourceDoc, or an honest refusal
    pdf.ts          PDF text extraction, no library (DecompressionStream)
    office.ts       .docx / .pptx, no library (a ZIP reader + a tag strip)
    text.ts         sentences, words, Arabic normalization, offsets
    structure.ts    chapters and the heading path citations are labelled with
    concepts.ts     definitions, terms, weights — all copied from the document
    questions.ts    the nine generators
    validate.ts     the gate every question passes before a student sees it
    build.ts        the pipeline the analysis screen reports
    retrieval.ts    search inside the reference (Ask, examples, Show source)
    session.ts      one play-through: picking, adapting, rescue, re-asking
  services/
    progress.ts     pure maths: XP, levels, mastery, the review schedule
    learner.ts      the learner record and what an answer does to it
    db.ts           IndexedDB — courses, learner; localStorage for settings
    ai.ts           the OPTIONAL model layer, bound to retrieved passages
    achievements.ts
  games/index.tsx   one surface per question shape
  pages/            one file per screen
  data/
    demoReference.ts  the sample course's reference (a document, not a bank)
    demoCourse.ts     builds it through the real pipeline
    selfcheck.ts      the test suite
  i18n/strings.ts   every word the interface says, in both languages
  styles/global.css the whole design system
```

## Data flow

`AppContext` holds the single `Learner` record and exposes `update(fn)`. Every
change goes through it, because that one function is also what saves, awards
levels and fires achievements. Writing to the record anywhere else silently
skips all three.

Courses are big — a whole reference lives inside one — so they are **not** held
in context. `useCourse(id)` loads one per screen, and every screen that uses it
draws a loading state and a missing state.

## The pipeline

`extract → structure → concepts → questions → validate`, with the analysis
screen reporting the real stage as each one passes.

- **Extract** is refusal-first. A scanned PDF and a PDF with private font
  encodings both "succeed" at the byte level and produce nonsense;
  `looksLikeProse` catches both and the upload screen offers "paste the text
  instead". Guessing at garbage would be worse than saying so.
- **Concepts** are found by the shapes authors actually write definitions in —
  `X is defined as Y`, `X: Y`, `يُعرَّف X بأنه Y` — then filtered hard. A bad
  concept is much worse than a missing one, so every doubt drops the candidate.
  A reference written as narrative rather than as a glossary falls back to the
  phrases the author keeps returning to, defined by his own sentence about them.
- **Questions**: definition MCQ, term MCQ (discrimination), true/false (falsified
  by a single term or polarity swap, explained with the untouched original),
  fill-in-the-blank, matching, ordering (from real numbered procedures),
  find-the-wrong-word, value/formula MCQ, and "why" questions built from the
  reference's own `A because B` sentences.
- **Validate** rejects: uncited, answer-not-in-source, duplicate or overlapping
  options, a stem containing its own answer, a definition that names its own
  term, "the long option is the answer", a sentence that depends on one we are
  not showing, and duplicates. Rejections are silent; only the count is shown.

## Learning, not scoring

- **Mastery** rises slowly and falls hard: four clean answers to master a
  concept, one miss to lose most of it. That asymmetry is what makes the
  "mastered" label mean something.
- **Review** is Leitner: boxes 0–5 at 0/1/2/4/8/16 days. A miss goes to box 0,
  which is "again in this session" — and the session engine really does re-ask
  it about four questions later, with a different question for the same concept.
- **Probes.** A concept she has already passed on recall is next asked to be
  applied or told apart. Answering "what is X" twice proves nothing new.
- **Adapting.** Three right in a row raises difficulty, two wrong lowers it.
  Three misses on one concept opens Rescue: the reference's own explanation and
  example, then easy → medium → applied on that concept.
- **Scoring.** Right first time is worth 100 plus bonuses; right on the second
  try is a flat 40 with none. Tapping through a round scores a fraction of
  thinking through one, which is the only reason the number means anything.

## Hints never leak

Four rungs — think / where it is / recall / the concept — and every rung is
masked against the answer in all the forms it takes. That is less obvious than
it sounds: on "which term is this?" the answer *is* the concept's term, an
option is often a clamped definition that appears nowhere verbatim, and a
chapter called "Introduction to Statistics" hands over an answer of
"statistics" for free. The self-check walks every question at every rung.

## The optional model

The platform is complete with no API key: questions, explanations and Ask
answers are all extracted. A key (Settings → connect a model, stored in this
browser only) adds *phrasing* — the model is handed the retrieved passages and
told to answer from those alone or say it cannot. The passages, and therefore
the citations, are identical either way.

## The sample course

Built from `data/demoReference.ts` through the same pipeline an uploaded PDF
goes through, flagged `isDemo`, and shipped with a plausible history so the
mastery features have something to show on first open. That history carries no
XP: handing out levels for rounds nobody played would make the progress screen
lie.

## Conventions

- Comments explain **why**, in prose, where the decision was made.
- No interface text in components — it lives in `i18n/strings.ts`, and `ar` is
  the shape `en` must satisfy, so a string added on one side fails the build
  until the other has it.
- Content keeps the direction of the reference it came from, whatever the
  interface language is doing.
- No new dependencies. The PDF reader, the ZIP reader and the search index are
  all here because the browser already ships what they needed.
- Add a case to `data/selfcheck.ts` whenever you change the engine.
