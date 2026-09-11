import { useEffect, useMemo, useState } from 'react';
import type { PicMatchQuestion } from '../types';
import type { GameProps } from './types';
import { Picture } from '../data/pictures';
import { seededShuffle } from '../utils/random';
import { sfx } from '../utils/sound';
import { ar } from '../i18n/ar';

/** Tap a photograph, then the English word that names it. */
export function PictureMatch({ question, locked, onAnswer }: GameProps<PicMatchQuestion>) {
  const pics = useMemo(
    () => seededShuffle(question.pairs.map((p, i) => ({ pic: p[0], i })), `${question.id}-p`),
    [question],
  );
  const words = useMemo(
    () => seededShuffle(question.pairs.map((p, i) => ({ word: p[1], i })), `${question.id}-w`),
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

  const allowed = 2; // a couple of slips are fine; the pair still has to be found

  const tapWord = (i: number) => {
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
      <div className="picmatch-grid">
        {pics.map(({ pic, i }) => (
          <button
            key={i}
            className={`pic-cell${picked === i ? ' sel' : ''}${done.includes(i) ? ' done' : ''}`}
            onClick={() => {
              if (locked || done.includes(i)) return;
              sfx.tap();
              setPicked(i);
            }}
          >
            <Picture id={pic} size={64} />
          </button>
        ))}
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {words.map(({ word, i }) => (
          <button
            key={i}
            className={`match-cell${done.includes(i) ? ' done' : ''}${missIndex === i ? ' miss' : ''}`}
            onClick={() => tapWord(i)}
          >
            {word}
          </button>
        ))}
      </div>

      <p className="tiny dim center" style={{ margin: 0 }}>
        {ar.play.matched(done.length, question.pairs.length)}
        {misses > 0 && ` ${ar.play.mismatches(misses)}`}
      </p>
    </div>
  );
}
