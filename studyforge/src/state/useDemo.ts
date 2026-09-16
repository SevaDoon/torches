import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from './AppContext';
import { DEMO_ID, ensureDemoCourse, withDemoProgress } from '../data/demoCourse';

/**
 * Opening the sample course. It is built on demand rather than shipped as
 * data, so the first visitor pays a moment for it — hence the pending flag,
 * which the buttons use to say what is happening instead of looking dead.
 */
export function useOpenDemo() {
  const { update, refreshCourses, toast, t } = useApp();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const open = useCallback(async () => {
    setPending(true);
    try {
      const course = await ensureDemoCourse();
      update((learner) => withDemoProgress(learner, course));
      await refreshCourses();
      navigate(`/course/${DEMO_ID}`);
    } catch {
      toast('alert', t.errors.generic);
    } finally {
      setPending(false);
    }
  }, [update, refreshCourses, navigate, toast, t]);

  return { open, pending };
}
