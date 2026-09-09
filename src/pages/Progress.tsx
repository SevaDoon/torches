import { useStudentRequired } from '../state/StudentContext';
import { units } from '../data/curriculum';
import {
  levelProgress,
  overallAccuracy,
  unitCompletion,
  unitUnlocked,
} from '../services/progressService';
import { Bar } from '../components/Bar';
import { Icon } from '../components/Icon';
import { SkillMeters } from '../components/SkillMeter';
import { ar, unitTitlesAr } from '../i18n/ar';

export function Progress() {
  const { student } = useStudentRequired();
  const lvl = levelProgress(student.xp);

  return (
    <div className="page stack-lg">
      <div className="page-head">
        <div>
          <div className="eyebrow">{ar.progress.eyebrow}</div>
          <h1>{ar.progress.title}</h1>
        </div>
        <Icon name="chart" size={30} />
      </div>

      <div className="grid-2">
        <div className="stat">
          <div className="eyebrow">{ar.progress.level}</div>
          <div className="big-num" style={{ marginTop: 6 }}>{lvl.level}</div>
          <p className="tiny muted num" style={{ margin: '4px 0 0' }}>
            {student.xp.toLocaleString('en-US')} {ar.xp}
          </p>
        </div>
        <div className="stat">
          <div className="eyebrow">{ar.progress.accuracy}</div>
          <div className="big-num" style={{ marginTop: 6 }}>
            {Math.round(overallAccuracy(student) * 100)}٪
          </div>
          <p className="tiny muted" style={{ margin: '4px 0 0' }}>
            {ar.progress.ofAnswers(student.totalCorrect, student.totalAnswers)}
          </p>
        </div>
        <div className="stat">
          <div className="eyebrow">{ar.progress.bestCombo}</div>
          <div className="big-num num" style={{ marginTop: 6 }}>×{student.bestCombo}</div>
          <p className="tiny muted" style={{ margin: '4px 0 0' }}>{ar.progress.inOneChallenge}</p>
        </div>
        <div className="stat">
          <div className="eyebrow">{ar.progress.streak}</div>
          <div className="big-num row" style={{ marginTop: 6, gap: 6 }}>
            <Icon name="flame" size={22} filled />
            {student.streak}
          </div>
          <p className="tiny muted" style={{ margin: '4px 0 0' }}>{ar.progress.keepAlive}</p>
        </div>
      </div>

      <section className="card">
        <h3 style={{ marginBottom: 14 }}>{ar.progress.skills}</h3>
        <SkillMeters student={student} />
      </section>

      <section className="stack">
        <h3>{ar.progress.units}</h3>
        {units.map((u, i) => {
          const pct = Math.round(unitCompletion(student, u.id) * 100);
          const locked = !unitUnlocked(student, i);
          return (
            <div key={u.id} className="card" style={{ opacity: locked ? 0.55 : 1 }}>
              <div className="row-between" style={{ marginBottom: 8 }}>
                <span className="small row" style={{ fontWeight: 600, gap: 6 }}>
                  {locked && <Icon name="lock" size={15} />}
                  <span className="num">{u.number}</span>. {unitTitlesAr[u.id]}{' '}
                  <bdi className="tiny dim en-ui">{u.title}</bdi>
                </span>
                <span className="tiny muted num">{pct}٪</span>
              </div>
              <Bar percent={pct} thin />
            </div>
          );
        })}
      </section>
    </div>
  );
}
