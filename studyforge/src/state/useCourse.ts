import { useEffect, useState } from 'react';
import type { Course } from '../types';
import { loadCourse } from '../services/db';

/**
 * One course, read out of the database. Courses are big — a whole reference
 * lives inside one — so they are loaded per screen rather than held in context,
 * and every screen that uses this has to draw a loading and a missing state.
 */
export function useCourse(courseId: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let live = true;
    if (!courseId) {
      setStatus('missing');
      return;
    }
    setStatus('loading');
    void loadCourse(courseId)
      .then((found) => {
        if (!live) return;
        setCourse(found ?? null);
        setStatus(found ? 'ready' : 'missing');
      })
      .catch(() => live && setStatus('missing'));
    return () => {
      live = false;
    };
  }, [courseId]);

  return { course, status };
}
