import { useEffect, useMemo, useState } from 'react';
import type { MatchQuestion } from '../types';
import type { GameProps } from './types';
import { seededShuffle } from '../utils/random';
import { sfx } from '../utils/sound';
import { ar } from '../i18n/ar';
import { Icon } from '../components/Icon';

interface Card {
  key: string;
  pair: number;
  text: string;
}

/** Classic memory: flip two cards, keep them if they belong together. */
export function MemoryCards({ question, locked, onAnswer }: GameProps<MatchQuestion>) {
  const cards = useMemo<Card[]>(
    () =>
      seededShuffle(
        question.pairs.flatMap((p, i) => [
          { key: `${i}a`, pair: i, text: p[0] },
          { key: `${i}b`, pair: i, text: p[1] },
        ]),
        question.id,
      ),
    [question],
  );

  const [open, setOpen] = useState<string[]>([]);
  const [done, setDone] = useState<number[]>([]);
  const [flips, setFlips] = useState(0);

  useEffect(() => {
    if (!locked) {
      setOpen([]);
      setDone([]);
      setFlips(0);
    }
  }, [locked, question.id]);

  const allowedFlips = question.pairs.length * 2 + 2;

  const flip = (card: Card) => {
    if (locked || open.length >= 2 || open.includes(card.key) || done.includes(card.pair)) return;
    sfx.tap();
    const next = [...open, card.key];
    setOpen(next);
    if (next.length < 2) return;

    setFlips((f) => f + 1);
    const [a, b] = next.map((k) => cards.find((c) => c.key === k)!);
    if (a.pair === b.pair) {
      sfx.correct();
      const nextDone = [...done, a.pair];
      setDone(nextDone);
      setOpen([]);
      if (nextDone.length === question.pairs.length) onAnswer(flips + 1 <= allowedFlips);
    } else {
      sfx.wrong();
      setTimeout(() => setOpen([]), 750);
    }
  };

  return (
    <div className="stack">
      <div className="mem-grid">
        {cards.map((c) => {
          const shown = open.includes(c.key) || done.includes(c.pair);
          return (
            <button
              key={c.key}
              className={`mem-card${shown ? '' : ' face-down'}${done.includes(c.pair) ? ' done' : ''}`}
              onClick={() => flip(c)}
            >
              {shown ? c.text : <Icon name="flame" size={22} filled />}
            </button>
          );
        })}
      </div>
      <p className="tiny dim center" style={{ margin: 0 }}>
        {ar.play.pairs(done.length, question.pairs.length, flips)}
      </p>
    </div>
  );
}
