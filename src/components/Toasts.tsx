import { useStudent } from '../state/StudentContext';

export function Toasts() {
  const { toasts } = useStudent();
  if (!toasts.length) return null;
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
