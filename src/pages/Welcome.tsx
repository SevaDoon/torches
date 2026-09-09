import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../state/StudentContext';
import { COURSE, units } from '../data/curriculum';
import { totalQuestionCount } from '../services/progressService';
import { ar } from '../i18n/ar';
import { Icon } from '../components/Icon';

/** Firebase's error codes, said in a way a student can act on. */
function messageFor(code: string, mode: 'login' | 'register'): string {
  if (code === 'EMAIL_EXISTS') return ar.auth.nameTaken;
  if (code === 'INVALID_LOGIN_CREDENTIALS' || code === 'INVALID_PASSWORD') return ar.auth.wrongPin;
  if (code === 'EMAIL_NOT_FOUND') return ar.auth.noAccount;
  if (code === 'WEAK_PASSWORD') return ar.auth.pinTooShort;
  if (code.startsWith('TOO_MANY_ATTEMPTS')) return ar.auth.tooMany;
  return mode === 'login' ? ar.auth.loginFailed : ar.auth.registerFailed;
}

export function Welcome() {
  const { register, login } = useStudent();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const ready = name.trim().length > 0 && /^\d{4,8}$/.test(pin) && !busy;

  const submit = async () => {
    if (!ready) return;
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') await register(name, pin);
      else await login(name, pin);
      navigate('/home', { replace: true });
    } catch (e) {
      setError(messageFor((e as Error).message, mode));
      setBusy(false);
    }
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

        <div className="row" style={{ gap: 8 }}>
          <button
            className={`btn btn-sm grow${mode === 'login' ? ' btn-ink' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            {ar.auth.loginTab}
          </button>
          <button
            className={`btn btn-sm grow${mode === 'register' ? ' btn-ink' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            {ar.auth.registerTab}
          </button>
        </div>

        <div className="stack">
          <label className="stack" style={{ gap: 6 }}>
            <span className="tiny muted">{ar.auth.nameLabel}</span>
            <input
              className="field"
              value={name}
              maxLength={24}
              placeholder={ar.auth.namePlaceholder}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
              autoFocus
            />
          </label>

          <label className="stack" style={{ gap: 6 }}>
            <span className="tiny muted">{ar.auth.pinLabel}</span>
            <input
              className="field num"
              value={pin}
              inputMode="numeric"
              type="password"
              maxLength={8}
              placeholder="••••"
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
            />
          </label>

          {error && (
            <p className="small" style={{ margin: 0, color: 'var(--red)', fontWeight: 600 }}>
              {error}
            </p>
          )}

          <button className="btn btn-primary btn-block" disabled={!ready} onClick={() => void submit()}>
            <Icon name="flame" size={18} filled />
            {busy ? ar.auth.working : mode === 'register' ? ar.auth.registerAction : ar.auth.loginAction}
          </button>

          <p className="tiny dim center" style={{ margin: 0 }}>
            {mode === 'register' ? ar.auth.registerHint : ar.auth.loginHint}
          </p>
        </div>

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
