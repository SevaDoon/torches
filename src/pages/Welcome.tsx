import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../state/StudentContext';
import { COURSE, units } from '../data/curriculum';
import { totalQuestionCount } from '../services/progressService';
import { listPlayers } from '../services/studentService';
import type { RosterEntry } from '../services/storage';
import { ar } from '../i18n/ar';
import { Icon } from '../components/Icon';

export function Welcome() {
  const { begin, resume } = useStudent();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [players, setPlayers] = useState<RosterEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    void listPlayers().then(setPlayers);
  }, []);

  const start = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    await begin(name);
    navigate('/home', { replace: true });
  };

  return (
    <div className="welcome">
      <div className="welcome-inner stack-lg">
        <div className="center">
          <div className="wordmark">{ar.appNameEn}</div>
          <div className="brand-sub">{ar.tagline}</div>
        </div>

        <p className="muted center" style={{ margin: 0 }}>
          {ar.welcome.intro}
        </p>

        <div className="stack">
          <input
            className="field"
            value={name}
            maxLength={24}
            placeholder={ar.welcome.placeholder}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void start()}
            autoFocus
          />
          <button
            className="btn btn-primary btn-block"
            disabled={!name.trim() || busy}
            onClick={() => void start()}
          >
            <Icon name="flame" size={18} filled />
            {ar.welcome.start}
          </button>
        </div>

        {players.length > 0 && (
          <div className="stack" style={{ gap: 8 }}>
            <div className="eyebrow">{ar.welcome.continueAs}</div>
            {players.map((p) => (
              <button
                key={p.id}
                className="lb-row tappable"
                style={{ gridTemplateColumns: '38px 1fr auto' }}
                onClick={() => {
                  void resume(p.id).then((ok) => ok && navigate('/home', { replace: true }));
                }}
              >
                <span className="lb-av">{p.avatar}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 600, display: 'block' }}>{p.name}</span>
                  <span className="tiny dim en-ui">{p.id}</span>
                </span>
                <span className="tiny muted num">{p.xp.toLocaleString('en-US')}</span>
              </button>
            ))}
          </div>
        )}

        <div className="row wrap center" style={{ justifyContent: 'center', gap: 8 }}>
          <span className="chip">{ar.welcome.unitsChip(units.length)}</span>
          <span className="chip">{ar.welcome.questionsChip(totalQuestionCount())}</span>
          <span className="chip">{ar.welcome.gamesChip(7)}</span>
        </div>

        <p className="tiny dim center" style={{ margin: 0 }}>
          {ar.courseLine} <span className="en-ui">{COURSE.title}</span> — {ar.welcome.privacy}
        </p>
      </div>
    </div>
  );
}
