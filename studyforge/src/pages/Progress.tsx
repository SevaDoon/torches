import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { useCourse } from '../state/useCourse';
import {
  DAY,
  answeredToday,
  conceptState,
  levelProgress,
  stateOf,
  weeklyXp,
} from '../services/progress';
import { ACHIEVEMENTS } from '../services/achievements';
import { Icon, MODE_ICON } from '../components/Icon';
import { Bar, Empty, Meter, Stat, Wordmark } from '../components/ui';

export function Progress() {
  const { t, learner, courses } = useApp();
  const level = levelProgress(learner.xp);
  const today = answeredToday(learner.courses);
  const accuracy = learner.totalAnswers === 0 ? 0 : learner.totalCorrect / learner.totalAnswers;

  // The course she played most recently — the one whose concepts are worth
  // listing here rather than making her open each course to find them.
  const recent = [...courses].sort(
    (a, b) => (learner.courses[b.id]?.lastPlayed ?? 0) - (learner.courses[a.id]?.lastPlayed ?? 0),
  )[0];
  const { course } = useCourse(learner.courses[recent?.id ?? '']?.lastPlayed ? recent?.id : undefined);

  const sessions = Object.entries(learner.courses)
    .flatMap(([courseId, progress]) => progress.sessions.map((s) => ({ ...s, courseId })))
    .sort((a, b) => b.at - a.at)
    .slice(0, 8);

  const weakest = course
    ? course.concepts
        .map((concept) => ({ concept, state: conceptState(learner.courses[course.id], concept.id) }))
        .filter((row) => row.state.attempts > 0)
        .sort((a, b) => a.state.mastery - b.state.mastery)
        .slice(0, 8)
    : [];

  return (
    <div className="page stack-lg">
      <header className="page-head">
        <div>
          <Wordmark size="1.1rem" />
          <h1 style={{ marginTop: 10 }}>{t.progress.title}</h1>
        </div>
        <Link className="btn btn-sm" to="/settings">
          <Icon name="settings" size={17} />
          {t.settings.title}
        </Link>
      </header>

      <div className="card card-lg card-ink">
        <div className="row-between">
          <div>
            <div className="eyebrow">{t.progress.levelLabel}</div>
            <div className="big-num" style={{ marginTop: 6 }}>
              <span className="num">{level.level}</span>
            </div>
          </div>
          <div style={{ textAlign: 'end' }}>
            <div className="eyebrow">{t.common.xpShort}</div>
            <div className="big-num num" style={{ marginTop: 6 }}>{learner.xp.toLocaleString('en-US')}</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Bar percent={level.percent} />
          <p className="tiny" style={{ margin: '6px 0 0', opacity: 0.85 }}>
            {t.progress.toNext(level.into, level.needed)}
          </p>
        </div>
      </div>

      <div className="grid-4">
        <Stat
          label={t.progress.streak}
          value={
            <span className="row" style={{ gap: 6 }}>
              <Icon name="flame" size={22} filled style={{ color: 'var(--ember)' }} />
              <span className="num">{learner.streak}</span>
            </span>
          }
        />
        <Stat label={t.progress.answered} value={<span className="num">{learner.totalAnswers}</span>} />
        <Stat label={t.progress.accuracy} value={<span className="num">{Math.round(accuracy * 100)}%</span>} />
        <Stat label={t.progress.week} value={<span className="num">{weeklyXp(learner)}</span>} />
      </div>

      <div className="card">
        <div className="row-between">
          <div className="eyebrow">{t.progress.dailyGoal}</div>
          <span className="tiny muted num">
            {today} / {learner.dailyGoal}
          </span>
        </div>
        <div style={{ marginTop: 10 }}>
          <Bar percent={(today / Math.max(1, learner.dailyGoal)) * 100} />
        </div>
        {today >= learner.dailyGoal && (
          <p className="tiny" style={{ margin: '8px 0 0', color: 'var(--green)' }}>
            <Icon name="check" size={13} style={{ verticalAlign: '-2px' }} /> {t.progress.goalMet}
          </p>
        )}
      </div>

      <section className="stack">
        <h2>{t.progress.byCourse}</h2>
        {courses.length === 0 ? (
          <Empty icon="grid" title={t.courses.emptyTitle}>
            <Link className="btn btn-primary" to="/create">{t.courses.create}</Link>
          </Empty>
        ) : (
          courses.map((summary) => {
            const states = Object.values(learner.courses[summary.id]?.conceptStates ?? {});
            const mastery = summary.concepts === 0 ? 0 : states.reduce((s, c) => s + c.mastery, 0) / summary.concepts;
            return (
              <Link key={summary.id} className="list-row" to={`/course/${summary.id}`}>
                <span className="row-icon">
                  <Icon name="book" size={18} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="truncate strong small">{summary.name}</div>
                  <div style={{ marginTop: 6 }}>
                    <Meter percent={mastery * 100} blocks={12} />
                  </div>
                </div>
                <span className="num strong">{Math.round(mastery * 100)}%</span>
              </Link>
            );
          })
        )}
      </section>

      {weakest.length > 0 && course && (
        <section className="stack">
          <div className="row-between">
            <h2>{t.progress.conceptsTable}</h2>
            <Link className="tiny muted" to={`/course/${course.id}/map`}>{t.map.title}</Link>
          </div>
          <div className="card card-flat scroll-x">
            <table className="data">
              <thead>
                <tr>
                  <th>{t.progress.concept}</th>
                  <th>{t.progress.masteryCol}</th>
                  <th>{t.progress.attemptsCol}</th>
                  <th>{t.progress.nextCol}</th>
                </tr>
              </thead>
              <tbody>
                {weakest.map(({ concept, state }) => {
                  const days = Math.ceil((state.nextReview - Date.now()) / DAY);
                  return (
                    <tr key={concept.id}>
                      <td>
                        <span className="row" style={{ gap: 7 }}>
                          <span className={`dot dot-${stateOf(state)}`} />
                          <span className="truncate">{concept.term}</span>
                        </span>
                      </td>
                      <td className="num">{Math.round(state.mastery * 100)}%</td>
                      <td className="num">{state.attempts}</td>
                      <td className="tiny muted">
                        {days <= 0 ? t.map.due : days === 1 ? t.map.tomorrow : t.map.inDays(days)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="stack">
        <h2>{t.progress.recentSessions}</h2>
        {sessions.length === 0 ? (
          <p className="small dim" style={{ margin: 0 }}>{t.progress.noSessions}</p>
        ) : (
          sessions.map((session) => (
            <div className="list-row" key={session.id}>
              <span className="row-icon">
                <Icon name={MODE_ICON[session.mode]} size={18} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="small strong">{t.modes[session.mode].t}</div>
                <div className="tiny muted">
                  {new Date(session.at).toLocaleDateString()} ·{' '}
                  <span className="num">{session.correct}/{session.answered}</span>
                </div>
              </div>
              <span className="num strong">{Math.round(session.accuracy * 100)}%</span>
            </div>
          ))
        )}
      </section>

      <section className="stack">
        <div className="row-between">
          <h2>{t.progress.achievements}</h2>
          <span className="tiny muted">
            {t.progress.earned(learner.achievements.length, ACHIEVEMENTS.length)}
          </span>
        </div>
        <div className="grid-2">
          {ACHIEVEMENTS.map((achievement) => {
            const has = learner.achievements.includes(achievement.id);
            return (
              <div className={`ach${has ? ' earned' : ' locked'}`} key={achievement.id}>
                <span className="ach-icon">
                  <Icon name={has ? achievement.icon : 'lock'} size={19} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="small strong">{t.achievements[achievement.id].t}</div>
                  <div className="tiny muted">{t.achievements[achievement.id].d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
