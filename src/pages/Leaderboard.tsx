import { useEffect, useState } from 'react';
import { useStudentRequired } from '../state/StudentContext';
import type { LeaderboardRow } from '../types';
import { loadLeaderboard, rankOf, weeklyRankOf } from '../services/leaderboardService';
import { Icon } from '../components/Icon';
import { ar } from '../i18n/ar';

const MEDAL_COLOR = ['var(--amber)', 'var(--ink-3)', 'var(--flame)'];

export function Leaderboard() {
  const { student } = useStudentRequired();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [mode, setMode] = useState<'all' | 'week'>('all');

  useEffect(() => {
    void loadLeaderboard(student).then(setRows);
  }, [student]);

  if (!rows) return <div className="page muted">{ar.leaderboard.loading}</div>;

  const sorted = mode === 'all' ? rows : [...rows].sort((a, b) => b.weeklyXp - a.weeklyXp);
  const place = mode === 'all' ? rankOf(rows, student.id) : weeklyRankOf(rows, student.id);
  const me = rows.find((r) => r.isMe);

  return (
    <div className="page stack-lg">
      <div className="page-head">
        <div>
          <div className="eyebrow">{ar.leaderboard.eyebrow}</div>
          <h1>{ar.leaderboard.title}</h1>
        </div>
        <Icon name="trophy" size={30} />
      </div>

      <div className="row" style={{ gap: 8 }}>
        <button
          className={`btn btn-sm${mode === 'all' ? ' btn-ink' : ''}`}
          onClick={() => setMode('all')}
        >
          {ar.leaderboard.allTime}
        </button>
        <button
          className={`btn btn-sm${mode === 'week' ? ' btn-ink' : ''}`}
          onClick={() => setMode('week')}
        >
          {ar.leaderboard.week}
        </button>
      </div>

      <div className="card card-lg card-hot">
        <div className="row-between">
          <div>
            <div className="eyebrow">{ar.leaderboard.you}</div>
            <div className="big-num" style={{ marginTop: 6 }}>#{place}</div>
          </div>
          <div style={{ textAlign: 'end' }}>
            <div style={{ fontWeight: 700 }} className="num">
              {(mode === 'all' ? (me?.xp ?? student.xp) : (me?.weeklyXp ?? 0)).toLocaleString('en-US')}{' '}
              {ar.xp}
            </div>
            <div className="tiny" style={{ opacity: 0.85 }}>
              {mode === 'all' ? ar.leaderboard.allTimeNote : ar.leaderboard.weekNote}
            </div>
          </div>
        </div>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {sorted.map((r, i) => (
          <div key={r.id} className={`lb-row${r.isMe ? ' me' : ''}`}>
            <span className="lb-rank num" style={{ color: i < 3 ? MEDAL_COLOR[i] : undefined }}>
              {i < 3 ? <Icon name="medal" size={19} /> : i + 1}
            </span>
            <span className="lb-av">{r.avatar}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ fontWeight: 600, display: 'block' }}>
                {r.name}
                {r.isMe && <span className="tiny muted"> {ar.leaderboard.me}</span>}
              </span>
              <span className="tiny dim">
                {ar.levelShort} <span className="num">{r.level}</span>
                {r.demo && ` ${ar.leaderboard.demo}`}
              </span>
            </span>
            <span className="num" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              {(mode === 'all' ? r.xp : r.weeklyXp).toLocaleString('en-US')}
            </span>
          </div>
        ))}
      </div>

      <p className="tiny dim">{ar.leaderboard.note}</p>
    </div>
  );
}
