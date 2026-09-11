import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import { units } from '../data/curriculum';
import { currentUnitId, missionPassed, unitUnlocked } from '../services/progressService';
import { missionUnlocked, missionsFor, unitStages } from '../engine/missions';
import { Bar } from '../components/Bar';
import { Icon, missionIcon } from '../components/Icon';
import { ar } from '../i18n/ar';
import { missionSubtitle, missionTitle } from '../i18n/labels';

export function Journey() {
  const { student } = useStudentRequired();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(currentUnitId(student));
  // A unit is finished when every stage in it is: the same rule the rows use.
  const isDone = (unitId: string) => {
    const s = unitStages(student, unitId);
    return s.done === s.total;
  };
  const done = units.filter((u) => isDone(u.id)).length;

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
          const stages = unitStages(student, unit.id);
          const isOpen = open === unit.id;
          const cleared = stages.done === stages.total;

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
                      {unit.title}
                    </h3>
                    {unlocked && (
                      <span className="tiny dim" style={{ whiteSpace: 'nowrap' }}>
                        {ar.journey.stagesDone(stages.done, stages.total)}
                      </span>
                    )}
                  </div>
                  {unlocked && (
                    <p className="tiny dim" style={{ margin: '1px 0 7px' }}>
                      {unit.functions[0]}
                    </p>
                  )}
                  {!unlocked && (
                    <p className="tiny dim" style={{ margin: '1px 0 7px' }}>
                      {ar.journey.locked}
                    </p>
                  )}
                  {/* The bar counts the same stages the row does. */}
                  <Bar percent={(stages.done / stages.total) * 100} thin />
                </div>
              </button>

              {isOpen && unlocked && (
                <div className="stack" style={{ gap: 8, paddingInlineStart: 10 }}>
                  {missionsFor(unit.id).map((m, stage) => {
                    const score = student.units[unit.id]?.missions[m.key] ?? 0;
                    const ok = missionUnlocked(student, m);
                    const passed = missionPassed(student, unit.id, m);
                    /*
                     * Inside an opened unit the old subtitle repeated the unit
                     * she is already looking at; the stage number is what she
                     * cannot see anywhere else.
                     */
                    const sub = !ok
                      ? ar.journey.lockedMission
                      : m.kind === 'skill'
                        ? ar.journey.questionCount(m.length)
                        : missionSubtitle(m);
                    return (
                      <button
                        key={m.key}
                        className={`mission${m.kind === 'boss' ? ' boss' : ''}${passed ? ' passed' : ''}`}
                        disabled={!ok}
                        onClick={() => navigate(`/play/${unit.id}/${m.key}`)}
                      >
                        <span className="mission-icon">
                          <Icon name={ok ? missionIcon(m.kind, m.key) : 'lock'} size={19} />
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>
                            {ar.journey.stage(stage + 1)} · {missionTitle(m)}
                          </span>
                          <span className="tiny dim">{sub}</span>
                        </span>
                        <span
                          className={`chip${
                            passed ? ' chip-good' : score > 0 ? ' chip-hot' : ' chip-quiet'
                          }`}
                        >
                          {passed ? (
                            <Icon name="check" size={15} />
                          ) : score > 0 ? (
                            <span className="num">{Math.round(score * 100)}%</span>
                          ) : (
                            ar.journey.start
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
