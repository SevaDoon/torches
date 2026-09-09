import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import {
  addTeacher,
  deleteStudent,
  listTeacherIds,
  loadClass,
  removeTeacher,
  renameStudent,
  resetStudent,
  summarize,
  toCsv,
  type ClassRow,
} from '../services/teacherService';
import { levelFromXp } from '../services/progressService';
import { SKILL_ORDER } from '../data/curriculum';
import { skillAr, skillColor } from '../i18n/labels';
import { Bar } from '../components/Bar';
import { Icon } from '../components/Icon';
import { ar } from '../i18n/ar';

type Sort = 'xp' | 'name' | 'recent' | 'accuracy';
type Pending = { id: string; action: 'delete' | 'reset' } | null;

export function Teacher() {
  const { student, toast, isTeacher } = useStudentRequired();
  const navigate = useNavigate();

  const [rows, setRows] = useState<ClassRow[] | null>(null);
  const [error, setError] = useState('');
  const [teacherIds, setTeacherIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Pending>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('xp');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setError('');
    void loadClass()
      .then((r) => {
        setRows(r);
        void listTeacherIds().then(setTeacherIds);
      })
      .catch((e) => {
        // Never leave the screen spinning: say what went wrong and offer a retry.
        setRows([]);
        setError(String((e as Error).message ?? e));
      });
  }, []);

  useEffect(() => {
    if (isTeacher) refresh();
  }, [isTeacher, refresh]);

  const stats = useMemo(() => (rows ? summarize(rows) : null), [rows]);

  const visible = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
      : rows;
    const acc = (r: ClassRow) => (r.totalAnswers ? r.totalCorrect / r.totalAnswers : -1);
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sort === 'recent') return (b.lastPlayedDay || '').localeCompare(a.lastPlayedDay || '');
      if (sort === 'accuracy') return acc(b) - acc(a);
      return b.xp - a.xp;
    });
  }, [rows, query, sort]);

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

  const act = async (row: ClassRow, action: 'delete' | 'reset') => {
    setBusy(true);
    try {
      if (action === 'delete') {
        await deleteStudent(row.id);
        toast('🗑️', ar.teacher.deleted(row.name));
      } else {
        await resetStudent(row);
        toast('♻️', ar.teacher.wasReset(row.name));
      }
      setPending(null);
      refresh();
    } catch {
      toast('⚠️', ar.teacher.actionFailed);
    }
    setBusy(false);
  };

  const saveName = async (row: ClassRow) => {
    if (!draft.trim()) return;
    setBusy(true);
    try {
      await renameStudent(row, draft);
      toast('✅', ar.teacher.renamed);
      setRenaming(null);
      refresh();
    } catch {
      toast('⚠️', ar.teacher.actionFailed);
    }
    setBusy(false);
  };

  const toggleTeacher = async (row: ClassRow) => {
    setBusy(true);
    try {
      if (teacherIds.has(row.id)) {
        await removeTeacher(row.id);
        toast('👤', ar.teacher.demoted(row.name));
      } else {
        await addTeacher(row.id, row.name);
        toast('👑', ar.teacher.promoted(row.name));
      }
      refresh();
    } catch {
      toast('⚠️', ar.teacher.actionFailed);
    }
    setBusy(false);
  };

  const exportCsv = () => {
    if (!rows?.length) return;
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `torches-class-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📄', ar.teacher.exported);
  };

  return (
    <div className="page stack-lg">
      <div className="page-head">
        <div>
          <div className="eyebrow">{ar.teacher.eyebrow}</div>
          <h1>{ar.teacher.title}</h1>
        </div>
        <Icon name="crown" size={30} />
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--red)' }}>
          <p className="small" style={{ margin: 0, fontWeight: 600, color: 'var(--red)' }}>
            {ar.teacher.loadFailed}
          </p>
          <p className="tiny dim en-ui" style={{ margin: '4px 0 10px' }}>{error}</p>
          <button className="btn btn-sm" onClick={refresh}>
            <Icon name="refresh" size={15} />
            {ar.teacher.retry}
          </button>
        </div>
      )}

      {stats && (
        <>
          <div className="grid-2">
            <div className="stat">
              <div className="eyebrow">{ar.teacher.students}</div>
              <div className="big-num num" style={{ marginTop: 6 }}>{stats.students}</div>
              <p className="tiny muted" style={{ margin: '4px 0 0' }}>
                {ar.teacher.activeOf(stats.active)}
              </p>
            </div>
            <div className="stat">
              <div className="eyebrow">{ar.teacher.classAccuracy}</div>
              <div className="big-num" style={{ marginTop: 6 }}>
                {Math.round(stats.accuracy * 100)}٪
              </div>
              <p className="tiny muted num" style={{ margin: '4px 0 0' }}>
                {stats.totalAnswers.toLocaleString('en-US')} {ar.teacher.answers}
              </p>
            </div>
          </div>

          <section className="card">
            <div className="row-between" style={{ marginBottom: 12 }}>
              <h3>{ar.teacher.skillsTitle}</h3>
              {stats.weakest && (
                <span className="chip chip-hot">
                  {ar.teacher.weakest} {skillAr(stats.weakest)}
                </span>
              )}
            </div>
            <div className="stack">
              {SKILL_ORDER.map((s) => {
                const d = stats.skillAccuracy[s];
                const pct = d.attempts ? Math.round((d.correct / d.attempts) * 100) : 0;
                return (
                  <div key={s}>
                    <div className="row-between" style={{ marginBottom: 5 }}>
                      <span className="small row" style={{ gap: 7 }}>
                        <span className="skill-dot" style={{ background: skillColor(s) }} />
                        {skillAr(s)}
                      </span>
                      <span className="small muted num">
                        {d.attempts ? `${pct}٪` : '—'}
                      </span>
                    </div>
                    <Bar percent={pct} thin />
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <div className="row wrap" style={{ gap: 8 }}>
        <button className="btn btn-sm" onClick={refresh}>
          <Icon name="refresh" size={15} />
          {ar.teacher.refresh}
        </button>
        <button className="btn btn-sm" onClick={exportCsv} disabled={!rows?.length}>
          <Icon name="chart" size={15} />
          {ar.teacher.exportCsv}
        </button>
      </div>

      <input
        className="field"
        value={query}
        placeholder={ar.teacher.search}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="row wrap" style={{ gap: 6 }}>
        {(['xp', 'accuracy', 'recent', 'name'] as Sort[]).map((s) => (
          <button
            key={s}
            className={`btn btn-sm${sort === s ? ' btn-ink' : ''}`}
            onClick={() => setSort(s)}
          >
            {ar.teacher.sort[s]}
          </button>
        ))}
      </div>

      {!rows && !error && <p className="muted">{ar.teacher.loading}</p>}
      {rows && rows.length === 0 && !error && <p className="muted">{ar.teacher.empty}</p>}
      {rows && rows.length > 0 && visible.length === 0 && (
        <p className="muted">{ar.teacher.noMatch}</p>
      )}

      <div className="stack" style={{ gap: 8 }}>
        {visible.map((r) => {
          const isMe = r.id === student.id;
          const acc = r.totalAnswers ? Math.round((r.totalCorrect / r.totalAnswers) * 100) : 0;
          return (
            <div key={r.id} className="card stack" style={{ gap: 10 }}>
              <div className="row-between">
                <div className="row" style={{ gap: 10, minWidth: 0 }}>
                  <span className="lb-av">{r.avatar}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>
                      {r.name}
                      {isMe && <span className="tiny muted"> {ar.leaderboard.me}</span>}
                      {teacherIds.has(r.id) && (
                        <span className="chip chip-good tiny" style={{ marginInlineStart: 6 }}>
                          {ar.teacher.badge}
                        </span>
                      )}
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
                  {ar.teacher.accuracy} <span className="num">{acc}٪</span>
                </span>
                <span className="chip chip-quiet">
                  {ar.teacher.week} <span className="num">{r.weeklyXp}</span>
                </span>
                <span className="chip chip-quiet">
                  {ar.teacher.lastSeen} <span className="num en-ui">{r.lastPlayedDay || '—'}</span>
                </span>
              </div>

              {expanded === r.id && (
                <div className="card card-quiet stack">
                  {SKILL_ORDER.map((s) => {
                    const st = r.skills[s];
                    const p = st?.attempts ? Math.round((st.correct / st.attempts) * 100) : 0;
                    return (
                      <div key={s}>
                        <div className="row-between" style={{ marginBottom: 5 }}>
                          <span className="tiny row" style={{ gap: 6 }}>
                            <span className="skill-dot" style={{ background: skillColor(s) }} />
                            {skillAr(s)}
                          </span>
                          <span className="tiny muted num">
                            {st?.attempts ? `${p}٪ · ${st.attempts}` : '—'}
                          </span>
                        </div>
                        <Bar percent={p} thin />
                      </div>
                    );
                  })}
                  <p className="tiny dim" style={{ margin: 0 }}>
                    {ar.teacher.streakLine(r.streak)}
                  </p>
                </div>
              )}

              {renaming === r.id ? (
                <div className="row wrap" style={{ gap: 8 }}>
                  <input
                    className="field grow"
                    value={draft}
                    maxLength={24}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void saveName(r)}
                  />
                  <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => void saveName(r)}>
                    {ar.profile.save}
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setRenaming(null)}>
                    {ar.profile.cancel}
                  </button>
                </div>
              ) : pending?.id === r.id ? (
                <div className="card card-quiet stack" style={{ gap: 8 }}>
                  <p className="small" style={{ margin: 0, fontWeight: 600 }}>
                    {pending.action === 'delete'
                      ? ar.teacher.confirm(r.name)
                      : ar.teacher.confirmReset(r.name)}
                  </p>
                  <p className="tiny dim" style={{ margin: 0 }}>
                    {pending.action === 'delete' ? ar.teacher.confirmNote : ar.teacher.resetNote}
                  </p>
                  <div className="row" style={{ gap: 8 }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--red)', color: 'var(--paper-2)' }}
                      disabled={busy}
                      onClick={() => void act(r, pending.action)}
                    >
                      {pending.action === 'delete' ? ar.teacher.confirmYes : ar.teacher.confirmResetYes}
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => setPending(null)}>
                      {ar.profile.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="row wrap" style={{ gap: 6 }}>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    <Icon name="chart" size={15} />
                    {expanded === r.id ? ar.teacher.hideDetail : ar.teacher.showDetail}
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      setDraft(r.name);
                      setRenaming(r.id);
                    }}
                  >
                    <Icon name="edit" size={15} />
                    {ar.teacher.rename}
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    disabled={busy}
                    onClick={() => void toggleTeacher(r)}
                  >
                    <Icon name="crown" size={15} />
                    {teacherIds.has(r.id) ? ar.teacher.demote : ar.teacher.promote}
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setPending({ id: r.id, action: 'reset' })}
                  >
                    <Icon name="refresh" size={15} />
                    {ar.teacher.reset}
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--red)' }}
                    onClick={() => setPending({ id: r.id, action: 'delete' })}
                  >
                    <Icon name="x" size={15} />
                    {ar.teacher.deleteAction}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
