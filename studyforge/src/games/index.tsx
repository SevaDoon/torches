/*
 * The question surfaces. One component per shape of question; each one knows
 * how to draw itself and reports nothing but right or wrong. Scoring, hints,
 * mastery and what comes next are the session's business, not theirs.
 */
import { useEffect, useMemo, useState } from 'react';
import type { Question, QuestionType } from '../types';
import { detectLang, normalizeTerm, seededShuffle } from '../engine/text';
import { Icon } from '../components/Icon';
import { useApp } from '../state/AppContext';

export interface GameProps {
  question: Question;
  locked: boolean;
  /** The round is over for this question: show what was right. */
  reveal: boolean;
  /** MCQ only: an option struck out by the last hint. */
  eliminated: number | null;
  onAnswer: (correct: boolean, given?: string) => void;
}

const KEYS = ['A', 'B', 'C', 'D', 'E'];

/** Content keeps the direction of the reference, not of the interface. */
const dirOf = (text: string) => (detectLang(text) === 'ar' ? 'rtl' : 'ltr');

export function GameSurface(props: GameProps) {
  switch (props.question.type) {
    case 'mcq':
    case 'truefalse':
      return <Choices {...props} />;
    case 'blank':
      return <Blank {...props} />;
    case 'match':
      return <Matching {...props} />;
    case 'order':
      return <Ordering {...props} />;
    case 'error':
      return <FindError {...props} />;
  }
}

/* ---------- multiple choice & true/false ---------- */

