import { useMemo } from 'react';
import { useStudent } from '../state/StudentContext';

const COLORS = ['#ffc75a', '#ff8a3d', '#ff4d6d', '#a78bfa', '#4ecdc4'];

export function Confetti() {
  const { celebrating } = useStudent();
  const bits = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.1,
        color: COLORS[i % COLORS.length],
      })),
    // A fresh burst each time the celebration turns on.
    [celebrating],
  );

  if (!celebrating) return null;
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <i
          key={i}
          style={{
            left: `${b.left}%`,
            background: b.color,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
