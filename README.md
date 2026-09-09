# 🔥 Torches · تورشز

A competitive learning game built on **MegaGoal 1 (Student Book, Saudi edition)** — the course in
`سفاري.pdf`. Students enter a name, get a permanent player ID, and work through the twelve units as
missions: grammar, vocabulary, reading and form & meaning, then a Mixed Challenge and a Boss
Challenge that unlocks the next unit.

Two rules shape everything:

1. **When a student doesn't know the answer, Torches teaches her** — it never pushes her to look it up.
2. **Arabic talks to the student; English is what she is learning.** The whole interface is Arabic
   and right-to-left. Questions, options, examples and reading passages stay in English.

---

## Run it

```bash
npm install
npm run dev
```

Then open the address Vite prints (default `http://localhost:5180`).

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve the built site
```

`dist/` is a plain static site with `base: './'` and a hash router, so it works from any host —
GitHub Pages, Netlify drop, a school server, a subfolder — with no server configuration.

---

## What is in the game

| Piece | Where |
|---|---|
| 12 units, 351 challenges (English) | `src/data/curriculum/unit01.ts` … `unit12.ts` |
| Arabic hints + explanations for all 351 | `src/data/i18n/unit01.ar.ts` … `unit12.ar.ts` |
| Interface wording (Arabic) | `src/i18n/ar.ts` |
| 7 game types | `src/games/` |
| Play loop, hints, rescue, adaptive difficulty | `src/engine/` |
| XP, levels, streaks, achievements, leaderboard | `src/services/` |
| Screens | `src/pages/` |

### Game types

| Game | Question type | Used mostly for |
|---|---|---|
| Choose the answer | `mcq` | grammar, reading, form |
| True or false | `truefalse` | reading |
| Sentence Builder | `order` | grammar, form |
| Match Up | `match` | vocabulary |
| Memory Flip | `memory` | vocabulary |
| Word Hunt | `blank` | grammar, vocabulary |
| Error Detective | `error` | grammar, form |

### The hint ladder

Five rungs, all written in Arabic, and none of them says the answer:

1. **فكّري (Think)** — what to look at in the sentence
2. **تذكّري (Remember)** — the rule, in the book's own words
3. **مثال (Example)** — a parallel English sentence from the unit
4. **استبعدي (Eliminate)** — dims wrong options (multiple choice only, never down to one)
5. **الشرح (Explain)** — the concept, still not the answer

Each hint costs 10 XP, floored so a correct answer never earns less than 40. A wrong answer gives a
nudge and **one more try**, then a short explanation, and the question is filed in Smart Review.
Three wrong answers in one skill triggers **Learning Rescue**: a mini-lesson from that unit's
grammar box, then back to the game at an easier difficulty.

### Scoring

```
correct                 +100
medium / hard question  +25 / +50
answered within 12s     +20
combo of 3+             +10 × combo (max +60)
hints used              −10 each (never below 40 total)
Mixed Challenge         ×2       Boss Challenge  ×2.5
```

Speed is a bonus, never a penalty. Levels: 0 / 200 / 500 / 900 / 1400 / 2000 XP …

---

## Language: what is Arabic and what stays English

| Arabic | English |
|---|---|
| navigation, buttons, headings, page copy | the questions themselves |
| the three hints and the explanation after a mistake | the answer options |
| mini-lesson titles and rules (Learning Rescue) | the mini-lesson **examples** — they are the lesson |
| achievement names, unit names, skill names | reading passages; the book's own section names |
| results, leaderboard, profile, achievements | the player ID |

`<html dir="rtl" lang="ar">`. English content is isolated with `dir="ltr"` and set in a serif
(**Newsreader**) so the language being learned looks visibly different from the app talking to you;
the interface is **IBM Plex Sans Arabic**.

Every Arabic string for the interface is in [`src/i18n/ar.ts`](src/i18n/ar.ts) — one file, edit and
the whole app changes. The per-question Arabic lives in `src/data/i18n/`, keyed by question id, so
the English source files are never touched and a third language is one more folder.

---

## Identity: the part that must not break

The display name is **never** a key. On the first visit the app generates `TOR-XXXXXX` and stores
every piece of progress, every mistake and every leaderboard row against that id.

```ts
{ id: "TOR-A82F91", name: "Sara",       xp: 1240, level: 7 }
{ id: "TOR-A82F91", name: "Sara Ahmed", xp: 1240, level: 7 }   // after a rename — same student
```

Renaming happens in **Profile → Edit name**. The id never changes. A shared device (a classroom
tablet) keeps every player, and the welcome screen offers "continue as" for each of them.

---

## Connecting a database

Everything that touches storage goes through one interface in
[`src/services/storage.ts`](src/services/storage.ts):

```ts
export interface TorchesDriver {
  currentStudentId(): Promise<string | null>;
  setCurrentStudentId(id: string | null): Promise<void>;
  loadStudent(id: string): Promise<Student | null>;
  saveStudent(student: Student): Promise<void>;
  loadRoster(): Promise<RosterEntry[]>;
}

