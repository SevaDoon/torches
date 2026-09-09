import { useStudentRequired } from '../state/StudentContext';
import { ACHIEVEMENTS } from '../services/achievements';
import { Bar } from '../components/Bar';
import { Icon } from '../components/Icon';
import { achievementsAr, ar } from '../i18n/ar';

export function Achievements() {
  const { student } = useStudentRequired();
  const earned = new Set(student.achievements);

  return (
    <div className="page stack-lg">
      <div className="page-head">
        <div>
          <div className="eyebrow">{ar.achievements.eyebrow(earned.size, ACHIEVEMENTS.length)}</div>
          <h1>{ar.achievements.title}</h1>
        </div>
        <Icon name="medal" size={30} />
      </div>

      <p className="small muted" style={{ marginTop: -10 }}>{ar.achievements.intro}</p>

      <div className="stack" style={{ gap: 10 }}>
        {ACHIEVEMENTS.map((a) => {
          const has = earned.has(a.id);
          const tr = achievementsAr[a.id];
          const pct = has ? 100 : Math.round((a.progress?.(student) ?? 0) * 100);
          return (
            <div key={a.id} className={`ach ${has ? 'earned' : 'locked'}`}>
              <div className="ach-icon">
                {has ? <span>{a.icon}</span> : <Icon name="lock" size={18} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="row-between">
                  <strong>{tr?.title ?? a.title}</strong>
                  {has && <span className="chip chip-good">{ar.achievements.unlocked}</span>}
                </div>
                <p className="tiny muted" style={{ margin: '3px 0 6px' }}>
                  {tr?.description ?? a.description}
                </p>
                {!has && a.progress && <Bar percent={pct} thin />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
