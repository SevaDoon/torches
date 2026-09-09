import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { StudentProvider, useStudent } from './state/StudentContext';
import { Nav } from './components/Nav';
import { Toasts } from './components/Toasts';
import { Confetti } from './components/Confetti';
import { Welcome } from './pages/Welcome';
import { Home } from './pages/Home';
import { Journey } from './pages/Journey';
import { Play } from './pages/Play';
import { Leaderboard } from './pages/Leaderboard';
import { Progress } from './pages/Progress';
import { Profile } from './pages/Profile';
import { Achievements } from './pages/Achievements';
import { Review } from './pages/Review';
import { Skills } from './pages/Skills';
import { Teacher } from './pages/Teacher';
import { ar } from './i18n/ar';

function Splash() {
  return (
    <div className="welcome">
      <div className="welcome-inner center">
        <div className="wordmark">{ar.appNameEn}</div>
        <p className="muted" style={{ marginTop: 16 }}>{ar.welcome.loading}</p>
      </div>
    </div>
  );
}

/**
 * A mission owns session state that must not survive a switch to another
 * mission, so the key forces a fresh mount whenever the route params change.
 */
function PlayRoute() {
  const { unitId, missionKey } = useParams();
  return <Play key={`${unitId}/${missionKey}`} />;
}

function Routed() {
  const { student, loading } = useStudent();
  const { pathname } = useLocation();

  if (loading) return <Splash />;

  if (!student) {
    return (
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login-or-start" element={<Navigate to="/welcome" replace />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    );
  }

  // The play screen is full-bleed: no bottom nav competing with the answers.
  const playing = pathname.startsWith('/play/');

  return (
    <div className={playing ? '' : 'shell'}>
      <Routes>
        <Route path="/welcome" element={<Navigate to="/home" replace />} />
        <Route path="/login-or-start" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/play/:unitId/:missionKey" element={<PlayRoute />} />
        <Route path="/play" element={<Navigate to="/journey" replace />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/review" element={<Review />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      {!playing && <Nav />}
    </div>
  );
}

export default function App() {
  return (
    <StudentProvider>
      {/* HashRouter so the built site works on any static host with no server rules. */}
      <HashRouter>
        <Routed />
        <Toasts />
        <Confetti />
      </HashRouter>
    </StudentProvider>
  );
}
