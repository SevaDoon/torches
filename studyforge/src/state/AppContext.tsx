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
import type { CourseSummary, Lang, Learner } from '../types';
import { STRINGS, type Strings } from '../i18n/strings';
import { blankLearner, migrate } from '../services/learner';
import { getSetting, listCourses, loadLearner, saveLearner, setSetting } from '../services/db';
import { levelFromXp } from '../services/progress';
import { newlyEarned, type AchievementContext } from '../services/achievements';
import { sfx, setSoundEnabled } from '../utils/sound';

export interface Toast {
  id: number;
  icon: 'star' | 'crown' | 'flame' | 'check' | 'alert';
  text: string;
}

interface Ctx {
  learner: Learner;
  loading: boolean;
  lang: Lang;
  dir: 'rtl' | 'ltr';
  t: Strings;
  setLang: (lang: Lang) => void;
  /**
   * Every change to the learner goes through here, because this is also what
   * saves, what awards levels and what fires achievements. Writing to the
   * record anywhere else silently skips all three.
   */
  update: (fn: (l: Learner) => Learner, achievementContext?: Partial<AchievementContext>) => void;
  courses: CourseSummary[];
  refreshCourses: () => Promise<void>;
  toast: (icon: Toast['icon'], text: string) => void;
  toasts: Toast[];
  celebrate: () => void;
  celebrating: boolean;
}

const AppCtx = createContext<Ctx | null>(null);

/** The interface language has to be known before the first paint, so it is read
    synchronously here and only mirrored into the learner record afterwards. */
function initialLang(): Lang {
  return getSetting('lang') === 'en' ? 'en' : 'ar';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [learner, setLearner] = useState<Learner>(() => blankLearner());
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celebrating, setCelebrating] = useState(false);
  const nextToastId = useRef(1);

  useEffect(() => {
    void (async () => {
      try {
        const saved = await loadLearner();
        if (saved) {
          const merged = migrate(saved);
          setLearner(merged);
          setLangState(merged.uiLang);
          setSetting('lang', merged.uiLang);
          setSoundEnabled(merged.soundOn);
        }
        setCourses(await listCourses());
      } catch {
        /* first run, or storage blocked — the blank learner is a fine start */
      }
      setLoading(false);
    })();
  }, []);

  // The document itself carries the language and direction: fonts, logical
  // properties and the RTL shadow offsets are all keyed off these two.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toast = useCallback((icon: Toast['icon'], text: string) => {
    const id = nextToastId.current++;
    setToasts((list) => [...list, { id, icon, text }]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 3600);
  }, []);

  const celebrate = useCallback(() => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2600);
  }, []);

  const refreshCourses = useCallback(async () => {
    setCourses(await listCourses());
  }, []);

  /*
   * The latest learner, readable synchronously.
   *
   * Awarding a level or an achievement plays a sound and raises a toast, and
   * those cannot live inside a setState updater: React calls an updater twice
   * in development, so every achievement was being announced twice. Reading
   * the current record from a ref keeps the updater pure and the celebration
   * in the event handler, where it belongs. Two updates in the same tick still
   * compose, because the ref is advanced here rather than on the next render.
   */
  const learnerRef = useRef(learner);
  useEffect(() => {
    learnerRef.current = learner;
  }, [learner]);

  const update = useCallback<Ctx['update']>(
    (fn, achievementContext) => {
      const prev = learnerRef.current;
      let next = fn(prev);

      if (levelFromXp(next.xp) > levelFromXp(prev.xp)) {
        sfx.levelUp();
        toast('star', STRINGS[next.uiLang].toasts.levelUp(levelFromXp(next.xp)));
      }

      const earned = newlyEarned(next, achievementContext ?? {});
      if (earned.length) {
        next = { ...next, achievements: [...next.achievements, ...earned] };
        for (const id of earned) {
          toast('crown', STRINGS[next.uiLang].toasts.achievement(STRINGS[next.uiLang].achievements[id].t));
        }
        sfx.achievement();
      }

      setSoundEnabled(next.soundOn);
      learnerRef.current = next;
      setLearner(next);
      void saveLearner(next).catch(() => toast('alert', STRINGS[next.uiLang].errors.storage));
    },
    [toast],
  );

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next);
      setSetting('lang', next);
      update((l) => ({ ...l, uiLang: next }));
    },
    [update],
  );

  const value = useMemo<Ctx>(
    () => ({
      learner,
      loading,
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      t: STRINGS[lang],
      setLang,
      update,
      courses,
      refreshCourses,
      toast,
      toasts,
      celebrate,
      celebrating,
    }),
    [learner, loading, lang, setLang, update, courses, refreshCourses, toast, toasts, celebrate, celebrating],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
