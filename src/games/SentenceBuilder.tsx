import { useEffect, useMemo, useState } from 'react';
import type { OrderQuestion } from '../types';
import type { GameProps } from './types';
import { seededShuffle } from '../utils/random';
import { sfx } from '../utils/sound';
import { ar } from '../i18n/ar';

/** Tap the chunks in order to build the sentence. */
export function SentenceBuilder({ question, locked, onAnswer }: GameProps<OrderQuestion>) {
  const shuffled = useMemo(
    () => seededShuffle(question.chunks.map((text, i) => ({ text, i })), question.id),
    [question],
  );
  const [order, setOrder] = useState<number[]>([]);

  useEffect(() => {
    if (!locked) setOrder([]);
  }, [locked, question.id]);

  const add = (i: number) => {
    if (locked) return;
    sfx.tap();
    setOrder((o) => [...o, i]);
  };
  const remove = (pos: number) => {
    if (locked) return;
    sfx.tap();
    setOrder((o) => o.filter((_, p) => p !== pos));
  };

  const full = order.length === question.chunks.length;
  const check = () => onAnswer(order.every((v, p) => v === p));

  return (
    <div className="stack">
      <div className="tray">
        {order.length === 0 && (
          <span className="dim small" style={{ direction: 'rtl' }}>
            {ar.play.trayHint}
          </span>
        )}
        {order.map((i, pos) => (
          <button key={`${i}-${pos}`} className="chunk in-tray" onClick={() => remove(pos)}>
            {question.chunks[i]}
          </button>
        ))}
      </div>

      <div className="chunk-pool">
        {shuffled.map(({ text, i }) => (
          <button
            key={i}
            className={`chunk${order.includes(i) ? ' used' : ''}`}
            onClick={() => add(i)}
            disabled={locked}
          >
            {text}
          </button>
        ))}
      </div>

      <button className="btn btn-primary btn-block" disabled={!full || locked} onClick={check}>
        {ar.play.checkSentence}
      </button>
    </div>
  );
}
