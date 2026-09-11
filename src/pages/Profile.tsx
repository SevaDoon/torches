import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import { AVATARS, rename } from '../services/studentService';
import { levelProgress } from '../services/progressService';
import { Torch, TorchTierName } from '../components/Torch';
import { Icon } from '../components/Icon';
import { Credits } from '../components/Credits';
import { PHOTO_CREDITS } from '../data/pictureCredits';
import { ar } from '../i18n/ar';

export function Profile() {
  const { student, update, toast, leave, isTeacher, guest } = useStudentRequired();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(student.name);
  const lvl = levelProgress(student.xp);

  const exit = () => {
    void leave().then(() => navigate('/welcome', { replace: true }));
  };

  /*
   * A visitor has no account to show. Every control on this page edits
   * something that is never saved, so showing them would be a small lie.
   */
  if (guest) {
    return (
      <div className="page stack-lg ar-page">
        <div className="page-head">
          <h1>{ar.guest.title}</h1>
          <Icon name="user" size={30} />
        </div>
        <div className="card card-lg">
          <p className="small" style={{ margin: 0 }}>{ar.guest.note}</p>
        </div>
        <button className="btn btn-primary btn-block" onClick={exit}>
          {ar.guest.exit}
        </button>
        <Credits />
      </div>
    );
  }

  const save = () => {
    update((s) => rename(s, draft));
    setEditing(false);
    toast('✅', ar.profile.renamed);
  };

  return (
    <div className="page stack-lg">
      <div className="page-head">
        <div>
          <div className="eyebrow">{ar.profile.eyebrow}</div>
          <h1>{ar.profile.title}</h1>
        </div>
        <Icon name="user" size={30} />
      </div>

      <div className="card card-lg row" style={{ gap: 16 }}>
        <Torch level={lvl.level} />
        <div className="grow" style={{ minWidth: 0 }}>
          {editing ? (
            <div className="stack" style={{ gap: 8 }}>
              <input
                className="field"
                value={draft}
                maxLength={24}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
              />
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-sm btn-primary" onClick={save}>{ar.profile.save}</button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setDraft(student.name);
                    setEditing(false);
                  }}
                >
                  {ar.profile.cancel}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 style={{ overflowWrap: 'anywhere' }}>{student.name}</h2>
              <p className="small muted" style={{ margin: '4px 0 10px' }}>
                <TorchTierName level={lvl.level} /> · {ar.levelShort}{' '}
                <span className="num">{lvl.level}</span> ·{' '}
                <span className="num">{student.xp.toLocaleString('en-US')}</span> {ar.xp}
              </p>
              <button className="btn btn-sm" onClick={() => setEditing(true)}>
                <Icon name="edit" size={15} />
                {ar.profile.editName}
              </button>
            </>
          )}
        </div>
      </div>

      <section className="card">
        <div className="eyebrow">{ar.profile.playerId}</div>
        <div className="row-between" style={{ marginTop: 8 }}>
          <code className="en-ui" style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            {student.code}
          </code>
          <button
            className="btn btn-sm"
            onClick={() => {
              void navigator.clipboard?.writeText(student.code);
              toast('📋', ar.profile.copied);
            }}
          >
            <Icon name="copy" size={15} />
            {ar.profile.copy}
          </button>
        </div>
        <p className="tiny dim" style={{ margin: '10px 0 0' }}>{ar.profile.idNote}</p>
      </section>

      <section className="card">
        <h3 style={{ marginBottom: 12 }}>{ar.profile.icon}</h3>
        <div className="row wrap" style={{ gap: 8 }}>
          {AVATARS.map((a) => (
            <button
              key={a}
              className="lb-av tappable"
              style={{
                borderWidth: student.avatar === a ? 2 : 1.5,
                background: student.avatar === a ? 'var(--amber)' : undefined,
              }}
              onClick={() => update((s) => ({ ...s, avatar: a }))}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      {isTeacher && (
        <button
          className="card card-hot tappable row-between"
          style={{ width: '100%', textAlign: 'start' }}
          onClick={() => navigate('/teacher')}
        >
          <div>
            <div className="eyebrow">{ar.teacher.eyebrow}</div>
            <h3 style={{ marginTop: 4 }}>{ar.teacher.title}</h3>
          </div>
          <Icon name="crown" size={26} />
        </button>
      )}

      <section className="card row-between">
        <div>
          <h3>{ar.profile.sound}</h3>
          <p className="tiny dim" style={{ margin: '4px 0 0' }}>{ar.profile.soundNote}</p>
        </div>
        <button
          className={`btn btn-sm${student.soundOn ? ' btn-ink' : ''}`}
          onClick={() => update((s) => ({ ...s, soundOn: !s.soundOn }))}
        >
          <Icon name={student.soundOn ? 'sound' : 'mute'} size={16} />
          {student.soundOn ? ar.profile.on : ar.profile.off}
        </button>
      </section>

      {/* The photographs in the picture games are other people's work, and
          most of their licences ask for the author's name. */}
      <details className="card">
        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{ar.profile.photoCredits}</summary>
        <p className="tiny dim" style={{ margin: '8px 0 10px' }}>{ar.profile.photoCreditsNote}</p>
        <div className="stack" style={{ gap: 6 }}>
          {PHOTO_CREDITS.map((c) => (
            <a
              key={c.id}
              className="tiny en-ui"
              href={c.page}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--ink-2)' }}
            >
              {c.file} — {c.author} ({c.licence})
            </a>
          ))}
        </div>
      </details>

      <button className="btn btn-block" onClick={exit}>
        {ar.profile.switch}
      </button>
      <p className="tiny dim center" style={{ marginTop: -10 }}>{ar.profile.switchNote}</p>

      <Credits />
    </div>
  );
}
