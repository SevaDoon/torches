import type { Question } from '../types';

/** Every game is a small component with exactly this contract. */
export interface GameProps<Q extends Question = Question> {
  question: Q;
  /** 0 = no hint. Games only care about level 4 ("eliminate"). */
  hintLevel: number;
  /** True while feedback is on screen — freeze the board. */
  locked: boolean;
  onAnswer: (correct: boolean) => void;
}
