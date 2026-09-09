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
