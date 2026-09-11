import type { Question } from '../types';

/** Every game is a small component with exactly this contract. */
export interface GameProps<Q extends Question = Question> {
  question: Q;
  /** 0 = no hint. Games only care about level 4 ("eliminate"). */
  hintLevel: number;
  /** True while feedback is on screen — freeze the board. */
  locked: boolean;
  /**
   * True only once the question is over for good.
   *
   * A wrong answer used to light up the right one immediately, which made
   * guessing the fastest way through: tap anything, read the green row, tap it
   * on the retry. The board now stays silent until she has used her second try.
   */
  reveal: boolean;
  onAnswer: (correct: boolean) => void;
}
