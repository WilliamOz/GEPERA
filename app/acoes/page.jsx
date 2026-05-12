import SiteChrome from "@/components/SiteChrome";
import PublicationGrid from "@/components/PublicationGrid";
import { ActionCard, PageIntro, Section } from "@/components/Blocks";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function AcoesPage() {
  const data = publicData();
  const page = data.pages.acoes;
  return (
    <SiteChrome data={data}>
      <PageIntro eyebrow={page.eyebrow} title={page.title} lead={page.intro} />
      <Section>
        <div className="cards-grid-next">
          {page.actions.map((action) => <ActionCard key={action.title} action={action} />)}
        </div>
      </Section>
      <Section eyebrow="Publicações" title="Artigos">
        <PublicationGrid publications={page.publications} />
      </Section>
    </SiteChrome>
  );
}
