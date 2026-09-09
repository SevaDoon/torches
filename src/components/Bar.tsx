export function Bar({ percent, thin = false }: { percent: number; thin?: boolean }) {
  return (
    <div className={`bar${thin ? ' bar-thin' : ''}`}>
      <i style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
    </div>
  );
}

/** One block per question — filled as the student goes, red when missed. */
export function Blocks({ states }: { states: Array<'todo' | 'ok' | 'miss'> }) {
  return (
    <div className="blocks">
      {states.map((s, i) => (
        <i key={i} className={s === 'ok' ? 'on' : s === 'miss' ? 'miss' : ''} />
      ))}
    </div>
  );
}
