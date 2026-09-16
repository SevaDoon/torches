import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Goal, Lang, SourceDoc } from '../types';
import { useApp } from '../state/AppContext';
import { extractFile, fromPastedText, kindOf } from '../engine/extract';
import { BuildFailed, STAGE_COUNT, buildCourse, guessLang } from '../engine/build';
import { saveCourse, setSetting } from '../services/db';
import { blankProgress } from '../services/learner';
import { Icon } from '../components/Icon';
import { Banner, Bar, Wordmark } from '../components/ui';

type Step = 0 | 1 | 2 | 3 | 4;

interface FileError {
  name: string;
  reason: 'unreadable' | 'too-little' | 'unsupported';
}

export function CreateCourse() {
  const { t, toast, refreshCourses, update } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [docs, setDocs] = useState<SourceDoc[]>([]);
  const [errors, setErrors] = useState<FileError[]>([]);
  const [reading, setReading] = useState(0);
  const [lang, setLang] = useState<Lang>('en');
  const [langTouched, setLangTouched] = useState(false);
  const [goal, setGoal] = useState<Goal>('understand');
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState('');
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const addFiles = async (list: FileList | File[]) => {
    const files = [...list];
    setReading((n) => n + files.length);
    const added: SourceDoc[] = [];

    for (const file of files) {
      if (!kindOf(file.name)) {
        setErrors((e) => [...e, { name: file.name, reason: 'unsupported' }]);
      } else {
        const result = await extractFile(file);
        if (result.ok) added.push(result.doc);
        else setErrors((e) => [...e, { name: file.name, reason: result.reason }]);
      }
      setReading((n) => n - 1);
    }

    if (added.length === 0) return;
    const next = [...docs, ...added];
    setDocs(next);
    // The language stays a guess until she says otherwise, and is re-guessed
    // until then — the second file may be the telling one.
    if (!langTouched) setLang(guessLang(next));
  };

  const addPasted = () => {
    const text = pasted.trim();
    if (text.length < 200) return;
    const result = fromPastedText(t.create.pastedName(docs.filter((d) => d.kind === 'paste').length + 1), text);
    if (!result.ok) {
      setErrors((e) => [...e, { name: t.create.orPaste, reason: result.reason }]);
      return;
    }
    const next = [...docs, result.doc];
    setDocs(next);
    if (!langTouched) setLang(guessLang(next));
    setPasted('');
    setPasting(false);
  };

  const build = async () => {
    setFailed(false);
    setStage(0);
    try {
      const course = await buildCourse({ name, lang, goal, docs }, setStage);
      await saveCourse(course);
      setSetting('lastCourse', course.id);
      // Register it on the learner straight away, so it shows on the progress
      // screen before the first question is answered — and so "first course"
      // is awarded for building one, which is what the achievement says.
      update((l) => ({ ...l, courses: { ...l.courses, [course.id]: blankProgress() } }));
      await refreshCourses();
      toast('check', t.toasts.courseReady);
      navigate(`/course/${course.id}`, { replace: true });
    } catch (error) {
      setStage(null);
      setFailed(true);
      // A BuildFailed is the expected "this reference is too thin" case and
      // the banner already explains it; anything else is a real fault.
      if (!(error instanceof BuildFailed)) toast('alert', t.errors.generic);
    }
  };

  if (stage !== null) return <ForgeScreen stage={stage} />;

  const canContinue = [
    name.trim().length > 0,
    docs.length > 0,
    true,
    true,
    docs.length > 0 && name.trim().length > 0,
  ][step];

  return (
    <div className="page page-narrow stack-lg">
      <header className="stack" style={{ gap: 12 }}>
        <div className="row-between">
          <button className="btn btn-sm btn-ghost" onClick={() => (step === 0 ? navigate(-1) : setStep((step - 1) as Step))}>
            <Icon name="arrowStart" size={17} />
            {t.common.back}
          </button>
          <Wordmark size="1rem" />
        </div>
        <div className="steps">
          {t.create.steps.map((_, i) => (
            <i key={i} className={i === step ? 'on' : i < step ? 'done' : ''} />
          ))}
        </div>
        <div className="row-between">
          <div className="eyebrow">{t.create.stepOf(step + 1, 5)}</div>
          <span className="tiny muted">{t.create.steps[step]}</span>
        </div>
      </header>

      {failed && (
        <Banner kind="bad">
          <strong>{t.analyze.failedTitle}</strong>
          <p style={{ margin: '4px 0 0' }}>{t.analyze.failedBody}</p>
        </Banner>
      )}

      {step === 0 && (
        <section className="stack">
          <div>
            <label className="label" htmlFor="course-name">{t.create.nameLabel}</label>
            <input
              id="course-name"
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(1)}
              placeholder={t.create.namePlaceholder}
              autoFocus
            />
            <p className="hint-text">{t.create.nameHint}</p>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="stack">
          <div>
            <span className="label">{t.create.uploadLabel}</span>
            <p className="hint-text" style={{ marginTop: 0, marginBottom: 10 }}>{t.create.uploadHint}</p>
          </div>

          <button
            type="button"
            className={`drop${dragging ? ' over' : ''}`}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void addFiles(e.dataTransfer.files);
            }}
          >
            <Icon name="upload" size={28} style={{ color: 'var(--forge)' }} />
            <strong>{t.create.drop}</strong>
            <span className="tiny muted">{t.create.dropKinds}</span>
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.txt,.md,.csv"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = '';
            }}
          />

          {reading > 0 && (
            <div className="row small muted">
              <Icon name="hourglass" size={17} className="spin" />
              {t.create.reading}
            </div>
          )}

          {docs.map((doc) => (
            <div className="file-row" key={doc.id}>
              <span className="file-kind">{doc.kind.toUpperCase().slice(0, 4)}</span>
              <div style={{ minWidth: 0 }}>
                <div className="truncate strong small">{doc.name}</div>
                <div className="tiny muted">
                  {t.create.charsRead(doc.chars)}
                  {doc.pages.length > 0 && ` · ${doc.pages.length} ${t.common.page}`}
                </div>
              </div>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setDocs((list) => list.filter((d) => d.id !== doc.id))}
              >
                {t.create.remove}
              </button>
            </div>
          ))}

          {errors.map((error, i) => (
            <Banner kind="warn" key={`${error.name}-${i}`}>
              <strong>{error.name}</strong>
              <p style={{ margin: '4px 0 0' }}>
                {error.reason === 'too-little' ? t.create.tooLittle : t.create.readFailed}
              </p>
            </Banner>
          ))}

          {pasting ? (
            <div className="stack">
              <textarea
                className="field"
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder={t.create.pastePlaceholder}
                autoFocus
              />
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-primary grow" onClick={addPasted} disabled={pasted.trim().length < 200}>
                  {t.create.pasteAdd}
                </button>
                <button className="btn" onClick={() => setPasting(false)}>{t.common.cancel}</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-block btn-outline" onClick={() => setPasting(true)}>
              <Icon name="pen" size={17} />
              {t.create.orPaste}
            </button>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="stack">
          <div>
            <span className="label">{t.create.langLabel}</span>
            <p className="hint-text" style={{ marginTop: 0, marginBottom: 10 }}>{t.create.langHint}</p>
          </div>
          {(['ar', 'en'] as Lang[]).map((option) => (
            <button
              key={option}
              className={`choice${lang === option ? ' on' : ''}`}
              onClick={() => {
                setLang(option);
                setLangTouched(true);
              }}
            >
              <strong>{option === 'ar' ? t.create.langAr : t.create.langEn}</strong>
              {!langTouched && lang === option && (
                <span className="tiny muted">{t.create.langDetected}</span>
              )}
            </button>
          ))}
        </section>
      )}

      {step === 3 && (
        <section className="stack">
          <div>
            <span className="label">{t.create.goalLabel}</span>
            <p className="hint-text" style={{ marginTop: 0, marginBottom: 10 }}>{t.create.goalHint}</p>
          </div>
          {(Object.keys(t.create.goals) as Goal[]).map((option) => (
            <button
              key={option}
              className={`choice${goal === option ? ' on' : ''}`}
              onClick={() => setGoal(option)}
            >
              <strong>{t.create.goals[option].t}</strong>
              <span className="tiny muted">{t.create.goals[option].d}</span>
            </button>
          ))}
        </section>
      )}

      {step === 4 && (
        <section className="stack">
          <div className="card">
            <div className="eyebrow">{t.create.summaryTitle}</div>
            <h2 style={{ marginTop: 8 }}>{name}</h2>
            <div className="divider" />
            <dl className="stack" style={{ gap: 6, margin: 0 }}>
              <Row label={t.create.summaryFiles} value={`${docs.length}`} />
              <Row
                label={t.create.langLabel}
                value={lang === 'ar' ? t.create.langAr : t.create.langEn}
              />
              <Row label={t.create.goalLabel} value={t.create.goals[goal].t} />
              <Row
                label={t.create.charsRead(docs.reduce((n, d) => n + d.chars, 0))}
                value={docs.map((d) => d.name).join(' · ')}
              />
            </dl>
          </div>
          <button className="btn btn-lg btn-primary btn-block" onClick={() => void build()}>
            <Icon name="forge" size={20} />
            {t.create.generate}
          </button>
        </section>
      )}

      {step < 4 && (
        <button
          className="btn btn-primary btn-block"
          disabled={!canContinue}
          onClick={() => setStep((step + 1) as Step)}
        >
          {t.common.next}
          <Icon name="arrowEnd" size={18} />
        </button>
      )}
      {step === 1 && docs.length === 0 && <p className="tiny dim center" style={{ margin: 0 }}>{t.create.needFiles}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="row-between small">
      <span className="muted truncate">{label}</span>
      <span className="strong truncate" style={{ maxWidth: '60%', textAlign: 'end' }}>{value}</span>
    </div>
  );
}

/** The build screen: real stages, reported by the pipeline as it passes them. */
function ForgeScreen({ stage }: { stage: number }) {
  const { t } = useApp();
  const percent = Math.round(((stage + 1) / STAGE_COUNT) * 100);

  return (
    <div className="page page-narrow" style={{ paddingTop: 40 }}>
      <div className="stack-lg">
        <div className="center stack" style={{ gap: 10, justifyItems: 'center' }}>
          <span className="emblem">
            <Icon name="forge" size={30} className="anvil-spark" />
          </span>
          <h1>{t.analyze.building}</h1>
        </div>

        <Bar percent={percent} large />

        <div className="card card-lg">
          {t.analyze.stages.map((label, i) => (
            <div
              key={label}
              className={`forge-stage${i < stage ? ' done' : i === stage ? ' active' : ''}`}
            >
              <span className="forge-mark">
                {i < stage ? (
                  <Icon name="check" size={15} />
                ) : i === stage ? (
                  <Icon name="hourglass" size={14} className="spin" />
                ) : (
                  <span className="tiny dim num">{i + 1}</span>
                )}
              </span>
              <span className="small">{label}</span>
              {i === stage && <span className="chip chip-blue tiny">…</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
