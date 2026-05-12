import MediaCarousel from "./MediaCarousel";

export function Hero({ data }) {
  return (
    <section className="hero-next">
      <div className="site-wrap hero-grid-next">
        <div className="hero-copy-next">
          <div className="hero-brand-next animate-fade-rise" aria-label={data.settings.siteName}>
            {data.settings.logo && <img src={data.settings.logo} alt="" />}
            <h1>{data.settings.siteName}</h1>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PageIntro({ eyebrow, title, lead }) {
  return (
    <section className="page-intro-next">
      <div className="site-wrap">
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
      </div>
    </section>
  );
}

export function Section({ eyebrow, title, lead, children, compact = false }) {
  return (
    <section className={`section-next ${compact ? "compact" : ""}`}>
      <div className="site-wrap">
        {(eyebrow || title || lead) && (
          <header className="section-head-next">
            {title && <h2>{title}</h2>}
            {lead && <p>{lead}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export function FeatureGrid({ items = [] }) {
  return (
    <div className="feature-grid-next">
      {items.map((item) => (
        <article className="glass-card check-card" key={item.title}>
          <span>✓</span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export function Stats({ stats = [] }) {
  return (
    <div className="stats-next">
      {stats.map((stat) => (
        <article key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </article>
      ))}
    </div>
  );
}

export function ActionCard({ action }) {
  const meta = [action.category, action.date].filter(Boolean).join(" · ");
  return (
    <article className="content-card action-card-next">
      <MediaCarousel images={action.images || []} title={action.title} />
      <div>
        {meta && <span className="card-meta">{meta}</span>}
        <h3>{action.title}</h3>
        {action.description && <p>{action.description}</p>}
      </div>
    </article>
  );
}
