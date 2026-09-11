/*
 * English you can hear. Tap any word to learn how it sounds, or the speaker to
 * hear the whole line. Nothing ever plays by itself — the student asks for it,
 * and a device with no English voice simply shows plain text.
 */
import { Icon } from './Icon';
import { speak, useCanSpeak } from '../utils/speech';

/** Some voices read punctuation out loud, so it never reaches them. */
const word = (chunk: string) => chunk.replace(/[^\p{L}\p{N}'’-]/gu, '');

/** The words of `text`, each one tappable. Keeps the spacing it was given. */
export function Words({ text }: { text: string }) {
  const canSpeak = useCanSpeak();
  if (!canSpeak) return <>{text}</>;

  return (
    <>
      {text.split(/(\s+)/).map((chunk, i) =>
        word(chunk) ? (
          <button key={i} type="button" className="w" onClick={() => speak(word(chunk), true)}>
            {chunk}
          </button>
        ) : (
          chunk
        ),
      )}
    </>
  );
}

/** Tappable words plus one speaker for the whole sentence. */
export function Speak({ text }: { text: string }) {
  const canSpeak = useCanSpeak();
  return (
    <span>
      <Words text={text} />
      {canSpeak && (
        <button
          type="button"
          className="speak-btn"
          onClick={() => speak(text)}
          aria-label="Listen"
          title="Listen"
        >
          <Icon name="sound" size={15} />
        </button>
      )}
    </span>
  );
}