function Choices({ question, locked, reveal, eliminated, onAnswer }: GameProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const choices = question.type === 'mcq' || question.type === 'truefalse' ? question : null;

  const choose = (i: number) => {
    if (locked || !choices) return;
    setPicked(i);
    onAnswer(i === choices.answer, choices.options[i]);
  };

  // A keyboard is faster than a mouse for four options, and this is a quiz.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!locked && choices && n >= 1 && n <= choices.options.length) choose(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!choices) return null;
  const { options, answer, type } = choices;

  return (
    <div className="stack">
      {options.map((option, i) => {
        const state =
          reveal && i === answer ? ' right' : reveal && picked === i ? ' wrong' : picked === i ? ' picked' : '';
        const out = eliminated === i && !reveal ? ' out' : '';
        return (
          <button
            key={i}
            className={`option${state}${out}`}
            disabled={locked || out !== ''}
            onClick={() => choose(i)}
            dir={dirOf(option)}
          >
            <span className="key">{type === 'truefalse' ? (i === 0 ? '✓' : '✕') : KEYS[i]}</span>
            <span className="grow">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- fill in the blank ---------- */

function Blank({ question, locked, reveal, onAnswer }: GameProps) {
  const { t } = useApp();
  const [value, setValue] = useState('');
  if (question.type !== 'blank') return null;

  const accepted = question.accept.map(normalizeTerm).filter(Boolean);
  const submit = () => {
    if (locked || !value.trim()) return;
    onAnswer(accepted.includes(normalizeTerm(value)), value.trim());
  };

  return (
    <div className="stack">
      <input
        className="field"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={t.play.typeAnswer}
        disabled={locked}
        dir={dirOf(question.prompt)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label={t.play.typeAnswer}
      />
      <div className="row" style={{ gap: 8 }}>
        <button className="btn btn-primary grow" onClick={submit} disabled={locked || !value.trim()}>
          <Icon name="check" size={18} />
          {t.play.check}
        </button>
        <button className="btn" onClick={() => !locked && onAnswer(false, '')} disabled={locked}>
          {t.play.skip}
        </button>
      </div>
      {reveal && <p className="tiny muted" style={{ margin: 0 }}>{question.accept[0]}</p>}
    </div>
  );
}

/* ---------- matching ---------- */

function Matching({ question, locked, onAnswer }: GameProps) {
  const [picked, setPicked] = useState<{ side: 'l' | 'r'; index: number } | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [missed, setMissed] = useState(false);
  const [shake, setShake] = useState<number | null>(null);

  const left = useMemo(
    () => (question.type === 'match' ? question.pairs.map(([term], i) => ({ text: term, pair: i })) : []),
    [question],
  );
  const right = useMemo(
    () =>
      question.type === 'match'
        ? seededShuffle(question.pairs.map(([, def], i) => ({ text: def, pair: i })), question.id)
        : [],
    [question],
  );
  if (question.type !== 'match') return null;

  const tap = (side: 'l' | 'r', index: number, pair: number) => {
    if (locked || done.includes(pair)) return;
    if (!picked) return setPicked({ side, index });
    if (picked.side === side) return setPicked({ side, index });

    const otherPair = picked.side === 'l' ? left[picked.index].pair : right[picked.index].pair;
    if (otherPair === pair) {
      const next = [...done, pair];
      setDone(next);
      setPicked(null);
      if (next.length === question.pairs.length) {
        // A set solved with no wrong pairing counts as known; one miss and it
        // does not, because the board reveals itself as it is solved.
        onAnswer(!missed);
      }
    } else {
      setMissed(true);
      setShake(pair);
      setPicked(null);
      setTimeout(() => setShake(null), 320);
    }
  };

  const cell = (side: 'l' | 'r', index: number, item: { text: string; pair: number }) => {
    const isDone = done.includes(item.pair);
    const isPicked = picked?.side === side && picked.index === index;
    return (
      <button
        key={`${side}${index}`}
        className={`match-cell${isDone ? ' done' : ''}${isPicked ? ' sel' : ''}${shake === item.pair ? ' miss' : ''}`}
        onClick={() => tap(side, index, item.pair)}
        disabled={locked || isDone}
        dir={dirOf(item.text)}
      >
        {item.text}
      </button>
    );
  };

  return (
    <div className="match-grid">
      <div className="stack" style={{ gap: 8 }}>{left.map((item, i) => cell('l', i, item))}</div>
      <div className="stack" style={{ gap: 8 }}>{right.map((item, i) => cell('r', i, item))}</div>
    </div>
  );
}

/* ---------- order the steps ---------- */

function Ordering({ question, locked, reveal, onAnswer }: GameProps) {
  const { t } = useApp();
  const [tray, setTray] = useState<number[]>([]);
  const shuffled = useMemo(
    () => (question.type === 'order' ? seededShuffle(question.steps.map((s, i) => ({ s, i })), question.id) : []),
    [question],
  );
  if (question.type !== 'order') return null;

  const full = tray.length === question.steps.length;
  const check = () => {
    if (locked) return;
    onAnswer(tray.every((original, position) => original === position), tray.map((i) => question.steps[i]).join(' → '));
  };

  return (
    <div className="stack">
      <div className="tray">
        {tray.length === 0 && <p className="tiny dim" style={{ margin: 0 }}>{t.play.instructions.order}</p>}
        {tray.map((original, position) => (
          <button
            key={original}
            className="tray-item"
            onClick={() => !locked && setTray(tray.filter((x) => x !== original))}
            disabled={locked}
            dir={dirOf(question.steps[original])}
          >
            <span className="tray-num">{position + 1}</span>
            <span>{question.steps[original]}</span>
          </button>
        ))}
      </div>

      <div className="stack" style={{ gap: 7 }}>
        {shuffled.map(({ s, i }) => (
          <button
            key={i}
            className={`chunk${tray.includes(i) ? ' used' : ''}`}
            onClick={() => !locked && !tray.includes(i) && setTray([...tray, i])}
            disabled={locked}
            dir={dirOf(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <button className="btn btn-primary btn-block" onClick={check} disabled={locked || !full}>
        <Icon name="check" size={18} />
        {t.play.check}
      </button>

      {reveal && (
        <ol className="tiny muted" style={{ margin: 0, paddingInlineStart: 20 }}>
          {question.steps.map((s, i) => (
            <li key={i} dir={dirOf(s)}>{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* ---------- find the word that does not belong ---------- */

function FindError({ question, locked, reveal, onAnswer }: GameProps) {
  const [picked, setPicked] = useState<number | null>(null);
  if (question.type !== 'error') return null;

  return (
    <div className="tokens" dir={dirOf(question.prompt + question.tokens.join(' '))}>
      {question.tokens.map((token, i) => {
        const state =
          reveal && i === question.answer ? ' right' : reveal && picked === i ? ' wrong' : '';
        return (
          <button
            key={i}
            className={`token${state}`}
            disabled={locked}
            onClick={() => {
              if (locked) return;
              setPicked(i);
              onAnswer(i === question.answer, token);
            }}
          >
            {token}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- labels ---------- */

export function typeName(type: QuestionType, t: ReturnType<typeof useApp>['t']): string {
  return t.settings.typeNames[type];
}
