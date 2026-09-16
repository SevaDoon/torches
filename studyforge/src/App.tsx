import { Component, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AppProvider, useApp } from './state/AppContext';
import { Confetti, Nav, Toasts } from './components/Chrome';
import { Empty, Wordmark } from './components/ui';
import { Landing } from './pages/Landing';
import { Courses } from './pages/Courses';
import { CreateCourse } from './pages/CreateCourse';
import { CourseDashboard } from './pages/CourseDashboard';
import { KnowledgeMap } from './pages/KnowledgeMap';
import { Tutor } from './pages/Tutor';
import { Play } from './pages/Play';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';

function Splash() {
  const { t } = useApp();
  return (
    <div className="page center" style={{ paddingTop: '28vh' }}>
      <Wordmark size="1.6rem" />
      <p className="muted" style={{ marginTop: 16 }}>{t.common.loading}</p>
    </div>
  );
}

/**
 * A crash on one screen must not blank the whole app. The student's courses and
 * progress are safe in the database whatever happened here, so the way out is
 * simply back to the course list — keyed on the path, so moving away also
 * clears the error rather than leaving it stuck on every later screen.
 */
class Boundary extends Component<{ children: ReactNode; title: string; action: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="page">
        <Empty icon="alert" title={this.props.title}>
          <a className="btn btn-primary" href="#/courses">
            {this.props.action}
          </a>
        </Empty>
      </div>
    );
  }
}

/**
 * A round owns state that must not survive a switch to another mode, so the
 * key forces a fresh mount whenever the route params change.
 */
function PlayRoute() {
  const { courseId, mode } = useParams();
  const { search } = useLocation();
  return <Play key={`${courseId}/${mode}/${search}`} />;
}

function Routed() {
  const { loading, t } = useApp();
  const { pathname } = useLocation();

  if (loading) return <Splash />;

  // The landing page, the wizard and a round are all full-bleed: nothing
  // should compete with the one thing each of them is asking for.
  const bare = pathname === '/' || pathname.startsWith('/create') || /\/play\//.test(pathname);

  return (
    <div className={bare ? '' : 'shell'}>
      <Boundary key={pathname} title={t.errors.generic} action={t.nav.courses}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/create" element={<CreateCourse />} />
          <Route path="/course/:courseId" element={<CourseDashboard />} />
          <Route path="/course/:courseId/map" element={<KnowledgeMap />} />
          <Route path="/course/:courseId/ask" element={<Tutor />} />
          <Route path="/course/:courseId/play/:mode" element={<PlayRoute />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Boundary>
      {!bare && <Nav />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      {/* HashRouter so a built copy runs on any static host with no server rules. */}
      <HashRouter>
        <Routed />
        <Toasts />
        <Confetti />
      </HashRouter>
    </AppProvider>
  );
}
