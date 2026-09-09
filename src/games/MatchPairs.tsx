import { useEffect, useMemo, useState } from 'react';
import type { MatchQuestion } from '../types';
import type { GameProps } from './types';
import { seededShuffle } from '../utils/random';
import { sfx } from '../utils/sound';
import { ar } from '../i18n/ar';

/** Two columns; tap one on the left, then its partner on the right. */
export function MatchPairs({ question, locked, onAnswer }: GameProps<MatchQuestion>) {
  const left = useMemo(
    () => seededShuffle(question.pairs.map((p, i) => ({ text: p[0], i })), `${question.id}-l`),
    [question],
  );
  const right = useMemo(
    () => seededShuffle(question.pairs.map((p, i) => ({ text: p[1], i })), `${question.id}-r`),
    [question],
  );

  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [missIndex, setMissIndex] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);

  useEffect(() => {
    if (!locked) {
      setPicked(null);
      setDone([]);
      setMisses(0);
      setMissIndex(null);
    }
  }, [locked, question.id]);

  const allowed = 2; // a couple of mistakes are fine — the pair still has to be found

  const tapRight = (i: number) => {
    if (locked || picked === null || done.includes(i)) return;
    if (picked === i) {
      sfx.correct();
      const next = [...done, i];
      setDone(next);
      setPicked(null);
      if (next.length === question.pairs.length) onAnswer(misses <= allowed);
    } else {
      sfx.wrong();
      setMisses((m) => m + 1);
      setMissIndex(i);
      setTimeout(() => setMissIndex(null), 340);
      setPicked(null);
    }
  };

  return (
    <div className="stack">
      <div className="match-grid">
        <div className="stack" style={{ gap: 8 }}>
          {left.map(({ text, i }) => (
            <button
              key={i}
              className={`match-cell${picked === i ? ' sel' : ''}${done.includes(i) ? ' done' : ''}`}
              onClick={() => {
                if (locked || done.includes(i)) return;
                sfx.tap();
                setPicked(i);
              }}
            >
              {text}
            </button>
          ))}
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {right.map(({ text, i }) => (
            <button
              key={i}
              className={`match-cell${done.includes(i) ? ' done' : ''}${missIndex === i ? ' miss' : ''}`}
              onClick={() => tapRight(i)}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      <p className="tiny dim center" style={{ margin: 0 }}>
        {ar.play.matched(done.length, question.pairs.length)}
        {misses > 0 && ` ${ar.play.mismatches(misses)}`}
      </p>
    </div>
  );
}
