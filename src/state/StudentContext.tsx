import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Student } from '../types';
import {
  loadCurrentStudent,
  loginStudent,
  persist,
  registerStudent,
  signOut as signOutStudent,
} from '../services/studentService';
import { levelFromXp } from '../services/progressService';
import { ACHIEVEMENTS, newlyEarned } from '../services/achievements';
import { achievementsAr, ar } from '../i18n/ar';
import { setSoundEnabled, sfx } from '../utils/sound';

export interface Toast {
  id: number;
  icon: string;
  text: string;
}

interface Ctx {
  student: Student | null;
  loading: boolean;
  /** Create a new account with a name and a PIN. */
  register: (name: string, pin: string) => Promise<void>;
  /** Sign back in on any device with the same name and PIN. */
  login: (name: string, pin: string) => Promise<void>;
  /** Sign out and return to the welcome screen. */
  leave: () => Promise<void>;
  /** Every change to the student goes through here: it saves, and it celebrates. */
  update: (fn: (s: Student) => Student) => void;
  toast: (icon: string, text: string) => void;
  toasts: Toast[];
  celebrate: () => void;
  celebrating: boolean;
}

const StudentCtx = createContext<Ctx | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celebrating, setCelebrating] = useState(false);
  const nextId = useRef(1);

  useEffect(() => {
    void loadCurrentStudent().then((s) => {
      setStudent(s);
      if (s) setSoundEnabled(s.soundOn);
      setLoading(false);
    });
  }, []);

  const toast = useCallback((icon: string, text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, icon, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  const celebrate = useCallback(() => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2600);
  }, []);

  const register = useCallback(
    async (name: string, pin: string) => {
      const s = await registerStudent(name, pin);
      setStudent(s);
      setSoundEnabled(s.soundOn);
      toast('🔥', ar.toasts.welcome(s.name));
    },
    [toast],
  );

  const login = useCallback(
    async (name: string, pin: string) => {
      const s = await loginStudent(name, pin);
      setStudent(s);
      setSoundEnabled(s.soundOn);
      toast('👋', ar.toasts.welcomeBack(s.name));
    },
    [toast],
  );

  const leave = useCallback(async () => {
    await signOutStudent();
    setStudent(null);
  }, []);

  const update = useCallback(
    (fn: (s: Student) => Student) => {
      setStudent((prev) => {
        if (!prev) return prev;
        let next = fn(prev);

        if (levelFromXp(next.xp) > levelFromXp(prev.xp)) {
          sfx.levelUp();
          toast('🎉', ar.toasts.levelUp(levelFromXp(next.xp)));
        }

        const earned = newlyEarned(next);
        if (earned.length) {
          next = { ...next, achievements: [...next.achievements, ...earned] };
          for (const id of earned) {
            const a = ACHIEVEMENTS.find((x) => x.id === id);
            if (a) toast(a.icon, ar.toasts.achievement(achievementsAr[a.id]?.title ?? a.title));
          }
          sfx.achievement();
        }

        setSoundEnabled(next.soundOn);
        void persist(next);
        return next;
      });
    },
    [toast],
  );

  const value = useMemo(
    () => ({ student, loading, register, login, leave, update, toast, toasts, celebrate, celebrating }),
    [student, loading, register, login, leave, update, toast, toasts, celebrate, celebrating],
  );

  return <StudentCtx.Provider value={value}>{children}</StudentCtx.Provider>;
}

export function useStudent() {
  const ctx = useContext(StudentCtx);
  if (!ctx) throw new Error('useStudent must be used inside <StudentProvider>');
  return ctx;
}

/** For pages that are only reachable once a student exists. */
export function useStudentRequired() {
  const ctx = useStudent();
  if (!ctx.student) throw new Error('No student loaded');
  return { ...ctx, student: ctx.student };
}
