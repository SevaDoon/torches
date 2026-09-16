import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Mode } from '../types';
import { useApp } from '../state/AppContext';
import { useCourse } from '../state/useCourse';
import { progressOf } from '../services/learner';
import { courseMastery, dueConcepts, rankChapters, weakConcepts } from '../services/progress';
import { recommend } from '../engine/session';
import { setSetting } from '../services/db';
import { Icon, MODE_ICON } from '../components/Icon';
import { Banner, Empty, Meter, PageSkeleton, Stat } from '../components/ui';

const MODES: Mode[] = ['quick', 'chapter', 'weakness', 'exam', 'survival', 'daily'];

export function CourseDashboard() {
  const { courseId } = useParams();
  const { t, learner } = useApp();
  const { course, status } = useCourse(courseId);
  const navigate = useNavigate();

  // The nav's course tabs follow whichever course was opened last.
  useEffect(() => {
    if (course) setSetting('lastCourse', course.id);
  }, [course]);

  if (status === 'loading') return <PageSkeleton />;
  if (!course) {
    return (
      <div className="page">
        <Empty icon="alert" title={t.errors.noCourse}>
          <Link className="btn btn-primary" to="/courses">{t.nav.courses}</Link>
        </Empty>
      </div>
    );
  }

  const progress = progressOf(learner, course.id);
  const mastery = courseMastery(course.concepts, progress);
  const ranked = rankChapters(course.chapters, course.concepts, progress);
  const played = ranked.filter((r) => r.attempts > 0);
  const weakest = played[0];
  const strongest = played[played.length - 1];
  const due = dueConcepts(course.concepts, progress);
  const weak = weakConcepts(course.concepts, progress);
  const tip = recommend(course, progress);
  const tipChapter = course.chapters.find((c) => c.id === tip.chapterId);

  const play = (mode: Mode, chapterId?: string) =>
    navigate(`/course/${course.id}/play/${mode}${chapterId ? `?chapter=${chapterId}` : ''}`);

  return (
    <div className="page stack-lg">
      <header className="stack" style={{ gap: 8 }}>
        <div className="row wrap" style={{ gap: 6 }}>
          <Link to="/courses" className="chip chip-quiet" style={{ textDecoration: 'none' }}>
            <Icon name="arrowStart" size={13} />
            {t.nav.courses}
          </Link>
          {course.isDemo && <span className="chip chip-demo">{t.common.demo}</span>}
        </div>
        <h1>{course.name}</h1>
      </header>

      <div className="grid-4">
        <Stat label={t.dashboard.chaptersCount} value={<span className="num">{course.chapters.length}</span>} />
        <Stat label={t.dashboard.conceptsCount} value={<span className="num">{course.concepts.length}</span>} />
        <Stat label={t.dashboard.questionsCount} value={<span className="num">{course.questions.length}</span>} />
        <Stat
          label={t.dashboard.masteryPct}
          value={<span className="num">{Math.round(mastery * 100)}%</span>}
          note={<Meter percent={mastery * 100} blocks={10} />}
        />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="eyebrow">{t.dashboard.weakest}</div>
          <h3 style={{ marginTop: 8 }}>{weakest ? weakest.chapter.title : t.dashboard.notEnough}</h3>
          {weakest && (
            <p className="tiny muted num" style={{ margin: '4px 0 0' }}>
              {Math.round(weakest.mastery * 100)}%
            </p>
          )}
        </div>
        <div className="card">
          <div className="eyebrow eyebrow-ember">{t.dashboard.strongest}</div>
          <h3 style={{ marginTop: 8 }}>{strongest ? strongest.chapter.title : t.dashboard.notEnough}</h3>
          {strongest && (
            <p className="tiny muted num" style={{ margin: '4px 0 0' }}>
              {Math.round(strongest.mastery * 100)}%
            </p>
          )}
        </div>
      </div>

      <button
        className="card card-lg card-blue tappable"
        onClick={() => play(tip.mode, tip.chapterId)}
      >
        <div className="eyebrow">{t.dashboard.challengeMe}</div>
        <h2 style={{ marginTop: 10 }}>
          {tip.reason === 'new' && tipChapter
            ? t.dashboard.challengeReady(tipChapter.title)
            : tip.reason === 'ready'
              ? t.dashboard.challengeReady(t.modes.exam.t)
              : t.dashboard.challengeWeak}
        </h2>
        <div className="row-between" style={{ marginTop: 14 }}>
          <span className="small" style={{ opacity: 0.9 }}>{t.modes[tip.mode].t}</span>
          <span className="chip" style={{ background: 'var(--paper-2)', color: 'var(--ink)' }}>
            <Icon name={MODE_ICON[tip.mode]} size={14} />
            {t.dashboard.challengeStart}
          </span>
        </div>
      </button>

      {due.length > 0 ? (
        <Banner kind="warn" icon="refresh">
          <div className="row-between wrap" style={{ gap: 8 }}>
            <span>{t.dashboard.reviewDue(due.length)}</span>
            <button className="btn btn-sm" onClick={() => play('daily')}>
              {t.modes.dailyLabel}
            </button>
          </div>
        </Banner>
      ) : (
        <Banner kind="good" icon="check">
          {t.dashboard.reviewDueNone}
        </Banner>
      )}

      <section className="stack">
        <h2>{t.dashboard.modesTitle}</h2>
        <div className="grid-3">
          {MODES.map((mode) => {
            const unavailable = mode === 'weakness' && weak.length === 0 && due.length === 0;
            return (
              <button
                key={mode}
                className="card tappable"
                onClick={() => play(mode)}
                disabled={unavailable}
                style={unavailable ? { opacity: 0.55, boxShadow: 'none' } : undefined}
              >
                <div className="row" style={{ gap: 10 }}>
                  <span className="emblem emblem-sm">
                    <Icon name={MODE_ICON[mode]} size={19} />
                  </span>
                  <h3 className="grow">{t.modes[mode].t}</h3>
                </div>
                <p className="tiny muted" style={{ margin: '10px 0 0' }}>
                  {unavailable ? t.modes.weaknessNone : t.modes[mode].d}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="stack">
        <div className="row-between">
          <h2>{t.dashboard.mapTitle}</h2>
          <Link to={`/course/${course.id}/map`} className="tiny muted">{t.dashboard.openMap}</Link>
        </div>
        <p className="tiny dim" style={{ margin: 0 }}>{t.dashboard.mapHint}</p>
        <div className="stack" style={{ gap: 8 }}>
          {course.chapters.map((chapter) => {
            const row = ranked.find((r) => r.chapter.id === chapter.id)!;
            const count = course.concepts.filter((c) => c.chapterId === chapter.id).length;
            return (
              <button key={chapter.id} className="list-row" onClick={() => play('chapter', chapter.id)}>
                <span className="row-icon num tiny">{chapter.order}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="truncate strong small">{chapter.title}</div>
                  <div style={{ marginTop: 6 }}>
                    <Meter percent={row.mastery * 100} blocks={12} />
                  </div>
                  <div className="tiny muted" style={{ marginTop: 4 }}>
                    {t.map.conceptOf(count)}
                  </div>
                </div>
                <span className="num strong">{Math.round(row.mastery * 100)}%</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="stack">
        <h2>{t.dashboard.sourcesTitle}</h2>
        {course.docs.map((doc) => (
          <div className="file-row" key={doc.id}>
            <span className="file-kind">{doc.kind.toUpperCase().slice(0, 4)}</span>
            <div style={{ minWidth: 0 }}>
              <div className="truncate strong small">{doc.name}</div>
              <div className="tiny muted">
                {t.create.charsRead(doc.chars)}
                {doc.pages.length > 0 && ` · ${doc.pages.length} ${t.common.page}`}
              </div>
            </div>
            <Link className="btn btn-sm" to={`/course/${course.id}/ask`}>
              <Icon name="chat" size={15} />
              {t.dashboard.askAi}
            </Link>
          </div>
        ))}
        {course.rejected > 0 && (
          <p className="tiny dim" style={{ margin: 0 }}>{t.analyze.rejected(course.rejected)}</p>
        )}
      </section>
    </div>
  );
}