export const driver: TorchesDriver = localDriver;   // ← the only line to change
```

Write a `supabaseDriver` (or Firebase, or a REST client) with those five methods, swap that last
line, and the leaderboard becomes a real cross-device board. No page and no game needs editing.

Until then the leaderboard mixes the real players on this device with ten clearly labelled **demo
classmates** so the screen is not empty; they disappear on their own once a backend roster exists.

---

## Adding or editing content

Content lives entirely in `src/data/curriculum/`, separate from every component. Questions are
written with the short helpers in `src/data/authoring.ts`:

```ts
B.section('grammar', '3 Grammar');

B.mc({
  q: 'The water ___. Please turn it off.',
  o: ['is boiling', 'boils', 'boiled', 'has boiled'],
  a: 0,                 // index of the correct option
  d: 1,                 // 1 easy · 2 medium · 3 hard
  ex: 'The water is boiling right now — an action in progress — so the present progressive is used.',
  h: [
    'Look at "Please turn it off". When is this happening?',
    'Use the present progressive for actions happening now.',
    'Example: Look! The bus is leaving.',
  ],
});
```

Other helpers: `B.tf` (true/false), `B.ord` (sentence builder), `B.mat` (match), `B.mem` (memory),
`B.blk` (type the word), `B.err` (find the mistake). Ids are generated automatically.

**Every question carries an explanation and three hints** — that is the contract that makes the
hint ladder work, so please keep filling them in.

Then add the Arabic for the same question in `src/data/i18n/unitNN.ar.ts`, keyed by its id:

```ts
'unit-2-q004': {
  ex: 'since تحدد نقطة البداية في الزمن، أما for فتحدد مدة.',
  h: [
    'هل "he left college" نقطة زمنية أم مدة؟',
    'since مع نقطة البداية، و for مع المدة.',
    'مثال: He has been a reporter for five years — since his internship.',
  ],
},
```

If you forget, the app falls back to the English hint and the dev self-check prints the id — it
never silently ships a question with no Arabic.

### The design

The look is deliberately a printed workbook, not a dark dashboard: paper ground with a riso dot
grid, 2px ink borders, hard offset shadows instead of blur, and a hand-drawn SVG torch that grows a
core and side sparks as the level rises. Every icon is a stroke path in
[`src/components/Icon.tsx`](src/components/Icon.tsx) — there are no emoji in the interface except
the player's own chosen avatar. Colours and spacing are all CSS custom properties at the top of
[`src/styles/global.css`](src/styles/global.css).

### A note on the reading passages

The comprehension questions follow the Student Book readings unit by unit — the same texts, the same
facts, the same target vocabulary — but the passages in `passages: [...]` are **written for
Torches** rather than copied out of the book, so the app can be published without redistributing
the publisher's text. Each one names its source page range. If you would rather use the original
wording inside your own classroom, replace the `paragraphs` array of any passage — nothing else
changes.

---

## Structure

```
src/
  components/   Torch, Icon, Bar, Nav, Toasts, Confetti, SkillMeter
  data/
    authoring.ts        compact question helpers
    curriculum/         unit01…unit12 + index   (English source)
    i18n/               unit01.ar…unit12.ar     (Arabic hints & explanations)
    validate.ts         dev-only self-check
  i18n/         ar.ts (all interface wording), labels.ts
  engine/       missions.ts (what to play), useSession.ts (the play loop)
  games/        one component per game type + the registry
  pages/        welcome, home, journey, play, leaderboard, progress,
                profile, achievements, review, skills
  services/     storage (the swap point), student, progress, leaderboard, achievements
  state/        StudentContext — one place where the student is updated and saved
  styles/       global.css
  types/        the domain model
  utils/        seeded shuffle, WebAudio sound effects
```

## Routes

`/welcome` · `/home` · `/journey` · `/play/:unitId/:missionKey` · `/leaderboard` · `/progress` ·
`/profile` · `/achievements` · `/review` · `/skills`

Mission keys are `grammar`, `vocabulary`, `reading`, `form`, `mixed`, `boss`, and `/play/review/review`
for Smart Review.
