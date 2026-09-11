import { useEffect, useMemo, useState } from 'react';
import type { McqQuestion } from '../types';
import type { GameProps } from './types';
import { seededShuffle } from '../utils/random';
import { sfx } from '../utils/sound';

const KEYS = ['A', 'B', 'C', 'D', 'E'];

export function MultipleChoice({
  question,
  hintLevel,
  locked,
  reveal,
  onAnswer,
}: GameProps<McqQuestion>) {
  const [picked, setPicked] = useState<string | null>(null);

  // True/False keeps its natural order; multiple choice is shuffled per question.
  const options = useMemo(
    () =>
      question.type === 'truefalse'
        ? question.options
        : seededShuffle(question.options, question.id),
    [question],
  );
  const correct = question.options[question.answer];

  /**
   * The wrong options the "eliminate" hint removes — stable per question, and
   * never enough to leave only the answer standing.
   */
  const eliminated = useMemo(() => {
    const wrong = options.filter((o) => o !== correct);
    if (wrong.length < 2) return new Set<string>(); // true/false has nothing safe to remove
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
  );
}
