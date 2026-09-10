import { useNavigate } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import { SKILL_ORDER, questionsFor } from '../data/curriculum';
import { currentUnitId, skillAccuracy, weakestSkill } from '../services/progressService';
import { Bar } from '../components/Bar';
import { Icon, missionIcon } from '../components/Icon';
import { GAME_NAMES } from '../games';
import type { Question } from '../types';
import { ar } from '../i18n/ar';
import { skillEn } from '../i18n/labels';

const GAMES_BY_SKILL: Record<string, Array<Question['type']>> = {
  grammar: ['mcq', 'order', 'error', 'blank'],
  vocabulary: ['match', 'memory', 'mcq', 'blank'],
  reading: ['mcq', 'truefalse'],
  form: ['mcq', 'order', 'blank', 'error'],
};

export function Skills() {
  const { student } = useStudentRequired();
  const navigate = useNavigate();
  const unitId = currentUnitId(student);
  const weak = weakestSkill(student);

  return (
    <div className="page stack-lg">
      <div className="page-head">
        <div>
          <div className="eyebrow">{ar.skillsPage.eyebrow}</div>
          <h1>{ar.skillsPage.title}</h1>
        </div>
        <Icon name="target" size={30} />
      </div>

      {SKILL_ORDER.map((skill) => {
        const stat = student.skills[skill];
        const pct = Math.round(skillAccuracy(student, skill) * 100);
        const inUnit = questionsFor(unitId, skill).length;
        return (
          <section key={skill} className="card card-lg">
            <div className="row-between" style={{ marginBottom: 12 }}>
              <div className="row" style={{ gap: 11 }}>
                <span className="mission-icon">
                  <Icon name={missionIcon('skill', skill)} size={20} />
                </span>
                <div>
                  <h3>{skillEn(skill)}</h3>
                  <p className="tiny dim" style={{ margin: 0 }}>
                    {ar.skillsPage.answered(stat.attempts, stat.correct)}
                  </p>
                </div>
              </div>
              {skill === weak && <span className="chip chip-hot">{ar.skillsPage.focus}</span>}
            </div>

            <Bar percent={pct} />
            <p className="tiny muted" style={{ margin: '7px 0 12px' }}>
              {stat.attempts === 0 ? ar.skillsPage.notStarted : ar.skillsPage.accuracy(pct)}
            </p>

            <div className="row wrap" style={{ gap: 6, marginBottom: 12 }}>
              {GAMES_BY_SKILL[skill].map((t) => (
                <span key={t} className="chip chip-quiet">{GAME_NAMES[t]}</span>
              ))}
            </div>

            <button
              className="btn btn-sm btn-block"
              disabled={inUnit === 0}
              onClick={() => navigate(`/play/${unitId}/${skill}`)}
            >
              {ar.skillsPage.practise(skillEn(skill))}
            </button>
          </section>
        );
      })}
    </div>
  );
}
