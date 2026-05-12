import SiteChrome from "@/components/SiteChrome";
import { PageIntro, Section } from "@/components/Blocks";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function ObjetivosPage() {
  const data = publicData();
  const page = data.pages.objetivos;
  return (
    <SiteChrome data={data}>
      <PageIntro eyebrow={page.eyebrow} title={page.title} />
      <Section>
        <article className="large-statement">
          <span>Objetivo geral</span>
          <p>{page.general}</p>
        </article>
      </Section>
      <Section title="Objetivos específicos">
        <div className="cards-grid-next two">
          {page.specific.map((item, index) => <article className="glass-card check-card" key={item}><span>{index + 1}</span><p>{item}</p></article>)}
        </div>
      </Section>
      <Section title="Metas">
        <div className="cards-grid-next two">
          {page.goals.map((item, index) => <article className="glass-card check-card" key={item}><span>✓</span><p>{item}</p></article>)}
        </div>
      </Section>
    </SiteChrome>
  );
}
