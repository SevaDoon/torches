import { useEffect, useState } from 'react';
import type { ErrorQuestion } from '../types';
import type { GameProps } from './types';
import { sfx } from '../utils/sound';
import { ar } from '../i18n/ar';

/** One word in the sentence is wrong. Tap it. */
export function ErrorHunt({ question, locked, reveal, onAnswer }: GameProps<ErrorQuestion>) {
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (!locked) setPicked(null);
  }, [locked, question.id]);

  const tap = (i: number) => {
    if (locked || picked !== null) return;
    sfx.tap();
    setPicked(i);
    onAnswer(i === question.answer);
  };

  return (
    <div className="stack">
      <div className="tokens">
        {question.tokens.map((t, i) => {
          const cls =
            reveal && i === question.answer
              ? 'token right'
              : picked === i
                ? 'token wrong'
                : 'token';
          return (
            <button key={i} className={cls} onClick={() => tap(i)} disabled={locked}>
              {t}
            </button>
          );
        })}
      </div>
      {reveal && (
        <p className="small muted" style={{ margin: 0 }}>
          {ar.play.shouldBe}{' '}
          <strong className="en-ui" style={{ color: 'var(--green)' }}>{question.correction}</strong>
        </p>
      )}
    </div>
  );
}
