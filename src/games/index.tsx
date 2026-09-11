/*
 * The game registry. Adding a new game means writing one component with the
 * GameProps contract, adding its question type, and adding one line here.
 */
import type {
  BlankQuestion,
  ErrorQuestion,
  MatchQuestion,
  McqQuestion,
  OrderQuestion,
  PicMatchQuestion,
  PictureQuestion,
  Question,
} from '../types';
import type { GameProps } from './types';
import { seededShuffle } from '../utils/random';
import { MultipleChoice } from './MultipleChoice';
import { SentenceBuilder } from './SentenceBuilder';
import { MatchPairs } from './MatchPairs';
import { MemoryCards } from './MemoryCards';
import { WordType } from './WordType';
import { ErrorHunt } from './ErrorHunt';
import { PicturePick } from './PicturePick';
import { PictureMatch } from './PictureMatch';
import { ar } from '../i18n/ar';

export const GAME_NAMES: Record<Question['type'], string> = ar.games as Record<
  Question['type'],
  string
>;

/** Tokens back into a sentence, without a space in front of the punctuation. */
const sentenceOf = (parts: string[]) => parts.join(' ').replace(/\s+([.,!?;:])/g, '$1');

/**
 * Everything the question says in English, in the order she sees it on screen.
 *
 * Two rules. It reads what is actually displayed — the same seeded shuffles the
 * games use, so the voice and the screen agree. And it never carries the answer
 * in its order: a matching game's two columns are shuffled apart, so hearing
 * them back to back tells her which words exist, never which ones pair up.
 */
export function speakableOf(q: Question): string {
  const said: string[] = [];
  const instruction = ar.play.instructions[q.type];
  if (instruction) said.push(instruction);

  switch (q.type) {
    case 'mcq':
      said.push(q.prompt, ...seededShuffle(q.options, q.id));
      break;
    case 'truefalse':
      said.push(q.prompt, ...q.options); // true/false keeps its natural order
      break;
    case 'blank':
      said.push(q.prompt); // the gap is spoken as the word "blank"
      break;
    case 'error':
      said.push(sentenceOf(q.tokens));
      break;
    case 'order':
      said.push(...seededShuffle(q.chunks, q.id)); // the tray, not the sentence
      break;
    case 'picture':
      said.push(...seededShuffle(q.options, q.id));
      break;
    case 'match':
    case 'memory':
      said.push(
        ...seededShuffle(q.pairs.map((p) => p[0]), `${q.id}-l`),
        ...seededShuffle(q.pairs.map((p) => p[1]), `${q.id}-r`),
      );
      break;
    case 'picmatch':
      said.push(...seededShuffle(q.pairs.map((p) => p[1]), `${q.id}-w`));
      break;
  }

  return said.join('. ');
}

/**
 * The right answer, in words, for the moment she has earned it — after a second
 * mistake. The pairing games are left out on purpose: they only finish once
 * every pair is on the board, so the answer is already in front of her.
 */
export function answerTextOf(q: Question): string {
  switch (q.type) {
    case 'mcq':
    case 'truefalse':
    case 'picture':
      return q.options[q.answer];
    case 'blank':
      return q.accept[0];
    case 'order':
      return sentenceOf(q.chunks);
    case 'error':
      // The whole sentence put right, not the loose word: the correction only
      // teaches anything in the sentence it belongs to.
      return sentenceOf(q.tokens.map((t, i) => (i === q.answer ? q.correction : t)));
    default:
      return '';
  }
}

export function GameSurface(props: GameProps) {
  const { question } = props;
  switch (question.type) {
    case 'mcq':
    case 'truefalse':
      return <MultipleChoice {...props} question={question as McqQuestion} />;
    case 'order':
      return <SentenceBuilder {...props} question={question as OrderQuestion} />;
    case 'match':
      return <MatchPairs {...props} question={question as MatchQuestion} />;
    case 'memory':
      return <MemoryCards {...props} question={question as MatchQuestion} />;
    case 'blank':
      return <WordType {...props} question={question as BlankQuestion} />;
    case 'error':
      return <ErrorHunt {...props} question={question as ErrorQuestion} />;
    case 'picture':
      return <PicturePick {...props} question={question as PictureQuestion} />;
    case 'picmatch':
      return <PictureMatch {...props} question={question as PicMatchQuestion} />;
  }
}
