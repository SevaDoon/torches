import { useEffect, useState } from 'react';
import { useStudentRequired } from '../state/StudentContext';
import type { LeaderboardRow } from '../types';
import { loadLeaderboard, rankOf, weeklyRankOf } from '../services/leaderboardService';
import { Icon } from '../components/Icon';
import { loadNotice, saveNotice, type BoardNotice } from '../services/noticeService';
import { ar } from '../i18n/ar';

const MEDAL_COLOR = ['var(--amber)', 'var(--ink-3)', 'var(--flame)'];

export function Leaderboard() {
  const { student, guest, isTeacher, toast } = useStudentRequired();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [mode, setMode] = useState<'all' | 'week'>('all');

  const [notice, setNotice] = useState<BoardNotice | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadLeaderboard(student).then(setRows);
  }, [student]);

  useEffect(() => {
    void loadNotice().then(setNotice);
  }, []);

  /*
   * The teacher is above the board, not on it. Her card is one shared document,
   * so the moment she saves, every student sees her and whatever she wrote.
   */
  const publish = async () => {
    setSaving(true);
    const next = { name: student.name, avatar: student.avatar, text: (draft ?? '').trim() };
    try {
      await saveNotice(next);
      setNotice({ ...next, updatedAt: Date.now() });
      setDraft(null);
      toast('📣', ar.leaderboard.noticeSaved);
    } catch {
      toast('⚠️', ar.leaderboard.noticeFailed);
    } finally {
      setSaving(false);
    }
  };

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

      {/* The teacher's card sits above the ranking, outside the race. */}
      {(isTeacher || (notice && (notice.text || notice.name))) && (
        <div className="card card-lg stack" style={{ gap: 10 }}>
          <div className="row" style={{ gap: 11 }}>
            <span className="lb-av">{isTeacher ? student.avatar : (notice?.avatar ?? '👩‍🏫')}</span>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow ar">{ar.leaderboard.teacherCard}</div>
              <div style={{ fontWeight: 700 }}>
                <bdi>{isTeacher ? student.name : notice?.name}</bdi>
              </div>
            </div>
          </div>

          {isTeacher ? (
            <div className="stack" style={{ gap: 8 }}>
              <label className="tiny dim ar" htmlFor="board-notice">
                {ar.leaderboard.noticeLabel}
              </label>
              <textarea
                id="board-notice"
                className="field ar"
                rows={3}
                maxLength={280}
                placeholder={ar.leaderboard.noticePlaceholder}
                value={draft ?? notice?.text ?? ''}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button
                className="btn btn-ink btn-sm"
                onClick={() => void publish()}
                disabled={saving}
              >
                {ar.leaderboard.noticeSave}
              </button>
            </div>
          ) : (
            notice?.text && (
              <p className="ar" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{notice.text}</p>
            )
          )}
        </div>
      )}

      {guest || isTeacher ? (
        <div className="card card-lg">
          <p className="small ar" style={{ margin: 0 }}>
            {isTeacher ? ar.leaderboard.teacherNote : ar.leaderboard.guestNote}
          </p>
        </div>
      ) : (
        <div className="card card-lg card-hot">
          <div className="row-between">
            <div>
              <div className="eyebrow">{ar.leaderboard.you}</div>
              <div className="big-num" style={{ marginTop: 6 }}>#{place}</div>
            </div>
            <div style={{ textAlign: 'end' }}>
              <div style={{ fontWeight: 700 }} className="num">
                {(mode === 'all' ? (me?.xp ?? student.xp) : (me?.weeklyXp ?? 0)).toLocaleString(
                  'en-US',
                )}{' '}
                {ar.xp}
              </div>
              <div className="tiny" style={{ opacity: 0.85 }}>
                {mode === 'all' ? ar.leaderboard.allTimeNote : ar.leaderboard.weekNote}
              </div>
            </div>
          </div>
        </div>
      )}

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
