import { ArrowUpRight } from "lucide-react";

export function MagicCard({ as: Component = "article", className = "", children, href, ...props }) {
  const classes = `magic-card ${className}`.trim();
  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

export function AnimatedGradientText({ children, className = "" }) {
  return <span className={`magic-gradient-text ${className}`.trim()}>{children}</span>;
}

export function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <MagicCard className="metric-card anime-card">
      <div className="metric-icon">{Icon && <Icon size={22} strokeWidth={1.9} />}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </MagicCard>
  );
}

export function SectionTitle({ eyebrow, title, lead }) {
  return (
    <header className="section-title anime-block">
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      {lead && <p>{lead}</p>}
    </header>
  );
}

export function TextLink({ href, children = "Saiba mais" }) {
  return (
    <a className="text-link" href={href}>
      {children}
      <ArrowUpRight size={16} />
    </a>
  );
}
