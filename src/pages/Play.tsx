import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import { GameSurface } from '../games';
import {
  HINT_LABELS,
  hintText,
  maxHintLevel,
  useSession,
  type SessionSummary,
} from '../engine/useSession';
import { missionsFor, reviewMission } from '../engine/missions';
import { getPassage, getUnit, lessonFor } from '../data/curriculum';
import { localizeLesson } from '../data/i18n';
import { applyAnswer, applyMissionResult } from '../services/studentService';
import { Blocks } from '../components/Bar';
import { Icon, missionIcon } from '../components/Icon';
import { ar } from '../i18n/ar';
import { missionTitle, skillAr, skillColor, skillEn } from '../i18n/labels';

export function Play() {
  const { unitId = '', missionKey = '' } = useParams();
  const { student, update, celebrate, toast } = useStudentRequired();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [marks, setMarks] = useState<Array<'ok' | 'miss'>>([]);
  const [floating, setFloating] = useState<{ id: number; text: string } | null>(null);
  const [passageOpen, setPassageOpen] = useState(false);

  // Snapshot the mission at mount so the queue never rebuilds mid-play.
  const spec = useMemo(() => {
    if (unitId === 'review') return reviewMission(student);
    return missionsFor(unitId).find((m) => m.key === missionKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId, missionKey]);

  /*
   * Teach before testing. A skill mission opens on its rule the first time it
   * is played; after that she has seen it, so it becomes a button instead of a
   * gate. Boss and mixed rounds never pre-teach — they are the exam.
   */
  const lesson = useMemo(() => {
    if (!spec || spec.kind !== 'skill') return null;
    const raw = lessonFor(spec.unitId, spec.skills[0]);
    return raw ? localizeLesson(spec.unitId, raw) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  const [showLesson, setShowLesson] = useState(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => !!lesson && !student.units[unitId]?.missions[missionKey],
  );

  const commit = useCallback(
    (record: Parameters<typeof applyAnswer>[1]) => {
      update((s) => applyAnswer(s, record));
      setMarks((m) => [...m, record.correct ? 'ok' : 'miss']);
      if (record.xp > 0) {
        const id = Date.now();
        setFloating({ id, text: `+${record.xp}` });
        setTimeout(() => setFloating((f) => (f?.id === id ? null : f)), 900);
      }
    },
    [update],
  );

  const finish = useCallback(
    (result: SessionSummary) => {
      setSummary(result);
      if (spec && spec.kind !== 'review') {
        update((s) =>
          applyMissionResult(s, spec.unitId, spec.key, result.accuracy, spec.kind === 'boss'),
        );
      }
      if (result.accuracy >= 0.8) celebrate();
      if (spec?.kind === 'boss' && result.accuracy >= 0.7) toast('🏆', ar.results.unitUnlocked);
    },
    [spec, update, celebrate, toast],
  );

  const safeSpec = useMemo(() => spec ?? reviewMission(student), [spec]); // eslint-disable-line react-hooks/exhaustive-deps
  const session = useSession(safeSpec, student, commit, finish);

  if (!spec) {
    return (
      <div className="page stack">
        <h2>{ar.notFound}</h2>
        <button className="btn" onClick={() => navigate('/journey')}>
          {ar.results.backToJourney}
        </button>
      </div>
    );
  }

  if (spec.kind === 'review' && student.mistakes.length === 0) {
    return (
      <div className="page stack center" style={{ paddingTop: 60 }}>
        <h2>{ar.review.empty}</h2>
        <p className="muted">{ar.review.emptyNote}</p>
        <button className="btn btn-primary" onClick={() => navigate('/journey')}>
          {ar.results.backToJourney}
        </button>
      </div>
    );
  }

  /* ---------- results ---------- */
  if (summary) {
    const pct = Math.round(summary.accuracy * 100);
    const passed = summary.accuracy >= 0.7;
    return (
      <div className="play">
        <div className="stack-lg" style={{ margin: 'auto 0', textAlign: 'center' }}>
          <div className="row" style={{ justifyContent: 'center' }}>
            <div className="torch">
              <Icon name={passed ? (spec.kind === 'boss' ? 'crown' : 'flame') : 'target'} size={34} />
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>{missionTitle(spec)}</div>
            <h1 style={{ marginTop: 6 }}>
              {passed ? (spec.kind === 'boss' ? ar.results.doneUnit : ar.results.done) : ar.results.goodTry}
            </h1>
          </div>

          <div className="grid-2">
            <div className="stat">
              <div className="eyebrow">{ar.results.accuracy}</div>
              <div className="big-num" style={{ marginTop: 6 }}>{pct}٪</div>
              <p className="tiny muted" style={{ margin: '4px 0 0' }}>
                {ar.results.ofRight(summary.correct, session.total)}
              </p>
            </div>
            <div className="stat">
              <div className="eyebrow">{ar.results.earned}</div>
              <div className="big-num num" style={{ marginTop: 6, color: 'var(--flame)' }}>
                +{summary.xp}
              </div>
              <p className="tiny muted" style={{ margin: '4px 0 0' }}>
                {ar.results.bestComboLabel} <span className="num">×{summary.bestCombo}</span>
              </p>
            </div>
          </div>

          {!passed && (
            <p className="small muted" style={{ margin: 0 }}>{ar.results.savedForReview}</p>
          )}

          <div className="stack">
            <button className="btn btn-primary btn-block" onClick={() => navigate('/journey')}>
              {ar.results.backToJourney}
            </button>
            <button className="btn btn-block" onClick={() => navigate(0)}>
              {ar.results.playAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- teach the rule before the first attempt ---------- */
  if (showLesson && lesson) {
    return (
      <div className="play">
        <div className="stack-lg" style={{ margin: 'auto 0' }}>
          <div className="center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>{ar.lesson.tag}</div>
            <h1 style={{ marginTop: 8 }}>{lesson.title}</h1>
          </div>

          <div className="card card-lg">
            <p className="small" style={{ margin: 0 }}>{lesson.rule}</p>
            <div className="divider" />
            <div className="eyebrow" style={{ marginBottom: 8 }}>{ar.lesson.examples}</div>
            {lesson.examples.map((e, i) => (
              <p key={i} className="small en" style={{ margin: '4px 0' }}>
                {e}
              </p>
            ))}
          </div>

          <p className="tiny dim center" style={{ margin: 0 }}>{ar.lesson.note}</p>

          <button className="btn btn-primary btn-block" onClick={() => setShowLesson(false)}>
            <Icon name="flame" size={18} filled />
            {ar.lesson.start}
          </button>
        </div>
      </div>
    );
  }

  const q = session.question;
  if (!q) return null;

  const passage = q.passageId ? getPassage(q.passageId) : undefined;
  const unit = getUnit(q.unitId);
  const hint = hintText(q, session.hintLevel);
  const canHint = session.hintLevel < maxHintLevel(q) && session.status === 'question';
  const nextHintLabel = HINT_LABELS[Math.min(session.hintLevel, HINT_LABELS.length - 1)];
  const instruction = ar.play.instructions[q.type];
  const blocks: Array<'todo' | 'ok' | 'miss'> = Array.from({ length: session.total }, (_, i) =>
    i < marks.length ? marks[i] : 'todo',
  );

  return (
    <div className="play">
      <div className="play-top">
        <div className="row-between">
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate(-1)}>
              <Icon name="arrowStart" size={17} />
              {ar.play.quit}
            </button>
            {lesson && (
              <button className="btn btn-sm btn-ghost" onClick={() => setShowLesson(true)}>
                <Icon name="book" size={16} />
                {ar.lesson.button}
              </button>
            )}
          </div>
          <div className="hud">
            {session.combo >= 2 && (
              <span className="chip chip-hot">
                <Icon name="flame" size={13} filled />
                {ar.play.comboLabel} <span className="num">×{session.combo}</span>
              </span>
            )}
            {session.multiplier > 1 && <span className="chip">×{session.multiplier}</span>}
            <span className="chip">
              <Icon name="star" size={13} filled />
              <span className="num">{session.stats.xp}</span>
            </span>
          </div>
        </div>

        <div>
          <div className="row-between tiny muted" style={{ marginBottom: 6 }}>
            <span className="row" style={{ gap: 6 }}>
              <Icon name={missionIcon(spec.kind, spec.key)} size={15} />
              {missionTitle(spec)}
              {unit ? ` · ${ar.unit} ${unit.number}` : ''}
            </span>
            <span className="num">
              {session.slot + 1} / {session.total}
            </span>
          </div>
          <Blocks states={blocks} />
        </div>
      </div>

      {passage && (
        <div className="stack" style={{ marginBottom: 14, gap: 8 }}>
          <div className="row-between">
            <h3 className="row" style={{ gap: 7, fontSize: '0.95rem' }}>
              <Icon name="book" size={17} />
              <span className="en-ui">{passage.title}</span>
            </h3>
            <button className="btn btn-sm btn-ghost" onClick={() => setPassageOpen((v) => !v)}>
              {passageOpen ? ar.play.collapse : ar.play.expand}
            </button>
          </div>
          <div className={`passage${passageOpen ? ' open' : ''}`}>
            {passage.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}

      <div className="question-card" key={q.id}>
        <div className="row wrap" style={{ gap: 7, marginBottom: 12 }}>
          <span className="chip" style={{ background: skillColor(q.skill), color: 'var(--paper-2)' }}>
            {skillAr(q.skill)}
          </span>
          <span className="chip chip-quiet en-ui">{skillEn(q.skill)}</span>
          <span className="chip chip-quiet">{ar.play.difficulty[q.difficulty - 1]}</span>
        </div>

        {/* Word Hunt draws the sentence itself, and the picture games say
            everything in the drawing — so these only get the Arabic
            instruction, with no redundant English line under it. */}
        {q.type === 'blank' || q.type === 'picture' || q.type === 'picmatch' ? (
          <p className="small muted" style={{ marginBottom: 12 }}>{instruction}</p>
        ) : instruction ? (
          <>
            <div className="prompt prompt-ar">{instruction}</div>
            <p className="tiny dim en-ui" style={{ margin: '-8px 0 12px' }}>{q.prompt}</p>
          </>
        ) : (
          <div className="prompt">{q.prompt}</div>
        )}

        <GameSurface
          question={q}
          hintLevel={session.hintLevel}
          locked={session.status !== 'question'}
          onAnswer={session.answer}
        />

        {hint && (
          <div className="hint" style={{ marginTop: 14 }}>
            <div className="hint-label">
              <Icon name="bulb" size={15} />
              {hint.label}
            </div>
            <div className="small" style={{ marginTop: 3 }}>{hint.text}</div>
          </div>
        )}

        {canHint && (
          <button
            className="btn btn-sm btn-block"
            style={{ marginTop: 12 }}
            onClick={session.revealHint}
          >
            <Icon name="bulb" size={16} />
            {session.hintLevel === 0 ? ar.play.hintAsk : ar.play.hintNext(nextHintLabel)}
            {session.hintLevel > 0 && <span className="tiny dim"> {ar.play.hintCost}</span>}
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
                  ? ar.play.correct[session.slot % ar.play.correct.length]
                  : session.feedback.retry
                    ? ar.play.tryAgain
                    : ar.play.learnThis}
              </h2>
              {session.feedback.xp > 0 && (
                <span className="chip chip-hot num">+{session.feedback.xp}</span>
              )}
            </div>

            <p className="small" style={{ margin: 0 }}>
              <strong className="muted">
                {session.feedback.retry ? ar.play.remember : ar.play.why}{' '}
              </strong>
              {session.feedback.message}
            </p>

            {session.feedback.breakdown.length > 1 && (
              <div>
                <div className="divider" />
                {session.feedback.breakdown.map((b, i) => (
                  <div className="xp-line" key={i}>
                    <span className="en-ui">{b.label}</span>
                    <span className="num" style={{ color: b.xp < 0 ? 'var(--red)' : 'var(--flame)' }}>
                      {b.xp > 0 ? '+' : ''}
                      {b.xp}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary btn-block" onClick={session.advance}>
              {session.feedback.retry ? ar.play.retry : ar.play.continue}
            </button>
          </div>
        </div>
      )}

      {/* ---------- learning rescue ---------- */}
      {session.status === 'rescue' && session.rescueLesson && (
        <div className="sheet">
          <div className="sheet-inner stack">
            <div className="eyebrow">{ar.play.rescueTag}</div>
            <h2>{session.rescueLesson.title}</h2>
            <p className="small muted" style={{ margin: 0 }}>{ar.play.rescueIntro}</p>
            <div className="card card-quiet">
              <p className="small" style={{ margin: 0 }}>{session.rescueLesson.rule}</p>
              <div className="divider" />
              {session.rescueLesson.examples.map((e, i) => (
                <p key={i} className="small en" style={{ margin: '3px 0' }}>
                  {e}
                </p>
              ))}
            </div>
            <button className="btn btn-primary btn-block" onClick={session.leaveRescue}>
              {ar.play.rescueBack}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
