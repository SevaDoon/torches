/*
 * The citation. This is the component the whole product rests on: it is how a
 * student checks that a question came from her own material rather than from
 * somewhere we made up, and it has to be one tap away everywhere.
 *
 * Opening it shows the surrounding paragraph with the cited sentence marked,
 * not just the sentence — the context is what makes it verifiable.
 */
import { useState } from 'react';
import type { Citation, Course } from '../types';
import { contextOf } from '../engine/retrieval';
import { detectLang } from '../engine/text';
import { Icon } from './Icon';
import { useApp } from '../state/AppContext';

export function citationLabel(citation: Citation, pageWord: string, slideWord: string): string {
  const parts = [citation.section || citation.docName];
  if (citation.page) {
    // A slide deck numbers slides, not pages, and saying "page 12" of a deck
    // sends the student looking in the wrong place.
    const isDeck = /\.pptx$/i.test(citation.docName);
    parts.push(`${isDeck ? slideWord : pageWord} ${citation.page}`);
  }
  if (citation.section && citation.docName && parts.length === 1) parts.push(citation.docName);
  return parts.join(' · ');
}

export function Cite({ citation, course }: { citation: Citation; course: Course }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const label = citationLabel(citation, t.common.page, t.common.slide);

  return (
    <div>
      <button
        type="button"
        className={`cite${open ? ' cite-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Icon name="quote" size={13} />
        <span className="truncate">{label}</span>
        <Icon name={open ? 'x' : 'eye'} size={13} />
      </button>
      {open && <SourceBox citation={citation} course={course} />}
    </div>
  );
}

export function SourceBox({ citation, course }: { citation: Citation; course: Course }) {
  const context = contextOf(course, citation);
  const dir = detectLang(citation.text) === 'ar' ? 'rtl' : 'ltr';

  if (!context) {
    return (
      <div className="source-box" dir={dir}>
        {citation.text}
      </div>
    );
  }

  const from = citation.start - context.from;
  const to = citation.end - context.from;
  const before = context.text.slice(0, Math.max(0, from));
  const marked = context.text.slice(Math.max(0, from), Math.max(0, to));
  const after = context.text.slice(Math.max(0, to));

  return (
    <div className="source-box" dir={dir}>
      {before}
      <mark>{marked || citation.text}</mark>
      {after}
    </div>
  );
}

/** The reference's own sentence, shown as the explanation after an answer. */
export function Quoted({ text }: { text: string }) {
  return (
    <p className="src" dir={detectLang(text) === 'ar' ? 'rtl' : 'ltr'} style={{ margin: 0 }}>
      {text}
    </p>
  );
}
