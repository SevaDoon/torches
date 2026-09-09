/*
 * Picture cards for the image games.
 *
 * Drawn as SVG in the same ink-and-riso style as the icon set rather than
 * shipped as image files: nothing to download, nothing to license, sharp at
 * every size, and they recolour with the theme. Each one illustrates a concrete
 * noun that actually appears in the MegaGoal 1 vocabulary.
 */
import type { ReactNode } from 'react';

const ink = 'var(--ink)';
const S = { stroke: ink, strokeWidth: 2.4, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

/** id -> drawing. The English word is authored on the question, not here. */
export const PICTURES: Record<string, ReactNode> = {
  robot: (
    <>
      <path d="M32 6v6" {...S} fill="none" />
      <circle cx="32" cy="5" r="2.5" {...S} fill="var(--amber)" />
      <rect x="16" y="12" width="32" height="24" rx="5" {...S} fill="var(--violet)" />
      <circle cx="25" cy="22" r="3.5" {...S} fill="var(--paper-2)" />
      <circle cx="39" cy="22" r="3.5" {...S} fill="var(--paper-2)" />
      <path d="M25 30h14" {...S} fill="none" />
      <rect x="21" y="40" width="22" height="18" rx="3" {...S} fill="var(--flame)" />
      <path d="M21 47H12M43 47h9" {...S} fill="none" />
    </>
  ),
  rocket: (
    <>
      <path d="M32 4c8 8 11 18 11 28H21c0-10 3-20 11-28Z" {...S} fill="var(--paper-2)" />
      <circle cx="32" cy="22" r="5" {...S} fill="var(--teal)" />
      <path d="M21 32 12 44l9-3M43 32l9 12-9-3" {...S} fill="var(--flame)" />
      <path d="M27 46h10l-5 14-5-14Z" {...S} fill="var(--amber)" />
    </>
  ),
  submarine: (
    <>
      <ellipse cx="30" cy="38" rx="22" ry="12" {...S} fill="var(--teal)" />
      <path d="M26 26h8v-8h-4" {...S} fill="var(--paper-2)" />
      <circle cx="22" cy="38" r="3.5" {...S} fill="var(--paper-2)" />
      <circle cx="34" cy="38" r="3.5" {...S} fill="var(--paper-2)" />
      <path d="M52 30v16" {...S} fill="none" />
    </>
  ),
  skyscraper: (
    <>
      <rect x="20" y="8" width="24" height="52" rx="2" {...S} fill="var(--paper-2)" />
      <path d="M26 16h5M34 16h5M26 26h5M34 26h5M26 36h5M34 36h5M26 46h5M34 46h5" {...S} fill="none" />
      <path d="M32 8V3" {...S} fill="none" />
      <rect x="8" y="34" width="12" height="26" rx="2" {...S} fill="var(--violet)" />
      <rect x="44" y="26" width="12" height="34" rx="2" {...S} fill="var(--amber)" />
    </>
  ),
  suitcase: (
    <>
      <path d="M25 18v-4a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4" {...S} fill="none" />
      <rect x="8" y="18" width="48" height="34" rx="5" {...S} fill="var(--flame)" />
      <path d="M8 32h48" {...S} fill="none" />
      <rect x="27" y="26" width="10" height="12" rx="2" {...S} fill="var(--paper-2)" />
    </>
  ),
  bicycle: (
    <>
      <circle cx="16" cy="42" r="13" {...S} fill="none" />
      <circle cx="48" cy="42" r="13" {...S} fill="none" />
      <path d="M16 42 28 22h10l10 20M28 42h12l-4-20" {...S} fill="none" />
      <path d="M24 20h8" {...S} fill="none" />
      <circle cx="32" cy="42" r="3" {...S} fill="var(--flame)" />
    </>
  ),
  car: (
    <>
      <path d="M8 40V30l7-12h30l7 12v10" {...S} fill="var(--flame)" />
      <path d="M18 30h28l-4-8H22l-4 8Z" {...S} fill="var(--paper-2)" />
      <path d="M6 40h52" {...S} fill="none" />
      <circle cx="19" cy="44" r="6" {...S} fill="var(--paper-2)" />
      <circle cx="45" cy="44" r="6" {...S} fill="var(--paper-2)" />
    </>
  ),
  helmet: (
    <>
      <path d="M10 40a22 22 0 0 1 44 0v4H10v-4Z" {...S} fill="var(--amber)" />
      <path d="M10 44h44M22 22c4 4 6 10 6 22" {...S} fill="none" />
      <path d="M14 44v6a4 4 0 0 0 4 4h6" {...S} fill="none" />
    </>
  ),
  trafficLight: (
    <>
      <rect x="20" y="6" width="24" height="44" rx="6" {...S} fill="var(--paper-2)" />
      <circle cx="32" cy="17" r="6" {...S} fill="var(--red)" />
      <circle cx="32" cy="29" r="6" {...S} fill="var(--amber)" />
      <circle cx="32" cy="41" r="6" {...S} fill="var(--green)" />
      <path d="M32 50v10" {...S} fill="none" />
    </>
  ),
  faucet: (
    <>
      <path d="M10 20h16v10H10z" {...S} fill="var(--paper-2)" />
      <path d="M26 24h14a6 6 0 0 1 6 6v6" {...S} fill="none" />
      <path d="M18 20v-6h10" {...S} fill="none" />
      <path d="M40 36h12l-6 6-6-6Z" {...S} fill="var(--paper-2)" />
      <path d="M46 48c0 2-1.6 3.5-3.5 3.5S39 50 39 48c0-2 3.5-6 3.5-6S46 46 46 48Z" {...S} fill="var(--teal)" />
    </>
  ),
  flatTire: (
    <>
      <path d="M12 34a20 20 0 1 1 40 0c0 8-9 12-20 12S12 42 12 34Z" {...S} fill="var(--ink-2)" />
      <circle cx="32" cy="32" r="8" {...S} fill="var(--paper-2)" />
      <path d="M12 46h40" {...S} fill="none" />
    </>
  ),
  bulb: (
    <>
      <path d="M32 6a16 16 0 0 1 10 28c-2 2-3 4-3 7H25c0-3-1-5-3-7A16 16 0 0 1 32 6Z" {...S} fill="var(--amber)" />
      <path d="M25 47h14M27 53h10" {...S} fill="none" />
      <path d="M27 30l5 6 5-6" {...S} fill="none" />
    </>
  ),
  brokenWindow: (
    <>
      <rect x="10" y="10" width="44" height="44" rx="3" {...S} fill="var(--paper-2)" />
      <path d="M32 10v44M10 32h44" {...S} fill="none" />
      <path d="M20 14l10 14-6 6 8 8-4 10" stroke="var(--red)" strokeWidth={2.6} fill="none" strokeLinecap="round" />
    </>
  ),
  microscope: (
    <>
      <path d="M28 8h8v14h-8z" {...S} fill="var(--violet)" />
      <path d="M32 22v10" {...S} fill="none" />
      <path d="M20 34h24" {...S} fill="none" />
      <path d="M36 34c8 4 10 12 6 18H22c-6-8-2-16 6-18" {...S} fill="none" />
      <path d="M14 56h36" {...S} fill="var(--paper-2)" />
      <path d="M14 52h36v4H14z" {...S} fill="var(--paper-2)" />
    </>
  ),
  camera: (
    <>
      <path d="M6 20h12l4-6h20l4 6h12v30H6z" {...S} fill="var(--violet)" />
      <circle cx="32" cy="34" r="11" {...S} fill="var(--paper-2)" />
      <circle cx="32" cy="34" r="5" {...S} fill="var(--teal)" />
    </>
  ),
  umbrella: (
    <>
      <path d="M4 32a28 28 0 0 1 56 0Z" {...S} fill="var(--flame)" />
      <path d="M4 32c6 0 8-4 14-4s8 4 14 4 8-4 14-4 8 4 14 4" {...S} fill="none" />
      <path d="M32 32v20a5 5 0 0 1-10 0" {...S} fill="none" />
    </>
  ),
  apple: (
    <>
      <path d="M32 18c8-6 22-2 22 14 0 14-10 26-16 26-3 0-4-2-6-2s-3 2-6 2c-6 0-16-12-16-26 0-16 14-20 22-14Z" {...S} fill="var(--red)" />
      <path d="M32 18V8M32 10c6 0 9-3 10-7-6 0-10 3-10 7Z" {...S} fill="var(--green)" />
    </>
  ),
  bottle: (
    <>
      <path d="M26 6h12v8l4 6v38a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V20l4-6z" {...S} fill="var(--teal)" />
      <path d="M22 30h20" {...S} fill="none" />
      <path d="M26 6h12" {...S} fill="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="32" cy="34" r="24" {...S} fill="var(--paper-2)" />
      <path d="M32 20v14l9 6" {...S} fill="none" />
      <path d="M32 10V6M22 8l2 4M42 8l-2 4" {...S} fill="none" />
    </>
  ),
  book: (
    <>
      <path d="M32 16c-6-5-14-6-24-5v36c10-1 18 0 24 5 6-5 14-6 24-5V11c-10-1-18 0-24 5Z" {...S} fill="var(--paper-2)" />
      <path d="M32 16v36" {...S} fill="none" />
      <path d="M14 20h10M14 28h10M40 20h10M40 28h10" {...S} fill="none" />
    </>
  ),
};

export type PictureId = keyof typeof PICTURES;

export function Picture({ id, size = 96 }: { id: string; size?: number }) {
  const art = PICTURES[id];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {art ?? <rect x="8" y="8" width="48" height="48" rx="6" stroke={ink} strokeWidth={2.4} />}
    </svg>
  );
}
