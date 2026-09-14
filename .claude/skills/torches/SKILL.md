---
name: torches
description: How the Torches English-learning game is built — its architecture, data model, Arabic/English rule, curriculum authoring API, scoring engine, Firestore backend, teacher powers, and deploy steps. Use this skill whenever working in the torches repo or on anything it contains: adding or fixing questions, units, mini-lessons or Arabic translations, adding a game type or achievement, touching XP/levels/streaks/difficulty, the journey and its unit/stage locks, the leaderboard or the teacher's board notice, the teacher panel, Firebase auth or Firestore rules, deploying the site, or debugging why a student sees the wrong thing. Read it before editing, even for a change that looks like a one-liner — most of the rules here are invisible in the file you are about to open.
---

# Torches · تورشز

A competitive English-learning game for one school class, built on **MegaGoal 1
(Student Book, Saudi edition)**. Students sign up with a name and a PIN, then work
through twelve units as missions. React + TypeScript + Vite, no backend of its own:
Firebase Auth for identity, Firestore (via a hand-rolled REST client) for data,
GitHub Pages for hosting.

Live: `https://sevadoon.github.io/torches/` · repo `sevadoon/torches`, branch `master`.

## The two rules everything else serves

1. **When a student does not know the answer, Torches teaches her.** It never
   pushes her to look it up. Every question carries a three-step hint ladder and
   an explanation of the *concept* — never "the answer is B".
2. **Arabic talks to the student; English is what she is learning.** The whole
   interface is Arabic and right-to-left. Questions, options, examples and reading
   passages stay in English. New UI text goes in `src/i18n/ar.ts` in Arabic; a new
   question has an English prompt and Arabic hints.

A third rule, unwritten but load-bearing: **the teacher is not a learner.** Her
whole panel stays Arabic, she is outside the race, and nothing is locked to her.

## Map

```
src/
  data/curriculum/unitNN.ts   the 12 units in English — questions, lessons, passages
  data/curriculum/index.ts    folds the picture games in, builds the id indexes
  data/authoring.ts           the builder() DSL every unit file is written in
  data/i18n/unitNN.ar.ts      Arabic hints + explanations, keyed by question id
  data/validate.ts            dev-only self-check, runs on every page load
  engine/missions.ts          which challenges exist, which questions they draw from
  engine/useSession.ts        one play-through: queue, hints, scoring, summary
  games/*.tsx                 one component per question type
  services/progressService.ts pure maths: XP, levels, locks, scoring, difficulty
  services/studentService.ts  identity, the Student record, applying an answer
  services/storage.ts         the only data layer — swap this to change backend
  services/firestoreRest.ts   ~120-line Firestore REST client (no SDK)
  services/teacherService.ts  class roster, promote/demote, reset, rename, CSV
  services/noticeService.ts   the teacher's card above the leaderboard
  state/StudentContext.tsx    the one place the student record lives
  pages/*.tsx                 one file per screen
  i18n/ar.ts                  every Arabic string in the app
  styles/global.css           the whole stylesheet
```

## Data flow

`StudentContext` holds the single `Student` record and exposes `update(fn)`. Every
change goes through it, because that one function is also what awards levels,
fires achievements, plays sounds and persists to Firestore. Writing to the student
anywhere else silently skips all of that.

`persist()` is a no-op for the guest — a visit leaves nothing behind.

## The Student record

Defined in `src/types/index.ts`, created by `blankStudent()`. Progress per unit is
`units[unitId] = { missions: { [key]: bestAccuracy }, bossCleared }`. Skill
accuracy, mistakes, mastered ids, streak and a per-day XP history live alongside.

`migrate()` in `studentService.ts` fills in whatever a new field added since her
last save — extend it whenever you add a field, or old saves break.

## Adding curriculum

Unit files are written in the `builder()` DSL (`src/data/authoring.ts`), which
exists so a question reads like a question instead of a 12-line object literal:

```ts
const b = builder('unit-3');
b.section('grammar', '3 Grammar')
 .mc({ q: 'She ___ to school every day.', o: ['go', 'goes', 'going'], a: 1,
       ex: 'Third person singular takes -s in the present simple.',
       h: ['Who is doing it?', 'he / she / it takes -s', 'He plays. She goes.'] })
 .ord({ q: 'Build the sentence.', c: ['I', 'have', 'never', 'been', 'there'],
        ex: '…', h: ['…', '…', '…'] });
export const unit03 = { /* … */ questions: b.done() };
```

Builders: `mc` `tf` `ord` `mat` `mem` `pic` `picmat` `blk` `err`. `section()` sets
the skill/lesson/passage defaults for everything authored after it. `d` is
difficulty 1–3, `ex` the concept explanation, `h` the `[Think, Remember, Example]`
hints.

Ids are generated from position (`unit-3-q007`), so **never reorder questions in a
file** — the ids shift, and every student's mistake list, mastered list and Arabic
translation then point at the wrong question. Append instead.

Then add the Arabic for each new id in `src/data/i18n/unitNN.ar.ts`. The self-check
lists any question still falling back to English.

## The self-check

`src/data/validate.ts` runs in dev on every page load and prints to the console. It
catches a typo in a unit file — a missing hint, a bad answer index, a passage id
pointing nowhere — the moment the app loads, instead of in front of a student.

