/*
 * Whose work this is. It belongs on the first screen, before any sign-in, so
 * anyone who opens the link — a student, a parent, the head teacher — can see
 * the school and the teacher behind it without going looking.
 */
import { ar } from '../i18n/ar';

export function Credits() {
  return (
    <div className="credits ar">
      <div className="credits-school">{ar.credits.school}</div>
      <div>{ar.credits.by}</div>
      <div className="dim">{ar.credits.rights}</div>
    </div>
  );
}
