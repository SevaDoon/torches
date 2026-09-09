import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import { units } from '../data/curriculum';
import {
  MISSION_PASS,
  currentUnitId,
  unitCompletion,
  unitUnlocked,
} from '../services/progressService';
import { missionUnlocked, missionsFor } from '../engine/missions';
import { Bar } from '../components/Bar';
import { Icon, missionIcon } from '../components/Icon';
import { ar, unitTitlesAr } from '../i18n/ar';
import { missionSubtitle, missionTitle, missionTitleEn } from '../i18n/labels';

export function Journey() {
  const { student } = useStudentRequired();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(currentUnitId(student));
  const done = units.filter((u) => unitCompletion(student, u.id) >= 1).length;

  return (
    <div className="page stack-lg">
      <div className="page-head">
        <div>
          <div className="eyebrow en-ui">MegaGoal 1</div>
          <h1>{ar.journey.title}</h1>
        </div>
        <span className="chip">{ar.journey.unitsDone(done, units.length)}</span>
      </div>

      <div className="journey">
        {units.map((unit, i) => {
          const unlocked = unitUnlocked(student, i);
          const completion = unitCompletion(student, unit.id);
          const isOpen = open === unit.id;
          const cleared = completion >= 1;

          return (
            <div key={unit.id} className="stack" style={{ gap: 8 }}>
              <button
                className={`node tappable${!unlocked ? ' locked' : ''}${cleared ? ' done' : ''}${
                  isOpen ? ' current' : ''
                }`}
                onClick={() => unlocked && setOpen(isOpen ? null : unit.id)}
                disabled={!unlocked}
              >
                <div className="node-badge">
                  {cleared ? (
                    <Icon name="check" size={24} />
                  ) : unlocked ? (
                    <span className="num">{unit.number}</span>
                  ) : (
                    <Icon name="lock" size={20} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="row-between" style={{ gap: 8 }}>
                    <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {unitTitlesAr[unit.id]}
                    </h3>
                    <span className="tiny dim num">{Math.round(completion * 100)}٪</span>
                  </div>
                  <p className="tiny dim en-ui" style={{ margin: '1px 0 7px' }}>
                    {unlocked ? unit.title : ''}
                  </p>
                  {!unlocked && (
                    <p className="tiny dim" style={{ margin: '1px 0 7px' }}>
                      {ar.journey.locked}
                    </p>
                  )}
                  <Bar percent={completion * 100} thin />
                </div>
              </button>

              {isOpen && unlocked && (
                <div className="stack" style={{ gap: 8, paddingInlineStart: 10 }}>
                  {missionsFor(unit.id).map((m) => {
                    const score = student.units[unit.id]?.missions[m.key] ?? 0;
                    const ok = missionUnlocked(student, m);
                    return (
                      <button
                        key={m.key}
                        className={`mission${m.kind === 'boss' ? ' boss' : ''}`}
                        disabled={!ok}
                        onClick={() => navigate(`/play/${unit.id}/${m.key}`)}
                      >
                        <span className="mission-icon">
                          <Icon name={ok ? missionIcon(m.kind, m.key) : 'lock'} size={19} />
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>
                            {missionTitle(m)}{' '}
                            <bdi className="tiny dim en-ui">{missionTitleEn(m)}</bdi>
                          </span>
                          <span className="tiny dim">
                            {ok ? missionSubtitle(m) : ar.journey.lockedMission}
                          </span>
                        </span>
                        <span
                          className={`chip${
                            score >= MISSION_PASS ? ' chip-good' : score > 0 ? ' chip-hot' : ' chip-quiet'
                          }`}
                        >
                          {score > 0 ? (
                            <span className="num">{Math.round(score * 100)}٪</span>
                          ) : (
                            <span className="num">{m.length}</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                  <p className="tiny dim" style={{ margin: '2px 0 6px' }}>
                    {ar.journey.pages(unit.pages, unit.questions.length)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
