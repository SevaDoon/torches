import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import { deleteStudent, loadClass, type ClassRow } from '../services/teacherService';
import { levelFromXp } from '../services/progressService';
import { Icon } from '../components/Icon';
import { ar } from '../i18n/ar';

export function Teacher() {
  const { student, toast, isTeacher } = useStudentRequired();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ClassRow[] | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    void loadClass().then(setRows);
  }, []);

  useEffect(() => {
    if (isTeacher) refresh();
  }, [isTeacher, refresh]);

  if (!isTeacher) {
    return (
      <div className="page stack center" style={{ paddingTop: 60 }}>
        <h2>{ar.teacher.denied}</h2>
        <p className="muted">{ar.teacher.deniedNote}</p>
        <button className="btn btn-primary" onClick={() => navigate('/home')}>
          {ar.teacher.backHome}
        </button>
      </div>
    );
  }

  const remove = async (row: ClassRow) => {
    setBusy(true);
    try {
      await deleteStudent(row.id);
      toast('🗑️', ar.teacher.deleted(row.name));
      setConfirming(null);
      refresh();
    } catch {
      toast('⚠️', ar.teacher.deleteFailed);
    }
    setBusy(false);
  };

  const active = rows?.filter((r) => r.totalAnswers > 0).length ?? 0;

  return (
    <div className="page stack-lg">
      <div className="page-head">
        <div>
          <div className="eyebrow">{ar.teacher.eyebrow}</div>
          <h1>{ar.teacher.title}</h1>
        </div>
        <Icon name="crown" size={30} />
      </div>

      <div className="grid-2">
        <div className="stat">
          <div className="eyebrow">{ar.teacher.students}</div>
          <div className="big-num num" style={{ marginTop: 6 }}>{rows?.length ?? '—'}</div>
        </div>
        <div className="stat">
          <div className="eyebrow">{ar.teacher.active}</div>
          <div className="big-num num" style={{ marginTop: 6 }}>{active}</div>
          <p className="tiny muted" style={{ margin: '4px 0 0' }}>{ar.teacher.activeNote}</p>
        </div>
      </div>

      <button className="btn btn-sm" onClick={refresh}>
        <Icon name="refresh" size={15} />
        {ar.teacher.refresh}
      </button>

      {!rows && <p className="muted">{ar.teacher.loading}</p>}

      {rows && rows.length === 0 && <p className="muted">{ar.teacher.empty}</p>}

      <div className="stack" style={{ gap: 8 }}>
        {rows?.map((r) => (
          <div key={r.id} className="card stack" style={{ gap: 10 }}>
            <div className="row-between">
              <div className="row" style={{ gap: 10, minWidth: 0 }}>
                <span className="lb-av">{r.avatar}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>
                    {r.name}
                    {r.id === student.id && <span className="tiny muted"> {ar.leaderboard.me}</span>}
                  </div>
                  <div className="tiny dim en-ui">{r.code}</div>
                </div>
              </div>
              <div style={{ textAlign: 'end' }}>
                <div className="num" style={{ fontWeight: 700 }}>{r.xp.toLocaleString('en-US')}</div>
                <div className="tiny dim">
                  {ar.levelShort} <span className="num">{levelFromXp(r.xp)}</span>
                </div>
              </div>
            </div>

            <div className="row wrap" style={{ gap: 6 }}>
              <span className="chip chip-quiet">
                {ar.teacher.answers} <span className="num">{r.totalAnswers}</span>
              </span>
              <span className="chip chip-quiet">
                {ar.teacher.accuracy}{' '}
                <span className="num">
                  {r.totalAnswers ? Math.round((r.totalCorrect / r.totalAnswers) * 100) : 0}٪
                </span>
              </span>
              <span className="chip chip-quiet">
                {ar.teacher.week} <span className="num">{r.weeklyXp}</span>
              </span>
              <span className="chip chip-quiet">
                {ar.teacher.lastSeen} <span className="num en-ui">{r.lastPlayedDay || '—'}</span>
              </span>
            </div>

            {confirming === r.id ? (
              <div className="card card-quiet stack" style={{ gap: 8 }}>
                <p className="small" style={{ margin: 0, fontWeight: 600 }}>
                  {ar.teacher.confirm(r.name)}
                </p>
                <p className="tiny dim" style={{ margin: 0 }}>{ar.teacher.confirmNote}</p>
                <div className="row" style={{ gap: 8 }}>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--red)', color: 'var(--paper-2)' }}
                    disabled={busy}
                    onClick={() => void remove(r)}
                  >
                    {ar.teacher.confirmYes}
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setConfirming(null)}>
                    {ar.profile.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-sm btn-ghost"
                style={{ color: 'var(--red)', justifyContent: 'flex-start' }}
                onClick={() => setConfirming(r.id)}
              >
                <Icon name="x" size={15} />
                {ar.teacher.deleteAction}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
