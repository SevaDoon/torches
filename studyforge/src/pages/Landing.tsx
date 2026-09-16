import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { useOpenDemo } from '../state/useDemo';
import { Icon, type IconName } from '../components/Icon';
import { Wordmark } from '../components/ui';

const STEP_ICONS: IconName[] = ['upload', 'search', 'forge', 'play', 'crown'];
const FEATURE_ICONS: IconName[] = ['quote', 'target', 'refresh', 'layers'];

export function Landing() {
  const { t, lang, setLang, courses } = useApp();
  const demo = useOpenDemo();

  return (
    <div>
      <header className="topbar">
        <Wordmark size="1.15rem" />
        <div className="ms-auto row" style={{ gap: 8 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          {courses.length > 0 && (
            <Link className="btn btn-sm" to="/courses">
              {t.landing.myCourses}
            </Link>
          )}
        </div>
      </header>

      <div className="page page-wide">
        <section className="hero">
          <span className="chip chip-quiet">
            <Icon name="shield" size={14} />
            {t.landing.groundedTitle}
          </span>
          <h1>{t.landing.heroTitle}</h1>
          <p className="hero-sub" style={{ margin: 0 }}>{t.landing.heroSub}</p>
          <div className="row wrap" style={{ gap: 10 }}>
            <Link className="btn btn-lg btn-primary" to="/create">
              <Icon name="plus" size={20} />
              {t.landing.cta}
            </Link>
            <button className="btn btn-lg" onClick={demo.open} disabled={demo.pending}>
              <Icon name={demo.pending ? 'hourglass' : 'play'} size={18} />
              {demo.pending ? t.common.loading : t.landing.demo}
            </button>
          </div>
        </section>

        <section className="stack" style={{ marginTop: 26 }}>
          <h2>{t.landing.howTitle}</h2>
          <div className="pipeline">
            {t.landing.how.map((step, i) => (
              <div className="pipe-step" key={step.t}>
                <Icon name={STEP_ICONS[i]} size={22} style={{ color: 'var(--forge)' }} />
                <h3 style={{ marginTop: 8 }}>{step.t}</h3>
                <p className="tiny muted" style={{ margin: '4px 0 0' }}>{step.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card card-lg card-ink" style={{ marginTop: 26 }}>
          <div className="eyebrow">{t.landing.groundedTitle}</div>
          <p style={{ margin: '10px 0 0', fontSize: '1.05rem', maxWidth: '62ch' }}>
            {t.landing.groundedBody}
          </p>
          <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
            <span className="chip" style={{ background: 'var(--paper-2)', color: 'var(--ink)' }}>
              <Icon name="quote" size={13} />
              {t.common.showSource}
            </span>
            <span className="chip" style={{ background: 'var(--ember)', color: 'var(--paper-2)' }}>
              <Icon name="shield" size={13} />
              {t.tutor.notFound.slice(0, 44)}…
            </span>
          </div>
        </section>

        <section className="stack" style={{ marginTop: 26 }}>
          <h2>{t.landing.featuresTitle}</h2>
          <div className="grid-2">
            {t.landing.features.map((feature, i) => (
              <div className="card" key={feature.t}>
                <div className="row" style={{ gap: 10 }}>
                  <span className="emblem emblem-sm">
                    <Icon name={FEATURE_ICONS[i]} size={20} />
                  </span>
                  <h3 className="grow">{feature.t}</h3>
                </div>
                <p className="small muted" style={{ margin: '10px 0 0' }}>{feature.d}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="tiny dim center" style={{ margin: '30px 0 8px' }}>
          <Icon name="lock" size={13} style={{ verticalAlign: '-2px', marginInlineEnd: 5 }} />
          {t.landing.footer}
        </p>
      </div>
    </div>
  );
}
