import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Citation, Course } from '../types';
import { useApp } from '../state/AppContext';
import { useCourse } from '../state/useCourse';
import { ask, hasModel, type Answer } from '../services/ai';
import { Icon } from '../components/Icon';
import { Cite, Quoted } from '../components/Source';
import { Empty, PageSkeleton } from '../components/ui';

interface Turn {
  question: string;
  answer: Answer | null;
}

export function Tutor() {
  const { courseId } = useParams();
  const { t, learner } = useApp();
  const { course, status } = useCourse(courseId);
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);

  if (status === 'loading') return <PageSkeleton />;
  if (!course) {
    return (
      <div className="page">
        <Empty icon="alert" title={t.errors.noCourse}>
          <Link className="btn btn-primary" to="/courses">{t.nav.courses}</Link>
        </Empty>
      </div>
    );
  }

  const suggestions = course.concepts
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4)
    .map((concept) =>
      course.lang === 'ar' ? `اشرح لي ${concept.term}` : `Explain ${concept.term}`,
    );

  const send = async (text: string) => {
    const query = text.trim();
    if (!query || thinking) return;
    setQuestion('');
    setTurns((list) => [...list, { question: query, answer: null }]);
    setThinking(true);
    const answer = await ask(course, query, learner.uiLang);
    setTurns((list) => list.map((turn, i) => (i === list.length - 1 ? { ...turn, answer } : turn)));
    setThinking(false);
  };

  const quizOn = (citation: Citation) => {
    const chapter = chapterOf(course, citation);
    navigate(`/course/${course.id}/play/chapter${chapter ? `?chapter=${chapter.id}` : ''}`);
  };

  return (
    <div className="page page-narrow stack-lg">
      <header className="stack" style={{ gap: 6 }}>
        <Link
          to={`/course/${course.id}`}
          className="chip chip-quiet"
          style={{ textDecoration: 'none', alignSelf: 'start' }}
        >
          <Icon name="arrowStart" size={13} />
          {course.name}
        </Link>
        <h1>{t.tutor.title}</h1>
        <p className="small muted" style={{ margin: 0 }}>{t.tutor.subtitle}</p>
        <span className="chip chip-quiet" style={{ alignSelf: 'start' }}>
          <Icon name={hasModel() ? 'sparkles' : 'quote'} size={13} />
          {hasModel() ? t.tutor.modelOn : t.tutor.modelOff}
        </span>
      </header>

      {turns.length === 0 && (
        <div className="card">
          <div className="eyebrow">{t.tutor.suggestionsTitle}</div>
          <div className="stack" style={{ gap: 7, marginTop: 10 }}>
            {suggestions.map((suggestion) => (
              <button key={suggestion} className="chunk" onClick={() => void send(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
          {!hasModel() && (
            <p className="tiny dim" style={{ margin: '12px 0 0' }}>
              {t.tutor.modelHint} <Link to="/settings">{t.settings.title}</Link>
            </p>
          )}
        </div>
      )}

      <div className="chat">
        {turns.map((turn, i) => (
          <div key={i} className="chat">
            <div className="bubble bubble-me">{turn.question}</div>

            {!turn.answer && thinking && i === turns.length - 1 && (
              <div className="bubble bubble-ai bubble-none small muted">
                <Icon name="hourglass" size={15} className="spin" /> {t.tutor.thinking}
              </div>
            )}

            {turn.answer && !turn.answer.found && (
              <div className="bubble bubble-ai bubble-none">
                <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="shield" size={18} />
                  <p className="small" style={{ margin: 0 }}>{t.tutor.notFound}</p>
                </div>
              </div>
            )}

            {turn.answer?.found && (
              <div className="bubble bubble-ai">
                <Quoted text={turn.answer.text} />
                <div className="divider" />
                <div className="eyebrow">{t.tutor.basedOn}</div>
                <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                  {turn.answer.passages.map((passage, j) => (
                    <Cite key={j} citation={passage.citation} course={course} />
                  ))}
                </div>
                <button
                  className="btn btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={() => quizOn(turn.answer!.passages[0].citation)}
                >
                  <Icon name="swords" size={15} />
                  {t.tutor.quiz}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ask-bar">
        <textarea
          className="field grow"
          style={{ minHeight: 56 }}
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(question);
            }
          }}
          placeholder={t.tutor.placeholder}
          aria-label={t.tutor.placeholder}
        />
        <button className="btn btn-primary" onClick={() => void send(question)} disabled={!question.trim() || thinking}>
          <Icon name="arrowEnd" size={18} />
          {t.tutor.ask}
        </button>
      </div>

      {turns.length > 0 && (
        <button className="btn btn-sm btn-ghost" onClick={() => setTurns([])}>
          <Icon name="refresh" size={15} />
          {t.tutor.clear}
        </button>
      )}
    </div>
  );
}

function chapterOf(course: Course, citation: Citation) {
  return course.chapters.find(
    (c) => c.docId === citation.docId && citation.start >= c.start && citation.start < c.end,
  );
}
