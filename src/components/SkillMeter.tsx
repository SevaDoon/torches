import type { Skill, Student } from '../types';
import { SKILL_ORDER } from '../data/curriculum';
import { skillAccuracy } from '../services/progressService';
import { skillColor, skillEn } from '../i18n/labels';
import { Bar } from './Bar';

export function SkillMeter({ student, skill }: { student: Student; skill: Skill }) {
  const stat = student.skills[skill];
  const pct = Math.round(skillAccuracy(student, skill) * 100);
  return (
    <div>
      <div className="row-between" style={{ marginBottom: 5 }}>
        <span className="small row" style={{ gap: 7 }}>
          <span className="skill-dot" style={{ background: skillColor(skill) }} />
          {skillEn(skill)}
        </span>
        <span className="small muted num">{stat.attempts === 0 ? '—' : `${pct}%`}</span>
      </div>
      <Bar percent={pct} thin />
    </div>
  );
}

export function SkillMeters({ student }: { student: Student }) {
  return (
    <div className="stack">
      {SKILL_ORDER.map((s) => (
        <SkillMeter key={s} student={student} skill={s} />
      ))}
    </div>
  );
}
