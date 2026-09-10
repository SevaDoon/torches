import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import { Torch, TorchTierName } from '../components/Torch';
import { Bar } from '../components/Bar';
import { Icon, missionIcon } from '../components/Icon';
import { SkillMeters } from '../components/SkillMeter';
import { getUnit } from '../data/curriculum';
import {
  MISSION_PASS,
  currentUnitId,
  levelProgress,
  unitCompletion,
  weakestSkill,
} from '../services/progressService';
import { loadLeaderboard, rankOf } from '../services/leaderboardService';
import { missionUnlocked, missionsFor } from '../engine/missions';
import { ar } from '../i18n/ar';
import { missionTitle, skillEn } from '../i18n/labels';

export function Home() {
  const { student } = useStudentRequired();
  const navigate = useNavigate();
  const [rank, setRank] = useState<{ place: number; of: number } | null>(null);

  const lvl = levelProgress(student.xp);
  const unitId = currentUnitId(student);
  const unit = getUnit(unitId)!;
  const weak = weakestSkill(student);

  const missions = missionsFor(unitId);
  const progress = student.units[unitId]?.missions ?? {};
  const next =
    missions.find((m) => missionUnlocked(student, m) && (progress[m.key] ?? 0) < MISSION_PASS) ??
    missions[0];

  useEffect(() => {
    void loadLeaderboard(student).then((rows) =>
      setRank({ place: rankOf(rows, student.id), of: rows.length }),
    );
  }, [student]);

  return (
    <div className="page stack-lg">
      <header className="row" style={{ gap: 14 }}>
        <Torch level={lvl.level} />
        <div className="grow">
          <div className="eyebrow">
            <TorchTierName level={lvl.level} /> · {ar.levelShort} <span className="num">{lvl.level}</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', marginTop: 2 }}>
            {ar.home.welcome} <bdi>{student.name}</bdi>
          </h1>
          <div className="row small muted" style={{ gap: 12, marginTop: 2 }}>
            <span>
              <span className="num">{student.xp.toLocaleString('en-US')}</span> {ar.xp}
            </span>
            <span className="row" style={{ gap: 4 }}>
              <Icon name="flame" size={15} filled />
              {ar.home.streak(student.streak)}
            </span>
          </div>
        </div>
      </header>

      <div className="card">
        <div className="row-between tiny muted" style={{ marginBottom: 6 }}>
          <span>
            {ar.levelShort} <span className="num">{lvl.level}</span>
          </span>
          <span>{ar.home.toNextLevel(lvl.into, lvl.needed, lvl.level + 1)}</span>
        </div>
        <Bar percent={lvl.percent} />
      </div>

      <button
        className="card card-lg card-hot tappable"
        style={{ textAlign: 'start', width: '100%' }}
        onClick={() => navigate(`/play/${unitId}/${next.key}`)}
      >
        <div className="eyebrow">{ar.home.continue}</div>
        <div className="row-between" style={{ marginTop: 10 }}>
          <div>
            <h2 className="row" style={{ gap: 8 }}>
              <Icon name={missionIcon(next.kind, next.key)} size={22} />
              {missionTitle(next)}
            </h2>
            <p className="small" style={{ margin: '4px 0 0', opacity: 0.85 }}>
              {ar.unit} <span className="num">{unit.number}</span> · {unit.title}
            </p>
          </div>
          <span
            className="chip"
            style={{ background: 'var(--paper-2)', color: 'var(--ink)', pointerEvents: 'none' }}
          >
            {ar.home.play}
          </span>
        </div>
        <div style={{ marginTop: 14 }}>
          <Bar percent={unitCompletion(student, unitId) * 100} thin />
          <p className="tiny" style={{ margin: '6px 0 0', opacity: 0.85 }}>
            {ar.home.unitProgress(unit.number, Math.round(unitCompletion(student, unitId) * 100))}
          </p>
        </div>
      </button>

      <section className="card">
        <div className="row-between" style={{ marginBottom: 12 }}>
          <h3>{ar.home.skillsTitle}</h3>
          <Link to="/skills" className="tiny muted" style={{ textDecoration: 'none' }}>
            {ar.home.seeAll} ←
          </Link>
        </div>
        <SkillMeters student={student} />
      </section>

      <div className="grid-2">
        <Link to="/leaderboard" className="card tappable" style={{ textDecoration: 'none' }}>
          <div className="eyebrow">{ar.home.rank}</div>
          <div className="big-num" style={{ marginTop: 8 }}>
            {rank ? `#${rank.place}` : '—'}
          </div>
          <p className="tiny muted" style={{ margin: '6px 0 0' }}>
            {rank ? ar.home.ofPlayers(rank.of) : '…'}
          </p>
        </Link>

        <Link to={`/play/${unitId}/${weak}`} className="card tappable" style={{ textDecoration: 'none' }}>
          <div className="eyebrow">{ar.home.recommended}</div>
          <div className="row" style={{ marginTop: 8, gap: 8, fontWeight: 700 }}>
            <Icon name={missionIcon('skill', weak)} size={20} />
            {ar.home.improve(skillEn(weak))}
          </div>
          <p className="tiny muted" style={{ margin: '6px 0 0' }}>{ar.home.weakest}</p>
        </Link>
      </div>

      {student.mistakes.length > 0 && (
        <Link to="/review" className="card tappable" style={{ textDecoration: 'none' }}>
          <div className="row-between">
            <div>
              <h3 className="row" style={{ gap: 8 }}>
                <Icon name="refresh" size={19} />
                {ar.home.reviewTitle}
              </h3>
              <p className="small muted" style={{ margin: '4px 0 0' }}>
                {ar.home.reviewCount(student.mistakes.length)}
              </p>
            </div>
            <span className="chip chip-hot">{ar.home.reviewStart}</span>
          </div>
        </Link>
      )}

      <p className="tiny dim center" style={{ marginBottom: 0 }}>
        {ar.courseLine} <span className="en-ui">MegaGoal 1 — Student Book</span>
      </p>
    </div>
  );
}
