/* The frame around every screen: the bottom bar, the toasts, the celebration. */
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { getSetting } from '../services/db';
import { Icon, type IconName } from './Icon';

/**
 * Which course the course-scoped tabs point at: the one in the URL, or the one
 * she last opened. Without the fallback, Map and Ask would be dead links
 * everywhere outside a course, which is most of the app.
 */
export function useActiveCourseId(): string | null {
  const { pathname } = useLocation();
  const inUrl = /^\/course\/([^/]+)/.exec(pathname)?.[1];
  return inUrl ?? getSetting('lastCourse');
}

export function Nav() {
  const { t } = useApp();
  const courseId = useActiveCourseId();

  const items: Array<{ to: string; icon: IconName; label: string }> = [
    { to: '/courses', icon: 'grid', label: t.nav.courses },
    ...(courseId
      ? [
          { to: `/course/${courseId}`, icon: 'home' as IconName, label: t.nav.dashboard },
          { to: `/course/${courseId}/map`, icon: 'map' as IconName, label: t.nav.map },
          { to: `/course/${courseId}/ask`, icon: 'chat' as IconName, label: t.nav.tutor },
        ]
      : []),
    { to: '/progress', icon: 'chart', label: t.nav.progress },
  ];

  return (
    <nav className="nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to.startsWith('/course/')}
          className={({ isActive }) => (isActive ? 'on' : '')}
        >
          <Icon name={item.icon} size={20} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          <Icon name={toast.icon} size={18} filled={toast.icon === 'star'} />
          {toast.text}
        </div>
      ))}
    </div>
  );
}

const CONFETTI_COLORS = ['var(--forge)', 'var(--ember)', 'var(--green)', 'var(--amber)', 'var(--violet)'];

export function Confetti() {
  const { celebrating } = useApp();
  if (!celebrating) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 34 }, (_, i) => (
        <i
          key={i}
          style={{
            insetInlineStart: `${(i * 97) % 100}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDuration: `${1.5 + ((i * 13) % 12) / 10}s`,
            animationDelay: `${((i * 7) % 10) / 10}s`,
          }}
        />
      ))}
    </div>
  );
}
