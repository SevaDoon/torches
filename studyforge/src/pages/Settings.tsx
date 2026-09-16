import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Difficulty, Lang, QuestionType } from '../types';
import { useApp } from '../state/AppContext';
import { clearAll, setSetting } from '../services/db';
import { hasModel, modelKey, setModelKey } from '../services/ai';
import { blankLearner } from '../services/learner';
import { Icon } from '../components/Icon';
import { Banner } from '../components/ui';

const TYPES: QuestionType[] = ['mcq', 'truefalse', 'blank', 'match', 'order', 'error'];
const TIMERS = [0, 20, 30, 45, 60];

export function Settings() {
  const { t, lang, setLang, learner, update, toast, refreshCourses } = useApp();
  const navigate = useNavigate();
  const [key, setKey] = useState(modelKey() ?? '');
  const [confirmingReset, setConfirmingReset] = useState(false);

  const prefs = learner.prefs;
  const setPrefs = (patch: Partial<typeof prefs>) =>
    update((l) => ({ ...l, prefs: { ...l.prefs, ...patch } }));

  const toggleType = (type: QuestionType) => {
    const next = prefs.types.includes(type)
      ? prefs.types.filter((x) => x !== type)
      : [...prefs.types, type];
    if (next.length === 0) return;
    setPrefs({ types: next });
  };

  const resetEverything = async () => {
    await clearAll();
    setSetting('lastCourse', null);
    setModelKey(null);
    update(() => ({ ...blankLearner(learner.name), uiLang: lang }));
    await refreshCourses();
    setConfirmingReset(false);
    toast('check', t.toasts.deleted);
    navigate('/');
  };

  return (
    <div className="page page-narrow stack-lg">
      <header className="page-head">
        <h1>{t.settings.title}</h1>
        <button className="btn btn-sm btn-ghost" onClick={() => navigate(-1)}>
          <Icon name="arrowStart" size={17} />
          {t.common.back}
        </button>
      </header>

      <section className="card stack">
        <div>
          <label className="label" htmlFor="learner-name">{t.settings.name}</label>
          <input
            id="learner-name"
            className="field"
            value={learner.name}
            onChange={(e) => update((l) => ({ ...l, name: e.target.value }))}
          />
        </div>

        <div>
          <span className="label">{t.settings.language}</span>
          <div className="row" style={{ gap: 8 }}>
            {(['ar', 'en'] as Lang[]).map((option) => (
              <button
                key={option}
                className={`btn grow${lang === option ? ' btn-primary' : ''}`}
                onClick={() => setLang(option)}
              >
                {option === 'ar' ? 'العربية' : 'English'}
              </button>
            ))}
          </div>
          <p className="hint-text">{t.settings.languageHint}</p>
        </div>

        <div className="row-between">
          <span className="label" style={{ margin: 0 }}>{t.settings.sound}</span>
          <button
            className={`btn btn-sm${learner.soundOn ? ' btn-primary' : ''}`}
            onClick={() => update((l) => ({ ...l, soundOn: !l.soundOn }))}
            aria-pressed={learner.soundOn}
          >
            <Icon name={learner.soundOn ? 'sound' : 'mute'} size={16} />
            {learner.soundOn ? t.common.yes : t.common.no}
          </button>
        </div>

        <div>
          <label className="label" htmlFor="daily-goal">{t.settings.dailyGoal}</label>
          <input
            id="daily-goal"
            className="field"
            type="number"
            min={5}
            max={200}
            value={learner.dailyGoal}
            onChange={(e) =>
              update((l) => ({ ...l, dailyGoal: Math.max(5, Math.min(200, Number(e.target.value) || 20)) }))
            }
          />
        </div>
      </section>

      <section className="card stack">
        <h2>{t.settings.play}</h2>

        <div>
          <label className="label" htmlFor="round-length">{t.settings.length}</label>
          <input
            id="round-length"
            className="field"
            type="number"
            min={5}
            max={30}
            value={prefs.length}
            onChange={(e) => setPrefs({ length: Math.max(5, Math.min(30, Number(e.target.value) || 8)) })}
          />
        </div>

        <div>
          <span className="label">{t.settings.difficulty}</span>
          <div className="row wrap" style={{ gap: 8 }}>
            <button
              className={`chip${prefs.fixedDifficulty === null ? ' chip-blue' : ''}`}
              onClick={() => setPrefs({ fixedDifficulty: null })}
            >
              {t.settings.adaptive}
            </button>
            {([1, 2, 3] as Difficulty[]).map((level) => (
              <button
                key={level}
                className={`chip${prefs.fixedDifficulty === level ? ' chip-blue' : ''}`}
                onClick={() => setPrefs({ fixedDifficulty: level })}
              >
                {t.settings.fixed(level)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">{t.settings.timer}</span>
          <div className="row wrap" style={{ gap: 8 }}>
            {TIMERS.map((seconds) => (
              <button
                key={seconds}
                className={`chip${prefs.perQuestionSeconds === seconds ? ' chip-blue' : ''}`}
                onClick={() => setPrefs({ perQuestionSeconds: seconds })}
              >
                {seconds === 0 ? t.settings.noTimer : t.settings.perQuestion(seconds)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">{t.settings.types}</span>
          <div className="row wrap" style={{ gap: 8 }}>
            {TYPES.map((type) => (
              <button
                key={type}
                className={`chip${prefs.types.includes(type) ? ' chip-blue' : ''}`}
                onClick={() => toggleType(type)}
                aria-pressed={prefs.types.includes(type)}
              >
                {prefs.types.includes(type) && <Icon name="check" size={12} />}
                {t.settings.typeNames[type]}
              </button>
            ))}
          </div>
          <p className="hint-text">{t.settings.typesAtLeastOne}</p>
        </div>
      </section>

      <section className="card stack">
        <h2>{t.settings.model}</h2>
        <p className="small muted" style={{ margin: 0 }}>{t.settings.modelHint}</p>
        <div>
          <label className="label" htmlFor="model-key">{t.settings.modelKey}</label>
          <input
            id="model-key"
            className="field"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={t.settings.modelPlaceholder}
            autoComplete="off"
          />
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button
            className="btn btn-primary grow"
            onClick={() => {
              setModelKey(key);
              toast('check', t.toasts.saved);
            }}
            disabled={!key.trim()}
          >
            {t.common.save}
          </button>
          <button
            className="btn"
            onClick={() => {
              setModelKey(null);
              setKey('');
              toast('check', t.toasts.saved);
            }}
            disabled={!hasModel()}
          >
            {t.settings.modelClear}
          </button>
        </div>
        <p className="tiny dim" style={{ margin: 0 }}>
          {hasModel() ? t.settings.modelSaved : t.settings.modelNone}
        </p>
      </section>

      <section className="card stack">
        <h2>{t.settings.dataTitle}</h2>
        <Banner kind="info" icon="lock">{t.settings.dataHint}</Banner>
        {confirmingReset ? (
          <div className="stack">
            <Banner kind="bad">{t.settings.resetConfirm}</Banner>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-danger grow" onClick={() => void resetEverything()}>
                <Icon name="trash" size={18} />
                {t.settings.reset}
              </button>
              <button className="btn grow" onClick={() => setConfirmingReset(false)}>
                {t.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-outline" onClick={() => setConfirmingReset(true)}>
            <Icon name="trash" size={17} />
            {t.settings.reset}
          </button>
        )}
      </section>
    </div>
  );
}
