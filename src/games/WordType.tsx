import { useEffect, useState } from 'react';
import type { BlankQuestion } from '../types';
import type { GameProps } from './types';
import { Words } from '../components/Speak';
import { ar } from '../i18n/ar';

/** Normalizes an answer so spelling variants and stray punctuation still pass. */
function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"]/g, '')
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ');
}

export function WordType({ question, locked, onAnswer }: GameProps<BlankQuestion>) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!locked) setValue('');
  }, [locked, question.id]);

  const submit = () => {
    if (!value.trim() || locked) return;
    onAnswer(question.accept.some((a) => normalize(a) === normalize(value)));
  };

  const [before, after] = question.prompt.split('___');

  return (
    <div className="stack">
      <div className="card card-quiet en" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
        <Words text={before} />
        <strong style={{ color: 'var(--flame)' }}>{value ? ` ${value} ` : ' ______ '}</strong>
        <Words text={after ?? ''} />
      </div>
      <input
        className="field en"
        value={value}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        disabled={locked}
        placeholder={ar.play.typeHere}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button className="btn btn-primary btn-block" disabled={!value.trim() || locked} onClick={submit}>
        {ar.play.checkAnswer}
      </button>
    </div>
  );
}
