/* The small printed pieces the whole interface is assembled from. */
import type { ReactNode } from 'react';
import type { MasteryState } from '../types';
import { Icon, type IconName } from './Icon';

export function Bar({ percent, thin, large }: { percent: number; thin?: boolean; large?: boolean }) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className={`bar${thin ? ' bar-thin' : ''}${large ? ' bar-lg' : ''}`}>
      <i style={{ width: `${width}%` }} />
    </div>
  );
}

/** One square per question in the round — filled as she goes, red when missed. */
export function Blocks({ states }: { states: Array<'todo' | 'ok' | 'miss'> }) {
  return (
    <div className="blocks">
      {states.map((s, i) => (
        <i key={i} className={s === 'ok' ? 'on' : s === 'miss' ? 'miss' : ''} />
      ))}
    </div>
  );
}

/** A mastery bar drawn as printed blocks rather than a smooth gauge. */
export function Meter({ percent, blocks = 10 }: { percent: number; blocks?: number }) {
  const on = Math.round((Math.max(0, Math.min(100, percent)) / 100) * blocks);
  return (
    <div className="meter" role="img" aria-label={`${Math.round(percent)}%`}>
      {Array.from({ length: blocks }, (_, i) => (
        <i key={i} className={i < on ? 'on' : ''} />
      ))}
    </div>
  );
}

export function Dot({ state }: { state: MasteryState }) {
  return <span className={`dot dot-${state}`} />;
}

export function Wordmark({ size = '1.5rem' }: { size?: string }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      <span className="wordmark-plate">
        <Icon name="forge" size={Math.round(parseFloat(size) * 11)} />
      </span>
      StudyForge
    </span>
  );
}

export function Empty({
  icon = 'file',
  title,
  body,
  children,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="emblem emblem-sm">
        <Icon name={icon} size={22} />
      </span>
      <h3>{title}</h3>
      {body && <p className="small muted" style={{ maxWidth: '44ch', margin: 0 }}>{body}</p>}
      {children}
    </div>
  );
}

export function Banner({
  kind = 'info',
  icon,
  children,
}: {
  kind?: 'info' | 'good' | 'warn' | 'bad';
  icon?: IconName;
  children: ReactNode;
}) {
  const fallback: Record<string, IconName> = { info: 'info', good: 'check', warn: 'alert', bad: 'alert' };
  return (
    <div className={`banner banner-${kind}`}>
      <Icon name={icon ?? fallback[kind]} size={19} />
      <div className="small grow">{children}</div>
    </div>
  );
}

export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="stat">
      <div className="eyebrow">{label}</div>
      <div className="big-num" style={{ marginTop: 8 }}>{value}</div>
      {/* a div, not a p: notes carry meters and chips as often as text */}
      {note && <div className="tiny muted" style={{ marginTop: 6 }}>{note}</div>}
    </div>
  );
}

export function Skeleton({ height = 90 }: { height?: number }) {
  return <div className="skel" style={{ height }} aria-hidden="true" />;
}

/** A page's loading state: the same shapes it will fill in a moment. */
export function PageSkeleton() {
  return (
    <div className="page stack-lg">
      <Skeleton height={64} />
      <div className="grid-4">
        <Skeleton height={92} />
        <Skeleton height={92} />
        <Skeleton height={92} />
        <Skeleton height={92} />
      </div>
      <Skeleton height={180} />
    </div>
  );
}
