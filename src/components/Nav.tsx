import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import { ar } from '../i18n/ar';

const ITEMS: Array<{ to: string; icon: IconName; label: string }> = [
  { to: '/home', icon: 'home', label: ar.nav.home },
  { to: '/journey', icon: 'map', label: ar.nav.journey },
  { to: '/leaderboard', icon: 'trophy', label: ar.nav.leaderboard },
  { to: '/progress', icon: 'chart', label: ar.nav.progress },
  { to: '/profile', icon: 'user', label: ar.nav.profile },
];

export function Nav() {
  return (
    <nav className="nav">
      {ITEMS.map((i) => (
        <NavLink key={i.to} to={i.to} className={({ isActive }) => (isActive ? 'on' : '')}>
          <Icon name={i.icon} size={21} />
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}
