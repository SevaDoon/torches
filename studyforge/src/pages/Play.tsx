import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { AnswerRecord, Concept, Course, Mode, SessionRecord } from '../types';
import { useApp } from '../state/AppContext';
import { useCourse } from '../state/useCourse';
import { progressOf, applyAnswer, applySession, rememberCombo } from '../services/learner';
import { chapterMastery, conceptState, stateOf } from '../services/progress';
import {
  examDistribution,
  planSession,
  recommend,
  useSession,
  type SessionPlan,
  type Summary,
} from '../engine/session';
import { exampleFor, simplerFor, type Passage } from '../engine/retrieval';
import { detectLang } from '../engine/text';
import { definitionOption } from '../engine/questions';
import { hasModel, rephrase } from '../services/ai';
import { GameSurface } from '../games';
import { Icon, MODE_ICON, TYPE_ICON } from '../components/Icon';
import { Banner, Blocks, Empty, Meter, PageSkeleton, Stat } from '../components/ui';
import { Cite, Quoted } from '../components/Source';
import { sfx } from '../utils/sound';

export function Play() {
  const { courseId, mode } = useParams();
  const [search] = useSearchParams();
  const { t, learner } = useApp();
  const { course, status } = useCourse(courseId);
  const navigate = useNavigate();

  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [examLength, setExamLength] = useState(learner.prefs.examLength);
  const [examMinutes, setExamMinutes] = useState(learner.prefs.examMinutes);
  const [chapterId, setChapterId] = useState(search.get('chapter') ?? '');

  if (status === 'loading') return <PageSkeleton />;
  if (!course || !mode) {
    return (
      <div className="page">
        <Empty icon="alert" title={t.errors.noCourse}>
          <Link className="btn btn-primary" to="/courses">{t.nav.courses}</Link>
        </Empty>
      </div>
    );
  }

  const playMode = mode as Mode;
  const progress = progressOf(learner, course.id);

  if (plan) {
    return <Round key={plan.mode + (plan.chapter?.id ?? '')} course={course} plan={plan} />;
  }

  const start = (overrides?: { chapterId?: string }) => {
    const built = planSession({
      mode: playMode,
      course,
      progress,
      prefs: learner.prefs,
      chapterId: overrides?.chapterId ?? chapterId ?? undefined,
      length: examLength,
      minutes: examMinutes,
    });
    if (built) setPlan(built);
  };

  /* ---------- the setup each mode needs before it can start ---------- */

  const head = (
    <header className="stack" style={{ gap: 8 }}>
      <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/course/${course.id}`)}>
        <Icon name="arrowStart" size={17} />
        {t.common.back}
      </button>
      <div className="row" style={{ gap: 10 }}>
        <span className="emblem emblem-sm">
          <Icon name={MODE_ICON[playMode]} size={20} />
        </span>
        <div>
          <h1 style={{ fontSize: '1.4rem' }}>{t.modes[playMode].t}</h1>
          <p className="small muted" style={{ margin: 0 }}>{t.modes[playMode].d}</p>
        </div>
      </div>
    </header>
  );

  if (playMode === 'chapter' && !search.get('chapter')) {
    return (
      <div className="page page-narrow stack-lg">
        {head}
        <h2>{t.modes.pickChapter}</h2>
        <div className="stack" style={{ gap: 8 }}>
          {course.chapters.map((chapter) => {
            const mastery = chapterMastery(course.concepts, chapter.id, progress);
            const count = course.questions.filter((q) => q.chapterId === chapter.id).length;
            return (
              <button
                key={chapter.id}
                className="list-row"
                disabled={count === 0}
                onClick={() => {
                  setChapterId(chapter.id);
                  start({ chapterId: chapter.id });
                }}
              >
                <span className="row-icon num tiny">{chapter.order}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="truncate strong small">{chapter.title}</div>
                  <div className="tiny muted">{count} {t.common.questions}</div>
                  <div style={{ marginTop: 6 }}>
                    <Meter percent={mastery * 100} blocks={12} />
                  </div>
                </div>
                <Icon name="chevron" size={17} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (playMode === 'weakness') {
    const preview = planSession({ mode: 'weakness', course, progress, prefs: learner.prefs });
    if (!preview) {
      return (
        <div className="page page-narrow stack-lg">
          {head}
          <Empty icon="target" title={t.modes.weaknessNone}>
            <button className="btn btn-primary" onClick={() => navigate(`/course/${course.id}/play/quick`)}>
              {t.modes.quick.t}
            </button>
          </Empty>
        </div>
      );
    }
    return (
      <div className="page page-narrow stack-lg">
        {head}
        <div className="card card-lg">
          <div className="eyebrow">{t.modes.weaknessFound}</div>
          <ul className="stack" style={{ gap: 8, margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
            {preview.targets.slice(0, 6).map((concept) => (
              <li key={concept.id} className="row-top" style={{ gap: 8 }}>
                <span className="dot dot-weak" style={{ marginTop: 7 }} />
                <div className="grow">
                  <div className="strong small">{concept.term}</div>
                  <Cite citation={concept.citation} course={course} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <button className="btn btn-lg btn-primary btn-block" onClick={() => setPlan(preview)}>
          <Icon name="target" size={19} />
          {t.common.start}
        </button>
      </div>
    );
  }

  if (playMode === 'exam') {
    const preview = planSession({
      mode: 'exam',
      course,
      progress,
      prefs: learner.prefs,
      length: examLength,
      minutes: examMinutes,
    });
    return (
      <div className="page page-narrow stack-lg">
        {head}
        <div className="card stack">
          <h2>{t.modes.examSetup}</h2>
          <label className="label" htmlFor="exam-length">{t.modes.examQuestions}</label>
          <input
            id="exam-length"
            className="field"
            type="number"
            min={5}
            max={60}
            value={examLength}
            onChange={(e) => setExamLength(Math.max(5, Math.min(60, Number(e.target.value) || 20)))}
          />
          <label className="label" htmlFor="exam-minutes">{t.modes.examMinutes}</label>
          <input
            id="exam-minutes"
            className="field"
            type="number"
            min={5}
            max={120}
            value={examMinutes}
            onChange={(e) => setExamMinutes(Math.max(5, Math.min(120, Number(e.target.value) || 20)))}
          />
        </div>

        {preview && (
          <div className="card">
            <div className="eyebrow">{t.modes.examDistribution}</div>
            <div className="stack" style={{ gap: 7, marginTop: 10 }}>
              {examDistribution(preview).map(({ chapter, count }) => (
                <div className="row-between small" key={chapter.id}>
                  <span className="truncate grow">{chapter.title}</span>
                  <span className="num muted">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-lg btn-primary btn-block" onClick={() => start()} disabled={!preview}>
          <Icon name="clipboard" size={19} />
          {t.modes.examStart}
        </button>
        {!preview && <Banner kind="warn">{t.modes.empty}</Banner>}
      </div>
    );
  }

  // quick, survival and daily open straight into the round.
  const direct = planSession({
    mode: playMode,
    course,
    progress,
    prefs: learner.prefs,
    chapterId: search.get('chapter') ?? undefined,
  });
  if (!direct) {
    return (
      <div className="page page-narrow stack-lg">
        {head}
        <Empty icon="alert" title={t.modes.empty}>
          <Link className="btn btn-primary" to={`/course/${course.id}`}>{t.results.toDashboard}</Link>
        </Empty>
      </div>
    );
  }
  return <Round key={playMode} course={course} plan={direct} />;
}

/* ---------- the round ---------- */

function Round({ course, plan }: { course: Course; plan: SessionPlan }) {
  const { t, learner, update, celebrate } = useApp();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [marks, setMarks] = useState<Array<'ok' | 'miss'>>([]);
  const [floating, setFloating] = useState<{ id: number; text: string } | null>(null);
  const [extra, setExtra] = useState<{ label: string; passage: Passage | null; text?: string } | null>(null);
  const [extraLoading, setExtraLoading] = useState(false);
  const [reaskNoted, setReaskNoted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(plan.totalSeconds || plan.perQuestionSeconds || 0);

  const progress = progressOf(learner, course.id);

  // Snapshots taken at the start, so the results screen can say what actually
  // changed in this session rather than what happens to be true afterwards.
  const before = useRef({
    weak: new Set(
      course.concepts.filter((c) => stateOf(progress.conceptStates[c.id]) === 'weak').map((c) => c.id),
    ),
    chapters: new Map(course.chapters.map((c) => [c.id, chapterMastery(course.concepts, c.id, progress)])),
  });

  const commit = (record: AnswerRecord) => {
    update((l) => rememberCombo(applyAnswer(l, course.id, record), session.combo + 1));
    setMarks((m) => [...m, record.correct ? 'ok' : 'miss']);
    record.correct ? sfx.correct() : sfx.wrong();
    if (record.xp > 0) {
      const id = Date.now();
      setFloating({ id, text: `+${record.xp}` });
      setTimeout(() => setFloating((f) => (f?.id === id ? null : f)), 900);
    }
  };

  const finish = (result: Summary) => {
    setSummary(result);
    sfx.complete();

    const record: SessionRecord = {
      id: `s-${Date.now()}`,
      mode: plan.mode,
      at: Date.now(),
      answered: result.answered,
      correct: result.correct,
      accuracy: result.accuracy,
      xp: result.xp,
      seconds: result.seconds,
      weak: result.weak,
      strong: result.strong,
      chapterId: plan.chapter?.id,
    };

    update(
      (l) => applySession(l, course.id, record),
      {
        lastSession: record,
        // Both of these are "did this session change it", which is why the
        // comparison is against the snapshot taken when the round opened.
        weaknessCleared: result.strong.some((id) => before.current.weak.has(id)),
        chapterMastered: course.chapters.some((chapter) => {
          const now = chapterMastery(course.concepts, chapter.id, progressOf(learner, course.id));
          return now >= 0.9 && (before.current.chapters.get(chapter.id) ?? 0) < 0.9;
        }),
      },
    );
    if (result.accuracy >= 0.8 && result.answered >= 4) celebrate();
  };

  const session = useSession(plan, progress, commit, finish);

  /* ---------- timers ---------- */

  const left = useRef(0);
  useEffect(() => {
    if (summary) return;
    const perQuestion = plan.perQuestionSeconds;
    const total = plan.totalSeconds;
    if (!perQuestion && !total) return;

    left.current = perQuestion || total;
    setSecondsLeft(left.current);
    const id = setInterval(() => {
      left.current -= 1;
      setSecondsLeft(left.current);
      if (left.current > 0 && left.current <= 6) sfx.tick();
      if (left.current <= 0) {
        clearInterval(id);
        // Running out of time on the paper ends it; running out on one
        // question is simply a wrong answer, and the round carries on.
        if (total) session.quit();
        else session.timeOut();
      }
    }, 1000);
    return () => clearInterval(id);
    // Re-armed per question when the timer is per-question, once when it is not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.perQuestionSeconds ? session.slot : 0, summary]);

  useEffect(() => {
    setExtra(null);
    setReaskNoted(false);
  }, [session.slot, session.status]);

  /* ---------- results ---------- */

  if (summary) {
    return (
      <Results
        course={course}
        plan={plan}
        summary={summary}
        onAgain={() => navigate(0)}
        onDone={() => navigate(`/course/${course.id}`)}
      />
    );
  }

  const question = session.question;
  if (!question) {
    return (
      <div className="page">
        <Empty icon="alert" title={t.modes.empty}>
          <Link className="btn btn-primary" to={`/course/${course.id}`}>{t.results.toDashboard}</Link>
        </Empty>
      </div>
    );
  }

  const chapter = course.chapters.find((c) => c.id === question.chapterId);
  const instruction = t.play.instructions[question.type];
  const blocks: Array<'todo' | 'ok' | 'miss'> = Array.from({ length: session.total }, (_, i) =>
    i < marks.length ? marks[i] : 'todo',
  );
  const canHint = session.status === 'question' && session.hintLevel < 4;

  // The concept a wrong option actually belongs to, when it belongs to one.
  const given = session.feedback && !session.feedback.correct && !session.feedback.retry ? session.feedback.given : undefined;
  const chosen = given
    ? course.concepts.find(
        (c) => c.id !== question.conceptId && (c.term === given || definitionOption(c) === given),
      )
    : undefined;

  const loadExtra = async (kind: 'simpler' | 'example') => {
    if (!session.concept) return;
    setExtraLoading(true);
    const passage = kind === 'simpler' ? simplerFor(course, session.concept) : exampleFor(course, session.concept);
    let text = passage?.text;
    if (kind === 'simpler' && !passage && hasModel()) {
      // Nothing simpler in the reference: the model may rephrase what is there,
      // and only what is there.
      text =
        (await rephrase(
          { text: question.citation.text, score: 1, citation: question.citation },
          learner.uiLang,
        )) ?? undefined;
    }
    setExtra({
      label: kind === 'simpler' ? t.play.simpler : t.play.example,
      passage: passage ?? (text ? { text, score: 1, citation: question.citation } : null),
      text: text ?? (kind === 'simpler' ? t.play.noSimpler : t.play.noExample),
    });
    setExtraLoading(false);
  };

  return (
    <div className="play">
      <div className="play-top">
        <div className="row-between">
          <button className="btn btn-sm btn-ghost" onClick={() => session.quit()}>
            <Icon name="arrowStart" size={17} />
            {t.play.quit}
          </button>
          <div className="hud">
            {(plan.perQuestionSeconds > 0 || plan.totalSeconds > 0) && (
              <span className={`chip timer${secondsLeft <= 10 ? ' low' : ''}`}>
                <Icon name="clock" size={13} />
                <span className="num">
                  {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                </span>
              </span>
            )}
            {session.combo >= 2 && (
              <span className="chip chip-ember">
                <Icon name="flame" size={13} filled />
                <span className="num">×{session.combo}</span>
              </span>
            )}
            <span className="chip">
              <Icon name="star" size={13} filled />
              <span className="num">{session.stats.xp}</span>
            </span>
          </div>
        </div>

        <div>
          <div className="row-between tiny muted" style={{ marginBottom: 6 }}>
            <span className="row" style={{ gap: 6 }}>
              <Icon name={MODE_ICON[plan.mode]} size={15} />
              {t.modes[plan.mode].t}
              {chapter ? ` · ${chapter.title}` : ''}
            </span>
            <span className="num">
              {session.slot + 1} / {plan.mode === 'survival' ? '∞' : session.total}
            </span>
          </div>
          <Blocks states={blocks} />
        </div>
      </div>

      <div className="question-card" key={question.id}>
        <div className="row wrap" style={{ gap: 7, marginBottom: 12 }}>
          <span className="chip chip-blue">
            <Icon name={TYPE_ICON[question.type]} size={13} />
            {t.settings.typeNames[question.type]}
          </span>
          <span className="chip chip-quiet">{t.play.probe[question.probe]}</span>
          <span className="chip chip-quiet">{t.play.difficulty[question.difficulty - 1]}</span>
        </div>

        {instruction && question.type !== 'mcq' && (
          <div className="prompt prompt-instruction">{instruction}</div>
        )}
        {question.type !== 'match' && question.type !== 'order' && question.type !== 'error' && (
          // The question is the reference's language, not the interface's: an
          // English stem inside an Arabic page still has to read left to right.
          <div
            className="prompt"
            dir={detectLang(question.prompt) === 'ar' ? 'rtl' : 'ltr'}
            style={{ whiteSpace: 'pre-line' }}
          >
            {question.prompt}
          </div>
        )}

        <GameSurface
          question={question}
          locked={session.status !== 'question'}
          reveal={!!session.feedback && !session.feedback.retry}
          eliminated={session.eliminated}
          onAnswer={session.answer}
        />

        {session.hint && (
          <div className="hint" style={{ marginTop: 14 }}>
            <div className="hint-label">
              <Icon name="bulb" size={15} />
              {t.play.hintLabels[session.hint.key]}
            </div>
            <div className="small" style={{ marginTop: 3 }}>
              {session.hint.key === 'locate' ? t.play.hintLocate(session.hint.text) : session.hint.text}
            </div>
            {session.eliminated !== null && (
              <div className="tiny dim" style={{ marginTop: 4 }}>{t.play.hintEliminate}</div>
            )}
          </div>
        )}

        {canHint && (
          <button className="btn btn-sm btn-block" style={{ marginTop: 12 }} onClick={session.revealHint}>
            <Icon name="bulb" size={16} />
            {session.hintLevel === 0
              ? t.play.hintAsk
              : t.play.hintNext(t.play.hintLabels[(['think', 'locate', 'recall', 'explain'] as const)[session.hintLevel]])}
            {session.hintLevel > 0 && <span className="tiny dim"> {t.play.hintCost}</span>}
          </button>
        )}
      </div>

      {floating && <div className="float-xp num">{floating.text}</div>}

      {/* ---------- feedback ---------- */}
      {session.status === 'feedback' && session.feedback && (
        <div className={`sheet ${session.feedback.correct ? 'good' : 'bad'}`}>
          <div className="sheet-inner stack">
            <div className="row-between">
              <h2
                className="row"
                style={{ gap: 8, color: session.feedback.correct ? 'var(--green)' : 'var(--red)' }}
              >
                <Icon name={session.feedback.correct ? 'check' : 'x'} size={22} />
                {session.feedback.correct
                  ? t.play.correct[session.slot % t.play.correct.length]
                  : session.feedback.retry
                    ? t.play.tryAgain
                    : t.play.learnThis}
              </h2>
              {session.feedback.xp > 0 && <span className="chip chip-ember num">+{session.feedback.xp}</span>}
            </div>

            {session.feedback.answer && (
              <div className="answer-card">
                <div className="eyebrow">{t.play.theAnswer}</div>
                <p className="src" dir={detectLang(session.feedback.answer) === 'ar' ? 'rtl' : 'ltr'} style={{ margin: '5px 0 0' }}>
                  {session.feedback.answer}
                </p>
                {session.feedback.given && session.feedback.given !== session.feedback.answer && (
                  <p className="tiny muted" style={{ margin: '6px 0 0' }}>
                    {t.play.yourAnswer}: {session.feedback.given}
                  </p>
                )}
              </div>
            )}

            {chosen && (
              // The wrong option was not made up either: it is what the
              // reference says about something else, and saying so is the
              // most useful thing a wrong answer can teach.
              <div className="card card-quiet">
                <div className="eyebrow">{t.play.whyWrong}</div>
                <p className="small" style={{ margin: '6px 0' }}>
                  {chosen.term === session.feedback.given ? t.play.givenTerm(chosen.term) : t.play.givenIs(chosen.term)}
                </p>
                {chosen.term === session.feedback.given && <Quoted text={chosen.definition} />}
                <div style={{ marginTop: 8 }}>
                  <Cite citation={chosen.citation} course={course} />
                </div>
              </div>
            )}

            <div>
              <div className="eyebrow">{session.feedback.retry ? t.play.hintLabels.locate : t.play.why}</div>
              <div style={{ marginTop: 6 }}>
                <Quoted text={session.feedback.source} />
              </div>
              <div style={{ marginTop: 8 }}>
                <Cite citation={question.citation} course={course} />
              </div>
            </div>

            {!session.feedback.retry && (
              <div className="row wrap" style={{ gap: 8 }}>
                <button className="btn btn-sm" onClick={() => void loadExtra('simpler')} disabled={extraLoading}>
                  <Icon name="bulb" size={15} />
                  {t.play.simpler}
                </button>
                <button className="btn btn-sm" onClick={() => void loadExtra('example')} disabled={extraLoading}>
                  <Icon name="quote" size={15} />
                  {t.play.example}
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    session.requestReask(question.conceptId);
                    setReaskNoted(true);
                  }}
                  disabled={reaskNoted}
                >
                  <Icon name="refresh" size={15} />
                  {reaskNoted ? t.play.willAskLater : t.play.askLater}
                </button>
              </div>
            )}

            {extraLoading && <p className="tiny dim" style={{ margin: 0 }}>{t.tutor.thinking}</p>}
            {extra && (
              <div className="card card-quiet">
                <div className="eyebrow">{extra.label}</div>
                <div style={{ marginTop: 6 }}>
                  <Quoted text={extra.passage?.text ?? extra.text ?? ''} />
                </div>
                {extra.passage && (
                  <div style={{ marginTop: 8 }}>
                    <Cite citation={extra.passage.citation} course={course} />
                  </div>
                )}
              </div>
            )}

            {session.feedback.breakdown.length > 1 && (
              <div>
                <div className="divider" />
                {session.feedback.breakdown.map((line, i) => (
                  <div className="xp-line" key={i}>
                    {/* the engine emits keys; the words live in the dictionary */}
                    <span>
                      {line.label.startsWith('combo-')
                        ? `${t.play.xp.combo} ×${line.label.slice(6)}`
                        : t.play.xp[line.label] ?? line.label}
                    </span>
                    <span className="num" style={{ color: line.xp < 0 ? 'var(--red)' : 'var(--ember)' }}>
                      {line.xp > 0 ? '+' : ''}
                      {line.xp}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary btn-block" onClick={session.advance}>
              {session.feedback.retry ? t.play.retryBtn : t.play.continue}
            </button>
          </div>
        </div>
      )}

      {/* ---------- rescue ---------- */}
      {session.status === 'rescue' && session.rescueConcept && (
        <RescueSheet
          course={course}
          concept={session.rescueConcept}
          onBack={session.leaveRescue}
        />
      )}
    </div>
  );
}

/* ---------- rescue ---------- */

function RescueSheet({
  course,
  concept,
  onBack,
}: {
  course: Course;
  concept: Concept;
  onBack: () => void;
}) {
  const { t } = useApp();
  const example = useMemo(() => exampleFor(course, concept), [course, concept]);

  return (
    <div className="sheet">
      <div className="sheet-inner stack">
        <div className="eyebrow eyebrow-ember">{t.rescue.tag}</div>
        <h2>{concept.term}</h2>
        <p className="small muted" style={{ margin: 0 }}>{t.rescue.intro}</p>

        <div className="card card-quiet">
          <div className="eyebrow">{t.rescue.explain}</div>
          <div style={{ marginTop: 6 }}>
            <Quoted text={concept.definition} />
          </div>
          <div style={{ marginTop: 8 }}>
            <Cite citation={concept.citation} course={course} />
          </div>
        </div>

        <div className="card card-quiet">
          <div className="eyebrow">{t.rescue.example}</div>
          {example ? (
            <>
              <div style={{ marginTop: 6 }}>
                <Quoted text={example.text} />
              </div>
              <div style={{ marginTop: 8 }}>
                <Cite citation={example.citation} course={course} />
              </div>
            </>
          ) : (
            <p className="small dim" style={{ margin: '6px 0 0' }}>{t.rescue.noExample}</p>
          )}
        </div>

        <p className="tiny dim" style={{ margin: 0 }}>{t.rescue.thenEasy}</p>
        <button className="btn btn-primary btn-block" onClick={onBack}>
          {t.rescue.back}
        </button>
      </div>
    </div>
  );
}

/* ---------- results ---------- */

function Results({
  course,
  plan,
  summary,
  onAgain,
  onDone,
}: {
  course: Course;
  plan: SessionPlan;
  summary: Summary;
  onAgain: () => void;
  onDone: () => void;
}) {
  const { t, learner } = useApp();
  const progress = progressOf(learner, course.id);
  const percent = Math.round(summary.accuracy * 100);
  const passed = summary.accuracy >= 0.7;

  const conceptsById = new Map(course.concepts.map((c) => [c.id, c]));
  const weak = summary.weak.map((id) => conceptsById.get(id)).filter(Boolean);
  const strong = summary.strong.map((id) => conceptsById.get(id)).filter(Boolean);
  const tip = recommend(course, progress);
  const tipChapter = course.chapters.find((c) => c.id === tip.chapterId);

  const advice =
    weak.length > 0
      ? t.results.nextReview(weak[0]!.term)
      : tip.reason === 'new' && tipChapter
        ? t.results.nextChapter(tipChapter.title)
        : tip.reason === 'due'
          ? t.results.nextDaily
          : t.results.nextKeep;

  return (
    <div className="play">
      <div className="stack-lg" style={{ margin: 'auto 0' }}>
        <div className="center stack" style={{ gap: 10, justifyItems: 'center' }}>
          <span className={`emblem${passed ? '' : ' emblem-ember'}`}>
            <Icon name={passed ? 'crown' : 'target'} size={30} />
          </span>
          <div className="eyebrow">{plan.mode === 'exam' ? t.results.examTitle : t.results.title}</div>
          <h1>{percent}%</h1>
          {plan.mode === 'survival' && (
            <p className="small muted" style={{ margin: 0 }}>
              {t.play.surviveStreak(summary.survived)} · {t.results.survivalEnded(summary.answered)}
            </p>
          )}
        </div>

        <div className="grid-4">
          <Stat label={t.results.answered} value={<span className="num">{summary.answered}</span>} />
          <Stat label={t.results.correct} value={<span className="num">{summary.correct}</span>} />
          <Stat label={t.results.wrong} value={<span className="num">{summary.answered - summary.correct}</span>} />
          <Stat
            label={t.results.time}
            value={
              <span className="num">
                {Math.floor(summary.seconds / 60)}:{String(summary.seconds % 60).padStart(2, '0')}
              </span>
            }
            note={<span className="num">+{summary.xp} {t.common.xpShort}</span>}
          />
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="eyebrow eyebrow-ember">{t.results.strongTitle}</div>
            <div className="stack" style={{ gap: 6, marginTop: 10 }}>
              {strong.length === 0 && <p className="tiny dim" style={{ margin: 0 }}>{t.results.none}</p>}
              {strong.slice(0, 5).map((concept) => (
                <div className="row small" key={concept!.id} style={{ gap: 8 }}>
                  <span className="dot dot-mastered" />
                  <span className="truncate">{concept!.term}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">{t.results.weakTitle}</div>
            <div className="stack" style={{ gap: 6, marginTop: 10 }}>
              {weak.length === 0 && <p className="tiny dim" style={{ margin: 0 }}>{t.results.none}</p>}
              {weak.slice(0, 5).map((concept) => (
                <div className="row small" key={concept!.id} style={{ gap: 8 }}>
                  <span className="dot dot-weak" />
                  <span className="truncate">{concept!.term}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {weak.length > 0 && (
          <div className="card">
            <div className="eyebrow">{t.results.reviewTitle}</div>
            <div className="stack" style={{ gap: 10, marginTop: 10 }}>
              {weak.slice(0, 3).map((concept) => (
                <div key={concept!.id}>
                  <div className="row-between">
                    <strong className="small truncate">{concept!.term}</strong>
                    <span className="tiny muted num">
                      {Math.round(conceptState(progress, concept!.id).mastery * 100)}%
                    </span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Quoted text={concept!.definition} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Cite citation={concept!.citation} course={course} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Banner kind="info" icon="bulb">
          <strong>{t.results.nextTitle}</strong>
          <p style={{ margin: '4px 0 0' }}>{advice}</p>
        </Banner>

        <div className="stack">
          <button className="btn btn-primary btn-block" onClick={onDone}>
            {t.results.toDashboard}
          </button>
          <button className="btn btn-block" onClick={onAgain}>
            <Icon name="refresh" size={18} />
            {t.results.again}
          </button>
        </div>
      </div>
    </div>
  );
}
