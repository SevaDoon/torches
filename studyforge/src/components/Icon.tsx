/*
 * One hand-tuned stroke icon set, drawn on a 24px grid with a 1.7 stroke and
 * round caps, so the whole interface is drawn with the same pen. No emoji: a
 * university product should not be lettered in someone else's font.
 */

const PATHS = {
  home: 'M3.5 10.5 12 3.5l8.5 7M5.5 9.5V20h13V9.5M10 20v-6h4v6',
  grid: 'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z',
  map: 'M9 4.5 3.5 7v12.5L9 17l6 2.5 5.5-2.5V4.5L15 7 9 4.5ZM9 4.5V17m6 2.5V7',
  chat: 'M4 6.5A2 2 0 0 1 6 4.5h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 3.5V6.5ZM8 9h8M8 12.5h5',
  chart: 'M4 20V4M4 20h16M8 17V11M12.5 17V7M17 17v-4',
  user: 'M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2.8l1.4 2.4 2.7-.4.6 2.7 2.5 1.1-1.2 2.5 1.2 2.5-2.5 1.1-.6 2.7-2.7-.4L12 21.2l-1.4-2.4-2.7.4-.6-2.7L4.8 15.4 6 12.9l-1.2-2.5 2.5-1.1.6-2.7 2.7.4Z',
  upload: 'M12 16V4.5M8 8l4-3.5L16 8M4.5 15v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15',
  file: 'M6 3.5h7l5 5V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V3.5ZM13 3.5V9h5',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5a1 1 0 0 0 1 1h7.4a1 1 0 0 0 1-1L17.5 7M10 11v6M14 11v6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16.2 16.2 21 21',
  x: 'M6 6l12 12M18 6 6 18',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  chevron: 'm9 5 7 7-7 7',
  arrowStart: 'M19 12H5M11 6l-6 6 6 6',
  arrowEnd: 'M5 12h14M13 6l6 6-6 6',
  bulb: 'M9.5 18h5M10 21h4M8 12.5a4.6 4.6 0 1 1 8 3c-.8.9-1.2 1.6-1.3 2.5H9.3c-.1-.9-.5-1.6-1.3-2.5Z',
  book: 'M4 5.5C4 4.7 4.7 4 5.5 4H11v15.5H5.5A1.5 1.5 0 0 0 4 21V5.5ZM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15.5h5.5A1.5 1.5 0 0 1 20 21V5.5Z',
  quote: 'M9 6.5C6.5 7.8 5 10 5 12.8V17h5v-5H7.6c.2-1.7 1-2.9 2.4-3.6L9 6.5ZM19 6.5c-2.5 1.3-4 3.5-4 6.3V17h5v-5h-2.4c.2-1.7 1-2.9 2.4-3.6L19 6.5Z',
  link: 'M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7L11.5 6.8M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.3-1.3',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  crown: 'M4 17.5h16M4.5 17.5 3.5 7l5 3.5L12 5l3.5 5.5 5-3.5-1 10.5Z',
  flame: 'M12 3.5c1 4.2-3.2 5.3-3.2 9.2a3.2 3.2 0 0 0 6.4 0c0-1-.4-2-.4-2 2.5 1.7 3.7 3.8 3.7 6.2a6.5 6.5 0 0 1-13 0c0-5.3 4.8-8 6.5-13.4Z',
  shield: 'M12 3.5 5 6v6c0 4 2.9 7.3 7 8.5 4.1-1.2 7-4.5 7-8.5V6l-7-2.5ZM9 12l2 2 4-4',
  heart: 'M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8C19 15.6 12 20 12 20Z',
  clipboard:
    'M9 4.5h6v2.5H9zM9 5.5H6.5v14a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-14H15M9 11h6M9 15h4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5V12l3 2',
  hourglass: 'M7 3.5h10M7 20.5h10M7.5 3.5v3c0 2 4.5 3.7 4.5 5.5s-4.5 3.5-4.5 5.5v3M16.5 3.5v3c0 2-4.5 3.7-4.5 5.5s4.5 3.5 4.5 5.5v3',
  refresh: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5',
  star: 'm12 3.8 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 17.2 6.7 20l1.1-5.9L3.5 10l5.9-.8Z',
  sparkles:
    'M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.6 10.4 11.2 6 9.6 10.4 8ZM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8ZM5 14l.7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7Z',
  layers: 'M12 3.5 3.5 8l8.5 4.5L20.5 8 12 3.5ZM3.5 12.5 12 17l8.5-4.5M3.5 17 12 21.5l8.5-4.5',
  // the wordmark's own mark: an anvil struck
  forge: 'M4 15.5h13.5a2.5 2.5 0 0 0 0-5H15M4 15.5v3h11v-3M4 15.5c0-2.2 1.8-4 4-4h2M14.5 4.5l-3.5 5',
  bolt: 'M13 3 5.5 13.5H11l-1 7.5 8-11h-5.5L13 3Z',
  alert: 'M12 4 2.8 20h18.4L12 4ZM12 10v4.5M12 17.4v.1',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 7.6v.1',
  sound: 'M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10',
  mute: 'M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16 10l4 4M20 10l-4 4',
  play: 'M7 4.5 19 12 7 19.5v-15Z',
  lock: 'M6.5 10.5h11V20h-11zM9 10.5V7.8a3 3 0 0 1 6 0v2.7',
  eye: 'M12 5.5c-4.5 0-8 4-9 6.5 1 2.5 4.5 6.5 9 6.5s8-4 9-6.5c-1-2.5-4.5-6.5-9-6.5ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  list: 'M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.1M4 12h.1M4 17.5h.1',
  shuffle: 'M4 6h3.5l9 12H20M4 18h3.5l3-4M14 8.5l2.5-2.5H20M17.5 15.5 20 18l-2.5 2.5M17.5 3.5 20 6l-2.5 2.5',
  pen: 'M4 20h4L19 9a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5 4 20ZM14.5 7 17 9.5',
  puzzle:
    'M9.5 4h5v2.2a1.8 1.8 0 1 1 3.3 1.3H20v5h-2.2a1.8 1.8 0 1 0-1.3 3.3V20h-5v-2.2a1.8 1.8 0 1 1-3.3-1.3H4v-5h2.2a1.8 1.8 0 1 0 1.3-3.3V4Z',
  swords: 'M4 4h3.5l9 12.5M20 4h-3.5L12 10.5M4.5 20l4-4M19.5 20l-4-4M3 17.5 6.5 21M21 17.5 17.5 21',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  filled = false,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
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
      style={{ flex: 'none', ...style }}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The mark each play mode is drawn with, used everywhere that mode appears. */
export const MODE_ICON = {
  quick: 'bolt',
  chapter: 'swords',
  weakness: 'target',
  exam: 'clipboard',
  survival: 'heart',
  daily: 'refresh',
} as const satisfies Record<string, IconName>;

export const TYPE_ICON = {
  mcq: 'list',
  truefalse: 'check',
  blank: 'pen',
  match: 'link',
  order: 'layers',
  error: 'search',
} as const satisfies Record<string, IconName>;
