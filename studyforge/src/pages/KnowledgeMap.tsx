import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { MasteryState } from '../types';
import { useApp } from '../state/AppContext';
import { useCourse } from '../state/useCourse';
import { progressOf } from '../services/learner';
import { DAY, chapterMastery, conceptState, stateOf } from '../services/progress';
import { Icon } from '../components/Icon';
import { Cite, Quoted } from '../components/Source';
import { Empty, Meter, PageSkeleton } from '../components/ui';

const STATES: MasteryState[] = ['mastered', 'learning', 'weak', 'new'];

export function KnowledgeMap() {
  const { courseId } = useParams();
  const { t, learner } = useApp();
  const { course, status } = useCourse(courseId);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<MasteryState | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

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

  const progress = progressOf(learner, course.id);
  const counts = STATES.map((state) => ({
    state,
    n: course.concepts.filter((c) => stateOf(progress.conceptStates[c.id]) === state).length,
  }));

  const reviewLabel = (next: number) => {
    if (!next) return null;
    const days = Math.ceil((next - Date.now()) / DAY);
    if (days <= 0) return t.map.due;
    if (days === 1) return t.map.tomorrow;
    return t.map.inDays(days);
  };

  return (
    <div className="page stack-lg">
      <header className="stack" style={{ gap: 6 }}>
        <Link to={`/course/${course.id}`} className="chip chip-quiet" style={{ textDecoration: 'none', alignSelf: 'start' }}>
          <Icon name="arrowStart" size={13} />
          {course.name}
        </Link>
        <h1>{t.map.title}</h1>
        <p className="small muted" style={{ margin: 0 }}>{t.map.subtitle}</p>
      </header>

      <div className="card">
        <div className="eyebrow">{t.map.legend}</div>
        <div className="row wrap" style={{ gap: 8, marginTop: 10 }}>
          <button
            className={`chip${filter === 'all' ? ' chip-blue' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t.map.filterAll} <span className="num">{course.concepts.length}</span>
          </button>
          {counts.map(({ state, n }) => (
            <button
              key={state}
              className={`chip${filter === state ? ' chip-blue' : ''}`}
              onClick={() => setFilter(filter === state ? 'all' : state)}
            >
              <span className={`dot dot-${state}`} />
              {t.map.states[state]} <span className="num">{n}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stack" style={{ gap: 6 }}>
        <div className="map-node root">
          <Icon name="layers" size={17} />
          <span className="truncate">{course.name}</span>
          <span className="tiny num">{t.map.conceptOf(course.concepts.length)}</span>
        </div>

        {course.chapters.map((chapter) => {
          const concepts = course.concepts
            .filter((c) => c.chapterId === chapter.id)
            .filter((c) => filter === 'all' || stateOf(progress.conceptStates[c.id]) === filter);
          if (concepts.length === 0) return null;
          const isOpen = !collapsed.has(chapter.id);

          return (
            <div key={chapter.id}>
              <button
                className="map-node"
                onClick={() =>
                  setCollapsed((set) => {
                    const next = new Set(set);
                    next.has(chapter.id) ? next.delete(chapter.id) : next.add(chapter.id);
                    return next;
                  })
                }
              >
                <Icon name="chevron" size={15} style={{ transform: isOpen ? 'rotate(90deg)' : undefined }} />
                <span className="truncate strong small">{chapter.title}</span>
                <span style={{ width: 84 }}>
                  <Meter percent={chapterMastery(course.concepts, chapter.id, progress) * 100} blocks={8} />
                </span>
              </button>

              {isOpen && (
                <div className="map-kids">
                  {concepts.map((concept) => {
                    const state = stateOf(progress.conceptStates[concept.id]);
                    const info = conceptState(progress, concept.id);
                    const expanded = open === concept.id;
                    return (
                      <div key={concept.id}>
                        <button
                          className="map-node"
                          onClick={() => setOpen(expanded ? null : concept.id)}
                          aria-expanded={expanded}
                        >
                          <span className={`dot dot-${state}`} />
                          <span className="truncate small">{concept.term}</span>
                          <span className="tiny muted num">{Math.round(info.mastery * 100)}%</span>
                        </button>

                        {expanded && (
                          <div className="card card-quiet" style={{ margin: '6px 0 10px' }}>
                            <Quoted text={concept.definition} />
                            <div className="row wrap" style={{ gap: 8, marginTop: 10 }}>
                              <span className="chip chip-quiet">{t.map.states[state]}</span>
                              <span className="chip chip-quiet">{t.map.attempts(info.attempts)}</span>
                              {info.nextReview > 0 && (
                                <span className="chip chip-quiet">
                                  {t.map.nextReview}: {reviewLabel(info.nextReview)}
                                </span>
                              )}
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <Cite citation={concept.citation} course={course} />
                            </div>
                            <button
                              className="btn btn-sm btn-primary"
                              style={{ marginTop: 12 }}
                              onClick={() => navigate(`/course/${course.id}/play/chapter?chapter=${chapter.id}`)}
                            >
                              <Icon name="swords" size={15} />
                              {t.map.practice}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
