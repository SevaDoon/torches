import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentRequired } from '../state/StudentContext';
import { AVATARS, rename } from '../services/studentService';
import { levelProgress } from '../services/progressService';
import { Torch, TorchTierName } from '../components/Torch';
import { Icon } from '../components/Icon';
import { ar } from '../i18n/ar';

export function Profile() {
  const { student, update, toast, leave, isTeacher } = useStudentRequired();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(student.name);
  const lvl = levelProgress(student.xp);

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

      <button
        className="btn btn-block"
        onClick={() => {
          void leave().then(() => navigate('/welcome', { replace: true }));
        }}
      >
        {ar.profile.switch}
      </button>
      <p className="tiny dim center" style={{ marginTop: -10 }}>{ar.profile.switchNote}</p>
    </div>
  );
}
