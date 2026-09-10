import { useNavigate } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import { getQuestion, getUnit } from '../data/curriculum';
import type { Skill } from '../types';
import { Icon } from '../components/Icon';
import { ar } from '../i18n/ar';
import { skillEn, skillColor } from '../i18n/labels';

export function Review() {
  const { student } = useStudentRequired();
  const navigate = useNavigate();

  const missed = student.mistakes
    .map(getQuestion)
    .filter((q): q is NonNullable<ReturnType<typeof getQuestion>> => !!q);

  const bySkill = missed.reduce<Record<string, number>>((acc, q) => {
    acc[q.skill] = (acc[q.skill] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page stack-lg">
      <div className="page-head">
        <div>
          <div className="eyebrow">{ar.review.eyebrow}</div>
          <h1>{ar.review.title}</h1>
        </div>
        <Icon name="refresh" size={28} />
      </div>

      {missed.length === 0 ? (
        <div className="card center stack">
          <h3>{ar.review.empty}</h3>
          <p className="small muted" style={{ margin: 0 }}>{ar.review.emptyNote}</p>
          <button className="btn btn-primary" onClick={() => navigate('/journey')}>
            {ar.review.goJourney}
          </button>
        </div>
      ) : (
        <>
          <div className="card card-lg card-hot">
            <div className="row-between">
              <div>
                <h2>{ar.review.toFix(missed.length)}</h2>
                <p className="small" style={{ margin: '4px 0 0', opacity: 0.85 }}>
                  {ar.review.leavesNote}
                </p>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => navigate('/play/review/review')}
                style={{ background: 'var(--paper-2)' }}
              >
                {ar.review.start}
              </button>
            </div>
          </div>

          <section className="card">
            <h3 style={{ marginBottom: 12 }}>{ar.review.gaps}</h3>
            <div className="row wrap" style={{ gap: 8 }}>
              {Object.entries(bySkill).map(([skill, n]) => (
                <span key={skill} className="chip">
                  <span className="skill-dot" style={{ background: skillColor(skill as Skill) }} />
                  {skillEn(skill as Skill)} · <span className="num">{n}</span>
                </span>
              ))}
            </div>
          </section>

          <section className="stack" style={{ gap: 8 }}>
            <h3>{ar.review.theQuestions}</h3>
            {missed.slice(0, 20).map((q) => {
              const unit = getUnit(q.unitId);
              return (
                <div key={q.id} className="card">
                  <div className="row wrap" style={{ gap: 7, marginBottom: 7 }}>
                    <span
                      className="chip"
                      style={{ background: skillColor(q.skill), color: 'var(--paper-2)' }}
                    >
                      {skillEn(q.skill)}
                    </span>
                    <span className="chip chip-quiet">
                      {ar.unit} <span className="num">{unit?.number}</span>
                    </span>
                  </div>
                  <p className="small en" style={{ margin: 0 }}>{q.prompt}</p>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
