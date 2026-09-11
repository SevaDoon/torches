import { useEffect, useMemo, useState } from 'react';
import type { PictureQuestion } from '../types';
import type { GameProps } from './types';
import { Picture } from '../data/pictures';
import { seededShuffle } from '../utils/random';
import { sfx } from '../utils/sound';

const KEYS = ['A', 'B', 'C', 'D'];

/** See the photograph, pick the English word for it. */
export function PicturePick({
  question,
  hintLevel,
  locked,
  reveal,
  onAnswer,
}: GameProps<PictureQuestion>) {
  const [picked, setPicked] = useState<string | null>(null);

  const options = useMemo(() => seededShuffle(question.options, question.id), [question]);
  const correct = question.options[question.answer];

  /** The "eliminate" hint dims wrong words, never down to just the answer. */
  const eliminated = useMemo(() => {
    const wrong = options.filter((o) => o !== correct);
    if (wrong.length < 2) return new Set<string>();
    return new Set(seededShuffle(wrong, `${question.id}-elim`).slice(0, wrong.length - 1));
  }, [options, correct, question.id]);

  useEffect(() => {
    if (!locked) setPicked(null);
  }, [locked, question.id]);

  const choose = (option: string) => {
    if (locked || picked) return;
    sfx.tap();
    setPicked(option);
    onAnswer(option === correct);
  };

  return (
    <div className="stack">
      <div className="picture-stage">
        <Picture id={question.pictureId} size={130} />
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {options.map((o, i) => {
          const isPicked = picked === o;
          const dim = hintLevel >= 4 && eliminated.has(o) && !isPicked;
          const cls = [
            'option',
            isPicked && locked ? (o === correct ? 'right' : 'wrong') : '',
            isPicked && !locked ? 'picked' : '',
            reveal && !isPicked && o === correct ? 'right' : '',
            dim ? 'out' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button key={o} className={cls} onClick={() => choose(o)} disabled={locked || dim}>
              <span className="key">{KEYS[i]}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
