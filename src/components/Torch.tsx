import { torchTier } from '../services/progressService';
import { ar } from '../i18n/ar';

/**
 * The torch, drawn by hand rather than borrowed from an emoji font.
 * The flame gains an inner core and side sparks as the level rises, so the
 * mark on the dashboard is literally a picture of how far the student has got.
 */
export function Torch({ level, small = false }: { level: number; small?: boolean }) {
  const tier = torchTier(level);
  const size = small ? 26 : 40;
  const sparks = Math.min(3, Math.max(0, Math.floor((level - 1) / 4)));

  return (
    <div
      className={`torch${small ? ' torch-sm' : ''}`}
      title={`${ar.tiers[tier.key]} · ${ar.levelShort} ${level}`}
    >
      <svg width={size} height={size} viewBox="0 0 32 34" aria-hidden="true">
        <g className="flame-flicker">
          {/* outer flame */}
          <path
            d="M16 1.5c1.6 5.6-4.8 7.6-4.8 13.4a4.8 4.8 0 0 0 9.6 0c0-1.4-.6-2.9-.6-2.9 3.7 2.5 5.5 5.6 5.5 9.2a9.7 9.7 0 0 1-19.4 0C6.3 13.3 13.5 9.5 16 1.5Z"
            fill="var(--flame)"
            stroke="var(--ink)"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          {/* inner core appears from level 3 */}
          {level >= 3 && (
            <path
              d="M16 13.5c.9 2.6-2.3 3.6-2.3 6.3a3.3 3.3 0 0 0 6.6 0c0-2-1.6-3.3-2.6-4.4-.7-.8-1.3-1.4-1.7-1.9Z"
              fill="var(--amber)"
              stroke="var(--ink)"
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          )}
        </g>
        {/* side sparks — one for every four levels */}
        {sparks >= 1 && <circle cx="4.6" cy="14" r="1.5" fill="var(--amber)" stroke="var(--ink)" strokeWidth={1} />}
        {sparks >= 2 && <circle cx="27.4" cy="11" r="1.5" fill="var(--amber)" stroke="var(--ink)" strokeWidth={1} />}
        {sparks >= 3 && <circle cx="24.5" cy="26" r="1.3" fill="var(--flame)" stroke="var(--ink)" strokeWidth={1} />}
      </svg>
    </div>
  );
}

export function TorchTierName({ level }: { level: number }) {
  return <>{ar.tiers[torchTier(level).key]}</>;
}