It is also where the non-obvious logic gets its tests: `checkScoring`, `checkBoard`,
`checkResume`, `checkPicking`, `checkViewAll`. **Add a case there when you change
any of that** — it is the project's whole test suite, and it costs nothing because
it is already running. Verify with `npm run dev` and read the console: a clean run
prints `🔥 Torches self-check passed`.

## Missions, locks, and who is exempt

- Six stages per unit: four skill missions (grammar, vocabulary, reading, form &
  meaning), then Mixed, then Boss.
- Mixed opens after 2 skill missions, Boss after 3 (`missionUnlocked`).
- A mission is **passed** at 80% accuracy; the Boss clears at 70%, and that is what
  unlocks the next unit (`missionPassed`, `MISSION_PASS`).
- A unit unlocks when the previous one is 60% done (`unitUnlocked`), so a student
  can be working in unit 3 while unit 1 still has a stage left. `currentUnitId`
  therefore prefers her own bookmark over a scan.
- `unitCompletion` (what unlocks the next unit) and `unitStages` (what the journey
  displays) deliberately answer different questions. Do not merge them — moving
  that bar would close units that are already open for real students.
- **`setViewAll(true)`** in `progressService` lifts every lock. `StudentContext`
  turns it on for a teacher and for a guest, because neither is working through the
  course: the teacher needs to open any stage to show it in class, and a visitor
  came to look around. It is a module flag rather than a field on the student
  because teacher status is not part of her record.

## Scoring

`scoreAnswer` in `progressService.ts`. Correct = 100, plus difficulty, speed and
combo bonuses, minus 10 per hint, all multiplied by the challenge (Mixed ×2, Boss
×2.5). Right on the *second* try is a flat 40 with no bonuses — worth something,
never worth guessing for. That asymmetry is what keeps the leaderboard a ranking of
learning rather than of tapping.

`nextDifficulty`: three right in a row moves up a level, two wrong moves down.

Levels are quadratic: `xpForLevel(n) = 200(n-1) + 50(n-1)(n-2)`. The torch tier
(spark → lighthouse) is cosmetic, driven by level.

## Adding a game type

One component satisfying `GameProps` (`src/games/types.ts`), one new question type
in `src/types/index.ts`, one builder method in `authoring.ts`, one line in the
registry in `src/games/index.tsx`, and an entry in `speakableOf` so the read-aloud
says what is on screen. `speakableOf` must reuse the same `seededShuffle(…, q.id)`
the game uses, and must never speak a matching game's two columns in paired order —
that would read the answer out loud.

## Backend

Firebase project `torches-megagoal-687ee`. Auth is email+password under the hood:
the name becomes a synthetic email and the PIN the password
(`services/authRest.ts`), so a student signs in on any device with a name and 4
digits.

| Collection | Doc id | Who writes |
|---|---|---|
| `students` | her auth uid | herself, or a teacher |
| `teachers` | her auth uid | another teacher |
| `board` | `notice` | any teacher — the card above the leaderboard |

`firestore.rules` is the real enforcement, not the UI. It caps a single XP jump at
+10,000 so one forged request cannot buy first place, requires a new account to
start at zero, and lets only a teacher delete or reset a record. A teacher cannot
delete her own teacher document — that would let the last teacher lock everyone out
of the class screen.

**Rules are not deployed by the Pages workflow.** After editing `firestore.rules`:

```bash
npx firebase-tools deploy --only firestore:rules
```

Symptom of forgetting: the feature reads fine but every write fails.

## Leaderboard

`loadRoster` returns **every** account, including one that has not answered a
question yet — a student who just signed up should find herself on the board from
her first minute, at the bottom, rather than wonder whether the class can see her.

`buildRows` applies three rules: her live record wins over the saved snapshot so her
own row is never stale; a guest watches without joining; and accounts with a
`/teachers` document are filtered off entirely. The teacher instead appears *above*
the board, from `board/notice`, together with whatever message she typed there — she
edits it in place on her own leaderboard screen.

Ranking is always by student id, never by name, so a rename never moves or
duplicates a row.

## Conventions

- Comments explain **why**, in prose, at the place the decision was made. The
  codebase reads like it was written for the next person; match that. A comment
  restating the line below it is noise.
- Arabic UI text lives only in `src/i18n/ar.ts`. No Arabic string literals in
  components.
- `className="ar"` marks Arabic text; `en-ui` and `num` mark the English and
  numeric exceptions inside an RTL page.
- No CSS-in-JS beyond small inline style objects; the design lives in
  `styles/global.css`.
- No new dependencies. The Firestore REST client exists because the SDK would not
  install, and a class-sized leaderboard does not need it.
- Files are CRLF. Scripted edits that assume LF will silently match nothing.

## Build, run, deploy

```bash
npm install
npm run dev        # the self-check runs here — read the console
npm run build      # tsc -b + vite build into dist/
```

Pushing to `master` deploys the site through `.github/workflows/deploy.yml`.
Firestore rules deploy separately (above).

`vite.config.ts` sets `base: './'` and the app uses a **HashRouter**, so the built
site works from any static host and any subfolder with no server rules. Keep it that
way — a BrowserRouter would 404 on every deep link on GitHub Pages.
