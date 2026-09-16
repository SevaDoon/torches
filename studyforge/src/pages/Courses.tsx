import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { useOpenDemo } from '../state/useDemo';
import { deleteCourse, getSetting, setSetting } from '../services/db';
import { forgetIndex } from '../engine/retrieval';
import { Icon } from '../components/Icon';
import { Empty, Meter, Wordmark } from '../components/ui';
import type { CourseSummary } from '../types';

export function Courses() {
  const { t, courses, learner, refreshCourses, toast, update } = useApp();
  const demo = useOpenDemo();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState<CourseSummary | null>(null);

  /** Mastery without loading the course: the summary knows how many concepts
      there are, and the learner record knows how far each one has got. */
  const masteryOf = (summary: CourseSummary) => {
    const states = Object.values(learner.courses[summary.id]?.conceptStates ?? {});
    if (summary.concepts === 0) return 0;
    return states.reduce((sum, s) => sum + s.mastery, 0) / summary.concepts;
  };

  const remove = async (summary: CourseSummary) => {
    await deleteCourse(summary.id);
    forgetIndex(summary.id);
    update((l) => {
      const courses = { ...l.courses };
      delete courses[summary.id];
      return { ...l, courses };
    });
    // The nav's course tabs point at the last course opened; that must not
    // survive the course it points at.
    if (getSetting('lastCourse') === summary.id) setSetting('lastCourse', null);
    await refreshCourses();
    setConfirming(null);
    toast('check', t.toasts.deleted);
  };

  return (
    <div className="page stack-lg">
      <header className="page-head">
        <div>
          <Wordmark size="1.1rem" />
          <h1 style={{ marginTop: 10 }}>{t.courses.title}</h1>
          <p className="small muted" style={{ margin: '4px 0 0' }}>{t.courses.subtitle}</p>
        </div>
        <Link className="btn btn-primary" to="/create">
          <Icon name="plus" size={19} />
          {t.courses.create}
        </Link>
      </header>

      {courses.length === 0 ? (
        <Empty icon="grid" title={t.courses.emptyTitle} body={t.courses.emptyBody}>
          <div className="row wrap" style={{ gap: 8, justifyContent: 'center', marginTop: 4 }}>
            <Link className="btn btn-primary" to="/create">
              <Icon name="plus" size={18} />
              {t.courses.create}
            </Link>
            <button className="btn" onClick={demo.open} disabled={demo.pending}>
              <Icon name={demo.pending ? 'hourglass' : 'play'} size={17} />
              {demo.pending ? t.common.loading : t.courses.openDemo}
            </button>
          </div>
        </Empty>
      ) : (
        <div className="grid-2">
          {courses.map((summary) => {
            const progress = learner.courses[summary.id];
            const mastery = masteryOf(summary);
            return (
              <div className="card" key={summary.id}>
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="row wrap" style={{ gap: 6 }}>
                      {summary.isDemo && <span className="chip chip-demo">{t.common.demo}</span>}
                      <span className="chip chip-quiet">{summary.lang === 'ar' ? 'AR' : 'EN'}</span>
                    </div>
                    <h2 style={{ marginTop: 8 }}>{summary.name}</h2>
                    <p className="tiny muted truncate" style={{ margin: '4px 0 0' }}>
                      {summary.docNames.join(' · ')}
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setConfirming(summary)}
                    aria-label={t.common.delete}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>

                <div className="row wrap tiny muted" style={{ gap: 12, marginTop: 12 }}>
                  <span><span className="num">{summary.chapters}</span> {t.common.chapters}</span>
                  <span><span className="num">{summary.concepts}</span> {t.common.concepts}</span>
                  <span><span className="num">{summary.questions}</span> {t.common.questions}</span>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="row-between tiny muted" style={{ marginBottom: 5 }}>
                    <span>{t.courses.mastery}</span>
                    <span className="num">{Math.round(mastery * 100)}%</span>
                  </div>
                  <Meter percent={mastery * 100} blocks={14} />
                </div>

                <div className="row-between" style={{ marginTop: 14 }}>
                  <span className="tiny dim">
                    {progress?.lastPlayed
                      ? `${t.courses.lastPlayed}: ${new Date(progress.lastPlayed).toLocaleDateString()}`
                      : t.courses.never}
                  </span>
                  <button className="btn btn-sm btn-primary" onClick={() => navigate(`/course/${summary.id}`)}>
                    {t.courses.open}
                    <Icon name="arrowEnd" size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirming && (
        <div className="sheet bad">
          <div className="sheet-inner stack">
            <h2>{t.courses.deleteTitle}</h2>
            <p className="small muted" style={{ margin: 0 }}>{t.courses.deleteBody(confirming.name)}</p>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-danger grow" onClick={() => void remove(confirming)}>
                <Icon name="trash" size={18} />
                {t.common.delete}
              </button>
              <button className="btn grow" onClick={() => setConfirming(null)}>
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
