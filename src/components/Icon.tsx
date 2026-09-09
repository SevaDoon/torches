/*
 * One hand-tuned stroke icon set. Emoji were replaced with these so the whole
 * interface is drawn with the same pen: 1.7 stroke, round caps, 24px grid.
 */

const PATHS = {
  home: 'M3.5 10.5 12 3.5l8.5 7M5.5 9.5V20h13V9.5M10 20v-6h4v6',
  map: 'M9 4.5 3.5 7v12.5L9 17l6 2.5 5.5-2.5V4.5L15 7 9 4.5ZM9 4.5V17m6 2.5V7',
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0V4ZM7 5.5H4.5V7a3 3 0 0 0 3 3M17 5.5h2.5V7a3 3 0 0 1-3 3M12 14v3.5M8.5 20.5h7',
  chart: 'M4 20V4M4 20h16M8 17V11M12.5 17V7M17 17v-4',
  user: 'M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0',
  bulb: 'M9.5 18h5M10 21h4M8 12.5a4.6 4.6 0 1 1 8 3c-.8.9-1.2 1.6-1.3 2.5H9.3c-.1-.9-.5-1.6-1.3-2.5Z',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  x: 'M6 6l12 12M18 6 6 18',
  lock: 'M6.5 10.5h11V20h-11zM9 10.5V7.8a3 3 0 0 1 6 0v2.7M12 14v2.5',
  star: 'm12 3.8 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 17.2 6.7 20l1.1-5.9L3.5 10l5.9-.8Z',
  refresh: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5',
  arrowStart: 'M19 12H5M11 6l-6 6 6 6',
  book: 'M4 5.5C4 4.7 4.7 4 5.5 4H11v15.5H5.5A1.5 1.5 0 0 0 4 21V5.5ZM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15.5h5.5A1.5 1.5 0 0 1 20 21V5.5Z',
  puzzle: 'M9.5 4h5v2.2a1.8 1.8 0 1 1 3.3 1.3H20v5h-2.2a1.8 1.8 0 1 0-1.3 3.3V20h-5v-2.2a1.8 1.8 0 1 1-3.3-1.3H4v-5h2.2a1.8 1.8 0 1 0 1.3-3.3V4Z',
  letters: 'M3.5 18 7.5 6l4 12M4.8 14.2h5.4M14.5 10.5a3 3 0 1 1 3 5.2c-1.3.8-3 .9-3-.9v-6.3',
  pen: 'M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20ZM14.5 7 17 9.5',
  crown: 'M4 17.5h16M4.5 17.5 3.5 7l5 3.5L12 5l3.5 5.5 5-3.5-1 10.5Z',
  shuffle: 'M4 6h3.5l9 12H20M4 18h3.5l3-4M14 8.5l2.5-2.5H20M17.5 15.5 20 18l-2.5 2.5M17.5 3.5 20 6l-2.5 2.5',
  medal: 'M12 15.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8.5 3.5 6 8M15.5 3.5 18 8M10 19.5l2 2 2-2',
  flame: 'M12 3.5c1 4.2-3.2 5.3-3.2 9.2a3.2 3.2 0 0 0 6.4 0c0-1-.4-2-.4-2 2.5 1.7 3.7 3.8 3.7 6.2a6.5 6.5 0 0 1-13 0c0-5.3 4.8-8 6.5-13.4Z',
  copy: 'M9 9h10v11H9zM6 15H5V4h10v1',
  edit: 'M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20Z',
  sound: 'M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10',
  mute: 'M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16 10l4 4M20 10l-4 4',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5V12l3 2',
  chevron: 'm9 5 7 7-7 7',
  sparkles: 'M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.6 10.4 11.2 6 9.6 10.4 8ZM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8ZM5 14l.7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7Z',
  layers: 'M12 3.5 3.5 8l8.5 4.5L20.5 8 12 3.5ZM3.5 12.5 12 17l8.5-4.5M3.5 17 12 21.5l8.5-4.5',
} as const;

export type IconName = keyof typeof PATHS;

/** Which pen mark stands for each skill and each kind of mission. */
export const SKILL_ICON: Record<string, IconName> = {
  grammar: 'pen',
  vocabulary: 'letters',
  reading: 'book',
  form: 'puzzle',
};

export function missionIcon(kind: string, key: string): IconName {
  if (kind === 'boss') return 'crown';
  if (kind === 'mixed') return 'shuffle';
  if (kind === 'review') return 'refresh';
  return SKILL_ICON[key] ?? 'star';
}

export function Icon({
  name,
  size = 20,
  filled = false,
  className,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ flex: 'none' }}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
